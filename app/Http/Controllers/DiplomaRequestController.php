<?php

namespace App\Http\Controllers;

use App\Enums\DiplomaRequestStatus;
use App\Http\Requests\Diplomas\StoreDiplomaRequest;
use App\Models\DiplomaRequest;
use App\Services\DiplomaRequestService;
use App\Support\AcademicYear;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DiplomaRequestController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', DiplomaRequest::class);

        $requests = DiplomaRequest::query()
            ->where('owner_id', $request->user()->id)
            ->latest('updated_at')
            ->get()
            ->map(fn (DiplomaRequest $r) => [
                'id' => $r->id,
                'tracking_code' => $r->tracking_code,
                'diploma_type' => $r->diploma_type,
                'academic_year' => $r->academic_year,
                'status' => $r->status->value,
                'status_label' => $r->status->label(),
                'submitted_at' => $r->submitted_at?->toIso8601String(),
                'updated_at' => $r->updated_at->toIso8601String(),
            ]);

        return Inertia::render('diplomas/index', [
            'requests' => $requests,
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', DiplomaRequest::class);

        return Inertia::render('diplomas/create', [
            'diplomaTypes' => [
                ['value' => 'licence', 'label' => 'Licence'],
                ['value' => 'master', 'label' => 'Master'],
                ['value' => 'doctorat', 'label' => 'Doctorat'],
            ],
            'academicYears' => AcademicYear::options(),
        ]);
    }

    public function store(StoreDiplomaRequest $request, DiplomaRequestService $service): RedirectResponse
    {
        $diplomaRequest = $service->createDraft($request->user(), $request->validated());

        return to_route('diplomas.show', $diplomaRequest)
            ->with('success', 'Brouillon créé. Vous pouvez désormais téléverser vos pièces justificatives.');
    }

    public function show(DiplomaRequest $diplomaRequest): Response
    {
        $this->authorize('view', $diplomaRequest);

        $diplomaRequest->load(['documents', 'events.actor', 'appointment.pickupSlot']);

        return Inertia::render('diplomas/show', [
            'request' => [
                'id' => $diplomaRequest->id,
                'tracking_code' => $diplomaRequest->tracking_code,
                'diploma_type' => $diplomaRequest->diploma_type,
                'academic_year' => $diplomaRequest->academic_year,
                'status' => $diplomaRequest->status->value,
                'status_label' => $diplomaRequest->status->label(),
                'submitted_at' => $diplomaRequest->submitted_at?->toIso8601String(),
                'rejected_reason' => $diplomaRequest->status === DiplomaRequestStatus::Rejected
                    ? $diplomaRequest->rejected_reason
                    : null,
                'documents' => $diplomaRequest->documents->map(fn ($d) => [
                    'id' => $d->id,
                    'type' => $d->type->value,
                    'type_label' => $d->type->label(),
                    'original_name' => $d->original_name,
                    'validated_at' => $d->validated_at?->toIso8601String(),
                ]),
                'events' => $diplomaRequest->events->sortByDesc('occurred_at')->values()->map(fn ($e) => [
                    'id' => $e->id,
                    'from_status' => $e->from_status?->label(),
                    'to_status' => $e->to_status->label(),
                    'actor_name' => $e->actor?->name,
                    'note' => $e->note,
                    'occurred_at' => $e->occurred_at->toIso8601String(),
                ]),
            ],
        ]);
    }
}
