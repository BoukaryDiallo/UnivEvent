<?php

namespace App\Http\Controllers;

use App\Models\NotificationSoutenance;
use App\Models\Salle;
use App\Models\Soutenance;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SoutenanceController extends Controller
{
    public function index()
    {
        $soutenances = Soutenance::with(['salle', 'etudiant', 'jury'])->get();

        return Inertia::render('soutenances/index', compact('soutenances'));
    }

    public function create()
    {
        $salles = Salle::where('disponible', true)->get();
        $etudiants = User::role('etudiant')->get();

        return Inertia::render('soutenances/create', compact('salles', 'etudiants'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'titre' => 'required|string|max:255',
            'date_soutenance' => 'required|date',
            'heure_debut' => 'required',
            'heure_fin' => 'required|after:heure_debut',
            'salle_id' => 'required|exists:salles,id',
            'etudiant_id' => 'required|exists:users,id',
        ]);

        $soutenance = Soutenance::create($request->all());

        NotificationSoutenance::create([
            'soutenance_id' => $soutenance->id,
            'user_id' => $soutenance->etudiant_id,
            'type' => 'convocation',
            'message' => 'Vous êtes convoqué(e) pour la soutenance : '.$soutenance->titre,
            'lu' => false,
        ]);

        return redirect()->route('soutenances.index')->with('success', 'Soutenance planifiée.');
    }

    public function show(Soutenance $soutenance)
    {
        $soutenance->load(['salle', 'etudiant', 'jury.membres.user']);

        return Inertia::render('soutenances/show', compact('soutenance'));
    }

    public function edit(Soutenance $soutenance)
    {
        $salles = Salle::all();
        $etudiants = User::role('etudiant')->get();

        return Inertia::render('soutenances/edit', compact('soutenance', 'salles', 'etudiants'));
    }

    public function update(Request $request, Soutenance $soutenance)
    {
        $request->validate([
            'titre' => 'required|string|max:255',
            'date_soutenance' => 'required|date',
            'heure_debut' => 'required',
            'heure_fin' => 'required|after:heure_debut',
            'salle_id' => 'required|exists:salles,id',
            'etudiant_id' => 'required|exists:users,id',
        ]);
        $soutenance->update($request->all());

        return redirect()->route('soutenances.index')->with('success', 'Soutenance modifiée.');
    }

    public function destroy(Soutenance $soutenance)
    {
        $soutenance->delete();

        return redirect()->route('soutenances.index')->with('success', 'Soutenance supprimée.');
    }
}
