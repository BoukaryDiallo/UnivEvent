<?php

namespace App\Http\Controllers\M5;

use App\Http\Controllers\Controller;
use App\Models\Certificat;
use App\Models\Evenement;
use App\Models\EvenementActivity;
use App\Models\EventType;
use App\Models\InscriptionEvenement;
use App\Support\DatabaseHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class EventAdminDashboardController extends Controller
{
    public function index(Request $request)
    {
        $allEvents = Evenement::with(['createur'])->withCount('inscriptions')->get();
        $allInscriptions = InscriptionEvenement::with(['utilisateur', 'evenement'])->latest()->get();
        $totalEvents = $allEvents->count();
        $publishedEvents = $allEvents->where('statut', 'publie');
        $pendingEvents = $allEvents->where('statut', 'en_attente');
        $totalParticipants = $allInscriptions->count();
        $totalCertificats = Certificat::count();

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
            'evenements_en_attente' => $pendingEvents->take(5)->map(fn ($event) => [
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

    public function participants(Request $request)
    {
        $query = InscriptionEvenement::with(['utilisateur', 'evenement'])
            ->latest();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('utilisateur', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })->orWhereHas('evenement', function ($q) use ($search) {
                $q->where('titre', 'like', "%{$search}%");
            });
        }

        if ($request->filled('statut') && $request->statut !== 'all') {
            $query->where('statut', $request->statut);
        }

        return Inertia::render('module5/admin/Participants', [
            'inscriptions' => $query->paginate(20)->withQueryString(),
            'filters' => $request->only(['search', 'statut']),
        ]);
    }

    public function storeType(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'features' => 'required|array',
            'allow_organizer' => 'boolean',
            'allow_intervenant' => 'boolean',
            'allow_jury' => 'boolean',
            'allow_participant' => 'boolean',
        ]);

        EventType::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'description' => $validated['description'],
            'features' => $validated['features'],
            'allow_organizer' => $request->boolean('allow_organizer'),
            'allow_intervenant' => $request->boolean('allow_intervenant'),
            'allow_jury' => $request->boolean('allow_jury'),
            'allow_participant' => $request->boolean('allow_participant'),
        ]);

        return redirect()->back()->with('success', 'Type d\'événement créé.');
    }

    public function updateType(Request $request, EventType $eventType)
    {
        if (in_array($eventType->slug, ['concours', 'conference'])) {
            return redirect()->back()->with('error', 'Les types système ne peuvent pas être modifiés.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'features' => 'required|array',
            'is_active' => 'boolean',
            'allow_organizer' => 'boolean',
            'allow_intervenant' => 'boolean',
            'allow_jury' => 'boolean',
            'allow_participant' => 'boolean',
        ]);

        $eventType->update([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'description' => $validated['description'],
            'features' => $validated['features'],
            'is_active' => $validated['is_active'] ?? $eventType->is_active,
            'allow_organizer' => $request->boolean('allow_organizer'),
            'allow_intervenant' => $request->boolean('allow_intervenant'),
            'allow_jury' => $request->boolean('allow_jury'),
            'allow_participant' => $request->boolean('allow_participant'),
        ]);

        return redirect()->back()->with('success', 'Type d\'événement mis à jour.');
    }

    public function deleteType(EventType $eventType)
    {
        if (in_array($eventType->slug, ['concours', 'conference'])) {
            return redirect()->back()->with('error', 'Les types système ne peuvent pas être supprimés.');
        }

        $eventType->delete();

        return redirect()->back()->with('success', 'Type d\'événement supprimé.');
    }
}
