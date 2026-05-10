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

        // Permissions pour le système de vote et gestion
        $permissions = [
            // Permissions générales
            'read',
            'create',
            'update',
            'delete',
            // Module 8 — Retraits de diplômes
            'diplomas.manage',     // toutes les actions scolarité (file, dossiers, agenda, validation, rejet, remise, archivage, créneaux)
            
            // Permissions pour les élections
            'manage elections',
            'create elections',
            'edit elections',
            'delete elections',
            'view elections',
            'generate electoral lists',
            'manage candidates',
            'validate candidates',
            'publish results',
            
            // Permissions pour les votes
            'vote',
            'view voting results',
            'manage voting process',
            
            // Permissions pour la structure académique
            'manage ufr',
            'manage departments',
            'manage filieres',
            'manage students',
            
            // Permissions pour les clubs et activités
            'manage clubs',
            'manage activities',
            'manage budgets',
            'manage locals',
            
            // Permissions administratives
            'manage users',
            'manage roles',
            'manage permissions',
            'view dashboard',
            'access admin panel'
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm]);
        }

        $admin = Role::firstOrCreate(['name' => 'admin']);
        $enseignant = Role::firstOrCreate(['name' => 'enseignant']);
        $etudiant = Role::firstOrCreate(['name' => 'etudiant']);

        $admin->syncPermissions(Permission::all());

        // Enseignant : permissions pour gérer les cours et les élections
        $enseignant->syncPermissions([
            'read',
            'create',
            'update',
            'manage elections',
            'create elections',
            'edit elections',
            'view elections',
            'manage candidates',
            'validate candidates',
            'manage departments',
            'manage filieres',
            'manage students',
            'manage clubs',
            'manage activities'
        ]);

        // Étudiant : permissions pour voter et participer
        $etudiant->syncPermissions([
            'read',
            'view elections',
            'vote',
            'view voting results',
            'manage clubs',
            'manage activities'
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
