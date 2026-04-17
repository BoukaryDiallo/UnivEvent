<?php

namespace App\Http\Controllers;

use App\Models\Vote;
use App\Models\Election;
use App\Models\Candidature;
use App\Models\ListeElectorale;
use Illuminate\Http\Request;

class VoteController extends Controller
{
    /**
     * 📌 ÉLECTIONS OUVERTES
     */
    public function electionsOuvertes()
    {
        $etudiantId = 3;

        $elections = Election::whereIn('statut', ['ouverte', 'second_tour'])
            ->whereHas('listesElectorales', function ($q) use ($etudiantId) {
                $q->where('id_etudiant', $etudiantId);
            })
            ->get();

        return view('pages.elections.list_election_ouverte', compact('elections'));
    }

    /**
     * 📌 LISTE DES CANDIDATS
     */
    public function candidats(Election $election)
    {
        $etudiantId = 1;

        $autorise = ListeElectorale::where('id_election', $election->id_election)
            ->where('id_etudiant', $etudiantId)
            ->exists();

        if (!$autorise) {
            return back()->with('error', 'Non autorisé.');
        }

        $candidatures = Candidature::with('user')
            ->where('id_election', $election->id_election)
            ->where('statut', 'validee')
            ->get();

        return view('pages.elections.list_candidat', compact('election', 'candidatures'));
    }

    /**
     * 📌 DÉTAIL CANDIDAT
     */
    public function showCandidat(Candidature $candidature)
    {
        $etudiantId = 1;

        $autorise = ListeElectorale::where('id_election', $candidature->id_election)
            ->where('id_etudiant', $etudiantId)
            ->exists();

        if (!$autorise) {
            return back()->with('error', 'Non autorisé.');
        }

        return view('pages.elections.candidat_show', compact('candidature'));
    }

    /**
     * 📌 ENREGISTREMENT DU VOTE
     */
    public function store(Request $request)
    {
        $request->validate([
            'id_election' => 'required|exists:elections,id_election',
            'id_candidature' => 'required|exists:candidatures,id_candidature',
        ]);

        $userId = 1;
        $etudiantId = 1;

        $election = Election::findOrFail($request->id_election);

        // Vérifier statut élection
        if (!in_array($election->statut, ['ouverte', 'second_tour'])) {
            return back()->with('error', 'Vote fermé.');
        }

        // Vérifier droit de vote
        $autorise = ListeElectorale::where('id_election', $election->id_election)
            ->where('id_etudiant', $etudiantId)
            ->exists();

        if (!$autorise) {
            return back()->with('error', 'Non autorisé.');
        }

        // Empêcher double vote
        $dejaVote = Vote::where('id_user', $userId)
            ->where('id_election', $election->id_election)
            ->where('tour', $election->tour)
            ->exists();

        if ($dejaVote) {
            return back()->with('error', 'Déjà voté.');
        }

        // Vérifier candidat valide
        $candidature = Candidature::where('id_candidature', $request->id_candidature)
            ->where('id_election', $election->id_election)
            ->where('statut', 'validee')
            ->first();

        if (!$candidature) {
            return back()->with('error', 'Candidat invalide.');
        }

        // Enregistrer vote
        Vote::create([
            'id_user' => $userId,
            'id_election' => $election->id_election,
            'id_candidature' => $candidature->id_candidature,
            'tour' => $election->tour,
            'date_vote' => now(),
        ]);

        return redirect()->route('votes.elections')
            ->with('success', 'Vote enregistré.');
    }

    /**
     * 🟢 LIVE INDEX
     */
    public function liveIndex()
    {
        $elections = Election::whereIn('statut', ['ouverte', 'second_tour'])
            ->withCount('votes')
            ->latest()
            ->get();

        return view('pages.resultats.live_index', compact('elections'));
    }

    /**
     * 🟢 LIVE SHOW (VERSION MODERNE SANS DB::raw)
     */
    public function liveShow(Election $election)
    {
        // Total votes
        $totalVotes = Vote::where('id_election', $election->id_election)->count();

        // Total électeurs
        $totalVoters = ListeElectorale::where('id_election', $election->id_election)->count();

        // ✅ VERSION MODERNE (sans DB::raw ni selectRaw)
        $votesGrouped = Vote::where('id_election', $election->id_election)
            ->get()
            ->groupBy('id_candidature')
            ->map(fn ($group) => $group->count());

        // Candidats validés
        $candidates = Candidature::with('user')
            ->where('id_election', $election->id_election)
            ->where('statut', 'validee')
            ->get()
            ->map(function ($cand) use ($votesGrouped, $totalVotes) {

                $votes = $votesGrouped[$cand->id_candidature] ?? 0;

                return (object)[
                    'name'    => $cand->user->name ?? 'Candidat',
                    'photo'   => $cand->user->photo ?? null,
                    'slogan'  => $cand->slogan ?? '',
                    'votes'   => $votes,
                    'percent' => $totalVotes > 0
                        ? round(($votes * 100) / $totalVotes, 2)
                        : 0,
                ];
            });

        // Résumé élection
        $electionData = (object)[
            'id_election'  => $election->id_election,
            'title'        => $election->titre,
            'status'       => $election->statut,
            'votes_count'  => $totalVotes,
            'total_voters' => $totalVoters,
            'progress'     => $totalVoters > 0
                ? round(($totalVotes * 100) / $totalVoters, 2)
                : 0,
        ];

        return view('pages.resultats.live_show', [
            'election'   => $electionData,
            'candidates' => $candidates
        ]);
    }
}

