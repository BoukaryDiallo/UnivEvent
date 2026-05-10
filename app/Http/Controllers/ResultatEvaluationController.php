<?php

namespace App\Http\Controllers;

use App\Models\Evenement;
use App\Models\ResultatEvaluation;
use App\Services\CertificateGenerator;
use App\Services\EventAuthorizationService;
use App\Services\EventNotificationService;
use App\Services\JuryWorkflowService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class ResultatEvaluationController extends Controller
{
    public function __construct(
        private CertificateGenerator $certificates,
        private EventNotificationService $notifications,
        private EventAuthorizationService $authorization,
        private JuryWorkflowService $workflow,
    ) {
    }

    public function store(Request $request)
    {
        $validated = $this->validateResultat($request, true);
        $evenement = Evenement::findOrFail($validated['evenement_id']);

        $this->authorizeAction($request, $evenement);

        $resultat = ResultatEvaluation::updateOrCreate(
            [
                'evenement_id' => $validated['evenement_id'],
                'utilisateur_id' => $validated['utilisateur_id'],
            ],
            [
                'note' => $validated['note'],
                'classement' => $validated['classement'] ?? null,
                'admission' => $validated['admission'] ?? null,
                'mention' => $validated['mention'] ?? null,
            ],
        );

        $evenement->activities()->create([
            'user_id' => $request->user()->id,
            'type' => 'resultat_publie',
            'label' => 'Resultats publies',
            'description' => 'Le classement ou les notes ont ete mis a jour.',
        ]);
        $this->syncCertificateAndNotification($evenement, $resultat->utilisateur_id);

        return back();
    }

    public function update(Request $request, ResultatEvaluation $resultat)
    {
        $validated = $this->validateResultat($request, false);

        $this->authorizeAction($request, $resultat->evenement);

        $resultat->update($validated);
        $this->syncCertificateAndNotification($resultat->evenement, $resultat->utilisateur_id);

        return back();
    }

    public function destroy(Request $request, ResultatEvaluation $resultat)
    {
        $this->authorizeAction($request, $resultat->evenement);

        $resultat->delete();

        return back();
    }

    public function classement(Evenement $evenement)
    {
        if ($evenement->type === 'concours') {
            return $this->workflow->computeResults($evenement)->map(fn (array $row) => [
                'participant_id' => $row['participant']->id,
                'participant' => [
                    'id' => $row['participant']->id,
                    'name' => $row['participant']->name,
                    'email' => $row['participant']->email,
                    'role' => $row['participant']->role,
                ],
                'note' => $row['note'],
                'classement' => $row['classement'],
                'admission' => $row['admission'],
                'mention' => $row['mention'],
                'criteria_breakdown' => $row['criteria_breakdown'],
            ])->values();
        }

        return ResultatEvaluation::with('utilisateur:id,name,email,role')
            ->where('evenement_id', $evenement->id)
            ->orderBy('classement')
            ->orderByDesc('note')
            ->get();
    }

    public function exportPdf(Request $request, Evenement $evenement)
    {
        $this->authorizeAction($request, $evenement);

        $resultats = ResultatEvaluation::with('utilisateur:id,name,email,role')
            ->where('evenement_id', $evenement->id)
            ->orderBy('classement')
            ->orderByDesc('note')
            ->get();

        $pdf = Pdf::loadView('resultats.classement', [
            'evenement' => $evenement,
            'resultats' => $resultats,
        ]);

        return $pdf->download("classement-{$evenement->id}.pdf");
    }

    private function validateResultat(Request $request, bool $requiresEventId): array
    {
        $rules = [
            'utilisateur_id' => ['required_without:evenement_id', 'exists:users,id'],
            'note' => ['required', 'numeric', 'min:0'],
            'classement' => ['nullable', 'integer', 'min:1'],
            'admission' => ['nullable', 'in:admis,liste_attente,ajourne'],
            'mention' => ['nullable', 'string', 'max:255'],
        ];

        if ($requiresEventId) {
            $rules['evenement_id'] = ['required', 'exists:evenements,id'];
        }

        return $request->validate($rules);
    }

    private function authorizeAction(Request $request, Evenement $evenement): void
    {
        $user = $request->user();
        abort_unless($user, 403);

        if ($this->authorization->canManageResults($evenement, $user) || $this->authorization->isPresidentJury($evenement, $user)) {
            return;
        }

        abort(403, 'Action non autorisee');
    }

    private function syncCertificateAndNotification(Evenement $evenement, int $userId): void
    {
        $resultat = ResultatEvaluation::with('utilisateur')->where('evenement_id', $evenement->id)->where('utilisateur_id', $userId)->first();

        if (! $resultat?->utilisateur) {
            return;
        }

        if ($evenement->evenement_certifie && $evenement->results_published_at) {
            $this->certificates->generate($evenement, $resultat->utilisateur);
        }

        $this->notifications->notify(
            $resultat->utilisateur,
            'resultats_publies',
            'Resultats disponibles',
            "Les resultats de {$evenement->titre} sont disponibles.",
            $evenement->id,
            ['resultat_id' => $resultat->id],
            true,
        );
    }
}
