<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RbacSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'read',
            'create',
            'update',
            'delete',
            // Module 8 — Retraits de diplômes
            'diplomas.manage',     // toutes les actions scolarité (file, dossiers, agenda, validation, rejet, remise, archivage, créneaux)
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm]);
        }

        $admin = Role::firstOrCreate(['name' => 'admin']);
        $enseignant = Role::firstOrCreate(['name' => 'enseignant']);
        $etudiant = Role::firstOrCreate(['name' => 'etudiant']);

        $admin->syncPermissions(Permission::all());

        $enseignant->syncPermissions([
            'read',
            'create',
            'update',
        ]);

        $etudiant->syncPermissions([
            'read',
        ]);

        $admin = User::firstOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'name' => 'Admin',
                'password' => bcrypt('password'),
            ],
        );
        $admin->assignRole('admin');
    }
}
