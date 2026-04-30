<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class EvenementResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $user = $request->user();
        $cover = $this->relationLoaded('medias') ? $this->medias->firstWhere('type', 'image') : null;
        $currentInscription = $user && $this->relationLoaded('inscriptions')
            ? $this->inscriptions->firstWhere('utilisateur_id', $user->id)
            : null;

        return [
            'id' => $this->id,
            'titre' => $this->titre,
            'description' => $this->description,
            'type' => $this->type,
            'date_debut' => optional($this->date_debut)->toIso8601String(),
            'date_fin' => optional($this->date_fin)->toIso8601String(),
            'lieu' => $this->lieu,
            'lien_live' => $this->lien_live,
            'statut' => $this->statut,
            'visibilite' => $this->visibilite,
            'public_cible' => $this->public_cible,
            'inscription_requise' => (bool) $this->inscription_requise,
            'capacite_max' => $this->capacite_max,
            'checkin_active' => (bool) $this->checkin_active,
            'comments_enabled' => (bool) $this->comments_enabled,
            'comment_replies_enabled' => (bool) $this->comment_replies_enabled,
            'comment_reactions_enabled' => (bool) $this->comment_reactions_enabled,
            'comment_policy' => $this->comment_policy,
            'messages_enabled' => (bool) $this->messages_enabled,
            'evenement_certifie' => (bool) $this->evenement_certifie,
            'certificate_template_schema' => $this->certificate_template_schema,
            'certificate_template_version' => $this->certificate_template_version,
            'allow_participant_result_tracking' => (bool) $this->allow_participant_result_tracking,
            'competition_status' => $this->competition_status,
            'validation_status' => $this->validation_status,
            'workflow_state' => $this->validation_status === 'approved' && $this->statut === 'publie'
                ? 'published'
                : (($this->validation_status === 'rejected')
                    ? 'rejected'
                    : (($this->validation_status === 'pending' && $this->submitted_at) ? 'pending' : 'draft')),
            'participants_count' => $this->inscriptions_count ?? ($this->relationLoaded('inscriptions') ? $this->inscriptions->count() : 0),
            'comments_count' => $this->comments_count ?? ($this->relationLoaded('comments') ? $this->comments->count() : 0),
            'activity_count' => $this->activities_count ?? ($this->relationLoaded('activities') ? $this->activities->count() : 0),
            'cover_url' => $cover ? Storage::url($cover->chemin_fichier) : null,
            'roles' => $this->whenLoaded('roles', fn () => $this->roles->pluck('role')->values()->all()),
            'createur' => $this->whenLoaded('createur', fn () => [
                'id' => $this->createur?->id,
                'name' => $this->createur?->name,
                'email' => $this->createur?->email,
                'role' => $this->createur?->role,
            ]),
            'assignments' => $this->whenLoaded('assignments', fn () => $this->assignments->map(fn ($assignment) => [
                'id' => $assignment->id,
                'role' => $assignment->role,
                'user' => [
                    'id' => $assignment->user->id,
                    'name' => $assignment->user->name,
                    'email' => $assignment->user->email,
                    'role' => $assignment->user->role,
                ],
            ])->all()),
            'participation' => $currentInscription ? [
                'id' => $currentInscription->id,
                'statut' => $this->mapParticipationStatus($currentInscription->statut),
                'backend_statut' => $currentInscription->statut,
            ] : null,
            'current_inscription_id' => $currentInscription?->id,
            'created_at' => optional($this->created_at)->toIso8601String(),
            'updated_at' => optional($this->updated_at)->toIso8601String(),
        ];
    }

    private function mapParticipationStatus(string $status): string
    {
        return match ($status) {
            'accepte' => 'participe',
            'en_attente' => 'interesse',
            default => 'refuse',
        };
    }
}
