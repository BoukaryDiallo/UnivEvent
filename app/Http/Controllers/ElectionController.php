<?php

namespace App\Http\Controllers;

use App\Models\Election;
use App\Models\Circonscription;
use Illuminate\Http\Request;
use App\Services\ListeElectoraleService;

class ElectionController extends Controller
{
    /**
     * LISTE DES ÉLECTIONS
     */
    public function index()
    {
        $elections = Election::with('circonscription')
            ->orderByDesc('created_at')
            ->get();

        return view('pages.elections.list_election', compact('elections'));
    }

    /**
     * FORMULAIRE CRÉATION
     */
    public function create()
    {
        $circonscriptions = Circonscription::all();

        return view('pages.elections.create_election', compact('circonscriptions'));
    }

    /**
     * CRÉER UNE ÉLECTION (CORRIGÉ)
     */
    public function store(Request $request)
    {
        $request->validate([
            'titre' => 'required|string|max:255',
            'description' => 'nullable|string',
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after:date_debut',
            'id_circonscription' => 'required|exists:circonscriptions,id_circonscription',
        ]);

        Election::create([
            'titre' => $request->titre,
            'description' => $request->description,
            'date_debut' => $request->date_debut,
            'date_fin' => $request->date_fin,
            'id_circonscription' => $request->id_circonscription,

            // IMPORTANT LOGIQUE E-VOTE
            'statut' => 'brouillon', // ou 'ouverte' si tu veux direct
            'tour' => 1,
        ]);

        return redirect()->route('elections.index')
            ->with('success', 'Élection créée avec succès.');
    }

    /**
     * AFFICHER UNE ÉLECTION
     */
    public function show(string $id)
    {
        $election = Election::with([
            'circonscription',
            'candidatures.user',
            'listesElectorales'
        ])->findOrFail($id);

        return view('pages.elections.show_election', compact('election'));
    }

    /**
     * FORMULAIRE MODIFICATION
     */
    public function edit(string $id)
    {
        $election = Election::findOrFail($id);
        $circonscriptions = Circonscription::all();

        return view('pages.elections.edit_election', compact(
            'election',
            'circonscriptions'
        ));
    }

    /**
     * METTRE À JOUR (CORRIGÉ)
     */
    public function update(Request $request, string $id)
    {
        $election = Election::findOrFail($id);

        $request->validate([
            'titre' => 'required|string|max:255',
            'description' => 'nullable|string',
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after:date_debut',
            'id_circonscription' => 'required|exists:circonscriptions,id_circonscription',
            'statut' => 'required|in:brouillon,ouverte,second_tour,terminee',
        ]);

        $election->update([
            'titre' => $request->titre,
            'description' => $request->description,
            'date_debut' => $request->date_debut,
            'date_fin' => $request->date_fin,
            'id_circonscription' => $request->id_circonscription,
            'statut' => $request->statut,
        ]);

        return redirect()->route('elections.index')
            ->with('success', 'Élection mise à jour.');
    }

    /**
     * SUPPRIMER ÉLECTION
     */
    public function destroy(string $id)
    {
        $election = Election::findOrFail($id);

        $election->delete();

        return redirect()->route('elections.index')
            ->with('success', 'Élection supprimée.');
    }

    /**
     * OUVRIR ÉLECTION (AJOUT IMPORTANT)
     */
    public function ouvrir($id)
    {
        $election = Election::findOrFail($id);

        $election->update([
            'statut' => 'ouverte'
        ]);

        return back()->with('success', 'Élection ouverte.');
    }

    /**
     * CLOTURER ÉLECTION (AJOUT IMPORTANT)
     */
    public function cloturer($id)
    {
        $election = Election::findOrFail($id);

        $election->update([
            'statut' => 'cloturee'
        ]);

        return back()->with('success', 'Élection clôturée.');
    }
    public function genererListeElectorale(Request $request, string $id)
    {
        $election = Election::findOrFail($id);

        // éviter double génération
        if ($election->listesElectorales()->exists()) {
            return back()->with('error', 'La liste électorale a déjà été générée.');
        }

        try {
            $service = new ListeElectoraleService();

            $count = $service->generer($election, $request->all());

            return back()->with('success', "Liste électorale générée avec succès ({$count} étudiants).");

        } catch (\Exception $e) {

            return back()->with('error', $e->getMessage());
        }
    }
}