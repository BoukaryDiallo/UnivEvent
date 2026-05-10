<?php

namespace App\Services;

use App\Models\JuryPanel;
use App\Models\JuryScore;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Service for score calculations and validation
 * Handles weighted averages, rankings, and completeness checks
 */
class ScoringService
{
    /**
     * Submit scores for a participant from a jury member
     */
    public function submitScores(
        JuryPanel $panel,
        User $participant,
        User $jury,
        array $scores
    ): Collection {
        return DB::transaction(function () use ($panel, $participant, $jury, $scores) {
            $created = collect();

            foreach ($scores as $criterionId => $score) {
                $record = JuryScore::updateOrCreate(
                    [
                        'jury_panel_id' => $panel->id,
                        'jury_criterion_id' => $criterionId,
                        'participant_id' => $participant->id,
                        'jury_user_id' => $jury->id,
                    ],
                    [
                        'score' => $score,
                        'submitted_at' => now(),
                        'status' => 'submitted',
                    ]
                );

                $created->push($record);
            }

            return $created;
        });
    }

    /**
     * Update scores (reopened scoring)
     */
    public function updateScores(
        JuryPanel $panel,
        User $participant,
        User $jury,
        array $updatedScores
    ): Collection {
        return DB::transaction(function () use ($panel, $participant, $jury, $updatedScores) {
            $updated = collect();

            foreach ($updatedScores as $criterionId => $score) {
                $record = $panel->scores()
                    ->where('jury_criterion_id', $criterionId)
                    ->where('participant_id', $participant->id)
                    ->where('jury_user_id', $jury->id)
                    ->first();

                if ($record) {
                    $record->update([
                        'score' => $score,
                        'reopened_at' => now(),
                    ]);
                    $updated->push($record);
                }
            }

            return $updated;
        });
    }

    /**
     * Calculate weighted average for a participant
     * Formula: ∑(score_i × coefficient_i) / ∑coefficient_i
     */
    public function calculateWeightedAverage(JuryPanel $panel, User $participant): ?float
    {
        $scores = $panel->scores()
            ->where('participant_id', $participant->id)
            ->with('criterion')
            ->get();

        if ($scores->isEmpty()) {
            return null;
        }

        $weightedSum = 0;
        $coefficientSum = 0;

        foreach ($scores as $score) {
            $coefficient = $score->criterion->coefficient ?? 1;
            $weightedSum += $score->score * $coefficient;
            $coefficientSum += $coefficient;
        }

        return $coefficientSum > 0 ? $weightedSum / $coefficientSum : null;
    }

    /**
     * Calculate averages by criterion for a participant
     */
    public function calculateAveragesByCriterion(JuryPanel $panel, User $participant): array
    {
        $scores = $panel->scores()
            ->where('participant_id', $participant->id)
            ->with('criterion')
            ->get();

        $averages = [];
        foreach ($scores->groupBy('jury_criterion_id') as $criterionId => $criterionScores) {
            $criterion = $criterionScores->first()->criterion;
            $avg = $criterionScores->avg('score');

            $averages[$criterionId] = [
                'criterion_id' => $criterionId,
                'criterion_name' => $criterion?->nom,
                'coefficient' => $criterion?->coefficient ?? 1,
                'average' => round($avg, 2),
            ];
        }

        return $averages;
    }

    /**
     * Calculate all averages for a participant
     */
    public function calculateAveragesByParticipant(JuryPanel $panel, User $participant): array
    {
        $byJury = $this->calculateAveragesByJury($panel, $participant);
        $byCriterion = $this->calculateAveragesByCriterion($panel, $participant);
        $weighted = $this->calculateWeightedAverage($panel, $participant);

        return [
            'by_jury' => $byJury,
            'by_criterion' => $byCriterion,
            'weighted' => round($weighted ?? 0, 2),
        ];
    }

