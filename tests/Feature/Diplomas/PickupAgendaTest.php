<?php

namespace Tests\Feature\Diplomas;

use App\Enums\DiplomaRequestStatus;
use App\Models\DiplomaRequest;
use App\Models\PickupAppointment;
use App\Models\PickupSlot;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class PickupAgendaTest extends TestCase
{
    use RefreshDatabase;

    private function scolarite(): User
    {
        Role::findOrCreate('admin');

        return tap(User::factory()->create(), fn (User $u) => $u->assignRole('admin'));
    }

    public function test_guest_cannot_view_agenda(): void
    {
        $this->get(route('admin.pickup-slots.agenda'))
            ->assertRedirect(route('login'));
    }

    public function test_student_cannot_view_agenda(): void
    {
        $this->actingAs(User::factory()->create())
            ->get(route('admin.pickup-slots.agenda'))
            ->assertForbidden();
    }

    public function test_agenda_groups_slots_by_day_and_lists_appointments(): void
    {
        $scolarite = $this->scolarite();
        $owner = User::factory()->create();

        $slot = PickupSlot::factory()->create([
            'starts_at' => now()->addDay()->setTime(10, 0),
            'ends_at' => now()->addDay()->setTime(12, 0),
        ]);

        $request = DiplomaRequest::factory()->for($owner, 'owner')->create([
            'status' => DiplomaRequestStatus::AppointmentScheduled,
            'submitted_at' => now()->subDay(),
        ]);
        PickupAppointment::create([
            'diploma_request_id' => $request->id,
            'pickup_slot_id' => $slot->id,
            'confirmed_at' => now(),
        ]);

        $this->actingAs($scolarite)
            ->get(route('admin.pickup-slots.agenda'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('admin/pickup-slots/agenda')
                ->has('days', 1)
                ->where('days.0.slots.0.reserved', 1)
                ->where('days.0.slots.0.appointments.0.tracking_code', $request->tracking_code)
                ->where('days.0.slots.0.appointments.0.student_name', $owner->name)
            );
    }

    public function test_agenda_excludes_past_slots(): void
    {
        $scolarite = $this->scolarite();

        PickupSlot::factory()->create([
            'starts_at' => now()->subDays(2),
            'ends_at' => now()->subDays(2)->addHour(),
        ]);
        PickupSlot::factory()->create([
            'starts_at' => now()->addDay(),
            'ends_at' => now()->addDay()->addHour(),
        ]);

        $this->actingAs($scolarite)
            ->get(route('admin.pickup-slots.agenda'))
            ->assertInertia(fn ($page) => $page->has('days', 1));
    }
}
