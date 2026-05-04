<?php

namespace Tests\Feature\Diplomas;

use App\Enums\DiplomaRequestStatus;
use App\Models\DiplomaDocument;
use App\Models\DiplomaRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SubmitDiplomaRequestTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_submit_a_draft_with_documents(): void
    {
        $user = User::factory()->create();
        $request = DiplomaRequest::factory()->for($user, 'owner')->create();
        DiplomaDocument::factory()->for($request)->create();

        $this->actingAs($user)
            ->post(route('diplomas.submit', $request))
            ->assertRedirect(route('diplomas.show', $request));

        $request->refresh();
        $this->assertSame(DiplomaRequestStatus::Submitted, $request->status);
        $this->assertNotNull($request->submitted_at);
    }

    public function test_submission_records_a_history_event(): void
    {
        $user = User::factory()->create();
        $request = DiplomaRequest::factory()->for($user, 'owner')->create();
        DiplomaDocument::factory()->for($request)->create();

        $this->actingAs($user)->post(route('diplomas.submit', $request));

        $events = $request->refresh()->events;
        $submittedEvent = $events->firstWhere('to_status', DiplomaRequestStatus::Submitted);

        $this->assertNotNull($submittedEvent);
        $this->assertSame(DiplomaRequestStatus::Draft, $submittedEvent->from_status);
        $this->assertSame($user->id, $submittedEvent->actor_id);
    }

    public function test_cannot_submit_a_draft_without_documents(): void
    {
        $user = User::factory()->create();
        $request = DiplomaRequest::factory()->for($user, 'owner')->create();

        $this->actingAs($user)
            ->from(route('diplomas.show', $request))
            ->post(route('diplomas.submit', $request))
            ->assertRedirect(route('diplomas.show', $request))
            ->assertSessionHasErrors('documents');

        $this->assertSame(DiplomaRequestStatus::Draft, $request->refresh()->status);
    }

    public function test_cannot_resubmit_an_already_submitted_request(): void
    {
        $user = User::factory()->create();
        $request = DiplomaRequest::factory()->for($user, 'owner')->submitted()->create();
        DiplomaDocument::factory()->for($request)->create();

        $this->actingAs($user)
            ->post(route('diplomas.submit', $request))
            ->assertForbidden();
    }

    public function test_non_owner_cannot_submit(): void
    {
        $owner = User::factory()->create();
        $intruder = User::factory()->create();
        $request = DiplomaRequest::factory()->for($owner, 'owner')->create();
        DiplomaDocument::factory()->for($request)->create();

        $this->actingAs($intruder)
            ->post(route('diplomas.submit', $request))
            ->assertForbidden();
    }

    public function test_guest_is_redirected(): void
    {
        $owner = User::factory()->create();
        $request = DiplomaRequest::factory()->for($owner, 'owner')->create();

        $this->post(route('diplomas.submit', $request))
            ->assertRedirect(route('login'));
    }
}
