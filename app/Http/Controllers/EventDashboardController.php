<?php

namespace App\Http\Controllers;

use App\Models\EventNotification;
use App\Models\Evenement;
use App\Models\InscriptionEvenement;
use App\Models\User;
use App\Services\UpcomingEventReminderService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class EventDashboardController extends Controller
{
    public function __construct(private UpcomingEventReminderService $reminders)
    {
    }

    public function index(Request $request)
    {
        $user = $request->user();
        abort_unless($user, 403);

        return Inertia::render('Dashboard', [
            'isAdmin' => $user->isAdmin(),
        ]);
    }

    public function eventDashboard(Request $request)
    {
        $user = $request->user();

        abort_unless($user, 403);
        $this->reminders->dispatchForUser($user);
        $relevantEventIds = $this->relevantEventsQuery($user)->pluck('evenements.id');
        $eventsCount = $relevantEventIds->count();
        $inscriptionsCount = InscriptionEvenement::query()
            ->whereIn('evenement_id', $relevantEventIds)
            ->count();
        $acceptedCount = InscriptionEvenement::query()
            ->whereIn('evenement_id', $relevantEventIds)
            ->where('statut', 'accepte')
            ->count();
        $upcomingCount = Evenement::query()
            ->whereIn('id', $relevantEventIds)
            ->where('date_debut', '>', now())
            ->count();
        $hasManagedEvents = Evenement::query()
            ->where('cree_par', $user->id)
            ->orWhereHas('assignments', fn (Builder $assignments) => $assignments
                ->where('user_id', $user->id)
                ->whereIn('role', ['organisateur', 'jury', 'intervenant']))
            ->exists();

        // Mes événements (créés par l'utilisateur) - pour tous les utilisateurs
        $mesEvenements = Evenement::query()
            ->with(['createur:id,name,email,role', 'roles', 'medias'])
            ->withCount(['inscriptions', 'comments', 'activities'])
            ->where('cree_par', $user->id)
            ->latest('date_debut')
            ->take(3)
            ->get()
            ->map(fn (Evenement $evenement) => $this->serializeEvenement($evenement, $user));

        // Pour les admins: tous les événements, pour les autres: seulement les leurs
        $allEventsForAdmin = $user->isAdmin()
            ? Evenement::query()
                ->with(['createur:id,name,email,role', 'roles', 'medias'])
                ->withCount(['inscriptions', 'comments', 'activities'])
                ->latest('date_debut')
                ->take(10)
                ->get()
                ->map(fn (Evenement $evenement) => $this->serializeEvenement($evenement, $user))
            : [];

        // Utilisateurs qui ont créé des événements ou sont assignés comme organisateur, jury, intervenant
        $eventActors = User::query()
            ->where('est_actif', true)
            ->where(function ($query) {
                // Ceux qui ont créé des événements
                $query->whereHas('evenementsCrees')
                    // Ou ceux qui sont assignés comme organisateur, jury, intervenant
                    ->orWhereHas('evenementAssignments', function ($assignments) {
                        $assignments->whereIn('role', ['organisateur', 'jury', 'intervenant']);
                    });
            })
            ->withCount('evenementsCrees as events_created_count')
            ->orderByDesc('events_created_count')
            ->take(10)
            ->get(['id', 'name', 'email', 'role'])
            ->map(function (User $actor) {
                // Récupérer les événements de cet utilisateur
                $events = Evenement::query()
                    ->with(['createur:id,name,email,role', 'roles', 'medias'])
                    ->withCount(['inscriptions', 'comments', 'activities'])
                    ->where(function ($query) use ($actor) {
                        $query->where('cree_par', $actor->id)
                            ->orWhereHas('assignments', fn ($a) => $a->where('user_id', $actor->id));
                    })
                    ->latest('date_debut')
                    ->take(5)
                    ->get()
                    ->map(fn (Evenement $e) => $this->serializeEvenement($e, request()->user()));

                return [
                    'id' => $actor->id,
                    'name' => $actor->name,
                    'email' => $actor->email,
                    'role' => $actor->role,
                    'events' => $events,
                    'events_count' => count($events),
                ];
            });

        $evenementsPopulaires = Evenement::query()
            ->with(['createur:id,name,email,role', 'roles', 'medias'])
            ->withCount(['inscriptions', 'comments', 'activities'])
            ->whereIn('id', $relevantEventIds)
            ->latest('date_debut')
            ->orderByDesc('inscriptions_count')
            ->take(4)
            ->get()
            ->map(fn (Evenement $evenement) => $this->serializeEvenement($evenement, $user));

        $recentInscriptions = InscriptionEvenement::query()
            ->with(['evenement.createur:id,name,email,role', 'evenement.roles', 'evenement.medias'])
            ->where('utilisateur_id', $user->id)
            ->latest()
            ->take(4)
            ->get()
            ->map(function (InscriptionEvenement $inscription) use ($user) {
                $evenement = $inscription->evenement;

                return $evenement
                    ? [
                        ...$this->serializeEvenement($evenement, $user),
                        'participation' => [
                            'id' => $inscription->id,
                            'statut' => $this->mapParticipationStatus($inscription->statut),
                            'backend_statut' => $inscription->statut,
                        ],
                    ]
                    : null;
            })
            ->filter()
            ->values();

        $analyticsSeries = collect(range(6, 0))
            ->map(function ($daysAgo) use ($relevantEventIds) {
                $date = now()->copy()->subDays($daysAgo);

                return [
                    'label' => $date->format('D'),
                    'date' => $date->toDateString(),
                    'inscriptions' => InscriptionEvenement::query()
                        ->whereIn('evenement_id', $relevantEventIds)
                        ->whereDate('created_at', $date)
                        ->count(),
                ];
            })
            ->values();

        $topActifs = Evenement::query()
            ->with(['createur:id,name,email,role', 'roles', 'medias'])
            ->withCount(['inscriptions', 'comments', 'activities'])
            ->whereIn('id', $relevantEventIds)
            ->orderByDesc('comments_count')
            ->orderByDesc('activities_count')
            ->take(4)
            ->get()
            ->map(fn (Evenement $evenement) => $this->serializeEvenement($evenement, $user));

        $recommended = Evenement::query()
            ->with(['createur:id,name,email,role', 'roles', 'medias'])
            ->withCount(['inscriptions', 'comments', 'activities'])
            ->where('statut', 'publie')
            ->where('date_debut', '>=', now()->startOfDay())
            ->where(function ($query) use ($user) {
                $query->whereDoesntHave('roles')
                    ->orWhereHas('roles', fn ($roles) => $roles->whereIn('role', ['tous', $user->role]));
            })
            ->orderByRaw('case when type = ? then 0 else 1 end', [
                in_array($user->role, ['enseignant', 'intervenant'], true) ? 'conference' : 'concours',
            ])
            ->orderByDesc('inscriptions_count')
            ->take(4)
            ->get()
            ->map(fn (Evenement $evenement) => $this->serializeEvenement($evenement, $user));

        $calendarEvents = Evenement::query()
            ->with(['createur:id,name,email,role', 'roles', 'medias'])
            ->withCount(['inscriptions', 'comments', 'activities'])
            ->whereIn('id', $relevantEventIds)
            ->whereBetween('date_debut', [now()->startOfDay(), now()->copy()->addMonth()->endOfDay()])
            ->orderBy('date_debut')
            ->take(12)
            ->get()
            ->map(fn (Evenement $evenement) => $this->serializeEvenement($evenement, $user));

        return Inertia::render('module5/EventDashboard', [
            'eventStats' => [
                'events_count' => $eventsCount,
                'inscriptions_count' => $inscriptionsCount,
                'upcoming_count' => $upcomingCount,
                'participation_rate' => $inscriptionsCount > 0
                    ? round(($acceptedCount / $inscriptionsCount) * 100, 1)
                    : 0,
            ],
            'analyticsSeries' => $analyticsSeries,
            'mesEvenements' => $mesEvenements,
            'evenementsPopulaires' => $evenementsPopulaires,
            'mesInscriptions' => $recentInscriptions,
            'topActifs' => $topActifs,
            'recommendations' => $recommended,
            'calendarEvents' => $calendarEvents,
            'notificationStats' => [
                'total' => EventNotification::query()->where('user_id', $user->id)->count(),
                'unread' => EventNotification::query()->where('user_id', $user->id)->whereNull('read_at')->count(),
                'upcoming_reminders' => EventNotification::query()
                    ->where('user_id', $user->id)
                    ->where('type', 'rappel_evenement')
                    ->count(),
            ],
            // Nouvelles données pour le dashboard amélioré
            'isAdmin' => $user->isAdmin(),
            'allEventsForAdmin' => $allEventsForAdmin,
            'eventActors' => $eventActors,
            'pendingEventsCount' => $user->isAdmin()
                ? Evenement::where('validation_status', 'pending')->whereNotNull('submitted_at')->count()
                : Evenement::where('cree_par', $user->id)->where('validation_status', 'pending')->whereNotNull('submitted_at')->count(),
            // Pour la page de gestion
            'mesEvenementsGestion' => Evenement::query()
                ->with(['createur:id,name,email,role', 'roles', 'medias'])
                ->withCount(['inscriptions', 'comments', 'activities'])
                ->when(!$user->isAdmin(), fn($q) => $q->where('cree_par', $user->id))
                ->latest('date_debut')
                ->get()
                ->map(fn(Evenement $e) => $this->serializeEvenement($e, $user)),
            // User roles and permissions for control panel
            'userRoles' => [$user->role],
            'userPermissions' => [
                'canManage' => $user->isAdmin(),
                'canManageMessages' => $user->isAdmin(),
                'canJuryMember' => false, // Will be determined per event
                'canPresident' => false, // Will be determined per event
            ],
            'dashboardMode' => [
                'isAdmin' => $user->isAdmin(),
                'canManageEvents' => $user->isAdmin() || $hasManagedEvents,
                'isParticipantView' => ! $user->isAdmin() && ! $hasManagedEvents,
            ],
        ]);
    }

    private function serializeEvenement(Evenement $evenement, User $user): array
    {
        $cover = $evenement->medias->firstWhere('type', 'image');

        return [
            'id' => $evenement->id,
            'titre' => $evenement->titre,
            'description' => $evenement->description,
            'type' => $evenement->type,
            'date_debut' => optional($evenement->date_debut)->toIso8601String(),
            'date_fin' => optional($evenement->date_fin)->toIso8601String(),
            'lieu' => $evenement->lieu,
            'statut' => $evenement->statut,
            'visibilite' => $evenement->visibilite,
            'public_cible' => $evenement->public_cible,
            'capacite_max' => $evenement->capacite_max,
            'participants_count' => $evenement->inscriptions_count,
            'comments_count' => $evenement->comments_count ?? 0,
            'activity_count' => $evenement->activities_count ?? 0,
            'cover_url' => $cover ? Storage::url($cover->chemin_fichier) : null,
            'roles' => $evenement->roles->pluck('role')->values(),
            'createur' => [
                'id' => $evenement->createur?->id,
                'name' => $evenement->createur?->name,
                'role' => $evenement->createur?->role,
            ],
            'participation' => null,
            'can_join' => $user ? $this->canJoin($evenement, $user) : false,
        ];
    }

    private function mapParticipationStatus(string $status): string
    {
        return match ($status) {
            'accepte' => 'participe',
            'en_attente' => 'interesse',
            default => 'refuse',
        };
    }

    private function canJoin(Evenement $evenement, User $user): bool
    {
        if ($evenement->cree_par === $user->id || $user->isAdmin() || $evenement->statut === 'cloture') {
            return false;
        }

        $roles = $evenement->roles->pluck('role');

        if ($roles->isEmpty()) {
            return true;
        }

        return $roles->contains('tous') || $roles->contains($user->role);
    }

    private function relevantEventsQuery(User $user): Builder
    {
        return Evenement::query()
            ->when(! $user->isAdmin(), function (Builder $builder) use ($user) {
                $builder->where(function (Builder $query) use ($user) {
                    $query->where('cree_par', $user->id)
                        ->orWhereHas('assignments', fn (Builder $assignments) => $assignments->where('user_id', $user->id))
                        ->orWhereHas('inscriptions', fn (Builder $inscriptions) => $inscriptions->where('utilisateur_id', $user->id));
                });
            });
    }
}
