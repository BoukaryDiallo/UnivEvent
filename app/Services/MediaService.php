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
    private const ALLOWED_TYPES = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf',
        'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime',
    ];

    private const MAX_SIZE = 50 * 1024 * 1024; // 50MB

    private const CONFIDENTIALITY_LEVELS = [
        'public',
        'inscrits',
        'participants',
        'organisateur',
        'intervenant',
        'jury',
        'president_jury',
    ];

    public function uploadMedia(Evenement $event, UploadedFile $file, array $data = []): EvenementMedia
    {
        $this->validateFile($file);

        $path = Storage::disk('public')->put('evenements', $file);

        $shouldBeCover = $this->shouldUseAsCover($event, $file, $data);
        $meta = $this->normalizeMeta($data['meta'] ?? null, $shouldBeCover);

        $media = EvenementMedia::create([
            'evenement_id' => $event->id,
            'type' => $this->getMediaType($file),
            'chemin_fichier' => $path,
            'nom_original' => $file->getClientOriginalName(),
            'taille' => $file->getSize(),
            'description' => $data['description'] ?? null,
            'is_public' => $data['is_public'] ?? true,
            'download_allowed' => $data['download_allowed'] ?? true,
            'confidentialite' => $this->normalizeConfidentiality($data['confidentialite'] ?? null, $data['is_public'] ?? true),
            'meta' => $meta,
        ]);

        if ($shouldBeCover) {
            $this->setAsCover($media);
        }

        return $media;
    }

    public function updateMedia(EvenementMedia $media, array $data): EvenementMedia
    {
        $media->update([
            'description' => $data['description'] ?? $media->description,
            'is_public' => $data['is_public'] ?? $media->is_public,
            'download_allowed' => $data['download_allowed'] ?? $media->download_allowed,
            'confidentialite' => array_key_exists('confidentialite', $data)
                ? $this->normalizeConfidentiality($data['confidentialite'], (bool) ($data['is_public'] ?? $media->is_public))
                : $media->confidentialite,
            'meta' => $this->normalizeMeta(
                array_key_exists('meta', $data) ? $data['meta'] : $media->meta,
                (bool) ($data['is_cover'] ?? data_get($media->meta, 'is_cover', false)),
            ),
        ]);

        if (array_key_exists('is_cover', $data) && $data['is_cover']) {
            $this->setAsCover($media->fresh());
        }

        return $media;
    }

    public function deleteMedia(EvenementMedia $media): void
    {
        Storage::disk('public')->delete($media->chemin_fichier);
        $media->delete();
    }

    public function resolvePublicUrl(EvenementMedia $media): string
    {
        return asset('storage/'.$media->chemin_fichier);
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
        if (! $media->download_allowed) {
            return false;
        }

        return $this->canAccess($media, $user, $assignment);
    }

    public function canAccess(EvenementMedia $media, ?User $user, $assignment = null): bool
    {
        if ($media->is_public || $this->normalizeConfidentiality($media->confidentialite, (bool) $media->is_public) === 'public') {
            return true;
        }

        if (! $user) {
            return false;
        }

        $event = $media->relationLoaded('evenement') ? $media->evenement : $media->evenement()->first();

        if ($event && ($user->role === 'admin' || $event->cree_par === $user->id)) {
            return true;
        }

        $confidentialite = $this->normalizeConfidentiality($media->confidentialite, (bool) $media->is_public);
        $assignment ??= $event?->assignments()->where('user_id', $user->id)->first();

        if ($confidentialite === 'inscrits') {
            return $event?->inscriptions()->where('utilisateur_id', $user->id)->exists() ?? false;
        }

        if ($confidentialite === 'participants') {
            return $event?->inscriptions()
                ->where('utilisateur_id', $user->id)
                ->where('statut', 'accepte')
                ->exists() ?? false;
        }

        if (! $assignment) {
            return false;
        }

        return match ($confidentialite) {
            'organisateur' => $assignment->role === 'organisateur',
            'intervenant' => $assignment->role === 'intervenant',
            'jury' => $assignment->role === 'jury',
            'president_jury' => $assignment->role === 'jury' && (bool) $assignment->is_president_jury,
            default => (bool) ($assignment->permissions['can_download_media'] ?? false),
        };
    }

    public function getMediaForEvent(Evenement $event, ?User $user = null): array
    {
        $assignment = $user ? $event->assignments()->where('user_id', $user->id)->first() : null;

        return $event->medias->map(function ($media) use ($user, $assignment) {
            $canAccess = $this->canAccess($media, $user, $assignment);

            return [
                'id' => $media->id,
                'type' => $media->type,
                'name' => $media->nom_original,
                'size' => $media->taille,
                'url' => $canAccess ? $this->resolvePublicUrl($media) : null,
                'description' => $media->description,
                'is_public' => $media->is_public,
                'download_allowed' => (bool) $media->download_allowed,
                'confidentialite' => $this->normalizeConfidentiality($media->confidentialite, (bool) $media->is_public),
                'is_cover' => (bool) data_get($media->meta, 'is_cover', false),
                'can_view' => $canAccess,
                'can_download' => $this->canDownload($media, $user, $assignment),
                'uploaded_at' => $media->created_at,
            ];
        })->filter(fn (array $media) => $media['can_view'])->values()->toArray();
    }

    private function validateFile(UploadedFile $file): void
    {
        if (! in_array($file->getMimeType(), self::ALLOWED_TYPES)) {
            throw new \InvalidArgumentException('Type de fichier non autorisé. Seules les images, PDFs et vidéos (MP4, WebM) sont acceptés.');
        }

        if ($file->getSize() > self::MAX_SIZE) {
            throw new \InvalidArgumentException('Le fichier est trop volumineux. Taille maximale : 50MB.');
        }
    }

    private function getMediaType(UploadedFile $file): string
    {
        $mime = $file->getMimeType();
        if (str_contains($mime, 'pdf')) {
            return 'pdf';
        }
        if (str_contains($mime, 'video')) {
            return 'video';
        }

        return 'image';
    }

    private function normalizeConfidentiality(?string $confidentialite, bool $isPublic): string
    {
        if ($isPublic) {
            return 'public';
        }

        if (! $confidentialite || ! in_array($confidentialite, self::CONFIDENTIALITY_LEVELS, true)) {
            return 'inscrits';
        }

        return $confidentialite;
    }

    private function normalizeMeta(mixed $meta, bool $isCover = false): array
    {
        $payload = is_array($meta) ? $meta : [];
        $payload['is_cover'] = $isCover;

        return $payload;
    }

    private function shouldUseAsCover(Evenement $event, UploadedFile $file, array $data): bool
    {
        if ($this->getMediaType($file) !== 'image') {
            return false;
        }

        if ((bool) ($data['is_cover'] ?? false)) {
            return true;
        }

        return ! $event->medias()->where('type', 'image')->exists();
    }

    private function setAsCover(EvenementMedia $media): void
    {
        if ($media->type !== 'image') {
            return;
        }

        EvenementMedia::query()
            ->where('evenement_id', $media->evenement_id)
            ->where('id', '!=', $media->id)
            ->where('type', 'image')
            ->get()
            ->each(function (EvenementMedia $item) {
                $meta = is_array($item->meta) ? $item->meta : [];
                $meta['is_cover'] = false;
                $item->update(['meta' => $meta]);
            });

        $meta = is_array($media->meta) ? $media->meta : [];
        $meta['is_cover'] = true;
        $media->update(['meta' => $meta]);
    }
}
