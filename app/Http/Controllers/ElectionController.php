<?php

namespace App\Http\Controllers;

use App\Models\Election;
use App\Models\Ufr;
use App\Models\Departement;
use App\Models\Etudiant;
use App\Models\Filiere;
use \App\Models\Vote;
use Illuminate\Http\Request;
use App\Services\ListeElectoraleService;
use Inertia\Inertia;

class ElectionController extends Controller
{
    /**
     * LISTE DES ÉLECTIONS
     */
    public function index()
    {
        $elections = Election::with(['ufr', 'filiere'])
            ->latest()
            ->get();

        return Inertia::render('elections/ElectionList', compact('elections'));
    }

    /**
     * FORMULAIRE CRÉATION
     */
    public function create()
    {
        return Inertia::render('elections/ElectionCreate', [
            'ufrs' => Ufr::all(),
            'filieres' => Filiere::all(),
        ]);
    }
    public function formGenererListe(Election $election)
    {
        $ufrs = Ufr::query()
            ->orderBy('nom')
            ->get();

        $filieres = Filiere::query()
            ->orderBy('nom')
            ->get();

        $departements = Departement::query()
            ->orderBy('nom')
            ->get();

        $niveaux = Etudiant::getNiveaux();

        return Inertia::render('elections/GenererListeElectorale', compact(
            'election',
            'ufrs',
            'filieres',
            'departements',
            'niveaux'
        ));
    }

    /**
     * VALIDATION MÉTIER UFR / PROMOTION
     */
    private function validateType(Request $request)
    {
        if ($request->type === 'ufr' && !$request->id_ufr) {
            return back()->withErrors([
                'id_ufr' => "L'UFR est requis pour une élection UFR."
            ]);
        }

        if ($request->type === 'promotion' && !$request->id_filiere) {
            return back()->withErrors([
                'id_filiere' => "La filière est requise pour une élection de promotion."
            ]);
        }

        return null;
    }

    /**
     * CRÉER UNE ÉLECTION
     * + REDIRECTION VERS PREPARE
     */
    public function store(Request $request)
    {
        $request->validate([
            'titre' => 'required|string|max:255',
            'description' => 'nullable|string',
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after:date_debut',
            'type' => 'required|in:ufr,promotion',
            'id_ufr' => 'nullable|exists:ufrs,id_ufr',
            'id_filiere' => 'nullable|exists:filieres,id_filiere',
        ]);

        if ($error = $this->validateType($request)) {
            return $error;
        }

        $election = Election::create([
            'titre' => $request->titre,
            'description' => $request->description,
            'date_debut' => $request->date_debut,
            'date_fin' => $request->date_fin,
            'type' => $request->type,
            'id_ufr' => $request->type === 'ufr' ? $request->id_ufr : null,
            'id_filiere' => $request->type === 'promotion' ? $request->id_filiere : null,
            'statut' => 'brouillon',
            'tour' => 1,
        ]);

        return redirect()->route('elections.prepare', $election)
            ->with('success', 'Élection créée. Passez à la préparation.');
    }

    /**
     * CENTRE DE PILOTAGE (MODEL BINDING)
     */
    public function prepare(Election $election)
    {
        return Inertia::render('elections/PrepareElection', compact('election'));
    }

    /**
     * GÉNÉRER LISTE ÉLECTORALE
     */
    public function genererListe(Request $request, Election $election)
    {
        try {

            $filters = [];

            if ($election->type === 'promotion') {

                $validated = $request->validate([
                    'niveau' => [
                        'required',
                        'in:Licence1,Licence2,Licence3,Master1,Master2,Doctorat1,Doctorat2,Doctorat3'
                    ]
                ]);

                $filters['niveau'] = $validated['niveau'];
            }

            $nb = (new ListeElectoraleService())->generer($election, $filters);

            $election->update([
                'statut' => 'liste_generee'
            ]);

            return redirect()
                ->route('elections.prepare', $election)
                ->with('success', "Liste électorale générée avec succès : {$nb} électeurs ajoutés.");

        } catch (\RuntimeException $e) {

            return redirect()
                ->back()
                ->withInput()
                ->with('error', $e->getMessage());

        } catch (\Throwable $e) {

            return redirect()
                ->back()
                ->withInput()
                ->with('error', 'Une erreur inattendue est survenue lors de la génération de la liste.');
        }
    }

    /**
     * VOIR LISTE ÉLECTORALE
     */
    public function voirListeElectorale(Election $election)
    {
        $listeElectorale = $election->listesElectorales()
            ->with(['etudiant' => function ($query) {
                $query->with(['user', 'filiere.departement.ufr']);
            }])
            ->get();

        return Inertia::render('elections/ListeElectorale', compact('election', 'listeElectorale'));
    }

