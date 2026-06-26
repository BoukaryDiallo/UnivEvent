<?php

namespace App\Http\Controllers;

use App\Models\Evenement;
use App\Models\EventMessage;
use App\Services\EventAuthorizationService;
use App\Services\EventModerationService;
use App\Services\EventNotificationService;
use Illuminate\Http\Request;

class EventMessageController extends Controller
{
    public function __construct(
        private EventNotificationService $notifications,
        private EventAuthorizationService $authorization,
        private EventModerationService $moderation,
    ) {}

    public function store(Request $request, Evenement $evenement)
    {
        return $this->persistMessage($request, $evenement);
    }

    public function reply(Request $request, Evenement $evenement, EventMessage $message)
    {
        abort_unless($message->evenement_id === $evenement->id, 404);

        return $this->persistMessage($request, $evenement, $message);
    }

    private function persistMessage(Request $request, Evenement $evenement, ?EventMessage $parent = null)
    {
        $user = $request->user();
        abort_unless($user, 403);
        abort_unless($this->authorization->canView($evenement, $user), 403);
        abort_unless($evenement->messages_enabled, 403, 'Messagerie indisponible');
        abort_if($this->moderation->isBlockedForMessages($evenement, $user), 403, 'Messagerie restreinte');

        $validated = $request->validate([
            'contenu' => ['required', 'string', 'max:4000'],
            'type' => ['nullable', 'in:question,reponse_organisateur,annonce,support,moderation'],
        ]);

        $defaultType = $this->authorization->canManageMessages($evenement, $user) ? 'reponse_organisateur' : 'question';
        $type = $validated['type'] ?? $defaultType;

        $message = EventMessage::create([
            'evenement_id' => $evenement->id,
            'user_id' => $user->id,
            'type' => $type,
            'contenu' => $validated['contenu'],
            'parent_id' => $parent?->id,
            'status' => $this->authorization->canManageMessages($evenement, $user) ? 'resolu' : 'ouvert',
        ]);

        $evenement->activities()->create([
            'user_id' => $user->id,
            'type' => 'message_envoye',
            'label' => 'Message envoye',
            'description' => (string) str($validated['contenu'])->limit(120),
            'meta' => [
                'message_id' => $message->id,
                'type' => $message->type,
            ],
        ]);

        foreach ($evenement->assignments()->where('can_manage_messages', true)->with('user')->get() as $assignment) {
            if ($assignment->user && $assignment->user->id !== $user->id) {
                $this->notifications->notify(
                    $assignment->user,
                    'message_evenement',
                    'Nouveau message evenement',
                    "{$user->name} a publie un message dans {$evenement->titre}.",
                    $evenement->id,
                    ['message_id' => $message->id],
                );
            }
        }

        if ($evenement->createur && $evenement->createur->id !== $user->id) {
            $this->notifications->notify(
                $evenement->createur,
                'message_evenement',
                'Nouveau message evenement',
                "{$user->name} a publie un message dans {$evenement->titre}.",
                $evenement->id,
                ['message_id' => $message->id],
            );
        }

        return back();
    }
}
