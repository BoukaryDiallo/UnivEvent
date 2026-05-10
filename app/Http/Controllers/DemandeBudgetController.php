<?php

namespace App\Http\Controllers;

use App\Models\Club;
use App\Models\DemandeBudget;
use App\Models\NotificationClub;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DemandeBudgetController extends Controller
{
    public function index()
    {
        $demandes = DemandeBudget::with('club')->get();
        return Inertia::render('DemandesBudget/Index', ['demandes' => $demandes]);
    }

    public function create(Club $club)
    {
        return Inertia::render('DemandesBudget/Create', ['club' => $club]);
    }

    public function store(Request $request, Club $club)
    {
        // Check if club is active
        if ($club->statut !== 'actif') {
            return redirect()->back()->with('error', 'Seuls les clubs actifs peuvent faire des demandes de budget');
        }

        $demande = DemandeBudget::create(array_merge($request->all(), [
            'club_id' => $club->id,
            'statut' => 'en_attente',
        ]));

        return redirect()->route('clubs.show', $club->id)->with('success', 'Demande de budget envoyée');
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
        $demande = DemandeBudget::with('club')->findOrFail($id);
        $demande->update(['statut' => 'approuvée']);

        // Notify club responsible
        NotificationClub::create([
            'club_id' => $demande->club_id,
            'type_notif' => 'budget',
            'message' => 'Votre demande de budget de ' . $demande->montant_demande . ' FCFA a été approuvée',
            'lu' => false,
            'date_envoi' => now(),
        ]);

        return redirect()->back()->with('success', 'Demande approuvée');
    }

    public function reject(string $id, Request $request)
    {
        $demande = DemandeBudget::with('club')->findOrFail($id);
        $demande->update([
            'statut' => 'rejetée',
            'commentaire' => $request->commentaire
        ]);

        // Notify club responsible
        NotificationClub::create([
            'club_id' => $demande->club_id,
            'type_notif' => 'budget',
            'message' => 'Votre demande de budget de ' . $demande->montant_demande . ' FCFA a été rejetée. Motif: ' . $request->commentaire,
            'lu' => false,
            'date_envoi' => now(),
        ]);

        return redirect()->back()->with('success', 'Demande rejetée');
    }
}
