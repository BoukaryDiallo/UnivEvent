<?php

namespace App\Http\Controllers;

use App\Models\Departement;
use App\Models\Ufr;
use Illuminate\Http\Request;

class DepartementController extends Controller
{
    /**
     * LISTE DES DÉPARTEMENTS
     */
    public function index()
    {
        $departements = Departement::with('ufr')
            ->orderBy('nom')
            ->get();

        return view('departements.index', compact('departements'));
    }

    /**
     * FORMULAIRE CRÉATION
     */
    public function create()
    {
        $ufrs = Ufr::all();

        return view('departements.create', compact('ufrs'));
    }

    /**
     * ENREGISTRER
     */
    public function store(Request $request)
    {
        $request->validate([
            'nom' => 'required|string|max:255',
            'id_ufr' => 'required|exists:ufrs,id_ufr',
        ]);

        Departement::create([
            'nom' => $request->nom,
            'id_ufr' => $request->id_ufr,
        ]);

        return redirect()->route('departements.index')
            ->with('success', 'Département créé avec succès.');
    }

    /**
     * AFFICHER UN DÉPARTEMENT
     */
    public function show(string $id)
    {
        $departement = Departement::with(['ufr', 'filieres'])
            ->findOrFail($id);

        return view('departements.show', compact('departement'));
    }

    /**
     * FORMULAIRE MODIFICATION
     */
    public function edit(string $id)
    {
        $departement = Departement::findOrFail($id);
        $ufrs = Ufr::all();

        return view('departements.edit', compact('departement', 'ufrs'));
    }

    /**
     * METTRE À JOUR
     */
    public function update(Request $request, string $id)
    {
        $departement = Departement::findOrFail($id);

        $request->validate([
            'nom' => 'required|string|max:255',
            'id_ufr' => 'required|exists:ufrs,id_ufr',
        ]);

        $departement->update([
            'nom' => $request->nom,
            'id_ufr' => $request->id_ufr,
        ]);

        return redirect()->route('departements.index')
            ->with('success', 'Département mis à jour.');
    }

    /**
     * SUPPRIMER
     */
    public function destroy(string $id)
    {
        $departement = Departement::findOrFail($id);

        $departement->delete();

        return redirect()->route('departements.index')
            ->with('success', 'Département supprimé.');
    }
}