<?php

namespace App\Http\Controllers;

use App\Models\Matiere;
use illuminate\Database\QueryException;
use Illuminate\Http\Request;

class MatiereController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function vueMatiere()
    {
        //
        $matieres = Matiere::orderBy('ordre')->latest()->paginate(10);

        return inertia('EmploiDuTemps/Admin/matiere', [
            'matieres' => $matieres,
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
    public function ajouterMatiere(Request $request)
    {
        //

        $data = $request->validate([
            'code' => 'required|string|max:150|unique:matieres,code',
            'intitule' => 'required|string|max:150',
            'volume_horaire_cm' => 'required|integer|min:0',
            'volume_horaire_td' => 'required|integer|min:0',
            'volume_horaire_tp' => 'required|integer|min:0',
        ], [
            'code.unique' => 'Ce module existe déjà.',
        ]);

        Matiere::create($data);

        return back()->with('success', 'Cours créé avec succès');
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
    public function modifierMatiere(Request $request, string $id)
    {
        //

        $data = $request->validate([
            'code' => 'required|string|max:150|unique:matieres,code'.$id,
            'intitule' => 'required|string|max:150',
            'volume_horaire_cm' => 'required|integer|min:0',
            'volume_horaire_td' => 'required|integer|min:0',
            'volume_horaire_tp' => 'required|integer|min:0',
        ]);

        $matieres = Matiere::findOrFail($id);
        try {
            $matieres->update($data);
        } catch (QueryException $e) {
            return back()->withErrors([
                'code' => 'Cet module existe déjà',
            ]);
        }

        return back()->with('success', 'Matiere modifiée avec succès');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function supprimerMatiere(string $id)
    {
        //

        $matieres = Matiere::findOrFail($id);
        $matieres->delete();

        return back()->with('success', 'Matiere supprimée avec succès');
    }
}
