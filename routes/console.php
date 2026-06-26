<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('seances:liberer-depasses')->everyThirtyMinutes()->runInBackground();
Schedule::command('diplomas:send-pickup-reminders')->dailyAt('08:00');
Schedule::command('events:dispatch-notifications')->everyTenMinutes();
