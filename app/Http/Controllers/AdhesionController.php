<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAdhesionRequest;
use App\Models\Adhesion;
use App\Models\Club;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AdhesionController extends Controller
{
    public function index()
    {
        $adhesions = Adhesion::with(['etudiant', 'club'])->get();
        return Inertia::render('Adhesions/Index', ['adhesions' => $adhesions]);
    }

    public function store(StoreAdhesionRequest $request, Club $club)
    {
        $adhesion = Adhesion::create(array_merge($request->validated(), ['club_id' => $club->id, 'statut' => 'en_attente']));
        return redirect()->back()->with('success', 'Demande d\'adhésion envoyée');
    }

    public function show(string $id)
    {
        $adhesion = Adhesion::with(['etudiant', 'club'])->findOrFail($id);
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
            ->where('etudiant_id', auth()->id())
            ->firstOrFail();
        $adhesion->delete();
        return redirect()->back()->with('success', 'Vous avez quitté le club');
    }

    public function valider(string $id)
    {
        $adhesion = Adhesion::findOrFail($id);
        $adhesion->update(['statut' => 'acceptée']);
        return redirect()->back()->with('success', 'Adhésion acceptée');
    }

    public function reject(string $id, Request $request)
    {
        $adhesion = Adhesion::findOrFail($id);
        $adhesion->update(['statut' => 'refusée']);
        return redirect()->back()->with('success', 'Adhésion refusée');
    }
}
