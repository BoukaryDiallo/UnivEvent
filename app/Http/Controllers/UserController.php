<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index()
    {
        $users = User::all();
        return inertia('roles', [
            'users' => $users,
        ]);
    }

    public function toggleStatus(string $id)
    {
        $user = User::findOrFail($id);
        $user->est_actif = !$user->est_actif;
        $user->save();
        return back()->with('success', 'Statut mis à jour');
    }

    public function updateRole(Request $request, string $id)
    {
        $request->validate([
            'role' => 'required|in:admin,etudiant'
        ]);
        $user = User::findOrFail($id);
        
        // Mettre à jour via Spatie
        $user->syncRoles([$request->role]);

        // Pour la rétrocompatibilité temporaire (la colonne est toujours là)
        $user->role = $request->role;
        $user->save();
        
        return back()->with('success', 'Rôle mis à jour');
    }

    public function destroy(string $id)
    {
        $user = User::findOrFail($id);
        $user->delete();
        return back()->with('success', 'Utilisateur supprimé');
    }
}
