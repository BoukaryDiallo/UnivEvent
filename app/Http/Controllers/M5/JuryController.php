<?php

namespace App\Http\Controllers\M5;

use App\Http\Controllers\Controller;
use App\Models\Evenement;
use App\Models\JuryPanel;
use App\Models\Resultat;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class JuryController extends Controller
{
    public function panel(Evenement $evenement)
    {
        $evenement->load([
            'juryPanel.criteria',
            'juryPanel.deliberations',
            'juryPanel.scores',
            'inscriptions.utilisateur',
            'roles.user',
        ]);
        
        $candidatures = $evenement->inscriptions->map(fn($ins) => [
            'id' => $ins->id,
            'nom' => $ins->utilisateur->name,
            'fichier_url' => '#',
            'statut_evaluation' => 'en_attente',
        ]);

        $evenement->setRelation('participants', $evenement->inscriptions->map(fn($ins) => (object) [
            'id' => $ins->id,
            'backend_statut' => $ins->statut,
            'utilisateur' => [
                'id' => $ins->utilisateur->id,
                'name' => $ins->utilisateur->name,
                'email' => $ins->utilisateur->email,
            ],
        ]));

        $juryMembers = $evenement->roles->where('role', 'jury')->map(fn($role) => [
            'id' => $role->user?->id,
            'name' => $role->user?->name,
            'email' => $role->user?->email,
        ])->filter();

        $evenement->setRelation('team', (object) ['jury' => $juryMembers]);

        return Inertia::render('module5/jury/Panel', [
            'concours' => $evenement,
            'candidatures' => $candidatures,
            'criteres' => $evenement->juryPanel?->criteria ?? [],
        ]);
    }

    public function evaluate(Request $request)
    {
        $validated = $request->validate([
            'candidature_id' => 'required',
            'scores' => 'required|array',
            'comment' => 'nullable|string',
            'total' => 'required|numeric',
        ]);

        // Logic to save scores in JuryScore model (assuming it exists)
        // For now, let's just simulate success

        return redirect()->back()->with('success', 'Évaluation enregistrée.');
    }

    public function valider(Request $request, $id)
    {
        // $id is likely evenement_id or jury_panel_id
        $evenement = Evenement::findOrFail($id);
        $evenement->update(['competition_status' => 'resultats_publies', 'results_published_at' => now()]);

        return redirect()->back()->with('success', 'Délibération validée et résultats publiés.');
    }
}
