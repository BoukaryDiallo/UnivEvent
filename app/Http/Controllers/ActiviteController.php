<?php

namespace App\Http\Controllers;

use App\Models\Activite;
use App\Models\Club;
use App\Models\NotificationClub;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ActiviteController extends Controller
{
    /**
     * Afficher la liste des ressources.
     */
    public function index()
    {
        $activites = Activite::with(['club', 'creator'])->get();

        return Inertia::render('Activites/Index', ['activites' => $activites]);
    }

    /**
     * Afficher le formulaire de création d'une nouvelle ressource.
     */
    public function create(Request $request)
    {
        if (Auth::user()->isAdmin()) {
            abort(403, 'Les administrateurs ne peuvent pas créer d\'activités.');
        }

        $preSelectedClubId = $request->query('club_id');

        // Filter clubs to only show those where the user is the responsible
        $clubs = Club::where('statut', 'actif')
            ->where('responsable_id', Auth::id())
            ->get();

        return Inertia::render('Activites/Create', [
            'clubs' => $clubs,
            'preSelectedClubId' => $preSelectedClubId,
        ]);
    }

    /**
     * Stocker une nouvelle ressource créée dans le stockage.
     */
    public function store(Request $request)
    {
        if (Auth::user()->isAdmin()) {
            abort(403, 'Les administrateurs ne peuvent pas créer d\'activités.');
        }
        $data = $request->all();
        $data['created_by'] = Auth::id();
        $data['statut'] = 'brouillon';
        $activite = Activite::create($data);

        return redirect()->route('clubs.show', $data['club_id'])->with('success', 'Activité créée avec succès');
    }

    /**
     * Afficher la ressource spécifiée.
     */
    public function show(string $id)
    {
        $activite = Activite::with(['club', 'creator'])->findOrFail($id);

        return Inertia::render('Activites/Show', ['activite' => $activite]);
    }

    /**
     * Afficher le formulaire d'édition de la ressource spécifiée.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Mettre à jour la ressource spécifiée dans le stockage.
     */
    public function update(Request $request, string $id)
    {
        $activite = Activite::findOrFail($id);
        $activite->update($request->all());

        return redirect()->route('activites.index')->with('success', 'Activité mise à jour avec succès');
    }

    /**
     * Supprimer la ressource spécifiée du stockage.
     */
    public function destroy(string $id)
    {
        $activite = Activite::findOrFail($id);
        $activite->delete();

        return redirect()->route('activites.index')->with('success', 'Activité supprimée avec succès');
    }

    public function publish(string $id)
    {
        $activite = Activite::with('club')->findOrFail($id);
        $activite->update(['statut' => 'publié']);

        // Notifier tous les membres du club
        NotificationClub::create([
            'club_id' => $activite->club_id,
            'type_notif' => 'activite',
            'message' => 'Nouvelle activité publiée: '.$activite->titre,
            'lu' => false,
            'date_envoi' => now(),
        ]);

        return redirect()->back()->with('success', 'Activité publiée');
    }

    public function cancel(string $id)
    {
        $activite = Activite::findOrFail($id);
        $activite->update(['statut' => 'annulé']);

        return redirect()->back()->with('success', 'Activité annulée');
    }
}
