<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAdhesionRequest;
use App\Models\Adhesion;
use App\Models\Club;
use App\Models\NotificationClub;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AdhesionController extends Controller
{
    public function index()
    {
        $adhesions = Adhesion::with(['user', 'club'])->get();
        return Inertia::render('Adhesions/Index', ['adhesions' => $adhesions]);
    }

    public function store(StoreAdhesionRequest $request, Club $club)
    {
        // Vérifier si l'utilisateur est déjà membre
        $existing = Adhesion::where('user_id', Auth::id())
            ->where('club_id', $club->id)
            ->first();
        
        if ($existing) {
            return redirect()->back()->with('error', 'Vous êtes déjà inscrit à ce club');
        }
        
        $adhesion = Adhesion::create(array_merge($request->validated(), [
            'club_id' => $club->id,
            'user_id' => Auth::id(),
            'statut' => 'en_attente',
            'date_adhesion' => now(),
        ]));
        
        // Envoyer une notification au responsable du club
        NotificationClub::create([
            'club_id' => $club->id,
            'type_notif' => 'adhesion',
            'message' => 'Nouvelle demande d\'adhésion de ' . Auth::user()->name,
            'lu' => false,
            'date_envoi' => now(),
        ]);
        
        return redirect()->back()->with('success', 'Demande d\'adhésion envoyée');
    }

    public function show(string $id)
    {
        $adhesion = Adhesion::with(['user', 'club'])->findOrFail($id);
        return Inertia::render('Adhesions/Show', ['adhesion' => $adhesion]);
    }

    public function update(Request $request, string $id)
    {
        $adhesion = Adhesion::findOrFail($id);
        $adhesion->update($request->all());
        return redirect()->back()->with('success', 'Adhésion mise à jour');
    }

    public function destroy(Club $club)
    {
        $adhesion = Adhesion::where('club_id', $club->id)
            ->where('user_id', auth()->id())
            ->firstOrFail();
        $adhesion->update(['statut' => 'quittee']);
        
        // Notifier le responsable du club
        NotificationClub::create([
            'club_id' => $club->id,
            'type_notif' => 'adhesion',
            'message' => Auth::user()->name . ' a quitté le club',
            'lu' => false,
            'date_envoi' => now(),
        ]);
        
        return redirect()->back()->with('success', 'Vous avez quitté le club');
    }

    public function valider(string $id)
    {
        $adhesion = Adhesion::with('club')->findOrFail($id);

        if ($adhesion->club->responsable_id !== Auth::id()) {
            abort(403, 'Seul le responsable du club peut valider cette adhésion.');
        }

        $adhesion->update(['statut' => 'approuvee', 'date_adhesion' => now()]);
        
        // Notifier l'étudiant
        NotificationClub::create([
            'club_id' => $adhesion->club_id,
            'type_notif' => 'adhesion',
            'message' => 'Votre adhésion au club ' . $adhesion->club->nom . ' a été acceptée',
            'lu' => false,
            'date_envoi' => now(),
        ]);
        
        return redirect()->back()->with('success', 'Adhésion acceptée');
    }

    public function reject(string $id, Request $request)
    {
        $adhesion = Adhesion::with('club')->findOrFail($id);

        if ($adhesion->club->responsable_id !== Auth::id()) {
            abort(403, 'Seul le responsable du club peut rejeter cette adhésion.');
        }

        $adhesion->update(['statut' => 'rejetee']);
        
        // Notifier l'étudiant
        NotificationClub::create([
            'club_id' => $adhesion->club_id,
            'type_notif' => 'adhesion',
            'message' => 'Votre adhésion au club ' . $adhesion->club->nom . ' a été refusée',
            'lu' => false,
            'date_envoi' => now(),
        ]);
        
        return redirect()->back()->with('success', 'Adhésion refusée');
    }
}
