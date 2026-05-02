<?php

namespace App\Http\Controllers;

use App\Models\Salle;
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
}