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
        // Récupération de la couverture
        $cover = $this->relationLoaded('medias') ? $this->medias->firstWhere('type', 'image') : null;
        
        $data = [
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
            'participants_count' => $this->inscriptions_count ?? ($this->relationLoaded('inscriptions') ? $this->inscriptions->count() : 0),
            'comments_count' => $this->comments_count ?? ($this->relationLoaded('comments') ? $this->comments->count() : 0),
            'activity_count' => $this->activities_count ?? ($this->relationLoaded('activities') ? $this->activities->count() : 0),
            'cover_url' => $cover ? Storage::url($cover->chemin_fichier) : null,
            'roles' => $this->relationLoaded('roles') ? $this->roles->pluck('role')->values() : [],
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

        // Données détaillées (pour la page Show)
        if ($this->relationLoaded('programmes')) {
            $data['programmes'] = $this->programmes->sortBy('ordre')->values();
        }

        if ($this->relationLoaded('activities')) {
            $data['activities'] = $this->activities->map(fn($a) => [
                'id' => $a->id,
                'type' => $a->type,
                'label' => $a->label,
                'description' => $a->description,
                'created_at' => $a->created_at->toIso8601String(),
                'user' => ['name' => $a->user?->name, 'role' => $a->user?->role]
            ]);
        }

        if ($this->relationLoaded('assignments')) {
            $data['team'] = $this->serializeAssignments();
        }

        return $data;
    }

    private function serializeAssignments(): array
    {
        $roles = ['organisateur', 'participant', 'intervenant', 'jury'];
        $grouped = [];
        foreach ($roles as $role) {
            $grouped[$role] = $this->assignments->where('role', $role)->map(fn($as) => [
                'user_id' => $as->user_id,
                'name' => $as->user?->name,
                'permissions' => [
                    'can_manage_messages' => (bool)$as->can_manage_messages,
                    'can_manage_comments' => (bool)$as->can_manage_comments,
                    'can_edit_event' => (bool)$as->can_edit_event,
                    'can_manage_results' => (bool)$as->can_manage_results,
                ]
            ])->values();
        }
        return $grouped;
    }
}
