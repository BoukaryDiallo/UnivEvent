<?php

namespace App\Services;

use App\Models\Evenement;
use App\Models\User;
use App\Services\EventAuthorizationService;

class ParticipantService
{
    public function __construct(
        private EventAuthorizationService $authorization,
        private MediaService $mediaService,
        private CertificateService $certificateService,
    ) {
    }

    public function buildParticipantEventPayload(Evenement $evenement, User $user): array
    {
        $currentInscription = $evenement->inscriptions->firstWhere('utilisateur_id', $user->id);
        $canViewScores = $evenement->competition_status === 'resultats_publies' && $currentInscription?->statut === 'accepte';

        $latestCertificate = $this->certificateService->latestCertificateForParticipant($evenement, $user);

        return [
            'id' => $evenement->id,
            'titre' => $evenement->titre,
            'description' => $evenement->description,
            'type' => $evenement->type,
            'date_debut' => optional($evenement->date_debut)->toIso8601String(),
            'date_fin' => optional($evenement->date_fin)->toIso8601String(),
            'lieu' => $evenement->lieu,
            'lien_live' => $evenement->lien_live,
            'statut' => $evenement->statut,
            'visibilite' => $evenement->visibilite,
            'public_cible' => $evenement->public_cible,
            'inscription_requise' => $evenement->inscription_requise,
            'capacite_max' => $evenement->capacite_max,
            'checkin_active' => $evenement->checkin_active,
            'comments_enabled' => $evenement->comments_enabled,
            'comment_replies_enabled' => $evenement->comment_replies_enabled,
            'comment_reactions_enabled' => $evenement->comment_reactions_enabled,
            'messages_enabled' => $evenement->messages_enabled,
            'evenement_certifie' => $evenement->evenement_certifie,
            'competition_status' => $evenement->competition_status,
            'participants_count' => $evenement->inscriptions->count(),
            'comments_count' => $evenement->comments->count(),
            'activity_count' => $evenement->activities->count(),
            'roles' => $evenement->roles->pluck('role')->values(),
            'cover_url' => $evenement->medias->firstWhere('type', 'image') ? $this->mediaService->resolvePublicUrl($evenement->medias->firstWhere('type', 'image')) : null,
            'createur' => [
                'id' => $evenement->createur?->id,
                'name' => $evenement->createur?->name,
                'email' => $evenement->createur?->email,
                'role' => $evenement->createur?->role,
            ],
            'current_inscription' => $currentInscription ? [
                'id' => $currentInscription->id,
                'statut' => $currentInscription->statut,
                'backend_statut' => $currentInscription->statut,
            ] : null,
            'participants' => $evenement->inscriptions->map(fn ($inscription) => [
                'id' => $inscription->id,
                'statut' => $inscription->statut,
                'backend_statut' => $inscription->statut,
                'user_id' => $inscription->utilisateur_id,
                'user' => [
                    'id' => $inscription->utilisateur?->id,
                    'name' => $inscription->utilisateur?->name,
                    'email' => $inscription->utilisateur?->email,
                    'role' => $inscription->utilisateur?->role,
                ],
            ])->values()->toArray(),
            'programmes' => $evenement->programmes->map(fn ($programme) => [
                'id' => $programme->id,
                'titre' => $programme->titre,
                'description' => $programme->description,
                'intervenant' => $programme->intervenant,
                'date_programme' => $this->normalizeProgrammeDate($programme->date_programme),
                'heure_debut' => $programme->heure_debut,
                'heure_fin' => $programme->heure_fin,
                'salle' => $programme->salle,
                'type_section' => $programme->type_section,
                'ordre' => $programme->ordre,
            ])->sortBy('ordre')->values()->toArray(),
            'medias' => $evenement->medias->map(fn ($media) => [
                'id' => $media->id,
                'type' => $media->type,
                'name' => $media->nom_original,
                'size' => $media->taille,
                'url' => $this->mediaService->resolvePublicUrl($media),
            ])->values()->toArray(),
            'comments' => $evenement->comments->map(fn ($comment) => [
                'id' => $comment->id,
                'contenu' => $comment->contenu,
                'created_at' => optional($comment->created_at)->toISOString(),
                'likes_count' => $comment->reactions?->count() ?? 0,
                'liked_by_me' => false,
                'user' => [
                    'id' => $comment->user?->id,
                    'name' => $comment->user?->name,
                    'email' => $comment->user?->email,
                    'role' => $comment->user?->role,
                ],
                'replies' => $comment->replies->map(fn ($reply) => [
                    'id' => $reply->id,
                    'contenu' => $reply->contenu,
                    'created_at' => optional($reply->created_at)->toISOString(),
                    'likes_count' => $reply->reactions?->count() ?? 0,
                    'liked_by_me' => false,
                    'user' => [
                        'id' => $reply->user?->id,
                        'name' => $reply->user?->name,
                        'email' => $reply->user?->email,
                        'role' => $reply->user?->role,
                    ],
                ])->values()->toArray(),
            ])->values()->toArray(),
            'messages' => $evenement->messages->map(fn ($message) => [
                'id' => $message->id,
                'type' => $message->type,
                'contenu' => $message->contenu,
                'status' => $message->status,
                'is_pinned' => $message->is_pinned,
                'created_at' => optional($message->created_at)->toISOString(),
                'user' => [
                    'id' => $message->user?->id,
                    'name' => $message->user?->name,
                    'email' => $message->user?->email,
                    'role' => $message->user?->role,
                ],
                'replies' => $message->replies->map(fn ($reply) => [
                    'id' => $reply->id,
                    'type' => $reply->type,
                    'contenu' => $reply->contenu,
                    'status' => $reply->status,
                    'created_at' => optional($reply->created_at)->toISOString(),
                    'user' => [
                        'id' => $reply->user?->id,
                        'name' => $reply->user?->name,
                        'email' => $reply->user?->email,
                        'role' => $reply->user?->role,
                    ],
                ])->values()->toArray(),
            ])->values()->toArray(),
            'resultats' => $canViewScores
                ? $evenement->resultats->map(fn ($resultat) => [
                    'id' => $resultat->id,
                    'note' => $resultat->note,
                    'classement' => $resultat->classement,
                    'mention' => $resultat->mention,
                    'criteria_breakdown' => $resultat->payload['criteria_breakdown'] ?? null,
                    'user' => [
                        'id' => $resultat->utilisateur?->id,
                        'name' => $resultat->utilisateur?->name,
                        'email' => $resultat->utilisateur?->email,
                        'role' => $resultat->utilisateur?->role,
                    ],
                ])->values()->toArray()
                : [],
            'my_result' => $evenement->resultats->firstWhere('utilisateur_id', $user->id) ? [
                'id' => $evenement->resultats->firstWhere('utilisateur_id', $user->id)->id,
                'note' => $evenement->resultats->firstWhere('utilisateur_id', $user->id)->note,
                'classement' => $evenement->resultats->firstWhere('utilisateur_id', $user->id)->classement,
                'mention' => $evenement->resultats->firstWhere('utilisateur_id', $user->id)->mention,
                'criteria_breakdown' => $evenement->resultats->firstWhere('utilisateur_id', $user->id)->payload['criteria_breakdown'] ?? null,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ],
            ] : null,
            'certificate' => $latestCertificate ? [
                'id' => $latestCertificate->id,
                'url' => $this->certificateService->certificateUrl($latestCertificate),
                'statut' => $latestCertificate->statut,
            ] : null,
            'notifications' => [
                'pending_comments' => 0,
                'pending_messages' => 0,
            ],
        ];
    }

    private function normalizeProgrammeDate(mixed $value): ?string
    {
        if ($value instanceof \DateTimeInterface) {
            return $value->format('Y-m-d');
        }

        if (is_string($value) && $value !== '') {
            return substr($value, 0, 10);
        }

        return null;
    }
}
