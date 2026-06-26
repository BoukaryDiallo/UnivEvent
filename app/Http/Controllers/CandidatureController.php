<?php

namespace App\Http\Controllers;

use App\Models\Candidature;
use App\Models\Election;
use App\Models\Etudiant;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CandidatureController extends Controller
{
    // Liste des candidatures
    public function index()
    {
        $candidatures = Candidature::with(['user', 'election'])->orderBy('created_at', 'desc')->get();

        return Inertia::render('candidatures/CandidatureList', compact('candidatures'));
    }

    // Formulaire de création
    public function create()
    {
        $etudiants = Etudiant::with('user', 'ufr', 'filiere', 'departement')
            ->where('statut', 'actif')
            ->join('users', 'users.id', '=', 'etudiants.id_user')
            ->orderBy('users.name')
            ->select('etudiants.*')
            ->get();
        $elections = Election::where('statut', 'planifiee')
            ->orWhere('statut', 'liste_generee')
            ->orderBy('date_debut')
            ->get();

        return Inertia::render('candidatures/CandidatureCreate', compact('etudiants', 'elections'));
    }

    // Formulaire de création pour une élection spécifique
    public function createForElection(Election $election)
    {
        // Debug: Log des informations
        \Log::info('createForElection appelé', ['election_id' => $election->id_election]);

        // Récupérer l'étudiant connecté
        $user = auth()->user();
        \Log::info('User authentifié', ['user_id' => $user?->id, 'user_email' => $user?->email]);

        if (! $user) {
            \Log::error('Utilisateur non authentifié');

            return back()->with('error', 'Vous devez être connecté pour déposer une candidature.');
        }

        $etudiant = Etudiant::where('id_user', $user->id)
            ->whereIn('statut', ['actif', 'inscrit'])
            ->with('user', 'ufr', 'filiere', 'departement')
            ->first();

        \Log::info('Étudiant trouvé', ['etudiant_id' => $etudiant?->id, 'statut' => $etudiant?->statut]);

        if (! $etudiant) {
            \Log::error('Étudiant non trouvé ou non actif', ['user_id' => $user->id]);

            return back()->with('error', 'Vous n\'êtes pas un étudiant actif ou votre profil n\'est pas complet.');
        }

        // Vérifier que l'étudiant n'a pas déjà candidaté pour cette élection
        $existingCandidature = Candidature::where('id_user', $user->id)
            ->where('id_election', $election->id_election)
            ->first();

        \Log::info('Vérification candidature existante', ['existing' => $existingCandidature?->id_candidature]);

        if ($existingCandidature) {
            \Log::error('Candidature déjà existante', ['candidature_id' => $existingCandidature->id_candidature]);

            return back()->with('error', 'Vous avez déjà soumis une candidature pour cette élection.');
        }

        \Log::info('Redirection vers CandidatureCreate', ['etudiant_id' => $etudiant->id, 'election_id' => $election->id_election]);

        return Inertia::render('candidatures/CandidatureCreate', [
            'etudiant' => $etudiant,
            'election' => $election,
            'fromElection' => true,
        ]);
    }

    // Enregistrer une candidature
    public function store(Request $request)
    {
        // Récupérer l'élection pour déterminer le type
        $election = Election::find($request->id_election);
        $isUfrElection = $election && $election->type === 'ufr';

        $rules = [
            'id_etudiant' => 'required_without:fromElection|exists:etudiants,id',
            'id_election' => 'required_without:fromElection|exists:elections,id_election',
            'programme' => 'nullable|string',
            'photo' => 'nullable|image|max:4096',
        ];

        // Ajouter les règles PDF uniquement pour les élections UFR
        if ($isUfrElection) {
            $rules['cnib_pdf'] = 'required|mimes:pdf|max:5120';
            $rules['casier_judiciaire_pdf'] = 'required|mimes:pdf|max:5120';
            $rules['attestation_inscription_pdf'] = 'required|mimes:pdf|max:5120';
        }

        $request->validate($rules);

        // Vérifier que l'étudiant n'a pas déjà candidaté pour cette élection
        $etudiant = Etudiant::find($request->id_etudiant);
        $existingCandidature = Candidature::where('id_user', $etudiant->id_user)
            ->where('id_election', $request->id_election)
            ->first();

        if ($existingCandidature) {
            return back()->with('error', 'Vous avez déjà soumis une candidature pour cette élection.');
        }

        // Récupérer les données selon le contexte
        if ($request->fromElection) {
            // Depuis une élection spécifique
            $user = auth()->user();
            $etudiant = Etudiant::where('id_user', $user->id)->first();
            $election = Election::find($request->id_election);

            if (! $etudiant || ! $election) {
                return back()->with('error', 'Informations invalides.');
            }

            $data = $request->all();
            $data['id_etudiant'] = $etudiant->id;
            $data['id_election'] = $election->id_election;
            $data['id_user'] = $user->id;
        } else {
            // Formulaire classique admin
            $etudiant = Etudiant::find($request->id_etudiant);
            $data = $request->all();
            $data['id_user'] = $etudiant->id_user;
        }

        if ($request->hasFile('photo')) {
            $data['photo'] = $request->file('photo')->store('photos', 'public');
        }

        // Stocker les PDF uniquement pour les élections UFR
        if ($isUfrElection) {
            if ($request->hasFile('cnib_pdf')) {
                $data['cnib_pdf'] = $request->file('cnib_pdf')->store('candidatures', 'public');
            }
            if ($request->hasFile('casier_judiciaire_pdf')) {
                $data['casier_judiciaire_pdf'] = $request->file('casier_judiciaire_pdf')->store('candidatures', 'public');
            }
            if ($request->hasFile('attestation_inscription_pdf')) {
                $data['attestation_inscription_pdf'] = $request->file('attestation_inscription_pdf')->store('candidatures', 'public');
            }
        }

        Candidature::create($data);

        return redirect()->route('espace.elections');
    }

    // Afficher une candidature
    public function show(string $id)
    {
        $candidature = Candidature::with(['user', 'election'])->findOrFail($id);

        return Inertia::render('candidatures/CandidatureShow', compact('candidature'));
    }

    // Formulaire de modification
    public function edit(string $id)
    {
        $candidature = Candidature::findOrFail($id);
        $etudiants = Etudiant::with('user', 'ufr', 'filiere', 'departement')
            ->where('statut', 'actif')
            ->join('users', 'users.id', '=', 'etudiants.id_user')
            ->orderBy('users.name')
            ->select('etudiants.*')
            ->get();
        $elections = Election::all();

        return Inertia::render('candidatures/CandidatureEdit', compact('candidature', 'etudiants', 'elections'));
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
