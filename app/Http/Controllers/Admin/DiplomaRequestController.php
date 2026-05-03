<?php

namespace App\Http\Controllers\Admin;

use App\Enums\DiplomaRequestStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Diplomas\DeliverDiplomaRequest;
use App\Http\Requests\Diplomas\RejectDiplomaRequest;
use App\Models\DiplomaRequest;
use App\Presenters\DiplomaRequestPresenter;
use App\Services\DiplomaRequestService;
use App\Services\PickupService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DiplomaRequestController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAnyAdmin', DiplomaRequest::class);

        $statusFilter = $request->query('status');
        $validStatuses = collect(DiplomaRequestStatus::cases())
            ->reject(fn (DiplomaRequestStatus $s) => $s === DiplomaRequestStatus::Draft);

        $requests = DiplomaRequest::query()
            ->with('owner:id,name,email')
            ->whereNot('status', DiplomaRequestStatus::Draft)
            ->when(
                $statusFilter && $validStatuses->contains(fn ($s) => $s->value === $statusFilter),
                fn ($q) => $q->where('status', $statusFilter),
            )
            ->orderByRaw('submitted_at IS NULL')
            ->latest('submitted_at')
            ->get()
            ->map(DiplomaRequestPresenter::adminRow(...));

        return Inertia::render('admin/diplomas/index', [
            'requests' => $requests,
            'filter' => [
                'status' => $statusFilter,
            ],
            'statusOptions' => $validStatuses
                ->map(fn (DiplomaRequestStatus $s) => [
                    'value' => $s->value,
                    'label' => $s->label(),
                ])
                ->values()
                ->all(),
        ]);
    }

    public function show(Request $request, DiplomaRequest $diplomaRequest): Response
    {
        $this->authorize('instruct', $diplomaRequest);

        $diplomaRequest->load([
            'owner:id,name,email',
            'documents.validator:id,name',
            'events.actor',
            'appointment.pickupSlot',
            'appointment.deliveredBy:id,name',
        ]);

        $viewer = $request->user();

        return Inertia::render('admin/diplomas/show', [
            'request' => DiplomaRequestPresenter::adminDetail($diplomaRequest, $viewer),
            'can' => DiplomaRequestPresenter::adminAbilities($diplomaRequest, $viewer),
        ]);
    }

    public function validateDossier(
        Request $request,
        DiplomaRequest $diplomaRequest,
        DiplomaRequestService $service,
    ): RedirectResponse {
        $this->authorize('validateDossier', $diplomaRequest);

        $service->validateDossier($diplomaRequest, $request->user());

        return to_route('admin.diplomas.show', $diplomaRequest)
            ->with('success', 'Dossier validé.');
    }

    public function reject(
        RejectDiplomaRequest $request,
        DiplomaRequest $diplomaRequest,
        DiplomaRequestService $service,
    ): RedirectResponse {
        $service->reject($diplomaRequest, $request->user(), $request->validated('reason'));

        return to_route('admin.diplomas.show', $diplomaRequest)
            ->with('success', 'Dossier rejeté.');
    }

    public function markReadyForPickup(
        Request $request,
        DiplomaRequest $diplomaRequest,
        DiplomaRequestService $service,
    ): RedirectResponse {
        $this->authorize('markReadyForPickup', $diplomaRequest);

        $service->markReadyForPickup($diplomaRequest, $request->user());

        return to_route('admin.diplomas.show', $diplomaRequest)
            ->with('success', 'Dossier marqué comme prêt à retirer.');
    }

    public function deliver(
        DeliverDiplomaRequest $request,
        DiplomaRequest $diplomaRequest,
        PickupService $service,
    ): RedirectResponse {
        $service->deliver(
            $diplomaRequest,
            $request->user(),
            $request->file('receipt'),
        );

        return to_route('admin.diplomas.show', $diplomaRequest)
            ->with('success', 'Diplôme acté comme remis.');
    }

    public function archive(
        Request $request,
        DiplomaRequest $diplomaRequest,
        DiplomaRequestService $service,
    ): RedirectResponse {
        $this->authorize('archive', $diplomaRequest);

        $service->archive($diplomaRequest, $request->user());

        return to_route('admin.diplomas.show', $diplomaRequest)
            ->with('success', 'Dossier archivé.');
    }
}
