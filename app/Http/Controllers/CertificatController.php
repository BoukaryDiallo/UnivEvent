<?php

namespace App\Http\Controllers;

use App\Events\EventCertificateGenerated;
use App\Models\Certificat;
use App\Models\Evenement;
use App\Models\User;
use App\Services\CertificateGenerator;
use App\Services\EventAuthorizationService;
use App\Services\EventNotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class CertificatController extends Controller
{
    public function __construct(
        private CertificateGenerator $generator,
        private EventAuthorizationService $authorization,
        private EventNotificationService $notifications,
    ) {
    }

    public function index(Request $request)
    {
        $user = $request->user();
        abort_unless($user, 403);

        $query = Certificat::with(['utilisateur:id,name,email,role', 'evenement:id,titre,type']);

        if ($request->filled('evenement_id')) {
            $evenement = Evenement::findOrFail($request->integer('evenement_id'));

            if ($this->canManageEvent($user, $evenement)) {
                $query->where('evenement_id', $evenement->id);
            } else {
                $query
                    ->where('evenement_id', $evenement->id)
                    ->where('utilisateur_id', $user->id);
            }
        } elseif (! $user->isAdmin()) {
            $query->where('utilisateur_id', $user->id);
        }

        return $query
            ->latest()
            ->get();
    }

    public function store(Request $request)
    {
        return $this->generer($request);
    }

    public function show(Certificat $certificat)
    {
        $this->authorizeCertificateAccess(request()->user(), $certificat);

        return $certificat->load(['utilisateur:id,name,email,role', 'evenement:id,titre,type']);
    }

    public function destroy(Request $request, Certificat $certificat)
    {
        $user = $request->user();
        abort_unless($user, 403);

        $evenement = Evenement::findOrFail($certificat->evenement_id);
        abort_unless($this->canManageEvent($user, $evenement), 403, 'Action non autorisee');

        if ($certificat->fichier) {
            Storage::disk('public')->delete($certificat->fichier);
        }

        $certificat->update([
            'statut' => 'revoque',
            'revoked_at' => now(),
        ]);

        return back();
    }

    public function preview(Request $request)
    {
        $actor = $request->user();
        abort_unless($actor, 403);

        $request->validate([
            'evenement_id' => 'required|exists:evenements,id',
            'utilisateur_id' => 'required|exists:users,id',
            'type' => 'nullable|string|max:255',
            'overrides' => 'nullable|array',
        ]);

        $evenement = Evenement::findOrFail($request->evenement_id);
        $user = User::findOrFail($request->utilisateur_id);
        abort_unless($this->canManageEvent($actor, $evenement), 403, 'Action non autorisee');

        return response()->json([
            'success' => true,
            'data' => $this->generator->preview($evenement, $user, $request->input('overrides', []), $request->string('type')->value() ?: null),
        ]);
    }

    public function generer(Request $request)
    {
        $actor = $request->user();
        abort_unless($actor, 403);

        $request->validate([
            'evenement_id' => 'required|exists:evenements,id',
            'utilisateur_id' => 'required|exists:users,id',
            'type' => 'nullable|string|max:255',
            'overrides' => 'nullable|array',
        ]);

        $evenement = Evenement::findOrFail($request->evenement_id);
        $user = User::findOrFail($request->utilisateur_id);
        abort_unless($this->canManageEvent($actor, $evenement), 403, 'Action non autorisee');
        $isOverrideManager = $this->authorization->isAdminOrCreator($evenement, $actor);

        abort_unless($evenement->evenement_certifie || $isOverrideManager, 422, 'Evenement non certifiant');

        if ($evenement->type === 'conference' && ! $isOverrideManager) {
            abort_unless(
                now()->greaterThanOrEqualTo($evenement->date_debut)
                || $evenement->inscriptions()->where('utilisateur_id', $user->id)->whereNotNull('checked_in_at')->exists(),
                422,
                'Certificat disponible le jour de la conference ou apres presence',
            );
        } elseif ($evenement->type !== 'conference' && ! $isOverrideManager) {
            abort_unless($evenement->results_published_at, 422, 'Resultats non valides');
        }

        abort_unless($this->userIsEligibleForCertificate($evenement, $user), 422, 'Utilisateur non eligible au certificat');

        $certificat = $this->generator->generate(
            $evenement,
            $user,
            $request->input('overrides', []),
            $request->string('type')->value() ?: null,
        );

        $this->notifications->notify(
            $user,
            'certificat_genere',
            'Certificat disponible',
            "Votre certificat pour {$evenement->titre} est pret.",
            $evenement->id,
            [
                'certificat_id' => $certificat->id,
                'code' => $certificat->code_certificat,
            ],
        );

        try {
            EventCertificateGenerated::dispatch($evenement->fresh(), $certificat);
        } catch (\Throwable $exception) {
            Log::warning('Certificate broadcast failed.', [
                'evenement_id' => $evenement->id,
                'certificat_id' => $certificat->id,
                'error' => $exception->getMessage(),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Certificat genere avec succes',
            'data' => $certificat,
        ]);
    }

    public function verifier($code)
    {
        $certificat = Certificat::with(['utilisateur', 'evenement'])
            ->where('code_certificat', $code)
            ->first();

        if (! $certificat) {
            abort(404, 'Certificat introuvable');
        }

        return view('certificats.verification', compact('certificat'));
    }

    private function authorizeCertificateAccess(?User $user, Certificat $certificat): void
    {
        abort_unless($user, 403);

        $evenement = $certificat->relationLoaded('evenement')
            ? $certificat->evenement
            : $certificat->evenement()->first();

        abort_unless(
            $user->id === $certificat->utilisateur_id
            || ($evenement && $this->canManageEvent($user, $evenement)),
            403,
            'Action non autorisee',
        );
    }

    private function canManageEvent(User $user, Evenement $evenement): bool
    {
        return $this->authorization->canManageCertificates($evenement, $user);
    }

    private function userIsEligibleForCertificate(Evenement $evenement, User $user): bool
    {
        $hasAcceptedRegistration = $evenement->inscriptions()
            ->where('utilisateur_id', $user->id)
            ->where('statut', 'accepte')
            ->exists();

        $hasResult = $evenement->resultats()
            ->where('utilisateur_id', $user->id)
            ->exists();

        return $hasAcceptedRegistration || $hasResult;
    }
}
