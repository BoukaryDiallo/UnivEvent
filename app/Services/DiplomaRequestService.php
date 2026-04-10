<?php

namespace App\Services;

use App\Enums\DiplomaRequestStatus;
use App\Models\DiplomaRequest;
use App\Models\DiplomaRequestEvent;
use App\Models\User;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DiplomaRequestService
{
    public function createDraft(User $owner, array $attributes): DiplomaRequest
    {
        return DB::transaction(function () use ($owner, $attributes) {
            $request = $this->persistWithTrackingCode($owner, $attributes);

            $this->recordEvent($request, null, DiplomaRequestStatus::Draft, $owner, 'Brouillon créé');

            return $request;
        });
    }

    public function recordEvent(
        DiplomaRequest $request,
        ?DiplomaRequestStatus $from,
        DiplomaRequestStatus $to,
        ?User $actor = null,
        ?string $note = null,
    ): DiplomaRequestEvent {
        return $request->events()->create([
            'from_status' => $from,
            'to_status' => $to,
            'actor_id' => $actor?->id,
            'note' => $note,
            'occurred_at' => now(),
        ]);
    }

    private function persistWithTrackingCode(User $owner, array $attributes): DiplomaRequest
    {
        $payload = [
            'owner_id' => $owner->id,
            'diploma_type' => $attributes['diploma_type'],
            'academic_year' => $attributes['academic_year'],
            'status' => DiplomaRequestStatus::Draft,
        ];

        for ($attempt = 0; $attempt < 5; $attempt++) {
            $payload['tracking_code'] = $this->generateTrackingCode();

            try {
                return DiplomaRequest::create($payload);
            } catch (UniqueConstraintViolationException) {
                continue;
            }
        }

        throw new \RuntimeException('Impossible de générer un code de suivi unique.');
    }

    private function generateTrackingCode(): string
    {
        return sprintf('DIP-%s-%s', now()->format('Y'), Str::upper(Str::random(8)));
    }
}
