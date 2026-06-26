<?php

namespace App\Http\Controllers;

use App\Models\Departement;
use App\Models\Etudiant;
use App\Models\Filiere;
use App\Models\Ufr;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class EtudiantController extends Controller
{
    /**
     * LISTE
     */
    public function index()
    {
        $etudiants = Etudiant::with(['user', 'ufr', 'departement', 'filiere'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('etudiants/EtudiantList', [
            'etudiants' => $etudiants,
        ]);
    }

    /**
     * FORM CREATE
     */
    public function create()
    {
        return Inertia::render('etudiants/EtudiantCreate', [
            'users' => User::orderBy('name')->get(),
            'niveaux' => Etudiant::getNiveaux(),
            'ufrs' => Ufr::orderBy('nom')->get(),
            'departements' => Departement::orderBy('nom')->get(),
            'filieres' => Filiere::orderBy('nom')->get(),
        ]);
    }

    /**
     * STORE
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'id_user' => 'required|exists:users,id',
            'INE' => 'required|string|unique:etudiants,INE',
            'id_ufr' => 'required|exists:ufrs,id_ufr',
            'id_departement' => 'required|exists:departements,id_departement',
            'id_filiere' => 'required|exists:filieres,id_filiere',
            'niveau' => 'required|in:'.implode(',', array_keys(Etudiant::getNiveaux())),
            'date_naissance' => 'nullable|date',
            'photo' => 'nullable|image|max:4096',
        ]);

        if ($request->hasFile('photo')) {
            $data['photo'] = $request->file('photo')->store('photos', 'public');
        }

        Etudiant::create($data);

        return redirect()->route('etudiants.index');
    }

    /**
     * SHOW
     */
    public function show(string $id)
    {
        $etudiant = Etudiant::with(['user', 'ufr', 'departement', 'filiere'])
            ->findOrFail($id);

        return Inertia::render('etudiants/EtudiantShow', compact('etudiant'));
    }

    /**
     * EDIT
     */
    public function edit(string $id)
    {
        $etudiant = Etudiant::with(['user', 'ufr', 'departement', 'filiere'])
            ->findOrFail($id);

        return Inertia::render('etudiants/EtudiantEdit', [
            'etudiant' => $etudiant,
            'users' => User::orderBy('name')->get(),
            'niveaux' => Etudiant::getNiveaux(),
            'ufrs' => Ufr::orderBy('nom')->get(),
            'departements' => Departement::orderBy('nom')->get(),
            'filieres' => Filiere::orderBy('nom')->get(),
        ]);
    }

    /**
     * UPDATE
     */
    public function update(Request $request, string $id)
    {
        $etudiant = Etudiant::findOrFail($id);

        $data = $request->validate([
            'id_user' => 'required|exists:users,id',
            'INE' => 'required|string|unique:etudiants,INE,'.$etudiant->id,
            'id_ufr' => 'required|exists:ufrs,id_ufr',
            'id_departement' => 'required|exists:departements,id_departement',
            'id_filiere' => 'required|exists:filieres,id_filiere',
            'niveau' => 'required|in:'.implode(',', array_keys(Etudiant::getNiveaux())),
            'date_naissance' => 'nullable|date',
            'photo' => 'nullable|image|max:4096',
        ]);

        if ($request->hasFile('photo')) {
            if ($etudiant->photo) {
                Storage::disk('public')->delete($etudiant->photo);
            }
            $data['photo'] = $request->file('photo')->store('photos', 'public');
        }

        $etudiant->update($data);

        return redirect()->route('etudiants.index');
    }

    /**
     * DELETE
     */
    public function destroy(string $id)
    {
        $etudiant = Etudiant::findOrFail($id);

        if ($etudiant->photo) {
            Storage::disk('public')->delete($etudiant->photo);
        }

        $etudiant->delete();

        return redirect()->route('etudiants.index');
    }
}
