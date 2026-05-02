<?php

namespace App\Http\Controllers\M5;

use App\Http\Controllers\Controller;
use App\Http\Resources\EvenementResource;
use App\Models\Evenement;
use App\Models\InscriptionEvenement;
use App\Models\EvenementRole;
use App\Models\Programme;
use App\Models\JuryPanel;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class EventController extends Controller
{
    public function index(Request $request)
    {
        $query = Evenement::query()
            ->with(['createur', 'roles', 'medias'])
            ->withCount(['inscriptions', 'comments', 'activities']);

        // Filtres
        if ($request->filled('search')) {
            $query->where('titre', 'like', '%' . $request->search . '%');
        }
        if ($request->filled('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }
        if ($request->filled('statut') && $request->statut !== 'all') {
            $query->where('statut', $request->statut);
        }

        $events = $query->latest()->paginate(12)->withQueryString();

        return Inertia::render('m5/events/Index', [
            'events' => EvenementResource::collection($events),
            'filters' => $request->all(['search', 'type', 'statut', 'date_from', 'date_to', 'public_cible']),
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'nom' => $request->user()->name,
                    'prenom' => '', 
                    'role_rbac' => $request->user()->role,
                ] : null,
            ],
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

        return Inertia::render('m5/events/Show', [
            'event' => new EvenementResource($evenement),
            'participation' => $participation,
            'auth' => [
                'user' => $user,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('m5/events/Create', [
            'auth' => [
                'user' => Auth::user(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'titre' => 'required|string|max:150',
            'description' => 'required|string',
            'type' => 'required|in:conference,concours',
            'date_debut' => 'required|date',
            'date_fin' => 'nullable|date|after:date_debut',
            'lieu' => 'nullable|string',
            'capacite_max' => 'nullable|integer|min:1',
            'visibilite' => 'required|in:public,restreint,prive',
            'public_cible' => 'nullable|array',
            'statut' => 'nullable|string',
            'theme' => 'nullable|string',
            'reglement' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($request, $validated) {
            $evenement = Evenement::create([
                ...$validated,
                'public_cible' => is_array($request->public_cible) ? implode(',', $request->public_cible) : $request->public_cible,
                'cree_par' => Auth::id(),
                'statut' => $request->statut ?? 'brouillon',
                'validation_status' => 'pending',
                'submitted_at' => $request->statut === 'en_attente' ? now() : null,
            ]);

            // Step 2 & 3 & 4 data (simplified sync)
            if ($request->filled('tags')) {
                foreach (explode(',', $request->tags) as $tag) {
                    EvenementRole::create([
                        'evenement_id' => $evenement->id,
                        'category' => 'audience',
                        'role' => trim($tag),
                    ]);
                }
            }

            if ($request->type === 'concours' && $request->filled('criteres')) {
                $panel = JuryPanel::create(['evenement_id' => $evenement->id]);
                // Criteria sync logic would go here
            }

            return redirect()->route('m5.events.index')
                ->with('success', 'Événement créé avec succès.');
        });
    }

    public function edit(Evenement $evenement)
    {
        $evenement->load(['roles', 'medias', 'programmes']);
        
        return Inertia::render('m5/events/Edit', [
            'event' => new EvenementResource($evenement),
            'auth' => [
                'user' => Auth::user(),
            ],
        ]);
    }

    public function update(Request $request, Evenement $evenement)
    {
        $validated = $request->validate([
            'titre' => 'required|string|max:150',
            'description' => 'required|string',
            'type' => 'required|in:conference,concours',
            'date_debut' => 'required|date',
            'date_fin' => 'nullable|date|after:date_debut',
            'lieu' => 'nullable|string',
            'capacite_max' => 'nullable|integer|min:1',
            'visibilite' => 'required|in:public,restreint,prive',
            'statut' => 'nullable|string',
        ]);

        $evenement->update($validated);

        if ($request->has('statut')) {
            $evenement->update(['statut' => $request->statut]);
            if ($request->statut === 'en_attente' && !$evenement->submitted_at) {
                $evenement->update(['submitted_at' => now()]);
            }
        }

        return redirect()->back()
            ->with('success', 'Événement mis à jour.');
    }
}
