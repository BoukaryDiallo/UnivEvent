<?php

namespace App\Http\Controllers\M5;

use App\Http\Controllers\Controller;
use App\Models\Evenement;
use App\Models\InscriptionEvenement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ParticipantController extends Controller
{
    public function register(Request $request, Evenement $evenement)
    {
        $user = Auth::user();

        $existing = InscriptionEvenement::where('evenement_id', $evenement->id)
            ->where('utilisateur_id', $user->id)
            ->first();

        if ($existing) {
            return redirect()->back()->with('error', 'Vous êtes déjà inscrit à cet événement.');
        }

        $isFull = $evenement->capacite_max && $evenement->inscriptions()->count() >= $evenement->capacite_max;

        InscriptionEvenement::create([
            'evenement_id' => $evenement->id,
            'utilisateur_id' => $user->id,
            'statut' => $isFull ? 'en_attente' : 'accepte',
            'is_waitlist' => $isFull,
            'waitlist_position' => $isFull ? $evenement->inscriptions()->where('is_waitlist', true)->count() + 1 : null,
        ]);

        return redirect()->back()->with('success', $isFull ? 'Vous avez rejoint la liste d\'attente.' : 'Inscription réussie.');
    }

    public function cancel(Request $request, $id)
    {
        $inscription = InscriptionEvenement::findOrFail($id);

        if ($inscription->utilisateur_id !== Auth::id()) {
            abort(403);
        }

        $inscription->delete();

        return redirect()->back()->with('success', 'Inscription annulée.');
    }
}
