<?php

namespace App\Console\Commands;

use App\Services\UpcomingEventReminderService;
use Illuminate\Console\Command;

class DispatchScheduledNotifications extends Command
{
    protected $signature = 'events:dispatch-notifications';

    protected $description = 'Envoie les notifications planifiees pour les evenements a venir.';

    public function handle(UpcomingEventReminderService $reminders): int
    {
        $count = $reminders->dispatchForAllUsers();

        $this->info("{$count} notification(s) planifiee(s) creee(s).");

        return self::SUCCESS;
    }
}
