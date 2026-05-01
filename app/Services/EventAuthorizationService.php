<?php

namespace App\Services;

use App\Models\Evenement;
use App\Models\User;

class EventAuthorizationService
{
    public function isCreator(Evenement $evenement, ?User $user): bool
    {
        return (bool) ($user && $evenement->cree_par === $user->id);
    }

    public function isAdminOrCreator(Evenement $evenement, ?User $user): bool
    {
        return (bool) ($user && ($user->isAdmin() || $this->isCreator($evenement, $user)));
    }

    public function assignment(Evenement $evenement, ?User $user)
    {
        if (! $user) {
            return null;
        }

        return $evenement->relationLoaded('assignments')
            ? $evenement->assignments->firstWhere('user_id', $user->id)
            : $evenement->assignments()->where('user_id', $user->id)->first();
    }

    public function hasPermission(Evenement $evenement, ?User $user, string $permission): bool
    {
        if ($this->isAdminOrCreator($evenement, $user)) {
            return true;
        }

        $assignment = $this->assignment($evenement, $user);

        return (bool) ($assignment && (bool) $assignment->{$permission});
    }

    public function canView(Evenement $evenement, ?User $user): bool
    {
        if (! $user) {
            return false;
        }

        if ($this->isAdminOrCreator($evenement, $user) || $this->assignment($evenement, $user)) {
            return true;
        }

        if ($evenement->statut === 'archive') {
            return false;
        }

        $roles = $evenement->relationLoaded('roles')
            ? $evenement->roles->pluck('role')
            : $evenement->roles()->pluck('role');

        return $roles->isEmpty() || $roles->contains('tous') || $roles->contains($user->role);
    }

    public function canManageMessages(Evenement $evenement, ?User $user): bool
    {
        return $this->hasPermission($evenement, $user, 'can_manage_messages');
    }

    public function canManageComments(Evenement $evenement, ?User $user): bool
    {
        return $this->hasPermission($evenement, $user, 'can_manage_comments');
    }

    public function canEditEvent(Evenement $evenement, ?User $user): bool
    {
        return $this->hasPermission($evenement, $user, 'can_edit_event');
    }

    public function canChangeVisibility(Evenement $evenement, ?User $user): bool
    {
        return $this->hasPermission($evenement, $user, 'can_change_visibility');
    }

    public function canManageParticipants(Evenement $evenement, ?User $user): bool
    {
        return $this->hasPermission($evenement, $user, 'can_manage_participants');
    }

    public function canAssignJury(Evenement $evenement, ?User $user): bool
    {
        return $this->hasPermission($evenement, $user, 'can_assign_jury');
    }

    public function canAssignOrganizers(Evenement $evenement, ?User $user): bool
    {
        return $this->hasPermission($evenement, $user, 'can_assign_organizers');
    }

    public function canManageCertificates(Evenement $evenement, ?User $user): bool
    {
        return $this->hasPermission($evenement, $user, 'can_manage_certificates');
    }

    public function canManageResults(Evenement $evenement, ?User $user): bool
    {
        return $this->hasPermission($evenement, $user, 'can_manage_results');
    }

    public function isPresidentJury(Evenement $evenement, ?User $user): bool
    {
        if (! $user) {
            return false;
        }

        if ($this->isAdminOrCreator($evenement, $user)) {
            return true;
        }

        $assignment = $this->assignment($evenement, $user);

        return (bool) ($assignment && $assignment->role === 'jury' && $assignment->is_president_jury);
    }

    public function isJuryMember(Evenement $evenement, ?User $user): bool
    {
        if (! $user) {
            return false;
        }

        if ($this->isPresidentJury($evenement, $user)) {
            return true;
        }

        $assignment = $this->assignment($evenement, $user);

        return (bool) ($assignment && $assignment->role === 'jury');
    }

    /**
     * Get all permissions for a user on an event
     *
     * @return array<string, bool>
     */
    public function getPermissions(Evenement $evenement, ?User $user): array
    {
        if (! $user) {
            return [];
        }

        $isAdmin = $this->isAdminOrCreator($evenement, $user);
        $canEdit = $isAdmin || $this->canEditEvent($evenement, $user);
        $canManageParticipants = $isAdmin || $this->canManageParticipants($evenement, $user);
        $canManageComments = $isAdmin || $this->canManageComments($evenement, $user);
        $canManageMessages = $isAdmin || $this->canManageMessages($evenement, $user);
        $canManageResults = $isAdmin || $this->canManageResults($evenement, $user);
        $canManageCertificates = $isAdmin || $this->canManageCertificates($evenement, $user);
        $isAssigned = (bool) $this->assignment($evenement, $user);

        return [
            'manage' => $canEdit || $canManageParticipants || $canManageMessages || $canManageResults || $canManageCertificates,
            'join' => $this->canView($evenement, $user) && ! $isAdmin && ! $isAssigned,
            'uploadMedia' => $canEdit,
            'archive' => $isAdmin,
            'delete' => $isAdmin,
            'changeVisibility' => $isAdmin || $this->canChangeVisibility($evenement, $user),
            'manageParticipants' => $canManageParticipants,
            'manageComments' => $canManageComments,
            'manageMessages' => $canManageMessages,
            'manageResults' => $canManageResults,
            'manageCertificates' => $canManageCertificates,
            'presidentJury' => $this->isPresidentJury($evenement, $user),
            'juryMember' => $this->isJuryMember($evenement, $user),
        ];
    }
}
