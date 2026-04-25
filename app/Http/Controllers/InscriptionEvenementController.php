<?php

namespace App\Http\Controllers;

use App\Models\Evenement;
use App\Models\InscriptionEvenement;
use App\Services\EventAuthorizationService;
use App\Services\EventNotificationService;
use Illuminate\Http\Request;
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

        $evenement = Evenement::with(['roles', 'inscriptions'])->findOrFail($validated['evenement_id']);

        if (! $this->canJoin($evenement, $user)) {
            abort(403, 'Participation non autorisee');
        }

        if ($evenement->capacite_max && $evenement->inscriptions->count() >= $evenement->capacite_max) {
            return back()->withErrors([
                'participation' => 'La capacite maximale de cet evenement est atteinte.',
            ]);
        }

        InscriptionEvenement::updateOrCreate(
            [
                'evenement_id' => $evenement->id,
                'utilisateur_id' => $user->id,
            ],
            [
                'donnees_formulaire' => $validated['donnees_formulaire'] ?? [],
                'statut' => $this->resolveStatus($evenement, $validated['mode'] ?? 'interesse'),
                'access_token' => Str::uuid()->toString(),
            ],
        );

        $evenement->activities()->create([
            'user_id' => $user->id,
            'type' => 'inscription',
            'label' => ($validated['mode'] ?? 'interesse') === 'participe' && $evenement->visibilite !== 'restreint'
                ? 'Participation confirmee'
                : 'Interet exprime',
            'description' => ($validated['mode'] ?? 'interesse') === 'participe' && $evenement->visibilite !== 'restreint'
                ? 'Un utilisateur participe a cet evenement.'
                : 'Un utilisateur a marque son interet pour cet evenement.',
        ]);

        if ($evenement->createur && $evenement->createur->id !== $user->id) {
            $this->notifications->notify(
                $evenement->createur,
                'nouvelle_inscription',
                'Nouvelle inscription',
                "{$user->name} a interagi avec {$evenement->titre}.",
                $evenement->id,
                ['user_id' => $user->id],
            );
        }

        return back();
    }

    public function destroy(Request $request, InscriptionEvenement $inscription)
    {
        $user = $request->user();
        abort_unless($user, 403);

        $evenement = Evenement::with('roles')->findOrFail($inscription->evenement_id);

        $canManage = $this->authorization->canManageParticipants($evenement, $user);
        $ownsRegistration = $inscription->utilisateur_id === $user->id;

        if (! $canManage && ! $ownsRegistration) {
            abort(403, 'Action non autorisee');
        }

        $inscription->delete();

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

        $inscriptions = InscriptionEvenement::query()
            ->with(['evenement.createur:id,name,email,role', 'evenement.roles', 'evenement.medias'])
            ->where('utilisateur_id', $user->id)
            ->latest()
            ->paginate(9)
            ->through(function (InscriptionEvenement $inscription) use ($user) {
                $evenement = $inscription->evenement;
                $cover = $evenement->medias->firstWhere('type', 'image');

                return [
                    'id' => $evenement->id,
                    'titre' => $evenement->titre,
                    'description' => $evenement->description,
                    'type' => $evenement->type,
                    'date_debut' => optional($evenement->date_debut)->toIso8601String(),
                    'date_fin' => optional($evenement->date_fin)->toIso8601String(),
                    'lieu' => $evenement->lieu,
                    'statut' => $evenement->statut,
                    'visibilite' => $evenement->visibilite,
                    'public_cible' => $evenement->public_cible,
                    'capacite_max' => $evenement->capacite_max,
                    'participants_count' => $evenement->inscriptions()->count(),
                    'comments_count' => $evenement->comments()->count(),
                    'activity_count' => $evenement->activities()->count(),
                    'cover_url' => $cover ? Storage::url($cover->chemin_fichier) : null,
                    'roles' => $evenement->roles->pluck('role')->values(),
                    'createur' => [
                        'id' => $evenement->createur?->id,
                        'name' => $evenement->createur?->name,
                        'role' => $evenement->createur?->role,
                    ],
                    'participation' => [
                        'id' => $inscription->id,
                        'statut' => $this->mapParticipationStatus($inscription->statut),
                        'backend_statut' => $inscription->statut,
                    ],
                    'can_join' => false,
                ];
            });

        return Inertia::render('evenements/Inscriptions', [
            'inscriptions' => $inscriptions,
        ]);
    }

    public function valider(Request $request, InscriptionEvenement $inscription)
    {
        $this->authorizeModeration($request, $inscription);

        $inscription->update(['statut' => 'accepte']);
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

        $inscription->update(['statut' => 'refuse']);
        $inscription->evenement?->activities()->create([
            'user_id' => $request->user()->id,
            'type' => 'inscription_refusee',
            'label' => 'Participation refusee',
            'description' => 'Une demande a ete refusee par l organisateur.',
        ]);
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
        if ($this->authorization->canManageParticipants($evenement, $user) || in_array($evenement->statut, ['cloture', 'archive'], true)) {
            return false;
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

    private function resolveStatus(Evenement $evenement, string $mode): string
    {
        if ($mode === 'participe' && $evenement->visibilite !== 'restreint') {
            return 'accepte';
        }

        return 'en_attente';
    }
}
