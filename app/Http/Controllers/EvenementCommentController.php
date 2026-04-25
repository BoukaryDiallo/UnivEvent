<?php

namespace App\Http\Controllers;

use App\Models\Evenement;
use App\Models\EvenementComment;
use App\Models\EvenementCommentReaction;
use App\Services\EventAuthorizationService;
use App\Services\EventModerationService;
use App\Services\EventNotificationService;
use Illuminate\Http\Request;

class EvenementCommentController extends Controller
{
    public function __construct(
        private EventNotificationService $notifications,
        private EventAuthorizationService $authorization,
        private EventModerationService $moderation,
    ) {
    }

    public function store(Request $request, Evenement $evenement)
    {
        $user = $request->user();
        abort_unless($user, 403);
        abort_unless($this->authorization->canView($evenement, $user), 403);
        abort_unless($evenement->comments_enabled, 403, 'Commentaires indisponibles');

        $validated = $request->validate([
            'contenu' => ['required', 'string', 'max:3000'],
            'parent_id' => ['nullable', 'exists:evenement_comments,id'],
        ]);

        $isReply = filled($validated['parent_id'] ?? null);
        abort_if($isReply && ! $evenement->comment_replies_enabled, 403, 'Reponses indisponibles');
        abort_if(
            $isReply
                ? $this->moderation->isBlockedForReplies($evenement, $user)
                : $this->moderation->isBlockedForComments($evenement, $user),
            403,
            'Publication restreinte',
        );
        abort_unless($this->canPostComment($evenement, $user), 403, 'Commentaire non autorise');

        $comment = EvenementComment::create([
            'evenement_id' => $evenement->id,
            'user_id' => $user->id,
            'parent_id' => $validated['parent_id'] ?? null,
            'contenu' => $validated['contenu'],
        ]);

        $evenement->activities()->create([
            'user_id' => $user->id,
            'type' => 'commentaire_ajoute',
            'label' => 'Commentaire ajoute',
            'description' => (string) str($validated['contenu'])->limit(140),
            'meta' => [
                'comment_id' => $comment->id,
                'parent_id' => $comment->parent_id,
            ],
        ]);

        foreach ($evenement->assignments()->where('can_manage_comments', true)->with('user')->get() as $assignment) {
            if ($assignment->user && $assignment->user->id !== $user->id) {
                $this->notifications->notify(
                    $assignment->user,
                    'commentaire_evenement',
                    'Nouveau commentaire',
                    "{$user->name} a commente {$evenement->titre}.",
                    $evenement->id,
                    ['comment_id' => $comment->id],
                );
            }
        }

        if ($evenement->createur && $evenement->createur->id !== $user->id) {
            $this->notifications->notify(
                $evenement->createur,
                'commentaire_evenement',
                'Nouveau commentaire',
                "{$user->name} a commente {$evenement->titre}.",
                $evenement->id,
                ['comment_id' => $comment->id],
            );
        }

        return back();
    }

    public function destroy(Request $request, EvenementComment $commentaire)
    {
        $user = $request->user();
        abort_unless($user, 403);

        $evenement = $commentaire->evenement;
        $canManage = $this->authorization->canManageComments($evenement, $user);

        abort_unless($canManage || $commentaire->user_id === $user->id, 403);

        $commentaire->delete();

        return back();
    }

    public function toggleReaction(Request $request, EvenementComment $commentaire)
    {
        $user = $request->user();
        abort_unless($user, 403);
        abort_unless($commentaire->evenement?->comment_reactions_enabled, 403);
        abort_unless($this->authorization->canView($commentaire->evenement, $user), 403);

        $validated = $request->validate([
            'type' => ['nullable', 'string', 'max:50'],
        ]);

        $type = $validated['type'] ?? 'like';

        $reaction = EvenementCommentReaction::query()->where([
            'comment_id' => $commentaire->id,
            'user_id' => $user->id,
            'type' => $type,
        ])->first();

        if ($reaction) {
            $reaction->delete();

            return back();
        }

        EvenementCommentReaction::create([
            'comment_id' => $commentaire->id,
            'user_id' => $user->id,
            'type' => $type,
        ]);

        $commentaire->evenement?->activities()->create([
            'user_id' => $user->id,
            'type' => 'reaction_ajoutee',
            'label' => 'Reaction ajoutee',
            'description' => 'Un participant a aime un commentaire.',
            'meta' => [
                'comment_id' => $commentaire->id,
                'reaction' => $type,
            ],
        ]);

        return back();
    }

    private function canPostComment(Evenement $evenement, $user): bool
    {
        if ($this->authorization->canManageComments($evenement, $user) || $this->authorization->isJuryMember($evenement, $user)) {
            return true;
        }

        return match ($evenement->comment_policy) {
            'readonly' => false,
            'organizers_jury_only' => false,
            'all_registered' => $evenement->inscriptions()->where('utilisateur_id', $user->id)->exists(),
            default => $evenement->inscriptions()->where('utilisateur_id', $user->id)->where('statut', 'accepte')->exists(),
        };
    }
}
