<?php

namespace App\Services;

use App\Models\Evenement;
use App\Models\EvenementMedia;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class MediaService
{
    private const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    private const MAX_SIZE = 10 * 1024 * 1024; // 10MB

    public function uploadMedia(Evenement $event, UploadedFile $file, array $data = []): EvenementMedia
    {
        $this->validateFile($file);

        $path = Storage::disk('public')->put('evenements', $file);

        return EvenementMedia::create([
            'evenement_id' => $event->id,
            'type' => $this->getMediaType($file),
            'chemin_fichier' => $path,
            'nom_original' => $file->getClientOriginalName(),
            'taille' => $file->getSize(),
            'description' => $data['description'] ?? null,
            'is_public' => $data['is_public'] ?? true,
            'download_allowed' => $data['download_allowed'] ?? true,
        ]);
    }

    public function updateMedia(EvenementMedia $media, array $data): EvenementMedia
    {
        $media->update([
            'description' => $data['description'] ?? $media->description,
            'is_public' => $data['is_public'] ?? $media->is_public,
            'download_allowed' => $data['download_allowed'] ?? $media->download_allowed,
        ]);

        return $media;
    }

    public function deleteMedia(EvenementMedia $media): void
    {
        Storage::disk('public')->delete($media->chemin_fichier);
        $media->delete();
    }

    public function resolvePublicUrl(EvenementMedia $media): string
    {
        return asset('storage/' . $media->chemin_fichier);
    }

    public function download(EvenementMedia $media): BinaryFileResponse
    {
        abort_unless($media->download_allowed, 403, 'Téléchargement non autorisé');

        abort_unless(Storage::disk('public')->exists($media->chemin_fichier), 404, 'Fichier introuvable');

        return response()->download(
            Storage::disk('public')->path($media->chemin_fichier),
            $media->nom_original ?? basename($media->chemin_fichier),
        );
    }

    public function canDownload(EvenementMedia $media, ?User $user, $assignment = null): bool
    {
        if (!$media->download_allowed) {
            return false;
        }

        if ($media->is_public) {
            return true;
        }

        if (!$user) {
            return false;
        }

        if ($user->isAdmin()) {
            return true;
        }

        // Check assignment permissions
        return $assignment && ($assignment->permissions['can_download_media'] ?? false);
    }

    public function getMediaForEvent(Evenement $event, ?User $user = null): array
    {
        $assignment = $user ? $event->assignments()->where('user_id', $user->id)->first() : null;

        return $event->medias->map(function ($media) use ($user, $assignment) {
            return [
                'id' => $media->id,
                'type' => $media->type,
                'name' => $media->nom_original,
                'size' => $media->taille,
                'url' => $this->resolvePublicUrl($media),
                'description' => $media->description,
                'is_public' => $media->is_public,
                'can_download' => $this->canDownload($media, $user, $assignment),
                'uploaded_at' => $media->created_at,
            ];
        })->toArray();
    }

    private function validateFile(UploadedFile $file): void
    {
        if (!in_array($file->getMimeType(), self::ALLOWED_TYPES)) {
            throw new \InvalidArgumentException('Type de fichier non autorisé. Seules les images et PDFs sont acceptés.');
        }

        if ($file->getSize() > self::MAX_SIZE) {
            throw new \InvalidArgumentException('Le fichier est trop volumineux. Taille maximale : 10MB.');
        }
    }

    private function getMediaType(UploadedFile $file): string
    {
        return str_contains($file->getMimeType(), 'pdf') ? 'pdf' : 'image';
    }
}
