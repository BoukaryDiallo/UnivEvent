<?php

namespace App\Services;

use App\Models\Etudiant;
use App\Models\ListeElectorale;
use App\Models\Election;

class ListeElectoraleService
{
    /**
     * 🎯 Générer la liste électorale pour une élection
     */
    public function generer(Election $election, array $filters)
    {
        // Vérifier si déjà générée
        $exist = ListeElectorale::where('id_election', $election->id_election)->exists();

        if ($exist) {
            throw new \Exception("La liste électorale a déjà été générée pour cette élection.");
        }

        //  Construire la requête de filtrage
        $query = Etudiant::query();

        if (!empty($filters['id_ufr'])) {
            $query->where('id_ufr', $filters['id_ufr']);
        }

        if (!empty($filters['id_departement'])) {
            $query->where('id_departement', $filters['id_departement']);
        }

        if (!empty($filters['id_filiere'])) {
            $query->where('id_filiere', $filters['id_filiere']);
        }

        if (!empty($filters['niveau'])) {
            $query->where('niveau', $filters['niveau']);
        }

        // étudiants uniquement inscrits
        $query->where('statut', 'inscrit');

        $etudiants = $query->get();

        // Insérer dans liste électorale
        foreach ($etudiants as $etudiant) {
            ListeElectorale::create([
                'id_election' => $election->id_election,
                'id_etudiant' => $etudiant->id,
            ]);
        }

        return count($etudiants);
    }
}