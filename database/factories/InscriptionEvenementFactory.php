<?php

namespace Database\Factories;

use App\Models\Evenement;
use App\Models\InscriptionEvenement;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<InscriptionEvenement>
 */
class InscriptionEvenementFactory extends Factory
{
    protected $model = InscriptionEvenement::class;

    public function definition(): array
    {
        return [
            'evenement_id' => Evenement::factory(),
            'utilisateur_id' => User::factory()->role('participant'),
            'donnees_formulaire' => [],
            'statut' => fake()->randomElement(['en_attente', 'accepte']),
            'access_token' => Str::uuid()->toString(),
            'checked_in_at' => null,
            'is_waitlist' => false,
            'waitlist_position' => null,
        ];
    }
}
