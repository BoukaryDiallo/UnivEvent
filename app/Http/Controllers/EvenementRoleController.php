<?php

namespace App\Http\Controllers;

use App\Models\Evenement;
use App\Models\EvenementRole;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EvenementRoleController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | AJOUTER UN RÔLE À UN ÉVÉNEMENT
    |--------------------------------------------------------------------------
    */
    public function store(Request $request)
    {
        $request->validate([
            'evenement_id' => 'required|exists:evenements,id',
            'role' => 'required|string',
        ]);

        $evenement = Evenement::findOrFail($request->evenement_id);

        $this->authorizeAdminOrCreator($evenement);

        $role = EvenementRole::create([
            'evenement_id' => $evenement->id,
            'category' => 'audience',
            'role' => $request->role,
        ]);

        return response()->json([
            'message' => 'Rôle ajouté avec succès',
            'data' => $role,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | SUPPRIMER UN RÔLE
    |--------------------------------------------------------------------------
    */
    public function destroy(EvenementRole $evenementRole)
    {
        $evenement = $evenementRole->evenement;

        $this->authorizeAdminOrCreator($evenement);

        $evenementRole->delete();

        return response()->json([
            'message' => 'Rôle supprimé avec succès',
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | SECURITÉ
    |--------------------------------------------------------------------------
    */
    private function authorizeAdminOrCreator(Evenement $evenement)
    {
        $user = Auth::user();

        if (! $user) {
            abort(403);
        }

        if ($user->isAdmin() || $evenement->cree_par === $user->id) {
            return true;
        }

        abort(403, 'Non autorisé');
    }
}
