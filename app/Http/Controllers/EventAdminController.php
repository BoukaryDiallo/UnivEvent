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

        $events = Evenement::query()
            ->with(['createur:id,name,email,role', 'roles', 'medias'])
            ->where('validation_status', 'pending')
            ->whereNotNull('submitted_at')
            ->latest('created_at')
            ->paginate(20);

        return Inertia::render('admin/events/PendingEvents', [
            'events' => $events,
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
