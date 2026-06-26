<?php

namespace Database\Factories\Module2;

use App\Models\AnneeAcademique;
use Illuminate\Database\Eloquent\Factories\Factory;

class AnneeAcademiqueFactory extends Factory
{
    protected $model = AnneeAcademique::class;

    public function definition(): array
    {
        $debut = $this->faker->unique()->numberBetween(2000, 2050);

        return [
            'libelle' => "{$debut}-".($debut + 1),
            'date_debut' => (string) $debut,
            'date_fin' => (string) ($debut + 1),
            'est_courante' => false,
        ];
    }
}
