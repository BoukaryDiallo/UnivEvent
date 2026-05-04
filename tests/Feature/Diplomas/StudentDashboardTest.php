<?php

namespace Tests\Feature\Diplomas;

use App\Enums\DiplomaRequestStatus;
use App\Models\DiplomaRequest;
use App\Models\DiplomaRequestEvent;
use App\Models\PickupAppointment;
use App\Models\PickupSlot;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StudentDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_shows_no_active_request_for_new_user(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('dashboard')
                ->where('active_request', null)
                ->where('upcoming_appointment', null)
                ->where('archived_count', 0)
                ->has('recent_events', 0)
            );
    }

    public function test_dashboard_returns_only_users_own_data(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();

        DiplomaRequest::factory()->for($other, 'owner')->submitted()->create();

        $this->actingAs($owner)
            ->get(route('dashboard'))
            ->assertInertia(fn ($page) => $page->where('active_request', null));
    }

    public function test_dashboard_picks_latest_non_archived_request(): void
    {
        $user = User::factory()->create();

        DiplomaRequest::factory()->for($user, 'owner')->create([
            'status' => DiplomaRequestStatus::Archived,
            'submitted_at' => now()->subDays(20),
            'updated_at' => now()->subDay(),
        ]);
        $active = DiplomaRequest::factory()->for($user, 'owner')->submitted()->create([
            'updated_at' => now()->subHour(),
        ]);

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertInertia(fn ($page) => $page
                ->where('active_request.id', $active->id)
                ->where('archived_count', 1)
            );
    }

    public function test_dashboard_deprioritises_rejected_request(): void
    {
        $user = User::factory()->create();

        $rejected = DiplomaRequest::factory()->for($user, 'owner')->rejected()->create([
            'updated_at' => now(),
        ]);
        $active = DiplomaRequest::factory()->for($user, 'owner')->submitted()->create([
            'updated_at' => now()->subDays(2),
        ]);

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertInertia(fn ($page) => $page->where('active_request.id', $active->id));
    }

    public function test_dashboard_exposes_upcoming_appointment(): void
    {
        $user = User::factory()->create();
        $request = DiplomaRequest::factory()->for($user, 'owner')->create([
            'status' => DiplomaRequestStatus::AppointmentScheduled,
            'submitted_at' => now()->subDay(),
        ]);
        $slot = PickupSlot::factory()->create([
            'starts_at' => now()->addDay(),
            'ends_at' => now()->addDay()->addHour(),
        ]);
        PickupAppointment::create([
            'diploma_request_id' => $request->id,
            'pickup_slot_id' => $slot->id,
            'confirmed_at' => now(),
        ]);

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertInertia(fn ($page) => $page
                ->where('upcoming_appointment.slot.id', $slot->id)
                ->where('upcoming_appointment.slot.location', $slot->location)
            );
    }

    public function test_dashboard_skips_past_appointments(): void
    {
        $user = User::factory()->create();
        $request = DiplomaRequest::factory()->for($user, 'owner')->create([
            'status' => DiplomaRequestStatus::Delivered,
            'submitted_at' => now()->subDays(5),
        ]);
        $pastSlot = PickupSlot::factory()->create([
            'starts_at' => now()->subDay(),
            'ends_at' => now()->subDay()->addHour(),
        ]);
        PickupAppointment::create([
            'diploma_request_id' => $request->id,
            'pickup_slot_id' => $pastSlot->id,
            'confirmed_at' => now()->subDays(2),
            'delivered_at' => now()->subDay(),
        ]);

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertInertia(fn ($page) => $page->where('upcoming_appointment', null));
    }

    public function test_dashboard_returns_recent_events_limited_to_five(): void
    {
        $user = User::factory()->create();
        $request = DiplomaRequest::factory()->for($user, 'owner')->submitted()->create();

        for ($i = 0; $i < 7; $i++) {
            DiplomaRequestEvent::create([
                'diploma_request_id' => $request->id,
                'from_status' => null,
                'to_status' => DiplomaRequestStatus::Submitted,
                'actor_id' => $user->id,
                'note' => "event-$i",
                'occurred_at' => now()->subMinutes(10 - $i),
            ]);
        }

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertInertia(fn ($page) => $page
                ->has('recent_events', 5)
                ->where('recent_events.0.note', 'event-6')
            );
    }
}
