<?php

namespace App\Http\Controllers;

use App\Models\Evenement;
use App\Models\EvenementComment;
use App\Models\EvenementModerationRestriction;
use App\Models\EventMessage;
use App\Models\User;
use App\Services\EventAuthorizationService;
use Illuminate\Http\Request;

class EventModerationController extends Controller
{
    public function __construct(private EventAuthorizationService $authorization) {}

    public function restrict(Request $request, Evenement $evenement, User $user)
    {
        abort_unless($this->authorization->canManageComments($evenement, $request->user()) || $this->authorization->canManageMessages($evenement, $request->user()), 403);

        $validated = $request->validate([
            'comments_blocked' => ['nullable', 'boolean'],
            'replies_blocked' => ['nullable', 'boolean'],
            'messages_blocked' => ['nullable', 'boolean'],
            'muted' => ['nullable', 'boolean'],
            'reason' => ['nullable', 'string', 'max:1000'],
            'expires_at' => ['nullable', 'date'],
        ]);

        EvenementModerationRestriction::updateOrCreate(
            [
                'evenement_id' => $evenement->id,
                'user_id' => $user->id,
                'status' => 'active',
            ],
            [
                'created_by' => $request->user()->id,
                'comments_blocked' => (bool) ($validated['comments_blocked'] ?? false),
                'replies_blocked' => (bool) ($validated['replies_blocked'] ?? false),
                'messages_blocked' => (bool) ($validated['messages_blocked'] ?? false),
                'muted' => (bool) ($validated['muted'] ?? false),
                'reason' => $validated['reason'] ?? null,
                'expires_at' => $validated['expires_at'] ?? null,
                'lifted_at' => null,
                'lifted_by' => null,
            ],
        );

        return back();
    }

    public function lift(Request $request, EvenementModerationRestriction $restriction)
    {
        $evenement = $restriction->evenement;
        abort_unless($this->authorization->canManageComments($evenement, $request->user()) || $this->authorization->canManageMessages($evenement, $request->user()), 403);

        $restriction->update([
            'status' => 'lifted',
            'lifted_at' => now(),
            'lifted_by' => $request->user()->id,
        ]);

        return back();
    }

    public function moderateComment(Request $request, EvenementComment $commentaire)
    {
        $evenement = $commentaire->evenement;
        abort_unless($this->authorization->canManageComments($evenement, $request->user()), 403);

        $validated = $request->validate([
            'status' => ['required', 'in:visible,masque,signale,restreint'],
            'reason' => ['nullable', 'string', 'max:1000'],
        ]);

        $commentaire->update([
            'status' => $validated['status'],
            'moderated_by' => $request->user()->id,
            'moderation_reason' => $validated['reason'] ?? null,
            'moderated_at' => now(),
        ]);

        return back();
    }

    public function moderateMessage(Request $request, EventMessage $message)
    {
        $evenement = $message->evenement;
        abort_unless($this->authorization->canManageMessages($evenement, $request->user()), 403);

        $validated = $request->validate([
            'status' => ['required', 'in:ouvert,en_attente,resolu,ferme,masque,signale,restreint'],
            'reason' => ['nullable', 'string', 'max:1000'],
            'is_pinned' => ['nullable', 'boolean'],
        ]);

        $message->update([
            'status' => $validated['status'],
            'is_pinned' => (bool) ($validated['is_pinned'] ?? $message->is_pinned),
            'moderated_by' => $request->user()->id,
            'moderation_reason' => $validated['reason'] ?? null,
            'moderated_at' => now(),
        ]);

        return back();
    }
}
