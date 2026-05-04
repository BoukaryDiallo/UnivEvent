<?php

namespace App\Http\Controllers;

use App\Models\Enseignant;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Response;

class EnseignantAuthController extends Controller
{
    public function inscription(): Response
    {
        return inertia('auth/enseignant-register');
    }

    public function enregistrer(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'nom' => ['required', 'string', 'max:255'],
            'prenom' => ['required', 'string', 'max:255'],
            'telephone' => ['required', 'string', 'max:255'],
            'specialite' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => trim($data['prenom'].' '.$data['nom']),
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'role' => 'enseignant',
                'est_actif' => true,
            ]);

            Enseignant::create([
                'user_id' => $user->id,
                'nom' => $data['nom'],
                'prenom' => $data['prenom'],
                'telephone' => $data['telephone'],
                'specialite' => $data['specialite'],
            ]);

            return $user;
        });

        Auth::login($user);
        $request->session()->regenerate();

        return redirect('/dashboard');
    }

    public function connexion(): Response
    {
        return inertia('auth/enseignant-login', [
            'status' => session('status'),
        ]);
    }

    public function connecter(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
            'remember' => ['nullable', 'boolean'],
        ]);

        if (! Auth::attempt([
            'email' => $data['email'],
            'password' => $data['password'],
            'role' => 'enseignant',
            'est_actif' => true,
        ], (bool) ($data['remember'] ?? false))) {
            throw ValidationException::withMessages([
                'email' => 'Les identifiants enseignant sont invalides.',
            ]);
        }

        $request->session()->regenerate();

        return redirect('/dashboard');
    }
}
