<?php

namespace Database\Factories\Module2;

use App\Models\AnneeAcademique;
use App\Models\EmploiDuTemps;
use App\Models\Filiere;
use App\Models\Niveau;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class EmploiDuTempsFactory extends Factory
{
    protected $model = EmploiDuTemps::class;

    public function definition(): array
    {
        return [
            'titre' => 'EDT '.$this->faker->words(3, true),
            'semestre' => $this->faker->randomElement(['S1', 'S2', 'S3', 'S4', 'S5', 'S6']),
            'annee_academique_id' => AnneeAcademique::factory(),
            'filiere_id' => Filiere::factory(),
            'niveau_id' => Niveau::factory(),
            'groupe' => null,
            'date_debut' => '2026-01-06',
            'date_fin' => '2026-06-30',
            'statut' => 'Brouillon',
            'user_id' => User::factory(),
        ];
    }
}
