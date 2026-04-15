<?php

namespace App\Http\Controllers;

use App\Models\Departement;
use App\Models\Ufr;
use Illuminate\Http\Request;

class DepartementController extends Controller
{
    /**
     * LISTE
     */
    public function index()
    {
        $departements = Departement::with(['ufr', 'filieres'])
            ->withCount('filieres')
            ->orderBy('nom')
            ->paginate(10);

        return view('pages.departement.list_departement', compact('departements'));
    }

    /**
     * CREATE
     */
    public function create()
    {
        $ufrs = Ufr::orderBy('nom')->get();

        return view('pages.departement.create_departement', compact('ufrs'));
    }

    /**
     * STORE
     */
    public function store(Request $request)
    {
        $request->validate([
            'nom' => 'required|string|max:255',
            'id_ufr' => 'required|exists:ufrs,id_ufr',
        ]);

        Departement::create($request->only(['nom', 'id_ufr']));

        return redirect()->route('departement.index')
            ->with('success', 'Département créé avec succès.');
    }

    /**
     * SHOW (FIX IMPORTANT)
     */
    public function show(Departement $departement)
    {
        $departement->load(['ufr', 'filieres']);

        return view('pages.departement.show_departement', compact('departement'));
    }

    /**
     * EDIT
     */
    public function edit(Departement $departement)
    {
        $ufrs = Ufr::orderBy('nom')->get();

        return view('pages.departement.edit_departement', compact('departement', 'ufrs'));
    }

    /**
     * UPDATE
     */
    public function update(Request $request, Departement $departement)
    {
        $request->validate([
            'nom' => 'required|string|max:255',
            'id_ufr' => 'required|exists:ufrs,id_ufr',
        ]);

        $departement->update($request->only(['nom', 'id_ufr']));

        return redirect()->route('departement.index')
            ->with('success', 'Département mis à jour.');
    }

    /**
     * DELETE
     */
    public function destroy(Departement $departement)
    {
        $departement->delete();

        return redirect()->route('departement.index')
            ->with('success', 'Département supprimé.');
    }
}