<?php

namespace App\Services;

use App\Enums\DiplomaRequestStatus;
use App\Models\DiplomaRequest;
use App\Models\DiplomaRequestEvent;
use App\Models\PickupAppointment;
use App\Models\User;
use App\Presenters\DiplomaRequestPresenter;

class DiplomaStudentDashboardService
{
    public function snapshot(User $student): array
    {
        $activeRequest = $this->activeRequest($student);
        $archivedCount = DiplomaRequest::query()
            ->where('owner_id', $student->id)
            ->where('status', DiplomaRequestStatus::Archived)
            ->count();

        $upcomingAppointment = $this->upcomingAppointment($student);

        return [
            'active_request' => $activeRequest
                ? [
                    ...DiplomaRequestPresenter::row($activeRequest),
                    'rejected_reason' => $activeRequest->status === DiplomaRequestStatus::Rejected
                        ? $activeRequest->rejected_reason
                        : null,
                ]
                : null,
            'upcoming_appointment' => $upcomingAppointment
                ? DiplomaRequestPresenter::appointment($upcomingAppointment, $student)
                : null,
            'archived_count' => $archivedCount,
            'recent_events' => $this->recentEvents($student),
        ];
    }

    private function activeRequest(User $student): ?DiplomaRequest
    {
        return DiplomaRequest::query()
            ->where('owner_id', $student->id)
            ->whereNot('status', DiplomaRequestStatus::Archived)
            ->orderByRaw("CASE WHEN status = 'rejected' THEN 1 ELSE 0 END")
            ->latest('updated_at')
            ->first();
    }

    private function upcomingAppointment(User $student)
    {
        return PickupAppointment::query()
            ->whereHas('diplomaRequest', fn ($q) => $q->where('owner_id', $student->id))
            ->whereHas('pickupSlot', fn ($q) => $q->where('starts_at', '>', now()))
            ->whereNull('delivered_at')
            ->with(['pickupSlot', 'diplomaRequest'])
            ->latest('confirmed_at')
            ->first();
    }

    private function recentEvents(User $student, int $limit = 5): array
    {
        return DiplomaRequestEvent::query()
            ->whereHas('diplomaRequest', fn ($q) => $q->where('owner_id', $student->id))
            ->with('diplomaRequest:id,tracking_code')
            ->latest('occurred_at')
            ->limit($limit)
            ->get()
            ->map(fn (DiplomaRequestEvent $e) => [
                'id' => $e->id,
                'to' => $e->to_status->label(),
                'tracking_code' => $e->diplomaRequest->tracking_code,
                'note' => $e->note,
                'occurred_at' => $e->occurred_at->toIso8601String(),
            ])
            ->all();
    }
}
