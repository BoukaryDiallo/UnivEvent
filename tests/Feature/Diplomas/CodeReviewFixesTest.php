<?php

namespace Tests\Feature\Diplomas;

use App\Enums\DiplomaRequestStatus;
use App\Models\DiplomaDocument;
use App\Models\DiplomaRequest;
use App\Models\PickupAppointment;
use App\Models\PickupSlot;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class CodeReviewFixesTest extends TestCase
{
    use RefreshDatabase;

    private function scolarite(): User
    {
        Role::findOrCreate('admin');
        return tap(User::factory()->create(), fn (User $u) => $u->assignRole('admin'));
    }

    public function test_scolarite_can_download_a_student_document(): void
    {
        Storage::fake('local');
        $scolarite = $this->scolarite();
        $owner = User::factory()->create();
        $request = DiplomaRequest::factory()->for($owner, 'owner')->create();

        $this->actingAs($owner)->post(route('diplomas.documents.store', $request), [
            'type' => 'cni',
            'file' => UploadedFile::fake()->create('cni.pdf', 100, 'application/pdf'),
        ]);

        $document = DiplomaDocument::first();

        $this->actingAs($scolarite)
            ->get(route('diplomas.documents.download', [$request, $document]))
            ->assertOk();
    }

    public function test_scolarite_can_export_pdf_of_a_student_request(): void
    {
        $scolarite = $this->scolarite();
        $owner = User::factory()->create();
        $request = DiplomaRequest::factory()->for($owner, 'owner')->submitted()->create();

        $this->actingAs($scolarite)
            ->get(route('diplomas.export', $request))
            ->assertOk();
    }

    public function test_admin_index_requires_scolarite_role_via_policy(): void
    {
        $student = User::factory()->create();

        $this->actingAs($student)
            ->get(route('admin.diplomas.index'))
            ->assertForbidden();
    }

    public function test_uploaded_document_stores_server_sniffed_mime(): void
    {
        Storage::fake('local');
        $owner = User::factory()->create();
        $request = DiplomaRequest::factory()->for($owner, 'owner')->create();

        $this->actingAs($owner)->post(route('diplomas.documents.store', $request), [
            'type' => 'cni',
            'file' => UploadedFile::fake()->create('cni.pdf', 100, 'application/pdf'),
        ]);

        $document = DiplomaDocument::first();
        $this->assertSame('application/pdf', $document->mime);
    }

    public function test_pickup_slot_update_rejects_past_start(): void
    {
        $scolarite = $this->scolarite();
        $slot = PickupSlot::factory()->create([
            'starts_at' => now()->addDay(),
            'ends_at' => now()->addDay()->addHour(),
        ]);

        $this->actingAs($scolarite)
            ->from(route('admin.pickup-slots.edit', $slot))
            ->put(route('admin.pickup-slots.update', $slot), [
                'location' => $slot->location,
                'starts_at' => now()->subHour()->format('Y-m-d H:i:s'),
                'ends_at' => now()->addHour()->format('Y-m-d H:i:s'),
                'capacity' => $slot->capacity,
            ])
            ->assertSessionHasErrors('starts_at');
    }

    public function test_concurrent_booking_for_same_request_does_not_corrupt(): void
    {
        $owner = User::factory()->create();
        $request = DiplomaRequest::factory()->for($owner, 'owner')->readyForPickup()->create();

        $slotA = PickupSlot::factory()->create([
            'starts_at' => now()->addDay(),
            'ends_at' => now()->addDay()->addHour(),
        ]);
        $slotB = PickupSlot::factory()->create([
            'starts_at' => now()->addDays(2),
            'ends_at' => now()->addDays(2)->addHour(),
            'location' => 'Salle 999',
        ]);

        $this->actingAs($owner)->post(route('diplomas.appointment.store', [$request, $slotA]));

        $this->actingAs($owner)
            ->post(route('diplomas.appointment.store', [$request, $slotB]))
            ->assertForbidden();

        $this->assertSame(1, PickupAppointment::where('diploma_request_id', $request->id)->count());
        $this->assertSame(
            DiplomaRequestStatus::AppointmentScheduled,
            $request->fresh()->status,
        );
    }

    public function test_admin_index_payload_uses_admin_row_shape(): void
    {
        $scolarite = $this->scolarite();
        $owner = User::factory()->create(['name' => 'Awa Demo']);
        DiplomaRequest::factory()->for($owner, 'owner')->submitted()->create();

        $this->actingAs($scolarite)
            ->get(route('admin.diplomas.index'))
            ->assertInertia(fn ($page) => $page
                ->where('requests.0.owner.name', 'Awa Demo')
                ->where('requests.0.status', DiplomaRequestStatus::Submitted->value)
            );
    }
}
