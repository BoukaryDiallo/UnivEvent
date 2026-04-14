<?php

namespace App\Http\Controllers;

use App\Models\Election;
use App\Models\Vote;
use App\Models\Candidature;
use Illuminate\Support\Facades\DB;

class ResultatController extends Controller
{
    /**
     * HISTORIQUE DES ÉLECTIONS
     */
    public function index()
    {
        $elections = Election::with('candidatures')
            ->orderByDesc('created_at')
            ->get();

        return view('pages.resultats.historique', compact('elections'));
    }

    /**
     * RÉSULTATS D’UNE ÉLECTION (DETAIL COMPLET)
     */
    public function show($id)
    {
        $election = Election::with([
            'candidatures.user',
            'listesElectorales'
        ])->findOrFail($id);

        $votes = Vote::where('id_election', $id)
            ->where('tour', $election->tour);

        $totalVotes = $votes->count();

        $resultats = $votes->select(
                'id_candidature',
                DB::raw('count(*) as nb_voix')
            )
            ->groupBy('id_candidature')
            ->orderByDesc('nb_voix')
            ->get();

        // enrichir avec infos candidat
        foreach ($resultats as $r) {

            $candidat = Candidature::with('user')
                ->find($r->id_candidature);

            $r->candidat = $candidat;

            $r->pourcentage = $totalVotes > 0
                ? round(($r->nb_voix * 100) / $totalVotes, 2)
                : 0;

            $r->statut = $candidat->resultat;
        }

        return view('pages.resultats.dashboard', compact(
            'election',
            'resultats',
            'totalVotes'
        ));
    }
}