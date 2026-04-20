<?php

namespace Tests\Feature\Diplomas;

use App\Models\PickupSlot;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PickupSlotTest extends TestCase
{
    use RefreshDatabase;

    private function scolarite(): User
    {
        return User::factory()->create([
            'email' => config('diplomas.scolarite_emails')[0] ?? 'admin@example.com',
        ]);
    }

    public function test_guest_cannot_access_admin_slots(): void
    {
        $this->get(route('admin.pickup-slots.index'))
            ->assertRedirect(route('login'));
    }

    public function test_student_cannot_access_admin_slots(): void
    {
        $this->actingAs(User::factory()->create())
            ->get(route('admin.pickup-slots.index'))
            ->assertForbidden();
    }

    public function test_scolarite_can_create_a_slot(): void
    {
        $scolarite = $this->scolarite();

        $this->actingAs($scolarite)
            ->post(route('admin.pickup-slots.store'), [
                'location' => 'Salle 201',
                'starts_at' => now()->addDay()->format('Y-m-d H:i:s'),
                'ends_at' => now()->addDay()->addHours(2)->format('Y-m-d H:i:s'),
                'capacity' => 5,
            ])
            ->assertRedirect(route('admin.pickup-slots.index'));

        $this->assertDatabaseCount('pickup_slots', 1);
        $this->assertSame($scolarite->id, PickupSlot::first()->created_by);
    }

    public function test_store_rejects_past_start(): void
    {
        $scolarite = $this->scolarite();

        $this->actingAs($scolarite)
            ->from(route('admin.pickup-slots.create'))
            ->post(route('admin.pickup-slots.store'), [
                'location' => 'Salle 201',
                'starts_at' => now()->subHour()->format('Y-m-d H:i:s'),
                'ends_at' => now()->addHour()->format('Y-m-d H:i:s'),
                'capacity' => 5,
            ])
            ->assertSessionHasErrors('starts_at');
    }

    public function test_store_rejects_overlapping_slot_at_same_location(): void
    {
        $scolarite = $this->scolarite();

        PickupSlot::factory()->create([
            'location' => 'Salle 201',
            'starts_at' => now()->addDay(),
            'ends_at' => now()->addDay()->addHours(2),
        ]);

        $this->actingAs($scolarite)
            ->from(route('admin.pickup-slots.create'))
            ->post(route('admin.pickup-slots.store'), [
                'location' => 'Salle 201',
                'starts_at' => now()->addDay()->addHour()->format('Y-m-d H:i:s'),
                'ends_at' => now()->addDay()->addHours(3)->format('Y-m-d H:i:s'),
                'capacity' => 5,
            ])
            ->assertSessionHasErrors('starts_at');
    }

    public function test_non_overlapping_slot_at_different_location_is_allowed(): void
    {
        $scolarite = $this->scolarite();

        PickupSlot::factory()->create([
            'location' => 'Salle 201',
            'starts_at' => now()->addDay(),
            'ends_at' => now()->addDay()->addHours(2),
        ]);

        $this->actingAs($scolarite)
            ->post(route('admin.pickup-slots.store'), [
                'location' => 'Salle 202',
                'starts_at' => now()->addDay()->format('Y-m-d H:i:s'),
                'ends_at' => now()->addDay()->addHours(2)->format('Y-m-d H:i:s'),
                'capacity' => 5,
            ])
            ->assertRedirect(route('admin.pickup-slots.index'));

        $this->assertDatabaseCount('pickup_slots', 2);
    }

    public function test_scolarite_can_update_a_slot(): void
    {
        $scolarite = $this->scolarite();
        $slot = PickupSlot::factory()->create(['capacity' => 10]);

        $this->actingAs($scolarite)
            ->put(route('admin.pickup-slots.update', $slot), [
                'location' => $slot->location,
                'starts_at' => $slot->starts_at->format('Y-m-d H:i:s'),
                'ends_at' => $slot->ends_at->format('Y-m-d H:i:s'),
                'capacity' => 20,
            ])
            ->assertRedirect(route('admin.pickup-slots.index'));

        $this->assertSame(20, $slot->refresh()->capacity);
    }

    public function test_scolarite_can_delete_empty_slot(): void
    {
        $scolarite = $this->scolarite();
        $slot = PickupSlot::factory()->create();

        $this->actingAs($scolarite)
            ->delete(route('admin.pickup-slots.destroy', $slot))
            ->assertRedirect(route('admin.pickup-slots.index'));

        $this->assertDatabaseCount('pickup_slots', 0);
    }
}
