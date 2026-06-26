<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    //
    public function index()
    {
        return inertia('Users/Index', [
            'users' => User::with('roles')->get(),
            'roles' => Role::all(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
            'roles' => 'array',          // ← plus "required" pour permettre aucun rôle
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        if (! empty($request->roles)) {
            $user->syncRoles($request->roles);
        }

        return back()->with('success', 'Utilisateur créé');
    }

    public function updateRoles(Request $request, $id)
    {
        $request->validate([
            'roles' => 'array',
            'roles.*' => 'string|exists:roles,name',   // ← vérifie que les rôles existent
        ]);

        $user = User::findOrFail($id);
        $user->syncRoles($request->roles ?? []);

        return back()->with('success', 'Rôles mis à jour');
    }

    public function promouvoirUser($id)
    {
        $user = User::findOrFail($id);
        $user->assignRole('enseignant');   // ← assignRole ajoute sans supprimer les autres

        return back()->with('success', 'Utilisateur promu enseignant');
    }
}
