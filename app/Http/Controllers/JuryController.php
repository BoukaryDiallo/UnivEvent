<?php

namespace App\Http\Controllers;

use App\Events\EventResultsPublished;
use App\Events\EventStatusUpdated;
use App\Events\JuryScoresUpdated;
use App\Models\Evenement;
use App\Models\JuryDeliberation;
use App\Models\JuryPanel;
use App\Services\EventAuthorizationService;
use App\Services\EventNotificationService;
use App\Services\JuryWorkflowService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class JuryController extends Controller
{
    public function __construct(
        private EventAuthorizationService $authorization,
        private JuryWorkflowService $workflow,
        private EventNotificationService $notifications,
    ) {
    }

    public function configure(Request $request, Evenement $evenement)
    {
        abort_unless($evenement->type === 'concours', 422, 'Configuration reservee aux concours');
        abort_unless($this->authorization->isPresidentJury($evenement, $request->user()), 403);

        $validated = $request->validate([
            'president_user_id' => ['nullable', 'exists:users,id'],
            'admission_average' => ['required', 'numeric', 'min:0'],
            'seats_count' => ['nullable', 'integer', 'min:1'],
            'ranking_mode' => ['required', 'string', 'max:100'],
            'tie_break_rule' => ['required', 'string', 'max:100'],
            'criteria' => ['nullable', 'array'],
            'criteria.*.id' => ['nullable', 'integer'],
            'criteria.*.nom' => ['required_with:criteria', 'string', 'max:255'],
            'criteria.*.description' => ['nullable', 'string'],
            'criteria.*.bareme' => ['nullable', 'numeric', 'min:1'],
            'criteria.*.coefficient' => ['nullable', 'numeric', 'min:0.1'],
            'criteria.*.ordre' => ['nullable', 'integer', 'min:1'],
            'criteria.*.actif' => ['nullable', 'boolean'],
            'lock_criteria' => ['nullable', 'boolean'],
        ]);

        $panel = $this->workflow->ensurePanel($evenement);
        $panel->update([
            'president_user_id' => $validated['president_user_id'] ?? $panel->president_user_id ?? $request->user()->id,
            'admission_average' => $validated['admission_average'],
            'seats_count' => $validated['seats_count'] ?? null,
            'ranking_mode' => $validated['ranking_mode'],
            'tie_break_rule' => $validated['tie_break_rule'],
            'criteria_locked' => (bool) ($validated['lock_criteria'] ?? false),
            'criteria_locked_at' => ! empty($validated['lock_criteria']) ? now() : null,
        ]);

        $this->workflow->syncCriteria($panel, $validated['criteria'] ?? []);

        $evenement->update([
            'competition_status' => ! empty($validated['lock_criteria']) ? 'configuration' : $evenement->competition_status,
        ]);

        $this->dispatchEventStatusUpdated(
            $evenement->fresh(['juryPanel.criteria', 'juryPanel.deliberations.participant', 'juryPanel.deliberations.requester', 'juryPanel.deliberations.resolver']),
            $request->user(),
            'Configuration jury mise a jour.',
        );

        return back();
    }

    public function openScoring(Request $request, Evenement $evenement)
    {
        abort_unless($this->authorization->isPresidentJury($evenement, $request->user()), 403);

        $this->workflow->openScoring($this->workflow->ensurePanel($evenement));

        $this->dispatchEventStatusUpdated($evenement->fresh('juryPanel.criteria'), $request->user(), 'Notation ouverte.');

        return back();
    }

    public function closeScoring(Request $request, Evenement $evenement)
    {
        abort_unless($this->authorization->isPresidentJury($evenement, $request->user()), 403);

        $this->workflow->closeScoring($this->workflow->ensurePanel($evenement));

        $this->dispatchEventStatusUpdated($evenement->fresh('juryPanel.criteria'), $request->user(), 'Notation fermee.');

        return back();
    }

    public function score(Request $request, Evenement $evenement, int $participantId)
    {
        abort_unless($this->authorization->isJuryMember($evenement, $request->user()), 403);

        $validated = $request->validate([
            'scores' => ['required', 'array'],
            'scores.*.criterion_id' => ['required', 'exists:jury_criteria,id'],
            'scores.*.score' => ['nullable', 'numeric', 'min:0'],
            'scores.*.commentaire' => ['nullable', 'string'],
            'submit' => ['nullable', 'boolean'],
        ]);

        $this->workflow->saveScores(
            $this->workflow->ensurePanel($evenement),
            $request->user(),
            $participantId,
            $validated['scores'],
            (bool) ($validated['submit'] ?? false),
        );

        $this->dispatchJuryScoresUpdated(
            $evenement->fresh(['juryPanel.criteria', 'juryPanel.deliberations.participant', 'juryPanel.deliberations.requester', 'juryPanel.deliberations.resolver']),
            $request->user(),
            $participantId,
            (bool) ($validated['submit'] ?? false),
        );

        return back();
    }

    public function requestRevision(Request $request, Evenement $evenement, int $participantId)
    {
        abort_unless($this->authorization->isPresidentJury($evenement, $request->user()), 403);

        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:1000'],
        ]);

        $panel = $this->workflow->ensurePanel($evenement);
        $deliberation = $this->workflow->requestReview($panel, $participantId, $request->user(), $validated['reason']);
        $this->workflow->reopenParticipantScores($panel, $participantId);

        foreach ($evenement->assignments()->where('role', 'jury')->with('user')->get() as $assignment) {
            if ($assignment->user && $assignment->user->id !== $request->user()->id) {
                $this->notifications->notify(
                    $assignment->user,
                    'jury_revision',
                    'Revision demandee',
                    "Le president du jury a demande une revision urgente pour un participant de {$evenement->titre}.",
                    $evenement->id,
                    ['deliberation_id' => $deliberation->id],
                );
            }
        }

        $this->dispatchEventStatusUpdated(
            $evenement->fresh(['juryPanel.criteria', 'juryPanel.deliberations.participant', 'juryPanel.deliberations.requester', 'juryPanel.deliberations.resolver']),
            $request->user(),
            'Revision demandee.',
        );

        return back();
    }

    public function finalize(Request $request, Evenement $evenement)
    {
        abort_unless($this->authorization->isPresidentJury($evenement, $request->user()), 403);

        $computed = $this->workflow->finalizeResults($evenement, $request->user());

        foreach ($computed as $row) {
            $this->notifications->notify(
                $row['participant'],
                'resultats_concours',
                'Resultats disponibles',
                "Vos resultats pour {$evenement->titre} sont maintenant publies.",
                $evenement->id,
                [
                    'classement' => $row['classement'],
                    'admission' => $row['admission'],
                    'mention' => $row['mention'],
                ],
                true,
            );
        }

        foreach ($evenement->assignments()->whereIn('role', ['jury', 'organisateur'])->with('user')->get() as $assignment) {
            if ($assignment->user) {
                $this->notifications->notify(
                    $assignment->user,
                    'classement_final',
                    'Classement final valide',
                    "Le classement final de {$evenement->titre} a ete valide.",
                    $evenement->id,
                );
            }
        }

        $this->dispatchEventResultsPublished(
            $evenement->fresh([
                'juryPanel.criteria',
                'juryPanel.deliberations.participant',
                'juryPanel.deliberations.requester',
                'juryPanel.deliberations.resolver',
                'resultats.utilisateur',
                'certificats',
            ]),
            $request->user(),
        );

        return back();
    }

    public function resolveRevision(Request $request, JuryDeliberation $deliberation)
    {
        $evenement = $deliberation->panel->evenement;
        abort_unless($this->authorization->isPresidentJury($evenement, $request->user()), 403);

        $deliberation->update([
            'status' => 'resolved',
            'resolved_by' => $request->user()->id,
            'resolved_at' => now(),
        ]);

        $this->dispatchEventStatusUpdated(
            $evenement->fresh(['juryPanel.criteria', 'juryPanel.deliberations.participant', 'juryPanel.deliberations.requester', 'juryPanel.deliberations.resolver']),
            $request->user(),
            'Revision resolue.',
        );

        return back();
    }

    private function dispatchEventStatusUpdated(Evenement $evenement, $actor, string $message): void
    {
        try {
            EventStatusUpdated::dispatch($evenement, $actor, $message);
        } catch (\Throwable $exception) {
            Log::warning('Jury event status broadcast failed.', [
                'evenement_id' => $evenement->id,
                'actor_id' => $actor?->id,
                'message' => $message,
                'error' => $exception->getMessage(),
            ]);
        }
    }

    private function dispatchJuryScoresUpdated(Evenement $evenement, $actor, int $participantId, bool $submitted): void
    {
        try {
            JuryScoresUpdated::dispatch($evenement, $actor, $participantId, $submitted);
        } catch (\Throwable $exception) {
            Log::warning('Jury scores broadcast failed.', [
                'evenement_id' => $evenement->id,
                'actor_id' => $actor?->id,
                'participant_id' => $participantId,
                'submitted' => $submitted,
                'error' => $exception->getMessage(),
            ]);
        }
    }

    private function dispatchEventResultsPublished(Evenement $evenement, $actor): void
    {
        try {
            EventResultsPublished::dispatch($evenement, $actor);
        } catch (\Throwable $exception) {
            Log::warning('Event results broadcast failed.', [
                'evenement_id' => $evenement->id,
                'actor_id' => $actor?->id,
                'error' => $exception->getMessage(),
            ]);
        }
    }
}
