<?php

namespace Tests\Feature\Diplomas;

use App\Models\DiplomaDocument;
use App\Models\DiplomaRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InAppNotificationsTest extends TestCase
{
    use RefreshDatabase;

    public function test_submit_persists_a_database_notification_for_owner(): void
    {
        $owner = User::factory()->create();
        $request = DiplomaRequest::factory()->for($owner, 'owner')->create();
        DiplomaDocument::factory()->for($request)->create();

        $this->actingAs($owner)->post(route('diplomas.submit', $request));

        $this->assertSame(1, $owner->fresh()->unreadNotifications()->count());
        $notif = $owner->fresh()->unreadNotifications()->first();
        $this->assertSame($request->tracking_code, $notif->data['tracking_code']);
        $this->assertSame('submitted', $notif->data['status']);
    }

    public function test_dashboard_payload_exposes_unread_count(): void
    {
        $owner = User::factory()->create();
        $request = DiplomaRequest::factory()->for($owner, 'owner')->create();
        DiplomaDocument::factory()->for($request)->create();
        $this->actingAs($owner)->post(route('diplomas.submit', $request));

        $this->actingAs($owner)
            ->get(route('dashboard'))
            ->assertInertia(fn ($page) => $page
                ->where('notifications.unread_count', 1)
                ->has('notifications.recent.0', fn ($n) => $n
                    ->where('tracking_code', $request->tracking_code)
                    ->etc()
                )
            );
    }

    public function test_marking_a_notification_read_redirects_to_request(): void
    {
        $owner = User::factory()->create();
        $request = DiplomaRequest::factory()->for($owner, 'owner')->create();
        DiplomaDocument::factory()->for($request)->create();
        $this->actingAs($owner)->post(route('diplomas.submit', $request));

        $notif = $owner->fresh()->unreadNotifications()->first();

        $this->actingAs($owner)
            ->post(route('notifications.read', $notif->id))
            ->assertRedirect(route('diplomas.show', $request));

        $this->assertSame(0, $owner->fresh()->unreadNotifications()->count());
    }

    public function test_user_cannot_mark_another_users_notification_read(): void
    {
        $owner = User::factory()->create();
        $intruder = User::factory()->create();
        $request = DiplomaRequest::factory()->for($owner, 'owner')->create();
        DiplomaDocument::factory()->for($request)->create();
        $this->actingAs($owner)->post(route('diplomas.submit', $request));

        $notif = $owner->fresh()->unreadNotifications()->first();

        $this->actingAs($intruder)
            ->post(route('notifications.read', $notif->id))
            ->assertNotFound();

        $this->assertSame(1, $owner->fresh()->unreadNotifications()->count());
    }

    public function test_read_all_clears_unread_count(): void
    {
        $owner = User::factory()->create();

        for ($i = 0; $i < 3; $i++) {
            $request = DiplomaRequest::factory()->for($owner, 'owner')->create();
            DiplomaDocument::factory()->for($request)->create();
            $this->actingAs($owner)->post(route('diplomas.submit', $request));
        }

        $this->assertSame(3, $owner->fresh()->unreadNotifications()->count());

        $this->actingAs($owner)
            ->post(route('notifications.read-all'))
            ->assertRedirect();

        $this->assertSame(0, $owner->fresh()->unreadNotifications()->count());
    }
}
