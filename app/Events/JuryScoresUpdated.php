<?php

namespace App\Events;

use App\Models\Evenement;
use App\Models\User;
use App\Services\EventBroadcastPayloadFactory;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class JuryScoresUpdated implements ShouldBroadcastNow
{
    use Dispatchable;
    use SerializesModels;

    public function __construct(
        public Evenement $evenement,
        public User $juryUser,
        public int $participantId,
        public bool $submitted,
    ) {}

    public function broadcastOn(): array
    {
        return [new PrivateChannel("evenement.{$this->evenement->id}")];
    }

    public function broadcastAs(): string
    {
        return 'jury.scores.updated';
    }

    public function broadcastWith(): array
    {
        $payloads = app(EventBroadcastPayloadFactory::class);

        return [
            'event' => $payloads->eventStatus($this->evenement),
            'jury' => $payloads->juryPanel($this->evenement),
            'participant_id' => $this->participantId,
            'jury_user' => [
                'id' => $this->juryUser->id,
                'name' => $this->juryUser->name,
            ],
            'submitted' => $this->submitted,
        ];
    }
}
