<?php

namespace App\Http\Controllers;

use App\Models\Evenement;
use App\Models\InscriptionEvenement;
use App\Services\EventAuthorizationService;
use App\Services\EventNotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Support\Str;

class InscriptionEvenementController extends Controller
{
    public function __construct(
        private EventNotificationService $notifications,
        private EventAuthorizationService $authorization,
    )
    {
    }

    public function index(Request $request)
    {
        $evenementId = $request->integer('evenement_id');

        abort_unless($evenementId, 404);

        return InscriptionEvenement::with('utilisateur:id,name,email,role')
            ->where('evenement_id', $evenementId)
            ->latest()
            ->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'evenement_id' => ['required', 'exists:evenements,id'],
            'donnees_formulaire' => ['nullable', 'array'],
            'mode' => ['nullable', 'in:interesse,participe'],
        ]);

        $user = $request->user();
        abort_unless($user, 403);

        // T05: Check for duplicate registration
        $existing = InscriptionEvenement::where('evenement_id', $validated['evenement_id'])
            ->where('utilisateur_id', $user->id)
            ->first();

        if ($existing) {
            return back()->withErrors([
                'evenement_id' => 'Vous êtes déjà inscrit à cet événement.'
            ]);
        }

        $evenement = Evenement::with(['roles', 'inscriptions'])->findOrFail($validated['evenement_id']);

        if (! $this->canJoin($evenement, $user)) {
            abort(403, 'Participation non autorisee');
        }

        $isWaitlist = $this->shouldPlaceOnWaitlist($evenement);
        $status = $this->resolveStatus($evenement, $validated['mode'] ?? 'interesse', $isWaitlist);
        $waitlistPosition = $isWaitlist ? $this->nextWaitlistPosition($evenement) : null;

        $inscription = InscriptionEvenement::updateOrCreate(
            [
                'evenement_id' => $evenement->id,
                'utilisateur_id' => $user->id,
            ],
            [
                'donnees_formulaire' => $validated['donnees_formulaire'] ?? [],
                'statut' => $status,
                'access_token' => Str::uuid()->toString(),
                'is_waitlist' => $isWaitlist,
                'waitlist_position' => $waitlistPosition,
            ],
        );

        $evenement->activities()->create([
            'user_id' => $user->id,
            'type' => 'inscription',
            'label' => ($validated['mode'] ?? 'interesse') === 'participe' && $evenement->visibilite !== 'restreint'
                ? ($isWaitlist ? 'Ajout en liste d attente' : 'Participation confirmee')
                : 'Interet exprime',
            'description' => ($validated['mode'] ?? 'interesse') === 'participe' && $evenement->visibilite !== 'restreint'
                ? ($isWaitlist
                    ? 'Un utilisateur a ete place sur la liste d attente de cet evenement.'
                    : 'Un utilisateur participe a cet evenement.')
                : 'Un utilisateur a marque son interet pour cet evenement.',
        ]);

        $stakeholders = $this->stakeholdersForRegistration($evenement, $user->id);

        if ($stakeholders->isNotEmpty()) {
            $this->notifications->notifyMany(
                $stakeholders,
                'nouvelle_inscription',
                $isWaitlist ? 'Nouvelle demande en attente de place' : 'Nouvelle inscription',
                $isWaitlist
                    ? "{$user->name} a rejoint la liste d attente de {$evenement->titre}."
                    : ($status === 'accepte'
                    ? "{$user->name} a confirme sa participation a {$evenement->titre}."
                    : "{$user->name} a soumis une demande d inscription pour {$evenement->titre}."),
                $evenement->id,
                ['user_id' => $user->id, 'inscription_id' => $inscription->id, 'statut' => $status, 'is_waitlist' => $isWaitlist, 'waitlist_position' => $waitlistPosition],
            );
        }

        $this->notifications->notify(
            $user,
            'inscription_confirmee',
            $isWaitlist ? 'Ajout sur liste d attente' : ($status === 'accepte' ? 'Participation confirmee' : 'Demande enregistree'),
            $isWaitlist
                ? "Aucune place n est disponible pour {$evenement->titre}. Vous etes en liste d attente en position {$waitlistPosition}."
                : ($status === 'accepte'
                ? "Votre participation a {$evenement->titre} est confirmee."
                : "Votre demande pour {$evenement->titre} a bien ete enregistree et attend confirmation."),
            $evenement->id,
            ['inscription_id' => $inscription->id, 'statut' => $status, 'is_waitlist' => $isWaitlist, 'waitlist_position' => $waitlistPosition],
            true,
        );

        return back();
    }

    public function destroy(Request $request, $inscriptionId)
    {
        $inscription = InscriptionEvenement::findOrFail($inscriptionId);
        $user = $request->user();
        abort_unless($user, 403);

        $evenement = Evenement::with('roles')->findOrFail($inscription->evenement_id);

        $canManage = $this->authorization->canManageParticipants($evenement, $user);
        $ownsRegistration = $inscription->utilisateur_id === $user->id;

        if (! $canManage && ! $ownsRegistration) {
            abort(403, 'Action non autorisee');
        }

        $inscription->delete();

        $this->promoteWaitlistIfPossible($evenement);

        $evenement->activities()->create([
            'user_id' => $user->id,
            'type' => 'desinscription',
            'label' => 'Participation retiree',
            'description' => 'Une participation a ete annulee.',
        ]);

        return back();
    }

    public function byEvenement(Evenement $evenement)
    {
        return InscriptionEvenement::with('utilisateur:id,name,email,role')
            ->where('evenement_id', $evenement->id)
            ->latest()
            ->get();
    }

    public function mine(Request $request)
    {
        $user = $request->user();
        abort_unless($user, 403);

        $mes_inscriptions = InscriptionEvenement::query()
            ->with([
                'evenement.createur:id,name,email,role', 
                'evenement.roles', 
                'evenement.medias',
                'evenement.programmes',
                'evenement.messages' => fn($q) => $q->where('status', 'active')
            ])
            ->where('utilisateur_id', $user->id)
            ->latest()
            ->get()
            ->map(function (InscriptionEvenement $inscription) {
                $evenement = $inscription->evenement;
                if ($evenement) {
                    $evenement->setRelation('current_inscription', (object) [
                        'id' => $inscription->id,
                        'statut' => $this->mapParticipationStatus($inscription->statut),
                        'backend_statut' => $inscription->statut,
                        'is_waitlist' => (bool) $inscription->is_waitlist,
                        'waitlist_position' => $inscription->waitlist_position,
                    ]);
                }
                return $inscription;
            });

        $mes_certificats = \App\Models\Certificat::where('utilisateur_id', $user->id)
            ->with('evenement')
            ->get();

        $evenements_suggeres = Evenement::where('statut', 'publie')
            ->where('date_debut', '>', now())
            ->where('visibilite', 'public')
            ->limit(6)
            ->get();

        $actualites = \App\Models\EvenementActivity::whereIn('evenement_id', $mes_inscriptions->pluck('evenement_id'))
            ->with(['user:id,name', 'evenement:id,titre'])
            ->latest()
            ->take(15)
            ->get();

        return Inertia::render('module5/participants/Index', [
            'mes_inscriptions' => $mes_inscriptions,
            'mes_certificats' => $mes_certificats,
            'evenements_suggeres' => $evenements_suggeres,
            'actualites' => $actualites,
            'stats' => [
                'total_inscriptions' => $mes_inscriptions->count(),
                'total_certificats' => $mes_certificats->count(),
                'prochains_evenements' => $mes_inscriptions->filter(fn($i) => $i->evenement && $i->evenement->date_debut > now())->count(),
            ],
        ]);
    }

    public function valider(Request $request, InscriptionEvenement $inscription)
    {
        $this->authorizeModeration($request, $inscription);

        $event = $inscription->evenement;

        if ($event && ! $inscription->is_waitlist && ! $this->hasSeatAvailable($event, $inscription)) {
            return back()->withErrors([
                'participation' => 'La capacite est atteinte. Cette demande doit rester en attente ou basculer en liste d attente.',
            ]);
        }

        $inscription->update(['statut' => 'accepte']);
        if ($inscription->is_waitlist) {
            $inscription->update([
                'is_waitlist' => false,
                'waitlist_position' => null,
            ]);
            $this->resequenceWaitlist($inscription->evenement);
        }
        $inscription->evenement?->activities()->create([
            'user_id' => $request->user()->id,
            'type' => 'inscription_validee',
            'label' => 'Participation validee',
            'description' => 'Une demande a ete acceptee par l organisateur.',
        ]);
        if ($inscription->utilisateur) {
            $this->notifications->notify(
                $inscription->utilisateur,
                'inscription_validee',
                'Inscription validee',
                "Votre participation a {$inscription->evenement?->titre} a ete validee.",
                $inscription->evenement_id,
                ['inscription_id' => $inscription->id],
                true,
            );
        }

        return back();
    }

    public function refuser(Request $request, InscriptionEvenement $inscription)
    {
        $this->authorizeModeration($request, $inscription);

        $wasAccepted = $inscription->statut === 'accepte';
        $inscription->update(['statut' => 'refuse']);
        $inscription->evenement?->activities()->create([
            'user_id' => $request->user()->id,
            'type' => 'inscription_refusee',
            'label' => 'Participation refusee',
            'description' => 'Une demande a ete refusee par l organisateur.',
        ]);
        if ($wasAccepted && $inscription->evenement) {
            $this->promoteWaitlistIfPossible($inscription->evenement);
        }
        if ($inscription->utilisateur) {
            $this->notifications->notify(
                $inscription->utilisateur,
                'inscription_refusee',
                'Inscription refusee',
                "Votre demande pour {$inscription->evenement?->titre} a ete refusee.",
                $inscription->evenement_id,
                ['inscription_id' => $inscription->id],
            );
        }

        return back();
    }

    private function authorizeModeration(Request $request, InscriptionEvenement $inscription): void
    {
        $user = $request->user();
        abort_unless($user, 403);

        $evenement = Evenement::findOrFail($inscription->evenement_id);

        if ($this->authorization->canManageParticipants($evenement, $user)) {
            return;
        }

        abort(403, 'Action non autorisee');
    }

    private function canJoin(Evenement $evenement, $user): bool
    {
        if (in_array($evenement->statut, ['cloture', 'archive'], true)) {
            return false;
        }

        if ($user->role === 'admin') {
            return true;
        }

        $roles = $evenement->roles->pluck('role');

        if ($roles->isEmpty()) {
            return true;
        }

        return $roles->contains('tous') || $roles->contains($user->role);
    }

    private function mapParticipationStatus(string $status): string
    {
        return match ($status) {
            'accepte' => 'participe',
            'en_attente' => 'interesse',
            default => 'refuse',
        };
    }

    private function resolveStatus(Evenement $evenement, string $mode, bool $isWaitlist = false): string
    {
        if ($isWaitlist) {
            return 'en_attente';
        }

        if ($mode === 'participe' && $evenement->visibilite !== 'restreint' && ! $evenement->inscription_requise) {
            return 'accepte';
        }

        return 'en_attente';
    }

    private function stakeholdersForRegistration(Evenement $evenement, int $actorUserId): Collection
    {
        $evenement->loadMissing(['createur', 'assignments.user']);

        return collect([$evenement->createur])
            ->merge(
                $evenement->assignments
                    ->whereIn('role', ['organisateur'])
                    ->pluck('user')
            )
            ->filter(fn ($user) => $user && $user->id !== $actorUserId)
            ->unique('id')
            ->values();
    }

    private function shouldPlaceOnWaitlist(Evenement $evenement): bool
    {
        if (! $evenement->capacite_max) {
            return false;
        }

        return $evenement->inscriptions()
            ->where('statut', 'accepte')
            ->count() >= $evenement->capacite_max;
    }

    private function nextWaitlistPosition(Evenement $evenement): int
    {
        return ((int) $evenement->inscriptions()
            ->where('is_waitlist', true)
            ->max('waitlist_position')) + 1;
    }

    private function promoteWaitlistIfPossible(Evenement $evenement): void
    {
        if (! $evenement->capacite_max) {
            return;
        }

        $acceptedCount = $evenement->inscriptions()->where('statut', 'accepte')->count();

        if ($acceptedCount >= $evenement->capacite_max) {
            return;
        }

        $candidate = $evenement->inscriptions()
            ->where('is_waitlist', true)
            ->where('statut', 'en_attente')
            ->orderBy('waitlist_position')
            ->first();

        if (! $candidate) {
            return;
        }

        $candidate->update([
            'statut' => 'accepte',
            'is_waitlist' => false,
            'waitlist_position' => null,
        ]);

        $this->resequenceWaitlist($evenement);

        $evenement->activities()->create([
            'user_id' => $candidate->utilisateur_id,
            'type' => 'promotion_liste_attente',
            'label' => 'Promotion depuis la liste d attente',
            'description' => 'Une place liberee a automatiquement promu un participant.',
        ]);

        if ($candidate->utilisateur) {
            $this->notifications->notify(
                $candidate->utilisateur,
                'promotion_liste_attente',
                'Une place vient de se liberer',
                "Votre participation a {$evenement->titre} est maintenant confirmee.",
                $evenement->id,
                ['inscription_id' => $candidate->id],
                true,
            );
        }
    }

    private function resequenceWaitlist(Evenement $evenement): void
    {
        $evenement->inscriptions()
            ->where('is_waitlist', true)
            ->where('statut', 'en_attente')
            ->orderBy('waitlist_position')
            ->get()
            ->values()
            ->each(fn (InscriptionEvenement $inscription, int $index) => $inscription->update([
                'waitlist_position' => $index + 1,
            ]));
    }

    private function hasSeatAvailable(Evenement $evenement, ?InscriptionEvenement $excluding = null): bool
    {
        if (! $evenement->capacite_max) {
            return true;
        }

        $acceptedCount = $evenement->inscriptions()
            ->where('statut', 'accepte')
            ->when($excluding, fn ($query) => $query->where('id', '!=', $excluding->id))
            ->count();

        return $acceptedCount < $evenement->capacite_max;
    }
}