// namespace App\Http\Controllers;

// use App\Models\Vote;
// use App\Models\Election;
// use App\Models\Candidature;
// use App\Models\ListeElectorale;
// use Illuminate\Http\Request;
// use Illuminate\Support\Facades\Auth;

// class VoteController extends Controller
// {
//     /**
//      * Liste des élections ouvertes pour l'étudiant connecté
//      */
//     public function electionsOuvertes()
//     {
//         $etudiant = Auth::user()->etudiant;

//         $elections = Election::whereIn('statut', ['ouverte', 'second_tour'])
//             ->whereHas('listesElectorales', function ($q) use ($etudiant) {
//                 $q->where('id_etudiant', $etudiant->id);
//             })
//             ->get();

//         return view('pages.elections.list_election_ouverte', compact('elections'));
//     }

//     /**
//      * Afficher les candidats VALIDÉS pour voter
//      */
//     public function candidats(Election $election)
//     {
//         $etudiant = Auth::user()->etudiant;

//         // Vérifier droit de vote
//         $autorise = ListeElectorale::where('id_election', $election->id_election)
//             ->where('id_etudiant', $etudiant->id)
//             ->exists();

//         if (!$autorise) {
//             return back()->with('error', 'Vous n’êtes pas autorisé à voter.');
//         }

//         // 🔥 UNIQUEMENT candidatures validées
//         $candidatures = Candidature::with('user')
//             ->where('id_election', $election->id_election)
//             ->where('statut', 'validee')
//             ->get();

//         return view('pages.elections.list_candidat', compact('election', 'candidatures'));
//     }

//     /**
//      * Voir le profil d’un candidat (autorisé seulement si l’étudiant peut voter)
//      */
//     public function showCandidat(Candidature $candidature)
//     {
//         $etudiant = Auth::user()->etudiant;

//         $autorise = ListeElectorale::where('id_election', $candidature->id_election)
//             ->where('id_etudiant', $etudiant->id)
//             ->exists();

//         if (!$autorise) {
//             return back()->with('error', 'Accès refusé.');
//         }

//         return view('pages.elections.candidat_show', compact('candidature'));
//     }

//     /**
//      * Enregistrer le vote
//      */
//     public function store(Request $request)
//     {
//         $request->validate([
//             'id_election' => 'required|exists:elections,id_election',
//             'id_candidature' => 'required|exists:candidatures,id_candidature',
//         ]);

//         $user = Auth::user();
//         $etudiant = $user->etudiant;

//         $election = Election::findOrFail($request->id_election);

//         // Vérifier élection ouverte
//         if (!in_array($election->statut, ['ouverte', 'second_tour'])) {
//             return back()->with('error', 'Le vote est fermé.');
//         }

//         // Vérifier liste électorale
//         $autorise = ListeElectorale::where('id_election', $election->id_election)
//             ->where('id_etudiant', $etudiant->id)
//             ->exists();

//         if (!$autorise) {
//             return back()->with('error', 'Vous n’êtes pas dans la liste électorale.');
//         }

//         // Empêcher double vote par tour
//         $dejaVote = Vote::where('id_user', $user->id)
//             ->where('id_election', $election->id_election)
//             ->where('tour', $election->tour)
//             ->exists();

//         if ($dejaVote) {
//             return back()->with('error', 'Vous avez déjà voté pour ce tour.');
//         }

//         // 🔥 Sécurité critique : candidature validée seulement
//         $candidature = Candidature::where('id_candidature', $request->id_candidature)
//             ->where('id_election', $election->id_election)
//             ->where('statut', 'validee')
//             ->first();

//         if (!$candidature) {
//             return back()->with('error', 'Candidature invalide.');
//         }

//         // Enregistrer vote
//         Vote::create([
//             'id_user' => $user->id,
//             'id_election' => $election->id_election,
//             'id_candidature' => $candidature->id_candidature,
//             'tour' => $election->tour,
//             'date_vote' => now(),
//         ]);

//         return redirect()->route('votes.elections')
//             ->with('success', 'Vote enregistré avec succès.');
//     }
// }

//<?php
