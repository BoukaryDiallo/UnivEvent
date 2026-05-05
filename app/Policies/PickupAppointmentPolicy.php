<?php

namespace App\Policies;

use App\Enums\DiplomaRequestStatus;
use App\Models\PickupAppointment;
use App\Models\User;

class PickupAppointmentPolicy
{
    public function cancel(User $user, PickupAppointment $appointment): bool
    {
        return $user->id === $appointment->diplomaRequest->owner_id
            && $appointment->diplomaRequest->status === DiplomaRequestStatus::AppointmentScheduled
            && $appointment->pickupSlot->starts_at->isFuture();
    }
}
