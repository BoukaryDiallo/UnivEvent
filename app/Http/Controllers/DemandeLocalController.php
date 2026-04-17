<?php

namespace App\Http\Controllers;

use App\Models\Club;
use App\Models\DemandeLocal;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DemandeLocalController extends Controller
{
    public function index()
    {
        $demandes = DemandeLocal::with('club')->get();
        return Inertia::render('DemandesLocal/Index', ['demandes' => $demandes]);
    }

    public function store(Request $request, Club $club)
    {
        $demande = DemandeLocal::create(array_merge($request->all(), ['club_id' => $club->id, 'statut' => 'en_attente']));
        return redirect()->back()->with('success', 'Demande de local envoyée');
    }

    public function show(string $id)
    {
        $demande = DemandeLocal::with('club')->findOrFail($id);
        return Inertia::render('DemandesLocal/Show', ['demande' => $demande]);
    }

    public function update(Request $request, string $id)
    {
        $demande = DemandeLocal::findOrFail($id);
        $demande->update($request->all());
        return redirect()->back()->with('success', 'Demande mise à jour');
    }

    public function destroy(string $id)
    {
        $demande = DemandeLocal::findOrFail($id);
        $demande->delete();
        return redirect()->route('demandes-local.index')->with('success', 'Demande supprimée');
    }

    public function valider(string $id)
    {
        $demande = DemandeLocal::findOrFail($id);
        $demande->update(['statut' => 'approuvée']);
        return redirect()->back()->with('success', 'Demande approuvée');
    }

    public function reject(string $id, Request $request)
    {
        $demande = DemandeLocal::findOrFail($id);
        $demande->update([
            'statut' => 'rejetée',
            'commentaire' => $request->commentaire
        ]);
        return redirect()->back()->with('success', 'Demande rejetée');
    }
}
