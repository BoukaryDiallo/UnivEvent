<?php

namespace App\Services;

use App\Models\EventNotification;
use App\Models\Evenement;
use App\Models\JuryPanel;
use App\Models\Resultat;
use Illuminate\Support\Facades\Storage;

class EventBroadcastPayloadFactory
{
    public function eventStatus(Evenement $evenement): array
    {
        return [
            'id' => $evenement->id,
            'statut' => $evenement->statut,
            'competition_status' => $evenement->competition_status,
            'results_published_at' => optional($evenement->results_published_at)->toIso8601String(),
        ];
    }

    public function juryPanel(Evenement $evenement): array
    {
        $panel = $evenement->relationLoaded('juryPanel')
            ? $evenement->juryPanel
            : $evenement->juryPanel()->with(['criteria', 'deliberations.participant:id,name', 'deliberations.requester:id,name', 'deliberations.resolver:id,name'])->first();

        if (! $panel) {
            return [];
        }

        return $this->serializeJuryPanel($evenement, $panel);
    }

    public function results(Evenement $evenement): array
    {
        $evenement->loadMissing(['resultats.utilisateur:id,name,email,role', 'certificats']);

        return $evenement->resultats->map(function (Resultat $resultat) use ($evenement) {
            $certificate = $evenement->certificats->firstWhere('utilisateur_id', $resultat->utilisateur_id);

            return [
                'id' => $resultat->id,
                'note' => (float) $resultat->note,
                'classement' => $resultat->classement,
                'admission' => $resultat->admission,
                'mention' => $resultat->mention,
                'criteria_breakdown' => $resultat->criteria_breakdown ?? [],
                'certificate_url' => $certificate?->fichier ? Storage::url($certificate->fichier) : null,
                'user' => [
                    'id' => $resultat->utilisateur?->id,
                    'name' => $resultat->utilisateur?->name,
                    'email' => $resultat->utilisateur?->email,
                    'role' => $resultat->utilisateur?->role,
                ],
            ];
        })->values()->all();
    }

    public function notification(EventNotification $notification): array
    {
        return [
            'id' => $notification->id,
            'type' => $notification->type,
            'title' => $notification->title,
            'message' => $notification->message,
            'event_id' => $notification->evenement_id,
            'read_at' => optional($notification->read_at)->toIso8601String(),
            'created_at' => optional($notification->created_at)->toIso8601String(),
        ];
    }

    private function serializeJuryPanel(Evenement $evenement, JuryPanel $panel): array
    {
        $panel->loadMissing(['criteria', 'deliberations.participant:id,name', 'deliberations.requester:id,name', 'deliberations.resolver:id,name']);
        $computed = app(JuryWorkflowService::class)->computeResults($evenement);

        return [
            'id' => $panel->id,
            'president_user_id' => $panel->president_user_id,
            'admission_average' => $panel->admission_average !== null ? (float) $panel->admission_average : null,
            'seats_count' => $panel->seats_count,
            'ranking_mode' => $panel->ranking_mode,
            'tie_break_rule' => $panel->tie_break_rule,
            'criteria_locked' => (bool) $panel->criteria_locked,
            'scoring_opened_at' => optional($panel->scoring_opened_at)->toIso8601String(),
            'scoring_closed_at' => optional($panel->scoring_closed_at)->toIso8601String(),
            'validated_at' => optional($panel->validated_at)->toIso8601String(),
            'criteria' => $panel->criteria->map(fn ($criterion) => [
                'id' => $criterion->id,
                'nom' => $criterion->nom,
                'description' => $criterion->description,
                'bareme' => $criterion->bareme !== null ? (float) $criterion->bareme : null,
                'coefficient' => $criterion->coefficient !== null ? (float) $criterion->coefficient : null,
                'ordre' => $criterion->ordre,
                'actif' => (bool) $criterion->actif,
            ])->values()->all(),
            'deliberations' => $panel->deliberations->map(fn ($item) => [
                'id' => $item->id,
                'participant_id' => $item->participant_id,
                'participant_name' => $item->participant?->name,
                'requested_by' => $item->requester?->id,
                'requested_by_name' => $item->requester?->name,
                'status' => $item->status,
                'reason' => $item->reason,
                'resolved_at' => optional($item->resolved_at)->toIso8601String(),
                'resolved_by_name' => $item->resolver?->name,
            ])->values()->all(),
            'computed_results' => $computed->map(fn ($row) => [
                'participant_id' => $row['participant']->id,
                'participant_name' => $row['participant']->name,
                'note' => $row['note'],
                'classement' => $row['classement'],
                'admission' => $row['admission'],
                'mention' => $row['mention'],
                'criteria_breakdown' => $row['criteria_breakdown'],
            ])->values()->all(),
        ];
    }
}
