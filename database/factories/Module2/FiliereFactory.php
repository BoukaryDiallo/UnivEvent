<?php

namespace Database\Factories\Module2;

use App\Models\Filiere;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\DB;

class FiliereFactory extends Factory
{
    protected $model = Filiere::class;

    public function definition(): array
    {
        // 1. Crée une UFR
        $ufrId = DB::table('ufrs')->insertGetId([
            'nom'        => 'UFR ' . $this->faker->unique()->word(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 2. Crée un département lié à l'UFR
        $departementId = DB::table('departements')->insertGetId([
            'id_ufr'     => $ufrId,
            'nom'        => 'Dept ' . $this->faker->unique()->word(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 3. Retourne la filière liée au département
        return [
            'id_departement' => $departementId,
            'nom'            => $this->faker->unique()->word() . ' Informatique',
            'code'           => strtoupper($this->faker->unique()->lexify('??')),
        ];
    }
}