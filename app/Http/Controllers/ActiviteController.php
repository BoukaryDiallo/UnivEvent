<?php

namespace App\Http\Controllers;

use App\Models\Activite;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ActiviteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $activites = Activite::with(['club', 'creator'])->get();
        return Inertia::render('Activites/Index', ['activites' => $activites]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $activite = Activite::create($request->all());
        return redirect()->route('activites.index')->with('success', 'Activité créée avec succès');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $activite = Activite::with(['club', 'creator'])->findOrFail($id);
        return Inertia::render('Activites/Show', ['activite' => $activite]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $activite = Activite::findOrFail($id);
        $activite->update($request->all());
        return redirect()->route('activites.index')->with('success', 'Activité mise à jour avec succès');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $activite = Activite::findOrFail($id);
        $activite->delete();
        return redirect()->route('activites.index')->with('success', 'Activité supprimée avec succès');
    }

    public function publish(string $id)
    {
        $activite = Activite::findOrFail($id);
        $activite->update(['statut' => 'publié']);
        return redirect()->back()->with('success', 'Activité publiée');
    }

    public function cancel(string $id)
    {
        $activite = Activite::findOrFail($id);
        $activite->update(['statut' => 'annulé']);
        return redirect()->back()->with('success', 'Activité annulée');
    }
}
