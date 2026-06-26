<?php

namespace App\Http\Controllers;

use App\Concerns\MapsParticipationStatus;
use App\Events\EventStatusUpdated;
use App\Http\Requests\ExpressEvenementRequest;
use App\Http\Requests\StoreEvenementRequest;
use App\Http\Resources\EvenementResource;
use App\Models\Evenement;
use App\Models\EvenementActivity;
use App\Models\EvenementMedia;
use App\Models\EvenementRole;
use App\Models\JuryPanel;
use App\Models\Programme;
use App\Models\User;
use App\Services\EventAuthorizationService;
use App\Services\EventCompletionService;
use App\Services\EventManagementService;
use App\Services\EventNotificationService;
use App\Services\EventPermissionService;
use App\Services\EventRoleService;
use App\Services\EventService;
use App\Services\EventValidationService;
use App\Services\JuryWorkflowService;
use App\Services\MediaService;
use App\Services\ProgramService;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class EvenementController extends Controller
{
    use MapsParticipationStatus;

    private const ASSIGNMENT_ROLES = ['organisateur', 'participant', 'intervenant', 'jury'];

    public function __construct(
        private EventNotificationService $notifications,
        private EventAuthorizationService $authorization,
        private EventManagementService $eventManagementService,
        private EventService $eventService,
        private EventCompletionService $completionService,
        private JuryWorkflowService $juryWorkflow,
        private EventValidationService $validationService,
        private EventRoleService $roleService,
        private EventPermissionService $permissionService,
        private ProgramService $programService,
        private MediaService $mediaService,
    ) {}

    public function index(Request $request)
    {
        $user = $request->user();
        $filters = [
            'search' => (string) $request->string('search'),
            'scope' => $request->string('scope')->value() ?: 'upcoming',
            'type' => $request->string('type')->value() ?: 'all',
            'statut' => $request->string('statut')->value() ?: 'all',
            'date' => $request->string('date')->value() ?: 'all',
        ];
        $hasManagedEvents = $user
            ? Evenement::query()
                ->where('cree_par', $user->id)
                ->orWhereHas('assignments', fn ($assignments) => $assignments
                    ->where('user_id', $user->id)
                    ->whereIn('role', ['organisateur', 'jury', 'intervenant']))
                ->exists()
            : false;

        $query = Evenement::query()
            ->with(['createur:id,name,email,role', 'roles', 'medias'])
            ->withCount(['inscriptions', 'comments', 'activities'])
            ->when($user, fn ($builder) => $builder->with([
                'inscriptions' => fn ($relation) => $relation
                    ->where('utilisateur_id', $user->id)
                    ->latest(),
            ]))
            ->when($user && ! $user->isAdmin(), function ($builder) use ($user) {
                $builder->where('validation_status', 'approved')
                    ->where(function ($query) use ($user) {
                        $query->where('cree_par', $user->id)
                            ->orWhereHas('assignments', fn ($assignments) => $assignments->where('user_id', $user->id))
                            ->orWhere('visibilite', 'public')
                            ->orWhereDoesntHave('roles')
                            ->orWhereHas('roles', fn ($roles) => $roles->whereIn('role', ['tous', $user->role]))
                            ->orWhere('public_cible', 'tous')
                            ->orWhere('public_cible', $user->role);
                    });
            })
            ->when(! $user, fn ($builder) => $builder->where('statut', 'publie')->where('validation_status', 'approved'))
            ->when($filters['search'] !== '', function ($builder) use ($filters) {
                $builder->where(function ($query) use ($filters) {
                    $query->where('titre', 'like', '%'.$filters['search'].'%')
                        ->orWhere('lieu', 'like', '%'.$filters['search'].'%')
                        ->orWhere('type', 'like', '%'.$filters['search'].'%');
                });
            })
            ->when($filters['type'] !== 'all', fn ($builder) => $builder->where('type', $filters['type']))
            ->when($filters['statut'] !== 'all', fn ($builder) => $builder->where('statut', $filters['statut']))
            ->when($filters['scope'] === 'upcoming', fn ($builder) => $builder->where('date_debut', '>', now()))
            ->when($filters['scope'] === 'ongoing', function ($builder) {
                $builder->where('date_debut', '<=', now())
                    ->where(function ($query) {
                        $query->whereNull('date_fin')
                            ->orWhere('date_fin', '>=', now());
                    });
            })
            ->when($filters['scope'] === 'past', function ($builder) {
                $builder->where(function ($query) {
                    $query->whereNotNull('date_fin')
                        ->where('date_fin', '<', now());
                });
            })
            ->when($filters['date'] === 'today', fn ($builder) => $builder->whereDate('date_debut', now()->toDateString()))
            ->when($filters['date'] === 'week', fn ($builder) => $builder->whereBetween('date_debut', [now()->startOfDay(), now()->copy()->addDays(7)->endOfDay()]))
            ->when($filters['date'] === 'month', fn ($builder) => $builder->whereBetween('date_debut', [now()->startOfDay(), now()->copy()->addMonth()->endOfDay()]))
            ->latest('date_debut');

        $discoveryQuery = Evenement::query()
            ->with(['createur:id,name,email,role', 'roles', 'medias'])
            ->withCount(['inscriptions', 'comments', 'activities'])
            ->when($user, fn ($builder) => $builder->with([
                'inscriptions' => fn ($relation) => $relation
                    ->where('utilisateur_id', $user->id)
                    ->latest(),
            ]))
            ->where('statut', 'publie')
            ->where('validation_status', 'approved')
            ->where('date_debut', '>=', now()->subDays(7))
            ->when($user && ! $user->isAdmin(), function ($builder) use ($user) {
                $builder->where(function ($query) use ($user) {
                    $query->where('cree_par', $user->id)
                        ->orWhereHas('assignments', fn ($assignments) => $assignments->where('user_id', $user->id))
                        ->orWhere('visibilite', 'public')
                        ->orWhereDoesntHave('roles')
                        ->orWhereHas('roles', fn ($roles) => $roles->whereIn('role', ['tous', $user->role]))
                        ->orWhere('public_cible', 'tous')
                        ->orWhere('public_cible', $user->role);
                });
            });

        $evenements = EvenementResource::collection($query->paginate(9)->withQueryString());
        $statsScope = Evenement::query()
            ->when($user && ! $user->isAdmin(), function ($builder) use ($user) {
                $builder->where(function ($query) use ($user) {
                    $query->where('cree_par', $user->id)
                        ->orWhereHas('assignments', fn ($assignments) => $assignments->where('user_id', $user->id))
                        ->orWhereHas('inscriptions', fn ($inscriptions) => $inscriptions->where('utilisateur_id', $user->id));
                });
            });

        $recommendations = $user
            ? EvenementResource::collection($this->recommendedEvents($user))
            : [];

        $recentEvents = EvenementResource::collection(
            (clone $discoveryQuery)->latest()->take(10)->get()
        );

        $influentialEvents = EvenementResource::collection(
            (clone $discoveryQuery)
                ->orderByRaw('(inscriptions_count * 5) + (comments_count * 3) + (activities_count * 2) DESC')
                ->take(10)
                ->get()
        );

        return Inertia::render('evenements/Index', [
            'evenements' => $evenements,
            'filters' => $filters,
            'stats' => [
                'total' => (clone $statsScope)->count(),
                'published' => (clone $statsScope)->where('statut', 'publie')->count(),
                'upcoming' => (clone $statsScope)->where('date_debut', '>', now())->count(),
            ],
            'catalogMode' => [
                'isAdmin' => (bool) $user?->isAdmin(),
                'canManageEvents' => (bool) ($user && ($user->isAdmin() || $hasManagedEvents)),
                'isParticipantView' => (bool) ($user && ! $user->isAdmin() && ! $hasManagedEvents),
            ],
            'availableRoles' => $this->availableRoles(),
            'recommendations' => $recommendations,
            'recentEvents' => $recentEvents,
            'influentialEvents' => $influentialEvents,
        ]);
    }

    public function create(Request $request)
    {
        $this->authorize('create', Evenement::class);

        return Inertia::render('evenements/Create', [
            'meta' => $this->formMeta(),
            'eventType' => 'conference',
        ]);
    }

    public function store(ExpressEvenementRequest $request)
    {
        $this->authorize('create', Evenement::class);
        $validated = $request->validated();
        $this->ensureNoConflict($validated);
        $evenement = $this->eventService->createExpress($request->user(), $validated);
        $this->eventManagementService->storeBanner($request, $evenement);

        return redirect()->route('evenements.manage', $evenement)
            ->with('status', 'event_created');
    }

    public function show(Request $request, Evenement $evenement)
    {
        $this->authorizeAction($evenement, $request->user());

        $relations = [
            'createur',
            'roles',
            'assignments.user',
            'medias',
            'programmes',
            'activities.user',
            'inscriptions.utilisateur',
            'comments.user',
            'comments.replies.user',
            'comments.reactions',
            'comments.replies.reactions',
            'messages.user',
            'messages.replies.user',
            'resultats.utilisateur',
            'moderationRestrictions.creator',
            'certificats',
        ];

        if ($evenement->type === 'concours') {
            $relations = array_merge($relations, ['juryPanel.criteria', 'juryPanel.deliberations', 'juryPanel.scores']);
        }

        $evenement->load($relations);
        $evenement->loadCount(['inscriptions', 'comments', 'activities']);

        $viewer = $request->user();
        $currentInscription = $viewer
            ? $evenement->inscriptions->firstWhere('utilisateur_id', $viewer->id)
            : null;
        $canSeeFullResults = $viewer
            && (
                $this->authorization->isAdminOrCreator($evenement, $viewer)
                || $this->authorization->canManageResults($evenement, $viewer)
                || $this->authorization->isJuryMember($evenement, $viewer)
            );
        $myResult = $viewer
            ? $evenement->resultats->firstWhere('utilisateur_id', $viewer->id)
            : null;
        $visibleResults = $canSeeFullResults
            ? $evenement->resultats
            : collect(
                $evenement->results_published_at && $evenement->allow_participant_result_tracking && $myResult
                    ? [$myResult]
                    : []
            );
        $myCertificate = $viewer
            ? $evenement->certificats
                ->where('utilisateur_id', $viewer->id)
                ->sortByDesc('id')
                ->first()
            : null;

        $eventData = (new EvenementResource($evenement))->resolve();
        $eventData['validation_status'] = $evenement->validation_status;
        $eventData['workflow_state'] = $this->eventService->workflowState($evenement);
        $eventData['participants'] = $evenement->inscriptions
            ->map(fn ($inscription) => [
                'id' => $inscription->id,
                'statut' => $this->mapParticipationStatus($inscription->statut),
                'backend_statut' => $inscription->statut,
                'is_waitlist' => (bool) $inscription->is_waitlist,
                'waitlist_position' => $inscription->waitlist_position,
                'user_id' => $inscription->utilisateur_id,
                'user' => [
                    'id' => $inscription->utilisateur?->id,
                    'name' => $inscription->utilisateur?->name,
                    'email' => $inscription->utilisateur?->email,
                    'role' => $inscription->utilisateur?->role,
                ],
            ])
            ->values()
            ->all();
        $eventData['programmes'] = $evenement->programmes
            ->map(fn ($programme) => [
                'id' => $programme->id,
                'titre' => $programme->titre,
                'description' => $programme->description,
                'intervenant' => $programme->intervenant,
                'date_programme' => $programme->date_programme?->toDateString(),
                'heure_debut' => $programme->heure_debut,
                'heure_fin' => $programme->heure_fin,
                'salle' => $programme->salle,
                'type_section' => $programme->type_section,
                'ordre' => $programme->ordre,
            ])
            ->sortBy('ordre')
            ->values()
            ->all();
        $eventData['activities'] = $evenement->activities
            ->map(fn ($activity) => [
                'id' => $activity->id,
                'type' => $activity->type,
                'label' => $activity->label,
                'description' => $activity->description,
                'created_at' => optional($activity->created_at)->toIso8601String(),
                'user' => [
                    'id' => $activity->user?->id,
                    'name' => $activity->user?->name,
                    'role' => $activity->user?->role,
                ],
            ])
            ->values()
            ->all();
        $eventData['comments'] = $evenement->comments
            ->map(fn ($comment) => $this->serializeComment($comment, $viewer?->id))
            ->values()
            ->all();
        $eventData['messages'] = $evenement->messages
            ->map(fn ($message) => [
                'id' => $message->id,
                'type' => $message->type,
                'contenu' => $message->contenu,
                'status' => $message->status,
                'is_pinned' => (bool) $message->is_pinned,
                'created_at' => optional($message->created_at)->toIso8601String(),
                'user' => [
                    'id' => $message->user?->id,
                    'name' => $message->user?->name,
                    'email' => $message->user?->email,
                    'role' => $message->user?->role,
                ],
                'replies' => $message->replies->map(fn ($reply) => [
                    'id' => $reply->id,
                    'type' => $reply->type,
                    'contenu' => $reply->contenu,
                    'status' => $reply->status,
                    'created_at' => optional($reply->created_at)->toIso8601String(),
                    'user' => [
                        'id' => $reply->user?->id,
                        'name' => $reply->user?->name,
                        'email' => $reply->user?->email,
                        'role' => $reply->user?->role,
                    ],
                ])->values()->all(),
            ])
            ->values()
            ->all();
        $eventData['access'] = $this->serializeAccessPass($evenement, $currentInscription);
        $eventData['medias'] = $this->mediaService->getMediaForEvent($evenement, $viewer);
        $eventData['team'] = $this->serializeAssignments($evenement->assignments);
        $eventData['moderation'] = [
            'restrictions' => $evenement->moderationRestrictions
                ->whereNull('lifted_at')
                ->map(fn ($restriction) => [
                    'id' => $restriction->id,
                    'user_id' => $restriction->user_id,
                    'comments_blocked' => (bool) $restriction->comments_blocked,
                    'replies_blocked' => (bool) $restriction->replies_blocked,
                    'messages_blocked' => (bool) $restriction->messages_blocked,
                    'muted' => (bool) $restriction->muted,
                    'reason' => $restriction->reason,
                    'expires_at' => optional($restriction->expires_at)->toIso8601String(),
                    'created_by' => $restriction->creator?->name,
                ])
                ->values()
                ->all(),
        ];
        $eventData['jury'] = $this->serializeJuryPanel($evenement->juryPanel, $evenement, $viewer);
        $eventData['resultats'] = $visibleResults
            ->map(function ($result) use ($evenement) {
                $certificate = $evenement->certificats->firstWhere('utilisateur_id', $result->utilisateur_id);

                return [
                    'id' => $result->id,
                    'note' => (float) $result->note,
                    'classement' => $result->classement,
                    'admission' => $result->admission,
                    'mention' => $result->mention,
                    'criteria_breakdown' => $result->criteria_breakdown ?? [],
                    'certificate_url' => $certificate?->fichier ? Storage::url($certificate->fichier) : null,
                    'user' => [
                        'id' => $result->utilisateur?->id,
                        'name' => $result->utilisateur?->name,
                        'email' => $result->utilisateur?->email,
                        'role' => $result->utilisateur?->role,
                    ],
                ];
            })
            ->values()
            ->all();
        $eventData['my_result'] = $myResult ? [
            'id' => $myResult->id,
            'note' => (float) $myResult->note,
            'classement' => $myResult->classement,
            'admission' => $myResult->admission,
            'mention' => $myResult->mention,
            'criteria_breakdown' => $myResult->criteria_breakdown ?? [],
            'certificate_url' => $myCertificate?->fichier ? Storage::url($myCertificate->fichier) : null,
            'user' => [
                'id' => $myResult->utilisateur?->id,
                'name' => $myResult->utilisateur?->name,
                'email' => $myResult->utilisateur?->email,
                'role' => $myResult->utilisateur?->role,
            ],
        ] : null;
        $eventData['certificate'] = $myCertificate ? [
            'id' => $myCertificate->id,
            'url' => $myCertificate->fichier ? Storage::url($myCertificate->fichier) : route('certificats.show', $myCertificate),
            'statut' => $myCertificate->statut,
        ] : null;

        return Inertia::render('evenements/Show', [
            'evenement' => $eventData,
            'can' => [
                ...$this->authorization->getPermissions($evenement, $viewer),
                'join' => $this->canJoin($evenement, $viewer),
            ],
            'meta' => $this->formMeta(),
            'recommendations' => $viewer
                ? EvenementResource::collection($this->recommendedEvents($viewer, $evenement->id))->resolve()
                : [],
        ]);
    }
    // ... Suppression de centaines de lignes de sérialisation manuelle ...

    public function update(StoreEvenementRequest $request, Evenement $evenement)
    {
        if (! $evenement->exists) {
            $evenement = Evenement::findOrFail($request->route('evenement'));
        }

        $this->authorize('update', $evenement);
        $validated = $request->validated();
        $this->ensureNoConflict($validated, $evenement->id);
        $shouldResetValidation = in_array($evenement->validation_status, ['approved', 'rejected'], true);

        $evenement = DB::transaction(function () use ($request, $validated, $evenement) {
            $evenement->update([
                'titre' => $validated['titre'],
                'description' => $validated['description'] ?? $evenement->description,
                'type' => $validated['type'],
                'date_debut' => $validated['date_debut'],
                'date_fin' => $validated['date_fin'] ?? $evenement->date_fin,
                'lieu' => $validated['lieu'] ?? $evenement->lieu,
                'lien_live' => $validated['lien_live'] ?? $evenement->lien_live,
                'visibilite' => $validated['visibilite'] ?? $evenement->visibilite,
                'public_cible' => $validated['public_cible'] ?? $evenement->public_cible,
                'statut' => $validated['statut'] ?? $evenement->statut,
                'inscription_requise' => $request->boolean('inscription_requise', $evenement->inscription_requise),
                'capacite_max' => $validated['capacite_max'] ?? $evenement->capacite_max,
                'checkin_active' => $request->boolean('checkin_active', $evenement->checkin_active),
                'comments_enabled' => $request->boolean('comments_enabled', $evenement->comments_enabled),
                'comment_replies_enabled' => $request->boolean('comment_replies_enabled', $evenement->comment_replies_enabled),
                'comment_reactions_enabled' => $request->boolean('comment_reactions_enabled', $evenement->comment_reactions_enabled),
                'comment_policy' => $validated['comment_policy'] ?? $evenement->comment_policy,
                'messages_enabled' => $request->boolean('messages_enabled', $evenement->messages_enabled),
                'evenement_certifie' => $request->boolean('evenement_certifie', $evenement->evenement_certifie),
                'allow_participant_result_tracking' => $request->boolean('allow_participant_result_tracking', $evenement->allow_participant_result_tracking),
                'certificate_template_schema' => $validated['certificate_template_schema'] ?? $evenement->certificate_template_schema,
                'certificate_template_version' => $validated['certificate_template_version'] ?? $evenement->certificate_template_version,
                'competition_status' => $validated['competition_status'] ?? $evenement->competition_status,
            ]);

            $this->syncRoles($evenement, $validated['roles'] ?? []);
            $this->eventManagementService->syncAssignments($evenement, $validated['assigned_users'] ?? []);
            $this->eventManagementService->syncProgrammes($evenement, $validated['programmes'] ?? []);
            $this->eventManagementService->storeBanner($request, $evenement);

            if ($evenement->type === 'concours') {
                $panel = $this->juryWorkflow->ensurePanel($evenement);
                $panel->update([
                    'admission_average' => $validated['jury_config']['admission_average'] ?? $panel->admission_average,
                    'seats_count' => $validated['jury_config']['seats_count'] ?? $panel->seats_count,
                    'ranking_mode' => $validated['jury_config']['ranking_mode'] ?? $panel->ranking_mode,
                    'tie_break_rule' => $validated['jury_config']['tie_break_rule'] ?? $panel->tie_break_rule,
                ]);
                $this->juryWorkflow->syncCriteria($panel, $validated['jury_config']['criteria'] ?? []);
            }

            $this->logActivity($evenement, $request->user()->id, 'modification', 'Evenement modifie', 'L evenement a ete mis a jour.');

            if ($request->boolean('notify_participants') && $evenement->statut === 'publie') {
                $this->notifications->notifyMany(
                    $evenement->inscriptions()->where('statut', '!=', 'refuse')->with('utilisateur')->get()->pluck('utilisateur')->filter(),
                    'evenement_modifie',
                    'Evenement mis à jour',
                    "L'événement \"{$evenement->titre}\" a été mis à jour par l'organisateur.",
                    $evenement->id,
                    ['evenement_id' => $evenement->id]
                );
            }

            return $evenement;
        });

        if ($shouldResetValidation) {
            $this->validationService->resetToPending($evenement->fresh(), $request->user());
        }

        return redirect()->route('evenements.show', $evenement);
    }

    public function destroy(Request $request, Evenement $evenement)
    {
        abort_unless($this->authorization->isAdminOrCreator($evenement, $request->user()), 403);

        return DB::transaction(function () use ($request, $evenement) {
            $evenement->loadMissing(['medias', 'juryPanel']);

            // Supprimer les fichiers médias
            foreach ($evenement->medias as $media) {
                Storage::disk('public')->delete($media->chemin_fichier);
            }

            // Si jury en cours de délibération: marquer annulée
            if ($evenement->juryPanel) {
                $panel = $evenement->juryPanel;
                if ($panel->scoring_opened_at && ! $panel->scoring_closed_at) {
                    $panel->update([
                        'scoring_closed_at' => now(),
                        'meta' => array_merge(
                            $panel->meta ?? [],
                            ['cancelled_reason' => 'Événement supprimé par le créateur']
                        ),
                    ]);
                }
            }

            // Logger la suppression
            $this->logActivity(
                $evenement,
                $request->user()->id,
                'suppression',
                'Événement supprimé',
                'Supprimé par '.$request->user()->name
            );

            $evenement->delete();

            return redirect()->route('evenements.gestion')->with('success', 'Événement supprimé');
        });
    }

    public function publier(Request $request, Evenement $evenement)
    {
        abort_unless($this->authorization->isAdminOrCreator($evenement, $request->user()), 403);

        $evenement->update([
            'statut' => 'publie',
        ]);
        $this->logActivity($evenement, $request->user()->id, 'publication', 'Evenement publie', 'L evenement est maintenant visible pour les participants.');
        foreach ($evenement->inscriptions()->with('utilisateur')->where('statut', '!=', 'refuse')->get() as $inscription) {
            if ($inscription->utilisateur) {
                $this->notifications->notify(
                    $inscription->utilisateur,
                    'publication_evenement',
                    'Evenement publie',
                    "{$evenement->titre} vient d etre publie.",
                    $evenement->id,
                    ['evenement_id' => $evenement->id],
                );
            }
        }

        $this->dispatchEventStatusUpdated($evenement->fresh(), $request->user(), 'Evenement publie.');

        return back();
    }

    public function assignUser(Request $request, Evenement $evenement)
    {
        if (! $evenement->exists) {
            $evenement = Evenement::findOrFail($request->route('evenement'));
        }

        $this->authorize('update', $evenement);

        $validated = $request->validate([
            'user_id' => 'required|integer|exists:users,id',
            'role' => 'required|string|in:organisateur,jury,intervenant,participant',
            'permissions' => 'nullable|array',
            'is_president_jury' => 'nullable|boolean',
        ]);

        try {
            $this->roleService->assignUser($evenement, $validated['user_id'], $validated['role'], $validated);
        } catch (\InvalidArgumentException $e) {
            return back()->withErrors(['user_id' => $e->getMessage()]);
        }

        $this->refreshValidationStateAfterMutation($evenement, $request->user());

        return back()->with('status', 'user_assigned');
    }

    public function removeUser(Request $request, Evenement $evenement, int $userId)
    {
        $this->authorize('update', $evenement);

        $user = User::findOrFail($userId);

        $this->roleService->removeUser($evenement, $user);
        $this->refreshValidationStateAfterMutation($evenement, $request->user());

        return back()->with('status', 'user_removed');
    }

    public function saveSection(Request $request, Evenement $evenement, string $section)
    {
        $this->authorize('update', $evenement);

        $validated = match ($section) {
            'general' => $request->validate([
                'titre' => ['required', 'string', 'max:255'],
                'description' => ['nullable', 'string'],
                'date_debut' => ['required', 'date'],
                'date_fin' => ['nullable', 'date', 'after_or_equal:date_debut'],
                'lieu' => ['required', 'string', 'max:255'],
                'lien_live' => ['nullable', 'url', 'max:500'],
            ]),
            'permissions' => $request->validate([
                'visibilite' => ['required', 'in:public,prive,restreint'],
                'public_cible' => ['required', 'string', 'max:255'],
                'roles' => ['nullable', 'array'],
                'roles.*' => ['string', 'max:255'],
            ]),
            'interactions' => $request->validate([
                'comments_enabled' => ['required', 'boolean'],
                'comment_replies_enabled' => ['required', 'boolean'],
                'comment_reactions_enabled' => ['required', 'boolean'],
                'messages_enabled' => ['required', 'boolean'],
                'comment_policy' => ['required', 'in:all_registered,accepted_participants,organizers_jury_only,readonly'],
            ]),
            'certificates' => $request->validate([
                'evenement_certifie' => ['required', 'boolean'],
                'certificate_template_version' => ['nullable', 'string', 'max:255'],
            ]),
            'criteria' => $request->validate([
                'criteria' => ['required', 'array'],
                'criteria.*.id' => ['nullable', 'integer'],
                'criteria.*.nom' => ['required', 'string', 'max:255'],
                'criteria.*.description' => ['nullable', 'string'],
                'criteria.*.bareme' => ['nullable', 'numeric', 'min:1'],
                'criteria.*.coefficient' => ['nullable', 'numeric', 'min:0.1'],
                'criteria.*.ordre' => ['nullable', 'integer', 'min:1'],
                'criteria.*.actif' => ['nullable', 'boolean'],
            ]),
            default => abort(404),
        };

        $event = $this->eventService->updateSection($evenement, $section, $validated);
        $this->refreshValidationStateAfterMutation($event, $request->user());

        return response()->json([
            'event' => (new EvenementResource($event->fresh(['roles'])))->toArray($request),
            'completion' => $this->completionService->summarize($event->fresh()),
            'workflow_state' => $this->eventService->workflowState($event->fresh()),
            'submission_errors' => $this->eventService->submissionErrors($event->fresh()),
            'suggestions' => $this->eventService->suggestions($event->fresh()),
        ]);
    }

    public function updatePermissions(Request $request, Evenement $evenement)
    {
        $this->authorize('update', $evenement);

        $validated = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'permissions' => ['required', 'array'],
        ]);

        $user = User::findOrFail($validated['user_id']);
        $this->roleService->updatePermissions($evenement, $user, $validated['permissions']);
        $this->refreshValidationStateAfterMutation($evenement, $request->user());

        return back()->with('status', 'permissions_updated');
    }

    public function deleteProgram(Request $request, Evenement $evenement, Programme $programme)
    {
        $this->authorize('update', $evenement);

        $this->programService->deleteSession($evenement, $programme);
        $this->refreshValidationStateAfterMutation($evenement, $request->user());

        return back()->with('status', 'program_deleted');
    }

    public function addProgram(Request $request, Evenement $evenement)
    {
        $this->authorize('update', $evenement);

        $validated = $request->validate([
            'titre' => 'required|string|max:255',
            'description' => 'nullable|string',
            'intervenant' => 'nullable|string|max:255',
            'date_programme' => 'nullable|date',
            'heure_debut' => 'nullable',
            'heure_fin' => 'nullable',
            'salle' => 'nullable|string|max:255',
            'type_section' => 'nullable|string|max:255',
            'ordre' => 'nullable|integer|min:1',
        ]);

        $errors = $this->programService->validateSessionData($validated);
        if (! empty($errors)) {
            return back()->withErrors($errors);
        }

        $this->programService->addSession($evenement, $validated);
        $this->refreshValidationStateAfterMutation($evenement, $request->user());

        return back()->with('status', 'program_added');
    }

    public function updateProgram(Request $request, Evenement $evenement, Programme $programme)
    {
        $this->authorize('update', $evenement);

        $validated = $request->validate([
            'titre' => 'required|string|max:255',
            'description' => 'nullable|string',
            'intervenant' => 'nullable|string|max:255',
            'date_programme' => 'nullable|date',
            'heure_debut' => 'nullable',
            'heure_fin' => 'nullable',
            'salle' => 'nullable|string|max:255',
            'type_section' => 'nullable|string|max:255',
            'ordre' => 'nullable|integer|min:1',
        ]);

        $errors = $this->programService->validateSessionData($validated);
        if (! empty($errors)) {
            return back()->withErrors($errors);
        }

        $this->programService->updateSession($programme, $validated);
        $this->refreshValidationStateAfterMutation($evenement, $request->user());

        return back()->with('status', 'program_updated');
    }

    public function reorderProgram(Request $request, Evenement $evenement)
    {
        $this->authorize('update', $evenement);

        $validated = $request->validate([
            'order' => 'required|array',
            'order.*' => 'integer|exists:programmes,id',
        ]);

        $this->programService->reorderSessions($evenement, $validated['order']);
        $this->refreshValidationStateAfterMutation($evenement, $request->user());

        return back()->with('status', 'program_reordered');
    }

    public function uploadMedia(Request $request, Evenement $evenement)
    {
        $this->authorize('update', $evenement);

        $validated = $request->validate([
            'media' => 'required',
            'media.*' => 'file|max:51200|mimes:jpg,jpeg,png,gif,pdf,mp4,webm',
            'description' => 'nullable|string|max:500',
            'is_public' => 'nullable|boolean',
            'download_allowed' => 'nullable|boolean',
            'confidentialite' => 'nullable|string|in:public,inscrits,participants,organisateur,intervenant,jury,president_jury',
            'use_as_cover' => 'nullable|boolean',
        ]);

        try {
            $files = $request->file('media');
            $files = is_array($files) ? $files : [$files];

            foreach ($files as $file) {
                $this->mediaService->uploadMedia($evenement, $file, [
                    'description' => $validated['description'] ?? null,
                    'is_public' => $validated['is_public'] ?? true,
                    'download_allowed' => $validated['download_allowed'] ?? true,
                    'confidentialite' => $validated['confidentialite'] ?? null,
                    'is_cover' => (bool) ($validated['use_as_cover'] ?? false),
                ]);
            }
            $this->refreshValidationStateAfterMutation($evenement, $request->user());

            return back()->with('status', 'media_uploaded');
        } catch (\InvalidArgumentException $e) {
            return back()->withErrors(['media' => $e->getMessage()]);
        }
    }

    public function updateMedia(Request $request, Evenement $evenement, EvenementMedia $media)
    {
        $this->authorize('update', $evenement);

        $validated = $request->validate([
            'description' => 'nullable|string|max:500',
            'is_public' => 'nullable|boolean',
            'download_allowed' => 'nullable|boolean',
            'confidentialite' => 'nullable|string|in:public,inscrits,participants,organisateur,intervenant,jury,president_jury',
            'is_cover' => 'nullable|boolean',
        ]);

        $this->mediaService->updateMedia($media, $validated);
        $this->refreshValidationStateAfterMutation($evenement, $request->user());

        return back()->with('status', 'media_updated');
    }

    public function deleteMedia(Request $request, Evenement $evenement, EvenementMedia $media)
    {
        $this->authorize('update', $evenement);

        $this->mediaService->deleteMedia($media);
        $this->refreshValidationStateAfterMutation($evenement, $request->user());

        return back()->with('status', 'media_deleted');
    }

    public function downloadMedia(Request $request, Evenement $evenement, EvenementMedia $media)
    {
        abort_unless($media->evenement_id === $evenement->id, 404);

        $user = $request->user();
        abort_unless($user, 403);

        $assignment = $evenement->assignments()->where('user_id', $user->id)->first();

        if (! $this->mediaService->canDownload($media, $user, $assignment)) {
            abort(403, 'Téléchargement non autorisé');
        }

        return $this->mediaService->download($media);
    }

    public function archiver(Request $request, Evenement $evenement)
    {
        abort_unless($this->authorization->isAdminOrCreator($evenement, $request->user()), 403);

        $evenement->update([
            'statut' => 'cloture',
        ]);

        $this->logActivity($evenement, $request->user()->id, 'archivage', 'Evenement archive', 'L evenement a ete archive et retire des flux actifs.');

        $this->dispatchEventStatusUpdated($evenement->fresh(), $request->user(), 'Evenement archive.');

        return back();
    }

    public function submitForValidation(Request $request, Evenement $evenement)
    {
        abort_unless($this->authorization->isAdminOrCreator($evenement, $request->user()), 403);

        try {
            $this->validationService->submitForValidation($evenement, $request->user());
        } catch (\InvalidArgumentException $exception) {
            $errors = json_decode($exception->getMessage(), true) ?: ['Veuillez completer les sections requises.'];

            if ($request->expectsJson()) {
                return response()->json(['errors' => $errors], 422);
            }

            return back()->withErrors(['submit' => $errors]);
        }

        if ($request->expectsJson()) {
            $fresh = $evenement->fresh();

            return response()->json([
                'status' => 'submitted',
                'workflow_state' => $this->eventService->workflowState($fresh),
                'completion' => $this->completionService->summarize($fresh),
            ]);
        }

        return back()->with('status', 'submitted');
    }

    public function approve(Request $request, Evenement $evenement)
    {
        $this->authorize('approve', $evenement);

        $this->validationService->approve($evenement, $request->user());

        return back()->with('status', 'approved');
    }

    public function reject(Request $request, Evenement $evenement)
    {
        $this->authorize('approve', $evenement);

        $validated = $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        $this->validationService->reject($evenement, $request->user(), $validated['reason']);

        return back()->with('status', 'rejected');
    }

    public function resetToPending(Request $request, Evenement $evenement)
    {
        $this->authorize('update', $evenement);

        $this->validationService->resetToPending($evenement, $request->user());

        return back()->with('status', 'reset');
    }

    public function requestPermission(Request $request, Evenement $evenement)
    {
        $validated = $request->validate([
            'permission' => ['required', 'string'],
            'reason' => ['required', 'string', 'max:500'],
        ]);

        $this->logActivity($evenement, $request->user()->id, 'requete_permission', 'Demande de privilèges',
            "L'organisateur {$request->user()->name} demande l'accès à : {$validated['permission']}. Motif : {$validated['reason']}"
        );

        // Notification au créateur
        $this->notifications->notify($evenement->createur, 'demande_permission', 'Nouvelle requête staff', "Une demande de droits est en attente pour {$evenement->titre}.", $evenement->id);

        return back()->with('status', 'request-sent');
    }

    private function validateEvenement(Request $request): array
    {
        return $request->validate([
            'titre' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'type' => ['required', 'in:conference,concours'],
            'date_debut' => ['required', 'date'],
            'date_fin' => ['nullable', 'date', 'after_or_equal:date_debut'],
            'lieu' => ['nullable', 'string', 'max:255'],
            'lien_live' => ['nullable', 'url', 'max:500'],
            'visibilite' => ['nullable', 'in:public,prive,restreint'],
            'public_cible' => ['nullable', 'string', 'max:255'],
            'roles' => ['nullable', 'array'],
            'roles.*' => ['string', 'max:255'],
            'assigned_users' => ['nullable', 'array'],
            'assigned_users.organisateur' => ['nullable', 'array'],
            'assigned_users.organisateur.*.user_id' => ['required', 'integer', 'exists:users,id'],
            'assigned_users.organisateur.*.permissions' => ['nullable', 'array'],
            'assigned_users.participant' => ['nullable', 'array'],
            'assigned_users.participant.*.user_id' => ['required', 'integer', 'exists:users,id'],
            'assigned_users.intervenant' => ['nullable', 'array'],
            'assigned_users.intervenant.*.user_id' => ['required', 'integer', 'exists:users,id'],
            'assigned_users.jury' => ['nullable', 'array'],
            'assigned_users.jury.*.user_id' => ['required', 'integer', 'exists:users,id'],
            'assigned_users.jury.*.is_president_jury' => ['nullable', 'boolean'],
            'assigned_users.jury.*.permissions' => ['nullable', 'array'],
            'comment_policy' => ['nullable', 'in:all_registered,accepted_participants,organizers_jury_only,readonly'],
            'certificate_template_schema' => ['nullable', 'array'],
            'certificate_template_version' => ['nullable', 'string', 'max:255'],
            'competition_status' => ['nullable', 'in:configuration,notation_ouverte,notation_terminee,deliberation,validation_president,resultats_publies'],
            'jury_config' => ['nullable', 'array'],
            'jury_config.president_user_id' => ['nullable', 'integer', 'exists:users,id'],
            'jury_config.admission_average' => ['nullable', 'numeric', 'min:0'],
            'jury_config.seats_count' => ['nullable', 'integer', 'min:1'],
            'jury_config.ranking_mode' => ['nullable', 'string', 'max:100'],
            'jury_config.tie_break_rule' => ['nullable', 'string', 'max:100'],
            'jury_config.criteria' => ['nullable', 'array'],
            'jury_config.criteria.*.id' => ['nullable', 'integer'],
            'jury_config.criteria.*.nom' => ['required_with:jury_config.criteria', 'string', 'max:255'],
            'jury_config.criteria.*.description' => ['nullable', 'string'],
            'jury_config.criteria.*.bareme' => ['nullable', 'numeric', 'min:1'],
            'jury_config.criteria.*.coefficient' => ['nullable', 'numeric', 'min:0.1'],
            'jury_config.criteria.*.ordre' => ['nullable', 'integer', 'min:1'],
            'jury_config.criteria.*.actif' => ['nullable', 'boolean'],
            'programmes' => ['nullable', 'array'],
            'programmes.*.id' => ['nullable', 'integer', 'exists:programmes,id'],
            'programmes.*.titre' => ['nullable', 'string', 'max:255'],
            'programmes.*.description' => ['nullable', 'string'],
            'programmes.*.intervenant' => ['nullable', 'string', 'max:255'],
            'programmes.*.date_programme' => ['nullable', 'date'],
            'programmes.*.heure_debut' => ['nullable'],
            'programmes.*.heure_fin' => ['nullable'],
            'programmes.*.salle' => ['nullable', 'string', 'max:255'],
            'programmes.*.type_section' => ['nullable', 'string', 'max:255'],
            'programmes.*.ordre' => ['nullable', 'integer', 'min:1'],
            'statut' => ['nullable', 'in:brouillon,publie,en_cours,cloture,archive'],
            'capacite_max' => ['nullable', 'integer', 'min:1'],
            'media' => ['nullable', 'file', 'max:10240', 'mimes:jpg,jpeg,png,webp,pdf'],
        ]);
    }

    private function syncRoles(Evenement $evenement, array $roles): void
    {
        $normalizedRoles = collect($roles)
            ->filter()
            ->unique()
            ->values();

        $evenement->roles()->delete();

        foreach ($normalizedRoles as $role) {
            $evenement->roles()->create([
                'category' => 'audience',
                'role' => $role,
            ]);
        }
    }

    private function syncAssignments(Evenement $evenement, array $assignedUsers): void
    {
        $evenement->assignments()->delete();

        foreach (self::ASSIGNMENT_ROLES as $role) {
            $entries = collect($assignedUsers[$role] ?? [])
                ->map(function ($entry) use ($role) {
                    if (is_numeric($entry)) {
                        return ['user_id' => (int) $entry, 'permissions' => $this->defaultPermissionsForRole($role), 'is_president_jury' => false];
                    }

                    return [
                        'user_id' => (int) ($entry['user_id'] ?? 0),
                        'permissions' => $entry['permissions'] ?? $this->defaultPermissionsForRole($role),
                        'is_president_jury' => (bool) ($entry['is_president_jury'] ?? false),
                    ];
                })
                ->filter(fn (array $entry) => $entry['user_id'] > 0)
                ->unique('user_id')
                ->values();

            foreach ($entries as $entry) {
                $permissions = $entry['permissions'];
                $evenement->assignments()->create([
                    'category' => 'assignment',
                    'role' => $role,
                    'user_id' => $entry['user_id'],
                    'is_president_jury' => $role === 'jury' ? $entry['is_president_jury'] : false,
                    'can_manage_messages' => (bool) ($permissions['can_manage_messages'] ?? false),
                    'can_manage_comments' => (bool) ($permissions['can_manage_comments'] ?? false),
                    'can_edit_event' => (bool) ($permissions['can_edit_event'] ?? false),
                    'can_change_visibility' => (bool) ($permissions['can_change_visibility'] ?? false),
                    'can_manage_participants' => (bool) ($permissions['can_manage_participants'] ?? false),
                    'can_assign_jury' => (bool) ($permissions['can_assign_jury'] ?? false),
                    'can_assign_organizers' => (bool) ($permissions['can_assign_organizers'] ?? false),
                    'can_manage_certificates' => (bool) ($permissions['can_manage_certificates'] ?? false),
                    'can_manage_results' => (bool) ($permissions['can_manage_results'] ?? false),
                    'meta' => ['source' => 'event_form'],
                ]);
            }
        }
    }

    private function syncProgrammes(Evenement $evenement, array $programmes): void
    {
        $programmes = collect($programmes)
            ->filter(fn (array $programme) => filled($programme['titre'] ?? null))
            ->values();

        $idsToKeep = [];

        foreach ($programmes as $index => $programmeData) {
            $payload = [
                'titre' => $programmeData['titre'],
                'description' => $programmeData['description'] ?: null,
                'intervenant' => $programmeData['intervenant'] ?: null,
                'date_programme' => $programmeData['date_programme'] ?: null,
                'heure_debut' => $programmeData['heure_debut'] ?: null,
                'heure_fin' => $programmeData['heure_fin'] ?: null,
                'salle' => $programmeData['salle'] ?: null,
                'type_section' => $programmeData['type_section'] ?: null,
                'ordre' => (int) ($programmeData['ordre'] ?? ($index + 1)),
            ];

            $programme = isset($programmeData['id'])
                ? $evenement->programmes()->whereKey($programmeData['id'])->first()
                : null;

            if ($programme) {
                $programme->update($payload);
                $idsToKeep[] = $programme->id;

                continue;
            }

            $created = $evenement->programmes()->create($payload);
            $idsToKeep[] = $created->id;
        }

        $evenement->programmes()
            ->when($idsToKeep !== [], fn ($builder) => $builder->whereNotIn('id', $idsToKeep), fn ($builder) => $builder)
            ->delete();
    }

    private function storeBannerMedia(Request $request, Evenement $evenement): void
    {
        if (! $request->hasFile('media')) {
            return;
        }

        $file = $request->file('media');
        $path = Storage::disk('public')->put('evenements', $file);

        EvenementMedia::create([
            'evenement_id' => $evenement->id,
            'type' => str_contains((string) $file->getMimeType(), 'pdf') ? 'pdf' : 'image',
            'chemin_fichier' => $path,
            'nom_original' => $file->getClientOriginalName(),
            'taille' => $file->getSize(),
        ]);
    }

    private function serializeEvenementCard(Evenement $evenement, ?User $user): array
    {
        $cover = $evenement->preferredCoverMedia();
        $assignment = $user ? $evenement->assignments->firstWhere('user_id', $user->id) : null;
        $canManage = $user
            ? ($this->authorization->isAdminOrCreator($evenement, $user) || $assignment?->role === 'organisateur')
            : false;
        $managementRole = $user
            ? ($evenement->cree_par === $user->id ? 'createur' : ($assignment?->role === 'organisateur' ? 'organisateur' : null))
            : null;

        $currentInscription = $user
            ? $evenement->inscriptions->firstWhere('utilisateur_id', $user->id)
            : null;

        return [
            'id' => $evenement->id,
            'titre' => $evenement->titre,
            'description' => $evenement->description,
            'type' => $evenement->type,

            'date_debut' => optional($evenement->date_debut)?->toIso8601String(),
            'date_fin' => optional($evenement->date_fin)?->toIso8601String(),

            'lieu' => $evenement->lieu,
            'statut' => $evenement->statut,
            'validation_status' => $evenement->validation_status,
            'workflow_state' => $this->eventService->workflowState($evenement),
            'rejection_reason' => $evenement->rejection_reason,
            'submitted_at' => optional($evenement->submitted_at)?->toIso8601String(),
            'visibilite' => $evenement->visibilite,
            'public_cible' => $evenement->public_cible,
            'capacite_max' => $evenement->capacite_max,

            'participants_count' => $evenement->inscriptions_count,
            'comments_count' => $evenement->comments_count ?? 0,
            'activity_count' => $evenement->activities_count ?? 0,

            'cover_url' => $cover
                ? Storage::url($cover->chemin_fichier)
                : null,

            'roles' => $evenement->roles->pluck('role')->values(),

            'createur' => [
                'id' => $evenement->createur?->id,
                'name' => $evenement->createur?->name,
                'role' => $evenement->createur?->role,
            ],

            // 🔥 NOUVEAU : ACTEURS (IMPORTANT POUR MODAL)
            'actors' => $evenement->assignments
                ? $evenement->assignments->map(function ($assignment) {
                    return [
                        'id' => $assignment->user?->id,
                        'name' => $assignment->user?->name,
                        'email' => $assignment->user?->email,
                        'role' => $assignment->role,
                        'is_president' => (bool) $assignment->is_president_jury,
                    ];
                })->values()
                : [],

            // 👤 participation utilisateur courant
            'participation' => $currentInscription ? [
                'id' => $currentInscription->id,
                'statut' => $this->mapParticipationStatus($currentInscription->statut),
                'backend_statut' => $currentInscription->statut,
        ] : null,

            'can_join' => $user
                ? $this->canJoin($evenement, $user)
                : false,
            'management_role' => $managementRole,
            'can_manage' => $canManage,
            'can_edit' => $user ? $this->authorization->canEditEvent($evenement, $user) : false,
            'can_delete' => $user ? $this->authorization->isAdminOrCreator($evenement, $user) : false,
            'can_submit' => $user ? ($evenement->cree_par === $user->id || $user->isAdmin()) : false,
        ];
    }

    private function serializeEvenementDetail(Evenement $evenement, ?int $currentInscriptionId): array
    {
        $cover = $evenement->preferredCoverMedia();

        return [
            'id' => $evenement->id,
            'titre' => $evenement->titre,
            'description' => $evenement->description,
            'type' => $evenement->type,
            'date_debut' => optional($evenement->date_debut)->toIso8601String(),
            'date_fin' => optional($evenement->date_fin)->toIso8601String(),
            'lieu' => $evenement->lieu,
            'lien_live' => $evenement->lien_live,
            'statut' => $evenement->statut,
            'visibilite' => $evenement->visibilite,
            'public_cible' => $evenement->public_cible,
            'inscription_requise' => $evenement->inscription_requise,
            'capacite_max' => $evenement->capacite_max,
            'checkin_active' => $evenement->checkin_active,
            'comments_enabled' => $evenement->comments_enabled,
            'comment_replies_enabled' => $evenement->comment_replies_enabled,
            'comment_reactions_enabled' => $evenement->comment_reactions_enabled,
            'comment_policy' => $evenement->comment_policy,
            'messages_enabled' => $evenement->messages_enabled,
            'evenement_certifie' => $evenement->evenement_certifie,
            'certificate_template_schema' => $evenement->certificate_template_schema,
            'certificate_template_version' => $evenement->certificate_template_version,
            'allow_participant_result_tracking' => $evenement->allow_participant_result_tracking,
            'competition_status' => $evenement->competition_status,
            'participants_count' => $evenement->inscriptions->count(),
            'comments_count' => $evenement->comments->count(),
            'activity_count' => $evenement->activities->count(),
            'roles' => $evenement->roles->pluck('role')->values(),
            'cover_url' => $cover ? Storage::url($cover->chemin_fichier) : null,
            'createur' => [
                'id' => $evenement->createur?->id,
                'name' => $evenement->createur?->name,
                'email' => $evenement->createur?->email,
                'role' => $evenement->createur?->role,
            ],
            'current_inscription_id' => $currentInscriptionId,
        ];
    }

    private function canManage(Evenement $evenement, ?User $user): bool
    {
        return $this->authorization->canEditEvent($evenement, $user);
    }

    private function canJoin(Evenement $evenement, ?User $user): bool
    {
        if (
            ! $user
            || $this->authorization->canEditEvent($evenement, $user)
            || $evenement->validation_status !== 'approved'
            || $evenement->statut !== 'publie'
            || in_array($evenement->statut, ['cloture', 'archive'], true)
            || $evenement->visibilite === 'prive'
        ) {
            return false;
        }

        $roles = $evenement->roles->pluck('role');

        $activeRegistrationsCount = $evenement->relationLoaded('inscriptions')
            ? $evenement->inscriptions->where('statut', '!=', 'refuse')->count()
            : $evenement->inscriptions()->where('statut', '!=', 'refuse')->count();

        if ($evenement->capacite_max !== null && $activeRegistrationsCount >= $evenement->capacite_max) {
            return false;
        }

        if ($roles->isEmpty() || $roles->contains('tous') || $evenement->public_cible === 'tous') {
            return true;
        }

        return $roles->contains($user->role) || $evenement->public_cible === $user->role;
    }

    private function canPreviewEvent(Evenement $evenement, ?User $user): bool
    {
        if (! $user) {
            return false;
        }

        if ($this->authorization->canView($evenement, $user)) {
            return true;
        }

        return $evenement->validation_status === 'approved'
            && $evenement->statut === 'publie'
            && $evenement->visibilite === 'public'
            && ! in_array($evenement->statut, ['cloture', 'archive'], true);
    }

    private function authorizeAction(Evenement $evenement, ?User $user): void
    {
        if (! $user) {
            abort(403, 'Non authentifie');
        }

        if (
            $this->authorization->canView($evenement, $user)
            || $this->canJoin($evenement, $user)
            || $this->canPreviewEvent($evenement, $user)
        ) {
            return;
        }

        abort(403, 'Acces refuse pour ce role');
    }

    private function authorizeManagement(Evenement $evenement, User $user): void
    {
        if ($this->authorization->canEditEvent($evenement, $user)) {
            return;
        }

        abort(403, 'Action non autorisee');
    }

    private function availableRoles(): array
    {
        return [
            'tous',
            'admin',
            'enseignant',
            'etudiant',
            'organisateur',
            'jury',
            'intervenant',
            'participant',
        ];
    }

    private function formMeta(): array
    {
        return [
            'availableRoles' => $this->availableRoles(),
            'assignableUsers' => User::query()
                ->select('id', 'name', 'email')
                ->orderBy('name')
                ->get()
                ->map(fn ($user) => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ]),
            'assignmentRoles' => [
                ['value' => 'organisateur', 'label' => 'Organisateur'],
                ['value' => 'jury', 'label' => 'Jury'],
                ['value' => 'intervenant', 'label' => 'Intervenant'],
                ['value' => 'participant', 'label' => 'Participant'],
            ],
            'audienceRoles' => [
                ['value' => 'tous', 'label' => 'Tous'],
                ['value' => 'etudiant', 'label' => 'Etudiant'],
                ['value' => 'enseignant', 'label' => 'Enseignant'],
                ['value' => 'organisateur', 'label' => 'Organisateur'],
                ['value' => 'jury', 'label' => 'Jury'],
                ['value' => 'intervenant', 'label' => 'Intervenant'],
                ['value' => 'participant', 'label' => 'Participant'],
            ],
            'commentPolicies' => [
                ['value' => 'all_registered', 'label' => 'Tous les inscrits'],
                ['value' => 'accepted_participants', 'label' => 'Participants acceptes'],
                ['value' => 'organizers_jury_only', 'label' => 'Organisateurs et jury'],
                ['value' => 'readonly', 'label' => 'Lecture seule'],
            ],
            'types' => [
                ['value' => 'conference', 'label' => 'Conférence'],
                ['value' => 'concours', 'label' => 'Concours'],
            ],
            'visibilities' => [
                ['value' => 'public', 'label' => 'Public'],
                ['value' => 'prive', 'label' => 'Privé'],
                ['value' => 'restreint', 'label' => 'Restreint'],
            ],
            'statuses' => [
                ['value' => 'brouillon', 'label' => 'Brouillon'],
                ['value' => 'publie', 'label' => 'Publié'],
                ['value' => 'en_cours', 'label' => 'En cours'],
                ['value' => 'cloture', 'label' => 'Clôturé'],
                ['value' => 'archive', 'label' => 'Archivé'],
            ],
        ];
    }

    private function refreshValidationStateAfterMutation(Evenement $evenement, User $user): void
    {
        $evenement->refresh();

        if (in_array($evenement->validation_status, ['approved', 'rejected'], true)) {
            $this->validationService->resetToPending($evenement, $user);
        }
    }

    private function mapParticipationStatus(string $status): string
    {
        return match ($status) {
            'accepte' => 'participe',
            'en_attente' => 'interesse',
            default => 'refuse',
        };
    }

    private function recommendedEvents(User $user, ?int $excludeId = null, ?Collection $baseEvents = null)
    {
        $preferredType = $user->role === 'enseignant' || $user->role === 'intervenant' ? 'conference' : 'concours';

        $historiqueTypes = $user->inscriptions()
            ->with('evenement:id,type')
            ->get()
            ->pluck('evenement.type')
            ->filter()
            ->countBy()
            ->sortDesc();

        $historicalPreference = $historiqueTypes->keys()->first();

        $events = $baseEvents
            ? $baseEvents->when($excludeId, fn (Collection $items) => $items->where('id', '!=', $excludeId))
            : Evenement::query()
                ->with(['createur:id,name,email,role', 'roles', 'medias'])
                ->withCount(['inscriptions', 'comments', 'activities'])
                ->with([
                    'inscriptions' => fn ($relation) => $relation
                        ->where('utilisateur_id', $user->id)
                        ->latest(),
                ])
                ->when($excludeId, fn ($builder) => $builder->where('id', '!=', $excludeId))
                ->where('statut', 'publie')
                ->where('date_debut', '>=', now()->startOfDay())
                ->where(function ($query) use ($user) {
                    $query->whereDoesntHave('roles')
                        ->orWhereHas('assignments', fn ($assignments) => $assignments->where('user_id', $user->id))
                        ->orWhereHas('roles', fn ($roles) => $roles->whereIn('role', ['tous', $user->role]));
                })
                ->get();

        return $events
            ->filter(fn (Evenement $evenement) => ! $evenement->inscriptions->firstWhere('utilisateur_id', $user->id))
            ->sortByDesc(function (Evenement $evenement) use ($historicalPreference, $preferredType, $user) {
                $score = 0;
                $targetType = $historicalPreference ?: $preferredType;
                $roles = $evenement->roles->pluck('role');
                $daysUntilStart = max(now()->diffInDays($evenement->date_debut, false), 0);

                if ($evenement->type === $targetType) {
                    $score += 35;
                }

                if ($roles->isEmpty() || $roles->contains('tous') || $roles->contains($user->role)) {
                    $score += 18;
                }

                if ($evenement->public_cible === $user->role) {
                    $score += 12;
                }

                if ($daysUntilStart <= 3) {
                    $score += 16;
                } elseif ($daysUntilStart <= 14) {
                    $score += 9;
                }

                $score += ($evenement->inscriptions_count * 4) + ($evenement->comments_count * 3) + ($evenement->activities_count * 2);

                return $score;
            })
            ->take(10)
            ->values();
    }

    private function serializeComment(object $comment, ?int $currentUserId): array
    {
        return [
            'id' => $comment->id,
            'contenu' => $comment->contenu,
            'created_at' => optional($comment->created_at)->toIso8601String(),
            'user' => [
                'id' => $comment->user?->id,
                'name' => $comment->user?->name,
                'email' => $comment->user?->email,
                'role' => $comment->user?->role,
            ],
            'likes_count' => $comment->reactions->where('type', 'like')->count(),
            'liked_by_me' => $currentUserId ? $comment->reactions->contains('user_id', $currentUserId) : false,
            'replies' => $comment->replies->map(fn ($reply) => [
                'id' => $reply->id,
                'contenu' => $reply->contenu,
                'created_at' => optional($reply->created_at)->toIso8601String(),
                'user' => [
                    'id' => $reply->user?->id,
                    'name' => $reply->user?->name,
                    'email' => $reply->user?->email,
                    'role' => $reply->user?->role,
                ],
                'likes_count' => $reply->reactions->where('type', 'like')->count(),
                'liked_by_me' => $currentUserId ? $reply->reactions->contains('user_id', $currentUserId) : false,
            ])->values(),
        ];
    }

    private function ensureNoConflict(array $validated, ?int $ignoreId = null): void
    {
        if (blank($validated['lieu'] ?? null)) {
            return;
        }

        $dateDebut = $validated['date_debut'];
        $dateFin = $validated['date_fin'] ?? $validated['date_debut'];

        $conflict = Evenement::query()
            ->when($ignoreId, fn ($builder) => $builder->where('id', '!=', $ignoreId))
            ->where('lieu', $validated['lieu'])
            ->where(function ($query) use ($dateDebut, $dateFin) {
                $query
                    ->whereBetween('date_debut', [$dateDebut, $dateFin])
                    ->orWhereBetween('date_fin', [$dateDebut, $dateFin])
                    ->orWhere(function ($nested) use ($dateDebut, $dateFin) {
                        $nested->where('date_debut', '<=', $dateDebut)
                            ->where(function ($fullCover) use ($dateFin, $dateDebut) {
                                $fullCover->whereNull('date_fin')
                                    ->orWhere('date_fin', '>=', $dateFin ?: $dateDebut);
                            });
                    });
            })
            ->first();

        if (! $conflict) {
            return;
        }

        abort(422, 'Cette salle est deja utilisee a cette heure.');
    }

    private function logActivity(Evenement $evenement, ?int $userId, string $type, string $label, ?string $description = null, array $meta = []): void
    {
        EvenementActivity::create([
            'evenement_id' => $evenement->id,
            'user_id' => $userId,
            'type' => $type,
            'label' => $label,
            'description' => $description,
            'meta' => $meta,
        ]);
    }

    private function dispatchEventStatusUpdated(Evenement $evenement, ?User $actor, string $message): void
    {
        if (! $actor) {
            return;
        }

        try {
            EventStatusUpdated::dispatch($evenement, $actor, $message);
        } catch (\Throwable $exception) {
            Log::warning('Event status broadcast failed.', [
                'evenement_id' => $evenement->id,
                'actor_id' => $actor->id,
                'message' => $message,
                'error' => $exception->getMessage(),
            ]);
        }
    }

    private function serializeAccessPass(Evenement $evenement, ?object $currentInscription): ?array
    {
        if (! $currentInscription || $currentInscription->statut === 'refuse' || ! $currentInscription->access_token) {
            return null;
        }

        return [
            'token' => $currentInscription->access_token,
            'qr_url' => route('inscriptions.qr', $currentInscription),
            'scan_url' => route('acces.scan', $currentInscription->access_token),
            'admin_scan_url' => route('acces.admin', ['target' => route('acces.scan', $currentInscription->access_token)]),
            'checked_in_at' => optional($currentInscription->checked_in_at)->toIso8601String(),
            'status' => $this->mapParticipationStatus($currentInscription->statut),
        ];
    }

    private function serializeAssignments(Collection $assignments): array
    {
        $grouped = [];

        foreach (self::ASSIGNMENT_ROLES as $role) {
            $grouped[$role] = $assignments
                ->where('role', $role)
                ->filter(fn ($assignment) => $assignment->user)
                ->map(fn ($assignment) => [
                    'id' => $assignment->id,
                    'user_id' => $assignment->user?->id,
                    'name' => $assignment->user?->name,
                    'email' => $assignment->user?->email,
                    'role' => $assignment->user?->role,
                    'is_president_jury' => $assignment->is_president_jury,
                    'permissions' => $this->serializePermissions($assignment),
                ])
                ->values()
                ->all();
        }

        return $grouped;
    }

    private function serializeAssignmentFormData(Collection $assignments): array
    {
        $payload = [];

        foreach (self::ASSIGNMENT_ROLES as $role) {
            $payload[$role] = $assignments
                ->where('role', $role)
                ->map(fn ($assignment) => [
                    'user_id' => (int) $assignment->user_id,
                    'is_president_jury' => (bool) $assignment->is_president_jury,
                    'permissions' => $this->serializePermissions($assignment),
                ])
                ->values()
                ->all();
        }

        return $payload;
    }

    private function serializePermissions(EvenementRole $assignment): array
    {
        return [
            'can_manage_messages' => (bool) $assignment->can_manage_messages,
            'can_manage_comments' => (bool) $assignment->can_manage_comments,
            'can_edit_event' => (bool) $assignment->can_edit_event,
            'can_change_visibility' => (bool) $assignment->can_change_visibility,
            'can_manage_participants' => (bool) $assignment->can_manage_participants,
            'can_assign_jury' => (bool) $assignment->can_assign_jury,
            'can_assign_organizers' => (bool) $assignment->can_assign_organizers,
            'can_manage_certificates' => (bool) $assignment->can_manage_certificates,
            'can_manage_results' => (bool) $assignment->can_manage_results,
        ];
    }

    private function defaultPermissionsForRole(string $role): array
    {
        return match ($role) {
            'organisateur' => [
                'can_manage_messages' => true,
                'can_manage_comments' => true,
                'can_edit_event' => true,
                'can_change_visibility' => true,
                'can_manage_participants' => false,
                'can_assign_jury' => false,
                'can_assign_organizers' => false,
                'can_manage_certificates' => true,
                'can_manage_results' => false,
            ],
            'jury' => [
                'can_manage_messages' => false,
                'can_manage_comments' => false,
                'can_edit_event' => false,
                'can_change_visibility' => false,
                'can_manage_participants' => false,
                'can_assign_jury' => false,
                'can_assign_organizers' => false,
                'can_manage_certificates' => false,
                'can_manage_results' => true,
            ],
            default => [
                'can_manage_messages' => false,
                'can_manage_comments' => false,
                'can_edit_event' => false,
                'can_change_visibility' => false,
                'can_manage_participants' => false,
                'can_assign_jury' => false,
                'can_assign_organizers' => false,
                'can_manage_certificates' => false,
                'can_manage_results' => false,
            ],
        };
    }

    private function serializeJuryPanel(?JuryPanel $panel, Evenement $evenement, ?User $viewer): ?array
    {
        if (! $panel) {
            return null;
        }

        $canSeeFullResults = $viewer
            ? $this->authorization->isJuryMember($evenement, $viewer)
                || $this->authorization->canManageResults($evenement, $viewer)
                || ($evenement->results_published_at && $evenement->allow_participant_result_tracking)
            : false;
        $computed = $canSeeFullResults && $evenement->type === 'concours' ? $this->juryWorkflow->computeResults($evenement) : collect();

        return [
            'id' => $panel->id,
            'president_user_id' => $panel->president_user_id,
            'admission_average' => $panel->admission_average,
            'seats_count' => $panel->seats_count,
            'ranking_mode' => $panel->ranking_mode,
            'tie_break_rule' => $panel->tie_break_rule,
            'criteria_locked' => $panel->criteria_locked,
            'scoring_opened_at' => optional($panel->scoring_opened_at)->toIso8601String(),
            'scoring_closed_at' => optional($panel->scoring_closed_at)->toIso8601String(),
            'validated_at' => optional($panel->validated_at)->toIso8601String(),
            'criteria' => $panel->criteria->map(fn ($criterion) => [
                'id' => $criterion->id,
                'nom' => $criterion->nom,
                'description' => $criterion->description,
                'bareme' => $criterion->bareme,
                'coefficient' => $criterion->coefficient,
                'ordre' => $criterion->ordre,
                'actif' => $criterion->actif,
            ])->values(),
            'deliberations' => $panel->deliberations->map(fn ($item) => [
                'id' => $item->id,
                'participant_id' => $item->participant_id,
                'participant_name' => $item->participant?->name,
                'requested_by' => $item->requester?->id,
                'requested_by_name' => $item->requester?->name,
                'status' => $item->status,
                'reason' => $item->reason,
                'resolved_at' => optional($item->resolved_at)->toIso8601String(),
                'resolved_by_name' => $item->resolver?->name,
            ])->values(),
            'score_entries' => $viewer && $this->authorization->isJuryMember($evenement, $viewer)
                ? $panel->scores
                    ->where('jury_user_id', $viewer->id)
                    ->map(fn ($score) => [
                        'participant_id' => $score->participant_id,
                        'criterion_id' => $score->jury_criterion_id,
                        'score' => $score->score !== null ? (float) $score->score : null,
                        'commentaire' => $score->commentaire,
                        'status' => $score->status,
                        'submitted_at' => optional($score->submitted_at)->toIso8601String(),
                        'reopened_at' => optional($score->reopened_at)->toIso8601String(),
                    ])
                    ->values()
                : [],
            'computed_results' => $computed->map(fn ($row) => [
                'participant_id' => $row['participant']->id,
                'participant_name' => $row['participant']->name,
                'note' => $row['note'],
                'classement' => $row['classement'],
                'admission' => $row['admission'],
                'mention' => $row['mention'],
                'criteria_breakdown' => $row['criteria_breakdown'],
            ])->values(),
        ];
    }

    public function manage(Request $request, Evenement $evenement)
    {
        Log::info('Manage method called', ['event_id' => $evenement->id, 'user_id' => $request->user()?->id]);

        $this->authorize('update', $evenement);

        Log::info('Authorization passed');

        $evenement->load([
            'createur',
            'roles',
            'assignments.user',
            'medias',
            'programmes',
            'activities.user',
            'inscriptions.utilisateur',
            'comments.user',
            'comments.replies.user',
            'messages.user',
            'messages.replies.user',
            'juryPanel.criteria',
            'juryPanel.deliberations',
            'resultats.utilisateur',
            'createur',
        ]);

        Log::info('Event loaded with relations');

        $eventData = (new EvenementResource($evenement))->toArray($request);
        Log::info('EvenementResource created', ['eventData_keys' => array_keys($eventData)]);

        $eventData['team'] = $this->roleService->getTeam($evenement);
        Log::info('Team data added');

        $eventData['programme'] = $evenement->programmes->map(fn ($programme) => [
            'id' => $programme->id,
            'titre' => $programme->titre,
            'description' => $programme->description,
            'intervenant' => $programme->intervenant,
            'date_programme' => $this->normalizeProgrammeDate($programme->date_programme),
            'heure_debut' => $programme->heure_debut,
            'heure_fin' => $programme->heure_fin,
            'salle' => $programme->salle,
            'type_section' => $programme->type_section,
            'ordre' => $programme->ordre,
        ])->sortBy('ordre')->values()->toArray();
        Log::info('Programme data added');

        $eventData['medias'] = $this->mediaService->getMediaForEvent($evenement, $request->user());
        Log::info('Media data added');

        $eventData['activities'] = ($request->user()->id === $evenement->cree_par || $request->user()->isAdmin())
            ? $evenement->activities->map(fn ($activity) => [
                'id' => $activity->id,
                'type' => $activity->type,
                'label' => $activity->label,
                'description' => $activity->description,
                'created_at' => optional($activity->created_at)->toIso8601String(),
                'user' => [
                    'id' => $activity->user?->id,
                    'name' => $activity->user?->name,
                    'role' => $activity->user?->role,
                ],
            ])->values()->all()
            : [];

        $eventData['criteria'] = optional($evenement->juryPanel)
            ->criteria
            ?->map(function ($criterion) {
                return [
                    'id' => $criterion->id,
                    'nom' => $criterion->nom,
                    'description' => $criterion->description,
                    'bareme' => $criterion->bareme !== null ? (float) $criterion->bareme : null,
                    'coefficient' => $criterion->coefficient !== null ? (float) $criterion->coefficient : null,
                    'ordre' => $criterion->ordre,
                    'actif' => (bool) $criterion->actif,
                ];
            })?->values()?->toArray() ?? [];
        Log::info('Criteria data added');

        $eventData['comments_count'] = $evenement->comments->count();
        $eventData['messages_count'] = $evenement->messages->count();
        Log::info('Counts added');

        $eventData['workflow_state'] = $this->eventService->workflowState($evenement);
        Log::info('Workflow state added', ['workflow_state' => $eventData['workflow_state']]);

        $eventData['completion'] = $this->completionService->summarize($evenement);
        /*
                ['key' => 'general', 'label' => 'Informations générales', 'weight' => 20, 'percentage' => 100, 'status' => 'complete', 'missing' => []],
                ['key' => 'program', 'label' => 'Programme', 'weight' => 30, 'percentage' => 0, 'status' => 'empty', 'missing' => ['titre']],
                ['key' => 'team', 'label' => 'Équipe', 'weight' => 25, 'percentage' => 50, 'status' => 'partial', 'missing' => ['organisateur']],
                ['key' => 'media', 'label' => 'Médias', 'weight' => 15, 'percentage' => 0, 'status' => 'empty', 'missing' => ['image']],
                ['key' => 'settings', 'label' => 'Paramètres', 'weight' => 10, 'percentage' => 100, 'status' => 'complete', 'missing' => []],
        */
        Log::info('Completion added', ['completion_percentage' => $eventData['completion']['percentage']]);

        $eventData['submission_errors'] = $this->eventService->submissionErrors($evenement);
        Log::info('Submission errors added', ['errors_count' => count($eventData['submission_errors'])]);

        $eventData['suggestions'] = $this->eventService->suggestions($evenement) ?? [];
        if (! is_array($eventData['suggestions'])) {
            $eventData['suggestions'] = [];
        }
        Log::info('Suggestions added', ['suggestions_count' => count($eventData['suggestions'])]);

        Log::info('About to render Inertia response', [
            'evenement_keys' => array_keys($eventData),
            'suggestions_type' => gettype($eventData['suggestions']),
            'suggestions_value' => json_encode($eventData['suggestions']),
            'completion_type' => gettype($eventData['completion']),
            'completion_value' => json_encode($eventData['completion']),
        ]);

        // Nettoyer les données pour éviter les objets vides
        $eventData['suggestions'] = array_filter($eventData['suggestions'], fn ($item) => is_string($item));

        return Inertia::render('evenements/Manage', [
            'evenement' => $eventData,
            'can' => [
                'edit' => $this->authorization->canEditEvent($evenement, $request->user()),
                'manage_team' => $this->authorization->isAdminOrCreator($evenement, $request->user())
                    || $this->authorization->canEditEvent($evenement, $request->user())
                    || $this->authorization->canAssignOrganizers($evenement, $request->user())
                    || $this->authorization->canAssignJury($evenement, $request->user()),
                'manage_program' => $this->authorization->canEditEvent($evenement, $request->user()),
                'manage_media' => $this->authorization->canEditEvent($evenement, $request->user()),
                'publish' => $this->authorization->isAdminOrCreator($evenement, $request->user())
                    || $this->authorization->canChangeVisibility($evenement, $request->user()),
                'delete' => $this->authorization->isAdminOrCreator($evenement, $request->user()),
                'submit' => $this->authorization->isAdminOrCreator($evenement, $request->user()),
            ],
            'meta' => $this->formMeta(),
        ]);
    }

    public function gestion(Request $request)
    {
        $user = $request->user();
        $filters = [
            'search' => trim((string) $request->string('search')),
            'status' => $request->string('status')->value() ?: 'all',
            'type' => $request->string('type')->value() ?: 'all',
            'role' => $request->string('role')->value() ?: 'all',
        ];

        $query = Evenement::query()
            ->with([
                'createur:id,name,email,role',
                'roles',
                'medias',
                'assignments.user:id,name,email,role', // 🔥 IMPORTANT
            ])
            ->withCount(['inscriptions', 'comments', 'activities'])
            ->when($filters['search'] !== '', function ($builder) use ($filters) {
                $builder->where(function ($query) use ($filters) {
                    $query->where('titre', 'like', '%'.$filters['search'].'%')
                        ->orWhere('description', 'like', '%'.$filters['search'].'%')
                        ->orWhere('lieu', 'like', '%'.$filters['search'].'%');
                });
            })
            ->when($filters['type'] !== 'all', fn ($builder) => $builder->where('type', $filters['type']))
            ->when($filters['status'] !== 'all', function ($builder) use ($filters) {
                if (in_array($filters['status'], ['pending', 'approved', 'rejected'], true)) {
                    $builder->where('validation_status', $filters['status']);

                    if ($filters['status'] === 'pending') {
                        $builder->whereNotNull('submitted_at');
                    }

                    return;
                }

                $builder->where('statut', $filters['status']);
            })
            ->latest('date_debut');

        // 👤 USER → ses événements
        if (! $user->isAdmin()) {
            $query->where(function ($builder) use ($user, $filters) {
                if ($filters['role'] === 'createur') {
                    $builder->where('cree_par', $user->id);

                    return;
                }

                if ($filters['role'] === 'organisateur') {
                    $builder->whereHas('assignments', fn ($assignments) => $assignments
                        ->where('user_id', $user->id)
                        ->where('role', 'organisateur'));

                    return;
                }

                $builder->where('cree_par', $user->id)
                    ->orWhereHas('assignments', fn ($assignments) => $assignments
                        ->where('user_id', $user->id)
                        ->where('role', 'organisateur'));
            });
        }

        $mesEvenements = $query->get()->map(
            fn (Evenement $e) => $this->serializeEvenementCard($e, $user)
        )->values();

        // 👑 ADMIN → tous les événements
        $allEventsForAdmin = ($user && $user->role === 'admin') ? $mesEvenements : [];

        return Inertia::render('evenements/EventManagement', [
            'mesEvenements' => $mesEvenements,
            'allEventsForAdmin' => $allEventsForAdmin,
            'filters' => $filters,
            'isAdmin' => ($user && $user->role === 'admin'),
            'pendingEventsCount' => Evenement::where('validation_status', 'pending')->whereNotNull('submitted_at')->count(),
        ]);
    }

    public function gestionConferences(Request $request)
    {
        return Inertia::render('evenements/create/Conference');
    }

    public function gestionConcours(Request $request)
    {
        return Inertia::render('evenements/create/Concours');
    }

    public function edit(Evenement $evenement)
    {
        $this->authorize('update', $evenement);

        $evenement->loadMissing([
            'createur',
            'roles',
            'assignments.user',
            'medias',
            'programmes',
        ]);

        if ($evenement->type === 'concours') {
            $evenement->loadMissing('juryPanel.criteria');
        }

        // Transformer en données pour formulaire avec pré-remplissage
        $eventData = new EvenementResource($evenement);
        $eventData = $eventData->toArray(request());

        // Ajouter les données d'affectations
        $eventData['assigned_users'] = $this->serializeAssignmentFormData($evenement->assignments);

        return Inertia::render('evenements/Create', [
            'mode' => 'edit',
            'evenement' => $eventData,
            'meta' => $this->formMeta(),
        ]);
    }

    public function createConcours(Request $request)
    {
        $this->authorize('create', Evenement::class);

        return Inertia::render('evenements/Create', [
            'meta' => $this->formMeta(),
            'eventType' => 'concours',
        ]);
    }

    public function createConference(Request $request)
    {
        $this->authorize('create', Evenement::class);

        return Inertia::render('evenements/Create', [
            'meta' => $this->formMeta(),
            'eventType' => 'conference',
        ]);
    }

    public function gestionOrganisateurs(Request $request)
    {
        return Inertia::render('evenements/gestion/Organisateurs');
    }

    public function gestionJury(Request $request)
    {
        return Inertia::render('evenements/gestion/Jury');
    }

    public function gestionParticipants(Request $request)
    {
        return Inertia::render('evenements/gestion/Participants');
    }

    public function gestionIntervenants(Request $request)
    {
        return Inertia::render('evenements/gestion/Intervenants');
    }

    public function notifications(Request $request)
    {
        return Inertia::render('evenements/Notifications');
    }

    public function messages(Request $request)
    {
        return Inertia::render('evenements/Messages');
    }

    private function normalizeProgrammeDate(mixed $value): ?string
    {
        if ($value instanceof \DateTimeInterface) {
            return $value->format('Y-m-d');
        }

        if (is_string($value) && $value !== '') {
            return substr($value, 0, 10);
        }

        return null;
    }
}
