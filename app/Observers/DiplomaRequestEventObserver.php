<?php

namespace App\Observers;

use App\Enums\DiplomaRequestStatus;
use App\Models\DiplomaRequestEvent;
use App\Notifications\Diplomas\DiplomaRequestStatusChanged;

class DiplomaRequestEventObserver
{
    public function created(DiplomaRequestEvent $event): void
    {
        if (! $this->shouldNotifyOwner($event)) {
            return;
        }

        $event->diplomaRequest->owner->notify(
            new DiplomaRequestStatusChanged($event->diplomaRequest, $event->to_status),
        );
    }

    private function shouldNotifyOwner(DiplomaRequestEvent $event): bool
    {
        return match (true) {
            $event->to_status === DiplomaRequestStatus::Submitted,
            $event->to_status === DiplomaRequestStatus::DocumentsValidated,
            $event->to_status === DiplomaRequestStatus::AppointmentScheduled,
            $event->to_status === DiplomaRequestStatus::Delivered,
            $event->to_status === DiplomaRequestStatus::Rejected => true,

            $event->to_status === DiplomaRequestStatus::ReadyForPickup
                && $event->from_status === DiplomaRequestStatus::DocumentsValidated => true,

            default => false,
        };
    }
}
