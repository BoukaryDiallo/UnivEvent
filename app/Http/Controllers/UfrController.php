<?php

namespace App\Http\Controllers;

use App\Models\Ufr;
use Illuminate\Http\Request;

class UfrController extends Controller
{
    /**
     * LISTE DES UFR
     */
    public function index()
    {
        $ufrs = Ufr::orderBy('nom')->get();

        return view('ufrs.index', compact('ufrs'));
    }

    /**
     * FORMULAIRE CRÉATION
     */
    public function create()
    {
        return view('ufrs.create');
    }

    /**
     * ENREGISTRER
     */
    public function store(Request $request)
    {
        $request->validate([
            'nom' => 'required|string|max:255|unique:ufrs,nom',
        ]);

        Ufr::create([
            'nom' => $request->nom,
        ]);

        return redirect()->route('ufrs.index')
            ->with('success', 'UFR créée avec succès.');
    }

    /**
     * AFFICHER UNE UFR
     */
    public function show(string $id)
    {
        $ufr = Ufr::with('departements')
            ->findOrFail($id);

        return view('ufrs.show', compact('ufr'));
    }

    /**
     * FORMULAIRE MODIFICATION
     */
    public function edit(string $id)
    {
        $ufr = Ufr::findOrFail($id);

        return view('ufrs.edit', compact('ufr'));
    }

    /**
     * METTRE À JOUR
     */
    public function update(Request $request, string $id)
    {
        $ufr = Ufr::findOrFail($id);

        $request->validate([
            'nom' => 'required|string|max:255|unique:ufrs,nom,' . $ufr->id_ufr . ',id_ufr',
        ]);

        $ufr->update([
            'nom' => $request->nom,
        ]);

        return redirect()->route('ufrs.index')
            ->with('success', 'UFR mise à jour.');
    }

    /**
     * SUPPRIMER
     */
    public function destroy(string $id)
    {
        $ufr = Ufr::findOrFail($id);

        $ufr->delete();

        return redirect()->route('ufrs.index')
            ->with('success', 'UFR supprimée.');
    }
}