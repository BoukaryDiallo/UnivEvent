<?php

// namespace App\Http\Controllers;

// use App\Models\Vote;
// use App\Models\Election;
// use App\Models\Candidature;
// use App\Models\ListeElectorale;
// use Illuminate\Http\Request;
// use Illuminate\Support\Facades\Auth;

// class VoteController extends Controller
// {

//     public function index()
//     {
//         $votes = Vote::with(['user','election','candidature'])->get();
//         return view('pages.votes.list_vote', compact('votes'));
//     }

//     public function create($id_election)
//     {
//         $election = Election::with('candidatures.user')
//             ->findOrFail($id_election);

//         return view('pages.votes.create_vote', compact('election'));
//     }

//     public function store(Request $request)
// {
//     $request->validate([
//         'id_election' => 'required|exists:elections,id_election',
//         'id_candidature' => 'required|exists:candidatures,id_candidature',
//     ]);

//     $user = Auth::user();

//     $election = Election::findOrFail($request->id_election);

//     // Vérifier période
//     if (now()->lt($election->date_debut) || now()->gt($election->date_fin)) {
//         return back()->with('error', 'Vote hors période.');
//     }

//     // Vérifier étudiant
//     $etudiant = $user->etudiant;
//     if (!$etudiant) {
//         return back()->with('error', 'Non autorisé.');
//     }

//     // Vérifier liste électorale
//     $electeur = ListeElectorale::where('id_election', $election->id_election)
//         ->where('id_etudiant', $etudiant->id)
//         ->first();

//     if (!$electeur) {
//         return back()->with('error', 'Pas dans la liste électorale.');
//     }

//     // Vérifier candidature valide pour cette élection
//     $candidature = Candidature::where('id_candidature', $request->id_candidature)
//         ->where('id_election', $election->id_election)
//         ->first();

//     if (!$candidature) {
//         return back()->with('error', 'Candidature invalide.');
//     }

//     // ❗ Empêcher double vote par tour
//     $dejaVote = Vote::where('id_user', $user->id)
//         ->where('id_election', $election->id_election)
//         ->where('tour', $election->tour)
//         ->exists();

//     if ($dejaVote) {
//         return back()->with('error', 'Vous avez déjà voté pour ce tour.');
//     }

//     // Enregistrer vote
//     Vote::create([
//         'id_user' => $user->id,
//         'id_election' => $election->id_election,
//         'id_candidature' => $candidature->id_candidature,
//         'tour' => $election->tour,
//         'date_vote' => now(),
//     ]);

//     return redirect()->route('votes.index')
//         ->with('success', 'Vote enregistré.');
// }

//     public function show(string $id)
//     {
//         $vote = Vote::with(['user','election','candidature'])
//             ->findOrFail($id);

//         return view('pages.votes.show_vote', compact('vote'));
//     }

//     public function destroy(string $id)
//     {
//         $vote = Vote::findOrFail($id);
//         $vote->delete();

//         return redirect()->route('votes.index')
//             ->with('success', 'Vote supprimé.');
//     }
// }
namespace App\Http\Controllers;

use App\Models\Vote;
use App\Models\Election;
use App\Models\Candidature;
use App\Models\ListeElectorale;
use Illuminate\Http\Request;
// use Illuminate\Support\Facades\Auth;

class VoteController extends Controller
{
    public function electionsOuvertes()
    {
        // 🔐 AUTH DÉSACTIVÉ POUR TEST
        // $etudiant = Auth::user()->etudiant;

        $etudiantId = 1; // 👈 simulateur étudiant

        $elections = Election::whereIn('statut', ['ouverte', 'second_tour'])
            ->whereHas('listesElectorales', function ($q) use ($etudiantId) {
                $q->where('id_etudiant', $etudiantId);
            })
            ->get();

        return view('pages.elections.list_election_ouverte', compact('elections'));
    }

    public function candidats(Election $election)
    {
        // $etudiant = Auth::user()->etudiant;
        $etudiantId = 1;

        $autorise = ListeElectorale::where('id_election', $election->id_election)
            ->where('id_etudiant', $etudiantId)
            ->exists();

        if (!$autorise) {
            return back()->with('error', 'Non autorisé (test mode).');
        }

        $candidatures = Candidature::with('user')
            ->where('id_election', $election->id_election)
            ->get();

        return view('pages.elections.list_candidat', compact('election', 'candidatures'));
    }

    public function showCandidat(Candidature $candidature)
    {
        $etudiantId = 1;

        $autorise = ListeElectorale::where('id_election', $candidature->id_election)
            ->where('id_etudiant', $etudiantId)
            ->exists();

        if (!$autorise) {
            return back()->with('error', 'Non autorisé (test mode).');
        }

        return view('pages.elections.candidat_show', compact('candidature'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'id_election' => 'required|exists:elections,id_election',
            'id_candidature' => 'required|exists:candidatures,id_candidature',
        ]);

        // $user = Auth::user();
        // $etudiant = $user->etudiant;

        $userId = 1;       // 👈 simulateur user
        $etudiantId = 1;   // 👈 simulateur étudiant

        $election = Election::findOrFail($request->id_election);

        if (!in_array($election->statut, ['ouverte', 'second_tour'])) {
            return back()->with('error', 'Vote fermé.');
        }

        $autorise = ListeElectorale::where('id_election', $election->id_election)
            ->where('id_etudiant', $etudiantId)
            ->exists();

        if (!$autorise) {
            return back()->with('error', 'Pas dans la liste électorale.');
        }

        $dejaVote = Vote::where('id_user', $userId)
            ->where('id_election', $election->id_election)
            ->where('tour', $election->tour)
            ->exists();

        if ($dejaVote) {
            return back()->with('error', 'Déjà voté.');
        }

        $candidature = Candidature::where('id_candidature', $request->id_candidature)
            ->where('id_election', $election->id_election)
            ->first();

        if (!$candidature) {
            return back()->with('error', 'Candidature invalide.');
        }

        Vote::create([
            'id_user' => $userId,
            'id_election' => $election->id_election,
            'id_candidature' => $candidature->id_candidature,
            'tour' => $election->tour,
            'date_vote' => now(),
        ]);

        return redirect()->route('votes.elections')
            ->with('success', 'Vote enregistré (mode test).');
    }
}