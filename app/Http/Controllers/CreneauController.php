<?php

namespace App\Http\Controllers;

use App\Models\Creneau;
use Illuminate\Http\Request;

class CreneauController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function vueCreneau()
    {
        //
        $creneaux = Creneau::latest()->paginate(10);
         return inertia('EmploiDuTemps/Admin/creneau',[
            "creneaux" => $creneaux
         ]);
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
    public function ajouterCreneau(Request $request)
    {
        //
        

        $data = $request->validate([
            'heure_debut' => 'required|date_format:H:i',
            'heure_fin' => 'required|date_format:H:i|after:heure_debut',
        ]);

        Creneau::create([
            ...$data,
            'libelle' => $data['heure_debut'].' - '.$data['heure_fin']
        ]);

        return back()->with('success', 'Creneau créée avec succès');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function modifierCreneau(Request $request, string $id)
    {
        //
        
        $data = $request->validate([
            'heure_debut' => 'required|date_format:H:i',
            'heure_fin' => 'required|date_format:H:i|after:heure_debut',
        ]);

        $creneaux = Creneau::findOrFail($id);

            $creneaux->update([
                ...$data,
                'libelle' => $data['heure_debut'].' - '.$data['heure_fin']
            ]);
        
        

        return back()->with('success', 'Creneau modifiée avec succès');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function supprimerCreneau(string $id)
    {
        //

        $creneaux = Creneau::findOrFail($id);
        $creneaux->delete();

        return back()-> with('success', 'Creneau supprimée avec succès');
    }
}
