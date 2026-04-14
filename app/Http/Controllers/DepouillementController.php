<?php

namespace App\Http\Controllers;

use App\Models\Election;
use App\Models\Vote;
use App\Models\Candidature;
use Illuminate\Support\Facades\DB;

class DepouillementController extends Controller
{
   public function depouiller($id_election)
{
    $election = Election::findOrFail($id_election);

    // Votes du tour actuel uniquement
    $votes = Vote::where('id_election', $id_election)
        ->where('tour', $election->tour);

    $total = $votes->count();

    if ($total == 0) {
        return back()->with('error', 'Aucun vote pour ce tour.');
    }

    $resultats = $votes->select(
            'id_candidature',
            DB::raw('count(*) as nb_voix')
        )
        ->groupBy('id_candidature')
        ->orderByDesc('nb_voix')
        ->get();

    foreach ($resultats as $r) {
        $r->pourcentage = ($r->nb_voix * 100) / $total;
    }

    $winner = $resultats->first();


       //victoire directe

    if ($winner->pourcentage >= 50) {

        Candidature::where('id_candidature', $winner->id_candidature)
            ->update(['resultat' => 'elu']);

        Candidature::where('id_election', $id_election)
            ->where('id_candidature', '!=', $winner->id_candidature)
            ->update(['resultat' => 'eliminee']);

        $election->update([
            'statut' => 'terminee'
        ]);

        return back()->with('success', 'Élection terminée.');
    }
        //passage au second tour

    if ($election->tour == 1) {

        $top2 = $resultats->take(2)->pluck('id_candidature');

        Candidature::where('id_election', $id_election)
            ->whereIn('id_candidature', $top2)
            ->update(['resultat' => 'second_tour']);

        Candidature::where('id_election', $id_election)
            ->whereNotIn('id_candidature', $top2)
            ->update(['resultat' => 'eliminee']);

        $election->update([
            'tour' => 2,
            'statut' => 'second_tour'
        ]);

        return back()->with('warning', 'Second tour requis.');
    }

       // second tour

    $winnerFinal = $resultats->first();

    Candidature::where('id_candidature', $winnerFinal->id_candidature)
        ->update(['resultat' => 'elu']);

    Candidature::where('id_election', $id_election)
        ->where('id_candidature', '!=', $winnerFinal->id_candidature)
        ->update(['resultat' => 'eliminee']);

    $election->update([
        'statut' => 'terminee'
    ]);

    return back()->with('success', 'Élection terminée (tour 2).');
}
}