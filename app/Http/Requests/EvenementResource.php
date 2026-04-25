<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class EvenementResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user();
        $cover = $this->medias->firstWhere('type', 'image');
        
        return [
            'id' => $this->id,
            'titre' => $this->titre,
            'description' => $this->description,
            'type' => $this->type,
            'date_debut' => optional($this->date_debut)->toIso8601String(),
            'date_fin' => optional($this->date_fin)->toIso8601String(),
            'lieu' => $this->lieu,
            'statut' => $this->statut,
            'visibilite' => $this->visibilite,
            'public_cible' => $this->public_cible,
            'capacite_max' => $this->capacite_max,
            'participants_count' => $this->inscriptions_count ?? $this->inscriptions->count(),
            'comments_count' => $this->comments_count ?? $this->comments->count(),
            'activity_count' => $this->activities_count ?? $this->activities->count(),
            'cover_url' => $cover ? Storage::url($cover->chemin_fichier) : null,
            'roles' => $this->roles->pluck('role')->values(),
            'createur' => [
                'id' => $this->createur?->id,
                'name' => $this->createur?->name,
                'role' => $this->createur?->role,
            ],
            'participation' => $this->when($user, function() use ($user) {
                $inscription = $this->inscriptions->firstWhere('utilisateur_id', $user->id);
                return $inscription ? [
                    'id' => $inscription->id,
                    'statut' => $inscription->statut === 'accepte' ? 'participe' : 'interesse',
                    'backend_statut' => $inscription->statut,
                ] : null;
            }),
        ];
    }
}