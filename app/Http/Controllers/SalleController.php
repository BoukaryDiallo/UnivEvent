<?php

namespace App\Http\Controllers;

use App\Models\Salle;
use Illuminate\Http\Request;

class SalleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function vueSalle()
    {
        //
        $salles = Salle::orderBy('nom')->latest()->paginate(10);
         return inertia('EmploiDuTemps/Admin/salle',[
            "salles" => $salles
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
    public function ajouterSalle(Request $request)
    {
        //
        

        $request->validate([
            'nom' => 'required|string|max:150|unique:salles,nom',
        ]);

        $conflitSalle = Salle::where('nom', $request->nom)->first();
        if ($conflitSalle) {
            return back()->withErrors([
                'conflict' => 'Cette salle existe déjà'
            ]);
        }

        Salle::create(['nom' => $request->nom]);

        return back()->with('success', 'Salle créée avec succès');
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
    public function modifierSalle(Request $request, string $id)
    {
        //
        
        $data = $request->validate([
            'nom' => 'required|string|max:150|unique:salles,nom'.$id,
        ]);

        $salles = Salle::findOrFail($id);

        try{
            $salles->update($data);
        } catch(\illuminate\Database\QueryException $e){
            return back()->withErrors([
                'nom' => 'Cette salle existe déjà'
            ]);
        }
        

        return back()->with('success', 'Salle modifiée avec succès');
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
    public function supprimerSalle(string $id)
    {
        //

        $salles = Salle::findOrFail($id);
        $salles->delete();

        return back()-> with('success', 'Salle supprimée avec succès');
    }
}
