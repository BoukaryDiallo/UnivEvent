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

        if ($election->type === 'ufr') {
            $query->where('id_ufr', $election->id_ufr);
        }

        if ($election->type === 'promotion') {
            $query->where('id_filiere', $election->id_filiere)
                ->where('niveau', $filters['niveau']);
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
