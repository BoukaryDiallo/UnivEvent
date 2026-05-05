<?php

namespace App\Observers;

use App\Models\Election;
use App\Models\Etudiant;
use App\Models\ListeElectorale;

class ElectionObserver
{
    /**
     * Quand une élection est créée
     */
    public function created(Election $election): void
    {
        // Désactivé : génération manuelle via service pour listes ciblées par UFR/Promotion
        // $etudiants = Etudiant::where('statut', 'inscrit')->get();
        // foreach ($etudiants as $etudiant) {
        //     ListeElectorale::create([
        //         'id_election' => $election->id_election,
        //         'id_etudiant' => $etudiant->id,
        //         'a_vote'      => false,
        //     ]);
        // }
    }
}