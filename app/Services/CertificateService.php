<?php

namespace App\Services;

use App\Models\Certificat;
use App\Models\Evenement;
use App\Models\User;

class CertificateService
{
    public function latestCertificateForParticipant(Evenement $evenement, User $user): ?Certificat
    {
        return Certificat::query()
            ->where('evenement_id', $evenement->id)
            ->where('utilisateur_id', $user->id)
            ->orderByDesc('published_at')
            ->orderByDesc('created_at')
            ->first();
    }

    public function certificateUrl(Certificat $certificat): string
    {
        return asset('storage/'.$certificat->fichier);
    }

    public function userIsEligible(Evenement $evenement, User $user): bool
    {
        return $evenement->inscriptions()
            ->where('utilisateur_id', $user->id)
            ->where('statut', 'accepte')
            ->exists()
            || $evenement->resultats()
                ->where('utilisateur_id', $user->id)
                ->exists();
    }
}
