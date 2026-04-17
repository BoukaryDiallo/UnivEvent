<?php

namespace App\Http\Controllers;

use App\Models\Club;
use App\Models\DemandeBudget;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DemandeBudgetController extends Controller
{
    public function index()
    {
        $demandes = DemandeBudget::with('club')->get();
        return Inertia::render('DemandesBudget/Index', ['demandes' => $demandes]);
    }

    public function store(Request $request, Club $club)
    {
        $demande = DemandeBudget::create(array_merge($request->all(), ['club_id' => $club->id, 'statut' => 'en_attente']));
        return redirect()->back()->with('success', 'Demande de budget envoyée');
    }

    public function show(string $id)
    {
        $demande = DemandeBudget::with('club')->findOrFail($id);
        return Inertia::render('DemandesBudget/Show', ['demande' => $demande]);
    }

    public function update(Request $request, string $id)
    {
        $demande = DemandeBudget::findOrFail($id);
        $demande->update($request->all());
        return redirect()->back()->with('success', 'Demande mise à jour');
    }

    public function destroy(string $id)
    {
        $demande = DemandeBudget::findOrFail($id);
        $demande->delete();
        return redirect()->route('demandes-budget.index')->with('success', 'Demande supprimée');
    }

    public function valider(string $id)
    {
        $demande = DemandeBudget::findOrFail($id);
        $demande->update(['statut' => 'approuvée']);
        return redirect()->back()->with('success', 'Demande approuvée');
    }

    public function reject(string $id, Request $request)
    {
        $demande = DemandeBudget::findOrFail($id);
        $demande->update([
            'statut' => 'rejetée',
            'commentaire' => $request->commentaire
        ]);
        return redirect()->back()->with('success', 'Demande rejetée');
    }
}
