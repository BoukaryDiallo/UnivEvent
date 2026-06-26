<?php

namespace App\Services;

use App\Enums\DiplomaRequestStatus;
use App\Enums\DocumentType;
use App\Models\DiplomaDocument;
use App\Models\DiplomaRequest;
use App\Models\DiplomaRequestEvent;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DiplomaRequestService
{
    public const SUBMISSION_MINIMUM_DOCUMENTS = 1;

    public function createDraft(User $owner, array $attributes): DiplomaRequest
    {
        return DB::transaction(function () use ($owner, $attributes) {
            $request = $this->persistWithTrackingCode($owner, $attributes);

            $this->recordEvent($request, null, DiplomaRequestStatus::Draft, $owner, 'Brouillon créé');

            return $request;
        });
    }

    public function attachDocument(
        DiplomaRequest $request,
        UploadedFile $file,
        DocumentType $type,
    ): DiplomaDocument {
        $path = $file->storeAs(
            "diplomas/{$request->id}",
            Str::uuid().'.'.$file->getClientOriginalExtension(),
            'local',
        );

        return $request->documents()->create([
            'type' => $type,
            'path' => $path,
            'original_name' => $file->getClientOriginalName(),
            'mime' => $file->getMimeType(),
            'size' => $file->getSize(),
        ]);
    }

    public function removeDocument(DiplomaDocument $document): void
    {
        DB::transaction(function () use ($document) {
            Storage::disk('local')->delete($document->path);
            $document->delete();
        });
    }

    public function streamDocument(DiplomaDocument $document): StreamedResponse
    {
        return Storage::disk('local')->download($document->path, $document->original_name);
    }

    public function validateDocument(DiplomaDocument $document, User $actor): DiplomaDocument
    {
        if ($document->validated_at !== null) {
            return $document;
        }

        $document->forceFill([
            'validated_at' => now(),
            'validated_by' => $actor->id,
        ])->save();

        return $document->refresh();
    }

    public function validateDossier(DiplomaRequest $request, User $actor): DiplomaRequest
    {
        return DB::transaction(function () use ($request, $actor) {
            if ($request->status !== DiplomaRequestStatus::Submitted) {
                throw new \DomainException('Seules les demandes soumises peuvent être validées.');
            }

            if ($request->documents()->whereNull('validated_at')->exists()) {
                throw ValidationException::withMessages([
                    'documents' => 'Toutes les pièces doivent être validées avant de valider le dossier.',
                ]);
            }

            $from = $request->status;

            $request->forceFill([
                'status' => DiplomaRequestStatus::DocumentsValidated,
            ])->save();

            $this->recordEvent(
                $request,
                $from,
                DiplomaRequestStatus::DocumentsValidated,
                $actor,
                'Dossier validé',
            );

            return $request->refresh();
        });
    }

    public function reject(DiplomaRequest $request, User $actor, string $reason): DiplomaRequest
    {
        return DB::transaction(function () use ($request, $actor, $reason) {
            if (! in_array($request->status, [
                DiplomaRequestStatus::Submitted,
                DiplomaRequestStatus::DocumentsValidated,
            ], true)) {
                throw new \DomainException('La demande ne peut plus être rejetée.');
            }

            $from = $request->status;

            $request->forceFill([
                'status' => DiplomaRequestStatus::Rejected,
                'rejected_reason' => $reason,
            ])->save();

            $this->recordEvent(
                $request,
                $from,
                DiplomaRequestStatus::Rejected,
                $actor,
                $reason,
            );

            return $request->refresh();
        });
    }

    public function archive(DiplomaRequest $request, User $actor): DiplomaRequest
    {
        return DB::transaction(function () use ($request, $actor) {
            if ($request->status !== DiplomaRequestStatus::Delivered) {
                throw new \DomainException('Seules les demandes remises peuvent être archivées.');
            }

            $from = $request->status;

            $request->forceFill([
                'status' => DiplomaRequestStatus::Archived,
                'archived_at' => now(),
            ])->save();

            $this->recordEvent(
                $request,
                $from,
                DiplomaRequestStatus::Archived,
                $actor,
                'Dossier archivé',
            );

            return $request->refresh();
        });
    }

    public function markReadyForPickup(DiplomaRequest $request, User $actor): DiplomaRequest
    {
        return DB::transaction(function () use ($request, $actor) {
            if ($request->status !== DiplomaRequestStatus::DocumentsValidated) {
                throw new \DomainException('Le dossier doit être validé avant d\'être prêt à retirer.');
            }

            $from = $request->status;

            $request->forceFill([
                'status' => DiplomaRequestStatus::ReadyForPickup,
            ])->save();

            $this->recordEvent(
                $request,
                $from,
                DiplomaRequestStatus::ReadyForPickup,
                $actor,
                'Prêt à retirer',
            );

            return $request->refresh();
        });
    }

    public function submit(DiplomaRequest $request, User $actor): DiplomaRequest
    {
        return DB::transaction(function () use ($request, $actor) {
            if ($request->status !== DiplomaRequestStatus::Draft) {
                throw new \DomainException('La demande ne peut plus être soumise.');
            }

            if ($request->documents()->count() < self::SUBMISSION_MINIMUM_DOCUMENTS) {
                throw ValidationException::withMessages([
                    'documents' => sprintf(
                        'Vous devez téléverser au moins %d pièce(s) avant de soumettre.',
                        self::SUBMISSION_MINIMUM_DOCUMENTS,
                    ),
                ]);
            }

            $from = $request->status;

            $request->forceFill([
                'status' => DiplomaRequestStatus::Submitted,
                'submitted_at' => now(),
            ])->save();

            $this->recordEvent($request, $from, DiplomaRequestStatus::Submitted, $actor, 'Demande soumise');

            return $request->refresh();
        });
    }

    public function exportPdf(DiplomaRequest $request): Response
    {
        $request->loadMissing(['owner', 'documents', 'events.actor', 'appointment.pickupSlot']);

        $pdf = Pdf::loadView('diplomas.export', ['request' => $request])->setPaper('a4');

        return $pdf->download(sprintf('dossier-%s.pdf', $request->tracking_code));
    }

    public function recordEvent(
        DiplomaRequest $request,
        ?DiplomaRequestStatus $from,
        DiplomaRequestStatus $to,
        ?User $actor = null,
        ?string $note = null,
    ): DiplomaRequestEvent {
        return $request->events()->create([
            'from_status' => $from,
            'to_status' => $to,
            'actor_id' => $actor?->id,
            'note' => $note,
            'occurred_at' => now(),
        ]);
    }

    private function persistWithTrackingCode(User $owner, array $attributes): DiplomaRequest
    {
        $payload = [
            'owner_id' => $owner->id,
            'diploma_type' => $attributes['diploma_type'],
            'academic_year' => $attributes['academic_year'],
            'status' => DiplomaRequestStatus::Draft,
        ];

        for ($attempt = 0; $attempt < 5; $attempt++) {
            $payload['tracking_code'] = $this->generateTrackingCode();

            try {
                return DiplomaRequest::create($payload);
            } catch (UniqueConstraintViolationException) {
                continue;
            }
        }

        throw new \RuntimeException('Impossible de générer un code de suivi unique.');
    }

    private function generateTrackingCode(): string
    {
        return sprintf('DIP-%s-%s', now()->format('Y'), Str::upper(Str::random(8)));
    }
}
