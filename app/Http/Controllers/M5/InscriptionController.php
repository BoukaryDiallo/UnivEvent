<?php

namespace App\Http\Controllers\M5;

use App\Http\Controllers\Controller;
use App\Models\InscriptionEvenement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class InscriptionController extends Controller
{
    public function approve(Request $request, $id)
    {
        $inscription = InscriptionEvenement::with('evenement')->findOrFail($id);
        
        // Authorization: Check if user is creator or admin
        if (!Auth::user()->isAdmin() && $inscription->evenement->cree_par !== Auth::id()) {
            abort(403);
        }

        $inscription->update([
            'statut' => 'accepte',
            'is_waitlist' => false,
            'waitlist_position' => null
        ]);

        // Logic to notify participant...

        return redirect()->back()->with('success', 'Participation validée.');
    }

    public function reject(Request $request, $id)
    {
        $inscription = InscriptionEvenement::with('evenement')->findOrFail($id);
        
        if (!Auth::user()->isAdmin() && $inscription->evenement->cree_par !== Auth::id()) {
            abort(403);
        }

        $inscription->update(['statut' => 'refuse']);

        return redirect()->back()->with('success', 'Demande refusée.');
    }
}
