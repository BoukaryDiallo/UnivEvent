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
        $cover = $this->resource->preferredCoverMedia();
        
        $currentInscription = $user
            ? ($this->relationLoaded('inscriptions') 
                ? $this->inscriptions->firstWhere('utilisateur_id', $user->id)
                : \App\Models\InscriptionEvenement::where('evenement_id', $this->id)->where('utilisateur_id', $user->id)->first())
            : null;

        return [
            'id' => $this->id,
            'titre' => $this->titre,
            'description' => $this->description,
            'plain_description' => strip_tags($this->description),
            'type' => $this->type,
            'date_debut' => optional($this->date_debut)->toIso8601String(),
            'date_fin' => optional($this->date_fin)->toIso8601String(),
            'lieu' => $this->lieu,
            'lien_live' => $this->lien_live,
            'statut' => $this->statut,
            'visibilite' => $this->visibilite,
            'allow_organizer' => (bool) $this->allow_organizer,
            'allow_intervenant' => (bool) $this->allow_intervenant,
            'allow_jury' => (bool) $this->allow_jury,
            'allow_participant' => (bool) $this->allow_participant,
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
            'workflow_state_label' => match($this->validation_status === 'approved' && $this->statut === 'publie'
                ? 'published'
                : (($this->validation_status === 'rejected')
                    ? 'rejected'
                    : (($this->validation_status === 'pending' && $this->submitted_at) ? 'pending' : 'draft'))) {
                'published' => 'Publié',
                'rejected' => 'Refusé',
                'pending' => 'En attente de validation',
                default => 'Brouillon',
            },
            'participants_count' => $this->inscriptions_count ?? ($this->relationLoaded('inscriptions') ? $this->inscriptions->count() : $this->inscriptions()->count()),
            'comments_count' => $this->comments_count ?? ($this->relationLoaded('comments') ? $this->comments->count() : $this->comments()->count()),
            'activity_count' => $this->activities_count ?? ($this->relationLoaded('activities') ? $this->activities->count() : $this->activities()->count()),
            'likes_count' => $this->reactions()->where('type', 'like')->count(),
            'liked_by_me' => $user ? $this->reactions()->where('user_id', $user->id)->where('type', 'like')->exists() : false,
            'cover_url' => $cover ? asset('storage/' . $cover->chemin_fichier) : null,
            'roles' => $this->roles ? $this->roles->pluck('role')->values()->all() : [],
            'programmes' => $this->whenLoaded('programmes', fn () => $this->programmes->map(fn ($programme) => [
                'id' => $programme->id,
                'titre' => $programme->titre,
                'description' => $programme->description,
                'intervenant' => $programme->intervenant,
                'date_programme' => optional($programme->date_programme)->toIso8601String(),
                'heure_debut' => $programme->heure_debut,
                'heure_fin' => $programme->heure_fin,
                'salle' => $programme->salle,
                'type_section' => $programme->type_section,
                'ordre' => $programme->ordre,
            ])->all()),
            'medias' => $this->whenLoaded('medias', fn () => $this->medias->map(fn ($media) => [
                'id' => $media->id,
                'name' => $media->nom_fichier,
                'url' => asset('storage/' . $media->chemin_fichier),
                'type' => $media->type_fichier === 'image' ? 'image' : ($media->type_fichier === 'pdf' ? 'pdf' : 'autre'),
                'size' => $media->taille_fichier,
                'description' => $media->description,
                'is_cover' => (bool) $media->is_cover,
            ])->all()),
            'createur' => [
                'id' => $this->createur?->id,
                'name' => $this->createur?->name,
                'email' => $this->createur?->email,
                'role' => $this->createur?->role,
            ],
            'assignments' => $this->whenLoaded('assignments', fn () => $this->assignments->map(fn ($assignment) => [
                'id' => $assignment->id,
                'role' => $assignment->role,
                'user' => [
                    'id' => $assignment->user?->id,
                    'name' => $assignment->user?->name,
                    'email' => $assignment->user?->email,
                    'role' => $assignment->user?->role,
                ],
            ])->all()),
            'participation' => $currentInscription ? [
                'id' => $currentInscription->id,
                'statut' => $this->mapParticipationStatus($currentInscription->statut),
                'backend_statut' => $currentInscription->statut,
                'is_waitlist' => (bool) $currentInscription->is_waitlist,
                'waitlist_position' => $currentInscription->waitlist_position,
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
