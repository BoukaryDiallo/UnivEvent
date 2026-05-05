<?php

namespace App\Services;

use App\Models\Election;
use App\Models\Vote;
use App\Models\Resultat;
use App\Models\Candidature;
use Illuminate\Support\Collection;

class DepouillementService
{
    private ElectionService $electionService;

    public function __construct(ElectionService $electionService)
    {
        $this->electionService = $electionService;
    }

    public function calculerResultats(Election $election): array
    {
        $validation = $this->electionService->validerIntegrite($election);

        if (!empty($validation)) {
            throw new \InvalidArgumentException(implode(', ', $validation));
        }

        $votes = Vote::where('id_election', $election->id_election)
            ->where('tour', $election->tour)
            ->get();

        if ($votes->isEmpty()) {
            throw new \InvalidArgumentException('Aucun vote trouvé');
        }

        $votesParCandidature = $votes->groupBy('id_candidature');
        $totalVotes = $votes->count();

        $resultats = $this->calculerStatistiques($votesParCandidature, $totalVotes);

        $this->stockerResultatsBrouillon($election, $resultats);

        $secondTour = $this->verifierSecondTour($resultats, $totalVotes);

        if ($secondTour && $election->tour == 1) {
            $election->update(['statut' => 'second_tour_requis']);
            $this->mettreAJourCandidatures($election, $resultats, false);
        }

        if (!$secondTour && $election->tour == 1) {
            $election->update(['statut' => 'terminee']);
            $this->mettreAJourCandidatures($election, $resultats, true);
        }

        return [
            'total_votes' => $totalVotes,
            'second_tour' => $secondTour,
            'message' => $secondTour
                ? 'Second tour requis'
                : 'Élection terminée'
        ];
    }

    private function calculerStatistiques(Collection $votes, int $total): Collection
    {
        return $votes->map(function ($v, $id) use ($total) {
            $nb = $v->count();

            return [
                'id_candidature' => $id,
                'nb_voix' => $nb,
                'pourcentage' => $total > 0 ? round(($nb * 100) / $total, 2) : 0
            ];
        })->sortByDesc('nb_voix')->values();
    }

    private function stockerResultatsBrouillon(Election $election, Collection $resultats): void
    {
        foreach ($resultats as $index => $r) {
            Resultat::updateOrCreate(
                [
                    'id_election' => $election->id_election,
                    'id_candidature' => $r['id_candidature'],
                    'tour' => $election->tour
                ],
                [
                    'nb_voix' => $r['nb_voix'],
                    'pourcentage' => $r['pourcentage'],
                    'rang' => $index + 1,
                    'statut_publication' => 'brouillon'
                ]
            );
        }
    }

    private function verifierSecondTour(Collection $resultats, int $total): bool
    {
        if ($total === 0) return false;

        $premier = $resultats->first();
        $deuxieme = $resultats->skip(1)->first();

        if (!$premier) return false;

        if ($premier['pourcentage'] < 50) return true;

        if ($deuxieme && $premier['nb_voix'] == $deuxieme['nb_voix']) {
            return true;
        }

        return false;
    }

    private function mettreAJourCandidatures(Election $election, Collection $resultats, bool $elu): void
    {
        foreach ($resultats as $i => $r) {

            $c = Candidature::find($r['id_candidature']);

            if (!$c) continue;

            if ($elu && $i === 0) {
                $c->update(['resultat' => 'elu']);
            } elseif (!$elu && $i < 2) {
                $c->update(['resultat' => 'second_tour']);
            } else {
                $c->update(['resultat' => 'eliminee']);
            }
        }
    }
     /**
     * Vérifie si un recalcul est nécessaire
     */
    public function doitRecalculer(Election $election): bool
    {
        if (!$this->electionService->aResultatsBrouillon($election)) {
            return true;
        }

        // Vérifier si de nouveaux votes ont été enregistrés depuis le dernier calcul
        $dernierCalcul = Resultat::where('id_election', $election->id_election)
            ->where('tour', $election->tour)
            ->where('statut_publication', 'brouillon')
            ->max('updated_at');

        $votesApresCalcul = Vote::where('id_election', $election->id_election)
            ->where('tour', $election->tour)
            ->where('created_at', '>', $dernierCalcul)
            ->exists();

        return $votesApresCalcul;
    }
}


