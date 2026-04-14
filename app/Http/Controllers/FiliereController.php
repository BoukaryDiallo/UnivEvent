<?php

namespace App\Http\Controllers;

use App\Models\Filiere;
use App\Models\Departement;
use Illuminate\Http\Request;

class FiliereController extends Controller
{
    /**
     * LISTE DES FILIÈRES
     */
    public function index()
    {
        $filieres = Filiere::with('departement')
            ->orderBy('nom')
            ->get();

        return view('filieres.index', compact('filieres'));
    }

    /**
     * FORMULAIRE CRÉATION
     */
    public function create()
    {
        $departements = Departement::all();

        return view('filieres.create', compact('departements'));
    }

    /**
     * ENREGISTRER
     */
    public function store(Request $request)
    {
        $request->validate([
            'nom' => 'required|string|max:255',
            'id_departement' => 'required|exists:departements,id_departement',
        ]);

        Filiere::create([
            'nom' => $request->nom,
            'id_departement' => $request->id_departement,
        ]);

        return redirect()->route('filieres.index')
            ->with('success', 'Filière créée avec succès.');
    }

    /**
     * AFFICHER UNE FILIÈRE
     */
    public function show(string $id)
    {
        $filiere = Filiere::with('departement')
            ->findOrFail($id);

        return view('filieres.show', compact('filiere'));
    }

    /**
     * FORMULAIRE MODIFICATION
     */
    public function edit(string $id)
    {
        $filiere = Filiere::findOrFail($id);
        $departements = Departement::all();

        return view('filieres.edit', compact('filiere', 'departements'));
    }

    /**
     * METTRE À JOUR
     */
    public function update(Request $request, string $id)
    {
        $filiere = Filiere::findOrFail($id);

        $request->validate([
            'nom' => 'required|string|max:255',
            'id_departement' => 'required|exists:departements,id_departement',
        ]);

        $filiere->update([
            'nom' => $request->nom,
            'id_departement' => $request->id_departement,
        ]);

        return redirect()->route('filieres.index')
            ->with('success', 'Filière mise à jour.');
    }

    /**
     * SUPPRIMER
     */
    public function destroy(string $id)
    {
        $filiere = Filiere::findOrFail($id);

        $filiere->delete();

        return redirect()->route('filieres.index')
            ->with('success', 'Filière supprimée.');
    }
}