<?php

namespace App\Metiers;

use App\Models\Charge;
use App\Models\Dispo;
use App\Models\Ecart;
use App\Models\Prise;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class AlerteMetier
{
    public function pour(User $user): array
    {
        if ($user->role === 'etudiant') {
            return [];
        }

        if ($user->role === 'admin') {
            return $this->pourAdmin();
        }

        return $this->pourEnseignant($user);
    }

    public function pourAdmin(): array
    {
        $indicateurs = $this->indicateursAdmin();
        $alertes = [];

        $alertes[] = $this->format(
            'info',
            'Mises a jour de la semaine',
            $this->messageDeclarationsSemaine($indicateurs['declarations_semaine']),
            '/consultation'
        );

        $alertes[] = $this->format(
            $indicateurs['conflits'] > 0 ? 'danger' : 'info',
            'Conflits detectes',
            $this->messageConflits($indicateurs['conflits']),
            '/consultation/notifications'
        );

        $alertes[] = $this->format(
            $indicateurs['sans_dispo'] > 0 ? 'attention' : 'info',
            'Enseignants sans disponibilite',
            $this->messageSansDisponibilite($indicateurs['sans_dispo']),
            '/consultation'
        );

        return $alertes;
    }

    public function indicateursAdmin(): array
    {
        $enseignants = User::query()->where('role', 'enseignant')->get();
        $semaine = now()->startOfWeek();

        return [
            'declarations_semaine' => $enseignants->filter(function (User $enseignant) use ($semaine) {
                return Dispo::query()
                    ->where('user_id', $enseignant->id)
                    ->where('updated_at', '>=', $semaine)
                    ->exists();
            })->count(),
            'conflits' => $enseignants->sum(function (User $enseignant) {
                return count($this->conflits($enseignant->id, $this->prisesActives($enseignant->id)));
            }),
            'avec_dispo' => $enseignants->filter(function (User $enseignant) {
                return Dispo::query()->where('user_id', $enseignant->id)->exists();
            })->count(),
            'sans_dispo' => $enseignants->filter(function (User $enseignant) {
                return ! Dispo::query()->where('user_id', $enseignant->id)->exists();
            })->count(),
            'exceptions' => Ecart::query()
                ->where(function ($query) {
                    $query
                        ->whereDate('date', '>=', now()->toDateString())
                        ->orWhereDate('date_fin', '>=', now()->toDateString());
                })
                ->count(),
        ];
    }

    protected function pourEnseignant(User $user): array
    {
        $alertes = [];

        $dispos = Dispo::query()->where('user_id', $user->id)->get();
        $ecarts = Ecart::query()->where('user_id', $user->id)->get();
        $prises = $this->prisesActives($user->id);

        if ($dispos->isEmpty()) {
            $alertes[] = $this->format(
                'attention',
                'Aucune disponibilite hebdomadaire',
                'Ajoutez vos creneaux de base pour rendre vos contraintes visibles.',
                '/dispos'
            );
        }

        $modifs = $this->modifsRecentes($dispos, $ecarts, $user);

        if ($modifs > 0) {
            $alertes[] = $this->format(
                'info',
                'Modifications recentes detectees',
                "Vos donnees ont ete mises a jour {$modifs} fois recemment.",
                '/dispos'
            );
        }

        foreach ($prises as $prise) {
            $alertes[] = $this->format(
                'info',
                'Creneau reserve',
                'Une reservation '.$prise->source.' est active le '.$prise->date?->format('Y-m-d').' de '.substr($prise->debut, 0, 5).' a '.substr($prise->fin, 0, 5).'.',
                '/mes-reservations'
            );
        }

        foreach ($this->conflits($user->id, $prises) as $conflit) {
            $alertes[] = $this->format(
                'danger',
                'Exception en conflit',
                $conflit,
                '/ecarts'
            );
        }

        $charge = Charge::query()->where('user_id', $user->id)->first();

        if ($charge === null) {
            $alertes[] = $this->format(
                'info',
                'Charge non definie',
                'Ajoutez vos charges par semestre et annee academique pour securiser les reservations.',
                '/dispos'
            );
        }

        return array_slice($alertes, 0, 12);
    }

    protected function prisesActives(int $userId): Collection
    {
        return Prise::query()
            ->where('user_id', $userId)
            ->whereNull('libere_at')
            ->orderBy('date')
            ->orderBy('debut')
            ->get();
    }

    protected function modifsRecentes(Collection $dispos, Collection $ecarts, User $user): int
    {
        $limite = now()->subDay();

        $total = $dispos->filter(fn (Dispo $dispo) => $dispo->updated_at?->gte($limite))->count();
        $total += $ecarts->filter(fn (Ecart $ecart) => $ecart->updated_at?->gte($limite))->count();

        if (Charge::query()->where('user_id', $user->id)->where('updated_at', '>=', $limite)->exists()) {
            $total++;
        }

        return $total;
    }

    protected function conflits(int $userId, Collection $prises): array
    {
        $messages = [];

        foreach ($prises as $prise) {
            $ecart = Ecart::query()
                ->where('user_id', $userId)
                ->whereDate('date', '<=', $prise->date)
                ->where(function ($query) use ($prise) {
                    $query
                        ->whereNull('date_fin')
                        ->orWhereDate('date_fin', '>=', $prise->date);
                })
                ->first();

            if ($ecart !== null) {
                $messages[] = 'Une exception bloque la reservation du '.$prise->date?->format('Y-m-d').'.';
            }
        }

        return array_values(array_unique($messages));
    }

    protected function format(string $type, string $titre, string $texte, string $lien): array
    {
        return [
            'type' => $type,
            'titre' => $titre,
            'texte' => $texte,
            'lien' => $lien,
            'date' => Carbon::now()->toDateTimeString(),
        ];
    }

    protected function messageDeclarationsSemaine(int $total): string
    {
        if ($total === 0) {
            return 'Aucun enseignant n a mis a jour ses disponibilites cette semaine.';
        }

        if ($total === 1) {
            return '1 enseignant a mis a jour ses disponibilites cette semaine.';
        }

        return $total.' enseignants ont mis a jour leurs disponibilites cette semaine.';
    }

    protected function messageConflits(int $total): string
    {
        if ($total === 0) {
            return 'Aucun conflit de disponibilite n est detecte pour le moment.';
        }

        if ($total === 1) {
            return '1 conflit de disponibilite est actuellement detecte.';
        }

        return $total.' conflits de disponibilite sont actuellement detectes.';
    }

    protected function messageSansDisponibilite(int $total): string
    {
        if ($total === 0) {
            return 'Tous les enseignants ont renseigne leurs disponibilites hebdomadaires.';
        }

        if ($total === 1) {
            return '1 enseignant n a pas encore renseigne ses disponibilites hebdomadaires.';
        }

        return $total.' enseignants n ont pas encore renseigne leurs disponibilites hebdomadaires.';
    }

}
