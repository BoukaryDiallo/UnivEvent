<?php

namespace Database\Seeders;

use App\Models\Certificat;
use App\Models\EventMessage;
use App\Models\EventNotification;
use App\Models\Evenement;
use App\Models\EvenementComment;
use App\Models\InscriptionEvenement;
use App\Models\Programme;
use App\Models\Resultat;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class EvenementSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            EventNotification::query()->delete();
            Evenement::query()->delete();

            $users = $this->seedUserPools();

            $this->seedPublishedConference($users);
            $this->seedFullConferenceWithWaitlist($users);
            $this->seedApprovalRequiredConference($users);
            $this->seedCompetitionWithJuryAndResults($users);
            $this->seedPendingValidationEvent($users);
            $this->seedRejectedEvent($users);
            $this->seedClosedEvent($users);
        });
    }

    private function seedUserPools(): array
    {
        $password = Hash::make('password1234!');

        $organizers = collect(range(1, 4))->map(function (int $index) use ($password) {
            return User::updateOrCreate(
                ['email' => "seed.organisateur{$index}@example.com"],
                [
                    'name' => "Organisateur Seed {$index}",
                    'password' => $password,
                    'role' => 'organisateur',
                    'est_actif' => true,
                    'email_verified_at' => now(),
                ],
            );
        });

        $students = collect(range(1, 18))->map(function (int $index) use ($password) {
            return User::updateOrCreate(
                ['email' => "seed.etudiant{$index}@example.com"],
                [
                    'name' => "Etudiant Seed {$index}",
                    'password' => $password,
                    'role' => 'etudiant',
                    'est_actif' => true,
                    'email_verified_at' => now(),
                ],
            );
        });

        $teachers = collect(range(1, 8))->map(function (int $index) use ($password) {
            return User::updateOrCreate(
                ['email' => "seed.enseignant{$index}@example.com"],
                [
                    'name' => "Enseignant Seed {$index}",
                    'password' => $password,
                    'role' => 'enseignant',
                    'est_actif' => true,
                    'email_verified_at' => now(),
                ],
            );
        });

        $intervenants = collect(range(1, 5))->map(function (int $index) use ($password) {
            return User::updateOrCreate(
                ['email' => "seed.intervenant{$index}@example.com"],
                [
                    'name' => "Intervenant Seed {$index}",
                    'password' => $password,
                    'role' => 'intervenant',
                    'est_actif' => true,
                    'email_verified_at' => now(),
                ],
            );
        });

        $jury = collect(range(1, 4))->map(function (int $index) use ($password) {
            return User::updateOrCreate(
                ['email' => "seed.jury{$index}@example.com"],
                [
                    'name' => "Jury Seed {$index}",
                    'password' => $password,
                    'role' => 'jury',
                    'est_actif' => true,
                    'email_verified_at' => now(),
                ],
            );
        });

        return compact('organizers', 'students', 'teachers', 'intervenants', 'jury');
    }

    private function seedPublishedConference(array $users): void
    {
        $creator = $users['organizers'][0];
        $event = Evenement::factory()
            ->conference()
            ->create([
                'titre' => 'Forum innovation numerique',
                'description' => '<p><strong>Un grand rendez-vous campus</strong> pour les clubs, les demos et les retours d experience.</p><p>Ce scenario couvre un evenement public, publie, riche en programme, commentaires et messagerie.</p>',
                'theme' => 'Intelligence Artificielle & Transformation Digitale',
                'cree_par' => $creator->id,
                'statut' => 'publie',
                'validation_status' => 'approved',
                'approved_at' => now()->subDays(8),
                'submitted_at' => now()->subDays(10),
                'visibilite' => 'public',
                'public_cible' => 'etudiants et enseignants',
                'inscription_requise' => false,
                'capacite_max' => 120,
                'date_debut' => now()->addDays(12)->setTime(9, 0),
                'date_fin' => now()->addDays(12)->setTime(18, 0),
                'lieu' => 'Grand amphi UJKZ',
                'comments_enabled' => true,
                'messages_enabled' => true,
                'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            ]);

        $this->attachAudience($event, ['tous', 'etudiant', 'enseignant']);
        $this->attachAssignments($event, [
            $this->organizerAssignment($creator->id, true),
            $this->organizerAssignment($users['organizers'][1]->id, false),
            ['category' => 'assignment', 'role' => 'intervenant', 'user_id' => $users['intervenants'][0]->id],
            ['category' => 'assignment', 'role' => 'intervenant', 'user_id' => $users['intervenants'][1]->id],
        ]);

        collect([
            ['Accueil et ouverture', 'Mot de bienvenue, vision produit et objectifs du forum.', '08:30', '09:30', 'Hall principal', 'pleniere'],
            ['Demos IA et data', 'Presentations de projets menes par les clubs de l universite.', '10:00', '12:00', 'Amphi A', 'conference'],
            ['Atelier prototypage', 'Atelier pratique pour transformer une idee en MVP testable.', '14:00', '16:00', 'Lab innovation', 'atelier'],
            ['Table ronde partenariats', 'Echanges entre enseignants, alumni et incubateurs.', '16:15', '17:30', 'Salle conseil', 'table ronde'],
        ])->each(function (array $programme, int $index) use ($event) {
            Programme::factory()->create([
                'evenement_id' => $event->id,
                'titre' => $programme[0],
                'description' => $programme[1],
                'intervenant' => $index < 2 ? "Intervenant Expert ".($index + 1) : null,
                'date_programme' => $event->date_debut?->toDateString(),
                'heure_debut' => $programme[2],
                'heure_fin' => $programme[3],
                'salle' => $programme[4],
                'type_section' => $programme[5],
                'ordre' => $index + 1,
            ]);
        });

        $accepted = $users['students']->take(6);

        $accepted->each(function (User $user) use ($event) {
            InscriptionEvenement::factory()->create([
                'evenement_id' => $event->id,
                'utilisateur_id' => $user->id,
                'statut' => 'accepte',
                'is_waitlist' => false,
                'waitlist_position' => null,
                'checked_in_at' => null,
            ]);
        });

        $comment = EvenementComment::create([
            'evenement_id' => $event->id,
            'user_id' => $accepted[0]->id,
            'contenu' => 'Le programme est-il deja finalise pour la session de demos ?',
            'status' => 'visible',
        ]);

        EvenementComment::create([
            'evenement_id' => $event->id,
            'user_id' => $creator->id,
            'parent_id' => $comment->id,
            'contenu' => 'Oui, la grille est stabilisee et les horaires sont maintenant definitifs.',
            'status' => 'visible',
        ]);

        $message = EventMessage::create([
            'evenement_id' => $event->id,
            'user_id' => $accepted[1]->id,
            'type' => 'question',
            'contenu' => 'Le lien live sera partage ici ou par email ?',
            'status' => 'ouvert',
            'is_pinned' => false,
        ]);

        EventMessage::create([
            'evenement_id' => $event->id,
            'user_id' => $creator->id,
            'parent_id' => $message->id,
            'type' => 'reponse_organisateur',
            'contenu' => 'Les deux. Une notification sera envoyee la veille aux inscrits confirmes.',
            'status' => 'resolu',
            'is_pinned' => false,
        ]);

        $event->activities()->createMany([
            [
                'user_id' => $creator->id,
                'type' => 'publication',
                'label' => 'Evenement publie',
                'description' => 'Le forum a ete rendu visible a toute la communaute universitaire.',
            ],
            [
                'user_id' => $users['intervenants'][0]->id,
                'type' => 'programme',
                'label' => 'Programme finalise',
                'description' => 'Les sessions principales ont ete structurees dans le planning.',
            ],
        ]);

        $this->seedNotifications(
            $accepted->take(2),
            $event->id,
            'rappel_evenement',
            'Rappel evenement',
            "Le forum {$event->titre} commence dans moins de deux semaines.",
        );
    }

    private function seedFullConferenceWithWaitlist(array $users): void
    {
        $creator = $users['organizers'][1];
        $event = Evenement::factory()
            ->conference()
            ->create([
                'titre' => 'Masterclass cybersécurité campus',
                'description' => '<p>Scenario de conference complete avec promotion automatique depuis la liste d attente.</p>',
                'cree_par' => $creator->id,
                'statut' => 'publie',
                'validation_status' => 'approved',
                'approved_at' => now()->subDays(6),
                'submitted_at' => now()->subDays(7),
                'visibilite' => 'public',
                'public_cible' => 'etudiants',
                'inscription_requise' => false,
                'capacite_max' => 3,
                'date_debut' => now()->addDays(6)->setTime(14, 0),
                'date_fin' => now()->addDays(6)->setTime(17, 30),
                'lieu' => 'Salle securite',
            ]);

        $this->attachAudience($event, ['etudiant']);
        $this->attachAssignments($event, [
            $this->organizerAssignment($creator->id, true),
            ['category' => 'assignment', 'role' => 'intervenant', 'user_id' => $users['intervenants'][2]->id],
        ]);

        $accepted = $users['students']->slice(6, 3)->values();
        $waitlist = $users['students']->slice(9, 3)->values();

        $accepted->each(function (User $user) use ($event) {
            InscriptionEvenement::factory()->create([
                'evenement_id' => $event->id,
                'utilisateur_id' => $user->id,
                'statut' => 'accepte',
                'is_waitlist' => false,
                'waitlist_position' => null,
            ]);
        });

        $waitlist->each(function (User $user, int $index) use ($event) {
            InscriptionEvenement::factory()->create([
                'evenement_id' => $event->id,
                'utilisateur_id' => $user->id,
                'statut' => 'en_attente',
                'is_waitlist' => true,
                'waitlist_position' => $index + 1,
            ]);
        });

        $event->activities()->create([
            'user_id' => $creator->id,
            'type' => 'capacite_atteinte',
            'label' => 'Capacite atteinte',
            'description' => 'Les prochaines demandes doivent rejoindre la liste d attente.',
        ]);

        $this->seedNotifications(
            $waitlist,
            $event->id,
            'inscription_confirmee',
            'Ajout sur liste d attente',
            "Vous etes en liste d attente pour {$event->titre}.",
        );
    }

    private function seedApprovalRequiredConference(array $users): void
    {
        $creator = $users['organizers'][2];
        $event = Evenement::factory()
            ->conference()
            ->create([
                'titre' => 'Rencontre mentorat alumni',
                'description' => '<p>Scenario de conference restreinte avec confirmation manuelle des demandes.</p>',
                'cree_par' => $creator->id,
                'statut' => 'publie',
                'validation_status' => 'approved',
                'approved_at' => now()->subDays(4),
                'submitted_at' => now()->subDays(5),
                'visibilite' => 'restreint',
                'public_cible' => 'etudiants finalistes',
                'inscription_requise' => true,
                'capacite_max' => 20,
                'date_debut' => now()->addDays(9)->setTime(10, 0),
                'date_fin' => now()->addDays(9)->setTime(12, 30),
                'lieu' => 'Salle alumni',
            ]);

        $this->attachAudience($event, ['etudiant']);
        $this->attachAssignments($event, [
            $this->organizerAssignment($creator->id, true),
        ]);

        $accepted = $users['students']->slice(12, 2)->values();
        $pending = $users['students']->slice(14, 3)->values();

        $accepted->each(fn (User $user) => InscriptionEvenement::factory()->create([
            'evenement_id' => $event->id,
            'utilisateur_id' => $user->id,
            'statut' => 'accepte',
            'is_waitlist' => false,
        ]));

        $pending->each(fn (User $user) => InscriptionEvenement::factory()->create([
            'evenement_id' => $event->id,
            'utilisateur_id' => $user->id,
            'statut' => 'en_attente',
            'is_waitlist' => false,
        ]));

        $event->activities()->create([
            'user_id' => $creator->id,
            'type' => 'moderation',
            'label' => 'Demandes en attente',
            'description' => 'Des demandes doivent etre confirmees par l organisateur.',
        ]);
    }

    private function seedCompetitionWithJuryAndResults(array $users): void
    {
        $creator = $users['organizers'][3];
        $event = Evenement::factory()
            ->concours()
            ->create([
                'titre' => 'Challenge projets campus',
                'description' => '<p>Scenario complet concours avec jury, deliberation, resultats et certificats.</p>',
                'reglement' => 'Les participants doivent soumettre un projet original en groupe de 4 maximum. Tout plagiat sera disqualifie.',
                'cree_par' => $creator->id,
                'statut' => 'publie',
                'validation_status' => 'approved',
                'approved_at' => now()->subDays(12),
                'submitted_at' => now()->subDays(13),
                'visibilite' => 'restreint',
                'public_cible' => 'participants et jury',
                'inscription_requise' => true,
                'capacite_max' => 8,
                'date_debut' => now()->subDays(2)->setTime(8, 30),
                'date_fin' => now()->subDays(1)->setTime(18, 0),
                'date_soumission' => now()->subDays(5),
                'date_deliberation' => now()->subDays(1),
                'lieu' => 'Auditorium innovation',
                'competition_status' => 'resultats_publies',
                'evenement_certifie' => true,
                'allow_participant_result_tracking' => true,
                'results_published_at' => now()->subDay(),
            ]);

        $jury = $users['jury']->take(3)->values();
        $participants = $users['students']->take(4)->values();

        $this->attachAudience($event, ['participant', 'jury', 'enseignant']);
        $this->attachAssignments($event, [
            $this->organizerAssignment($creator->id, true),
            ...$jury->map(fn (User $user, int $index) => [
                'category' => 'assignment',
                'role' => 'jury',
                'user_id' => $user->id,
                'is_president_jury' => $index === 0,
                'can_manage_results' => true,
            ])->all(),
            ...$participants->map(fn (User $user) => [
                'category' => 'assignment',
                'role' => 'participant',
                'user_id' => $user->id,
            ])->all(),
        ]);

        $panel = $event->juryPanel()->create([
            'president_user_id' => $jury[0]->id,
            'admission_average' => 10,
            'seats_count' => 3,
            'ranking_mode' => 'final_note',
            'tie_break_rule' => 'name',
            'criteria_locked' => true,
            'criteria_locked_at' => now()->subDays(3),
            'scoring_opened_at' => now()->subDays(3),
            'scoring_closed_at' => now()->subDays(2),
            'validated_at' => now()->subDays(1),
            'validated_by' => $jury[0]->id,
        ]);

        $panel->criteria()->createMany([
            ['nom' => 'Innovation', 'description' => 'Originalite et potentiel', 'bareme' => 20, 'coefficient' => 2, 'ordre' => 1, 'actif' => true],
            ['nom' => 'Impact', 'description' => 'Utilite et portee reelle', 'bareme' => 20, 'coefficient' => 2, 'ordre' => 2, 'actif' => true],
            ['nom' => 'Presentation', 'description' => 'Clarte et maitrise de la soutenance', 'bareme' => 20, 'coefficient' => 1, 'ordre' => 3, 'actif' => true],
        ]);

        $notes = [
            ['note' => 17, 'classement' => 1, 'mention' => 'Tres bien'],
            ['note' => 15, 'classement' => 2, 'mention' => 'Bien'],
            ['note' => 13, 'classement' => 3, 'mention' => 'Assez bien'],
            ['note' => 9, 'classement' => 4, 'mention' => 'Encouragement'],
        ];

        $participants->each(function (User $user, int $index) use ($event, $creator, $notes) {
            InscriptionEvenement::factory()->create([
                'evenement_id' => $event->id,
                'utilisateur_id' => $user->id,
                'statut' => 'accepte',
                'is_waitlist' => false,
            ]);

            Resultat::create([
                'evenement_id' => $event->id,
                'utilisateur_id' => $user->id,
                'note' => $notes[$index]['note'],
                'classement' => $notes[$index]['classement'],
                'admission' => $notes[$index]['note'] >= 10 ? 'admis' : 'refuse',
                'mention' => $notes[$index]['mention'],
                'admission_average_snapshot' => 10,
                'criteria_breakdown' => [
                    ['criterion_id' => 1, 'nom' => 'Innovation', 'average' => max($notes[$index]['note'] - 1, 0), 'coefficient' => 2],
                    ['criterion_id' => 2, 'nom' => 'Impact', 'average' => max($notes[$index]['note'] - 2, 0), 'coefficient' => 2],
                    ['criterion_id' => 3, 'nom' => 'Presentation', 'average' => max($notes[$index]['note'] - 1.5, 0), 'coefficient' => 1],
                ],
                'published_at' => now()->subDay(),
                'validated_at' => now()->subDay(),
                'validated_by' => $creator->id,
            ]);

            Certificat::create([
                'evenement_id' => $event->id,
                'utilisateur_id' => $user->id,
                'type' => 'participation',
                'code_certificat' => Str::upper(Str::random(12)),
                'fichier' => "certificats/demo-{$event->id}-{$user->id}.pdf",
                'url_verification' => url('/certificats/verifier/'.Str::lower(Str::random(18))),
                'statut' => 'delivre',
                'payload' => ['participant' => $user->name, 'event' => $event->titre],
                'date_delivrance' => now()->subDay(),
                'published_at' => now()->subDay(),
            ]);
        });

        $event->activities()->createMany([
            [
                'user_id' => $jury[0]->id,
                'type' => 'jury',
                'label' => 'Deliberation finalisee',
                'description' => 'Le president du jury a valide le classement final.',
            ],
            [
                'user_id' => $creator->id,
                'type' => 'resultats',
                'label' => 'Resultats publies',
                'description' => 'Les resultats et certificats sont disponibles pour les participants.',
            ],
        ]);

        $this->seedNotifications(
            $participants,
            $event->id,
            'event_results_published',
            'Resultats disponibles',
            "Les resultats de {$event->titre} sont maintenant disponibles.",
        );
    }

    private function seedPendingValidationEvent(array $users): void
    {
        $creator = $users['organizers'][0];
        $event = Evenement::factory()
            ->conference()
            ->create([
                'titre' => 'Colloque pedagogie numerique',
                'description' => '<p>Scenario de brouillon soumis et en attente de validation admin.</p>',
                'cree_par' => $creator->id,
                'statut' => 'brouillon',
                'validation_status' => 'pending',
                'submitted_at' => now()->subHours(20),
                'visibilite' => 'prive',
                'public_cible' => 'enseignants',
                'inscription_requise' => true,
                'date_debut' => now()->addDays(20)->setTime(9, 0),
                'date_fin' => now()->addDays(20)->setTime(16, 0),
                'lieu' => 'Centre multimedia',
            ]);

        $this->attachAudience($event, ['enseignant']);
        $this->attachAssignments($event, [
            $this->organizerAssignment($creator->id, true),
        ]);

        $event->activities()->create([
            'user_id' => $creator->id,
            'type' => 'validation',
            'label' => 'Soumis pour validation',
            'description' => 'L evenement attend la decision de l administration.',
        ]);
    }

    private function seedRejectedEvent(array $users): void
    {
        $creator = $users['organizers'][2];
        $event = Evenement::factory()
            ->conference()
            ->create([
                'titre' => 'Atelier deploiement cloud non conforme',
                'description' => '<p>Scenario d evenement refuse apres soumission.</p>',
                'cree_par' => $creator->id,
                'statut' => 'brouillon',
                'validation_status' => 'rejected',
                'submitted_at' => now()->subDays(2),
                'rejected_at' => now()->subDay(),
                'rejection_reason' => 'Informations logistiques incompletes et programme non finalise.',
                'visibilite' => 'prive',
                'public_cible' => 'club cloud',
                'date_debut' => now()->addDays(18)->setTime(9, 0),
                'date_fin' => now()->addDays(18)->setTime(13, 0),
            ]);

        $this->attachAudience($event, ['enseignant', 'etudiant']);
        $this->attachAssignments($event, [
            $this->organizerAssignment($creator->id, true),
        ]);

        EventNotification::create([
            'user_id' => $creator->id,
            'evenement_id' => $event->id,
            'type' => 'event_validation_creator',
            'title' => 'Votre evenement a ete rejete',
            'message' => "Motif: {$event->rejection_reason}",
            'data' => ['action' => 'rejected'],
        ]);
    }

    private function seedClosedEvent(array $users): void
    {
        $creator = $users['organizers'][1];
        $event = Evenement::factory()
            ->conference()
            ->create([
                'titre' => 'Seminaire employabilite et CV',
                'description' => '<p>Scenario d evenement clos avec participants presents et traces d activite.</p>',
                'cree_par' => $creator->id,
                'statut' => 'cloture',
                'validation_status' => 'approved',
                'approved_at' => now()->subDays(40),
                'submitted_at' => now()->subDays(42),
                'visibilite' => 'public',
                'public_cible' => 'etudiants',
                'inscription_requise' => true,
                'capacite_max' => 60,
                'checkin_active' => true,
                'date_debut' => now()->subDays(8)->setTime(8, 30),
                'date_fin' => now()->subDays(8)->setTime(15, 0),
                'lieu' => 'Maison de l etudiant',
            ]);

        $this->attachAudience($event, ['etudiant']);
        $this->attachAssignments($event, [
            $this->organizerAssignment($creator->id, true),
            ['category' => 'assignment', 'role' => 'intervenant', 'user_id' => $users['intervenants'][3]->id],
        ]);

        $users['students']->slice(3, 4)->values()->each(function (User $user) use ($event) {
            InscriptionEvenement::factory()->create([
                'evenement_id' => $event->id,
                'utilisateur_id' => $user->id,
                'statut' => 'accepte',
                'checked_in_at' => now()->subDays(8)->addHours(1),
                'is_waitlist' => false,
            ]);
        });

        $event->activities()->createMany([
            [
                'user_id' => $creator->id,
                'type' => 'checkin',
                'label' => 'Pointage termine',
                'description' => 'Les presences ont ete marquees pour la majorite des participants.',
            ],
            [
                'user_id' => $creator->id,
                'type' => 'cloture',
                'label' => 'Evenement cloture',
                'description' => 'Le seminaire est termine et les traces restent consultables.',
            ],
        ]);
    }

    private function attachAudience(Evenement $event, array $roles): void
    {
        $event->roles()->createMany(
            collect($roles)
                ->unique()
                ->map(fn (string $role) => ['category' => 'audience', 'role' => $role])
                ->all(),
        );
    }

    private function attachAssignments(Evenement $event, array $assignments): void
    {
        $event->assignments()->createMany($assignments);
    }

    private function organizerAssignment(int $userId, bool $fullAccess): array
    {
        return [
            'category' => 'assignment',
            'role' => 'organisateur',
            'user_id' => $userId,
            'can_manage_messages' => true,
            'can_manage_comments' => true,
            'can_edit_event' => true,
            'can_change_visibility' => true,
            'can_manage_participants' => $fullAccess,
            'can_assign_jury' => $fullAccess,
            'can_assign_organizers' => $fullAccess,
            'can_manage_certificates' => $fullAccess,
            'can_manage_results' => $fullAccess,
        ];
    }

    private function seedNotifications(Collection $users, int $eventId, string $type, string $title, string $message): void
    {
        $users->each(function (User $user) use ($eventId, $type, $title, $message) {
            EventNotification::create([
                'user_id' => $user->id,
                'evenement_id' => $eventId,
                'type' => $type,
                'title' => $title,
                'message' => $message,
                'data' => ['seeded' => true],
            ]);
        });
    }
}
