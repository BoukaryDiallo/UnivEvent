<?php

namespace App\Http\Controllers;

use App\Events\EventStatusUpdated;
use App\Models\Evenement;
use App\Models\EvenementActivity;
use App\Models\EvenementMedia;
use App\Models\JuryPanel;
use App\Models\User;
use App\Http\Requests\StoreEvenementRequest;
use App\Http\Resources\EvenementResource;
use App\Services\EventAuthorizationService;
use App\Services\EventNotificationService;
use App\Services\EventManagementService;
use App\Services\JuryWorkflowService;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class EvenementController extends Controller
{
    private const ASSIGNMENT_ROLES = ['organisateur', 'participant', 'intervenant', 'jury'];

    public function __construct(
        private EventNotificationService $notifications,
        private EventAuthorizationService $authorization,
        private EventManagementService $eventService,
        private JuryWorkflowService $juryWorkflow,
    ) {
    }

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

        $query = Evenement::query()
            ->with(['createur:id,name,email,role', 'roles', 'medias'])
            ->withCount(['inscriptions', 'comments', 'activities'])
            ->when($user, fn ($builder) => $builder->with([
                'inscriptions' => fn ($relation) => $relation
                    ->where('utilisateur_id', $user->id)
                    ->latest(),
            ]))
            ->when($user && ! $user->isAdmin(), function ($builder) use ($user) {
                $builder->where(function ($query) use ($user) {
                    $query->where('cree_par', $user->id)
                        ->orWhereHas('assignments', fn ($assignments) => $assignments->where('user_id', $user->id))
                        ->orWhereDoesntHave('roles')
                        ->orWhereHas('roles', fn ($roles) => $roles->whereIn('role', ['tous', $user->role]));
                });
            })
            ->when(! $user, fn ($builder) => $builder->where('statut', 'publie'))
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
            ->where('date_debut', '>=', now()->subDays(7))
            ->when($user && ! $user->isAdmin(), function ($builder) use ($user) {
                $builder->where(function ($query) use ($user) {
                    $query->where('cree_par', $user->id)
                        ->orWhereHas('assignments', fn ($assignments) => $assignments->where('user_id', $user->id))
                        ->orWhereDoesntHave('roles')
                        ->orWhereHas('roles', fn ($roles) => $roles->whereIn('role', ['tous', $user->role]));
                });
            });

        $evenements = EvenementResource::collection($query->paginate(9)->withQueryString());

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
                'total' => Evenement::count(),
                'published' => Evenement::where('statut', 'publie')->count(),
                'upcoming' => Evenement::where('date_debut', '>', now())->count(),
            ],
            'availableRoles' => $this->availableRoles(),
            'recommendations' => $recommendations,
            'recentEvents' => $recentEvents,
            'influentialEvents' => $influentialEvents,
        ]);
    }

    public function create(Request $request)
    {
        abort_unless($request->user(), 403);

        return Inertia::render('evenements/Create', [
            'meta' => $this->formMeta(),
        ]);
    }

    public function store(StoreEvenementRequest $request)
    {
        abort_unless($request->user(), 403);
        $validated = $request->validated();
        $this->ensureNoConflict($validated);

        $evenement = DB::transaction(function () use ($request, $validated) {
            $evenement = Evenement::create([
                'titre' => $validated['titre'],
                'description' => $validated['description'] ?? null,
                'type' => $validated['type'],
                'date_debut' => $validated['date_debut'],
                'date_fin' => $validated['date_fin'] ?? null,
                'lieu' => $validated['lieu'] ?? null,
                'lien_live' => $validated['lien_live'] ?? null,
                'visibilite' => $validated['visibilite'] ?? 'public',
                'public_cible' => $validated['public_cible'] ?? 'tous',
                'statut' => $validated['statut'] ?? 'brouillon',
                'cree_par' => $request->user()->id,
                'inscription_requise' => $request->boolean('inscription_requise', true),
                'capacite_max' => $validated['capacite_max'] ?? null,
                'checkin_active' => $request->boolean('checkin_active'),
                'comments_enabled' => $request->boolean('comments_enabled', true),
                'comment_replies_enabled' => $request->boolean('comment_replies_enabled', true),
                'comment_reactions_enabled' => $request->boolean('comment_reactions_enabled', true),
                'comment_policy' => $validated['comment_policy'] ?? 'accepted_participants',
                'messages_enabled' => $request->boolean('messages_enabled', true),
                'evenement_certifie' => $request->boolean('evenement_certifie'),
                'allow_participant_result_tracking' => $request->boolean('allow_participant_result_tracking'),
                'certificate_template_schema' => $validated['certificate_template_schema'] ?? null,
                'certificate_template_version' => $validated['certificate_template_version'] ?? 'template_v1',
                'competition_status' => $validated['competition_status'] ?? 'configuration',
            ]);

            $this->syncRoles($evenement, $validated['roles'] ?? []);
            $this->eventService->syncAssignments($evenement, $validated['assigned_users'] ?? []);
            $this->eventService->syncProgrammes($evenement, $validated['programmes'] ?? []);
            $this->eventService->storeBanner($request, $evenement);
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
            $this->logActivity($evenement, $request->user()->id, 'creation', 'Evenement cree', 'L evenement a ete cree et sauvegarde.');

            return $evenement;
        });

        return redirect()->route('evenements.show', $evenement);
    }

    public function show(Request $request, Evenement $evenement)
    {
        $this->authorizeAction($evenement, $request->user());
        
        $evenement->load(['createur', 'roles', 'assignments.user', 'medias', 'programmes', 'activities.user', 'inscriptions']);

        return Inertia::render('evenements/Show', [
            'evenement' => new EvenementResource($evenement),
            'can' => $this->authorization->getPermissions($evenement, $request->user()),
            'meta' => $this->formMeta(),
        ]);
    }
