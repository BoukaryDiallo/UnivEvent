<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Diplomas\StorePickupSlotRequest;
use App\Http\Requests\Diplomas\UpdatePickupSlotRequest;
use App\Models\PickupSlot;
use App\Services\PickupService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PickupSlotController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', PickupSlot::class);

        $slots = PickupSlot::query()
            ->withCount('appointments')
            ->orderBy('starts_at')
            ->get()
            ->map(fn (PickupSlot $s) => [
                'id' => $s->id,
                'location' => $s->location,
                'starts_at' => $s->starts_at->toIso8601String(),
                'ends_at' => $s->ends_at->toIso8601String(),
                'capacity' => $s->capacity,
                'reserved' => $s->appointments_count,
                'remaining' => max(0, $s->capacity - $s->appointments_count),
            ]);

        return Inertia::render('admin/pickup-slots/index', [
            'slots' => $slots,
        ]);
    }

    public function create(): Response
    {
        $this->authorize('manage', PickupSlot::class);

        return Inertia::render('admin/pickup-slots/create');
    }

    public function store(StorePickupSlotRequest $request, PickupService $service): RedirectResponse
    {
        $service->createSlot($request->user(), $request->validated());

        return to_route('admin.pickup-slots.index')
            ->with('success', 'Créneau créé.');
    }

    public function edit(PickupSlot $pickupSlot): Response
    {
        $this->authorize('update', $pickupSlot);

        return Inertia::render('admin/pickup-slots/edit', [
            'slot' => [
                'id' => $pickupSlot->id,
                'location' => $pickupSlot->location,
                'starts_at' => $pickupSlot->starts_at->format('Y-m-d\TH:i'),
                'ends_at' => $pickupSlot->ends_at->format('Y-m-d\TH:i'),
                'capacity' => $pickupSlot->capacity,
            ],
        ]);
    }

    public function update(
        UpdatePickupSlotRequest $request,
        PickupSlot $pickupSlot,
        PickupService $service,
    ): RedirectResponse {
        $service->updateSlot($pickupSlot, $request->validated());

        return to_route('admin.pickup-slots.index')
            ->with('success', 'Créneau mis à jour.');
    }

    public function destroy(PickupSlot $pickupSlot, PickupService $service): RedirectResponse
    {
        $this->authorize('delete', $pickupSlot);

        $service->deleteSlot($pickupSlot);

        return to_route('admin.pickup-slots.index')
            ->with('success', 'Créneau supprimé.');
    }
}
