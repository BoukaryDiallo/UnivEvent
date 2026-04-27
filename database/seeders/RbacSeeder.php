<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RbacSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Permissions, definissez les permissions de vos modules ici ou directement
        //  dnas la vue admin
        // model de permisson : nom (string) exemple: 'create cours', 'update cours', etc...
        $permissions = [
            'read',
            'create',
            'update',
            'delete'
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm]);
        }

        // Roles
        $admin = Role::firstOrCreate(['name' => 'admin']);
        $enseignant = Role::firstOrCreate(['name' => 'enseignant']);
        $etudiant = Role::firstOrCreate(['name' => 'etudiant']);

        // Admin a toutes les permissions
        $admin->syncPermissions(Permission::all());

        // definnissez les permissions de 'enseignnat ici mais 
        // il faut d'abord les definir dans le tableau $permissions en haut
        $enseignant->syncPermissions([
            'read',
            'create',
            'update'
        ]);

        // definnissez les permissions de 'etudiant ici mais
        // il faut d'abord les definir dans le tableau $permissions en haut
        $etudiant->syncPermissions([
            'read'
        ]);


        // admin par defaut
        $admin = User::firstOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'name' => 'Admin',
                'password' => bcrypt('password')
            ]
        );
        $admin->assignRole('admin');

    }
}
