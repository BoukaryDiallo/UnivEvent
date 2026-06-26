<?php

namespace App\Policies;

use App\Models\Evenement;
use App\Models\User;

/**
 * Policy for Event Control Panel access
 * Controls permissions to view and interact with the central event dashboard
 */
class ControlPanelPolicy
{
    /**
     * Access the control panel for an event
     */
    public function access(User $user, Evenement $event): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        // Event creator always has access
        if ($event->cree_par === $user->id) {
            return true;
        }

        // User must be assigned to the event
        return $event->assignments()
            ->where('user_id', $user->id)
            ->where('category', 'assignment')
            ->exists();
    }

    /**
     * View organizer dashboard
     */
    public function viewOrganizerDashboard(User $user, Evenement $event): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if ($event->cree_par === $user->id) {
            return true;
        }

        // User must be organizer
        return $event->assignments()
            ->where('user_id', $user->id)
            ->where('role', 'organisateur')
            ->exists();
    }

    /**
     * View jury dashboard
     */
    public function viewJuryDashboard(User $user, Evenement $event): bool
    {
        if ($user->isAdmin() || $event->cree_par === $user->id) {
            return true;
        }

        // Event must be contest
        if ($event->type !== 'concours') {
            return false;
        }

        // User must be jury member or president
        return $event->assignments()
            ->where('user_id', $user->id)
            ->whereIn('role', ['jury', 'president_jury'])
            ->exists();
    }

    /**
     * View speaker dashboard
     */
    public function viewSpeakerDashboard(User $user, Evenement $event): bool
    {
        if ($user->isAdmin() || $event->cree_par === $user->id) {
            return true;
        }

        // User must be speaker/intervenant
        return $event->assignments()
            ->where('user_id', $user->id)
            ->where('role', 'intervenant')
            ->exists();
    }

    /**
     * View participant dashboard
     */
    public function viewParticipantDashboard(User $user, Evenement $event): bool
    {
        // Everyone can view participant dashboard if they're registered
        return $event->inscriptions()
            ->where('utilisateur_id', $user->id)
            ->where('statut', 'accepte')
            ->exists();
    }

    /**
     * Access moderation panel
     */
    public function moderateContent(User $user, Evenement $event): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if ($event->cree_par === $user->id) {
            return true;
        }

        // Check assignment permissions
        $assignment = $event->assignments()
            ->where('user_id', $user->id)
            ->first();

        return $assignment && ($assignment->can_manage_comments || $assignment->role === 'organisateur');
    }

    /**
     * Access communication panel (send notifications)
     */
    public function sendNotifications(User $user, Evenement $event): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if ($event->cree_par === $user->id) {
            return true;
        }

        // Check if user is organizer
        $isOrganizer = $event->assignments()
            ->where('user_id', $user->id)
            ->where('role', 'organisateur')
            ->exists();

        if ($isOrganizer) {
            return true;
        }

        // Check if has permission to manage messages
        $assignment = $event->assignments()
            ->where('user_id', $user->id)
            ->first();

        return $assignment && $assignment->can_manage_messages;
    }

    /**
     * Access user management panel
     */
    public function manageUsers(User $user, Evenement $event): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if ($event->cree_par === $user->id) {
            return true;
        }

        // Check if user is organizer
        return $event->assignments()
            ->where('user_id', $user->id)
            ->where('role', 'organisateur')
            ->exists();
    }

    /**
     * Access participant management
     */
    public function manageParticipants(User $user, Evenement $event): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if ($event->cree_par === $user->id) {
            return true;
        }

        // Check assignment permissions
        $assignment = $event->assignments()
            ->where('user_id', $user->id)
            ->first();

        return $assignment && ($assignment->can_manage_participants || $assignment->role === 'organisateur');
    }

    /**
     * Access certificate management
     */
    public function manageCertificates(User $user, Evenement $event): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if ($event->cree_par === $user->id) {
            return true;
        }

        // Check assignment permissions
        $assignment = $event->assignments()
            ->where('user_id', $user->id)
            ->first();

        return $assignment && ($assignment->can_manage_certificates || $assignment->role === 'organisateur');
    }

    /**
     * View analytics
     */
    public function viewAnalytics(User $user, Evenement $event): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if ($event->cree_par === $user->id) {
            return true;
        }

        // Organizers can view analytics
        return $event->assignments()
            ->where('user_id', $user->id)
            ->where('role', 'organisateur')
            ->exists();
    }

    /**
     * View live stats
     */
    public function viewLiveStats(User $user, Evenement $event): bool
    {
        // Organizers, presidents, and event creators can view live stats
        return $this->viewOrganizerDashboard($user, $event) ||
               $this->viewJuryDashboard($user, $event);
    }
}
