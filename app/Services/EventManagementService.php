<?php

namespace App\Services;

use App\Models\Evenement;
use App\Models\EvenementMedia;
use Illuminate\Support\Facades\Storage;

class EventManagementService
{
    private const ROLES = ['organisateur', 'participant', 'intervenant', 'jury'];

    public function syncAssignments(Evenement $event, array $data): void
    {
        $event->assignments()->delete();

        foreach (self::ROLES as $role) {
            $entries = collect($data[$role] ?? [])->map(fn($e) => $this->normalizeEntry($e, $role));
            
            foreach ($entries->unique('user_id') as $entry) {
                $event->assignments()->create(array_merge($entry, [
                    'category' => 'assignment',
                    'role' => $role,
                    'meta' => ['source' => 'event_manager'],
                ]));
            }
        }
    }

    public function syncProgrammes(Evenement $event, array $programmes): void
    {
        $idsToKeep = [];
        foreach (collect($programmes)->filter(fn($p) => !empty($p['titre'])) as $index => $pData) {
            $payload = [
                'titre' => $pData['titre'],
                'description' => $pData['description'] ?? null,
                'intervenant' => $pData['intervenant'] ?? null,
                'date_programme' => $pData['date_programme'] ?? null,
                'heure_debut' => $pData['heure_debut'] ?? null,
                'heure_fin' => $pData['heure_fin'] ?? null,
                'salle' => $pData['salle'] ?? null,
                'ordre' => (int) ($pData['ordre'] ?? ($index + 1)),
            ];

            $prog = isset($pData['id']) ? $event->programmes()->find($pData['id']) : null;
            $item = $prog ? tap($prog)->update($payload) : $event->programmes()->create($payload);
            $idsToKeep[] = $item->id;
        }
        $event->programmes()->whereNotIn('id', $idsToKeep)->delete();
    }

    public function storeBanner($request, Evenement $event): void
    {
        if (!$request->hasFile('media')) return;

        $file = $request->file('media');
        $path = Storage::disk('public')->put('evenements', $file);

        EvenementMedia::create([
            'evenement_id' => $event->id,
            'type' => str_contains($file->getMimeType(), 'pdf') ? 'pdf' : 'image',
            'chemin_fichier' => $path,
            'nom_original' => $file->getClientOriginalName(),
            'taille' => $file->getSize(),
        ]);
    }

    private function normalizeEntry($entry, $role): array
    {
        $perms = $entry['permissions'] ?? $this->getDefaults($role);
        return [
            'user_id' => (int) ($entry['user_id'] ?? $entry),
            'is_president_jury' => (bool) ($entry['is_president_jury'] ?? false),
            'can_manage_messages' => (bool) ($perms['can_manage_messages'] ?? false),
            'can_manage_comments' => (bool) ($perms['can_manage_comments'] ?? false),
            'can_edit_event' => (bool) ($perms['can_edit_event'] ?? false),
            'can_manage_participants' => (bool) ($perms['can_manage_participants'] ?? false),
            'can_manage_certificates' => (bool) ($perms['can_manage_certificates'] ?? false),
            'can_manage_results' => (bool) ($perms['can_manage_results'] ?? false),
        ];
    }

    private function getDefaults(string $role): array {
        return $role === 'organisateur' ? ['can_manage_messages' => true, 'can_edit_event' => true] : [];
    }
}