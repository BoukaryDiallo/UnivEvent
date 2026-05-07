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

        // 1. Club (organisateur représentant un club)
        User::updateOrCreate(
            ['email' => 'club@example.com'],
            [
                'name' => 'Club Informatique',
                'password' => $password,
                'role' => 'organisateur',
                'est_actif' => true,
                'email_verified_at' => now(),
            ],
        );

        // 2. 10 étudiants (etudiant1@example.com à etudiant10@example.com)
        for ($i = 1; $i <= 10; $i++) {
            User::updateOrCreate(
                ['email' => "etudiant{$i}@example.com"],
                [
                    'name' => "Étudiant {$i}",
                    'password' => $password,
                    'role' => 'etudiant',
                    'est_actif' => true,
                    'email_verified_at' => now(),
                ],
            );
        }

        // 4. 10 enseignants (enseignant1@example.com à enseignant10@example.com)
        for ($i = 1; $i <= 10; $i++) {
            User::updateOrCreate(
                ['email' => "enseignant{$i}@example.com"],
                [
                    'name' => "Enseignant {$i}",
                    'password' => $password,
                    'role' => 'enseignant',
                    'est_actif' => true,
                    'email_verified_at' => now(),
                ],
            );
        }

        // 5. Autres rôles pour tests
        $otherUsers = [
            ['name' => 'Intervenant Demo', 'email' => 'intervenant@example.com', 'role' => 'intervenant'],
            ['name' => 'Jury Demo', 'email' => 'jury@example.com', 'role' => 'jury'],
            ['name' => 'Participant Demo', 'email' => 'participant@example.com', 'role' => 'participant'],
        ];

        foreach ($otherUsers as $user) {
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