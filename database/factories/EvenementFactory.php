<?php

namespace Database\Factories;

use App\Models\Evenement;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Evenement>
 */
class EvenementFactory extends Factory
{
    protected $model = Evenement::class;

    public function definition(): array
    {
        $startDate = fake()->dateTimeBetween('+3 days', '+30 days');
        $type = fake()->randomElement(['conference', 'concours']);

        return [
            'titre' => fake()->sentence(4),
            'description' => '<p><strong>'.fake()->sentence(3).'</strong></p><p>'.fake()->paragraph(3).'</p>',
            'type' => $type,
            'date_debut' => $startDate,
            'date_fin' => fake()->boolean(80) ? (clone $startDate)->modify('+4 hours') : null,
            'lieu' => fake()->randomElement(['Campus central', 'Amphi A', 'Salle innovation', 'Hall principal']),
            'lien_live' => fake()->boolean(35) ? fake()->url() : null,
            'visibilite' => fake()->randomElement(['public', 'prive', 'restreint']),
            'public_cible' => fake()->randomElement(['tous', 'etudiants', 'enseignants', 'club innovation']),
            'statut' => fake()->randomElement(['brouillon', 'publie']),
            'cree_par' => User::factory()->role('organisateur'),
            'inscription_requise' => fake()->boolean(85),
            'capacite_max' => fake()->boolean(70) ? fake()->numberBetween(30, 250) : null,
            'checkin_active' => fake()->boolean(50),
        ];
    }

    public function conference(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'conference',
        ]);
    }

    public function concours(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'concours',
        ]);
    }
}
