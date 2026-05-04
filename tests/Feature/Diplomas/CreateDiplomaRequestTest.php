<?php

namespace Tests\Feature\Diplomas;

use App\Enums\DiplomaRequestStatus;
use App\Models\DiplomaRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CreateDiplomaRequestTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_from_diplomas_index(): void
    {
        $this->get(route('diplomas.index'))->assertRedirect(route('login'));
    }

    public function test_authenticated_student_can_view_index(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('diplomas.index'))
            ->assertOk();
    }

    public function test_authenticated_student_can_view_create_form(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('diplomas.create'))
            ->assertOk();
    }

    public function test_student_can_create_a_draft_request(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('diplomas.store'), [
            'diploma_type' => 'licence',
            'academic_year' => '2024-2025',
        ]);

        $this->assertDatabaseCount('diploma_requests', 1);

        $request = DiplomaRequest::first();
        $this->assertSame($user->id, $request->owner_id);
        $this->assertSame(DiplomaRequestStatus::Draft, $request->status);
        $this->assertSame('licence', $request->diploma_type);
        $this->assertSame('2024-2025', $request->academic_year);
        $this->assertMatchesRegularExpression('/^DIP-\d{4}-[A-Z0-9]{8}$/', $request->tracking_code);
        $this->assertNull($request->submitted_at);

        $response->assertRedirect(route('diplomas.show', $request));
    }

    public function test_creating_a_draft_records_a_history_event(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->post(route('diplomas.store'), [
            'diploma_type' => 'master',
            'academic_year' => '2024-2025',
        ]);

        $request = DiplomaRequest::first();
        $this->assertCount(1, $request->events);

        $event = $request->events->first();
        $this->assertNull($event->from_status);
        $this->assertSame(DiplomaRequestStatus::Draft, $event->to_status);
        $this->assertSame($user->id, $event->actor_id);
    }

    public function test_store_validates_diploma_type(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('diplomas.store'), [
                'diploma_type' => 'not-a-diploma',
                'academic_year' => '2024-2025',
            ])
            ->assertSessionHasErrors('diploma_type');

        $this->assertDatabaseCount('diploma_requests', 0);
    }

    public function test_store_validates_academic_year_format(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('diplomas.store'), [
                'diploma_type' => 'licence',
                'academic_year' => '2024',
            ])
            ->assertSessionHasErrors('academic_year');
    }

    public function test_store_rejects_out_of_range_academic_year(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('diplomas.store'), [
                'diploma_type' => 'licence',
                'academic_year' => '1900-9999',
            ])
            ->assertSessionHasErrors('academic_year');

        $this->assertDatabaseCount('diploma_requests', 0);
    }

    public function test_owner_can_view_their_request(): void
    {
        $user = User::factory()->create();
        $request = DiplomaRequest::factory()->for($user, 'owner')->create();

        $this->actingAs($user)
            ->get(route('diplomas.show', $request))
            ->assertOk();
    }

    public function test_other_users_cannot_view_someone_elses_request(): void
    {
        $owner = User::factory()->create();
        $intruder = User::factory()->create();
        $request = DiplomaRequest::factory()->for($owner, 'owner')->create();

        $this->actingAs($intruder)
            ->get(route('diplomas.show', $request))
            ->assertForbidden();
    }
}
