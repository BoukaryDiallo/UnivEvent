<?php

namespace Tests\Feature\Diplomas;

use App\Enums\DiplomaRequestStatus;
use App\Models\DiplomaRequest;
use App\Models\PickupAppointment;
use App\Models\PickupSlot;
use App\Models\User;
use App\Notifications\Diplomas\PickupReminder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class PickupReminderTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Notification::fake();
    }

    private function appointmentTomorrow(User $owner): PickupAppointment
    {
        $slot = PickupSlot::factory()->create([
            'starts_at' => now()->addDay()->setTime(10, 0),
            'ends_at' => now()->addDay()->setTime(12, 0),
        ]);

        $request = DiplomaRequest::factory()->for($owner, 'owner')->create([
            'status' => DiplomaRequestStatus::AppointmentScheduled,
            'submitted_at' => now()->subDays(3),
        ]);

        return PickupAppointment::create([
            'diploma_request_id' => $request->id,
            'pickup_slot_id' => $slot->id,
            'confirmed_at' => now()->subDay(),
        ]);
    }

    public function test_command_sends_reminder_for_tomorrow_appointment(): void
    {
        $owner = User::factory()->create();
        $this->appointmentTomorrow($owner);

        $this->artisan('diplomas:send-pickup-reminders')->assertSuccessful();

        Notification::assertSentTo($owner, PickupReminder::class);
    }

    public function test_command_skips_appointments_today(): void
    {
        $owner = User::factory()->create();
        $slot = PickupSlot::factory()->create([
            'starts_at' => now()->addHours(2),
            'ends_at' => now()->addHours(4),
        ]);
        $request = DiplomaRequest::factory()->for($owner, 'owner')->create([
            'status' => DiplomaRequestStatus::AppointmentScheduled,
            'submitted_at' => now()->subDays(3),
        ]);
        PickupAppointment::create([
            'diploma_request_id' => $request->id,
            'pickup_slot_id' => $slot->id,
            'confirmed_at' => now()->subDay(),
        ]);

        $this->artisan('diplomas:send-pickup-reminders')->assertSuccessful();

        Notification::assertNothingSent();
    }

    public function test_command_skips_already_delivered_appointments(): void
    {
        $owner = User::factory()->create();
        $appointment = $this->appointmentTomorrow($owner);
        $appointment->forceFill(['delivered_at' => now()])->save();

        $this->artisan('diplomas:send-pickup-reminders')->assertSuccessful();

        Notification::assertNothingSent();
    }

    public function test_command_handles_no_matching_appointments(): void
    {
        $this->artisan('diplomas:send-pickup-reminders')
            ->expectsOutputToContain('Rappels envoyés : 0')
            ->assertSuccessful();
    }
}
