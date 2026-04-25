<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            AdminSeeder::class,
            UserRolesSeeder::class,
            EvenementSeeder::class,
        ]);

        User::factory(12)->create();

        User::updateOrCreate(
            ['email' => 'test1@example.com'],
            [
                'name' => 'Test User',
                'password' => bcrypt('password1234!'),
                'role' => 'etudiant',
                'est_actif' => true,
            ],
        );
    }
}
