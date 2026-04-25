<?php

namespace Tests\Feature;

use App\Models\Certificat;
use App\Models\Evenement;
use App\Models\InscriptionEvenement;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class EvenementsModuleTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_create_update_publish_and_archive_an_event(): void
    {
        Storage::fake('public');

        $creator = $this->createUser(role: 'organisateur');

        $this->actingAs($creator)
            ->post(route('evenements.store'), $this->eventPayload([
                'titre' => 'Forum Innovation',
                'media' => UploadedFile::fake()->image('affiche.jpg'),
            ]))
            ->assertRedirect();

        $event = Evenement::firstOrFail();

        $this->assertSame('Forum Innovation', $event->titre);
        $this->assertSame($creator->id, $event->cree_par);
        $this->assertDatabaseHas('evenement_medias', [
            'evenement_id' => $event->id,
            'nom_original' => 'affiche.jpg',
        ]);

        $this->actingAs($creator)
            ->put(route('evenements.update', $event), $this->eventPayload([
                'titre' => 'Forum Innovation 2026',
                'lieu' => 'Amphi B',
            ]))
            ->assertRedirect(route('evenements.show', $event));

        $this->assertDatabaseHas('evenements', [
            'id' => $event->id,
            'titre' => 'Forum Innovation 2026',
            'lieu' => 'Amphi B',
        ]);

        $this->actingAs($creator)
            ->post(route('evenements.publier', $event))
            ->assertRedirect();

        $this->assertDatabaseHas('evenements', [
            'id' => $event->id,
            'statut' => 'publie',
        ]);

        $this->actingAs($creator)
            ->post(route('evenements.archiver', $event))
            ->assertRedirect();

        $this->assertDatabaseHas('evenements', [
            'id' => $event->id,
            'statut' => 'cloture',
        ]);
    }

    public function test_non_manager_cannot_publish_or_archive_an_event(): void
    {
        $creator = $this->createUser(role: 'organisateur');
        $intruder = $this->createUser(role: 'etudiant');
        $event = $this->createEvent($creator, ['statut' => 'brouillon']);

        $this->actingAs($intruder)
            ->post(route('evenements.publier', $event))
            ->assertForbidden();

        $this->actingAs($intruder)
            ->post(route('evenements.archiver', $event))
            ->assertForbidden();
    }

    public function test_user_can_register_and_manager_can_validate_and_refuse_participation(): void
    {
        $creator = $this->createUser(role: 'organisateur');
        $participant = $this->createUser(role: 'etudiant');
        $event = $this->createEvent($creator, [
            'visibilite' => 'restreint',
            'statut' => 'publie',
        ]);

        $this->actingAs($participant)
            ->post(route('inscriptions.store'), [
                'evenement_id' => $event->id,
                'mode' => 'interesse',
            ])
            ->assertRedirect();

        $registration = InscriptionEvenement::firstOrFail();

        $this->assertSame('en_attente', $registration->statut);

        $this->actingAs($creator)
            ->patch(route('inscriptions.valider', $registration))
            ->assertRedirect();

        $this->assertDatabaseHas('inscription_evenements', [
            'id' => $registration->id,
            'statut' => 'accepte',
        ]);

        $this->actingAs($creator)
            ->patch(route('inscriptions.refuser', $registration))
            ->assertRedirect();

        $this->assertDatabaseHas('inscription_evenements', [
            'id' => $registration->id,
            'statut' => 'refuse',
        ]);
    }

    public function test_non_manager_cannot_moderate_event_registration(): void
    {
        $creator = $this->createUser(role: 'organisateur');
        $participant = $this->createUser(role: 'etudiant');
        $intruder = $this->createUser(role: 'etudiant');
        $event = $this->createEvent($creator, ['statut' => 'publie']);
        $registration = $this->createRegistration($event, $participant, ['statut' => 'en_attente']);

        $this->actingAs($intruder)
            ->patch(route('inscriptions.valider', $registration))
            ->assertForbidden();

        $this->actingAs($intruder)
            ->patch(route('inscriptions.refuser', $registration))
            ->assertForbidden();
    }

    public function test_qr_code_is_only_available_to_registration_owner_or_event_manager(): void
    {
        $creator = $this->createUser(role: 'organisateur');
        $participant = $this->createUser(role: 'etudiant');
        $intruder = $this->createUser(role: 'etudiant');
        $event = $this->createEvent($creator, ['statut' => 'publie']);
        $registration = $this->createRegistration($event, $participant, ['statut' => 'accepte']);

        $this->actingAs($participant)
            ->get(route('inscriptions.qr', $registration))
            ->assertOk();

        $this->actingAs($creator)
            ->get(route('inscriptions.qr', $registration))
            ->assertOk();

        $this->actingAs($intruder)
            ->get(route('inscriptions.qr', $registration))
            ->assertForbidden();
    }

    public function test_admin_scanner_requires_admin_or_event_creator_privileges(): void
    {
        $creator = $this->createUser(role: 'etudiant');
        $visitor = $this->createUser(role: 'etudiant');
        $admin = $this->createUser(role: 'admin');
        $this->createEvent($creator);

        $this->actingAs($visitor)
            ->get(route('acces.admin'))
            ->assertForbidden();

        $this->actingAs($creator)
            ->get(route('acces.admin'))
            ->assertOk();

        $this->actingAs($admin)
            ->get(route('acces.admin'))
            ->assertOk();
    }

    public function test_check_in_requires_active_event_and_accepted_registration(): void
    {
        $creator = $this->createUser(role: 'organisateur');
        $participant = $this->createUser(role: 'etudiant');
        $event = $this->createEvent($creator, [
            'statut' => 'publie',
            'checkin_active' => true,
        ]);
        $registration = $this->createRegistration($event, $participant, ['statut' => 'accepte']);

        $this->actingAs($creator)
            ->post(route('acces.checkIn', $registration->access_token))
            ->assertRedirect();

        $this->assertNotNull($registration->fresh()->checked_in_at);

        $inactiveEvent = $this->createEvent($creator, [
            'statut' => 'publie',
            'checkin_active' => false,
        ]);
        $inactiveRegistration = $this->createRegistration($inactiveEvent, $participant, ['statut' => 'accepte']);

        $this->actingAs($creator)
            ->post(route('acces.checkIn', $inactiveRegistration->access_token))
            ->assertForbidden();

        $pendingRegistration = $this->createRegistration($event, $this->createUser(role: 'jury'), ['statut' => 'en_attente']);

        $this->actingAs($creator)
            ->post(route('acces.checkIn', $pendingRegistration->access_token))
            ->assertForbidden();
    }

    public function test_certificate_generation_is_limited_to_managers_and_eligible_users(): void
    {
        Storage::fake('public');

        $creator = $this->createUser(role: 'organisateur');
        $participant = $this->createUser(role: 'etudiant');
        $intruder = $this->createUser(role: 'etudiant');
        $event = $this->createEvent($creator, ['statut' => 'publie']);

        $this->createRegistration($event, $participant, ['statut' => 'accepte']);

        $this->actingAs($intruder)
            ->post(route('certificats.generer'), [
                'evenement_id' => $event->id,
                'utilisateur_id' => $participant->id,
            ])
            ->assertForbidden();

        $this->actingAs($creator)
            ->post(route('certificats.generer'), [
                'evenement_id' => $event->id,
                'utilisateur_id' => $participant->id,
            ])
            ->assertOk()
            ->assertJsonPath('success', true);

        $certificate = Certificat::firstOrFail();

        $this->assertDatabaseHas('certificats', [
            'id' => $certificate->id,
            'evenement_id' => $event->id,
            'utilisateur_id' => $participant->id,
        ]);

        $ineligibleUser = $this->createUser(role: 'enseignant');

        $this->actingAs($creator)
            ->post(route('certificats.generer'), [
                'evenement_id' => $event->id,
                'utilisateur_id' => $ineligibleUser->id,
            ])
            ->assertStatus(422);
    }

    public function test_certificate_visibility_is_restricted_to_owner_or_event_manager(): void
    {
        Storage::fake('public');

        $creator = $this->createUser(role: 'organisateur');
        $owner = $this->createUser(role: 'etudiant');
        $intruder = $this->createUser(role: 'jury');
        $event = $this->createEvent($creator, ['statut' => 'publie']);

        $this->createRegistration($event, $owner, ['statut' => 'accepte']);

        $this->actingAs($creator)
            ->post(route('certificats.generer'), [
                'evenement_id' => $event->id,
                'utilisateur_id' => $owner->id,
            ])
            ->assertOk();

        $certificate = Certificat::firstOrFail();

        $this->actingAs($owner)
            ->get(route('certificats.show', $certificate))
            ->assertOk()
            ->assertJsonPath('id', $certificate->id);

        $this->actingAs($creator)
            ->get(route('certificats.show', $certificate))
            ->assertOk()
            ->assertJsonPath('id', $certificate->id);

        $this->actingAs($intruder)
            ->get(route('certificats.show', $certificate))
            ->assertForbidden();

        $this->actingAs($intruder)
            ->get(route('certificats.index', ['evenement_id' => $event->id]))
            ->assertOk()
            ->assertJsonCount(0);
    }

    private function createUser(string $role = 'etudiant'): User
    {
        return User::factory()->create([
            'role' => $role,
            'est_actif' => true,
        ]);
    }

    private function createEvent(User $creator, array $overrides = []): Evenement
    {
        return Evenement::query()->create([
            'titre' => 'Evenement test',
            'description' => 'Description de test',
            'type' => 'conference',
            'date_debut' => now()->addDay(),
            'date_fin' => now()->addDays(2),
            'lieu' => 'Amphi A',
            'visibilite' => 'public',
            'public_cible' => 'tous',
            'statut' => 'brouillon',
            'cree_par' => $creator->id,
            'inscription_requise' => true,
            'capacite_max' => 50,
            'checkin_active' => false,
            ...$overrides,
        ]);
    }

    private function createRegistration(Evenement $event, User $user, array $overrides = []): InscriptionEvenement
    {
        return InscriptionEvenement::query()->create([
            'evenement_id' => $event->id,
            'utilisateur_id' => $user->id,
            'donnees_formulaire' => [],
            'statut' => 'en_attente',
            'access_token' => 'token-'.$event->id.'-'.$user->id.'-'.str()->random(12),
            'checked_in_at' => null,
            ...$overrides,
        ]);
    }

    private function eventPayload(array $overrides = []): array
    {
        return [
            'titre' => 'Evenement pilote',
            'description' => 'Description test',
            'type' => 'conference',
            'date_debut' => now()->addDay()->format('Y-m-d H:i:s'),
            'date_fin' => now()->addDays(2)->format('Y-m-d H:i:s'),
            'lieu' => 'Amphi principal',
            'lien_live' => 'https://example.test/live',
            'visibilite' => 'public',
            'public_cible' => 'tous',
            'roles' => ['tous'],
            'programmes' => [
                [
                    'titre' => 'Ouverture',
                    'description' => 'Session d introduction',
                    'intervenant' => 'Equipe',
                    'date_programme' => now()->addDay()->toDateString(),
                    'heure_debut' => '09:00',
                    'heure_fin' => '10:00',
                    'salle' => 'Salle 1',
                    'type_section' => 'pleniere',
                    'ordre' => 1,
                ],
            ],
            'statut' => 'brouillon',
            'capacite_max' => 120,
            'inscription_requise' => true,
            'checkin_active' => true,
            ...$overrides,
        ];
    }
}
