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
        $ufrs = Ufr::withCount('departements')->orderBy('nom')->paginate(10);

        return view('pages.ufr.list_ufr', compact('ufrs'));
    }

    /**
     * FORMULAIRE CRÉATION
     */
    public function create()
    {
        return view('pages.ufr.create_ufr');
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

        return redirect()->route('ufr.index')
            ->with('success', 'UFR créé avec succès.');
    }

    /**
     * AFFICHER UNE UFR
     */
    public function show(string $id)
    {
        $ufr = Ufr::with('departements')->findOrFail($id);

        return view('pages.ufr.show_ufr', compact('ufr'));
    }

    /**
     * FORMULAIRE MODIFICATION
     */
    public function edit(string $id)
    {
        $ufr = Ufr::findOrFail($id);

        return view('pages.ufr.edit_ufr', compact('ufr'));
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

        return redirect()->route('ufr.index')
            ->with('success', 'UFR mise à jour.');
    }

    /**
     * SUPPRIMER
     */
    public function destroy(string $id)
    {
        $ufr = Ufr::findOrFail($id);

        $ufr->delete();

        return redirect()->route('ufr.index')
            ->with('success', 'UFR supprimée.');
    }
}