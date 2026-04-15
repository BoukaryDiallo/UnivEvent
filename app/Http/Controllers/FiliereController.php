<?php

namespace App\Http\Controllers;

use App\Models\Filiere;
use App\Models\Departement;
use App\Models\Ufr;
use Illuminate\Http\Request;

class FiliereController extends Controller
{
    /**
     * LISTE DES FILIÈRES
     */
    public function index()
    {
        $filieres = Filiere::with(['departement.ufr'])
            ->withCount('etudiants')
            ->orderBy('nom')
            ->paginate(10);

        return view('pages.filiere.list_filiere', compact('filieres'));
    }

    /**
     * FORMULAIRE CRÉATION
     */
    public function create()
    {
        $ufrs = Ufr::where('actif', true)->orderBy('nom')->get();
        $departements = collect();
        
        return view('pages.filiere.create_filiere', compact('ufrs', 'departements'));
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

        return redirect()->route('filiere.index')
            ->with('success', 'Filière créée avec succès.');
    }

    /**
     * AFFICHER UNE FILIÈRE
     */
    public function show(string $id)
    {
        $filiere = Filiere::with('departement.ufr')
            ->findOrFail($id);

        return view('pages.filiere.show_filiere', compact('filiere'));
    }

    /**
     * FORMULAIRE MODIFICATION
     */
    public function edit(string $id)
    {
        $filiere = Filiere::findOrFail($id);
        $departements = Departement::orderBy('nom')->get();

        return view('pages.filiere.edit_filiere', compact('filiere', 'departements'));
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

        return redirect()->route('filiere.index')
            ->with('success', 'Filière mise à jour.');
    }

    /**
     * SUPPRIMER
     */
    public function destroy(string $id)
    {
        $filiere = Filiere::findOrFail($id);

        $filiere->delete();

        return redirect()->route('filiere.index')
            ->with('success', 'Filière supprimée.');
    }
}