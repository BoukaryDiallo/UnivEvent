<?php

namespace App\Http\Controllers;

use App\Models\Club;
use App\Models\DemandeLocal;
use App\Models\NotificationClub;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DemandeLocalController extends Controller
{
    public function index()
    {
        $demandes = DemandeLocal::with('club')->get();

        return Inertia::render('DemandesLocal/Index', ['demandes' => $demandes]);
    }

    public function create(Club $club)
    {
        return Inertia::render('DemandesLocal/Create', ['club' => $club]);
    }

    public function store(Request $request, Club $club)
    {
        // Check if club is active
        if ($club->statut !== 'actif') {
            return redirect()->back()->with('error', 'Seuls les clubs actifs peuvent faire des demandes de local');
        }

        $demande = DemandeLocal::create(array_merge($request->all(), [
            'club_id' => $club->id,
            'statut' => 'en_attente',
        ]));

        return redirect()->route('clubs.show', $club->id)->with('success', 'Demande de local envoyée');
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
        $demande = DemandeLocal::with('club')->findOrFail($id);
        $demande->update(['statut' => 'approuvée']);

        // Notify club responsible
        NotificationClub::create([
            'club_id' => $demande->club_id,
            'type_notif' => 'local',
            'message' => 'Votre demande de local pour le '.$demande->date->format('d/m/Y').' a été approuvée',
            'lu' => false,
            'date_envoi' => now(),
        ]);

        return redirect()->back()->with('success', 'Demande approuvée');
    }

    public function reject(string $id, Request $request)
    {
        $demande = DemandeLocal::with('club')->findOrFail($id);
        $demande->update([
            'statut' => 'rejetée',
            'commentaire' => $request->commentaire,
        ]);

        // Notify club responsible
        NotificationClub::create([
            'club_id' => $demande->club_id,
            'type_notif' => 'local',
            'message' => 'Votre demande de local pour le '.$demande->date->format('d/m/Y').' a été rejetée. Motif: '.$request->commentaire,
            'lu' => false,
            'date_envoi' => now(),
        ]);

        return redirect()->back()->with('success', 'Demande rejetée');
    }
}
