<?php

namespace App\Services;

use App\Events\EventCreated;
use App\Models\Evenement;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class EventService
{
    public function __construct(
        private EventNotificationService $notifications,
        private JuryWorkflowService $juryWorkflow,
    ) {
    }

    public function createExpress(User $user, array $data): Evenement
    {
        $event = DB::transaction(function () use ($user, $data) {
            $event = Evenement::create([
                'titre' => $data['titre'],
                'type' => $data['type'],
                'date_debut' => $data['date_debut'],
                'lieu' => $data['lieu'],
                'description' => null,
                'visibilite' => 'public',
                'public_cible' => 'tous',
                'statut' => 'brouillon',
                'validation_status' => 'pending',
                'submitted_at' => null,
                'cree_par' => $user->id,
                'inscription_requise' => true,
                'checkin_active' => false,
                'comments_enabled' => true,
                'comment_replies_enabled' => true,
                'comment_reactions_enabled' => true,
                'comment_policy' => 'accepted_participants',
                'messages_enabled' => true,
                'evenement_certifie' => false,
                'allow_participant_result_tracking' => false,
                'certificate_template_version' => 'template_v1',
                'competition_status' => 'configuration',
            ]);

            $event->assignments()->create([
                'category' => 'assignment',
                'role' => 'organisateur',
                'user_id' => $user->id,
                'can_manage_messages' => true,
                'can_manage_comments' => true,
                'can_edit_event' => true,
                'can_change_visibility' => true,
                'can_manage_participants' => true,
                'can_assign_jury' => true,
                'can_assign_organizers' => true,
                'can_manage_certificates' => true,
                'can_manage_results' => true,
                'meta' => [
                    'source' => 'express_creation',
                ],
            ]);

            if ($event->type === 'concours') {
                $panel = $this->juryWorkflow->ensurePanel($event);
                $this->juryWorkflow->syncCriteria($panel, $this->defaultCriteria());
            }

            $event->activities()->create([
                'user_id' => $user->id,
                'type' => 'creation',
                'action' => 'created',
                'title' => 'Evenement cree',
                'description' => 'Creation express initialisee. La configuration detaillee peut etre finalisee ensuite.',
                'metadata' => [
                    'mode' => 'express',
                ],
            ]);

            return $event;
        });

        $this->notifications->notify(
            $user,
            'event_created',
            'Evenement cree',
            "Votre evenement '{$event->titre}' est pret a etre configure.",
            $event->id,
            ['mode' => 'express']
        );

        EventCreated::dispatch($event->fresh(), $user);

        return $event->fresh(['assignments', 'juryPanel.criteria']);
    }

    public function updateSection(Evenement $event, string $section, array $data): Evenement
    {
        return match ($section) {
            'general' => $this->updateGeneral($event, $data),
            'permissions' => $this->updatePermissions($event, $data),
            'interactions' => $this->updateInteractions($event, $data),
            'certificates' => $this->updateCertificates($event, $data),
            'criteria' => $this->updateCriteria($event, $data),
            default => $event,
        };
    }

    public function canSubmit(Evenement $event): bool
    {
        return $this->submissionErrors($event) === [];
    }

    public function submissionErrors(Evenement $event): array
    {
        $event->loadMissing(['assignments', 'programmes', 'juryPanel.criteria']);

        $errors = [];

        if (! filled($event->titre) || ! filled($event->description)) {
            $errors[] = 'Ajoutez un titre et une description.';
        }

        if (! $event->date_debut || ($event->date_fin && $event->date_fin->lt($event->date_debut))) {
            $errors[] = 'Veuillez definir une date valide.';
        }

        if ($event->assignments->where('role', 'organisateur')->isEmpty()) {
            $errors[] = 'Ajoutez au moins un organisateur.';
        }

        if ($event->type === 'conference' && $event->programmes->filter(fn ($programme) => filled($programme->titre))->isEmpty()) {
            $errors[] = 'Veuillez definir un programme.';
        }

        if ($event->type === 'concours' && (($event->juryPanel?->criteria?->where('actif', true)->count() ?? 0) === 0)) {
            $errors[] = 'Veuillez definir des criteres d evaluation.';
        }

        return $errors;
    }

    public function workflowState(Evenement $event): string
    {
        if ($event->validation_status === 'approved' && $event->statut === 'publie') {
            return 'published';
        }

        if ($event->validation_status === 'rejected') {
            return 'rejected';
        }

        if ($event->validation_status === 'pending' && $event->submitted_at) {
            return 'pending';
        }

        return 'draft';
    }

    public function suggestions(Evenement $event): array
    {
        $event->loadMissing(['assignments', 'programmes', 'medias', 'juryPanel.criteria', 'inscriptions']);

        $suggestions = [];

        // General suggestions
        if (empty($event->description)) {
            $suggestions[] = 'Complétez la description';
        }

        if (empty($event->lieu)) {
            $suggestions[] = 'Précisez le lieu';
        }

        // Type-specific suggestions
        if ($event->type === 'concours') {
            $juryCount = $event->assignments->where('role', 'jury')->count();
            if ($juryCount === 0) {
                $suggestions[] = 'Ajouter au moins un jury';
            } elseif ($juryCount < 3) {
                $suggestions[] = 'Idéalement plus de 3 jurés';
            }

            $criteriaCount = $event->juryPanel?->criteria?->where('actif', true)->count() ?? 0;
            if ($criteriaCount < 2) {
                $suggestions[] = 'Ajouter plusieurs critères';
            }
        }

        if ($event->type === 'conference') {
            $sessionCount = $event->programmes->filter(fn ($p) => filled($p->titre))->count();
            if ($sessionCount === 0) {
                $suggestions[] = 'Ajouter au moins une session';
            }

            if ($event->assignments->where('role', 'intervenant')->isEmpty()) {
                $suggestions[] = 'Ajouter un intervenant';
            }
        }

        // Actor suggestions
        $participantCount = $event->inscriptions()->count();
        if ($participantCount === 0 && $event->statut === 'publie') {
            $suggestions[] = 'Promouvoir l\'événement';
        }

        // Media suggestions
        if ($event->medias()->where('is_cover', true)->doesntExist()) {
            $suggestions[] = 'Ajouter une image de couverture';
        }

        // Certification suggestions
        if ($event->evenement_certifie && empty($event->certificate_template_version)) {
            $suggestions[] = 'Configurer le template certificat';
        }

        // Interaction suggestions
        if (!$event->comments_enabled) {
            $suggestions[] = 'Activer les commentaires';
        }

        return array_slice($suggestions, 0, 3); // Limiter à 3 suggestions
    }

    private function updateGeneral(Evenement $event, array $data): Evenement
    {
        $event->update([
            'titre' => $data['titre'] ?? $event->titre,
            'description' => array_key_exists('description', $data) ? $data['description'] : $event->description,
            'date_debut' => $data['date_debut'] ?? $event->date_debut,
            'date_fin' => array_key_exists('date_fin', $data) ? $data['date_fin'] : $event->date_fin,
            'lieu' => $data['lieu'] ?? $event->lieu,
            'lien_live' => array_key_exists('lien_live', $data) ? $data['lien_live'] : $event->lien_live,
        ]);

        return $event->fresh();
    }

    private function updatePermissions(Evenement $event, array $data): Evenement
    {
        $event->update([
            'visibilite' => $data['visibilite'] ?? $event->visibilite,
            'public_cible' => $data['public_cible'] ?? $event->public_cible,
        ]);

        if (array_key_exists('roles', $data)) {
            $event->roles()->delete();

            foreach ($data['roles'] ?? [] as $role) {
                $event->roles()->create([
                    'category' => 'audience',
                    'role' => $role,
                ]);
            }
        }

        return $event->fresh('roles');
    }

    private function updateInteractions(Evenement $event, array $data): Evenement
    {
        $event->update([
            'comments_enabled' => (bool) ($data['comments_enabled'] ?? $event->comments_enabled),
            'comment_replies_enabled' => (bool) ($data['comment_replies_enabled'] ?? $event->comment_replies_enabled),
            'comment_reactions_enabled' => (bool) ($data['comment_reactions_enabled'] ?? $event->comment_reactions_enabled),
            'messages_enabled' => (bool) ($data['messages_enabled'] ?? $event->messages_enabled),
            'comment_policy' => $data['comment_policy'] ?? $event->comment_policy,
        ]);

        return $event->fresh();
    }

    private function updateCertificates(Evenement $event, array $data): Evenement
    {
        $event->update([
            'evenement_certifie' => (bool) ($data['evenement_certifie'] ?? $event->evenement_certifie),
            'certificate_template_version' => $data['certificate_template_version'] ?? $event->certificate_template_version,
        ]);

        return $event->fresh();
    }

    private function updateCriteria(Evenement $event, array $data): Evenement
    {
        if ($event->type !== 'concours') {
            return $event;
        }

        $panel = $this->juryWorkflow->ensurePanel($event);
        $this->juryWorkflow->syncCriteria($panel, $data['criteria'] ?? []);

        return $event->fresh('juryPanel.criteria');
    }

    private function defaultCriteria(): array
    {
        return [
            ['nom' => 'Pertinence', 'bareme' => 20, 'coefficient' => 2, 'ordre' => 1, 'actif' => true],
            ['nom' => 'Execution', 'bareme' => 20, 'coefficient' => 2, 'ordre' => 2, 'actif' => true],
            ['nom' => 'Impact', 'bareme' => 20, 'coefficient' => 1, 'ordre' => 3, 'actif' => true],
        ];
    }
}
