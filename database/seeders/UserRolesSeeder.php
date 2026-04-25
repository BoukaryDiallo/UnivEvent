<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserRolesSeeder extends Seeder
{
    public function run(): void
    {
        $password = Hash::make('password1234!');

        $users = [
            ['name' => 'Organisateur Demo', 'email' => 'organisateur@example.com', 'role' => 'organisateur'],
            ['name' => 'Intervenant Demo', 'email' => 'intervenant@example.com', 'role' => 'intervenant'],
            ['name' => 'Jury Demo', 'email' => 'jury@example.com', 'role' => 'jury'],
            ['name' => 'Participant Demo', 'email' => 'participant@example.com', 'role' => 'participant'],
            ['name' => 'Enseignant Demo', 'email' => 'enseignant@example.com', 'role' => 'enseignant'],
            ['name' => 'Etudiant Demo', 'email' => 'etudiant@example.com', 'role' => 'etudiant'],
        ];

        foreach ($users as $user) {
            User::updateOrCreate(
                ['email' => $user['email']],
                [
                    'name' => $user['name'],
                    'password' => $password,
                    'role' => $user['role'],
                    'est_actif' => true,
                    'email_verified_at' => now(),
                ],
            );
        }
    }
}
