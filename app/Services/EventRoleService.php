<?php

namespace App\Services;

use App\Models\Evenement;
use App\Models\EvenementRole;
use App\Models\User;
use Illuminate\Support\Collection;

class EventRoleService
{
    private const ASSIGNMENT_ROLES = ['organisateur', 'jury', 'intervenant', 'participant'];

    public function assignUser(Evenement $event, User|int $user, string $role, array $permissions = []): EvenementRole
    {
        $resolvedUser = $user instanceof User ? $user : User::findOrFail($user);

        // T06: Conflict check (participant -> jury)
        if ($role === 'jury' && $event->inscriptions()->where('utilisateur_id', $resolvedUser->id)->exists()) {
            // In a real app, we might return a warning. Here we throw an exception that controller can catch or return 422.
            throw new \InvalidArgumentException('L utilisateur est deja inscrit en tant que participant. L affectation en tant que jury est conflictuelle.');
        }

        $event->assignments()->where('user_id', $resolvedUser->id)->delete();

        return EvenementRole::create([
            'evenement_id' => $event->id,
            'user_id' => $resolvedUser->id,
            'category' => 'assignment',
            'role' => $role,
            'permissions' => $permissions,
            'is_president_jury' => (bool) ($permissions['is_president_jury'] ?? false),
            'meta' => [
                'assigned_by' => auth()->id(),
                'assigned_at' => now(),
            ],
        ]);
    }

    public function removeUser(Evenement $event, User $user): void
    {
        $event->assignments()->where('user_id', $user->id)->delete();
    }

    public function updatePermissions(Evenement $event, User $user, array $permissions): void
    {
        $assignment = $event->assignments()->where('user_id', $user->id)->first();

        if ($assignment) {
            $assignment->update(['permissions' => $permissions]);
        }
    }

    public function getTeam(Evenement $event): array
    {
        $team = [];

        foreach (self::ASSIGNMENT_ROLES as $role) {
            $team[$role] = $event->assignments()
                ->where('role', $role)
                ->with('user')
                ->get()
                ->map(function (EvenementRole $assignment) use ($event, $role) {
                    $isPresidentJury = $role === 'jury' && $event->juryPanel?->president_user_id === $assignment->user_id;

                    return [
                        'id' => $assignment->id,
                        'user_id' => $assignment->user_id,
                        'name' => $assignment->user?->name,
                        'email' => $assignment->user?->email,
                        'role' => $assignment->role,
                        'is_president_jury' => $isPresidentJury,
                        'permissions' => $assignment->permissions ?? [],
                        'assigned_at' => $assignment->created_at,
                    ];
                })
                ->values()
                ->toArray();
        }

        return $team;
    }

    public function getAvailableUsers(Evenement $event, ?string $excludeRole = null): Collection
    {
        $assignedUserIds = $event->assignments()->pluck('user_id');

        return User::whereNotIn('id', $assignedUserIds)
            ->when($excludeRole, fn ($q) => $q->where('role', '!=', $excludeRole))
            ->select('id', 'name', 'email', 'role')
            ->orderBy('name')
            ->get();
    }

    public function validateRoleAssignment(Evenement $event, string $role): bool
    {
        if (! in_array($role, self::ASSIGNMENT_ROLES, true)) {
            return false;
        }

        if ($role === 'jury' && $event->type !== 'concours') {
            return false;
        }

        return true;
    }

    public function getRolePermissions(string $role): array
    {
        return match ($role) {
            'organisateur' => [
                'can_manage_messages' => true,
                'can_edit_event' => true,
                'can_manage_participants' => true,
                'can_manage_certificates' => true,
                'can_manage_results' => true,
                'can_manage_comments' => true,
            ],
            'jury' => [
                'can_manage_results' => true,
                'can_manage_comments' => false,
            ],
            'intervenant' => [
                'can_manage_messages' => false,
                'can_edit_event' => false,
            ],
            'participant' => [
                'can_manage_messages' => false,
                'can_edit_event' => false,
            ],
            default => [],
        };
    }
}
