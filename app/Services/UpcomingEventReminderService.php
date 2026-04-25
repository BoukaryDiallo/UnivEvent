<?php

namespace App\Services;

use App\Models\EventNotification;
use App\Models\InscriptionEvenement;
use App\Models\User;

class UpcomingEventReminderService
{
    public function dispatchForUser(User $user): int
    {
        $created = 0;

        $upcoming = InscriptionEvenement::query()
            ->with('evenement')
            ->where('utilisateur_id', $user->id)
            ->where('statut', 'accepte')
            ->get()
            ->filter(fn (InscriptionEvenement $inscription) => $inscription->evenement?->date_debut?->between(now(), now()->copy()->addDay()));

        foreach ($upcoming as $inscription) {
            $exists = EventNotification::query()
                ->where('user_id', $user->id)
                ->where('evenement_id', $inscription->evenement_id)
                ->where('type', 'rappel_evenement')
                ->exists();

            if ($exists || ! $inscription->evenement) {
                continue;
            }

            app(EventNotificationService::class)->notify(
                $user,
                'rappel_evenement',
                'Rappel evenement',
                "{$inscription->evenement->titre} commence dans moins de 24 heures.",
                $inscription->evenement_id,
                ['date_debut' => optional($inscription->evenement->date_debut)->toIso8601String()],
            );

            $created++;
        }

        return $created;
    }

    public function dispatchForAllUsers(): int
    {
        return User::query()
            ->select('id', 'name', 'email')
            ->get()
            ->sum(fn (User $user) => $this->dispatchForUser($user));
    }
}
