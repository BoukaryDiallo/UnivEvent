<?php

namespace App\Http\Controllers;

use App\Http\Requests\ChargeRequest;
use App\Http\Requests\DispoImportRequest;
use App\Http\Requests\DispoRequest;
use App\Http\Requests\EcartRequest;
use App\Metiers\AlerteMetier;
use App\Metiers\DispoMetier;
use App\Models\Charge;
use App\Models\Dispo;
use App\Models\Ecart;
use App\Models\Prise;
use App\Models\User;
use App\Support\DispoImportParser;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Response;

class DispoController extends Controller
{
    public function __construct(
        protected DispoMetier $metier,
        protected AlerteMetier $alertes,
        protected DispoImportParser $importParser,
    ) {}

    public function dispos(Request $request): Response
    {
        $user = $request->user();

        abort_unless($user?->role === 'enseignant', 403);

        return inertia('dispo/dispos-page', [
            ...$this->base($user),
            'dispos' => $this->listeDispos($user->id),
            'charges' => $this->chargesData($user->id),
            'semestres' => $this->metier->semestresCharge(),
            'anneesAcademiques' => $this->metier->anneesAcademiquesDisponibles(),
        ]);
    }

    public function ajout(Request $request): Response
    {
        $user = $request->user();

        abort_unless($user?->role === 'enseignant', 403);

        return inertia('dispo/dispo-form-page', [
            ...$this->base($user),
            'jours' => $this->jours(),
            'niveaux' => $this->niveaux(),
            'mode' => 'creation',
            'dispo' => null,
        ]);
    }

    public function modifier(Request $request, Dispo $dispo): Response
    {
        $user = $request->user();

        abort_unless($user?->role === 'enseignant' && $user->id === $dispo->user_id, 403);

        return inertia('dispo/dispo-form-page', [
            ...$this->base($user),
            'jours' => $this->jours(),
            'niveaux' => $this->niveaux(),
            'mode' => 'edition',
            'dispo' => [
                'id' => $dispo->id,
                'jour' => $dispo->jour,
                'debut' => substr($dispo->debut, 0, 5),
                'fin' => substr($dispo->fin, 0, 5),
                'niveau' => $dispo->niveau,
                'motif' => $dispo->motif,
            ],
        ]);
    }

    public function ecarts(Request $request): Response
    {
        $user = $request->user();

        abort_unless($user?->role === 'enseignant', 403);

        return inertia('dispo/ecarts-page', [
            ...$this->base($user),
            'ecarts' => $this->listeEcarts($user->id),
        ]);
    }

    public function ajoutEcart(Request $request): Response
    {
        $user = $request->user();

        abort_unless($user?->role === 'enseignant', 403);

        return inertia('dispo/ecart-form-page', [
            ...$this->base($user),
        ]);
    }

    public function reservations(Request $request): Response
    {
        $user = $request->user();

        abort_unless($user?->role === 'enseignant', 403);

        return inertia('dispo/reservations-page', [
            ...$this->base($user),
            'reservations' => $this->listeReservations($user->id),
        ]);
    }

    public function notifications(Request $request): Response
    {
        $user = $request->user();

        abort_unless($user?->role === 'enseignant', 403);

        return inertia('dispo/notifications-page', [
            ...$this->base($user),
            'notifications' => $this->alertes->pour($user),
        ]);
    }

    public function historique(Request $request): Response
    {
        $user = $request->user();

        abort_unless($user?->role === 'enseignant', 403);

        return inertia('dispo/historique-page', [
            ...$this->base($user),
            'historique' => $this->metier->historique($user->id, 50),
        ]);
    }

    public function consultation(Request $request): Response
    {
        $admin = $request->user();

        abort_unless($admin?->role === 'admin', 403);

        $id = (int) $request->integer('enseignant');
        $nom = trim((string) $request->string('nom'));
        $specialite = trim((string) $request->string('specialite'));

        $enseignants = User::query()
            ->where('role', 'enseignant')
            ->with('enseignant')
            ->orderBy('name')
            ->get();

        $cible = $id > 0
            ? User::query()->where('role', 'enseignant')->with('enseignant')->find($id)
            : null;

        return inertia('dispo/consultation-page', [
            'filtres' => [
                'nom' => $nom,
                'specialite' => $specialite,
            ],
            'cible' => $cible ? $this->enseignantData($cible) : null,
            'enseignants' => $enseignants->map(fn (User $enseignant) => $this->enseignantData($enseignant))->values()->all(),
            'dispos' => $cible ? $this->listeDispos($cible->id) : [],
            'ecarts' => $cible ? $this->listeEcarts($cible->id) : [],
            'reservations' => $cible ? $this->listeReservations($cible->id) : [],
            'grille' => $cible ? $this->grille($cible->id) : null,
            'charges' => $cible ? $this->chargesData($cible->id) : [],
            'resume' => $cible ? $this->resume($cible->id) : $this->resumeVide(),
        ]);
    }

