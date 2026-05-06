<?php

namespace App\Http\Controllers;

use App\Models\Evenement;
use App\Services\EventValidationService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EventAdminController extends Controller
{
    public function __construct(
        private EventValidationService $validationService,
    ) {
    }

    public function pendingEvents(Request $request)
    {
        $this->authorize('viewAny', Evenement::class);

        $query = Evenement::query()
            ->with(['createur:id,name,email,role', 'roles', 'medias'])
            ->where('validation_status', 'pending')
            ->whereNotNull('submitted_at');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('titre', 'like', "%{$search}%")
                    ->orWhereHas('createur', function ($q2) use ($search) {
                        $q2->where('name', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->filled('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        $events = $query->latest('submitted_at')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('module5/events/PendingEvents', [
            'events' => $events,
            'filters' => $request->only(['search', 'type']),
        ]);
    }

    public function approve(Request $request, Evenement $evenement)
    {
        $this->authorize('approve', $evenement);

        $this->validationService->approve($evenement, $request->user(), $request->string('reason')->value() ?: null);

        return back()->with('success', 'Evenement approuve avec succes.');
    }

    public function reject(Request $request, Evenement $evenement)
    {
        $this->authorize('approve', $evenement);

        $validated = $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        $this->validationService->reject($evenement, $request->user(), $validated['reason']);

        return back()->with('success', 'Evenement rejete.');
    }
}
