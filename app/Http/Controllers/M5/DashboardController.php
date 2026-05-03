<?php

namespace App\Http\Controllers\M5;

use App\Http\Controllers\Controller;
use App\Models\Evenement;
use App\Models\InscriptionEvenement;
use App\Models\Certificat;
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
            'enseignant' => $this->participantDashboard($request),
            'etudiant' => $this->participantDashboard($request),
            default => $this->participantDashboard($request),
        };
    }

    private function organizerDashboard(Request $request)
    {
        $user = Auth::user();
        
        // Base Query for Events
        $eventsQuery = Evenement::where('cree_par', $user->id);
        $totalEventsCount = $eventsQuery->count();
        
        // Detailed data for drill-downs
        $mes_evenements = (clone $eventsQuery)
            ->withCount(['inscriptions', 'comments'])
            ->latest()
            ->get();

        $inscriptions = InscriptionEvenement::whereIn('evenement_id', $eventsQuery->pluck('id'))
            ->with(['utilisateur', 'evenement'])
            ->latest()
            ->get()
            ->map(fn($ins) => [
                'id' => $ins->id,
                'user' => [
                    'id' => $ins->utilisateur->id,
                    'name' => $ins->utilisateur->name,
                    'email' => $ins->utilisateur->email,
                ],
                'event_title' => $ins->evenement->titre,
                'event_id' => $ins->evenement->id,
                'statut' => $ins->statut,
                'is_waitlist' => (bool)$ins->is_waitlist,
                'waitlist_position' => $ins->waitlist_position,
                'registered_at' => $ins->created_at->format('d/m/Y H:i'),
                'has_cv' => (bool)($ins->donnees_formulaire['cv_path'] ?? false),
            ]);

        $prochains_evenements = (clone $eventsQuery)
            ->where('date_debut', '>', now())
            ->orderBy('date_debut')
            ->get();

        // Calculate Validation Rate
        $totalRegistrations = $inscriptions->count();
        $validatedRegistrations = $inscriptions->where('statut', 'accepte')->count();
        $validationRate = $totalRegistrations > 0 ? round(($validatedRegistrations / $totalRegistrations) * 100, 1) : 0;

        return Inertia::render('m5/dashboard/Organisateur', [
            'mes_evenements' => $mes_evenements,
            'inscriptions' => $inscriptions,
            'stats' => [
                'total_events' => $totalEventsCount,
                'total_inscriptions' => $totalRegistrations,
                'upcoming_count' => $prochains_evenements->count(),
                'validation_rate' => $validationRate,
            ],
            'prochains_evenements' => $prochains_evenements,
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
        // For Admin, "Your Perimeter" = Everything
        $allEvents = Evenement::withCount('inscriptions')->get();
        $allInscriptions = InscriptionEvenement::with(['utilisateur', 'evenement'])->latest()->get();
        
        $totalInscriptions = $allInscriptions->count();
        $validatedInscriptions = $allInscriptions->where('statut', 'accepte')->count();

        return Inertia::render('m5/dashboard/Organisateur', [ // Admins use the same rich dashboard
            'mes_evenements' => $allEvents,
            'inscriptions' => $allInscriptions->map(fn($ins) => [
                'id' => $ins->id,
                'user' => ['id' => $ins->utilisateur->id, 'name' => $ins->utilisateur->name, 'email' => $ins->utilisateur->email],
                'event_title' => $ins->evenement->titre,
                'event_id' => $ins->evenement->id,
                'statut' => $ins->statut,
                'is_waitlist' => (bool)$ins->is_waitlist,
                'waitlist_position' => $ins->waitlist_position,
                'registered_at' => $ins->created_at->format('d/m/Y H:i'),
                'has_cv' => false,
            ]),
            'stats' => [
                'total_events' => $allEvents->count(),
                'total_inscriptions' => $totalInscriptions,
                'upcoming_count' => Evenement::where('date_debut', '>', now())->count(),
                'validation_rate' => $totalInscriptions > 0 ? round(($validatedInscriptions / $totalInscriptions) * 100, 1) : 0,
            ],
            'prochains_evenements' => Evenement::where('date_debut', '>', now())->orderBy('date_debut')->limit(10)->get(),
        ]);
    }
}
