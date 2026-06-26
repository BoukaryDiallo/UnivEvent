<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class AuthFunctionalTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        Role::firstOrCreate(['name' => 'admin',      'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'enseignant', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'etudiant',   'guard_name' => 'web']);

        Permission::firstOrCreate(['name' => 'read',   'guard_name' => 'web']);
        Permission::firstOrCreate(['name' => 'create', 'guard_name' => 'web']);
        Permission::firstOrCreate(['name' => 'update', 'guard_name' => 'web']);
        Permission::firstOrCreate(['name' => 'delete', 'guard_name' => 'web']);
    }

    private function createUser(string $role, array $overrides = []): User
    {
        $attributes = array_merge(['role' => $role], $overrides);
        $email = $attributes['email'] ?? null;

        $user = $email ? User::where('email', $email)->first() : null;

        if ($user) {
            $user->fill($attributes)->save();
        } else {
            $user = User::factory()->create($attributes);
        }

        $user->syncRoles([$role]);

        return $user;
    }

    public function test_admin_peut_se_connecter(): void
    {
        $admin = $this->createUser('admin', [
            'email' => 'admin@gmail.com',
            'password' => bcrypt('password'),
        ]);

        $response = $this->post('/login', [
            'email' => 'admin@gmail.com',
            'password' => 'password',
        ]);

        $this->assertAuthenticatedAs($admin);
        $response->assertRedirect('/dashboard');
    }

    public function test_enseignant_peut_se_connecter(): void
    {
        $enseignant = $this->createUser('enseignant', [
            'email' => 'enseignant@test.com',
            'password' => bcrypt('password'),
        ]);

        $response = $this->post('/login', [
            'email' => 'enseignant@test.com',
            'password' => 'password',
        ]);

        $this->assertAuthenticatedAs($enseignant);
        $response->assertRedirect('/dashboard');
    }

    public function test_etudiant_peut_se_connecter(): void
    {
        $etudiant = $this->createUser('etudiant', [
            'email' => 'etudiant@test.com',
            'password' => bcrypt('password'),
        ]);

        $response = $this->post('/login', [
            'email' => 'etudiant@test.com',
            'password' => 'password',
        ]);

        $this->assertAuthenticatedAs($etudiant);
        $response->assertRedirect('/dashboard');
    }

    public function test_mauvais_mot_de_passe_retourne_erreur(): void
    {
        $this->createUser('etudiant', [
            'email' => 'user@test.com',
            'password' => bcrypt('bon_mot_de_passe'),
        ]);

        $response = $this->post('/login', [
            'email' => 'user@test.com',
            'password' => 'mauvais_mot_de_passe',
        ]);

        $response->assertSessionHasErrors(['email']);
        $this->assertGuest();
    }

    public function test_admin_accede_au_dashboard_et_pages_admin(): void
    {
        $admin = $this->createUser('admin');

        // Dashboard
        $this->actingAs($admin)
            ->get('/dashboard')
            ->assertStatus(200);

        // Gestion utilisateurs
        $this->actingAs($admin)
            ->get('/admin/users')
            ->assertStatus(200);

        // Permissions
        $this->actingAs($admin)
            ->get('/admin/permissions')
            ->assertStatus(200);
    }

    public function test_enseignant_na_pas_acces_aux_pages_admin(): void
    {
        $enseignant = $this->createUser('enseignant');

        $this->actingAs($enseignant)
            ->get('/admin/users')
            ->assertStatus(403);

        $this->actingAs($enseignant)
            ->get('/admin/permissions')
            ->assertStatus(403);
    }

    public function test_etudiant_na_pas_acces_aux_pages_admin(): void
    {
        $etudiant = $this->createUser('etudiant');

        $this->actingAs($etudiant)
            ->get('/admin/users')
            ->assertStatus(403);

        $this->actingAs($etudiant)
            ->get('/admin/permissions')
            ->assertStatus(403);
    }

    public function test_invite_redirige_vers_login(): void
    {
        $this->get('/admin/users')->assertRedirect('/login');
        $this->get('/admin/permissions')->assertRedirect('/login');
        $this->get('/dashboard')->assertRedirect('/login');
    }

    public function test_modifier_le_profil_fonctionne(): void
    {
        $user = $this->createUser('etudiant', [
            'name' => 'Ancien Nom',
            'email' => 'ancien@test.com',
        ]);

        $response = $this->actingAs($user)->patch('/settings/profile', [
            'name' => 'Nouveau Nom',
            'email' => 'nouveau@test.com',
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect(route('profile.edit'));

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Nouveau Nom',
            'email' => 'nouveau@test.com',
        ]);
    }

    public function test_modifier_profil_avec_email_invalide_echoue(): void
    {
        $user = $this->createUser('etudiant');

        $response = $this->actingAs($user)->patch('/settings/profile', [
            'name' => 'Test',
            'email' => 'pas-un-email',
        ]);

        $response->assertSessionHasErrors(['email']);
    }

    public function test_deconnexion_redirige_vers_accueil(): void
    {
        $user = $this->createUser('etudiant');

        $response = $this->actingAs($user)->post('/logout');

        $this->assertGuest();
        $response->assertRedirect('/');
    }
}
