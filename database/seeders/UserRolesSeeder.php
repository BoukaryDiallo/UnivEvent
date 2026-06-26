<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserRolesSeeder extends Seeder
{
    public function run(): void
    {
        $password = Hash::make('password1234!');
        foreach (['organisateur', 'etudiant', 'enseignant', 'intervenant', 'jury', 'participant'] as $role) {
            Role::firstOrCreate(['name' => $role]);
        }

        // 1. Club (organisateur représentant un club)
        $club = User::updateOrCreate(
            ['email' => 'club@example.com'],
            [
                'name' => 'Club Informatique',
                'password' => $password,
                'role' => 'organisateur',
                'est_actif' => true,
                'email_verified_at' => now(),
            ],
        );
        $club->syncRoles(['organisateur']);

        // 2. 10 étudiants (etudiant1@example.com à etudiant10@example.com)
        for ($i = 1; $i <= 10; $i++) {
            $student = User::updateOrCreate(
                ['email' => "etudiant{$i}@example.com"],
                [
                    'name' => "Étudiant {$i}",
                    'password' => $password,
                    'role' => 'etudiant',
                    'est_actif' => true,
                    'email_verified_at' => now(),
                ],
            );
            $student->syncRoles(['etudiant']);
        }

        // 4. 10 enseignants (enseignant1@example.com à enseignant10@example.com)
        for ($i = 1; $i <= 10; $i++) {
            $teacher = User::updateOrCreate(
                ['email' => "enseignant{$i}@example.com"],
                [
                    'name' => "Enseignant {$i}",
                    'password' => $password,
                    'role' => 'enseignant',
                    'est_actif' => true,
                    'email_verified_at' => now(),
                ],
            );
            $teacher->syncRoles(['enseignant']);
        }

        // 5. Autres rôles pour tests
        $otherUsers = [
            ['name' => 'Intervenant Demo', 'email' => 'intervenant@example.com', 'role' => 'intervenant'],
            ['name' => 'Jury Demo', 'email' => 'jury@example.com', 'role' => 'jury'],
            ['name' => 'Participant Demo', 'email' => 'participant@example.com', 'role' => 'participant'],
        ];

        foreach ($otherUsers as $user) {
            $demoUser = User::updateOrCreate(
                ['email' => $user['email']],
                [
                    'name' => $user['name'],
                    'password' => $password,
                    'role' => $user['role'],
                    'est_actif' => true,
                    'email_verified_at' => now(),
                ],
            );
            $demoUser->syncRoles([$user['role']]);
        }
    }
}
