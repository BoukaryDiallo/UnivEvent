<?php

namespace App\Services;

use App\Models\Evenement;
use App\Models\EvenementRole;
use App\Models\User;

class EventPermissionService
{
    public function getPermissions(Evenement $event, ?User $user): array
    {
        if (!$user) {
            return $this->getPublicPermissions($event);
        }

        if ($user->isAdmin()) {
            return $this->getAdminPermissions();
        }

        $assignment = $event->assignments()->where('user_id', $user->id)->first();

        if ($event->cree_par === $user->id) {
            return $this->getCreatorPermissions($event);
        }

        if ($assignment) {
            return $this->getAssignedPermissions($event, $assignment);
        }

        return $this->getPublicPermissions($event);
    }

    private function getPublicPermissions(Evenement $event): array
    {
        $canView = $this->canViewEvent($event, null);
        $canRegister = $canView && $event->inscription_requise && $event->statut === 'publie';

        return [
            'view' => $canView,
            'register' => $canRegister,
            'comment' => $canView && $event->comments_enabled,
            'download_media' => $canView && $this->canDownloadMedia($event, null),
            'view_results' => $canView && $event->competition_status === 'resultats_publies',
            'download_certificate' => false,
        ];
    }

    private function getAdminPermissions(): array
    {
        return [
            'view' => true,
            'edit' => true,
            'delete' => true,
            'manage' => true,
            'publish' => true,
            'archive' => true,
            'assign_users' => true,
            'manage_permissions' => true,
            'validate' => true,
            'reject' => true,
            'manage_program' => true,
            'upload_media' => true,
            'manage_comments' => true,
            'manage_messages' => true,
            'manage_results' => true,
            'manage_certificates' => true,
            'download_media' => true,
            'view_results' => true,
            'download_certificate' => true,
        ];
    }

    private function getCreatorPermissions(Evenement $event): array
    {
        $basePermissions = $this->getPublicPermissions($event);

        return array_merge($basePermissions, [
            'edit' => true,
            'delete' => true,
            'manage' => true,
            'publish' => $event->validation_status === 'approved',
            'archive' => true,
            'assign_users' => true,
            'manage_permissions' => true,
            'submit_validation' => true,
            'manage_program' => true,
            'upload_media' => true,
            'manage_comments' => true,
            'manage_messages' => true,
            'manage_results' => $event->type === 'concours',
            'manage_certificates' => true,
            'download_media' => true,
            'view_results' => true,
            'download_certificate' => true,
        ]);
    }

    private function getAssignedPermissions(Evenement $event, ?EvenementRole $assignment): array
    {
        $basePermissions = $this->getPublicPermissions($event);
        $rolePermissions = $assignment?->permissions ?? [];

        return array_merge($basePermissions, [
            'manage_messages' => $rolePermissions['can_manage_messages'] ?? false,
            'manage_comments' => $rolePermissions['can_manage_comments'] ?? false,
            'edit' => $rolePermissions['can_edit_event'] ?? false,
            'manage_participants' => $rolePermissions['can_manage_participants'] ?? false,
            'manage_certificates' => $rolePermissions['can_manage_certificates'] ?? false,
            'manage_results' => $rolePermissions['can_manage_results'] ?? false,
            'download_media' => $this->canDownloadMedia($event, $assignment),
        ]);
    }

    public function canViewEvent(Evenement $event, ?User $user): bool
    {
        if ($event->visibilite === 'public') {
            return true;
        }

        if (!$user) {
            return false;
        }

        if ($user->isAdmin() || $event->cree_par === $user->id) {
            return true;
        }

        if ($event->visibilite === 'prive') {
            return $event->assignments()->where('user_id', $user->id)->exists();
        }

        if ($event->visibilite === 'restreint') {
            return $this->matchesPublicCible($event, $user) ||
                   $event->assignments()->where('user_id', $user->id)->exists();
        }

        return false;
    }

    public function canDownloadMedia(Evenement $event, ?EvenementRole $assignment = null): bool
    {
        if ($event->visibilite === 'public') {
            return true;
        }

        return $assignment && ($assignment->permissions['can_download_media'] ?? false);
    }

    private function matchesPublicCible(Evenement $event, User $user): bool
    {
        if ($event->public_cible === 'tous') {
            return true;
        }

        return $event->roles()->where('role', $user->role)->exists() ||
               $event->roles()->where('role', 'tous')->exists();
    }

    public function canAssignRole(Evenement $event, User $user, string $role): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if ($event->cree_par === $user->id) {
            return in_array($role, ['organisateur', 'jury', 'intervenant', 'participant']);
        }

        $assignment = $event->assignments()->where('user_id', $user->id)->first();
        return $assignment && ($assignment->permissions['can_manage_participants'] ?? false);
    }
}
