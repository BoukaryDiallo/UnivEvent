<?php

namespace App\Http\Controllers\M5;

use App\Http\Controllers\Controller;
use App\Models\Evenement;
use App\Models\InscriptionEvenement;
use App\Models\Certificat;
use App\Models\EvenementMedia;
use App\Models\EvenementRole;
use App\Models\Resultat;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $role = $user->role;

        return match ($role) {
            'admin' => $this->adminDashboard($request),
            'organisateur' => $this->organizerDashboard($request),
            'enseignant' => $this->participantDashboard($request), // Defaulting to participant if not explicitly organizer/jury
            'etudiant' => $this->participantDashboard($request),
            default => $this->participantDashboard($request),
        };
    }

    private function organizerDashboard(Request $request)
    {
        $user = Auth::user();
        $mes_evenements = Evenement::where('cree_par', $user->id)
            ->withCount('inscriptions')
            ->get();

        return Inertia::render('m5/dashboard/Organisateur', [
            'mes_evenements' => $mes_evenements,
            'stats' => [
                'total' => $mes_evenements->count(),
                'publies' => $mes_evenements->where('statut', 'publie')->count(),
                'en_attente_validation' => $mes_evenements->where('statut', 'en_attente')->count(),
                'clotures' => $mes_evenements->where('statut', 'cloture')->count(),
                'total_inscrits' => $mes_evenements->sum('inscriptions_count'),
            ],
            'prochains_evenements' => Evenement::where('cree_par', $user->id)
                ->where('date_debut', '>', now())
                ->limit(5)
                ->get(),
        ]);
    }

    private function participantDashboard(Request $request)
    {
        $user = Auth::user();
        $mes_inscriptions = InscriptionEvenement::where('utilisateur_id', $user->id)
            ->with('evenement')
            ->get();
        $mes_certificats = Certificat::where('utilisateur_id', $user->id)
            ->with('evenement')
            ->get();

        return Inertia::render('m5/dashboard/Participant', [
            'mes_inscriptions' => $mes_inscriptions,
            'mes_certificats' => $mes_certificats,
            'evenements_suggeres' => Evenement::where('statut', 'publie')
                ->where('date_debut', '>', now())
                ->limit(6)
                ->get(),
            'stats' => [
                'inscrits' => $mes_inscriptions->count(),
                'en_attente' => $mes_inscriptions->where('statut', 'en_attente')->count(),
                'certificats_disponibles' => $mes_certificats->count(),
                'evenements_termines' => Evenement::whereHas('inscriptions', fn($q) => $q->where('utilisateur_id', $user->id))
                    ->where('date_fin', '<', now())
                    ->count(),
            ],
        ]);
    }

    private function adminDashboard(Request $request)
    {
        $stats_globales = [
            'total_evenements' => Evenement::count(),
            'publies' => Evenement::where('statut', 'publie')->count(),
            'en_attente' => Evenement::where('statut', 'en_attente')->count(),
            'total_participants' => InscriptionEvenement::count(),
            'total_certificats' => Certificat::count(),
            'taux_remplissage_moyen' => 75, // Placeholder
        ];

        return Inertia::render('m5/dashboard/Admin', [
            'stats_globales' => $stats_globales,
            'evenements_en_attente' => Evenement::where('statut', 'en_attente')->with('createur')->get(),
            'activite_recente' => [], // Placeholder
            'graphiques' => [
                'inscriptions_par_mois' => [
                    ['name' => 'Jan', 'value' => 400],
                    ['name' => 'Feb', 'value' => 300],
                    ['name' => 'Mar', 'value' => 600],
                    ['name' => 'Apr', 'value' => 800],
                ],
                'types_evenements' => [
                    ['name' => 'Conférences', 'value' => 65],
                    ['name' => 'Concours', 'value' => 35],
                ],
            ],
        ]);
    }
}
