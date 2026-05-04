<?php

namespace Tests\Feature\Diplomas;

use App\Enums\DiplomaRequestStatus;
use App\Models\DiplomaRequest;
use App\Models\PickupAppointment;
use App\Models\PickupSlot;
use App\Models\User;
use App\Notifications\Diplomas\DiplomaRequestStatusChanged;
use App\Notifications\Diplomas\PickupReminder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MailRenderingTest extends TestCase
{
    use RefreshDatabase;

    public function test_submitted_mail_uses_tracking_code_in_subject_and_body(): void
    {
        $owner = User::factory()->create(['name' => 'Awa Demo']);
        $request = DiplomaRequest::factory()->for($owner, 'owner')->submitted()->create();

        $mail = (new DiplomaRequestStatusChanged($request, DiplomaRequestStatus::Submitted))
            ->toMail($owner);

        $this->assertSame("Demande {$request->tracking_code} soumise", $mail->subject);
        $this->assertContains('Bonjour Awa Demo,', $mail->greeting ? [$mail->greeting] : array_map(fn ($l) => (string) $l, $mail->introLines));
        $this->assertTrue(
            collect($mail->introLines)->contains(fn ($line) => str_contains((string) $line, $request->tracking_code)),
        );
    }

    public function test_rejected_mail_includes_reason(): void
    {
        $owner = User::factory()->create();
        $request = DiplomaRequest::factory()->for($owner, 'owner')->rejected()->create([
            'rejected_reason' => 'Pièce manquante.',
        ]);

        $mail = (new DiplomaRequestStatusChanged($request, DiplomaRequestStatus::Rejected))
            ->toMail($owner);

        $this->assertStringContainsString('rejetée', $mail->subject);
        $this->assertTrue(
            collect($mail->introLines)->contains(fn ($line) => str_contains((string) $line, 'Pièce manquante.')),
        );
        $this->assertSame('error', $mail->level);
    }

    public function test_appointment_scheduled_mail_includes_slot_details(): void
    {
        $owner = User::factory()->create();
        $request = DiplomaRequest::factory()->for($owner, 'owner')->create([
            'status' => DiplomaRequestStatus::AppointmentScheduled,
            'submitted_at' => now()->subDay(),
        ]);
        $slot = PickupSlot::factory()->create([
            'starts_at' => now()->addDay()->setTime(10, 30),
            'ends_at' => now()->addDay()->setTime(12, 0),
            'location' => 'Salle 201',
        ]);
        $request->setRelation('appointment', PickupAppointment::create([
            'diploma_request_id' => $request->id,
            'pickup_slot_id' => $slot->id,
            'confirmed_at' => now(),
        ]));

        $mail = (new DiplomaRequestStatusChanged($request, DiplomaRequestStatus::AppointmentScheduled))
            ->toMail($owner);

        $this->assertStringContainsString('Rendez-vous confirmé', $mail->subject);
        $this->assertTrue(
            collect($mail->introLines)->contains(fn ($line) => str_contains((string) $line, 'Salle 201')),
        );
    }

    public function test_pickup_reminder_mail_renders_slot(): void
    {
        $owner = User::factory()->create();
        $request = DiplomaRequest::factory()->for($owner, 'owner')->create([
            'status' => DiplomaRequestStatus::AppointmentScheduled,
            'submitted_at' => now()->subDay(),
        ]);
        $slot = PickupSlot::factory()->create([
            'starts_at' => now()->addDay()->setTime(9, 0),
            'ends_at' => now()->addDay()->setTime(11, 0),
            'location' => 'Salle 304',
        ]);
        $appointment = PickupAppointment::create([
            'diploma_request_id' => $request->id,
            'pickup_slot_id' => $slot->id,
            'confirmed_at' => now(),
        ]);

        $mail = (new PickupReminder($appointment))->toMail($owner);

        $this->assertStringContainsString('demain', $mail->subject);
        $this->assertTrue(
            collect($mail->introLines)->contains(fn ($line) => str_contains((string) $line, 'Salle 304')),
        );
    }
}
