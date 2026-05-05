<?php

namespace Tests\Feature\Diplomas;

use App\Enums\DiplomaRequestStatus;
use App\Models\DiplomaDocument;
use App\Models\DiplomaRequest;
use App\Models\PickupAppointment;
use App\Models\PickupSlot;
use App\Models\User;
use App\Notifications\Diplomas\DiplomaRequestStatusChanged;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class NotificationsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Notification::fake();
        Storage::fake('local');
    }

    private function scolarite(): User
    {
        Role::findOrCreate('admin');
        return tap(User::factory()->create(), fn (User $u) => $u->assignRole('admin'));
    }

    public function test_creating_a_draft_does_not_notify(): void
    {
        $owner = User::factory()->create();

        $this->actingAs($owner)->post(route('diplomas.store'), [
            'diploma_type' => 'licence',
            'academic_year' => '2024-2025',
        ]);

        Notification::assertNothingSent();
    }

    public function test_submitting_a_request_notifies_the_owner(): void
    {
        $owner = User::factory()->create();
        $request = DiplomaRequest::factory()->for($owner, 'owner')->create();
        DiplomaDocument::factory()->for($request)->create();

        $this->actingAs($owner)->post(route('diplomas.submit', $request));

        Notification::assertSentTo(
            $owner,
            DiplomaRequestStatusChanged::class,
            fn ($notif) => $notif->newStatus === DiplomaRequestStatus::Submitted,
        );
    }

    public function test_validating_dossier_notifies_the_owner(): void
    {
        $scolarite = $this->scolarite();
        $owner = User::factory()->create();
        $request = DiplomaRequest::factory()->for($owner, 'owner')->submitted()->create();
        $document = DiplomaDocument::factory()->for($request)->validated()->create();

        $this->actingAs($scolarite)->post(route('admin.diplomas.validate', $request));

        Notification::assertSentTo(
            $owner,
            DiplomaRequestStatusChanged::class,
            fn ($notif) => $notif->newStatus === DiplomaRequestStatus::DocumentsValidated,
        );
    }

    public function test_marking_ready_notifies_the_owner(): void
    {
        $scolarite = $this->scolarite();
        $owner = User::factory()->create();
        $request = DiplomaRequest::factory()->for($owner, 'owner')->create([
            'status' => DiplomaRequestStatus::DocumentsValidated,
            'submitted_at' => now()->subDay(),
        ]);

        $this->actingAs($scolarite)->post(route('admin.diplomas.mark-ready', $request));

        Notification::assertSentTo(
            $owner,
            DiplomaRequestStatusChanged::class,
            fn ($notif) => $notif->newStatus === DiplomaRequestStatus::ReadyForPickup,
        );
    }

    public function test_rejecting_notifies_the_owner_with_reason_in_payload(): void
    {
        $scolarite = $this->scolarite();
        $owner = User::factory()->create();
        $request = DiplomaRequest::factory()->for($owner, 'owner')->submitted()->create();
        DiplomaDocument::factory()->for($request)->create();

        $this->actingAs($scolarite)->post(route('admin.diplomas.reject', $request), [
            'reason' => 'Pièce manquante.',
        ]);

        Notification::assertSentTo(
            $owner,
            DiplomaRequestStatusChanged::class,
            fn ($notif) => $notif->newStatus === DiplomaRequestStatus::Rejected,
        );
    }

    public function test_booking_notifies_the_owner(): void
    {
        $owner = User::factory()->create();
        $request = DiplomaRequest::factory()->for($owner, 'owner')->readyForPickup()->create();
        $slot = PickupSlot::factory()->create([
            'starts_at' => now()->addDay(),
            'ends_at' => now()->addDay()->addHour(),
        ]);

        $this->actingAs($owner)->post(route('diplomas.appointment.store', [$request, $slot]));

        Notification::assertSentTo(
            $owner,
            DiplomaRequestStatusChanged::class,
            fn ($notif) => $notif->newStatus === DiplomaRequestStatus::AppointmentScheduled,
        );
    }

    public function test_cancelling_appointment_does_not_notify(): void
    {
        $owner = User::factory()->create();
        $request = DiplomaRequest::factory()->for($owner, 'owner')->readyForPickup()->create();
        $slot = PickupSlot::factory()->create([
            'starts_at' => now()->addDay(),
            'ends_at' => now()->addDay()->addHour(),
        ]);

        $this->actingAs($owner)->post(route('diplomas.appointment.store', [$request, $slot]));
        Notification::fake();

        $appointment = $request->fresh()->appointment;

        $this->actingAs($owner)
            ->delete(route('diplomas.appointment.destroy', [$request, $appointment]));

        Notification::assertNothingSent();
    }

    public function test_delivering_notifies_the_owner(): void
    {
        $scolarite = $this->scolarite();
        $owner = User::factory()->create();
        $slot = PickupSlot::factory()->create([
            'starts_at' => now()->addDay(),
            'ends_at' => now()->addDay()->addHour(),
        ]);
        $request = DiplomaRequest::factory()->for($owner, 'owner')->create([
            'status' => DiplomaRequestStatus::AppointmentScheduled,
            'submitted_at' => now()->subDays(2),
        ]);
        PickupAppointment::create([
            'diploma_request_id' => $request->id,
            'pickup_slot_id' => $slot->id,
            'confirmed_at' => now(),
        ]);

        $this->actingAs($scolarite)->post(route('admin.diplomas.deliver', $request));

        Notification::assertSentTo(
            $owner,
            DiplomaRequestStatusChanged::class,
            fn ($notif) => $notif->newStatus === DiplomaRequestStatus::Delivered,
        );
    }

    public function test_archiving_does_not_notify(): void
    {
        $scolarite = $this->scolarite();
        $owner = User::factory()->create();
        $request = DiplomaRequest::factory()->for($owner, 'owner')->create([
            'status' => DiplomaRequestStatus::Delivered,
            'submitted_at' => now()->subDays(3),
        ]);

        $this->actingAs($scolarite)->post(route('admin.diplomas.archive', $request));

        Notification::assertNothingSent();
    }
}
