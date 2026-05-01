<?php

namespace App\Http\Controllers;

use App\Models\Club;
use App\Models\DemandeLocal;
use App\Models\DemandeBudget;
use App\Models\User;
use App\Models\Activite;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GestionController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $data = [];

        // Clubs data
        $data['clubs'] = Club::with(['responsable', 'adhesions'])
            ->when($user->role !== 'admin', function ($query) use ($user) {
                return $query->where('statut', 'actif');
            })
            ->get();

        // Activites data
        $data['activites'] = Activite::with('club')
            ->when($user->role !== 'admin', function ($query) use ($user) {
                return $query->whereHas('club', function ($q) use ($user) {
                    $q->where('responsable_id', $user->id)
                        ->orWhereHas('adhesions', function ($a) use ($user) {
                            $a->where('user_id', $user->id)->where('statut', 'approuvee');
                        });
                });
            })
            ->get();

        // Stats
        $data['stats'] = [
            'totalClubs' => Club::count(),
            'totalActivites' => Activite::count(),
            'totalDemandesLocal' => $user->role === 'admin' ? DemandeLocal::count() : 0,
            'totalDemandesBudget' => $user->role === 'admin' ? DemandeBudget::count() : 0,
            'totalUsers' => $user->role === 'admin' ? User::count() : 0,
        ];

        // Admin-only data
        if ($user->role === 'admin') {
            $data['demandesLocal'] = DemandeLocal::with('club')->get();
            $data['demandesBudget'] = DemandeBudget::with('club')->get();
            $data['users'] = User::all();
        }

        return Inertia::render('gestion/index', $data);
    }
}
