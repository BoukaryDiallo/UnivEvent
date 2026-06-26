<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Réinitialiser le cache des permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Créer les permissions du module soutenances
        $permissions = [
            'voir soutenances',
            'creer soutenance',
            'modifier soutenance',
            'supprimer soutenance',
            'voir jurys',
            'creer jury',
            'modifier jury',
            'supprimer jury',
            'voir salles',
            'creer salle',
            'modifier salle',
            'supprimer salle',
            'voir notifications',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Créer les rôles
        $admin = Role::firstOrCreate(['name' => 'admin']);
        $enseignant = Role::firstOrCreate(['name' => 'enseignant']);
        $etudiant = Role::firstOrCreate(['name' => 'etudiant']);

        // Admin a toutes les permissions
        $admin->syncPermissions($permissions);

        // Enseignant peut voir soutenances, jurys et notifications
        $enseignant->syncPermissions([
            'voir soutenances',
            'voir jurys',
            'voir notifications',
        ]);

        // Étudiant peut seulement voir ses soutenances et notifications
        $etudiant->syncPermissions([
            'voir soutenances',
            'voir notifications',
        ]);

        $this->command->info('Rôles et permissions créés avec succès !');
    }
}
