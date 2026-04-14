<?php

namespace App\Http\Controllers;

use App\Models\Vote;
use App\Models\Election;
use App\Models\Candidature;
use App\Models\ListeElectorale;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class VoteController extends Controller
{

    public function index()
    {
        $votes = Vote::with(['user','election','candidature'])->get();
        return view('pages.votes.list_vote', compact('votes'));
    }

    public function create($id_election)
    {
        $election = Election::with('candidatures.user')
            ->findOrFail($id_election);

        return view('pages.votes.create_vote', compact('election'));
    }

    public function store(Request $request)
{
    $request->validate([
        'id_election' => 'required|exists:elections,id_election',
        'id_candidature' => 'required|exists:candidatures,id_candidature',
    ]);

    $user = Auth::user();

    $election = Election::findOrFail($request->id_election);

    // Vérifier période
    if (now()->lt($election->date_debut) || now()->gt($election->date_fin)) {
        return back()->with('error', 'Vote hors période.');
    }

    // Vérifier étudiant
    $etudiant = $user->etudiant;
    if (!$etudiant) {
        return back()->with('error', 'Non autorisé.');
    }

    // Vérifier liste électorale
    $electeur = ListeElectorale::where('id_election', $election->id_election)
        ->where('id_etudiant', $etudiant->id)
        ->first();

    if (!$electeur) {
        return back()->with('error', 'Pas dans la liste électorale.');
    }

    // Vérifier candidature valide pour cette élection
    $candidature = Candidature::where('id_candidature', $request->id_candidature)
        ->where('id_election', $election->id_election)
        ->first();

    if (!$candidature) {
        return back()->with('error', 'Candidature invalide.');
    }

    // ❗ Empêcher double vote par tour
    $dejaVote = Vote::where('id_user', $user->id)
        ->where('id_election', $election->id_election)
        ->where('tour', $election->tour)
        ->exists();

    if ($dejaVote) {
        return back()->with('error', 'Vous avez déjà voté pour ce tour.');
    }

    // Enregistrer vote
    Vote::create([
        'id_user' => $user->id,
        'id_election' => $election->id_election,
        'id_candidature' => $candidature->id_candidature,
        'tour' => $election->tour,
        'date_vote' => now(),
    ]);

    return redirect()->route('votes.index')
        ->with('success', 'Vote enregistré.');
}

    public function show(string $id)
    {
        $vote = Vote::with(['user','election','candidature'])
            ->findOrFail($id);

        return view('pages.votes.show_vote', compact('vote'));
    }

    public function destroy(string $id)
    {
        $vote = Vote::findOrFail($id);
        $vote->delete();

        return redirect()->route('votes.index')
            ->with('success', 'Vote supprimé.');
    }
}