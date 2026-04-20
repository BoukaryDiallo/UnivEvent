<?php

namespace App\Presenters;

use App\Enums\DiplomaRequestStatus;
use App\Models\DiplomaDocument;
use App\Models\DiplomaRequest;
use App\Models\DiplomaRequestEvent;
use App\Models\PickupAppointment;
use App\Models\PickupSlot;
use App\Models\User;

class DiplomaRequestPresenter
{
    public static function row(DiplomaRequest $request): array
    {
        return [
            'id' => $request->id,
            'tracking_code' => $request->tracking_code,
            'diploma_type' => $request->diploma_type,
            'academic_year' => $request->academic_year,
            'status' => $request->status->value,
            'status_label' => $request->status->label(),
            'submitted_at' => $request->submitted_at?->toIso8601String(),
            'updated_at' => $request->updated_at->toIso8601String(),
        ];
    }

    public static function detail(DiplomaRequest $request, User $viewer): array
    {
        return [
            'id' => $request->id,
            'tracking_code' => $request->tracking_code,
            'diploma_type' => $request->diploma_type,
            'academic_year' => $request->academic_year,
            'status' => $request->status->value,
            'status_label' => $request->status->label(),
            'submitted_at' => $request->submitted_at?->toIso8601String(),
            'rejected_reason' => $request->status === DiplomaRequestStatus::Rejected
                ? $request->rejected_reason
                : null,
            'documents' => $request->documents
                ->map(fn (DiplomaDocument $d) => self::document($d, $viewer))
                ->all(),
            'events' => $request->events
                ->sortByDesc('occurred_at')
                ->values()
                ->map(fn (DiplomaRequestEvent $e) => self::event($e))
                ->all(),
            'appointment' => $request->appointment
                ? self::appointment($request->appointment, $viewer)
                : null,
        ];
    }

    public static function abilities(DiplomaRequest $request, User $viewer): array
    {
        return [
            'addDocument' => $viewer->can('addDocument', $request),
            'submit' => $viewer->can('submit', $request),
            'book' => $viewer->can('book', $request),
        ];
    }

    public static function slot(PickupSlot $slot): array
    {
        $reserved = $slot->appointments_count ?? $slot->appointments()->count();

        return [
            'id' => $slot->id,
            'location' => $slot->location,
            'starts_at' => $slot->starts_at->toIso8601String(),
            'ends_at' => $slot->ends_at->toIso8601String(),
            'capacity' => $slot->capacity,
            'remaining' => max(0, $slot->capacity - $reserved),
        ];
    }

    public static function appointment(PickupAppointment $appointment, User $viewer): array
    {
        return [
            'id' => $appointment->id,
            'confirmed_at' => $appointment->confirmed_at?->toIso8601String(),
            'can_cancel' => $viewer->can('cancel', $appointment),
            'slot' => self::slot($appointment->pickupSlot),
        ];
    }

    public static function adminDetail(DiplomaRequest $request, User $viewer): array
    {
        return [
            ...self::detail($request, $viewer),
            'documents' => $request->documents
                ->map(fn (DiplomaDocument $d) => self::adminDocument($d, $viewer))
                ->all(),
            'owner' => [
                'id' => $request->owner->id,
                'name' => $request->owner->name,
                'email' => $request->owner->email,
            ],
        ];
    }

    public static function adminAbilities(DiplomaRequest $request, User $viewer): array
    {
        return [
            'validateDossier' => $viewer->can('validateDossier', $request),
            'reject' => $viewer->can('reject', $request),
            'markReadyForPickup' => $viewer->can('markReadyForPickup', $request),
        ];
    }

    private static function adminDocument(DiplomaDocument $document, User $viewer): array
    {
        return [
            ...self::document($document, $viewer),
            'can_validate' => $viewer->can('validate', $document),
            'validated_by_name' => $document->validator?->name,
        ];
    }

    public static function document(DiplomaDocument $document, User $viewer): array
    {
        return [
            'id' => $document->id,
            'type' => $document->type->value,
            'type_label' => $document->type->label(),
            'original_name' => $document->original_name,
            'size' => $document->size,
            'validated_at' => $document->validated_at?->toIso8601String(),
            'can_delete' => $viewer->can('delete', $document),
        ];
    }

    private static function event(DiplomaRequestEvent $event): array
    {
        return [
            'id' => $event->id,
            'from_status' => $event->from_status?->label(),
            'to_status' => $event->to_status->label(),
            'actor_name' => $event->actor?->name,
            'note' => $event->note,
            'occurred_at' => $event->occurred_at->toIso8601String(),
        ];
    }
}
