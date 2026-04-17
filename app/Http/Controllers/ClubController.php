<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreClubRequest;
use App\Models\Club;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClubController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $clubs = Club::with('president')->get();
        return Inertia::render('Clubs/Index', ['clubs' => $clubs]);
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
    public function store(StoreClubRequest $request)
    {
        $club = Club::create($request->validated());
        return redirect()->route('clubs.index')->with('success', 'Club créé avec succès');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $club = Club::with(['president', 'membres', 'activites', 'adhesions'])->findOrFail($id);
        return Inertia::render('Clubs/Show', ['club' => $club]);
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
        $club = Club::findOrFail($id);
        $club->update($request->all());
        return redirect()->route('clubs.index')->with('success', 'Club mis à jour avec succès');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $club = Club::findOrFail($id);
        $club->delete();
        return redirect()->route('clubs.index')->with('success', 'Club supprimé avec succès');
    }
}