    public function notificationsAdmin(Request $request): Response
    {
        $admin = $request->user();

        abort_unless($admin?->role === 'admin', 403);

        return inertia('dispo/admin-notifications-page', [
            'user' => $admin->only(['id', 'name', 'email', 'role']),
            'notifications' => $this->alertes->pour($admin),
            'indicateurs' => $this->alertes->indicateursAdmin(),
            'resume' => $this->resumeAdmin(),
        ]);
    }

    public function store(DispoRequest $request): RedirectResponse
    {
        $user = $request->user();

        abort_unless($user?->role === 'enseignant', 403);

        $data = $request->validated();
        $creneaux = array_values($data['creneaux'] ?? []);

        $this->validerEtCreerCreneaux($user->id, $creneaux, true);

        $message = count($creneaux) > 1
            ? 'Disponibilites ajoutees.'
            : 'Disponibilite ajoutee.';

        return redirect('/dispos')->with('ok', $message);
    }

    public function importer(DispoImportRequest $request): RedirectResponse
    {
        $user = $request->user();

        abort_unless($user?->role === 'enseignant', 403);

        $creneaux = $this->importParser->parse($request->file('fichier'));

        $this->validerEtCreerCreneaux($user->id, $creneaux, false);

        $message = count($creneaux) > 1
            ? 'Disponibilites importees avec succes.'
            : 'Disponibilite importee avec succes.';

        return redirect('/dispos')->with('ok', $message);
    }

    public function update(DispoRequest $request, Dispo $dispo): RedirectResponse
    {
        $user = $request->user();

        abort_unless($user?->role === 'enseignant' && $user->id === $dispo->user_id, 403);

        $data = $request->validated();

        $this->metier->verifierVerrou($dispo);
        $this->metier->verifierHeure(now()->toDateString(), $data['debut'], $data['fin']);
        $this->metier->verifierJourUnique($user->id, (int) $data['jour'], $dispo->id);
        $this->metier->verifierChevauchement($user->id, 'dispos', $data['jour'], $data['debut'].':00', $data['fin'].':00', $dispo->id);
        $this->metier->verifierPriseHebdo($user->id, (int) $data['jour'], $data['debut'].':00', $data['fin'].':00');

        $this->metier->modifierDisponibilite($dispo, $data);

        return redirect('/dispos')->with('ok', 'Disponibilite modifiee.');
    }

    public function detruire(Request $request, Dispo $dispo): RedirectResponse
    {
        $user = $request->user();

        abort_unless($user?->role === 'enseignant' && $user->id === $dispo->user_id, 403);

        $this->metier->supprimerDisponibilite($dispo);

        return back()->with('ok', 'Disponibilite supprimee.');
    }

    public function restaurer(Request $request, int $dispo): RedirectResponse
    {
        $user = $request->user();

        abort_unless($user?->role === 'enseignant', 403);

        $disponibilite = Dispo::withTrashed()->findOrFail($dispo);

        abort_unless($user->id === $disponibilite->user_id, 403);

        if (! $disponibilite->trashed()) {
            return back()->with('ok', 'La disponibilite est deja active.');
        }

        $this->metier->restaurerDisponibilite($disponibilite);

        return back()->with('ok', 'Disponibilite restauree.');
    }

    public function ecart(EcartRequest $request): RedirectResponse
    {
        $user = $request->user();

        abort_unless($user?->role === 'enseignant', 403);

        $data = $request->validated();

        $this->metier->verifierEcart($user->id, $data['date'], $data['date_fin'] ?? null);

        Ecart::create([
            'user_id' => $user->id,
            'date' => $data['date'],
            'date_fin' => $data['date_fin'] ?? null,
            'debut' => '00:00:00',
            'fin' => '23:59:59',
            'niveau' => 'indisponible',
            'motif' => $data['motif'],
        ]);

        return redirect('/ecarts')->with('ok', 'Exception ajoutee.');
    }

    public function detruireEcart(Request $request, Ecart $ecart): RedirectResponse
    {
        $user = $request->user();

        abort_unless($user?->role === 'enseignant' && $user->id === $ecart->user_id, 403);

        $ecart->delete();

        return back()->with('ok', 'Exception supprimee.');
    }

