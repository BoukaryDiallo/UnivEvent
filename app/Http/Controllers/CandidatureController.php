<?php

namespace App\Http\Controllers;

use App\Models\Candidature;
use App\Models\User;
use App\Models\Election;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CandidatureController extends Controller
{
    // Liste des candidatures
    public function index()
    {
        $candidatures = Candidature::with(['user','election'])->orderBy('created_at', 'desc')->get();
        return Inertia::render('candidatures/CandidatureList', compact('candidatures'));
    }

    // Formulaire de création
    public function create()
    {
        $users = User::all();
        $elections = Election::all();
        return Inertia::render('candidatures/CandidatureCreate', compact('users','elections'));
    }

    // Enregistrer une candidature
    public function store(Request $request)
    {
        $request->validate([
            'id_user' => 'required|exists:users,id',
            'id_election' => 'required|exists:elections,id_election',
            'programme' => 'nullable|string',
            'photo' => 'nullable|image|max:4096',
            'cnib_pdf' => 'required|mimes:pdf|max:5120',
            'casier_judiciaire_pdf' => 'required|mimes:pdf|max:5120',
            'attestation_inscription_pdf' => 'required|mimes:pdf|max:5120',
        ]);

        // Vérifier que l'étudiant n'a pas déjà candidaté pour cette élection
        $existingCandidature = Candidature::where('id_user', $request->id_user)
            ->where('id_election', $request->id_election)
            ->first();

        if ($existingCandidature) {
            return back()->with('error', 'Vous avez déjà soumis une candidature pour cette élection.');
        }

        $data = $request->all();

        if ($request->hasFile('photo')) {
            $data['photo'] = $request->file('photo')->store('photos', 'public');
        }
        $data['cnib_pdf'] = $request->file('cnib_pdf')->store('candidatures', 'public');
        $data['casier_judiciaire_pdf'] = $request->file('casier_judiciaire_pdf')->store('candidatures', 'public');
        $data['attestation_inscription_pdf'] = $request->file('attestation_inscription_pdf')->store('candidatures', 'public');

        Candidature::create($data);

        return redirect()->route('elections.workflow');
    }

    // Afficher une candidature
    public function show(string $id)
    {
        $candidature = Candidature::with(['user','election'])->findOrFail($id);
        return Inertia::render('candidatures/CandidatureShow', compact('candidature'));
    }

    // Formulaire de modification
    public function edit(string $id)
    {
        $candidature = Candidature::findOrFail($id);
        $users = User::all();
        $elections = Election::all();
        return Inertia::render('candidatures/CandidatureEdit', compact('candidature','users','elections'));
    }

    // Mettre à jour une candidature
    public function update(Request $request, string $id)
    {
        $candidature = Candidature::findOrFail($id);

        $request->validate([
            'programme' => 'nullable|string',
            'photo' => 'nullable|image|max:4096',
            'statut' => 'required|in:en_attente,validee,rejetee',
        ]);

        $data = $request->all();

        if ($request->hasFile('photo')) {
            $data['photo'] = $request->file('photo')->store('photos', 'public');
        }

        $candidature->update($data);

        return redirect()->route('candidatures.index');
    }

    // Valider une candidature
    public function valider(string $id)
    {
        $candidature = Candidature::findOrFail($id);
        $candidature->update(['statut' => 'validee']);

        return redirect()->route('candidatures.index')
            ->with('success', 'Candidature validée avec succès.');
    }

    // Refuser une candidature
    public function refuser(string $id)
    {
        $candidature = Candidature::findOrFail($id);
        $candidature->update(['statut' => 'rejetee']);

        return redirect()->route('candidatures.index')
            ->with('success', 'Candidature refusée avec succès.');
    }

    // Supprimer (soft delete)
    public function destroy(string $id)
    {
        $candidature = Candidature::findOrFail($id);
        $candidature->delete();

        return redirect()->route('candidatures.index');
    }
}
