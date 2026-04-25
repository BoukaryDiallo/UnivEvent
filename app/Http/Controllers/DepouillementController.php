<?php
namespace App\Http\Controllers;

use App\Models\Election;
use App\Models\Vote;
use App\Models\Candidature;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DepouillementController extends Controller
{
public function depouiller(Election $election)
    {
        if ($election->statut !== 'cloturee') {
            return back()->with('error', "L'élection doit être clôturée avant de procéder au dépouillement.");
        }

        $votes = Vote::where('id_election', $election->id_election)
            ->where('tour', $election->tour);

        $total = $votes->count();

        // Permettre l'affichage même avec 0 vote pour consulter les résultats

        $resultats = $votes->select(
                'id_candidature',
                DB::raw('COUNT(*) as nb_voix')
            )
            ->groupBy('id_candidature')
            ->orderByDesc('nb_voix')
            ->get();

        foreach ($resultats as $r) {
            $r->pourcentage = ($r->nb_voix * 100) / $total;
        }

        // Charger les informations des candidats
        $resultats->load('candidature.user');

        return Inertia::render('depouillement/Depouillement', [
            'election' => $election,
            'resultats' => $resultats,
            'total' => $total,
            'tour' => $election->tour
        ]);
    }

    public function publier(Election $election)
    {
        if ($election->statut !== 'cloturee') {
            return back()->with('error', "L'élection doit être clôturée avant de publier les résultats.");
        }

        $votes = Vote::where('id_election', $election->id_election)
            ->where('tour', $election->tour);

        $total = $votes->count();

        if ($total === 0) {
            return back()->with('error', 'Aucun vote pour ce tour.');
        }

        $resultats = $votes->select(
                'id_candidature',
                DB::raw('COUNT(*) as nb_voix')
            )
            ->groupBy('id_candidature')
            ->orderByDesc('nb_voix')
            ->get();

        foreach ($resultats as $r) {
            $r->pourcentage = ($r->nb_voix * 100) / $total;
        }

        $winner = $resultats->first();

        if ($winner->pourcentage >= 50) {

            Candidature::where('id_candidature', $winner->id_candidature)
                ->update(['resultat' => 'elu']);

            Candidature::where('id_election', $election->id_election)
                ->where('id_candidature', '!=', $winner->id_candidature)
                ->update(['resultat' => 'eliminee']);

            $election->update(['statut' => 'terminee']);

            return redirect()->route('resultats.show', ['election' => $election->id_election])
                ->with('success', 'Résultats publiés avec succès !');
        }

        if ($election->tour == 1) {

            $top2 = $resultats->take(2)->pluck('id_candidature');

            Candidature::where('id_election', $election->id_election)
                ->whereIn('id_candidature', $top2)
                ->update(['resultat' => 'second_tour']);

            Candidature::where('id_election', $election->id_election)
                ->whereNotIn('id_candidature', $top2)
                ->update(['resultat' => 'eliminee']);

            // Passer à 'second_tour_planifie' pour attendre la configuration des dates
            $election->update([
                'tour' => 2,
                'statut' => 'second_tour_planifie'
            ]);

            return redirect()->route('elections.admin', ['election' => $election->id_election])
                ->with('success', 'Résultats du premier tour publiés. Veuillez configurer les dates du second tour.');
        }

        $winnerFinal = $resultats->first();

        Candidature::where('id_candidature', $winnerFinal->id_candidature)
            ->update(['resultat' => 'elu']);

        Candidature::where('id_election', $election->id_election)
            ->where('id_candidature', '!=', $winnerFinal->id_candidature)
            ->update(['resultat' => 'eliminee']);

        $election->update(['statut' => 'terminee']);

        return redirect()->route('resultats.show', ['election' => $election->id_election])
            ->with('success', 'Résultats publiés avec succès !');
    }
}