<?php

namespace App\Policies;

use App\Models\Evenement;
use App\Models\JuryPanel;
use App\Models\JuryCriterion;
use App\Models\JuryScore;
use App\Models\JuryDeliberation;
use App\Models\User;

/**
 * Policy for Jury operations
 * Controls permissions for jury members and presidents
 */
class EventJuryPolicy
{
    /**
     * View jury dashboard
     */
    public function viewDashboard(User $user, Evenement $event): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if ($event->cree_par === $user->id) {
            return true;
        }

        // User must be assigned as jury or president
        return $event->assignments()
            ->where('user_id', $user->id)
            ->whereIn('role', ['jury', 'president_jury'])
            ->exists();
    }

    /**
     * View jury panel details
     */
    public function viewPanel(User $user, JuryPanel $panel): bool
    {
        return $this->viewDashboard($user, $panel->evenement);
    }

    /**
     * Submit scores
     */
    public function submitScores(User $user, Evenement $event): bool
    {
        if (!$this->viewDashboard($user, $event)) {
            return false;
        }

        $panel = $event->juryPanel;
        if (!$panel) {
            return false;
        }

        // Check if scoring is open
        if ($panel->scoring_closed_at !== null) {
            return false;
        }

        // User must be a jury member
        return $event->assignments()
            ->where('user_id', $user->id)
            ->whereIn('role', ['jury', 'president_jury'])
            ->exists();
    }

    /**
     * Update own scores
     */
    public function updateOwnScores(User $user, JuryScore $score): bool
    {
        // Can only update own scores
        if ($score->jury_user_id !== $user->id) {
            return false;
        }

        $panel = $score->panel;

        // Check if scoring period allows updates
        if ($panel->scoring_closed_at !== null && !$panel->criteria_locked) {
            return false;
        }

        return true;
    }

    /**
     * View all scores (president only)
     */
    public function viewAllScores(User $user, JuryPanel $panel): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if ($panel->evenement->cree_par === $user->id) {
            return true;
        }

        // Only president can view all scores
        return $panel->president_user_id === $user->id;
    }

    /**
     * Manage criteria (president only)
     */
    public function manageCriteria(User $user, JuryPanel $panel): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if ($panel->evenement->cree_par === $user->id) {
            return true;
        }

        // Only president
        if ($panel->president_user_id !== $user->id) {
            return false;
        }

        // Cannot modify after criteria locked
        if ($panel->criteria_locked) {
            return false;
        }

        return true;
    }

    /**
     * Create criterion
     */
    public function createCriterion(User $user, JuryPanel $panel): bool
    {
        return $this->manageCriteria($user, $panel);
    }

    /**
     * Update criterion
     */
    public function updateCriterion(User $user, JuryCriterion $criterion): bool
    {
        return $this->manageCriteria($user, $criterion->panel);
    }

    /**
     * Delete criterion
     */
    public function deleteCriterion(User $user, JuryCriterion $criterion): bool
    {
        return $this->manageCriteria($user, $criterion->panel);
    }

    /**
     * Request revision (any jury member can request)
     */
    public function requestRevision(User $user, JuryScore $score): bool
    {
        // Can request revision on own scores or as president
        $isScoreOwner = $score->jury_user_id === $user->id;
        $isPresident = $score->panel->president_user_id === $user->id;

        return $isScoreOwner || $isPresident || $user->isAdmin();
    }

    /**
     * Resolve deliberation (president only)
     */
    public function resolveDeliberation(User $user, JuryDeliberation $deliberation): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if ($deliberation->panel->evenement->cree_par === $user->id) {
            return true;
        }

        // Only president can resolve
        return $deliberation->panel->president_user_id === $user->id;
    }

    /**
     * Finalize results (president only)
     */
    public function finalizeResults(User $user, JuryPanel $panel): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if ($panel->evenement->cree_par === $user->id) {
            return true;
        }

        // Only president
        return $panel->president_user_id === $user->id;
    }

    /**
     * View results (organizer or president)
     */
    public function viewResults(User $user, JuryPanel $panel): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if ($panel->evenement->cree_par === $user->id) {
            return true;
        }

        return $panel->president_user_id === $user->id;
    }
}
