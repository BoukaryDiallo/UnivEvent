<?php

namespace App\Http\Controllers;

use App\Models\Election;
use App\Models\Circonscription;
use Illuminate\Http\Request;

class ElectionController extends Controller
{
    /**
     * Afficher la liste des élections
     */
    public function index()
    {
        $elections = Election::with('circonscription')->get();
        return view('pages.admin.elections.list_election', compact('elections'));
    }

    /**
     * Formulaire de création
     */
    public function create()
    {
        $circonscriptions = Circonscription::all();
        return view('pages.admin.elections.create_election', compact('circonscriptions'));
    }

    /**
     * Enregistrer une nouvelle élection
     */
    public function store(Request $request)
    {
        $request->validate([
            'titre' => 'required|string|max:255',
            'description' => 'nullable|string',
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after:date_debut',
            'id_circonscription' => 'required|exists:circonscriptions,id_circonscription',
        ]);

        Election::create($request->all());

        return redirect()->route('elections.index')->with('success', 'Élection créée avec succès.');
    }

    /**
     * Afficher une élection spécifique
     */
    public function show(string $id)
    {
        $election = Election::with('circonscription')->findOrFail($id);
        return view('pages.admin.elections.show_election', compact('election'));
    }

    /**
     * Formulaire de modification
     */
    public function edit(string $id)
    {
        $election = Election::findOrFail($id);
        $circonscriptions = Circonscription::all();
        return view('pages.admin.elections.edit_election', compact('election','circonscriptions'));
    }

    /**
     * Mettre à jour une élection
     */
    public function update(Request $request, string $id)
    {
        $election = Election::findOrFail($id);

        $request->validate([
            'titre' => 'required|string|max:255',
            'description' => 'nullable|string',
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after:date_debut',
            'id_circonscription' => 'required|exists:circonscriptions,id_circonscription',
            'statut' => 'required|in:ouverte,fermee',
        ]);

        $election->update($request->all());

        return redirect()->route('elections.index')->with('success', 'Élection mise à jour avec succès.');
    }

    /**
     * Annuler une élection (soft delete ou statut fermé)
     */
    public function destroy(string $id)
    {
        $election = Election::findOrFail($id);
        $election->delete();

        return redirect()->route('elections.index')->with('success', 'Élection annulée.');
    }
}
