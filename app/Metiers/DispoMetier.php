<?php

namespace App\Metiers;

use App\Contrats\DispoContrat;
use App\Models\Charge;
use App\Models\Dispo;
use App\Models\Ecart;
use App\Models\HistoriqueDisponibilite;
use App\Models\Prise;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class DispoMetier implements DispoContrat
{
    public const ACTION_CREATION = 'CREATION';
    public const ACTION_MODIFICATION = 'MODIFICATION';
    public const ACTION_SUPPRESSION = 'SUPPRESSION';
    public const ACTION_RESTAURATION = 'RESTAURATION';

    public const SEMESTRES_CHARGE = [
        'semestre_1' => 'Semestre 1',
        'semestre_2' => 'Semestre 2',
        'semestre_3' => 'Semestre 3',
        'tous_les_semestres' => 'Tous les semestres',
    ];

    public function etat(int $userId, string $date, string $debut, string $fin): array
    {
        $this->verifierHeure($date, $debut, $fin);

        if ($this->aPrise($userId, $date, $debut, $fin)) {
            return [
                'ok' => false,
                'niveau' => 'indisponible',
                'motif' => 'Creneau deja reserve.',
            ];
        }

        $niveau = $this->niveau($userId, $date, $debut, $fin);

        if ($niveau['niveau'] === 'indisponible') {
            return [
                'ok' => false,
                'niveau' => 'indisponible',
                'motif' => $niveau['motif'] ?? 'Creneau indisponible.',
            ];
        }

        $charge = $this->verifierCharge($userId, $date, $debut, $fin);

        if ($charge !== null) {
            return [
                'ok' => false,
                'niveau' => $niveau['niveau'],
                'motif' => $charge,
            ];
        }

        return [
            'ok' => true,
            'niveau' => $niveau['niveau'],
            'motif' => $niveau['motif'],
        ];
    }

    public function prendre(
        int $userId,
        string $date,
        string $debut,
        string $fin,
        string $source,
        ?string $ref = null,
        ?string $motif = null,
    ): Prise {
        $etat = $this->etat($userId, $date, $debut, $fin);

        if (! $etat['ok']) {
            throw ValidationException::withMessages([
                'prise' => $etat['motif'] ?? 'Creneau non reservable.',
            ]);
        }

        return Prise::create([
            'user_id' => $userId,
            'date' => $date,
            'debut' => $debut,
            'fin' => $fin,
            'source' => $source,
            'ref' => $ref,
            'motif' => $motif,
            'niveau' => $etat['niveau'],
        ]);
    }

    public function liberer(Prise $prise): Prise
    {
        if ($prise->libere_at === null) {
            $prise->forceFill([
                'libere_at' => now(),
            ])->save();
        }

        return $prise->fresh();
    }

    public function semestresCharge(): array
    {
        return collect(self::SEMESTRES_CHARGE)
            ->map(fn (string $nom, string $id) => ['id' => $id, 'nom' => $nom])
            ->values()
            ->all();
    }

    /**
     * Normalise les semestres sélectionnés selon la logique métier
     * - Si tous les semestres individuels (1,2,3) → ['tous_les_semestres']
     * - Si contient 'tous_les_semestres' → ['tous_les_semestres']
     * - Sinon retourne le tableau unique
     */
    public function normalizeSemestre(array $semestres): array
    {
        $semestres = array_values(array_unique(array_filter($semestres)));
        
        $individuels = array_intersect($semestres, ['semestre_1', 'semestre_2', 'semestre_3']);
        $hasTous = in_array('tous_les_semestres', $semestres, true);
        
        if ($hasTous || count($individuels) === 3) {
            return ['tous_les_semestres'];
        }
        
        return $semestres;
    }

    public function serializeSemestresCharge(array $semestres): string
    {
        return implode(',', $this->normalizeSemestre($semestres));
    }

    public function deserializeSemestresCharge(null|string|array $semestres): array
    {
        if (is_array($semestres)) {
            return $this->normalizeSemestre($semestres);
        }

        if ($semestres === null || trim($semestres) === '') {
            return [];
        }

        return $this->normalizeSemestre(explode(',', $semestres));
    }

    public function nomSemestreCharge(mixed $semestre): string
    {
        $semestres = $this->deserializeSemestresCharge($semestre);

        if ($semestres !== []) {
            $noms = array_map(fn($s) => self::SEMESTRES_CHARGE[$s] ?? 'Inconnu', $semestres);
            return implode(' et ', $noms);
        }
        
        return self::SEMESTRES_CHARGE['tous_les_semestres'];
    }

    public function anneesAcademiquesDisponibles(?string $date = null): array
    {
        $anneeActuelle = Carbon::parse($date ?? now()->toDateString())->year;
        $debut = $anneeActuelle - 1;

        return collect(range($debut, $debut + 2))
            ->map(fn (int $annee) => sprintf('%d-%d', $annee, $annee + 1))
            ->values()
            ->all();
    }

    public function semestrePourDate(string|Carbon $date): string
    {
        $mois = ($date instanceof Carbon ? $date : Carbon::parse($date))->month;

        return match (true) {
            in_array($mois, [10, 11, 12, 1], true) => 'semestre_1',
            in_array($mois, [2, 3, 4, 5, 6], true) => 'semestre_2',
            default => 'semestre_3',
        };
    }

    public function anneeAcademiquePourDate(string|Carbon $date): string
    {
        $valeur = $date instanceof Carbon ? $date : Carbon::parse($date);
        $anneeDebut = $valeur->month >= 10 ? $valeur->year : $valeur->year - 1;

        return sprintf('%d-%d', $anneeDebut, $anneeDebut + 1);
    }

    public function verifierChevauchement(
        int $userId,
        string $table,
        string|int $dateVal,
        string $debut,
        string $fin,
        ?int $sauf = null,
    ): void {
        $query = match ($table) {
            'dispos' => Dispo::query()
                ->where('user_id', $userId)
                ->where('jour', $dateVal),
            'ecarts' => Ecart::query()
                ->where('user_id', $userId)
                ->whereDate('date', $dateVal),
            default => throw ValidationException::withMessages([
                'debut' => 'Type de creneau non pris en charge.',
            ]),
        };

        $query
            ->where('debut', '<', $fin)
            ->where('fin', '>', $debut)
            ->when($sauf !== null, fn ($builder) => $builder->where('id', '!=', $sauf));

        if ($query->exists()) {
            throw ValidationException::withMessages([
                'debut' => 'Un creneau existe deja sur ce jour.',
            ]);
        }
    }

    public function verifierJourUnique(int $userId, int $jour, ?int $sauf = null): void
    {
        $existe = Dispo::query()
            ->where('user_id', $userId)
            ->where('jour', $jour)
            ->when($sauf !== null, fn ($query) => $query->where('id', '!=', $sauf))
            ->exists();

        if ($existe) {
            throw ValidationException::withMessages([
                'jour' => 'Un creneau existe deja pour ce jour.',
            ]);
        }
    }

    public function verifierJoursUniquesLot(int $userId, array $creneaux): void
    {
        $joursVus = [];
        $erreurs = [];

        foreach ($creneaux as $index => $creneau) {
            $jour = (int) ($creneau['jour'] ?? 0);

            if ($jour === 0) {
                continue;
            }

            if (in_array($jour, $joursVus, true)) {
                $erreurs["creneaux.$index.jour"] = 'Ce jour est deja present dans votre saisie.';
                continue;
            }

            $joursVus[] = $jour;

            $existe = Dispo::query()
                ->where('user_id', $userId)
                ->where('jour', $jour)
                ->exists();

            if ($existe) {
                $erreurs["creneaux.$index.jour"] = 'Une disponibilite existe deja pour ce jour.';
            }
        }

        if ($erreurs !== []) {
            throw ValidationException::withMessages($erreurs);
        }
    }

    public function verifierEcart(int $userId, string $date, ?string $dateFin = null, ?int $sauf = null): void
    {
        $fin = $dateFin ?? $date;

        $existe = Ecart::query()
            ->where('user_id', $userId)
            ->whereDate('date', '<=', $fin)
            ->where(function ($query) use ($date) {
                $query
                    ->whereNull('date_fin')
                    ->orWhereDate('date_fin', '>=', $date);
            })
            ->when($sauf !== null, fn ($query) => $query->where('id', '!=', $sauf))
            ->exists();

        if ($existe) {
            throw ValidationException::withMessages([
                'date' => 'Une indisponibilite existe deja sur cette date.',
            ]);
        }
    }

    public function verifierPriseHebdo(int $userId, int $jour, string $debut, string $fin): void
    {
        $prise = Prise::query()
            ->where('user_id', $userId)
            ->whereNull('libere_at')
            ->get()
            ->first(function (Prise $prise) use ($jour, $debut, $fin) {
                return $prise->date !== null
                    && $prise->date->dayOfWeekIso === $jour
                    && $prise->debut < $fin
                    && $prise->fin > $debut;
            });

        if ($prise !== null) {
            throw ValidationException::withMessages([
                'debut' => 'Ce creneau est deja utilise par une reservation active.',
            ]);
        }
    }

    public function verifierVerrou(Dispo $dispo): void
    {
        if (! $this->estVerrouille($dispo)) {
            return;
        }

        throw ValidationException::withMessages([
            'dispo' => 'Ce creneau est verrouille par une reservation active.',
        ]);
    }

    public function estVerrouille(Dispo $dispo): bool
    {
        return Prise::query()
            ->where('user_id', $dispo->user_id)
            ->whereNull('libere_at')
            ->get()
            ->contains(function (Prise $prise) use ($dispo) {
                return $prise->date !== null
                    && $prise->date->dayOfWeekIso === $dispo->jour
                    && $prise->debut < $dispo->fin
                    && $prise->fin > $dispo->debut;
            });
    }

    public function verifierHeure(string $date, string $debut, string $fin): void
    {
        $d1 = Carbon::parse($date.' '.$debut);
        $d2 = Carbon::parse($date.' '.$fin);

        if ($d1->greaterThanOrEqualTo($d2)) {
            throw ValidationException::withMessages([
                'fin' => 'L heure de fin doit etre apres l heure de debut.',
            ]);
        }
    }

    public function avant(Dispo $dispo): array
    {
        return [
            'jour' => $dispo->jour,
            'debut' => substr($dispo->debut, 0, 5),
            'fin' => substr($dispo->fin, 0, 5),
            'niveau' => $this->normaliserNiveau($dispo->niveau),
            'motif' => $dispo->motif,
        ];
    }

    public function creerDisponibilites(int $userId, array $creneaux): void
    {
        DB::transaction(function () use ($userId, $creneaux) {
            foreach ($creneaux as $creneau) {
                $dispo = Dispo::create([
                    'user_id' => $userId,
                    'jour' => $creneau['jour'],
                    'debut' => $creneau['debut'].':00',
                    'fin' => $creneau['fin'].':00',
                    'niveau' => $this->normaliserNiveau($creneau['niveau'] ?? null),
                    'motif' => $creneau['motif'] ?? null,
                ]);

                $this->enregistrerHistorique(
                    $dispo,
                    $userId,
                    self::ACTION_CREATION,
                    sprintf('Creation : disponibilite %s', $this->formaterDisponibilite($dispo))
                );
            }
        });
    }

    public function modifierDisponibilite(Dispo $dispo, array $data): Dispo
    {
        return DB::transaction(function () use ($dispo, $data) {
            $avant = $this->avant($dispo);
            $ancienneDescription = $this->formaterDisponibilite($avant);

            $dispo->update([
                'avant' => $avant,
                'maj_le' => now(),
                'jour' => $data['jour'],
                'debut' => $data['debut'].':00',
                'fin' => $data['fin'].':00',
                'niveau' => $this->normaliserNiveau($data['niveau'] ?? null),
                'motif' => $data['motif'] ?? null,
            ]);

            $this->enregistrerHistorique(
                $dispo->fresh(),
                $dispo->user_id,
                self::ACTION_MODIFICATION,
                sprintf('Modification : %s -> %s', $ancienneDescription, $this->formaterDisponibilite($dispo->fresh()))
            );

            return $dispo->fresh();
        });
    }

    public function supprimerDisponibilite(Dispo $dispo): void
    {
        DB::transaction(function () use ($dispo) {
            $description = $this->formaterDisponibilite($dispo);

            $dispo->delete();

            $this->enregistrerHistorique(
                $dispo,
                $dispo->user_id,
                self::ACTION_SUPPRESSION,
                sprintf('Suppression : disponibilite %s desactivee', $description)
            );
        });
    }

    public function restaurerDisponibilite(Dispo $dispo): Dispo
    {
        $this->verifierJourUnique($dispo->user_id, $dispo->jour, $dispo->id);
        $this->verifierChevauchement($dispo->user_id, 'dispos', $dispo->jour, $dispo->debut, $dispo->fin, $dispo->id);
        $this->verifierPriseHebdo($dispo->user_id, $dispo->jour, $dispo->debut, $dispo->fin);

        return DB::transaction(function () use ($dispo) {
            $dispo->restore();

            $this->enregistrerHistorique(
                $dispo->fresh(),
                $dispo->user_id,
                self::ACTION_RESTAURATION,
                sprintf('Restauration : disponibilite %s reactivee', $this->formaterDisponibilite($dispo->fresh()))
            );

            return $dispo->fresh();
        });
    }

    public function historique(int $userId, int $limite = 20): array
    {
        return HistoriqueDisponibilite::query()
            ->where('enseignant_id', $userId)
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->limit($limite)
            ->get()
            ->map(fn (HistoriqueDisponibilite $ligne) => [
                'id' => $ligne->id,
                'dispo_id' => $ligne->dispo_id,
                'action' => $ligne->action,
                'description' => $ligne->description,
                'created_at' => $ligne->created_at?->format('d/m/Y H:i'),
            ])
            ->all();
    }

    public function grilleHebdomadaire(int $userId, bool $inclureEcarts = true): array
    {
        $jours = [
            1 => 'Lun',
            2 => 'Mar',
            3 => 'Mer',
            4 => 'Jeu',
            5 => 'Ven',
            6 => 'Sam',
            7 => 'Dim',
        ];

        $dispos = Dispo::query()
            ->where('user_id', $userId)
            ->get();

        $prises = Prise::query()
            ->where('user_id', $userId)
            ->whereNull('libere_at')
            ->get();

        $ecarts = $inclureEcarts
            ? Ecart::query()->where('user_id', $userId)->get()
            : collect();

        $heures = $this->heuresPourGrille($dispos, $prises);
        $cells = [];
        $baseSemaine = Carbon::today()->startOfWeek();

        foreach ($jours as $index => $nom) {
            foreach ($heures as $heure) {
                $niveau = 'non_definie';

                foreach ($dispos as $dispo) {
                    if ($dispo->jour !== $index) {
                        continue;
                    }

                    if ($heure >= substr($dispo->debut, 0, 5) && $heure < substr($dispo->fin, 0, 5)) {
                        $niveau = $dispo->niveau;
                        break;
                    }
                }

                if ($inclureEcarts) {
                    $dateCase = $baseSemaine->copy()->addDays($index - 1);

                    foreach ($ecarts as $ecart) {
                        $debut = $ecart->date?->copy();
                        $fin = $ecart->date_fin?->copy() ?? $ecart->date?->copy();

                        if ($debut !== null && $fin !== null && $dateCase->betweenIncluded($debut, $fin)) {
                            $niveau = 'non_definie';
                        }
                    }
                }

                foreach ($prises as $prise) {
                    if ($prise->date?->dayOfWeekIso !== $index) {
                        continue;
                    }

                    if ($heure >= substr($prise->debut, 0, 5) && $heure < substr($prise->fin, 0, 5)) {
                        $niveau = 'reserve';
                        break;
                    }
                }

                $cells[] = [
                    'jour' => $nom,
                    'heure' => $heure,
                    'niveau' => $niveau,
                ];
            }
        }

        return [
            'jours' => array_values($jours),
            'heures' => $heures,
            'cells' => $cells,
        ];
    }

    protected function niveau(int $userId, string $date, string $debut, string $fin): array
    {
        $ecart = Ecart::query()
            ->where('user_id', $userId)
            ->whereDate('date', '<=', $date)
            ->where(function ($query) use ($date) {
                $query
                    ->whereNull('date_fin')
                    ->orWhereDate('date_fin', '>=', $date);
            })
            ->orderByDesc('id')
            ->first();

        if ($ecart !== null) {
            return [
                'niveau' => 'indisponible',
                'motif' => $ecart->motif,
            ];
        }

        $jour = Carbon::parse($date)->dayOfWeekIso;

        $dispo = Dispo::query()
            ->where('user_id', $userId)
            ->where('jour', $jour)
            ->where('debut', '<=', $debut)
            ->where('fin', '>=', $fin)
            ->orderBy('debut')
            ->first();

        if ($dispo !== null) {
            return [
                'niveau' => $this->normaliserNiveau($dispo->niveau),
                'motif' => $dispo->motif,
            ];
        }

        return [
            'niveau' => 'indisponible',
            'motif' => 'Aucune disponibilite declaree.',
        ];
    }

    protected function aPrise(int $userId, string $date, string $debut, string $fin): bool
    {
        return Prise::query()
            ->where('user_id', $userId)
            ->whereDate('date', $date)
            ->whereNull('libere_at')
            ->where('debut', '<', $fin)
            ->where('fin', '>', $debut)
            ->exists();
    }

    protected function verifierCharge(int $userId, string $date, string $debut, string $fin): ?string
    {
        $charge = $this->chargeApplicable($userId, $date);

        if ($charge === null) {
            return null;
        }

        $minutes = $this->minutes($debut, $fin);
        $jour = $this->minutesPrisesJour($userId, $date) + $minutes;

        if ($charge->max_jour !== null && $jour > $charge->max_jour * 60) {
            return 'Charge journaliere depassee.';
        }

        $semaine = $this->minutesPrisesSemaine($userId, $date) + $minutes;

        if ($charge->max_semaine !== null && $semaine > $charge->max_semaine * 60) {
            return 'Charge hebdomadaire depassee.';
        }

        return null;
    }

    protected function chargeApplicable(int $userId, string $date): ?Charge
    {
        $semestre = $this->semestrePourDate($date);
        $anneeAcademique = $this->anneeAcademiquePourDate($date);

        $charges = Charge::query()
            ->where('user_id', $userId)
            ->where('annee_academique', $anneeAcademique)
            ->get();

        foreach ($charges as $charge) {
            $semestresCharge = $this->deserializeSemestresCharge($charge->getRawOriginal('semestre'));
            
            if (in_array('tous_les_semestres', $semestresCharge, true) || 
                in_array($semestre, $semestresCharge, true)) {
                return $charge;
            }
        }

        return null;
    }

    protected function minutesPrisesJour(int $userId, string $date): int
    {
        return $this->minutesDepuis(
            Prise::query()
                ->where('user_id', $userId)
                ->whereDate('date', $date)
                ->whereNull('libere_at')
                ->get()
        );
    }

    protected function minutesPrisesSemaine(int $userId, string $date): int
    {
        $debut = Carbon::parse($date)->startOfWeek();
        $fin = Carbon::parse($date)->endOfWeek();

        return $this->minutesDepuis(
            Prise::query()
                ->where('user_id', $userId)
                ->whereBetween('date', [$debut->toDateString(), $fin->toDateString()])
                ->whereNull('libere_at')
                ->get()
        );
    }

    protected function minutesDepuis(Collection $prises): int
    {
        return $prises->sum(fn (Prise $prise) => $this->minutes($prise->debut, $prise->fin));
    }

    protected function minutes(string $debut, string $fin): int
    {
        return Carbon::createFromFormat('H:i:s', $debut)
            ->diffInMinutes(Carbon::createFromFormat('H:i:s', $fin));
    }

    protected function heuresPourGrille(Collection $dispos, Collection $prises): array
    {
        $debutParDefaut = 7 * 60;
        $finParDefaut = 20 * 60;

        $debut = $debutParDefaut;
        $fin = $finParDefaut;

        foreach ($dispos as $dispo) {
            $debut = min($debut, $this->minutesDepuisMinuit($dispo->debut));
            $fin = max($fin, $this->minutesDepuisMinuit($dispo->fin));
        }

        foreach ($prises as $prise) {
            $debut = min($debut, $this->minutesDepuisMinuit($prise->debut));
            $fin = max($fin, $this->minutesDepuisMinuit($prise->fin));
        }

        $premiereHeure = intdiv($debut, 60);
        $derniereHeure = max($premiereHeure, intdiv(max($fin - 1, $debut), 60));

        return collect(range($premiereHeure, $derniereHeure))
            ->map(fn (int $heure) => sprintf('%02d:00', $heure))
            ->values()
            ->all();
    }

    protected function minutesDepuisMinuit(string $heure): int
    {
        [$heures, $minutes] = array_map('intval', explode(':', substr($heure, 0, 5)));

        return ($heures * 60) + $minutes;
    }

    protected function enregistrerHistorique(Dispo $dispo, int $enseignantId, string $action, string $description): void
    {
        HistoriqueDisponibilite::create([
            'dispo_id' => $dispo->id,
            'enseignant_id' => $enseignantId,
            'action' => $action,
            'description' => $description,
            'created_at' => now(),
        ]);
    }

    protected function formaterDisponibilite(Dispo|array $dispo): string
    {
        $jour = $dispo instanceof Dispo ? $dispo->jour : (int) ($dispo['jour'] ?? 0);
        $debut = $dispo instanceof Dispo ? $dispo->debut : (string) ($dispo['debut'] ?? '');
        $fin = $dispo instanceof Dispo ? $dispo->fin : (string) ($dispo['fin'] ?? '');

        return sprintf(
            '%s %s-%s',
            $this->nomJour($jour),
            substr($debut, 0, 5),
            substr($fin, 0, 5),
        );
    }

    protected function nomJour(int $jour): string
    {
        return [
            1 => 'Lundi',
            2 => 'Mardi',
            3 => 'Mercredi',
            4 => 'Jeudi',
            5 => 'Vendredi',
            6 => 'Samedi',
            7 => 'Dimanche',
        ][$jour] ?? 'Jour inconnu';
    }

    protected function normaliserNiveau(?string $niveau): string
    {
        return $niveau === 'acceptable' ? 'prefere' : ($niveau ?: 'prefere');
    }
}
