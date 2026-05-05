<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RbacSeeder::class,
        ]);

        User::factory()->create([
            'name' => 'Test Admin',
            'email' => 'admin@example.com',
        ])->assignRole('admin');

        $this->call(DiplomaModuleSeeder::class);
    }
}
