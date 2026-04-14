<?php

namespace App\Http\Controllers;

use App\Models\Election;
use App\Models\Ufr;
use App\Models\Filiere;
use Illuminate\Http\Request;
use App\Services\ListeElectoraleService;

class ElectionController extends Controller
{
    /**
     * LISTE DES ÉLECTIONS
     */
    public function index()
    {
        $elections = Election::with(['ufr', 'filiere'])
            ->orderByDesc('created_at')
            ->get();

        return view('pages.elections.list_election', compact('elections'));
    }

    /**
     * FORMULAIRE CRÉATION
     */
    public function create()
    {
        $ufrs = Ufr::all();
        $filieres = Filiere::all();

        return view('pages.elections.create_election', compact('ufrs', 'filieres'));
    }

    /**
     * CRÉER UNE ÉLECTION (CORRIGÉ)
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
        ], [
            'type.required' => 'Le type d\'élection est requis.',
            'id_ufr.exists' => 'L\'UFR sélectionnée est invalide.',
            'id_filiere.exists' => 'La filière sélectionnée est invalide.',
        ]);

        // Validation métier
        if ($request->type === 'ufr' && !$request->id_ufr) {
            return back()->withErrors(['id_ufr' => 'L\'UFR est requis pour une élection UFR.']);
        }
        if ($request->type === 'promotion' && !$request->id_filiere) {
            return back()->withErrors(['id_filiere' => 'La filière est requise pour une élection de promotion (niveau choisi à la génération).']);
        }

        Election::create([
            'titre' => $request->titre,
            'description' => $request->description,
            'date_debut' => $request->date_debut,
            'date_fin' => $request->date_fin,
            'type' => $request->type,
            'id_ufr' => $request->id_ufr,
            'id_filiere' => $request->id_filiere,
            'statut' => 'brouillon',
            'tour' => 1,
        ]);

        return redirect()->route('elections.index')
            ->with('success', 'Élection créée avec succès.');
    }

    /**
     * AFFICHER UNE ÉLECTION
     */
    public function show(string $id)
    {
        $election = Election::with([
            'ufr',
            'filiere',
            'candidatures.user',
            'listesElectorales'
        ])->findOrFail($id);

        return view('pages.elections.show_election', compact('election'));
    }

    /**
     * FORMULAIRE MODIFICATION
     */
    public function edit(string $id)
    {
        $election = Election::findOrFail($id);
        $ufrs = Ufr::all();
        $filieres = Filiere::all();

        return view('pages.elections.edit_election', compact(
            'election',
            'ufrs',
            'filieres'
        ));
    }

    /**
     * METTRE À JOUR (CORRIGÉ)
     */
    public function update(Request $request, string $id)
    {
        $election = Election::findOrFail($id);

        $request->validate([
            'titre' => 'required|string|max:255',
            'description' => 'nullable|string',
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after:date_debut',
            'type' => 'required|in:ufr,promotion',
            'id_ufr' => 'nullable|exists:ufrs,id_ufr',
'id_filiere' => 'nullable|exists:filieres,id_filiere',
            'statut' => 'required|in:brouillon,ouverte,second_tour,terminee',
        ]);

        // Validation métier
        if ($request->type === 'ufr' && !$request->id_ufr) {
            return back()->withErrors(['id_ufr' => 'L\'UFR est requis pour une élection UFR.']);
        }
        if ($request->type === 'promotion' && !$request->id_filiere) {
            return back()->withErrors(['id_filiere' => 'La filière est requise pour une élection de promotion (niveau choisi à la génération).']);
        }

        $election->update([
            'titre' => $request->titre,
            'description' => $request->description,
            'date_debut' => $request->date_debut,
            'date_fin' => $request->date_fin,
            'type' => $request->type,
            'id_ufr' => $request->id_ufr,
            'id_filiere' => $request->id_filiere,
            'statut' => $request->statut,
        ]);

        return redirect()->route('elections.index')
            ->with('success', 'Élection mise à jour.');
    }

    /**
     * SUPPRIMER ÉLECTION
     */
    public function destroy(string $id)
    {
        $election = Election::findOrFail($id);

        $election->delete();

        return redirect()->route('elections.index')
            ->with('success', 'Élection supprimée.');
    }

    /**
     * OUVRIR ÉLECTION (AJOUT IMPORTANT)
     */
    public function ouvrir($id)
    {
        $election = Election::findOrFail($id);

        $election->update([
            'statut' => 'ouverte'
        ]);

        return back()->with('success', 'Élection ouverte.');
    }

    /**
     * CLOTURER ÉLECTION (AJOUT IMPORTANT)
     */
    public function cloturer($id)
    {
        $election = Election::findOrFail($id);

        $election->update([
            'statut' => 'cloturee'
        ]);

        return back()->with('success', 'Élection clôturée.');
    }
    public function genererListeElectorale(Request $request, string $id)
    {
        $election = Election::findOrFail($id);

        // Validation dynamique
        if ($election->type === 'promotion') {
            $request->validate([
                'niveau' => 'required|string|max:10',
            ]);
        }

        if ($election->listesElectorales()->exists()) {
            return back()->with('error', 'Liste déjà générée.');
        }

        try {
            $service = new ListeElectoraleService();
            $filters = $request->only('niveau');

            $count = $service->generer($election, $filters);

            return back()->with('success', "Liste générée: {$count} électeurs.");
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}