<?php

namespace App\Services;

use App\Models\Election;
use App\Models\Candidature;
use App\Models\Resultat;

class ElectionService
{
    /**
     * Vérifie si une élection peut être dépouillée
     */
    public function peutEtreDepouillee(Election $election): bool
    {
        return $election->statut === 'cloturee';
    }

    /**
     * Vérifie si une élection a des résultats en brouillon
     */
    public function aResultatsBrouillon(Election $election): bool
    {
        return Resultat::where('id_election', $election->id_election)
            ->where('tour', $election->tour)
            ->where('statut_publication', 'brouillon')
            ->exists();
    }

    /**
     * Vérifie si une élection a des résultats officiels
     */
    public function aResultatsOfficiels(Election $election): bool
    {
        return Resultat::where('id_election', $election->id_election)
            ->where('tour', $election->tour)
            ->where('statut_publication', 'officiel')
            ->exists();
    }

    /**
     * Vérifie si les résultats sont déjà publiés (immuables)
     */
    public function resultatsPublies(Election $election): bool
    {
        return $this->aResultatsOfficiels($election);
    }

    /**
     * Récupère les candidatures valides pour une élection
     */
    public function getCandidaturesValidees(Election $election)
    {
        return Candidature::where('id_election', $election->id_election)
            ->where('statut', 'validee')
            ->with('user')
            ->get();
    }

    /**
     * Vérifie l'intégrité du processus électoral
     */
    public function validerIntegrite(Election $election): array
    {
        $errors = [];
        
        if (!$this->peutEtreDepouillee($election)) {
            $errors[] = "L'élection doit être clôturée avant dépouillement";
        }

        if ($this->resultatsPublies($election)) {
            $errors[] = "Les résultats sont déjà publiés et immuables";
        }

        $candidatures = $this->getCandidaturesValidees($election);
        if ($candidatures->isEmpty()) {
            $errors[] = "Aucune candidature validée pour cette élection";
        }

        return $errors;
    }
}
