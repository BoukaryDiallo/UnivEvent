<?php

namespace App\Services;

use App\Models\Election;
use App\Models\Etudiant;
use App\Models\ListeElectorale;

class ListeElectoraleService
{
    public function generer(Election $election, array $filters = []): int
    {
        $this->verifierExistence($election);

        $etudiants = $this->buildQuery($election, $filters)->get();

        $this->insertListe($election, $etudiants);

        return $etudiants->count();
    }

    private function verifierExistence(Election $election): void
    {
        if (ListeElectorale::where('id_election', $election->id_election)->exists()) {
            throw new \RuntimeException('La liste électorale existe déjà.');
        }
    }

    private function buildQuery(Election $election, array $filters)
    {
        $query = Etudiant::where('statut', 'inscrit');

        // Filtre par UFR (optionnel)
        if (isset($filters['id_ufr']) && $filters['id_ufr']) {
            $query->where('id_ufr', $filters['id_ufr']);
        }

        // Filtre par département (optionnel, mutuellement exclusif avec UFR)
        if (isset($filters['id_departement']) && $filters['id_departement']) {
            $query->where('id_departement', $filters['id_departement']);
        }

        // Filtre par niveau (optionnel pour les élections de type promotion)
        if (isset($filters['niveau']) && $filters['niveau']) {
            $query->where('niveau', $filters['niveau']);
        }

        return $query;
    }

    private function insertListe(Election $election, $etudiants): void
    {
        foreach ($etudiants as $etudiant) {
            ListeElectorale::create([
                'id_election' => $election->id_election,
                'id_etudiant' => $etudiant->id,
                'statut_snapshot' => $etudiant->statut,
            ]);
        }
    }
}
