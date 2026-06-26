<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RbacSeeder::class,
            UserRolesSeeder::class,
            EvenementSeeder::class,
        ]);

        $admin = User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Test Admin',
                'password' => bcrypt('password'),
                'role' => 'admin',
                'est_actif' => true,
                'email_verified_at' => now(),
            ],
        );
        $admin->syncRoles(['admin']);

        $this->call(DiplomaModuleSeeder::class);
    }
}
