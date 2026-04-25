<?php

namespace Database\Seeders;

use App\Models\Evenement;
use App\Models\InscriptionEvenement;
use App\Models\Programme;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class EvenementSeeder extends Seeder
{
    public function run(): void
    {
        $creator = User::firstOrCreate(
            ['email' => 'organisateur@example.com'],
            [
                'name' => 'Organisateur Demo',
                'password' => bcrypt('password1234!'),
                'role' => 'organisateur',
                'est_actif' => true,
                'email_verified_at' => now(),
            ],
        );

        $participants = User::query()
            ->whereIn('role', ['participant', 'etudiant'])
            ->where('est_actif', true)
            ->take(6)
            ->get();

        $intervenants = User::query()
            ->whereIn('role', ['intervenant', 'enseignant'])
            ->where('est_actif', true)
            ->take(3)
            ->get();

        $juryMembers = User::query()
            ->whereIn('role', ['jury', 'enseignant'])
            ->where('est_actif', true)
            ->take(2)
            ->get();

        $conference = Evenement::factory()
            ->conference()
            ->create([
                'titre' => 'Forum innovation numerique',
                'description' => '<p><strong>Une journee complete</strong> consacree a l innovation, aux retours d experience et aux demos des clubs.</p><p>Des images, documents et intervenants sont rattaches a cet evenement pour valider l affichage final.</p>',
                'cree_par' => $creator->id,
                'statut' => 'publie',
                'visibilite' => 'public',
                'public_cible' => 'etudiants et enseignants',
            ]);

        $conference->roles()->createMany([
            ['category' => 'audience', 'role' => 'etudiant'],
            ['category' => 'audience', 'role' => 'enseignant'],
            ['category' => 'audience', 'role' => 'intervenant'],
        ]);

        $conference->assignments()->createMany(
            [
                ['category' => 'assignment', 'role' => 'organisateur', 'user_id' => $creator->id, 'can_manage_messages' => true, 'can_manage_comments' => true, 'can_edit_event' => true, 'can_change_visibility' => true, 'can_manage_certificates' => true],
                ...$intervenants->map(fn (User $user) => ['category' => 'assignment', 'role' => 'intervenant', 'user_id' => $user->id])->all(),
                ...$participants->take(2)->map(fn (User $user) => ['category' => 'assignment', 'role' => 'participant', 'user_id' => $user->id])->all(),
            ],
        );

        Programme::factory()->count(3)->create([
            'evenement_id' => $conference->id,
            'date_programme' => optional($conference->date_debut)->toDateString(),
        ]);

        foreach ($participants->take(4) as $participant) {
            InscriptionEvenement::factory()->create([
                'evenement_id' => $conference->id,
                'utilisateur_id' => $participant->id,
                'statut' => 'accepte',
                'access_token' => Str::uuid()->toString(),
            ]);
        }

        $concours = Evenement::factory()
            ->concours()
            ->create([
                'titre' => 'Challenge projets campus',
                'description' => '<p><strong>Competition inter-filiere</strong> avec jury, candidats et remise des resultats.</p><p>Le seed rattache un jury et des participants pour tester la nouvelle zone d affectation.</p>',
                'cree_par' => $creator->id,
                'statut' => 'publie',
                'visibilite' => 'restreint',
                'public_cible' => 'participants et jury',
            ]);

        $concours->roles()->createMany([
            ['category' => 'audience', 'role' => 'participant'],
            ['category' => 'audience', 'role' => 'jury'],
            ['category' => 'audience', 'role' => 'enseignant'],
        ]);

        $concours->assignments()->createMany(
            [
                ['category' => 'assignment', 'role' => 'organisateur', 'user_id' => $creator->id, 'can_manage_messages' => true, 'can_manage_comments' => true, 'can_edit_event' => true, 'can_change_visibility' => true, 'can_manage_certificates' => true],
                ...$juryMembers->values()->map(fn (User $user, int $index) => ['category' => 'assignment', 'role' => 'jury', 'user_id' => $user->id, 'is_president_jury' => $index === 0, 'can_manage_results' => true])->all(),
                ...$participants->take(3)->map(fn (User $user) => ['category' => 'assignment', 'role' => 'participant', 'user_id' => $user->id])->all(),
            ],
        );

        $panel = $concours->juryPanel()->create([
            'president_user_id' => $juryMembers->first()?->id,
            'admission_average' => 10,
            'seats_count' => 2,
            'ranking_mode' => 'final_note',
            'tie_break_rule' => 'name',
        ]);

        $panel->criteria()->createMany([
            ['nom' => 'Innovation', 'description' => 'Originalite et potentiel', 'bareme' => 20, 'coefficient' => 2, 'ordre' => 1, 'actif' => true],
            ['nom' => 'Impact', 'description' => 'Valeur et portee du projet', 'bareme' => 20, 'coefficient' => 2, 'ordre' => 2, 'actif' => true],
            ['nom' => 'Presentation', 'description' => 'Qualite de la soutenance', 'bareme' => 20, 'coefficient' => 1, 'ordre' => 3, 'actif' => true],
        ]);

        foreach ($participants->take(3) as $participant) {
            InscriptionEvenement::factory()->create([
                'evenement_id' => $concours->id,
                'utilisateur_id' => $participant->id,
                'statut' => 'en_attente',
                'access_token' => Str::uuid()->toString(),
            ]);
        }
    }
}
