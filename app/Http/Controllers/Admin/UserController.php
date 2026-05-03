<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Spatie\Permission\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    //
    public function index()
    {
        return inertia('Users/Index', [
            'users' => User::with('roles')->get(),
            'roles' => Role::all()
        ]);
    }

    public function updateRoles(Request $request, $id)
    {
            $request->validate([
                'roles' => 'array',
                'roles.*' => 'string'
            ]);
        $user = User::findOrFail($id);

        $user->syncRoles($request->roles);

        return back()->with('success', 'Roles mis à jour');
    }

    public function promouvoirUser($id)
    {
        $user = User::findOrFail($id);

        // Option 1 : remplacer rôle
        $user->assignRole(['enseignant']);

        return back()->with('success', 'Utilisateur promu enseignant');
    }

    

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
            'roles' => 'required|array'
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        
        $user->syncRoles($request->roles);

        return back()->with('success', 'Utilisateur créé');
    }
}
