<?php

namespace App\Http\Controllers;

use App\Models\Salle;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SalleController extends Controller
{
    public function index()
    {
        $salles = Salle::all();

        return Inertia::render('soutenances/salles/index', compact('salles'));
    }

    public function create()
    {
        return Inertia::render('soutenances/salles/create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'nom' => 'required|string|max:255',
            'capacite' => 'required|integer|min:1',
            'batiment' => 'nullable|string|max:255',
        ]);
        Salle::create($request->all());

        return redirect()->route('salles.index')->with('success', 'Salle créée avec succès.');
    }

    public function edit(Salle $salle)
    {
        return Inertia::render('soutenances/salles/edit', compact('salle'));
    }

    public function update(Request $request, Salle $salle)
    {
        $request->validate([
            'nom' => 'required|string|max:255',
            'capacite' => 'required|integer|min:1',
        ]);
        $salle->update($request->all());

        return redirect()->route('salles.index')->with('success', 'Salle modifiée avec succès.');
    }

    public function destroy(Salle $salle)
    {
        $salle->delete();

        return redirect()->route('salles.index')->with('success', 'Salle supprimée.');
    }

    public function vueSalle()
    {
        $salles = Salle::orderBy('nom')->latest()->paginate(10);

        return inertia('EmploiDuTemps/Admin/salle', [
            'salles' => $salles,
        ]);
    }

    public function ajouterSalle(Request $request)
    {
        $request->validate([
            'nom' => 'required|string|max:150|unique:salles,nom',
        ]);

        $conflitSalle = Salle::where('nom', $request->nom)->first();
        if ($conflitSalle) {
            return back()->withErrors([
                'conflict' => 'Cette salle existe déjà',
            ]);
        }

        Salle::create(['nom' => $request->nom]);

        return back()->with('success', 'Salle créée avec succès');
    }

    public function show(string $id) {}

    public function modifierSalle(Request $request, string $id)
    {
        $data = $request->validate([
            'nom' => 'required|string|max:150|unique:salles,nom,'.$id,
        ]);

        $salles = Salle::findOrFail($id);

        try {
            $salles->update($data);
        } catch (QueryException) {
            return back()->withErrors([
                'nom' => 'Cette salle existe déjà',
            ]);
        }

        return back()->with('success', 'Salle modifiée avec succès');
    }

    public function supprimerSalle(string $id)
    {
        $salles = Salle::findOrFail($id);
        $salles->delete();

        return back()->with('success', 'Salle supprimée avec succès');
    }
}
