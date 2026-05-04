<?php

namespace App\Http\Controllers;

use App\Models\DiplomaRequest;
use App\Models\PickupAppointment;
use App\Models\PickupSlot;
use App\Services\PickupService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PickupAppointmentController extends Controller
{
    public function store(
        Request $request,
        DiplomaRequest $diplomaRequest,
        PickupSlot $pickupSlot,
        PickupService $service,
    ): RedirectResponse {
        $this->authorize('book', $diplomaRequest);

        $service->bookSlot($diplomaRequest, $pickupSlot, $request->user());

        return to_route('diplomas.show', $diplomaRequest)
            ->with('success', 'Rendez-vous confirmé.');
    }

    public function destroy(
        Request $request,
        DiplomaRequest $diplomaRequest,
        PickupAppointment $appointment,
        PickupService $service,
    ): RedirectResponse {
        $this->authorize('cancel', $appointment);

        $service->cancelAppointment($appointment, $request->user());

        return to_route('diplomas.show', $diplomaRequest)
            ->with('success', 'Rendez-vous annulé.');
    }
}
