<?php

namespace App\Events;

use App\Models\Evenement;
use App\Models\User;
use App\Services\EventBroadcastPayloadFactory;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class EventStatusUpdated implements ShouldBroadcastNow
{
    use Dispatchable;
    use SerializesModels;

    public function __construct(
        public Evenement $evenement,
        public ?User $actor = null,
        public ?string $message = null,
    ) {
    }

    public function broadcastOn(): array
    {
        return [new PrivateChannel("evenement.{$this->evenement->id}")];
    }

    public function broadcastAs(): string
    {
        return 'event.status.updated';
    }

    public function broadcastWith(): array
    {
        $payloads = app(EventBroadcastPayloadFactory::class);

        return [
            'event' => $payloads->eventStatus($this->evenement),
            'jury' => $payloads->juryPanel($this->evenement),
            'actor' => $this->actor ? [
                'id' => $this->actor->id,
                'name' => $this->actor->name,
            ] : null,
            'message' => $this->message,
        ];
    }
}
