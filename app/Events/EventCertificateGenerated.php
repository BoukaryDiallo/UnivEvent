<?php

namespace App\Events;

use App\Models\Certificat;
use App\Models\Evenement;
use App\Services\EventBroadcastPayloadFactory;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;

class EventCertificateGenerated implements ShouldBroadcastNow
{
    use Dispatchable;
    use SerializesModels;

    public function __construct(
        public Evenement $evenement,
        public Certificat $certificat,
    ) {
    }

    public function broadcastOn(): array
    {
        return [new PrivateChannel("evenement.{$this->evenement->id}")];
    }

    public function broadcastAs(): string
    {
        return 'certificate.generated';
    }

    public function broadcastWith(): array
    {
        return [
            'event' => app(EventBroadcastPayloadFactory::class)->eventStatus($this->evenement),
            'certificat' => [
                'id' => $this->certificat->id,
                'user_id' => $this->certificat->utilisateur_id,
                'code' => $this->certificat->code_certificat,
                'url' => $this->certificat->fichier ? Storage::url($this->certificat->fichier) : null,
                'published_at' => optional($this->certificat->published_at)->toIso8601String(),
            ],
        ];
    }
}
