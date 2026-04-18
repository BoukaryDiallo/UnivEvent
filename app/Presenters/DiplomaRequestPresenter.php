<?php

namespace App\Presenters;

use App\Enums\DiplomaRequestStatus;
use App\Models\DiplomaDocument;
use App\Models\DiplomaRequest;
use App\Models\DiplomaRequestEvent;
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
        ];
    }

    public static function abilities(DiplomaRequest $request, User $viewer): array
    {
        return [
            'addDocument' => $viewer->can('addDocument', $request),
            'submit' => $viewer->can('submit', $request),
        ];
    }

    private static function document(DiplomaDocument $document, User $viewer): array
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
