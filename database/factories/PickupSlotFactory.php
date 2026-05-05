<?php

namespace Database\Factories;

use App\Models\PickupSlot;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PickupSlot>
 */
class PickupSlotFactory extends Factory
{
    protected $model = PickupSlot::class;

    public function definition(): array
    {
        $start = fake()->dateTimeBetween('+1 day', '+2 weeks');
        $end = (clone $start)->modify('+30 minutes');

        return [
            'starts_at' => $start,
            'ends_at' => $end,
            'capacity' => fake()->numberBetween(1, 5),
            'location' => 'Bureau de la scolarité — Salle '.fake()->numberBetween(1, 10),
            'created_by' => User::factory(),
        ];
    }
}
