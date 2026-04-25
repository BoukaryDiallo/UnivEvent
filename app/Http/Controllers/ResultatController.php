<?php

namespace App\Http\Controllers;

use App\Models\Election;
use App\Models\Vote;
use App\Models\Candidature;
use Inertia\Inertia;

class ResultatController extends Controller
{
    public function index()
    {
        $elections = Election::with(['ufr', 'filiere', 'candidatures.user'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Organiser les élections par statut pour le workflow
        $workflow = [
            'liste_generee' => $elections->where('statut', 'liste_generee')->values(),
            'planifiee' => $elections->where('statut', 'planifiee')->values(),
            'ouverte' => $elections->whereIn('statut', ['ouverte', 'second_tour'])->values(), // Inclure second_tour
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
            ]
        ]);
    }

    public function show(Election $election)
    {
        $election->load(['candidatures.user', 'listesElectorales']);

        $totalVotes = Vote::where('id_election', $election->id_election)->count();
        $totalVoters = $election->listesElectorales()->count();

        // Générer la timeline de posts dynamique
        $posts = $this->generateTimelinePosts($election, $totalVotes);

        return Inertia::render('resultats/ResultatsVote', [
            'election' => $this->formatElection($election, $totalVotes, $totalVoters),
            'posts' => $posts
        ]);
    }

    private function generateTimelinePosts($election, $totalVotes)
    {
        $posts = [];

        // Afficher uniquement les informations pertinentes pour les résultats

        // Post 5: Résultats publiés (si statut terminee)
        if ($election->statut === 'terminee') {
            // Pour l'espace résultats, afficher uniquement les candidats avec des résultats
            $candidaturesAAfficher = $election->candidatures;
            
            $results = [];
            foreach ($candidaturesAAfficher as $candidature) {
                $voteCount = Vote::where('id_candidature', $candidature->id_candidature)
                    ->where('id_election', $election->id_election)
                    ->count();
                $percentage = $totalVotes > 0 ? round(($voteCount * 100) / $totalVotes, 2) : 0;
                
                $results[] = [
                    'id' => $candidature->id_candidature,
                    'name' => $candidature->user->name,
                    'photo' => $candidature->user->photo,
                    'votes' => $voteCount,
                    'percentage' => $percentage,
                    'isWinner' => $candidature->resultat === 'elu',
                    'resultat' => $candidature->resultat
                ];
            }
            
            // Trier par nombre de votes
            usort($results, function ($a, $b) {
                return $b['votes'] - $a['votes'];
            });

            $posts[] = [
                'type' => 'resultats_publies',
                'date' => now()->format('d/m/Y'),
                'title' => 'Résultats officiels publiés',
                'results' => $results,
                'total_votes' => $totalVotes
            ];
        }

        return $posts;
    }

    private function getCandidates($election, $totalVotes)
    {
        return $election->candidatures()
            ->with('user')
            ->where('statut', 'validee')
            ->get()
            ->map(function ($cand) use ($election, $totalVotes) {

                $votes = Vote::where('id_candidature', $cand->id_candidature)
                    ->where('id_election', $election->id_election)
                    ->count();

                return (object)[
                    'name' => $cand->user->name ?? 'Candidat',
                    'photo' => $cand->user->photo ?? null,
                    'slogan' => $cand->slogan ?? '',
                    'votes' => $votes,
                    'vote_percentage' => $totalVotes > 0
                        ? round(($votes * 100) / $totalVotes, 2)
                        : 0,
                ];
            });
    }

    private function getFinalResults($election, $totalVotes)
    {
        // Afficher les résultats officiels uniquement si l'élection est terminée (publiée)
        if ($election->statut !== 'terminee') {
            return null;
        }

        return Candidature::with('user')
            ->where('id_election', $election->id_election)
            ->where('statut', 'validee')
            ->get()
            ->map(function ($cand) use ($election, $totalVotes) {

                $votes = Vote::where('id_candidature', $cand->id_candidature)
                    ->where('id_election', $election->id_election)
                    ->count();

                return (object)[
                    'name' => $cand->user->name,
                    'photo' => $cand->user->photo,
                    'votes' => $votes,
                    'percentage' => $totalVotes > 0
                        ? round(($votes * 100) / $totalVotes, 2)
                        : 0,
                    'isWinner' => $cand->resultat === 'elu', // Utiliser le champ resultat pour déterminer le gagnant
                    'resultat' => $cand->resultat // Ajouter le champ resultat
                ];
            })
            ->sortByDesc('votes')
            ->values();
    }

    private function formatElection($election, $totalVotes, $totalVoters)
    {
        return (object)[
            'id_election' => $election->id_election,
            'title' => $election->titre,
            'promotion' => $election->promotion,
            'status' => ucfirst($election->statut),
            'votes_count' => $totalVotes,
            'total_voters' => $totalVoters,
            'progress' => $totalVoters > 0
                ? round(($totalVotes * 100) / $totalVoters, 2)
                : 0
        ];
    }
}