    /**
     * OUVRIR VOTE
     */
    public function ouvrir(Election $election)
    {
        $election->update([
            'statut' => 'planifiee',
            'tour' => 1
        ]);
        $election->fresh()->synchronizeStatus();

        return back()->with('success', 'Élection planifiée. Elle s\'ouvrira automatiquement à la date de début.');
    }

    /**
     * AFFICHER UNE ÉLECTION
     */
    public function show(Election $election)
    {
        $election->load([
            'ufr',
            'filiere',
            'candidatures.user',
            'listesElectorales'
        ]);

        return Inertia::render('elections/ElectionShow', compact('election'));
    }

    /**
     * FORMULAIRE MODIFICATION
     */
    public function edit(Election $election)
    {
        return Inertia::render('elections/ElectionEdit', [
            'election' => $election,
            'ufrs' => Ufr::all(),
            'filieres' => Filiere::all(),
        ]);
    }

    /**
     * METTRE À JOUR
     */
    public function update(Request $request, Election $election)
    {
        $request->validate([
            'titre' => 'required|string|max:255',
            'description' => 'nullable|string',
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after:date_debut',
            'type' => 'required|in:ufr,promotion',
            'id_ufr' => 'nullable|exists:ufrs,id_ufr',
            'id_filiere' => 'nullable|exists:filieres,id_filiere',
            'statut' => 'required|in:brouillon,liste_generee,ouverte,second_tour,terminee',
        ]);

        if ($error = $this->validateType($request)) {
            return $error;
        }

        $election->update([
            'titre' => $request->titre,
            'description' => $request->description,
            'date_debut' => $request->date_debut,
            'date_fin' => $request->date_fin,
            'type' => $request->type,
            'id_ufr' => $request->type === 'ufr' ? $request->id_ufr : null,
            'id_filiere' => $request->type === 'promotion' ? $request->id_filiere : null,
            'statut' => $request->statut,
        ]);

        return redirect()->route('elections.index');
    }

    /**
     * SUPPRIMER
     */
    public function destroy(Election $election)
    {
        $election->delete();

        return redirect()->route('elections.index');
    }

    /**
     * CLÔTURER
     */
    public function cloturer(Request $request, Election $election)
    {
        $election->fresh()->synchronizeStatus();
        $election->update(['statut' => 'cloturee']);

        return back()->with('success', 'Élection clôturée.');
    }

    /**
     * PAGE ADMINISTRATION DE L'ÉLECTION
     */
    public function admin(Election $election)
    {
        $election->fresh()->synchronizeStatus();
        $election->load(['ufr', 'filiere', 'candidatures.user', 'listesElectorales.etudiant']);
        
        // Statistiques
        $totalVotes =Vote::where('id_election', $election->id_election)->count();
        $totalVoters = $election->listesElectorales()->count();
        $totalCandidatures = $election->candidatures()->count();
        
        // Candidatures validées
        $candidaturesValidees = $election->candidatures()
            ->where('statut', 'validee')
            ->with('user')
            ->get();

        return Inertia::render('elections/ElectionAdmin', [
            'election' => $election,
            'totalVotes' => $totalVotes,
            'totalVoters' => $totalVoters,
            'totalCandidatures' => $totalCandidatures,
            'candidaturesValidees' => $candidaturesValidees,
        ]);
    }

    /**
     * API - STATISTIQUES EN TEMPS RÉEL
     */
    public function stats(Election $election)
    {
        $election->fresh()->synchronizeStatus();
        $totalVotes =Vote::where('id_election', $election->id_election)->count();
        $totalVoters = $election->listesElectorales()->count();
        $totalCandidatures = $election->candidatures()->count();
        $candidaturesValidees = $election->candidatures()
            ->where('statut', 'validee')
            ->count();

        return response()->json([
            'totalVotes' => $totalVotes,
            'totalVoters' => $totalVoters,
            'totalCandidatures' => $totalCandidatures,
            'candidaturesValidees' => $candidaturesValidees,
            'participationRate' => $totalVoters > 0 ? round(($totalVotes / $totalVoters) * 100) : 0,
            'timestamp' => now(),
        ]);
    }

    /**
     * API - CANDIDATURES VALIDÉES EN TEMPS RÉEL
     */
    public function candidatures(Election $election)
    {
        $election->fresh()->synchronizeStatus();
        $candidaturesValidees = $election->candidatures()
            ->where('statut', 'validee')
            ->with('user')
            ->get()
            ->map(function ($candidature) {
                return [
                    'id_candidature' => $candidature->id_candidature,
                    'programme' => $candidature->programme,
                    'statut' => $candidature->statut,
                    'user' => [
                        'name' => $candidature->user->name,
                        'email' => $candidature->user->email,
                    ],
                ];
            });

        return response()->json([
            'data' => $candidaturesValidees,
            'count' => $candidaturesValidees->count(),
            'timestamp' => now(),
        ]);
    }
}