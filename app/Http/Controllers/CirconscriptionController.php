<?php

namespace App\Http\Controllers;

use App\Models\Circonscription;
use Illuminate\Http\Request;

class CirconscriptionController extends Controller
{
    // Liste des circonscriptions
    public function index()
    {
        $circonscriptions = Circonscription::all();
        return view('pages.admin.circonscriptions.list_circonscription', compact('circonscriptions'));
    }

    // Formulaire de création
    public function create()
    {
        return view('pages.admin.circonscriptions.create_circonscription');
    }

    // Enregistrer une nouvelle circonscription
    public function store(Request $request)
    {
        $request->validate([
            'departement' => 'required|string|max:255',
            'filiere' => 'required|string|max:255',
            'niveau' => 'required|string|max:255',
        ]);

        Circonscription::create($request->all());

        return redirect()->route('circonscriptions.index')->with('success', 'Circonscription créée avec succès.');
    }

    // Afficher une circonscription
    public function show(string $id)
    {
        $circonscription = Circonscription::findOrFail($id);
        return view('pages.admin.circonscriptions.show_circonscription', compact('circonscription'));
    }

    // Formulaire de modification
    public function edit(string $id)
    {
        $circonscription = Circonscription::findOrFail($id);
        return view('pages.admin.circonscriptions.edit_circonscription', compact('circonscription'));
    }

    // Mettre à jour une circonscription
    public function update(Request $request, string $id)
    {
        $circonscription = Circonscription::findOrFail($id);

        $request->validate([
            'departement' => 'required|string|max:255',
            'filiere' => 'required|string|max:255',
            'niveau' => 'required|string|max:255',
        ]);

        $circonscription->update($request->all());

        return redirect()->route('circonscriptions.index')->with('success', 'Circonscription mise à jour avec succès.');
    }

    // Supprimer (soft delete)
    public function destroy(string $id)
    {
        $circonscription = Circonscription::findOrFail($id);
        $circonscription->delete();

        return redirect()->route('circonscriptions.index')->with('success', 'Circonscription supprimée.');
    }
}
