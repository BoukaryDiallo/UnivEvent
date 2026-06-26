<?php

namespace Database\Factories\Module2;

use App\Models\Niveau;
use Illuminate\Database\Eloquent\Factories\Factory;

class NiveauFactory extends Factory
{
    protected $model = Niveau::class;

    public function definition(): array
    {
        static $ordre = 1;

        return [
            'nom' => 'Niveau '.$ordre,
            'code' => 'N'.$ordre,
            'ordre' => $ordre++,
        ];
    }
}
