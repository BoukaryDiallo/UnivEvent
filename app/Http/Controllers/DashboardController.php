<?php

namespace App\Http\Controllers;

use App\Models\EventNotification;
use App\Models\Evenement;
use App\Models\InscriptionEvenement;
use App\Services\UpcomingEventReminderService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __construct(private UpcomingEventReminderService $reminders)
    {
    }

    public function index(Request $request)
    {
        $user = $request->user();

        abort_unless($user, 403);
        $this->reminders->dispatchForUser($user);

        $mesEvenements = Evenement::query()
            ->with(['createur:id,name,email,role', 'roles', 'medias'])
            ->withCount(['inscriptions', 'comments', 'activities'])
            ->where('cree_par', $user->id)
            ->latest('date_debut')
            ->take(3)
            ->get()
            ->map(fn (Evenement $evenement) => $this->serializeEvenement($evenement, $user));

        $evenementsPopulaires = Evenement::query()
            ->with(['createur:id,name,email,role', 'roles', 'medias'])
            ->withCount(['inscriptions', 'comments', 'activities'])
            ->when(! $user->isAdmin(), function ($builder) use ($user) {
                $builder->where(function ($query) use ($user) {
                    $query->where('cree_par', $user->id)
                        ->orWhereDoesntHave('roles')
                        ->orWhereHas('roles', fn ($roles) => $roles->whereIn('role', ['tous', $user->role]));
                });
            })
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
            ->map(function ($daysAgo) {
                $date = now()->copy()->subDays($daysAgo);

                return [
                    'label' => $date->format('D'),
                    'date' => $date->toDateString(),
                    'inscriptions' => InscriptionEvenement::whereDate('created_at', $date)->count(),
                ];
            })
            ->values();

        $topActifs = Evenement::query()
            ->with(['createur:id,name,email,role', 'roles', 'medias'])
            ->withCount(['inscriptions', 'comments', 'activities'])
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
            ->whereBetween('date_debut', [now()->startOfDay(), now()->copy()->addMonth()->endOfDay()])
            ->when(! $user->isAdmin(), function ($builder) use ($user) {
                $builder->where(function ($query) use ($user) {
                    $query->where('cree_par', $user->id)
                        ->orWhereDoesntHave('roles')
                        ->orWhereHas('roles', fn ($roles) => $roles->whereIn('role', ['tous', $user->role]));
                });
            })
            ->orderBy('date_debut')
            ->take(12)
            ->get()
            ->map(fn (Evenement $evenement) => $this->serializeEvenement($evenement, $user));

        return Inertia::render('dashboard', [
            'eventStats' => [
                'events_count' => Evenement::count(),
                'inscriptions_count' => InscriptionEvenement::count(),
                'upcoming_count' => Evenement::where('date_debut', '>', now())->count(),
                'participation_rate' => Evenement::count() > 0
                    ? round((InscriptionEvenement::where('statut', 'accepte')->count() / max(Evenement::count(), 1)) * 100, 1)
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
        ]);
    }

    private function serializeEvenement(Evenement $evenement, $user): array
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

    private function canJoin(Evenement $evenement, $user): bool
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
}
