<?php

namespace App\Http\Controllers;

use App\Models\Departement;
use App\Models\Ufr;
use Illuminate\Http\Request;
use Inertia\Inertia;

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

        return Inertia::render('departement/DepartementList', [
            'departements' => $departements
        ]);
    }

    /**
     * CREATE
     */
    public function create()
    {
        $ufrs = Ufr::orderBy('nom')->get();

        return Inertia::render('departement/DepartementCreate', compact('ufrs'));
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

        return redirect()->route('departement.index');
    }

    /**
     * SHOW (FIX IMPORTANT)
     */
    public function show(Departement $departement)
    {
        $departement->load(['ufr', 'filieres']);

        return Inertia::render('departement/DepartementShow', compact('departement'));
    }

    /**
     * EDIT
     */
    public function edit(Departement $departement)
    {
        $ufrs = Ufr::orderBy('nom')->get();

        return Inertia::render('departement/DepartementEdit', compact('departement', 'ufrs'));
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

        return redirect()->route('departement.index');
    }

    /**
     * DELETE
     */
    public function destroy(Departement $departement)
    {
        $departement->delete();

        return redirect()->route('departement.index');
    }
}