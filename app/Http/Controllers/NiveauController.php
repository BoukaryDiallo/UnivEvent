<?php

namespace App\Http\Controllers;

use App\Models\Niveau;
use Illuminate\Http\Request;

class NiveauController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function vueNiveau()
    {
        //
        $niveaux = Niveau::orderBy('ordre')->latest()->paginate(10);
         return inertia('EmploiDuTemps/Admin/niveau',[
            "niveaux" => $niveaux
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
    public function ajouterNiveauEtude(Request $request)
    {
        //
        

        $data = $request->validate([
            'nom' => 'required|string|max:150|unique:niveaux,nom',
            'code' => 'required|string|max:150|unique:niveaux,code',
            'ordre' => 'required|integer|min:1',
        ]);

        Niveau::create($data);

        return back()->with('success', 'Niveau d\'étude créé avec succès');
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
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
     public function modifierNiveau(Request $request, string $id)
    {
        //
        
        $data = $request->validate([
            'nom' => 'required|string|max:150|unique:niveaux,nom'.$id,
            'code' => 'required|string|max:150|unique:niveaux,code'.$id,
            'ordre' => 'required|integer|min:1'
        ]);

        $niveaux = Niveau::findOrFail($id);
        try{
            $niveaux->update($data);
        } catch(\illuminate\Database\QueryException $e){
            return back()->withErrors([
                'code' => 'Ce code de cyle existe déjà',
                'nom' => 'Cyle existe déjà',
            ]);
        }
        

        return back()->with('success', 'Niveau modifiée avec succès');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function supprimerNiveau(string $id)
    {
        //

        $niveaux = Niveau::findOrFail($id);
        $niveaux->delete();

        return back()-> with('success', 'Niveau supprimée avec succès');
    }
}
