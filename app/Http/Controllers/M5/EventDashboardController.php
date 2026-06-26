<?php

namespace App\Http\Controllers\M5;

use App\Http\Controllers\Controller;
use App\Models\Certificat;
use App\Models\Evenement;
use App\Models\EvenementActivity;
use App\Models\EvenementRole;
use App\Models\EventType;
use App\Models\InscriptionEvenement;
use App\Models\User;
use App\Support\DatabaseHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class EventDashboardController extends Controller
{
    public function index(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();

        // Check if user has any event-specific assignments
        $assignments = EvenementRole::where('user_id', $user->id);
        $assignedRoles = $assignments->pluck('role')->unique()->toArray();

        // If user is admin, show everything
        if ($user->role === 'admin') {
            return $this->adminDashboard($request);
        }

        // If user is assigned as jury, priority to jury view or combined?
        // Let's decide based on active roles
        if (in_array('jury', $assignedRoles)) {
            return $this->juryDashboard($request);
        }

        return match ($user->role) {
            'organisateur' => $this->organizerDashboard($request),
            'enseignant' => $this->participantDashboard($request),
            'etudiant' => $this->participantDashboard($request),
            default => $this->participantDashboard($request),
        };
    }

    private function organizerDashboard(Request $request)
    {
        $user = Auth::user();

        // Include events created by user OR assigned as organizer
        $eventsQuery = Evenement::where('cree_par', $user->id)
            ->orWhereHas('roles', fn ($q) => $q->where('user_id', $user->id)->where('role', 'organisateur'));

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
            ->map(fn ($ins) => [
                'id' => $ins->id,
                'user' => [
                    'id' => $ins->utilisateur->id,
                    'name' => $ins->utilisateur->name,
                    'email' => $ins->utilisateur->email,
                ],
                'event_title' => $ins->evenement->titre,
                'event_id' => $ins->evenement->id,
                'statut' => $ins->statut,
                'is_waitlist' => (bool) $ins->is_waitlist,
                'waitlist_position' => $ins->waitlist_position,
                'registered_at' => $ins->created_at->format('d/m/Y H:i'),
                'has_cv' => (bool) ($ins->donnees_formulaire['cv_path'] ?? false),
            ]);

        $prochains_evenements = (clone $eventsQuery)
            ->where('date_debut', '>', now())
            ->orderBy('date_debut')
            ->get();

        // Fetch Activities for these events
        $actualites = EvenementActivity::whereIn('evenement_id', $eventsQuery->pluck('id'))
            ->with(['user:id,name', 'evenement:id,titre'])
            ->latest()
            ->take(15)
            ->get();

        // Calculate Validation Rate
        $totalRegistrations = $inscriptions->count();
        $validatedRegistrations = $inscriptions->where('statut', 'accepte')->count();
        $validationRate = $totalRegistrations > 0 ? round(($validatedRegistrations / $totalRegistrations) * 100, 1) : 0;

        return Inertia::render('module5/organisateur/Index', [
            'mes_evenements' => $mes_evenements,
            'inscriptions' => $inscriptions,
            'stats' => [
                'total_events' => $totalEventsCount,
                'total_inscriptions' => $totalRegistrations,
                'upcoming_count' => $prochains_evenements->count(),
                'validation_rate' => $validationRate,
            ],
            'prochains_evenements' => $prochains_evenements,
            'actualites' => $actualites,
        ]);
    }

    private function juryDashboard(Request $request)
    {
        $user = Auth::user();

        $assignedEvents = Evenement::whereHas('roles', fn ($q) => $q->where('user_id', $user->id)->where('role', 'jury'))
            ->with(['juryPanel.criteria'])
            ->withCount(['inscriptions'])
            ->get();

        // Simulate some data for now to match component props
        $concours_assignes = $assignedEvents->map(fn ($event) => [
            'concours' => [
                'id' => $event->id,
                'titre' => $event->titre,
                'date_deliberation' => $event->date_debut->format('d/m/Y'),
            ],
            'role_jury' => $event->roles()->where('user_id', $user->id)->first()?->is_president_jury ? 'president' : 'membre',
            'statut' => $event->competition_status,
        ]);

        $actualites = EvenementActivity::whereIn('evenement_id', $assignedEvents->pluck('id'))
            ->with(['user:id,name', 'evenement:id,titre'])
            ->latest()
            ->take(15)
            ->get();

        return Inertia::render('module5/jury/Index', [
            'concours_assignes' => $concours_assignes,
            'candidatures_a_evaluer' => [],
            'deliberations' => [],
            'actualites' => $actualites,
            'stats' => [
                'concours_actifs' => $assignedEvents->where('statut', 'publie')->count(),
                'candidatures_evaluees' => 0,
                'candidatures_restantes' => $assignedEvents->sum('inscriptions_count'),
            ],
        ]);
    }

    private function participantDashboard(Request $request)
    {
        $user = Auth::user();
        $mes_inscriptions = InscriptionEvenement::where('utilisateur_id', $user->id)
            ->with(['evenement' => function ($query) {
                $query->with(['programmes', 'medias', 'messages']);
            }])
            ->get()
            ->each(function ($inscription) {
                if ($inscription->evenement) {
                    $inscription->evenement->setRelation('current_inscription', (object) [
                        'id' => $inscription->id,
                        'backend_statut' => $inscription->statut,
                        'is_waitlist' => (bool) $inscription->is_waitlist,
                        'waitlist_position' => $inscription->waitlist_position,
                    ]);
                }
            });

        $mes_certificats = Certificat::where('utilisateur_id', $user->id)
            ->with('evenement')
            ->get();

        $evenements_suggeres = Evenement::where('statut', 'publie')
            ->where('date_debut', '>', now())
            ->limit(6)
            ->get();

        $actualites = EvenementActivity::whereIn('evenement_id', $mes_inscriptions->pluck('evenement_id'))
            ->with(['user:id,name', 'evenement:id,titre'])
            ->latest()
            ->take(15)
            ->get();

        $totalInscriptions = $mes_inscriptions->count();
        $upcomingEventsCount = $mes_inscriptions
            ->filter(fn ($inscription) => $inscription->evenement && $inscription->evenement->date_debut > now())
            ->pluck('evenement.id')
            ->unique()
            ->count();

        return Inertia::render('module5/participants/Index', [
            'mes_inscriptions' => $mes_inscriptions,
            'mes_certificats' => $mes_certificats,
            'evenements_suggeres' => $evenements_suggeres,
            'actualites' => $actualites,
            'stats' => [
                'total_inscriptions' => $totalInscriptions,
                'total_certificats' => $mes_certificats->count(),
                'prochains_evenements' => $upcomingEventsCount,
                'inscrits' => $totalInscriptions,
                'en_attente' => $mes_inscriptions->where('statut', 'en_attente')->count(),
                'certificats_disponibles' => $mes_certificats->count(),
                'evenements_termines' => Evenement::whereHas('inscriptions', fn ($q) => $q->where('utilisateur_id', $user->id))
                    ->where('date_fin', '<', now())
                    ->count(),
            ],
        ]);
    }

    private function adminDashboard(Request $request)
    {
        $allEvents = Evenement::with(['createur'])->withCount('inscriptions')->get();
        $allInscriptions = InscriptionEvenement::with(['utilisateur', 'evenement'])->latest()->get();
        $totalEvents = $allEvents->count();
        $publishedEvents = $allEvents->where('statut', 'publie');
        $pendingEvents = $allEvents->where('statut', 'en_attente');
        $totalParticipants = $allInscriptions->count();
        $totalCertificats = Certificat::count();
        $validatedInscriptions = $allInscriptions->where('statut', 'accepte')->count();

        $inscriptionsParMois = DatabaseHelper::groupByYearMonth(
            InscriptionEvenement::query(),
            'created_at'
        )->get()
            ->map(fn ($row) => [
                'name' => sprintf('%04d-%02d', (int) $row->year, (int) $row->month),
                'value' => $row->value,
            ]);

        $typesEvenements = Evenement::select('type', DB::raw('COUNT(*) as value'))
            ->groupBy('type')
            ->get()
            ->map(fn ($row) => [
                'name' => ucfirst($row->type),
                'value' => $row->value,
            ]);

        $actualites = EvenementActivity::with(['user:id,name', 'evenement:id,titre'])
            ->latest()
            ->take(20)
            ->get();

        return Inertia::render('module5/admin/Index', [
            'stats_globales' => [
                'total_evenements' => $totalEvents,
                'publies' => $publishedEvents->count(),
                'en_attente' => $pendingEvents->count(),
                'total_participants' => $totalParticipants,
                'total_certificats' => $totalCertificats,
                'taux_remplissage_moyen' => $publishedEvents->count() > 0
                    ? round($publishedEvents->avg(function ($event) {
                        return $event->capacite_max > 0
                            ? min(100, ($event->inscriptions_count / $event->capacite_max) * 100)
                            : 0;
                    }), 1)
                    : 0,
            ],
            'evenements_en_attente' => $pendingEvents->map(fn ($event) => [
                'id' => $event->id,
                'titre' => $event->titre,
                'type' => $event->type,
                'createur' => [
                    'name' => $event->createur?->name,
                ],
            ]),
            'activite_recente' => $allInscriptions->take(8)->map(fn ($ins) => [
                'user' => ['name' => $ins->utilisateur->name],
                'action' => "s'est inscrit à {$ins->evenement->titre}",
                'created_at' => $ins->created_at->format('d/m/Y H:i'),
            ]),
            'graphiques' => [
                'inscriptions_par_mois' => $inscriptionsParMois,
                'types_evenements' => $typesEvenements,
            ],
            'event_types' => EventType::all(),
            'actualites' => $actualites,
        ]);
    }
}
