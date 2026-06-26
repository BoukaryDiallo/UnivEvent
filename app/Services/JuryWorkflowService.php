<?php

namespace App\Services;

use App\Models\Evenement;
use App\Models\JuryDeliberation;
use App\Models\JuryPanel;
use App\Models\JuryScore;
use App\Models\Resultat;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class JuryWorkflowService
{
    public function ensurePanel(Evenement $evenement): JuryPanel
    {
        return $evenement->juryPanel()->firstOrCreate(
            [],
            [
                'president_user_id' => $evenement->assignments()->where('role', 'jury')->where('is_president_jury', true)->value('user_id'),
                'admission_average' => 10,
                'ranking_mode' => 'final_note',
                'tie_break_rule' => 'name',
            ],
        );
    }

    public function syncCriteria(JuryPanel $panel, array $criteria): JuryPanel
    {
        $idsToKeep = [];

        foreach (collect($criteria)->values() as $index => $criterion) {
            if (! filled($criterion['nom'] ?? null)) {
                continue;
            }

            $payload = [
                'nom' => $criterion['nom'],
                'description' => $criterion['description'] ?? null,
                'bareme' => $criterion['bareme'] ?? 20,
                'coefficient' => $criterion['coefficient'] ?? 1,
                'ordre' => $criterion['ordre'] ?? ($index + 1),
                'actif' => $criterion['actif'] ?? true,
            ];

            $model = isset($criterion['id'])
                ? $panel->criteria()->whereKey($criterion['id'])->first()
                : null;

            if ($model) {
                $model->update($payload);
                $idsToKeep[] = $model->id;

                continue;
            }

            $created = $panel->criteria()->create($payload);
            $idsToKeep[] = $created->id;
        }

        $panel->criteria()->when(
            $idsToKeep !== [],
            fn ($query) => $query->whereNotIn('id', $idsToKeep),
            fn ($query) => $query,
        )->delete();

        return $panel->fresh('criteria');
    }

    public function saveScores(JuryPanel $panel, User $juryUser, int $participantId, array $scores, bool $submit = false): void
    {
        foreach ($scores as $item) {
            $criterionId = (int) ($item['criterion_id'] ?? 0);

            if (! $criterionId) {
                continue;
            }

            JuryScore::updateOrCreate(
                [
                    'jury_panel_id' => $panel->id,
                    'jury_criterion_id' => $criterionId,
                    'participant_id' => $participantId,
                    'jury_user_id' => $juryUser->id,
                ],
                [
                    'score' => $item['score'] ?? null,
                    'commentaire' => $item['commentaire'] ?? null,
                    'status' => $submit ? 'submitted' : 'draft',
                    'submitted_at' => $submit ? now() : null,
                ],
            );
        }
    }

    public function openScoring(JuryPanel $panel): void
    {
        $panel->update([
            'scoring_opened_at' => now(),
            'scoring_closed_at' => null,
        ]);

        $panel->evenement->update(['competition_status' => 'notation_ouverte']);
    }

    public function closeScoring(JuryPanel $panel): void
    {
        $panel->update([
            'scoring_closed_at' => now(),
        ]);

        $panel->evenement->update(['competition_status' => 'notation_terminee']);
    }

    public function requestReview(JuryPanel $panel, int $participantId, User $requester, string $reason): JuryDeliberation
    {
        $panel->evenement->update(['competition_status' => 'deliberation']);

        return JuryDeliberation::create([
            'jury_panel_id' => $panel->id,
            'participant_id' => $participantId,
            'requested_by' => $requester->id,
            'reason' => $reason,
            'status' => 'pending',
        ]);
    }

    public function reopenParticipantScores(JuryPanel $panel, int $participantId): void
    {
        $panel->scores()
            ->where('participant_id', $participantId)
            ->update([
                'status' => 'reopened',
                'reopened_at' => now(),
            ]);
    }

    public function computeResults(Evenement $evenement): Collection
    {
        $panel = $this->ensurePanel($evenement)->loadMissing('criteria');
        $criteria = $panel->criteria->where('actif', true)->values();
        $participants = $evenement->assignments()
            ->where('role', 'participant')
            ->with('user:id,name,email,role')
            ->get()
            ->pluck('user')
            ->filter()
            ->values();

        $results = $participants->map(function (User $participant) use ($panel, $criteria) {
            $criteriaBreakdown = [];
            $weightedTotal = 0;
            $totalCoefficient = max($criteria->sum('coefficient'), 1);

            foreach ($criteria as $criterion) {
                $scores = JuryScore::query()
                    ->where('jury_panel_id', $panel->id)
                    ->where('jury_criterion_id', $criterion->id)
                    ->where('participant_id', $participant->id)
                    ->pluck('score')
                    ->filter(fn ($score) => $score !== null);

                $average = $scores->count() ? round((float) $scores->avg(), 2) : 0;
                $weightedTotal += $average * (float) $criterion->coefficient;

                $criteriaBreakdown[] = [
                    'criterion_id' => $criterion->id,
                    'nom' => $criterion->nom,
                    'average' => $average,
                    'coefficient' => (float) $criterion->coefficient,
                ];
            }

            $finalNote = round($weightedTotal / $totalCoefficient, 2);

            return [
                'participant' => $participant,
                'note' => $finalNote,
                'criteria_breakdown' => $criteriaBreakdown,
            ];
        });

        $sorted = $results->sort(function (array $left, array $right) use ($panel) {
            if ($left['note'] !== $right['note']) {
                return $right['note'] <=> $left['note'];
            }

            if ($panel->tie_break_rule === 'name') {
                return strcmp((string) $left['participant']->name, (string) $right['participant']->name);
            }

            return $left['participant']->id <=> $right['participant']->id;
        })->values();

        return $sorted->map(function (array $row, int $index) use ($panel) {
            $rank = $index + 1;
            $admission = 'ajourne';

            if ($panel->seats_count && $rank <= $panel->seats_count && $row['note'] >= (float) $panel->admission_average) {
                $admission = 'admis';
            } elseif ($row['note'] >= (float) $panel->admission_average) {
                $admission = 'liste_attente';
            }

            return [
                ...$row,
                'classement' => $rank,
                'admission' => $admission,
                'mention' => $this->resolveMention($row['note']),
            ];
        });
    }

    public function finalizeResults(Evenement $evenement, User $validator): Collection
    {
        return DB::transaction(function () use ($evenement, $validator) {
            $panel = $this->ensurePanel($evenement);
            $computed = $this->computeResults($evenement);

            foreach ($computed as $row) {
                Resultat::updateOrCreate(
                    [
                        'evenement_id' => $evenement->id,
                        'utilisateur_id' => $row['participant']->id,
                    ],
                    [
                        'note' => $row['note'],
                        'classement' => $row['classement'],
                        'admission' => $row['admission'],
                        'mention' => $row['mention'],
                        'admission_average_snapshot' => $panel->admission_average,
                        'criteria_breakdown' => $row['criteria_breakdown'],
                        'published_at' => now(),
                        'validated_at' => now(),
                        'validated_by' => $validator->id,
                    ],
                );
            }

            $panel->update([
                'validated_at' => now(),
                'validated_by' => $validator->id,
            ]);

            $evenement->update([
                'competition_status' => 'resultats_publies',
                'results_published_at' => now(),
            ]);

            return $computed;
        });
    }

    private function resolveMention(float $note): string
    {
        return match (true) {
            $note >= 16 => 'tres_bien',
            $note >= 14 => 'bien',
            $note >= 12 => 'assez_bien',
            $note >= 10 => 'encouragement',
            default => 'aucune',
        };
    }
}
