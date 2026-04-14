<?php

namespace App\Http\Controllers;

use App\Models\Etudiant;
use App\Models\User;
use Illuminate\Http\Request;

class EtudiantController extends Controller
{
    // Afficher la liste des étudiants
    public function list()
    {
        $etudiants = Etudiant::with('user')->get();
        return view('pages.etudiants.list_etudiant', compact('etudiants'));
    }

    // Formulaire de création
    public function create()
    {
        $users = User::all();
        return view('pages.etudiants.create_etudiant', compact('users'));
    }

    // Enregistrer un étudiant
    public function store(Request $request)
    {
        $request->validate([
            'id_user' => 'required|exists:users,id',
            'INE' => 'required|unique:etudiants,INE',
            'filiere' => 'required',
            'niveau' => 'required',
            'date_naissance' => 'nullable|date',
            'photo' => 'nullable|image|max:4096',
        ]);

        $photoPath = null;
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('photos', 'public');
        }

        Etudiant::create([
            'id_user' => $request->id_user,
            'INE' => $request->INE,
            'filiere' => $request->filiere,
            'niveau' => $request->niveau,
            'date_naissance' => $request->date_naissance,
            'photo' => $photoPath,
        ]);

        return redirect()->route('admin.list.etudiant')->with('success', 'Étudiant créé avec succès.');
    }

    //Formulaire de modification
    public function edit($id)
        {
            $etudiant = Etudiant::findOrFail($id);
            $users = User::all(); // pour recharger la liste des utilisateurs
            return view('pages.etudiants.modifier_etudiant', compact('etudiant', 'users'));
        }

    // Enregistrer la modification
   public function update(Request $request, $id)
        {
            $etudiant = Etudiant::findOrFail($id);
            $user = $etudiant->user;

            $request->validate([
                'name' => 'required|string|max:255',
                'prenom' => 'nullable|string|max:255',
                'filiere' => 'required',
                'niveau' => 'required',
                'date_naissance' => 'nullable|date',
                'photo' => 'nullable|image|max:4096',
            ]);

            // Mise à jour User
            $user->update([
                'name' => $request->name,
            ]);

            // Mise à jour Etudiant
            if ($request->hasFile('photo')) {
                $etudiant->photo = $request->file('photo')->store('photos', 'public');
            }

            $etudiant->update([
                'filiere' => $request->filiere,
                'niveau' => $request->niveau,
                'date_naissance' => $request->date_naissance,
                'photo' => $etudiant->photo,
            ]);

            return redirect()->route('admin.list.etudiant')->with('success', 'Étudiant et utilisateur mis à jour avec succès.');
        }


        // Suppression d un etudiant(softdelete)
    public function delete($id)
        {
            $etudiant = Etudiant::findOrFail($id);
            $etudiant->delete(); 

            return redirect()->route('admin.list.etudiant')->with('success', 'Étudiant supprimé .');
        }


}