    public function charge(ChargeRequest $request): RedirectResponse
    {
        $user = $request->user();

        abort_unless($user?->role === 'enseignant', 403);

        $data = $request->validated();

        $semestre = $this->metier->serializeSemestresCharge($data['semestre']);
        $chargeId = isset($data['charge_id']) ? (int) $data['charge_id'] : null;

        if ($chargeId !== null) {
            $charge = Charge::query()
                ->where('user_id', $user->id)
                ->findOrFail($chargeId);

            $charge->update([
                'semestre' => $semestre,
                'annee_academique' => $data['annee_academique'],
                'max_jour' => $data['max_jour'] ?? null,
                'max_semaine' => $data['max_semaine'] ?? null,
            ]);
        } else {
            Charge::query()->updateOrCreate(
                [
                    'user_id' => $user->id,
                    'semestre' => $semestre,
                    'annee_academique' => $data['annee_academique'],
                ],
                [
                    'max_jour' => $data['max_jour'] ?? null,
                    'max_semaine' => $data['max_semaine'] ?? null,
                ]
            );
        }

        return back()->with('ok', 'Charge enregistree.');

        Charge::query()->updateOrCreate(
            [
                'user_id' => $user->id,
                'semestre' => $data['semestre'], // Déjà normalisé par ChargeRequest
                'annee_academique' => $data['annee_academique'],
            ],
            [
                'max_jour' => $data['max_jour'] ?? null,
                'max_semaine' => $data['max_semaine'] ?? null,
            ]
        );

        return back()->with('ok', 'Charge enregistrée.');
    }

    public function editCharge(Request $request, Charge $charge): RedirectResponse
    {
        $user = $request->user();

        abort_unless($user?->role === 'enseignant' && $user->id === $charge->user_id, 403);

        return redirect('/dispos')->with('charge_to_edit', $charge->id);
    }

    public function destroyCharge(Request $request, Charge $charge): RedirectResponse
    {
        $user = $request->user();

        abort_unless($user?->role === 'enseignant' && $user->id === $charge->user_id, 403);

        $charge->delete();

        return back()->with('ok', 'Charge supprimée.');
    }

    protected function base(User $user): array
    {
        $user->loadMissing('enseignant');

        return [
            'user' => $this->enseignantData($user),
            'jours' => $this->jours(),
            'niveaux' => $this->niveaux(),
            'resume' => $this->resume($user->id),
            'notifications' => $this->alertes->pour($user),
        ];
    }

    protected function jours(): array
    {
        return [
            ['id' => 1, 'nom' => 'Lundi'],
            ['id' => 2, 'nom' => 'Mardi'],
            ['id' => 3, 'nom' => 'Mercredi'],
            ['id' => 4, 'nom' => 'Jeudi'],
            ['id' => 5, 'nom' => 'Vendredi'],
            ['id' => 6, 'nom' => 'Samedi'],
            ['id' => 7, 'nom' => 'Dimanche'],
        ];
    }

    protected function niveaux(): array
    {
        return [
            ['id' => 'prefere', 'nom' => 'Prefere'],
        ];
    }

    protected function resume(int $userId): array
    {
        return [
            'dispos' => Dispo::query()->where('user_id', $userId)->count(),
            'ecarts' => Ecart::query()->where('user_id', $userId)->count(),
            'reservations' => Prise::query()->where('user_id', $userId)->whereNull('libere_at')->count(),
            'notifications' => count($this->alertes->pour(User::query()->findOrFail($userId))),
        ];
    }

    protected function resumeVide(): array
    {
        return [
            'dispos' => 0,
            'ecarts' => 0,
            'reservations' => 0,
            'notifications' => 0,
        ];
    }

    protected function resumeAdmin(): array
    {
        return [
            'dispos' => Dispo::query()->count(),
            'ecarts' => Ecart::query()->count(),
            'reservations' => Prise::query()->whereNull('libere_at')->count(),
            'notifications' => count($this->alertes->pourAdmin()),
        ];
    }

    protected function chargesData(int $userId): array
    {
        return Charge::query()
            ->where('user_id', $userId)
            ->orderBy('created_at')
            ->get()
            ->map(fn (Charge $charge) => [
                'id' => $charge->id,
                'semestre' => $charge->semestre,
                'nom_semestre' => $this->metier->nomSemestreCharge($charge->semestre),
                'annee_academique' => $charge->annee_academique,
                'max_jour' => $charge->max_jour,
                'max_semaine' => $charge->max_semaine,
            ])
            ->values()
            ->all();
    }

