<?php

namespace App\Http\Controllers;

use App\Models\Candidature;
use App\Models\Departement;
use App\Models\Election;
use App\Models\Etudiant;
use App\Models\Filiere;
use App\Models\Resultat;
use App\Models\Ufr;
use App\Models\Vote;
use App\Services\ListeElectoraleService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
        if ($request->type === 'ufr' && ! $request->id_ufr) {
            return back()->withErrors([
                'id_ufr' => "L'UFR est requis pour une élection UFR.",
            ]);
        }

        if ($request->type === 'promotion' && ! $request->id_filiere) {
            return back()->withErrors([
                'id_filiere' => 'La filière est requise pour une élection de promotion.',
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

        return redirect()->route('elections.genererListe.form', $election)
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

            $validated = $request->validate([
                'id_ufr' => 'nullable|exists:ufrs,id_ufr',
                'id_departement' => 'nullable|exists:departements,id_departement',
                'niveau' => [
                    'nullable',
                    'in:Licence1,Licence2,Licence3,Master1,Master2,Doctorat1,Doctorat2,Doctorat3',
                ],
            ]);

            // Validation : UFR et département sont mutuellement exclusifs
            if ($validated['id_ufr'] && $validated['id_departement']) {
                return redirect()
                    ->back()
                    ->withInput()
                    ->with('error', 'Vous ne pouvez pas sélectionner à la fois une UFR et un département.');
            }

            $filters = [
                'id_ufr' => $validated['id_ufr'] ?? null,
                'id_departement' => $validated['id_departement'] ?? null,
                'niveau' => $validated['niveau'] ?? null,
            ];

            $nb = (new ListeElectoraleService)->generer($election, $filters);

            $election->update([
                'statut' => 'liste_generee',
            ]);

            return redirect()
                ->route('elections.admin', $election)
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
        // Vérifier qu'il y a des candidatures validées avant d'ouvrir l'élection
        $candidaturesValidees = $election->candidatures()
            ->where('statut', 'validee')
            ->count();

        if ($candidaturesValidees === 0) {
            return back()->with('error', 'Impossible d\'ouvrir l\'élection : aucune candidature validée n\'est associée à cette élection.');
        }

        $election->update([
            'statut' => 'planifiee',
            'tour' => 1,
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
            'listesElectorales',
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
            // Le statut n'est pas mis à jour pour préserver l'état actuel
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

        return back()->with('success', 'Élection clôturée avec succès.');
    }

    /**
     * CLÔTURER LES CANDIDATURES
     */
    public function cloturerCandidatures(Request $request, Election $election)
    {
        // Vérifier que l'élection est bien en statut 'liste_generee'
        if ($election->statut !== 'liste_generee') {
            return back()->with('error', 'Impossible de clôturer les candidatures : l\'élection n\'est pas en phase de candidatures.');
        }

        // Mettre à jour le statut à 'planifiée'
        $election->update(['statut' => 'planifiee']);

        return back()->with('success', 'Les candidatures ont été clôturées. L\'élection est maintenant planifiée.');
    }

    /**
     * FORMULAIRE DE CONFIGURATION DU SECOND TOUR
     */
    public function secondTourForm(Election $election)
    {
        // Vérifier que l'élection est bien en statut 'cloturee' ou 'second_tour_planifie'
        if (! in_array($election->statut, ['cloturee', 'second_tour_planifie'])) {
            return back()->with('error', 'Le second tour ne peut être configuré que pour une élection clôturée nécessitant un second tour.');
        }

        // Récupérer les candidats qualifiés pour le second tour
        $candidatsQualifies = Candidature::where('id_election', $election->id_election)
            ->where('resultat', 'second_tour')
            ->with('user')
            ->get();

        // Si aucun candidat n'est qualifié, calculer automatiquement les 2 premiers
        if ($candidatsQualifies->count() === 0) {
            // Récupérer les résultats du premier tour
            $votes = Vote::where('id_election', $election->id_election)
                ->where('tour', 1)
                ->select('id_candidature', DB::raw('COUNT(*) as nb_voix'))
                ->groupBy('id_candidature')
                ->orderByDesc('nb_voix')
                ->take(2)
                ->get();

            if ($votes->count() < 2) {
                return back()->with('error', 'Il faut au moins 2 candidats avec des votes pour organiser un second tour.');
            }

            // Qualifier les 2 premiers candidats
            $top2Ids = $votes->pluck('id_candidature');
            Candidature::where('id_election', $election->id_election)
                ->whereIn('id_candidature', $top2Ids)
                ->update(['resultat' => 'second_tour']);

            Candidature::where('id_election', $election->id_election)
                ->whereNotIn('id_candidature', $top2Ids)
                ->update(['resultat' => 'eliminee']);

            // Récupérer les candidats qualifiés
            $candidatsQualifies = Candidature::where('id_election', $election->id_election)
                ->where('resultat', 'second_tour')
                ->with('user')
                ->get();
        }

        if ($candidatsQualifies->count() < 2) {
            return back()->with('error', 'Il faut au moins 2 candidats qualifiés pour organiser un second tour.');
        }

        // Utiliser le composant de création d'élection avec mode second tour
        return Inertia::render('elections/ElectionCreate', [
            'election' => $election,
            'mode' => 'second_tour',
            'candidatsQualifies' => $candidatsQualifies,
            'ufrs' => [],
            'filieres' => [],
        ]);
    }

    /**
     * ENREGISTRER LA CONFIGURATION DU SECOND TOUR
     */
    public function secondTourStore(Request $request, Election $election)
    {
        $request->validate([
            'date_debut' => 'required|date|after:now',
            'date_fin' => 'required|date|after:date_debut',
        ]);

        // Vérifier que l'élection est bien en statut 'cloturee' ou 'second_tour_planifie'
        if (! in_array($election->statut, ['cloturee', 'second_tour_planifie'])) {
            return back()->with('error', 'Le second tour ne peut être configuré que pour une élection clôturée nécessitant un second tour.');
        }

        // Mettre à jour l'élection pour le second tour
        $election->update([
            'date_debut' => $request->date_debut,
            'date_fin' => $request->date_fin,
            'statut' => 'second_tour', // Le statut passera à 'second_tour' quand la date de début arrivera
            'tour' => 2, // ⚠️ CRUCIAL : passer au tour 2 pour permettre les votes du second tour
        ]);

        return redirect()->route('elections.admin', $election)
            ->with('success', 'Le second tour a été configuré avec succès.');
    }

    /**
     * PAGE ADMINISTRATION DE L'ÉLECTION
     */
    public function admin(Election $election)
    {
        $election->fresh()->synchronizeStatus();
        $election->load(['ufr', 'filiere', 'candidatures.user', 'listesElectorales.etudiant']);

        // Statistiques
        $totalVotes = Vote::where('id_election', $election->id_election)->count();
        $totalVoters = $election->listesElectorales()->count();
        $totalCandidatures = $election->candidatures()->count();

        // Candidatures validées (ou qualifiées pour second tour)
        if ($election->statut === 'second_tour' && $election->tour == 2) {
            // Au second tour, afficher uniquement les candidats qualifiés
            $candidaturesValidees = $election->candidatures()
                ->where('resultat', 'second_tour')
                ->with('user')
                ->get();
        } else {
            // Premier tour ou autres statuts, afficher les candidatures validées
            $candidaturesValidees = $election->candidatures()
                ->where('statut', 'validee')
                ->with('user')
                ->get();
        }

        // Récupérer les résultats de dépouillement (brouillons)
        $resultatsDepouillement = Resultat::where('id_election', $election->id_election)
            ->where('tour', $election->tour)
            ->where('statut_publication', 'brouillon')
            ->with(['candidature.user'])
            ->orderBy('rang')
            ->get();

        return Inertia::render('elections/ElectionAdmin', [
            'election' => $election,
            'totalVotes' => $totalVotes,
            'totalVoters' => $totalVoters,
            'totalCandidatures' => $totalCandidatures,
            'candidaturesValidees' => $candidaturesValidees,
            'resultatsDepouillement' => $resultatsDepouillement,
        ]);
    }

    /**
     * API - STATISTIQUES EN TEMPS RÉEL
     */
    public function stats(Election $election)
    {
        $election->fresh()->synchronizeStatus();
        $totalVotes = Vote::where('id_election', $election->id_election)->count();
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
