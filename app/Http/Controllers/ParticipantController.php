<?php

namespace App\Http\Controllers;

use App\Models\Evenement;
use App\Services\CertificateService;
use App\Services\EventAuthorizationService;
use App\Services\MediaService;
use App\Services\ParticipantService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ParticipantController extends Controller
{
    public function __construct(
        private EventAuthorizationService $authorization,
        private ParticipantService $participantService,
        private MediaService $mediaService,
        private CertificateService $certificateService,
    ) {}

    public function show(Request $request, Evenement $evenement)
    {
        $user = $request->user();
        abort_unless($user, 403);
        abort_unless($this->authorization->canView($evenement, $user), 403);

        $evenement->load([
            'createur',
            'roles',
            'assignments.user',
            'medias',
            'programmes',
            'activities.user',
            'inscriptions.utilisateur',
            'comments.user',
            'comments.replies.user',
            'messages.user',
            'messages.replies.user',
            'jury.criteria',
            'jury.deliberations',
            'resultats.utilisateur',
            'certificats',
        ]);

        $payload = $this->participantService->buildParticipantEventPayload($evenement, $user);

        return Inertia::render('participants/Show', [
            'event' => $payload,
            'can' => [
                'viewScores' => $evenement->competition_status === 'resultats_publies',
                'downloadCertificate' => (bool) $payload['certificate'],
            ],
        ]);
    }

    public function downloadCertificate(Request $request, Evenement $evenement)
    {
        $user = $request->user();
        abort_unless($user, 403);
        abort_unless($this->authorization->canView($evenement, $user), 403);

        $certificate = $this->certificateService->latestCertificateForParticipant($evenement, $user);
        abort_unless($certificate, 404, 'Certificat non trouve');

        return response()->download(
            Storage::disk('public')->path($certificate->fichier),
            basename($certificate->fichier),
        );
    }
}
