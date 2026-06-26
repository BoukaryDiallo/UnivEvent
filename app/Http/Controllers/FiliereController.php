<?php

namespace App\Http\Controllers;

use App\Models\Departement;
use App\Models\Filiere;
use App\Models\Ufr;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FiliereController extends Controller
{
    public function index()
    {
        $filieres = Filiere::with(['departement.ufr'])
            ->orderBy('nom')
            ->get();

        return Inertia::render('filiere/FiliereList', [
            'filieres' => $filieres,
        ]);
    }

    public function create()
    {
        $ufrs = Ufr::orderBy('nom')->get();
        $departements = Departement::orderBy('nom')->get();

        return Inertia::render('filiere/FiliereCreate', compact('ufrs', 'departements'));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nom' => 'required|string|max:255',
            'id_departement' => 'required|exists:departements,id_departement',
        ]);

        Filiere::create($data);

        return redirect()->route('filiere.index');
    }

    public function show(Filiere $filiere)
    {
        $filiere->load('departement.ufr');

        return Inertia::render('filiere/FiliereShow', [
            'filiere' => $filiere,
        ]);
    }

    public function edit(Filiere $filiere)
    {
        $ufrs = Ufr::orderBy('nom')->get();
        $departements = Departement::orderBy('nom')->get();

        return Inertia::render('filiere/FiliereEdit', compact('filiere', 'ufrs', 'departements'));
    }

    public function update(Request $request, Filiere $filiere)
    {
        $data = $request->validate([
            'nom' => 'required|string|max:255',
            'id_departement' => 'required|exists:departements,id_departement',
        ]);

        $filiere->update($data);

        return redirect()->route('filiere.show', $filiere);
    }

    public function destroy(Filiere $filiere)
    {
        $filiere->delete();

        return redirect()->route('filiere.index');
    }

    public function getDepartementsByUfr($id_ufr)
    {
        $departements = Departement::where('id_ufr', $id_ufr)
            ->orderBy('nom')
            ->get()
            ->map(function ($d) {
                return [
                    'id' => $d->id_departement,
                    'text' => $d->nom,
                ];
            });

        return response()->json($departements);
    }
}
