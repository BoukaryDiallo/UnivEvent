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
    public function generer(Election $election, array $filters = [])
    {
        // Vérifier si déjà générée
        $exist = ListeElectorale::where('id_election', $election->id_election)->exists();

        if ($exist) {
            throw new \Exception("La liste électorale a déjà été générée pour cette élection.");
        }

        $query = Etudiant::query()->where('statut', 'inscrit');

        if ($election->type === 'ufr') {
            if (!$election->id_ufr) throw new \Exception('UFR requise.');
            $query->where('id_ufr', $election->id_ufr);
        } elseif ($election->type === 'promotion') {
            if (!$election->id_filiere) throw new \Exception('Filière requise.');
            if (empty($filters['niveau'])) throw new \Exception('Niveau requis pour promotion.');
            $query->where('id_filiere', $election->id_filiere)
                  ->where('niveau', $filters['niveau']);
        } else {
            throw new \Exception("Type non supporté: " . $election->type);
        }

        $etudiants = $query->get();

        foreach ($etudiants as $etudiant) {
            ListeElectorale::create([
                'id_election' => $election->id_election,
                'id_etudiant' => $etudiant->id,
                'statut_snapshot' => $etudiant->statut,
            ]);
        }

        return $etudiants->count();
    }
}