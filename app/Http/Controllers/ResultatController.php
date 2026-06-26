<?php

namespace App\Http\Controllers;

use App\Models\Election;
use App\Models\Resultat;
use App\Services\ElectionService;
use App\Services\PublicationService;
use Inertia\Inertia;

class ResultatController extends Controller
{
    private ElectionService $electionService;

    private PublicationService $publicationService;

    public function __construct(
        ElectionService $electionService,
        PublicationService $publicationService
    ) {
        $this->electionService = $electionService;
        $this->publicationService = $publicationService;
    }

    /**
     * Affiche la liste des élections avec leurs résultats (ADMIN)
     */
    public function index()
    {
        $elections = Election::with(['ufr', 'filiere', 'candidatures.user'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Ajouter le statut des résultats pour chaque élection
        $electionsWithResultStatus = $elections->map(function ($election) {
            $hasResultatsOfficiels = Resultat::where('id_election', $election->id_election)
                ->where('tour', $election->tour)
                ->where('statut_publication', 'officiel')
                ->exists();

            $hasResultatsBrouillons = Resultat::where('id_election', $election->id_election)
                ->where('tour', $election->tour)
                ->where('statut_publication', 'brouillon')
                ->exists();

            $resultatStatut = $hasResultatsOfficiels ? 'officiel' :
                            ($hasResultatsBrouillons ? 'brouillon' : 'aucun');

            return [
                'id_election' => $election->id_election,
                'titre' => $election->titre,
                'description' => $election->description,
                'statut' => $election->statut,
                'resultat_statut' => $resultatStatut,
                'date_debut' => $election->date_debut,
                'date_fin' => $election->date_fin,
                'tour' => $election->tour,
                'ufr' => $election->ufr,
                'filiere' => $election->filiere,
            ];
        });

        return Inertia::render('resultats/ResultatIndex', [
            'elections' => $electionsWithResultStatus,
        ]);
    }

    /**
     * Affiche l'espace élections (PUBLIC/ÉLECTEURS)
     */
    public function espaceElections()
    {
        $elections = Election::with(['ufr', 'filiere', 'candidatures.user'])
            ->orderBy('created_at', 'desc')
            ->get();

        $workflow = [
            'liste_generee' => $elections->where('statut', 'liste_generee')->values(),
            'planifiee' => $elections->where('statut', 'planifiee')->values(),
            'ouverte' => $elections->whereIn('statut', ['ouverte', 'second_tour'])->values(),
            'cloturee' => $elections->where('statut', 'cloturee')->values(),
            'terminee' => $elections->where('statut', 'terminee')->values(),
        ];

        return Inertia::render('resultats/ResultatsVote', [
            'workflow' => $workflow,
            'stats' => [
                'total_elections' => $elections->count(),
                'ouvertes' => $workflow['ouverte']->count(),
                'cloturees' => $workflow['cloturee']->count(),
                'terminees' => $workflow['terminee']->count(),
            ],
        ]);
    }

    /**
     * Affiche les résultats officiels d'une élection
     */
    public function show(Election $election)
    {
        $election->load(['candidatures.user', 'listesElectorales']);

        // Récupérer les résultats en brouillon (provisoires)
        $resultatsBrouillons = Resultat::where('id_election', $election->id_election)
            ->where('tour', $election->tour)
            ->where('statut_publication', 'brouillon')
            ->with(['candidature.user'])
            ->orderBy('rang')
            ->get();

        // Récupérer les résultats officiels
        $resultatsOfficiels = Resultat::where('id_election', $election->id_election)
            ->where('tour', $election->tour)
            ->where('statut_publication', 'officiel')
            ->with(['candidature.user'])
            ->orderBy('rang')
            ->get();

        $totalVotes = $resultatsBrouillons->sum('nb_voix');
        $totalVoters = $election->listesElectorales()->count();
        $participationRate = $totalVoters > 0 ? round(($totalVotes / $totalVoters) * 100, 1) : 0;

        // Calculer si le second tour est requis
        $secondTourRequis = false;
        if ($resultatsBrouillons->isNotEmpty() && $election->tour === 1) {
            $premier = $resultatsBrouillons->first();
            $deuxieme = $resultatsBrouillons->skip(1)->first();

            // Égalité des voix OU pas de majorité absolue
            $secondTourRequis = ($deuxieme && $premier->nb_voix === $deuxieme->nb_voix) || ($premier->pourcentage <= 50);
        }

        // Peut publier si on a des résultats en brouillon et pas encore d'officiels
        $peutPublier = $resultatsBrouillons->isNotEmpty() && $resultatsOfficiels->isEmpty();

        return Inertia::render('resultats/ResultatsVote', [
            'election' => $election,
            'resultatsOfficiels' => $resultatsOfficiels,
            'resultatsBrouillons' => $resultatsBrouillons,
            'resultatsAffiches' => $resultatsOfficiels->isNotEmpty() ? $resultatsOfficiels : $resultatsBrouillons,
            'totalVotes' => $totalVotes,
            'totalVoters' => $totalVoters,
            'participationRate' => $participationRate,
            'showPublishButton' => $peutPublier,
            'etatResultats' => null, // Plus utilisé car on affiche selon le statut
        ]);
    }

    /**
     * Publier les résultats provisoires (BROUILLON -> PROVISOIRE)
     */
    public function publierProvisoire(Election $election)
    {
        if ($this->publicationService->resultatsImmuables($election)) {
            return back()->with('error', 'Les résultats sont déjà publiés officiellement.');
        }

        // Marquer les résultats comme provisoires
        Resultat::where('id_election', $election->id_election)
            ->where('tour', $election->tour)
            ->where('statut_publication', 'brouillon')
            ->update(['statut_publication' => 'provisoire']);

        // Mettre à jour le statut de l'élection
        $election->update(['statut' => 'resultats_provisoires']);

        return redirect()
            ->route('resultats.show', $election->id_election)
            ->with('success', 'Résultats provisoires publiés avec succès');
    }

    /**
     * Publier les résultats (BROUILLON -> OFFICIEL)
     */
    public function publier(Election $election)
    {
        if ($this->publicationService->resultatsImmuables($election)) {
            return back()->with('error', 'Les résultats sont déjà publiés et immuables.');
        }

        $result = $this->publicationService->publierResultats($election);

        if ($result['decision']['type'] === 'second_tour') {
            return redirect()
                ->route('elections.admin', ['election' => $election->id_election])
                ->with('success', $result['decision']['message']);
        }

        return redirect()
            ->route('resultats.show', ['election' => $election->id_election])
            ->with('success', $result['decision']['message']);
    }

    /**
     * Preview des résultats en brouillon
     */
    public function preview(Election $election)
    {
        if (! $this->electionService->aResultatsBrouillon($election)) {
            return back()->with('error', 'Aucun résultat trouvé.');
        }

        $resultats = Resultat::where('id_election', $election->id_election)
            ->where('tour', $election->tour)
            ->where('statut_publication', 'brouillon')
            ->with('candidature.user')
            ->orderBy('rang')
            ->get();

        return Inertia::render('resultats/PreviewResultats', [
            'election' => $election,
            'resultats' => $resultats,
            'totalVotes' => $resultats->sum('nb_voix'),
            'peutPublier' => ! $this->publicationService->resultatsImmuables($election),
        ]);
    }

    /**
     * Calcule l'état des résultats (logique métier centralisée)
     */
    private function calculerEtatResultats($resultats, Election $election): array
    {
        if ($resultats->isEmpty()) {
            return [
                'winner' => null,
                'secondTourNeeded' => false,
                'equality' => false,
                'majority' => false,
                'type' => 'no_results',
            ];
        }

        $total = $resultats->sum('nb_voix');
        $premier = $resultats->first();
        $deuxieme = $resultats->skip(1)->first();

        // Vérifier s'il y a un élu
        $winner = $resultats->firstWhere('candidature.resultat', 'elu');

        // Vérifier l'égalité des voix
        $equality = $deuxieme && $premier->nb_voix === $deuxieme->nb_voix;

        // Majorité absolue stricte
        $majority = $premier && $premier->pourcentage > 50;

        // Second tour requis
        $secondTourNeeded = ($election->tour === 1) && (! $majority || $equality);

        return [
            'winner' => $winner,
            'secondTourNeeded' => $secondTourNeeded,
            'equality' => $equality,
            'majority' => $majority,
            'type' => $winner ? 'elected' : ($secondTourNeeded ? 'second_tour' : 'no_majority'),
        ];
    }

    /**
     * Format affichage résultats
     */
    private function formatResultatsAffichage($resultatsOfficiels, $totalVotes)
    {
        $results = [];

        foreach ($resultatsOfficiels as $resultat) {
            $results[] = [
                'id' => $resultat->id_candidature,
                'name' => $resultat->candidature->user->name,
                'photo' => $resultat->candidature->user->photo,
                'votes' => $resultat->nb_voix,
                'percentage' => $resultat->pourcentage,
                'isWinner' => $resultat->candidature->resultat === 'elu',
                'resultat' => $resultat->candidature->resultat,
            ];
        }

        return [[
            'type' => 'resultats_publies',
            'date' => now()->format('d/m/Y'),
            'title' => 'Résultats officiels publiés',
            'results' => $results,
            'total_votes' => $totalVotes,
        ]];
    }

    private function formatElection($election, $totalVotes, $totalVoters)
    {
        return (object) [
            'id_election' => $election->id_election,
            'title' => $election->titre,
            'promotion' => $election->promotion,
            'status' => ucfirst($election->statut),
            'votes_count' => $totalVotes,
            'total_voters' => $totalVoters,
            'progress' => $totalVoters > 0
                ? round(($totalVotes * 100) / $totalVoters, 2)
                : 0,
        ];
    }
}
