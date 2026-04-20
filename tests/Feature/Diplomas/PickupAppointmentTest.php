<?php

namespace Tests\Feature\Diplomas;

use App\Enums\DiplomaRequestStatus;
use App\Models\DiplomaRequest;
use App\Models\PickupAppointment;
use App\Models\PickupSlot;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PickupAppointmentTest extends TestCase
{
    use RefreshDatabase;

    private function readyRequest(User $owner): DiplomaRequest
    {
        return DiplomaRequest::factory()->for($owner, 'owner')->readyForPickup()->create();
    }

    private function futureSlot(array $overrides = []): PickupSlot
    {
        return PickupSlot::factory()->create([
            'starts_at' => now()->addDays(2),
            'ends_at' => now()->addDays(2)->addHour(),
            'capacity' => 2,
            ...$overrides,
        ]);
    }

    public function test_student_can_book_an_available_slot(): void
    {
        $owner = User::factory()->create();
        $request = $this->readyRequest($owner);
        $slot = $this->futureSlot();

        $this->actingAs($owner)
            ->post(route('diplomas.appointment.store', [$request, $slot]))
            ->assertRedirect(route('diplomas.show', $request));

        $this->assertSame(
            DiplomaRequestStatus::AppointmentScheduled,
            $request->refresh()->status,
        );
        $this->assertDatabaseCount('pickup_appointments', 1);
    }

    public function test_booking_fails_if_slot_is_full(): void
    {
        $owner = User::factory()->create();
        $request = $this->readyRequest($owner);
        $slot = $this->futureSlot(['capacity' => 1]);

        PickupAppointment::create([
            'diploma_request_id' => DiplomaRequest::factory()->readyForPickup()->create()->id,
            'pickup_slot_id' => $slot->id,
            'confirmed_at' => now(),
        ]);

        $this->actingAs($owner)
            ->from(route('diplomas.show', $request))
            ->post(route('diplomas.appointment.store', [$request, $slot]))
            ->assertSessionHasErrors('slot');

        $this->assertSame(
            DiplomaRequestStatus::ReadyForPickup,
            $request->refresh()->status,
        );
    }

    public function test_booking_fails_when_request_not_ready_for_pickup(): void
    {
        $owner = User::factory()->create();
        $request = DiplomaRequest::factory()->for($owner, 'owner')->submitted()->create();
        $slot = $this->futureSlot();

        $this->actingAs($owner)
            ->post(route('diplomas.appointment.store', [$request, $slot]))
            ->assertForbidden();
    }

    public function test_non_owner_cannot_book(): void
    {
        $owner = User::factory()->create();
        $intruder = User::factory()->create();
        $request = $this->readyRequest($owner);
        $slot = $this->futureSlot();

        $this->actingAs($intruder)
            ->post(route('diplomas.appointment.store', [$request, $slot]))
            ->assertForbidden();
    }

    public function test_cannot_book_a_past_slot(): void
    {
        $owner = User::factory()->create();
        $request = $this->readyRequest($owner);
        $pastSlot = PickupSlot::factory()->create([
            'starts_at' => now()->subDays(2),
            'ends_at' => now()->subDays(2)->addHour(),
        ]);

        $this->actingAs($owner)
            ->from(route('diplomas.show', $request))
            ->post(route('diplomas.appointment.store', [$request, $pastSlot]))
            ->assertSessionHasErrors('slot');
    }

    public function test_owner_can_cancel_a_future_appointment(): void
    {
        $owner = User::factory()->create();
        $request = $this->readyRequest($owner);
        $slot = $this->futureSlot();

        $this->actingAs($owner)
            ->post(route('diplomas.appointment.store', [$request, $slot]));

        $appointment = $request->fresh()->appointment;

        $this->actingAs($owner)
            ->delete(route('diplomas.appointment.destroy', [$request, $appointment]))
            ->assertRedirect(route('diplomas.show', $request));

        $this->assertDatabaseCount('pickup_appointments', 0);
        $this->assertSame(
            DiplomaRequestStatus::ReadyForPickup,
            $request->refresh()->status,
        );
    }

    public function test_non_owner_cannot_cancel_appointment(): void
    {
        $owner = User::factory()->create();
        $intruder = User::factory()->create();
        $request = $this->readyRequest($owner);
        $slot = $this->futureSlot();

        $this->actingAs($owner)
            ->post(route('diplomas.appointment.store', [$request, $slot]));

        $appointment = $request->fresh()->appointment;

        $this->actingAs($intruder)
            ->delete(route('diplomas.appointment.destroy', [$request, $appointment]))
            ->assertForbidden();
    }

    public function test_appointment_from_another_request_returns_404(): void
    {
        $owner = User::factory()->create();
        $requestA = $this->readyRequest($owner);
        $requestB = $this->readyRequest($owner);
        $slot = $this->futureSlot();

        $this->actingAs($owner)
            ->post(route('diplomas.appointment.store', [$requestA, $slot]));

        $appointment = $requestA->fresh()->appointment;

        $this->actingAs($owner)
            ->delete(route('diplomas.appointment.destroy', [$requestB, $appointment]))
            ->assertNotFound();
    }
}
