<?php

namespace App\Http\Controllers;

use App\Models\Election;
use App\Models\Resultat;
use App\Services\ElectionService;
use App\Services\DepouillementService;
use Inertia\Inertia;

class DepouillementController extends Controller
{
    private ElectionService $electionService;
    private DepouillementService $depouillementService;

    public function __construct(
        ElectionService $electionService,
        DepouillementService $depouillementService
    ) {
        $this->electionService = $electionService;
        $this->depouillementService = $depouillementService;
    }

    public function calculer(Election $election)
    {
        try {

            if (!$this->electionService->peutEtreDepouillee($election)) {
                return back()->with('error', 'Cette élection ne peut pas être dépouillée.');
            }

            if ($this->electionService->resultatsPublies($election)) {
                return back()->with('error', 'Résultats déjà publiés. Dépouillement verrouillé.');
            }

            if (!$this->depouillementService->doitRecalculer($election)) {
                return back()->with('info', 'Les résultats sont déjà à jour.');
            }

            $result = $this->depouillementService->calculerResultats($election);

            return redirect()
                ->route('depouillement.results', $election->id_election)
                ->with('success', $result['message']);

        } catch (\InvalidArgumentException $e) {

            return back()->with('error', $e->getMessage());

        } catch (\Exception $e) {

            return back()->with('error', 'Erreur lors du calcul des résultats.');
        }
    }

    /**
     * Afficher les résultats du dépouillement
     */
    public function showResults(Election $election)
    {
        $election->load(['candidatures.user', 'listesElectorales']);

        // Récupérer les résultats en brouillon (provisoires)
        $resultats = Resultat::where('id_election', $election->id_election)
            ->where('tour', $election->tour)
            ->where('statut_publication', 'brouillon')
            ->with(['candidature.user'])
            ->orderBy('rang')
            ->get();

        $total = $resultats->sum('nb_voix');

        // Calculer si le second tour est requis
        $secondTourRequis = false;
        if ($resultats->isNotEmpty() && $election->tour === 1) {
            $premier = $resultats->first();
            $deuxieme = $resultats->skip(1)->first();
            
            // Égalité des voix OU pas de majorité absolue
            $secondTourRequis = ($deuxieme && $premier->nb_voix === $deuxieme->nb_voix) || ($premier->pourcentage <= 50);
        }

        // Vérifier si on peut publier (pas encore de résultats officiels)
        $peutPublier = !Resultat::where('id_election', $election->id_election)
            ->where('tour', $election->tour)
            ->where('statut_publication', 'officiel')
            ->exists();

        return Inertia::render('depouillement/Depouillement', [
            'election' => $election,
            'resultats' => $resultats,
            'total' => $total,
            'tour' => $election->tour,
            'secondTourRequis' => $secondTourRequis,
            'peutPublier' => $peutPublier
        ]);
    }

    public function etat(Election $election)
    {
        try {

            $etat = [
                'peut_depouiller' => $this->electionService->peutEtreDepouillee($election),
                'a_brouillon' => $this->electionService->aResultatsBrouillon($election),
                'a_officiel' => $this->electionService->aResultatsOfficiels($election),
                'doit_recalculer' => $this->depouillementService->doitRecalculer($election),
                'immuable' => $this->electionService->resultatsPublies($election),
                'tour' => $election->tour,
                'statut' => $election->statut,
                'validation' => $this->electionService->validerIntegrite($election),
            ];

            return response()->json($etat);

        } catch (\Exception $e) {

            return response()->json([
                'error' => 'Impossible de récupérer l’état'
            ], 500);
        }
    }
}