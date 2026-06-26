<?php

namespace Tests\Feature\Diplomas;

use App\Enums\DiplomaRequestStatus;
use App\Models\DiplomaRequest;
use App\Models\PickupAppointment;
use App\Models\PickupSlot;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class DeliverArchiveTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('local');
    }

    private function scolarite(): User
    {
        Role::findOrCreate('admin');

        return tap(User::factory()->create(), fn (User $u) => $u->assignRole('admin'));
    }

    private function appointmentScheduledRequest(User $owner): DiplomaRequest
    {
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

        return $request->fresh();
    }

    public function test_scolarite_can_deliver_with_receipt(): void
    {
        $scolarite = $this->scolarite();
        $owner = User::factory()->create();
        $request = $this->appointmentScheduledRequest($owner);

        $this->actingAs($scolarite)
            ->post(route('admin.diplomas.deliver', $request), [
                'receipt' => UploadedFile::fake()->create('receipt.pdf', 200, 'application/pdf'),
            ])
            ->assertRedirect(route('admin.diplomas.show', $request));

        $request->refresh();
        $this->assertSame(DiplomaRequestStatus::Delivered, $request->status);

        $appointment = $request->appointment;
        $this->assertNotNull($appointment->delivered_at);
        $this->assertSame($scolarite->id, $appointment->delivered_by);
        Storage::disk('local')->assertExists($appointment->receipt_path);
    }

    public function test_scolarite_can_deliver_without_receipt(): void
    {
        $scolarite = $this->scolarite();
        $owner = User::factory()->create();
        $request = $this->appointmentScheduledRequest($owner);

        $this->actingAs($scolarite)
            ->post(route('admin.diplomas.deliver', $request), [])
            ->assertRedirect(route('admin.diplomas.show', $request));

        $request->refresh();
        $this->assertSame(DiplomaRequestStatus::Delivered, $request->status);
        $this->assertNull($request->appointment->receipt_path);
    }

    public function test_deliver_rejects_invalid_receipt_mime(): void
    {
        $scolarite = $this->scolarite();
        $owner = User::factory()->create();
        $request = $this->appointmentScheduledRequest($owner);

        $this->actingAs($scolarite)
            ->from(route('admin.diplomas.show', $request))
            ->post(route('admin.diplomas.deliver', $request), [
                'receipt' => UploadedFile::fake()->create('virus.exe', 100, 'application/octet-stream'),
            ])
            ->assertSessionHasErrors('receipt');

        $this->assertSame(
            DiplomaRequestStatus::AppointmentScheduled,
            $request->refresh()->status,
        );
    }

    public function test_cannot_deliver_a_non_scheduled_request(): void
    {
        $scolarite = $this->scolarite();
        $owner = User::factory()->create();
        $request = DiplomaRequest::factory()->for($owner, 'owner')->readyForPickup()->create();

        $this->actingAs($scolarite)
            ->post(route('admin.diplomas.deliver', $request))
            ->assertForbidden();
    }

    public function test_student_cannot_deliver(): void
    {
        $owner = User::factory()->create();
        $request = $this->appointmentScheduledRequest($owner);

        $this->actingAs($owner)
            ->post(route('admin.diplomas.deliver', $request))
            ->assertForbidden();
    }

    public function test_scolarite_can_archive_a_delivered_request(): void
    {
        $scolarite = $this->scolarite();
        $owner = User::factory()->create();
        $request = DiplomaRequest::factory()->for($owner, 'owner')->create([
            'status' => DiplomaRequestStatus::Delivered,
            'submitted_at' => now()->subDays(3),
        ]);

        $this->actingAs($scolarite)
            ->post(route('admin.diplomas.archive', $request))
            ->assertRedirect(route('admin.diplomas.show', $request));

        $request->refresh();
        $this->assertSame(DiplomaRequestStatus::Archived, $request->status);
        $this->assertNotNull($request->archived_at);
    }

    public function test_cannot_archive_before_delivery(): void
    {
        $scolarite = $this->scolarite();
        $owner = User::factory()->create();
        $request = $this->appointmentScheduledRequest($owner);

        $this->actingAs($scolarite)
            ->post(route('admin.diplomas.archive', $request))
            ->assertForbidden();
    }

    public function test_student_cannot_archive(): void
    {
        $owner = User::factory()->create();
        $request = DiplomaRequest::factory()->for($owner, 'owner')->create([
            'status' => DiplomaRequestStatus::Delivered,
        ]);

        $this->actingAs($owner)
            ->post(route('admin.diplomas.archive', $request))
            ->assertForbidden();
    }

    public function test_full_lifecycle_records_each_event(): void
    {
        $scolarite = $this->scolarite();
        $owner = User::factory()->create();
        $request = $this->appointmentScheduledRequest($owner);

        $this->actingAs($scolarite)->post(route('admin.diplomas.deliver', $request));
        $this->actingAs($scolarite)->post(route('admin.diplomas.archive', $request));

        $events = $request->refresh()->events->pluck('to_status')->map->value;

        $this->assertContains(DiplomaRequestStatus::Delivered->value, $events);
        $this->assertContains(DiplomaRequestStatus::Archived->value, $events);
    }
}
