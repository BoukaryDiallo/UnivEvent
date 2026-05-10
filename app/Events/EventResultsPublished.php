<?php

namespace App\Events;

use App\Models\Evenement;
use App\Models\User;
use App\Services\EventBroadcastPayloadFactory;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class EventResultsPublished implements ShouldBroadcastNow
{
    use Dispatchable;
    use SerializesModels;

    public function __construct(
        public Evenement $evenement,
        public User $validator,
    ) {
    }

    public function broadcastOn(): array
    {
        return [new PrivateChannel("evenement.{$this->evenement->id}")];
    }

    public function broadcastAs(): string
    {
        return 'event.results.published';
    }

    public function broadcastWith(): array
    {
        $payloads = app(EventBroadcastPayloadFactory::class);

        return [
            'event' => $payloads->eventStatus($this->evenement),
            'jury' => $payloads->juryPanel($this->evenement),
            'resultats' => $payloads->results($this->evenement),
            'validator' => [
                'id' => $this->validator->id,
                'name' => $this->validator->name,
            ],
        ];
    }
}
