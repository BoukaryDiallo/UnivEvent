<?php

namespace App\Services;

use App\Models\Evenement;
use App\Models\Programme;
use Illuminate\Support\Collection;

class ProgramService
{
    public function addSession(Evenement $event, array $data): Programme
    {
        $maxOrder = $event->programmes()->max('ordre') ?? 0;

        return $event->programmes()->create([
            'titre' => $data['titre'],
            'description' => $data['description'] ?? null,
            'intervenant' => $data['intervenant'] ?? null,
            'date_programme' => $data['date_programme'] ?? $event->date_debut?->toDateString(),
            'heure_debut' => $data['heure_debut'] ?? null,
            'heure_fin' => $data['heure_fin'] ?? null,
            'salle' => $data['salle'] ?? null,
            'type_section' => $data['type_section'] ?? 'presentation',
            'ordre' => $data['ordre'] ?? ($maxOrder + 1),
        ]);
    }

    public function updateSession(Programme $programme, array $data): Programme
    {
        $programme->update([
            'titre' => $data['titre'],
            'description' => $data['description'] ?? $programme->description,
            'intervenant' => $data['intervenant'] ?? $programme->intervenant,
            'date_programme' => $data['date_programme'] ?? $programme->date_programme,
            'heure_debut' => $data['heure_debut'] ?? $programme->heure_debut,
            'heure_fin' => $data['heure_fin'] ?? $programme->heure_fin,
            'salle' => $data['salle'] ?? $programme->salle,
            'type_section' => $data['type_section'] ?? $programme->type_section,
            'ordre' => $data['ordre'] ?? $programme->ordre,
        ]);

        return $programme;
    }

    public function deleteSession(Evenement $event, Programme $programme): void
    {
        $programme->delete();
    }

    public function reorderSessions(Evenement $event, array $ordering): void
    {
        foreach ($ordering as $position => $programmeId) {
            $event->programmes()
                ->where('id', $programmeId)
                ->update(['ordre' => $position + 1]);
        }
    }

    public function getUpcomingSessions(Evenement $event): Collection
    {
        return $event->programmes()
            ->where('date_programme', '>=', now()->toDateString())
            ->orderBy('date_programme')
            ->orderBy('heure_debut')
            ->get();
    }

    public function validateSessionData(array $data): array
    {
        $errors = [];

        if (empty($data['titre'])) {
            $errors[] = 'Le titre de la session est requis.';
        }

        if (!empty($data['heure_debut']) && !empty($data['heure_fin'])) {
            if (strtotime($data['heure_debut']) >= strtotime($data['heure_fin'])) {
                $errors[] = 'L\'heure de fin doit être après l\'heure de début.';
            }
        }

        return $errors;
    }
}
