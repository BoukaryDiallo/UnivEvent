<?php

namespace App\Console\Commands;

use App\Models\PickupAppointment;
use App\Notifications\Diplomas\PickupReminder;
use Illuminate\Console\Command;

class SendPickupReminders extends Command
{
    protected $signature = 'diplomas:send-pickup-reminders';

    protected $description = 'Send a J-1 reminder to students with a pickup appointment tomorrow';

    public function handle(): int
    {
        $start = now()->addDay()->startOfDay();
        $end = now()->addDay()->endOfDay();

        $appointments = PickupAppointment::query()
            ->with(['diplomaRequest.owner', 'pickupSlot'])
            ->whereNull('delivered_at')
            ->whereHas('pickupSlot', fn ($q) => $q->whereBetween('starts_at', [$start, $end]))
            ->get();

        foreach ($appointments as $appointment) {
            $appointment->diplomaRequest->owner->notify(new PickupReminder($appointment));
        }

        $this->info("Rappels envoyés : {$appointments->count()}");

        return self::SUCCESS;
    }
}