    /**
     * Calculate averages by jury member
     */
    public function calculateAveragesByJury(JuryPanel $panel, User $participant): array
    {
        $scores = $panel->scores()
            ->where('participant_id', $participant->id)
            ->with('jury')
            ->get();

        $averages = [];
        foreach ($scores->groupBy('jury_user_id') as $juryId => $juryScores) {
            $jury = $juryScores->first()->jury;
            $avg = $juryScores->avg('score');

            $averages[$juryId] = [
                'jury_id' => $juryId,
                'jury_name' => $jury?->name,
                'average' => round($avg, 2),
            ];
        }

        return $averages;
    }

    /**
     * Check if all scores are complete (all criteria scored by all jury members)
     */
    public function areAllScoresComplete(JuryPanel $panel): bool
    {
        $participants = $panel->evenement->getParticipantsForContest();
        $criteria = $panel->criteria()->where('actif', true)->count();
        $juryMembers = $panel->evenement->getJuryMembers()->count();

        if ($criteria === 0 || $juryMembers === 0) {
            return false;
        }

        $expectedScoreCount = $participants->count() * $criteria * $juryMembers;
        $actualScoreCount = $panel->scores()->where('submitted_at', '!=', null)->count();

        return $actualScoreCount === $expectedScoreCount;
    }

    /**
     * Calculate final standings (rankings)
     */
    public function calculateFinalStandings(JuryPanel $panel): array
    {
        $participants = $panel->evenement->getParticipantsForContest();
        $standings = [];

        foreach ($participants as $participant) {
            $weighted = $this->calculateWeightedAverage($panel, $participant);

            $standings[] = [
                'participant_id' => $participant->id,
                'participant_name' => $participant->name,
                'final_score' => $weighted,
                'rank' => 0, // Will be set after sorting
            ];
        }

        // Sort by final score descending
        usort($standings, fn ($a, $b) => $b['final_score'] <=> $a['final_score']);

        // Assign ranks
        foreach ($standings as $key => $standing) {
            $standings[$key]['rank'] = $key + 1;
        }

        return $standings;
    }

    /**
     * Get score completion rate for a participant
     */
    public function getCompletionRate(JuryPanel $panel, User $participant): float
    {
        $criteria = $panel->criteria()->where('actif', true)->count();
        $juryMembers = $panel->evenement->getJuryMembers()->count();

        if ($criteria === 0 || $juryMembers === 0) {
            return 0;
        }

        $expectedCount = $criteria * $juryMembers;
        $actualCount = $panel->scores()
            ->where('participant_id', $participant->id)
            ->where('submitted_at', '!=', null)
            ->count();

        return ($actualCount / $expectedCount) * 100;
    }

    /**
     * Detect scoring anomalies (outliers)
     */
    public function detectAnomalies(JuryPanel $panel): array
    {
        $participants = $panel->evenement->getParticipantsForContest();
        $anomalies = [];

        foreach ($participants as $participant) {
            $byJury = $this->calculateAveragesByJury($panel, $participant);

            // Calculate standard deviation
            $values = array_map(fn ($j) => $j['average'], $byJury);
            $mean = array_sum($values) / count($values);
            $deviations = array_map(fn ($v) => pow($v - $mean, 2), $values);
            $stdDev = sqrt(array_sum($deviations) / count($deviations));

            // Flag if any jury is more than 2 standard deviations from mean
            if ($stdDev > 0) {
                foreach ($byJury as $juryId => $juryData) {
                    if (abs($juryData['average'] - $mean) > 2 * $stdDev) {
                        $anomalies[] = [
                            'participant_id' => $participant->id,
                            'participant_name' => $participant->name,
                            'jury_id' => $juryId,
                            'jury_name' => $juryData['jury_name'],
                            'score' => $juryData['average'],
                            'expected_range' => [$mean - 2 * $stdDev, $mean + 2 * $stdDev],
                            'severity' => 'warning',
                        ];
                    }
                }
            }
        }

        return $anomalies;
    }
}
