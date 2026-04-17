<?php

namespace App\Http\Controllers;

use App\Models\Election;
use App\Models\Vote;
use App\Models\Candidature;

class ResultatController extends Controller
{
    public function index()
    {
        $elections = Election::withCount('votes')
            ->orderByDesc('created_at')
            ->get();

        return view('pages.resultats.historique', compact('elections'));
    }

    public function show(Election $election)
    {
        $election->load(['candidatures.user', 'listesElectorales']);

        $totalVotes = Vote::where('id_election', $election->id_election)->count();
        $totalVoters = $election->listesElectorales()->count();

        $candidates = $this->getCandidates($election, $totalVotes);
        $finalResults = $this->getFinalResults($election, $totalVotes);

        return view('pages.votes.resultats_vote', [
            'election' => $this->formatElection($election, $totalVotes, $totalVoters),
            'candidates' => $candidates,
            'finalResults' => $finalResults
        ]);
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
        if ($election->statut !== 'cloturee') {
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
                    'isWinner' => false
                ];
            })
            ->sortByDesc('votes')
            ->values()
            ->map(function ($item, $index) {
                $item->isWinner = $index === 0;
                return $item;
            });
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