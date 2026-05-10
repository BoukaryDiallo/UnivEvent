<?php

namespace App\Http\Controllers\M5;

use App\Http\Controllers\Controller;
use App\Models\Evenement;
use App\Models\EvenementRole;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RoleEvenementielController extends Controller
{
    public function store(Request $request, Evenement $evenement)
    {
        $validated = $request->validate([
            'role' => 'required|string',
            'user_id' => 'nullable|exists:users,id',
            'category' => 'nullable|string',
        ]);

        EvenementRole::create([
            'evenement_id' => $evenement->id,
            'role' => $validated['role'],
            'user_id' => $validated['user_id'] ?? null,
            'category' => $validated['category'] ?? 'audience',
        ]);

        return redirect()->back()->with('success', 'Rôle assigné avec succès.');
    }
}
