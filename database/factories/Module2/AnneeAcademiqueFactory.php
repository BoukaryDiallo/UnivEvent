<?php

namespace Database\Factories\Module2;

use App\Models\AnneeAcademique;
use Illuminate\Database\Eloquent\Factories\Factory;

class AnneeAcademiqueFactory extends Factory
{
    protected $model = AnneeAcademique::class;

    public function definition(): array
    {
        $debut = $this->faker->numberBetween(2020, 2025);

        return [
            'libelle'      => "{$debut}-" . ($debut + 1),
            'date_debut'   => (string) $debut,
            'date_fin'     => (string) ($debut + 1),
            'est_courante' => false,
        ];
    }
}