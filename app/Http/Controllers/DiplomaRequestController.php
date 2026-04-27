<?php

namespace App\Http\Controllers;

use App\Enums\DiplomaRequestStatus;
use App\Enums\DocumentType;
use App\Http\Requests\Diplomas\StoreDiplomaRequest;
use App\Http\Requests\Diplomas\SubmitDiplomaRequest;
use App\Models\DiplomaRequest;
use App\Models\PickupSlot;
use App\Presenters\DiplomaRequestPresenter;
use App\Services\DiplomaRequestService;
use App\Support\AcademicYear;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class DiplomaRequestController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', DiplomaRequest::class);

        $requests = DiplomaRequest::query()
            ->where('owner_id', $request->user()->id)
            ->latest('updated_at')
            ->get()
            ->map(DiplomaRequestPresenter::row(...));

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

    public function show(Request $request, DiplomaRequest $diplomaRequest): Response
    {
        $this->authorize('view', $diplomaRequest);

        $diplomaRequest->load(['documents', 'events.actor', 'appointment.pickupSlot']);

        $viewer = $request->user();

        $availableSlots = $diplomaRequest->status === DiplomaRequestStatus::ReadyForPickup
            ? PickupSlot::query()
                ->withCount('appointments')
                ->where('starts_at', '>', now())
                ->orderBy('starts_at')
                ->get()
                ->filter(fn (PickupSlot $s) => $s->appointments_count < $s->capacity)
                ->values()
                ->map(fn (PickupSlot $s) => DiplomaRequestPresenter::slot($s))
                ->all()
            : [];

        return Inertia::render('diplomas/show', [
            'request' => DiplomaRequestPresenter::detail($diplomaRequest, $viewer),
            'can' => DiplomaRequestPresenter::abilities($diplomaRequest, $viewer),
            'documentTypes' => collect(DocumentType::cases())
                ->map(fn (DocumentType $t) => ['value' => $t->value, 'label' => $t->label()])
                ->all(),
            'availableSlots' => $availableSlots,
        ]);
    }

    public function submit(
        SubmitDiplomaRequest $request,
        DiplomaRequest $diplomaRequest,
        DiplomaRequestService $service,
    ): RedirectResponse {
        $service->submit($diplomaRequest, $request->user());

        return to_route('diplomas.show', $diplomaRequest)
            ->with('success', 'Demande soumise. Elle est désormais en cours d\'instruction.');
    }

    public function exportPdf(DiplomaRequest $diplomaRequest, DiplomaRequestService $service): SymfonyResponse
    {
        $this->authorize('view', $diplomaRequest);

        return $service->exportPdf($diplomaRequest);
    }
}
