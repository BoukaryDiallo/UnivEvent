<?php

namespace App\Services;

use App\Models\Evenement;
use App\Models\JuryDeliberation;
use App\Models\JuryPanel;
use App\Models\JuryScore;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Service orchestrating jury management operations
 * Handles jury setup, scoring workflow, and result validation
 */
class JuryService
{
    public function __construct(
        private ScoringService $scoringService,
        private CriteriaService $criteriaService,
    ) {}

    /**
     * Initialize jury panel for an event
     */
    public function initializeJuryPanel(
        Evenement $event,
        User $president,
        array $juryMembers = [],
        array $criteria = []
    ): JuryPanel {
        return DB::transaction(function () use ($event, $president, $juryMembers, $criteria) {
            $panel = JuryPanel::firstOrCreate(
                ['evenement_id' => $event->id],
                [
                    'president_user_id' => $president->id,
                    'criteria_locked' => false,
                ]
            );

            // Assign jury members if provided
            if (! empty($juryMembers)) {
                foreach ($juryMembers as $userId) {
                    $event->assignments()->updateOrCreate(
                        [
                            'user_id' => $userId,
                            'role' => 'jury',
                        ],
                        [
                            'category' => 'assignment',
                        ]
                    );
                }
            }

            // Create criteria if provided
            if (! empty($criteria)) {
                $this->criteriaService->createMultiple($panel, $criteria);
            }

            return $panel;
        });
    }

    /**
     * Get participants for jury scoring
     */
    public function getParticipantsForScoring(Evenement $event): Collection
    {
        return $event->inscriptions()
            ->where('statut', 'accepte')
            ->with('utilisateur')
            ->get()
            ->map(fn ($inscription) => $inscription->utilisateur);
    }

    /**
     * Get scores summary for a participant
     */
    public function getParticipantSummary(JuryPanel $panel, User $participant): array
    {
        $scores = $panel->scores()
            ->where('participant_id', $participant->id)
            ->with(['criterion', 'jury'])
            ->get();

        $averages = $this->scoringService->calculateAveragesByParticipant($panel, $participant);

        return [
            'participant_id' => $participant->id,
            'participant_name' => $participant->name,
            'scores' => $scores->groupBy('jury_criterion_id'),
            'averages' => $averages,
            'final_score' => $averages['weighted'] ?? null,
            'submission_status' => $this->getSubmissionStatus($panel, $participant),
        ];
    }

    /**
     * Get all scores for jury member
     */
    public function getJuryMemberScores(JuryPanel $panel, User $jury): Collection
    {
        return $panel->scores()
            ->where('jury_user_id', $jury->id)
            ->with(['criterion', 'participant'])
            ->get();
    }

    /**
     * Open scoring period
     */
    public function openScoring(JuryPanel $panel): JuryPanel
    {
        $panel->update([
            'scoring_opened_at' => now(),
            'scoring_closed_at' => null,
        ]);

        return $panel->fresh();
    }

    /**
     * Close scoring period
     */
    public function closeScoring(JuryPanel $panel): JuryPanel
    {
        $panel->update([
            'scoring_closed_at' => now(),
        ]);

        return $panel->fresh();
    }

    /**
     * Lock criteria (prevent further modifications)
     */
    public function lockCriteria(JuryPanel $panel): JuryPanel
    {
        $panel->update([
            'criteria_locked' => true,
            'criteria_locked_at' => now(),
        ]);

        return $panel->fresh();
    }

    /**
     * Check if scoring is currently open
     */
    public function isScoringOpen(JuryPanel $panel): bool
    {
        return $panel->scoring_opened_at !== null
            && $panel->scoring_closed_at === null;
    }

    /**
     * Request score revision from president
     */
    public function requestRevision(
        JuryScore $score,
        User $requester,
        string $reason
    ): JuryDeliberation {
        $panel = $score->panel;

        return $panel->deliberations()->create([
            'participant_id' => $score->participant_id,
            'requested_by' => $requester->id,
            'status' => 'pending',
            'reason' => $reason,
        ]);
    }

    /**
     * Resolve deliberation and update score if needed
     */
    public function resolveDeliberation(
        JuryDeliberation $deliberation,
        User $resolver,
        array $newScores = []
    ): JuryDeliberation {
        return DB::transaction(function () use ($deliberation, $resolver, $newScores) {
            // Update scores if provided
            if (! empty($newScores)) {
                foreach ($newScores as $scoreId => $value) {
                    JuryScore::find($scoreId)?->update(['score' => $value]);
                }
            }

            $deliberation->update([
                'status' => 'resolved',
                'resolved_by' => $resolver->id,
                'resolved_at' => now(),
            ]);

            return $deliberation->fresh();
        });
    }

    /**
     * Get pending deliberations for president
     */
    public function getPendingDeliberations(JuryPanel $panel): Collection
    {
        return $panel->deliberations()
            ->where('status', 'pending')
            ->with(['participant', 'requester'])
            ->latest()
            ->get();
    }

    /**
     * Finalize results and calculate final rankings
     */
    public function finalizeResults(JuryPanel $panel, User $validator): JuryPanel
    {
        return DB::transaction(function () use ($panel, $validator) {
            // Verify all scores are complete
            if (! $this->scoringService->areAllScoresComplete($panel)) {
                throw new \Exception('Cannot finalize: incomplete scores');
            }

            // Calculate final standings
            $this->scoringService->calculateFinalStandings($panel);

            // Mark as validated
            $panel->update([
                'validated_at' => now(),
                'validated_by' => $validator->id,
            ]);

            return $panel->fresh();
        });
    }

    /**
     * Get submission status for a participant
     */
    private function getSubmissionStatus(JuryPanel $panel, User $participant): array
    {
        $criteria = $panel->criteria()->where('actif', true)->get();
        $juryMembers = $panel->evenement->getJuryMembers();

        $status = [];
        foreach ($juryMembers as $jury) {
            $submitted = $panel->scores()
                ->where('participant_id', $participant->id)
                ->where('jury_user_id', $jury->id)
                ->where('submitted_at', '!=', null)
                ->count();

            $status[$jury->id] = [
                'jury_id' => $jury->id,
                'jury_name' => $jury->name,
                'submitted_count' => $submitted,
                'total_criteria' => $criteria->count(),
                'is_complete' => $submitted === $criteria->count(),
            ];
        }

        return $status;
    }
}
