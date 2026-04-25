<?php

namespace Database\Factories;

use App\Models\Evenement;
use App\Models\Programme;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Programme>
 */
class ProgrammeFactory extends Factory
{
    protected $model = Programme::class;

    public function definition(): array
    {
        return [
            'evenement_id' => Evenement::factory(),
            'titre' => fake()->sentence(3),
            'description' => fake()->paragraph(2),
            'intervenant' => fake()->name(),
            'date_programme' => fake()->date(),
            'heure_debut' => '09:00',
            'heure_fin' => '10:30',
            'salle' => fake()->randomElement(['Salle 101', 'Auditorium', 'Lab 3']),
            'type_section' => fake()->randomElement(['conference', 'atelier', 'table ronde']),
            'ordre' => fake()->numberBetween(1, 8),
        ];
    }
}
