<?php

namespace Tests\Feature\Module2;

use Tests\TestCase;
use App\Models\User;
use App\Models\Prise;
use App\Models\Seance;
use App\Models\Niveau;
use App\Models\Salle;
use App\Models\Matiere;
use App\Models\Enseignant;
use App\Models\EmploiDuTemps;
use App\Contrats\DispoContrat;
use Illuminate\Support\Facades\DB;
use Illuminate\Foundation\Testing\RefreshDatabase;

class SeanceTest extends TestCase
{
    use RefreshDatabase;

    protected bool $seed = true;
    protected string $seeder = \Database\Seeders\RbacSeeder::class;

    private User $admin;
    private EmploiDuTemps $edt;
    private array $payload;

    protected function setUp(): void
    {
        parent::setUp();

        // Crée un admin
        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');

        // Crée l'EDT avec dates futures
        $this->edt = EmploiDuTemps::factory()->create([
            'date_debut' => now()->addDays(10)->format('Y-m-d'),
            'date_fin'   => now()->addMonths(6)->format('Y-m-d'),
        ]);

        // Crée les dépendances
        $creneau = DB::table('creneaux')->insertGetId([
            'heure_debut' => '08:00:00',
            'heure_fin'   => '10:00:00',
            'libelle'     => 'Matin',
            'created_at'  => now(),
            'updated_at'  => now(),
        ]);

        $salle = DB::table('salles')->insertGetId([
            'nom'        => 'Salle A1',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $matiere = DB::table('matieres')->insertGetId([
            'code'                => 'INF101',
            'intitule'            => 'Algorithmique',
            'volume_horaire_cm'   => 20,
            'volume_horaire_td'   => 10,
            'volume_horaire_tp'   => 10,
            'created_at'          => now(),
            'updated_at'          => now(),
        ]);

        // Crée un enseignant avec son user
        $enseignantUser = User::factory()->create();
        $enseignantId = DB::table('enseignants')->insertGetId([
            'user_id'    => $enseignantUser->id,
            'nom'        => 'Diallo',
            'prenom'     => 'Moussa',
            'telephone'  => '0600000000',
            'specialite' => 'Informatique',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Mock du service DispoContrat
        $prise = Prise::create([
            'user_id' => $this->admin->id,
            'date'    => now()->addDays(10)->format('Y-m-d'),
            'debut'   => '08:00:00',
            'fin'     => '10:00:00',
            'source'  => 'emploi du temps',
            'ref'     => 'seance-edt-' . $this->edt->id,
            'motif'   => '',
            'niveau'  => '',
        ]);

        $mockMetier = $this->createMock(DispoContrat::class);
        $mockMetier->method('prendre')->willReturn($prise);
        $this->app->instance(DispoContrat::class, $mockMetier);

        $this->payload = [
            'jour_semaine'  => 'Lundi',
            'type_seance'   => 'CM',
            'creneau_id'    => $creneau,
            'enseignant_id' => $enseignantUser->id,
            'salle_id'      => $salle,
            'matiere_id'    => $matiere,
            'description'   => 'Cours magistral',
            'user_id'       => $this->admin->id,
            'check_date'    => now()->addDays(10)->format('Y-m-d'),
            'check_debut'   => '08:00',
            'check_fin'     => '10:00',
            'niveau'        => null,
        ];
    }

    // ✅ CAS 1 : Ajout réussi
    public function test_ajout_seance_reussi(): void
    {
        $this->actingAs($this->admin)
            ->post(route('emploie-du-temps.ajouter-seance', $this->edt->id), $this->payload)
            ->assertSessionHas('success');

        $this->assertDatabaseHas('seances', [
            'emploi_du_temps_id' => $this->edt->id,
            'jour_semaine'       => 'Lundi',
            'type_seance'        => 'CM',
        ]);
    }

    // ❌ CAS 2 : Conflit de jour (même jour dans le même EDT)
    public function test_conflit_jour_meme_edt(): void
    {
        // Crée une séance existante le Lundi
        Seance::create([
            'emploi_du_temps_id' => $this->edt->id,
            'jour_semaine'       => 'Lundi',
            'type_seance'        => 'TD',
            'creneau_id'         => $this->payload['creneau_id'],
            'salle_id'           => $this->payload['salle_id'],
            'matiere_id'         => $this->payload['matiere_id'],
            'enseignant_id'      => DB::table('enseignants')->first()->id,
            'prise_id'           => null,
        ]);

        $this->actingAs($this->admin)
            ->post(route('emploie-du-temps.ajouter-seance', $this->edt->id), $this->payload)
            ->assertSessionHasErrors('conflit');
    }

    // ❌ CAS 3 : Conflit de salle
    public function test_conflit_salle(): void
    {
        // Crée un autre EDT qui chevauche les mêmes dates
        $autreEdt = EmploiDuTemps::factory()->create([
            'date_debut' => $this->edt->date_debut,
            'date_fin'   => $this->edt->date_fin,
        ]);

        Seance::create([
            'emploi_du_temps_id' => $autreEdt->id,
            'jour_semaine'       => 'Lundi',
            'type_seance'        => 'CM',
            'creneau_id'         => $this->payload['creneau_id'],
            'salle_id'           => $this->payload['salle_id'], // même salle
            'matiere_id'         => $this->payload['matiere_id'],
            'enseignant_id'      => DB::table('enseignants')->first()->id,
            'prise_id'           => null,
        ]);

        $this->actingAs($this->admin)
            ->post(route('emploie-du-temps.ajouter-seance', $this->edt->id), $this->payload)
            ->assertSessionHasErrors('conflit');
    }

    // ❌ CAS 4 : Conflit enseignant
    public function test_conflit_enseignant(): void
    {
        $autreEdt = EmploiDuTemps::factory()->create([
            'date_debut' => $this->edt->date_debut,
            'date_fin'   => $this->edt->date_fin,
        ]);

        // Crée une autre salle pour ne pas déclencher le conflit salle
        $autreSalle = DB::table('salles')->insertGetId([
            'nom'        => 'Salle B2',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $enseignantDb = DB::table('enseignants')
            ->where('user_id', $this->payload['enseignant_id'])
            ->first();

        Seance::create([
            'emploi_du_temps_id' => $autreEdt->id,
            'jour_semaine'       => 'Lundi',
            'type_seance'        => 'CM',
            'creneau_id'         => $this->payload['creneau_id'],
            'salle_id'           => $autreSalle,        // salle différente
            'matiere_id'         => $this->payload['matiere_id'],
            'enseignant_id'      => $enseignantDb->id,  // même enseignant
            'prise_id'           => null,
        ]);

        $this->actingAs($this->admin)
            ->post(route('emploie-du-temps.ajouter-seance', $this->edt->id), $this->payload)
            ->assertSessionHasErrors('conflit');
    }

    // ❌ CAS 5 : Validation — champs requis manquants
    public function test_validation_champs_requis(): void
    {
        $this->actingAs($this->admin)
            ->post(route('emploie-du-temps.ajouter-seance', $this->edt->id), [])
            ->assertSessionHasErrors([
                'jour_semaine', 'type_seance', 'creneau_id',
                'enseignant_id', 'salle_id', 'matiere_id',
                'user_id', 'check_date', 'check_debut', 'check_fin',
            ]);
    }

    // ❌ CAS 6 : Type de séance invalide
    public function test_type_seance_invalide(): void
    {
        $this->actingAs($this->admin)
            ->post(route('emploie-du-temps.ajouter-seance', $this->edt->id),
                array_merge($this->payload, ['type_seance' => 'COURS']))
            ->assertSessionHasErrors('type_seance');
    }

    // ❌ CAS 7 : EDT inexistant
    public function test_edt_inexistant(): void
    {
        $this->actingAs($this->admin)
            ->post(route('emploie-du-temps.ajouter-seance', 99999), $this->payload)
            ->assertStatus(404);
    }

    // ❌ CAS 8 : Non authentifié
    public function test_non_authentifie_redirige(): void
    {
        $this->post(route('emploie-du-temps.ajouter-seance', $this->edt->id), $this->payload)
            ->assertRedirect(route('login'));
    }
}