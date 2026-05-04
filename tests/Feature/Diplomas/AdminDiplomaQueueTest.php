<?php

namespace Tests\Feature\Diplomas;

use App\Enums\DiplomaRequestStatus;
use App\Models\DiplomaRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AdminDiplomaQueueTest extends TestCase
{
    use RefreshDatabase;

    private function scolarite(): User
    {
        Role::findOrCreate('admin');
        return tap(User::factory()->create(), fn (User $u) => $u->assignRole('admin'));
    }

    public function test_guest_cannot_reach_admin_queue(): void
    {
        $this->get(route('admin.diplomas.index'))
            ->assertRedirect(route('login'));
    }

    public function test_student_cannot_reach_admin_queue(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('admin.diplomas.index'))
            ->assertForbidden();
    }

    public function test_scolarite_sees_non_draft_requests(): void
    {
        $scolarite = $this->scolarite();
        $owner = User::factory()->create();

        DiplomaRequest::factory()->for($owner, 'owner')->create();
        DiplomaRequest::factory()->for($owner, 'owner')->submitted()->create();
        DiplomaRequest::factory()->for($owner, 'owner')->readyForPickup()->create();

        $this->actingAs($scolarite)
            ->get(route('admin.diplomas.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('admin/diplomas/index')
                ->has('requests', 2)
            );
    }

    public function test_scolarite_can_filter_queue_by_status(): void
    {
        $scolarite = $this->scolarite();
        $owner = User::factory()->create();

        DiplomaRequest::factory()->for($owner, 'owner')->submitted()->create();
        DiplomaRequest::factory()->for($owner, 'owner')->readyForPickup()->create();

        $this->actingAs($scolarite)
            ->get(route('admin.diplomas.index', ['status' => 'submitted']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('requests', 1)
                ->where('requests.0.status', DiplomaRequestStatus::Submitted->value)
            );
    }

    public function test_scolarite_can_view_a_submitted_request(): void
    {
        $scolarite = $this->scolarite();
        $owner = User::factory()->create();
        $request = DiplomaRequest::factory()->for($owner, 'owner')->submitted()->create();

        $this->actingAs($scolarite)
            ->get(route('admin.diplomas.show', $request))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('admin/diplomas/show')
                ->where('request.owner.email', $owner->email)
            );
    }

    public function test_scolarite_cannot_view_a_draft_via_admin_route(): void
    {
        $scolarite = $this->scolarite();
        $owner = User::factory()->create();
        $draft = DiplomaRequest::factory()->for($owner, 'owner')->create();

        $this->actingAs($scolarite)
            ->get(route('admin.diplomas.show', $draft))
            ->assertForbidden();
    }

    public function test_student_cannot_view_admin_show(): void
    {
        $owner = User::factory()->create();
        $request = DiplomaRequest::factory()->for($owner, 'owner')->submitted()->create();

        $this->actingAs($owner)
            ->get(route('admin.diplomas.show', $request))
            ->assertForbidden();
    }
}
