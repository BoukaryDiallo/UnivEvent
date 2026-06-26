<?php

namespace App\Services;

use App\Models\Evenement;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

/**
 * Service for Event Control Panel
 * Manages user access to events based on roles and provides centralized navigation
 */
class ControlPanelService
{
    public function __construct(
        private EventAuthorizationService $authService,
    ) {}

    /**
     * Get all events where user is assigned (with roles)
     * Used for the drawer event list
     */
    public function getMyEvents(User $user): Collection
    {
        return Evenement::whereHas('assignments', function ($query) use ($user) {
            $query->where('user_id', $user->id)
                ->where('category', 'assignment');
        })
            ->with(['assignments' => function ($query) use ($user) {
                $query->where('user_id', $user->id);
            }, 'createur'])
            ->latest()
            ->get()
            ->map(fn ($event) => $this->enrichEventWithRole($event, $user));
    }

    /**
     * Get active events (ongoing or upcoming)
     */
    public function getMyActiveEvents(User $user): Collection
    {
        return $this->getMyEvents($user)
            ->filter(fn ($event) => $this->isEventActive($event));
    }

    /**
     * Get events where user is organizer
     */
    public function getMyOrganizedEvents(User $user): Collection
    {
        return $this->getMyEvents($user)
            ->filter(fn ($event) => $event->user_roles->contains('organisateur'));
    }

    /**
     * Get events where user is jury member
     */
    public function getMyJuryEvents(User $user): Collection
    {
        return $this->getMyEvents($user)
            ->filter(fn ($event) => $event->user_roles->contains('jury') || $event->user_roles->contains('president_jury'));
    }

    /**
     * Get events where user is speaker/intervenant
     */
    public function getMyIntervenantEvents(User $user): Collection
    {
        return $this->getMyEvents($user)
            ->filter(fn ($event) => $event->user_roles->contains('intervenant'));
    }

    /**
     * Get events where user is participant
     */
    public function getMyParticipationEvents(User $user): Collection
    {
        return $this->getMyEvents($user)
            ->filter(fn ($event) => $event->user_roles->contains('participant'));
    }

    /**
     * Enrich event with user's roles
     */
    private function enrichEventWithRole(Evenement $event, User $user): object
    {
        $assignments = $event->assignments()
            ->where('user_id', $user->id)
            ->where('category', 'assignment')
            ->pluck('role')
            ->toArray();

        return (object) [
            'id' => $event->id,
            'titre' => $event->titre,
            'type' => $event->type,
            'statut' => $event->statut,
            'date_debut' => $event->date_debut,
            'date_fin' => $event->date_fin,
            'lieu' => $event->lieu,
            'cover_url' => $event->medias?->firstWhere('type', 'image')?->chemin_fichier,
            'user_roles' => collect($assignments),
            'primary_role' => $this->getPrimaryRole($assignments),
            'can_manage' => $this->authService->canEditEvent($event, $user),
            'permissions' => $this->getPermissionsForRoles($assignments),
        ];
    }

    /**
     * Get primary role (hierarchy: organizer > president > jury > intervenant > participant)
     */
    private function getPrimaryRole(array $roles): string
    {
        $hierarchy = ['organisateur', 'president_jury', 'jury', 'intervenant', 'participant'];

        foreach ($hierarchy as $role) {
            if (in_array($role, $roles)) {
                return $role;
            }
        }

        return 'participant';
    }

    /**
     * Get permissions based on roles
     */
    private function getPermissionsForRoles(array $roles): array
    {
        $permissions = [
            'can_view' => true,
            'can_comment' => in_array('participant', $roles),
            'can_manage' => false,
            'can_score' => false,
            'can_moderate' => false,
        ];

        if (in_array('organisateur', $roles)) {
            $permissions['can_manage'] = true;
            $permissions['can_moderate'] = true;
        }

        if (in_array('jury', $roles) || in_array('president_jury', $roles)) {
            $permissions['can_score'] = true;
        }

        if (in_array('intervenant', $roles)) {
            $permissions['can_manage'] = true;
        }

        return $permissions;
    }

    /**
     * Check if event is active (ongoing or within 7 days)
     */
    private function isEventActive(object $event): bool
    {
        if (! $event->date_debut) {
            return false;
        }

        $start = new \DateTime($event->date_debut);
        $now = new \DateTime;
        $end = $event->date_fin ? new \DateTime($event->date_fin) : $start->modify('+1 day');

        return $now >= $start->modify('-7 days') && $now <= $end->modify('+1 day');
    }

    /**
     * Get available actions for user on event (based on role and permissions)
     */
    public function getAvailableActions(Evenement $event, User $user): array
    {
        $assignment = $event->assignments()
            ->where('user_id', $user->id)
            ->first();

        $actions = [
            'view_event' => true,
            'view_participants' => false,
            'manage_participants' => false,
            'score_participants' => false,
            'manage_criteria' => false,
            'view_results' => false,
            'manage_certificates' => false,
            'moderate_comments' => false,
            'manage_messages' => false,
            'manage_users' => false,
        ];

        if (! $assignment) {
            return $actions;
        }

        // View participants
        if ($assignment->can_edit_event || $assignment->role === 'organisateur') {
            $actions['view_participants'] = true;
            $actions['manage_participants'] = true;
        }

        // Jury actions
        if (in_array($assignment->role, ['jury', 'president_jury'])) {
            $actions['score_participants'] = true;
            $actions['view_participants'] = true;
        }

        if ($assignment->role === 'president_jury') {
            $actions['manage_criteria'] = true;
            $actions['view_results'] = true;
        }

        // Organizer actions
        if ($assignment->role === 'organisateur' || $assignment->can_edit_event) {
            $actions['manage_certificates'] = true;
            $actions['moderate_comments'] = true;
            $actions['manage_messages'] = true;
            $actions['manage_users'] = true;
            $actions['view_results'] = true;
        }

        return $actions;
    }

    /**
     * Get control panel data for a specific event and user
     */
    public function getControlPanelData(Evenement $event, User $user): array
    {
        $assignment = $event->assignments()
            ->where('user_id', $user->id)
            ->first();

        return [
            'event' => $event,
            'user_role' => $assignment?->role ?? 'participant',
            'permissions' => $this->getAvailableActions($event, $user),
            'panel_type' => $this->resolvePanelType($assignment?->role ?? 'participant', $event),
            'stats' => $this->getPanelStatistics($event, $assignment?->role),
        ];
    }

    /**
     * Resolve which panel layout to display
     */
    private function resolvePanelType(string $role, Evenement $event): string
    {
        return match ($role) {
            'organisateur' => 'organizer_dashboard',
            'president_jury' => 'president_jury_dashboard',
            'jury' => 'jury_member_dashboard',
            'intervenant' => 'speaker_dashboard',
            'participant' => 'participant_dashboard',
            default => 'viewer_dashboard',
        };
    }

    /**
     * Get statistics for the panel (counters, etc)
     */
    private function getPanelStatistics(Evenement $event, ?string $role): array
    {
        $stats = [
            'participants_count' => $event->inscriptions()->where('statut', 'accepte')->count(),
            'comments_count' => $event->comments()->count(),
            'messages_count' => $event->messages()->count(),
        ];

        if ($role === 'president_jury' && $event->type === 'concours') {
            $panel = $event->juryPanel;
            $stats['jury_members_count'] = $event->getJuryMembers()->count();
            $stats['criteria_count'] = $panel?->criteria()->where('actif', true)->count() ?? 0;
        }

        return $stats;
    }
}
