<?php

namespace Tests\Feature\Diplomas;

use App\Enums\DiplomaRequestStatus;
use App\Models\DiplomaRequest;
use App\Models\DiplomaRequestEvent;
use App\Models\PickupAppointment;
use App\Models\PickupSlot;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AdminDashboardTest extends TestCase
{
    use RefreshDatabase;

    private function scolarite(): User
    {
        Role::findOrCreate('admin');

        return tap(User::factory()->create(), fn (User $u) => $u->assignRole('admin'));
    }

    public function test_guest_cannot_view_dashboard(): void
    {
        $this->get(route('admin.dashboard'))
            ->assertRedirect(route('login'));
    }

    public function test_student_cannot_view_dashboard(): void
    {
        $this->actingAs(User::factory()->create())
            ->get(route('admin.dashboard'))
            ->assertForbidden();
    }

    public function test_scolarite_sees_status_counts_and_active_queue(): void
    {
        $scolarite = $this->scolarite();
        $owner = User::factory()->create();

        DiplomaRequest::factory()->for($owner, 'owner')->create();
        DiplomaRequest::factory()->for($owner, 'owner')->submitted()->count(2)->create();
        DiplomaRequest::factory()->for($owner, 'owner')->readyForPickup()->create();
        DiplomaRequest::factory()->for($owner, 'owner')->rejected()->create();

        $this->actingAs($scolarite)
            ->get(route('admin.dashboard'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('admin/dashboard')
                ->where('active_queue', 3)
                ->has('counts', count(DiplomaRequestStatus::cases()))
            );
    }

    public function test_dashboard_computes_average_instruction_days(): void
    {
        $scolarite = $this->scolarite();
        $owner = User::factory()->create();

        $request = DiplomaRequest::factory()->for($owner, 'owner')->create([
            'status' => DiplomaRequestStatus::DocumentsValidated,
            'submitted_at' => now()->subDays(5),
        ]);

        DiplomaRequestEvent::create([
            'diploma_request_id' => $request->id,
            'from_status' => DiplomaRequestStatus::Submitted,
            'to_status' => DiplomaRequestStatus::DocumentsValidated,
            'actor_id' => $scolarite->id,
            'note' => 'Dossier validé',
            'occurred_at' => now()->subDays(2)->subHours(12),
        ]);

        $this->actingAs($scolarite)
            ->get(route('admin.dashboard'))
            ->assertInertia(fn ($page) => $page
                ->where('avg_instruction_days', 2.5)
            );
    }

    public function test_dashboard_reports_upcoming_slot_utilization(): void
    {
        $scolarite = $this->scolarite();
        $owner = User::factory()->create();

        $slot = PickupSlot::factory()->create([
            'starts_at' => now()->addDay(),
            'ends_at' => now()->addDay()->addHour(),
            'capacity' => 6,
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
            ->get(route('admin.dashboard'))
            ->assertInertia(fn ($page) => $page
                ->where('upcoming_slots.capacity', 6)
                ->where('upcoming_slots.reserved', 1)
                ->where('upcoming_slots.utilization', 16.7)
            );
    }

    public function test_dashboard_lists_recent_events_newest_first(): void
    {
        $scolarite = $this->scolarite();
        $owner = User::factory()->create();
        $request = DiplomaRequest::factory()->for($owner, 'owner')->submitted()->create();

        DiplomaRequestEvent::create([
            'diploma_request_id' => $request->id,
            'from_status' => null,
            'to_status' => DiplomaRequestStatus::Draft,
            'actor_id' => $owner->id,
            'note' => 'Old',
            'occurred_at' => now()->subDays(5),
        ]);
        DiplomaRequestEvent::create([
            'diploma_request_id' => $request->id,
            'from_status' => DiplomaRequestStatus::Draft,
            'to_status' => DiplomaRequestStatus::Submitted,
            'actor_id' => $owner->id,
            'note' => 'Recent',
            'occurred_at' => now()->subHour(),
        ]);

        $this->actingAs($scolarite)
            ->get(route('admin.dashboard'))
            ->assertInertia(fn ($page) => $page
                ->where('recent_events.0.note', 'Recent')
            );
    }
}
