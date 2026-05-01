<?php

namespace App\Http\Controllers;

use App\Models\Vote;
use App\Models\Election;
use App\Models\Candidature;
use App\Models\ListeElectorale;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VoteController extends Controller
{
    /**
     * ÉLECTIONS OUVERTES
     */
    public function electionsOuvertes()
    {
        // Récupérer l'étudiant de l'utilisateur connecté
        $user = auth()->user();
        $etudiant = $user->etudiant ?? null;

        if (!$etudiant) {
            return back()->with('error', 'Vous n\'êtes pas enregistré comme étudiant.');
        }

        $elections = Election::whereHas('listesElectorales', function ($q) use ($etudiant) {
                $q->where('id_etudiant', $etudiant->id);
            })
            ->with(['ufr', 'filiere'])
            ->get()
            ->filter(function ($election) {
                $election->synchronizeStatus();
                return in_array($election->statut, ['ouverte', 'second_tour']);
            });

        return Inertia::render('votes/VoteElectionsOuvertes', compact('elections'));
    }

    /**
     *  LISTE DES CANDIDATS
     */
    public function candidats(Election $election)
    {
        $election->synchronizeStatus();

        // Récupérer l'étudiant de l'utilisateur connecté
        $user = auth()->user();
        $etudiant = $user->etudiant ?? null;

        if (!$etudiant) {
            return back()->with('error', 'Vous n\'êtes pas enregistré comme étudiant.');
        }

        if (!in_array($election->statut, ['ouverte', 'second_tour'])) {
            return back()->with('error', 'Cette élection n\'est pas ouverte pour le vote.');
        }

        // Vérifier que l'étudiant est dans la liste électorale
        $autorise = ListeElectorale::where('id_election', $election->id_election)
            ->where('id_etudiant', $etudiant->id)
            ->exists();

        if (!$autorise) {
            return back()->with('error', 'Non autorisé pour cette élection.');
        }

        // Vérifier s'il a déjà voté
        $dejaVote = Vote::where('id_user', $user->id)
            ->where('id_election', $election->id_election)
            ->where('tour', $election->tour)
            ->exists();

        // Au second tour, n'afficher que les candidats qualifiés (resultat = 'second_tour')
        if ($election->statut === 'second_tour' && $election->tour == 2) {
            $candidatures = Candidature::with('user')
                ->where('id_election', $election->id_election)
                ->where('resultat', 'second_tour')
                ->get();
        } else {
            $candidatures = Candidature::with('user')
                ->where('id_election', $election->id_election)
                ->where('statut', 'validee')
                ->get();
        }

        return Inertia::render('votes/VoteCandidats', compact('election', 'candidatures', 'dejaVote'));
    }

    /**
     *  DÉTAIL CANDIDAT - FIXED
     */
    public function showCandidat(Candidature $candidature)
    {
        $user = auth()->user();
        $etudiant = $user->etudiant ?? null;

        if (!$etudiant) {
            return back()->with('error', 'Non étudiant.');
        }

        $autorise = ListeElectorale::where('id_election', $candidature->id_election)
            ->where('id_etudiant', $etudiant->id)
            ->exists();

        if (!$autorise) {
            return back()->with('error', 'Non autorisé.');
        }

        return Inertia::render('elections/CandidatShow', compact('candidature'));
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

        $user = auth()->user();
        $etudiant = $user->etudiant ?? null;

        if (!$etudiant) {
            return back()->with('error', 'Vous n\'êtes pas enregistré comme étudiant.');
        }

$election = Election::findOrFail($request->id_election);

        $election->synchronizeStatus();

        if (now()->lt($election->date_debut) || now()->gt($election->date_fin)) {
            return back()->with('error', 'Vote non autorisé hors période.');
        }
        
        // Vérifier statut élection - 'ouverte' OU 'second_tour'
        if (!in_array($election->statut, ['ouverte', 'second_tour'])) {
            return back()->with('error', 'Vote fermé ou non ouvert.');
        }

        // Vérifier droit de vote
        $autorise = ListeElectorale::where('id_election', $election->id_election)
            ->where('id_etudiant', $etudiant->id)
            ->exists();

        if (!$autorise) {
            return back()->with('error', 'Non autorisé pour cette élection.');
        }

        // Empêcher double vote
        $dejaVote = Vote::where('id_user', $user->id)
            ->where('id_election', $election->id_election)
            ->where('tour', $election->tour)
            ->exists();

        if ($dejaVote) {
            return back()->with('error', 'Vous avez déjà voté pour cette élection.');
        }

        // Vérifier candidat valide
        if ($election->statut === 'second_tour' && $election->tour == 2) {
            // Au second tour, vérifier que le candidat est qualifié
            $candidature = Candidature::where('id_candidature', $request->id_candidature)
                ->where('id_election', $election->id_election)
                ->where('resultat', 'second_tour')
                ->first();
        } else {
            // Premier tour, vérifier que le candidat est validé
            $candidature = Candidature::where('id_candidature', $request->id_candidature)
                ->where('id_election', $election->id_election)
                ->where('statut', 'validee')
                ->first();
        }

        if (!$candidature) {
            return back()->with('error', 'Candidat invalide.');
        }

        // Enregistrer vote
        Vote::create([
            'id_user' => $user->id,
            'id_election' => $election->id_election,
            'id_candidature' => $candidature->id_candidature,
            'tour' => $election->tour,
            'date_vote' => now(),
        ]);

        return redirect()->route('votes.elections')
            ->with('success', 'Votre vote a été enregistré avec succès!');
    }

    /**
     * 🟢 LIVE INDEX
     */
    public function liveIndex()
    {
        $elections = Election::withCount('votes')
            ->latest()
            ->get()
            ->filter(function ($election) {
                $election->synchronizeStatus();
                // N'afficher que les élections ouvertes, exclure clôturées/terminées
                return in_array($election->statut, ['ouverte', 'planifiee', 'liste_generee']);
            });

        return Inertia::render('resultats/LiveIndex', compact('elections'));
    }

    /**
     * 🔒 LISTE DES VOTES (LECTURE SEULE)
     */
    public function index()
    {
        $votes = Vote::with(['user', 'election', 'candidature.user'])
            ->latest()
            ->get();

        return Inertia::render('votes/VoteList', [
            'votes' => $votes
        ]);
    }

    /**
     * 👁️ DÉTAIL VOTE (LECTURE SEULE)
     */
    public function show(Vote $vote)
    {
        $vote->load(['user', 'election', 'candidature.user']);

        return Inertia::render('votes/VoteShow', [
            'vote' => $vote
        ]);
    }



    /**
     * 🟢 LIVE SHOW (VERSION MODERNE SANS DB::raw)
     */
    public function liveShow(Election $election)
    {
        $election->synchronizeStatus();

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

        return Inertia::render('resultats/LiveShow', [
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