    protected function listeDispos(int $userId): array
    {
        return Dispo::query()
            ->where('user_id', $userId)
            ->orderBy('jour')
            ->orderBy('debut')
            ->get()
            ->map(fn (Dispo $dispo) => [
                'id' => $dispo->id,
                'jour' => $dispo->jour,
                'debut' => substr($dispo->debut, 0, 5),
                'fin' => substr($dispo->fin, 0, 5),
                'niveau' => $dispo->niveau,
                'motif' => $dispo->motif,
                'verrouille' => $this->metier->estVerrouille($dispo),
            ])
            ->all();
    }

    protected function listeEcarts(int $userId): array
    {
        return Ecart::query()
            ->where('user_id', $userId)
            ->orderBy('date')
            ->get()
            ->map(fn (Ecart $ecart) => [
                'id' => $ecart->id,
                'date' => $ecart->date?->toDateString(),
                'date_fin' => $ecart->date_fin?->toDateString(),
                'debut' => substr($ecart->debut, 0, 5),
                'fin' => substr($ecart->fin, 0, 5),
                'niveau' => $ecart->niveau,
                'motif' => $ecart->motif,
            ])
            ->all();
    }

    protected function listeReservations(int $userId): array
    {
        return Prise::query()
            ->where('user_id', $userId)
            ->orderByDesc('date')
            ->orderBy('debut')
            ->get()
            ->map(fn (Prise $prise) => [
                'id' => $prise->id,
                'date' => $prise->date?->toDateString(),
                'debut' => substr($prise->debut, 0, 5),
                'fin' => substr($prise->fin, 0, 5),
                'source' => $prise->source,
                'ref' => $prise->ref,
                'niveau' => $prise->niveau,
                'motif' => $prise->motif,
                'libere_at' => $prise->libere_at?->toDateTimeString(),
            ])
            ->all();
    }

    protected function grille(int $userId): array
    {
        return $this->metier->grilleHebdomadaire($userId);
    }

    protected function enseignantData(User $user): array
    {
        $enseignant = $user->enseignant;

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'nom' => $enseignant?->nom,
            'prenom' => $enseignant?->prenom,
            'telephone' => $enseignant?->telephone,
            'specialite' => $enseignant?->specialite,
            'nom_complet' => $enseignant ? $enseignant->nomComplet() : $user->name,
            'role' => $user->role,
        ];
    }

    protected function prefixerErreursCreneau(array $erreurs, int $index): array
    {
        $resultat = [];

        foreach ($erreurs as $champ => $messages) {
            $resultat["creneaux.$index.$champ"] = $messages;
        }

        return $resultat;
    }

    protected function validerEtCreerCreneaux(int $userId, array $creneaux, bool $prefixerErreursParCreneau = true): void
    {
        try {
            $this->metier->verifierJoursUniquesLot($userId, $creneaux);
        } catch (ValidationException $exception) {
            if ($prefixerErreursParCreneau) {
                throw $exception;
            }

            throw ValidationException::withMessages([
                'fichier' => $this->formaterErreursImport($exception->errors()),
            ]);
        }

        foreach ($creneaux as $index => $creneau) {
            try {
                $this->metier->verifierHeure(now()->toDateString(), $creneau['debut'], $creneau['fin']);
                $this->metier->verifierChevauchement($userId, 'dispos', $creneau['jour'], $creneau['debut'].':00', $creneau['fin'].':00');
                $this->metier->verifierPriseHebdo($userId, (int) $creneau['jour'], $creneau['debut'].':00', $creneau['fin'].':00');
            } catch (ValidationException $exception) {
                if ($prefixerErreursParCreneau) {
                    throw ValidationException::withMessages($this->prefixerErreursCreneau($exception->errors(), $index));
                }

                throw ValidationException::withMessages([
                    'fichier' => $this->formaterErreursImport($exception->errors(), $index + 2),
                ]);
            }
        }

        $this->metier->creerDisponibilites($userId, $creneaux);
    }

    protected function formaterErreursImport(array $erreurs, ?int $ligne = null): array
    {
        $messages = [];

        foreach ($erreurs as $champ => $fieldMessages) {
            preg_match('/creneaux\.(\d+)\./', $champ, $matches);
            $ligneCourante = $ligne ?? (isset($matches[1]) ? ((int) $matches[1]) + 2 : null);

            foreach ($fieldMessages as $message) {
                $messages[] = $ligneCourante !== null
                    ? 'Ligne '.$ligneCourante.' : '.$message
                    : $message;
            }
        }

        return $messages;
    }
}
