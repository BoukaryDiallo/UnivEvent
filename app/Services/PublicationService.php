<?php

namespace App\Services;

use App\Models\Election;
use App\Models\Candidature;
use App\Models\Resultat;
use Illuminate\Support\Collection;

class PublicationService
{
    private ElectionService $electionService;

    public function __construct(ElectionService $electionService)
    {
        $this->electionService = $electionService;
    }

    public function publierResultats(Election $election): array
    {
        $errors = $this->validerPublication($election);

        if (!empty($errors)) {
            throw new \InvalidArgumentException(implode(', ', $errors));
        }

        $resultats = $this->getResultatsBrouillon($election);

        if ($resultats->isEmpty()) {
            throw new \InvalidArgumentException("Aucun résultat à publier");
        }

        $this->marquerResultatsOfficiels($election);

        $decision = $this->appliquerReglesElectoral($election, $resultats);

        return [
            'decision' => $decision,
            'message' => 'Publication effectuée avec succès',
            'resultats_publies' => $resultats->count()
        ];
    }

    private function validerPublication(Election $election): array
    {
        $errors = [];

        if ($this->electionService->resultatsPublies($election)) {
            $errors[] = "Résultats déjà publiés";
        }

        if (!$this->electionService->aResultatsBrouillon($election)) {
            $errors[] = "Aucun résultat en brouillon";
        }

        return $errors;
    }

    private function getResultatsBrouillon(Election $election): Collection
    {
        return Resultat::where('id_election', $election->id_election)
            ->where('tour', $election->tour)
            ->where('statut_publication', 'brouillon')
            ->orderByDesc('nb_voix')
            ->get();
    }

    private function marquerResultatsOfficiels(Election $election): void
    {
        Resultat::where('id_election', $election->id_election)
            ->where('tour', $election->tour)
            ->update(['statut_publication' => 'officiel']);
    }

    private function appliquerReglesElectoral(Election $election, Collection $resultats): array
    {
        $total = $resultats->sum('nb_voix');
        $premier = $resultats->first();
        $deuxieme = $resultats->skip(1)->first();

        if (!$premier) {
            throw new \InvalidArgumentException("Aucun candidat trouvé");
        }

        if ($election->tour == 1) {
            // Vérifier l'égalité des voix entre les premiers candidats
            if ($deuxieme && $premier->nb_voix == $deuxieme->nb_voix) {
                return $this->gererSecondTour($election, $resultats);
            }

            // Majorité absolue stricte (plus de 50%)
            if ($premier->nb_voix > ($total / 2)) {
                return $this->gererEluDirect($election, $premier->id_candidature);
            }

            // Sinon second tour obligatoire
            return $this->gererSecondTour($election, $resultats);
        }

        if ($election->tour == 2) {
            return $this->gererEluSecondTour($election, $premier->id_candidature);
        }

        throw new \LogicException("Tour d'élection invalide");
    }

    private function gererEluDirect(Election $election, int $id): array
    {
        Candidature::where('id_candidature', $id)
            ->update(['resultat' => 'elu']);

        Candidature::where('id_election', $election->id_election)
            ->where('id_candidature', '!=', $id)
            ->update(['resultat' => 'eliminee']);

        $election->update(['statut' => 'terminee']);

        return [
            'type' => 'elu_direct',
            'message' => 'Élu au premier tour',
            'id_candidature_elu' => $id
        ];
    }

    private function gererSecondTour(Election $election, Collection $resultats): array
    {
        $top2 = $resultats->take(2)->pluck('id_candidature');

        Candidature::where('id_election', $election->id_election)
            ->whereIn('id_candidature', $top2)
            ->update(['resultat' => 'second_tour']);

        Candidature::where('id_election', $election->id_election)
            ->whereNotIn('id_candidature', $top2)
            ->update(['resultat' => 'eliminee']);

        $election->update([
            'tour' => 2,
            'statut' => 'second_tour_planifie'
        ]);

        return [
            'type' => 'second_tour',
            'message' => 'Second tour requis',
            'candidatures_qualifiees' => $top2->toArray()
        ];
    }

    private function gererEluSecondTour(Election $election, int $id): array
    {
        Candidature::where('id_candidature', $id)
            ->update(['resultat' => 'elu']);

        Candidature::where('id_election', $election->id_election)
            ->where('id_candidature', '!=', $id)
            ->update(['resultat' => 'eliminee']);

        $election->update(['statut' => 'terminee']);

        return [
            'type' => 'elu_second_tour',
            'message' => 'Élu au second tour',
            'id_candidature_elu' => $id
        ];
    }

    public function getResultatsOfficiels(Election $election): Collection
    {
        return Resultat::where('id_election', $election->id_election)
            ->where('tour', $election->tour)
            ->where('statut_publication', 'officiel')
            ->with('candidature.user')
            ->orderByDesc('nb_voix')
            ->get();
    }

    public function resultatsImmuables(Election $election): bool
    {
        return $this->electionService->resultatsPublies($election);
    }
}