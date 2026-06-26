<?php

namespace Tests\Feature\Module2;

use App\Models\AnneeAcademique;
use App\Models\EmploiDuTemps;
use App\Models\Filiere;
use App\Models\Niveau;
use App\Models\User;
use Database\Seeders\RbacSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EmploiDuTempsTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private array $payload;

    protected bool $seed = true;

    protected string $seeder = RbacSeeder::class;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->user->assignRole('admin');

        $annee = AnneeAcademique::factory()->create();
        $filiere = Filiere::factory()->create();
        $niveau = Niveau::factory()->create();

        $this->payload = [
            'titre' => 'EDT Test Unique '.uniqid(),
            'semestre' => 'S1',
            'annee_academique_id' => $annee->id,
            'filiere_id' => $filiere->id_filiere,
            'niveau_id' => $niveau->id,
            'groupe' => null,
            'date_debut' => now()->addDays(10)->format('Y-m-d'),
            'date_fin' => now()->addMonths(6)->format('Y-m-d'),
        ];
    }

    public function test_creation_sans_groupe(): void
    {
        $response = $this->actingAs($this->user)
            ->post(route('emploie-du-temps.ajouter'), $this->payload);

        $response->assertSessionHas('success');

        // Vérifie juste que l'EDT existe, sans vérifier le statut
        $this->assertDatabaseHas('emploi_du_temps', [
            'titre' => $this->payload['titre'],
        ]);

        // Affiche le statut réel pour déboguer
        $edt = EmploiDuTemps::where('titre', $this->payload['titre'])->first();
        $this->assertEquals('Brouillon', $edt->statut, "Statut réel: {$edt->statut}");
    }

    public function test_creation_avec_groupe(): void
    {
        $payload = array_merge($this->payload, ['groupe' => 'G1']);

        $this->actingAs($this->user)
            ->post(route('emploie-du-temps.ajouter'), $payload)
            ->assertSessionHas('success');
    }

    public function test_conflit_sans_groupe(): void
    {
        EmploiDuTemps::factory()->create([
            'annee_academique_id' => $this->payload['annee_academique_id'],
            'filiere_id' => $this->payload['filiere_id'],
            'niveau_id' => $this->payload['niveau_id'],
            'date_debut' => now()->addDays(10)->format('Y-m-d'),
            'date_fin' => now()->addMonths(6)->format('Y-m-d'),
            'groupe' => null,
        ]);

        $this->actingAs($this->user)
            ->post(route('emploie-du-temps.ajouter'), $this->payload)
            ->assertSessionHasErrors('conflit');
    }

    public function test_conflit_avec_groupe(): void
    {
        $payload = array_merge($this->payload, ['groupe' => 'G1']);

        EmploiDuTemps::factory()->create([
            'annee_academique_id' => $payload['annee_academique_id'],
            'filiere_id' => $payload['filiere_id'],
            'niveau_id' => $payload['niveau_id'],
            'date_debut' => now()->addDays(10)->format('Y-m-d'),
            'date_fin' => now()->addMonths(6)->format('Y-m-d'),
            'groupe' => 'G1',
        ]);

        $this->actingAs($this->user)
            ->post(route('emploie-du-temps.ajouter'), $payload)
            ->assertSessionHasErrors('conflit');
    }

    public function test_validation_champs_requis(): void
    {
        $this->actingAs($this->user)
            ->post(route('emploie-du-temps.ajouter'), [])
            ->assertSessionHasErrors(['titre', 'semestre', 'annee_academique_id', 'filiere_id', 'niveau_id']);
    }

    public function test_semestre_invalide(): void
    {
        $this->actingAs($this->user)
            ->post(route('emploie-du-temps.ajouter'), array_merge($this->payload, ['semestre' => 'S99']))
            ->assertSessionHasErrors('semestre');
    }

    public function test_date_fin_avant_date_debut(): void
    {
        $this->actingAs($this->user)
            ->post(route('emploie-du-temps.ajouter'), array_merge($this->payload, [
                'date_debut' => '2025-06-30',
                'date_fin' => '2025-01-06',
            ]))
            ->assertSessionHasErrors('date_fin');
    }

    public function test_non_authentifie_redirige(): void
    {
        $this->post(route('emploie-du-temps.ajouter'), $this->payload)
            ->assertRedirect(route('login'));
    }

    public function test_sans_role_admin_refuse(): void
    {
        $userSansRole = User::factory()->create();

        $this->actingAs($userSansRole)
            ->post(route('emploie-du-temps.ajouter'), $this->payload)
            ->assertForbidden(); // 403
    }
}