// ... Suppression de centaines de lignes de sérialisation manuelle ...

    public function destroy(Request $request, Evenement $evenement)
    {
        abort_unless($this->authorization->isAdminOrCreator($evenement, $request->user()), 403);

        $evenement->load('medias');

        foreach ($evenement->medias as $media) {
            Storage::disk('public')->delete($media->chemin_fichier);
        }

        $evenement->delete();

        return redirect()->route('evenements.index');
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

        EventStatusUpdated::dispatch($evenement->fresh(), $request->user(), 'Evenement publie.');

        return back();
    }

    public function archiver(Request $request, Evenement $evenement)
    {
        abort_unless($this->authorization->isAdminOrCreator($evenement, $request->user()), 403);

        $evenement->update([
            'statut' => 'cloture',
        ]);

        $this->logActivity($evenement, $request->user()->id, 'archivage', 'Evenement archive', 'L evenement a ete archive et retire des flux actifs.');

        EventStatusUpdated::dispatch($evenement->fresh(), $request->user(), 'Evenement archive.');

        return back();
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

    private function serializeEvenementCard(Evenement $evenement, $user): array
    {
        $cover = $evenement->medias->firstWhere('type', 'image');
        $currentInscription = $user
            ? $evenement->inscriptions->firstWhere('utilisateur_id', $user->id)
            : null;

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
            'participation' => $currentInscription ? [
                'id' => $currentInscription->id,
                'statut' => $this->mapParticipationStatus($currentInscription->statut),
                'backend_statut' => $currentInscription->statut,
            ] : null,
            'can_join' => $user ? $this->canJoin($evenement, $user) : false,
        ];
    }

    private function serializeEvenementDetail(Evenement $evenement, ?int $currentInscriptionId): array
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

    private function canManage(Evenement $evenement, $user): bool
    {
        return $this->authorization->canEditEvent($evenement, $user);
    }

    private function canJoin(Evenement $evenement, $user): bool
    {
        if (! $user || $this->authorization->canEditEvent($evenement, $user) || in_array($evenement->statut, ['cloture', 'archive'], true)) {
            return false;
        }

        $roles = $evenement->roles->pluck('role');

        if ($roles->isEmpty()) {
            return true;
        }

        return $roles->contains('tous') || $roles->contains($user->role);
    }

    private function authorizeAction(Evenement $evenement, $user): void
    {
        if (! $user) {
            abort(403, 'Non authentifie');
        }

        if ($this->authorization->canView($evenement, $user) || $this->canJoin($evenement, $user)) {
            return;
        }

        abort(403, 'Acces refuse pour ce role');
    }

    private function authorizeManagement(Evenement $evenement, $user): void
    {
        if ($this->authorization->canEditEvent($evenement, $user)) {
            return;
        }

        abort(403, 'Action non autorisee');
    }

    private function availableRoles(): array
    {
        return ['tous', 'etudiant', 'enseignant', 'organisateur', 'participant', 'jury', 'intervenant', 'admin'];
    }

    private function formMeta(): array
    {
        return [
            'availableRoles' => $this->availableRoles(),
            'assignmentRoles' => collect(self::ASSIGNMENT_ROLES)->map(fn ($role) => [
                'value' => $role,
                'label' => ucfirst($role),
            ])->values(),
            'commentPolicies' => [
                ['value' => 'all_registered', 'label' => 'Tous les inscrits'],
                ['value' => 'accepted_participants', 'label' => 'Participants acceptes'],
                ['value' => 'organizers_jury_only', 'label' => 'Organisateurs et jury'],
                ['value' => 'readonly', 'label' => 'Lecture seule'],
            ],
            'assignableUsers' => User::query()
                ->where('est_actif', true)
                ->orderBy('name')
                ->get(['id', 'name', 'email', 'role'])
                ->map(fn (User $user) => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ])
                ->values(),
            'types' => [
                ['value' => 'conference', 'label' => 'Conference'],
                ['value' => 'concours', 'label' => 'Competition'],
            ],
            'visibilities' => [
                ['value' => 'public', 'label' => 'Public'],
                ['value' => 'prive', 'label' => 'Prive'],
                ['value' => 'restreint', 'label' => 'Validation requise'],
            ],
            'statuses' => [
                ['value' => 'brouillon', 'label' => 'Brouillon'],
                ['value' => 'publie', 'label' => 'Publie'],
                ['value' => 'en_cours', 'label' => 'En cours'],
                ['value' => 'cloture', 'label' => 'Cloture'],
                ['value' => 'archive', 'label' => 'Archive'],
            ],
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

    private function recommendedEvents($user, ?int $excludeId = null, ?Collection $baseEvents = null)
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

    private function serializeComment($comment, ?int $currentUserId): array
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
        $evenement->activities()->create([
            'user_id' => $userId,
            'type' => $type,
            'label' => $label,
            'description' => $description,
            'meta' => $meta,
        ]);
    }

    private function serializeAccessPass(Evenement $evenement, $currentInscription): ?array
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

    private function serializePermissions($assignment): array
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
}
