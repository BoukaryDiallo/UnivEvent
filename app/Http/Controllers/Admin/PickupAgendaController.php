<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PickupAppointment;
use App\Models\PickupSlot;
use Inertia\Inertia;
use Inertia\Response;

class PickupAgendaController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', PickupSlot::class);

        $slots = PickupSlot::query()
            ->with([
                'appointments.diplomaRequest:id,tracking_code,owner_id,status',
                'appointments.diplomaRequest.owner:id,name,email',
            ])
            ->where('starts_at', '>=', now()->startOfDay())
            ->orderBy('starts_at')
            ->get();

        $days = $slots
            ->groupBy(fn (PickupSlot $s) => $s->starts_at->format('Y-m-d'))
            ->map(fn ($group, $date) => [
                'date' => $date,
                'label' => $group->first()->starts_at->translatedFormat('l d F Y'),
                'slots' => $group->map(fn (PickupSlot $s) => [
                    'id' => $s->id,
                    'location' => $s->location,
                    'starts_at' => $s->starts_at->toIso8601String(),
                    'ends_at' => $s->ends_at->toIso8601String(),
                    'capacity' => $s->capacity,
                    'reserved' => $s->appointments->count(),
                    'remaining' => max(0, $s->capacity - $s->appointments->count()),
                    'appointments' => $s->appointments
                        ->map(fn (PickupAppointment $a) => [
                            'id' => $a->id,
                            'tracking_code' => $a->diplomaRequest->tracking_code,
                            'request_id' => $a->diplomaRequest->id,
                            'student_name' => $a->diplomaRequest->owner?->name,
                            'student_email' => $a->diplomaRequest->owner?->email,
                            'delivered_at' => $a->delivered_at?->toIso8601String(),
                        ])
                        ->values()
                        ->all(),
                ])->values()->all(),
            ])
            ->values()
            ->all();

        return Inertia::render('admin/pickup-slots/agenda', [
            'days' => $days,
        ]);
    }
}
