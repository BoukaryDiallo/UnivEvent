<?php

namespace App\Http\Controllers\M5;

use App\Http\Controllers\Controller;
use App\Http\Resources\EvenementResource;
use App\Models\Evenement;
use App\Models\EvenementReaction;
use App\Models\EvenementRole;
use App\Models\EventType;
use App\Models\InscriptionEvenement;
use App\Models\JuryPanel;
use App\Models\User;
use App\Services\EventCompletionService;
use App\Services\EventService;
use App\Services\MediaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class EventController extends Controller
{
    public function __construct(
        private MediaService $mediaService,
        private EventCompletionService $completionService,
        private EventService $eventService,
    ) {}

    public function index(Request $request)
    {
        $user = Auth::user();
        $query = Evenement::query()
            ->with(['createur', 'roles', 'medias', 'assignments', 'programmes', 'juryPanel.criteria'])
            ->withCount(['inscriptions', 'comments', 'activities']);

        // Visibility Scoping:
        // 1. Published events are visible to everyone
        // 2. Drafts/Rejected are only visible to the creator OR admin
        // 3. Pending are visible to creator OR admin
        $query->where(function ($q) use ($user) {
            $q->where('statut', 'publie')
                ->orWhere('cree_par', $user->id)
                ->when($user && $user->role === 'admin', fn ($adminQuery) => $adminQuery->orWhereIn('statut', ['en_attente', 'annule', 'brouillon']));
        });

        // Filtres
        if ($request->filled('search')) {
            $query->where('titre', 'like', '%'.$request->search.'%');
        }
        if ($request->filled('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }
        if ($request->filled('statut') && $request->statut !== 'all') {
            $query->where('statut', $request->statut);
        }

        if ($request->query('filter') === 'mine') {
            $query->where('cree_par', $user->id);
        }

        $events = $query->latest()->paginate(12)->withQueryString();

        // Ajouter les données de complétion
        $eventsWithCompletion = $events->getCollection()->map(function (Evenement $event) {
            $data = (new EvenementResource($event))->resolve();
            $data['completion'] = $this->completionService->summarize($event);

            return $data;
        });

        $events->setCollection($eventsWithCompletion);

        return Inertia::render('module5/events/Index', [
            'events' => $events,
            'filters' => $request->all(['search', 'type', 'statut', 'date_from', 'date_to', 'public_cible']),
        ]);
    }

    public function show(Evenement $evenement)
    {
        $user = Auth::user();
        $evenement->load(['createur', 'roles', 'medias', 'programmes', 'assignments.user']);

        $participation = $user
            ? InscriptionEvenement::where('evenement_id', $evenement->id)
                ->where('utilisateur_id', $user->id)
                ->first()
            : null;

        return Inertia::render('module5/events/Show', [
            'event' => (new EvenementResource($evenement))->resolve(),
            'participation' => $participation,
        ]);
    }

    public function toggleReaction(Request $request, Evenement $evenement)
    {
        $user = Auth::user();
        abort_unless($user, 401);

        $reaction = EvenementReaction::where([
            'evenement_id' => $evenement->id,
            'user_id' => $user->id,
        ])->first();

        if ($reaction) {
            $reaction->delete();
        } else {
            EvenementReaction::create([
                'evenement_id' => $evenement->id,
                'user_id' => $user->id,
                'type' => 'like',
            ]);

            $evenement->activities()->create([
                'user_id' => $user->id,
                'type' => 'evenement_aime',
                'label' => 'Événement aimé',
                'description' => "Un utilisateur a aimé l'événement.",
                'meta' => ['type' => 'like'],
            ]);
        }

        return back();
    }

    public function create(Request $request)
    {
        return Inertia::render('module5/events/Create', [
            'event_types' => EventType::where('is_active', true)->get(),
        ]);
    }

    public function manage(Evenement $evenement)
    {
        $user = Auth::user();
        $evenement->load([
            'createur',
            'roles',
            'medias',
            'programmes',
            'assignments.user',
            'juryPanel.criteria',
        ]);

        return Inertia::render('module5/events/Manage', [
            'event' => (new EvenementResource($evenement))->resolve(),
            'assignable_users' => User::select(['id', 'name', 'email', 'role'])->orderBy('name')->get()->map(fn ($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ]),
            'completion' => $this->completionService->summarize($evenement),
            'suggestions' => $this->eventService->suggestions($evenement),
            'submission_errors' => $this->eventService->submissionErrors($evenement),
        ]);
    }

    public function edit(Evenement $evenement)
    {
        return Inertia::render('module5/events/Edit', [
            'event' => (new EvenementResource($evenement))->resolve(),
            'event_types' => EventType::where('is_active', true)->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'titre' => 'required|string|max:150',
            'description' => 'required|string',
            'type' => 'required|string',
            'date_debut' => 'required|date',
            'date_fin' => 'nullable|date|after:date_debut',
            'lieu' => 'nullable|string',
            'capacite_max' => 'nullable|integer|min:1',
            'visibilite' => 'required|in:public,restreint,prive',
            'public_cible' => 'nullable|array',
            'statut' => 'nullable|string',
            'theme' => 'nullable|string',
            'reglement' => 'nullable|string',
            'affiche' => 'nullable|image|max:5120',
            'allow_organizer' => 'boolean',
            'allow_intervenant' => 'boolean',
            'allow_jury' => 'boolean',
            'allow_participant' => 'boolean',
        ]);

        return DB::transaction(function () use ($request, $validated) {
            $evenement = Evenement::create([
                ...$validated,
                'public_cible' => is_array($request->public_cible) ? implode(',', $request->public_cible) : ($request->public_cible ?? 'tous'),
                'cree_par' => Auth::id(),
                'statut' => $request->statut ?? 'brouillon',
                'validation_status' => 'pending',
                'submitted_at' => $request->statut === 'en_attente' ? now() : null,
                'allow_organizer' => $request->boolean('allow_organizer', true),
                'allow_intervenant' => $request->boolean('allow_intervenant', true),
                'allow_jury' => $request->boolean('allow_jury', false),
                'allow_participant' => $request->boolean('allow_participant', true),
            ]);

            // Handle Poster (Affiche)
            if ($request->hasFile('affiche')) {
                $this->mediaService->uploadMedia($evenement, $request->file('affiche'), [
                    'description' => 'Affiche de l\'événement',
                    'is_public' => true,
                    'is_cover' => true,
                ]);
            }

            // Tags
            if ($request->filled('tags')) {
                $tags = is_array($request->tags) ? $request->tags : explode(',', $request->tags);
                foreach ($tags as $tag) {
                    EvenementRole::create([
                        'evenement_id' => $evenement->id,
                        'category' => 'audience',
                        'role' => trim($tag),
                    ]);
                }
            }

            // Type-specific logic
            if ($request->type === 'concours') {
                $panel = JuryPanel::create(['evenement_id' => $evenement->id]);
                if ($request->filled('criteres')) {
                    // Logic to sync criteria
                }
            }

            return redirect()->route('module5.events.index')
                ->with('success', 'Événement créé avec succès.');
        });
    }

    public function update(Request $request, Evenement $evenement)
    {
        $validated = $request->validate([
            'titre' => 'required|string|max:150',
            'description' => 'required|string',
            'type' => 'required|string',
            'date_debut' => 'required|date',
            'date_fin' => 'nullable|date|after:date_debut',
            'lieu' => 'nullable|string',
            'capacite_max' => 'nullable|integer|min:1',
            'visibilite' => 'required|in:public,restreint,prive',
            'statut' => 'nullable|string',
            'affiche' => 'nullable|image|max:5120',
            'allow_organizer' => 'boolean',
            'allow_intervenant' => 'boolean',
            'allow_jury' => 'boolean',
            'allow_participant' => 'boolean',
            'comment_policy' => 'nullable|string|in:all,registered,accepted_participants,readonly',
            'comments_enabled' => 'boolean',
            'messages_enabled' => 'boolean',
            'evenement_certifie' => 'boolean',
            'certificate_template_schema' => 'nullable|array',
        ]);

        $evenement->update([
            'titre' => $validated['titre'],
            'description' => $validated['description'],
            'type' => $validated['type'],
            'date_debut' => $validated['date_debut'],
            'date_fin' => $validated['date_fin'] ?? null,
            'lieu' => $validated['lieu'] ?? null,
            'capacite_max' => $validated['capacite_max'] ?? null,
            'visibilite' => $validated['visibilite'],
            'allow_organizer' => $request->boolean('allow_organizer', $evenement->allow_organizer),
            'allow_intervenant' => $request->boolean('allow_intervenant', $evenement->allow_intervenant),
            'allow_jury' => $request->boolean('allow_jury', $evenement->allow_jury),
            'allow_participant' => $request->boolean('allow_participant', $evenement->allow_participant),
            'comment_policy' => $validated['comment_policy'] ?? $evenement->comment_policy,
            'comments_enabled' => $request->boolean('comments_enabled', $evenement->comments_enabled),
            'messages_enabled' => $request->boolean('messages_enabled', $evenement->messages_enabled),
            'evenement_certifie' => $request->boolean('evenement_certifie', $evenement->evenement_certifie),
            'certificate_template_schema' => $validated['certificate_template_schema'] ?? $evenement->certificate_template_schema,
        ]);

        if ($request->hasFile('affiche')) {
            $this->mediaService->uploadMedia($evenement, $request->file('affiche'), [
                'description' => 'Affiche de l\'événement',
                'is_public' => true,
                'is_cover' => true,
            ]);
        }

        if ($request->has('statut')) {
            $evenement->update(['statut' => $request->statut]);
            if ($request->statut === 'en_attente' && ! $evenement->submitted_at) {
                $evenement->update(['submitted_at' => now()]);
            }
        }

        return redirect()->back()
            ->with('success', 'Événement mis à jour.');
    }
}
