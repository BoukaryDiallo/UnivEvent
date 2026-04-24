<?php

namespace App\Services;

use App\Enums\DiplomaRequestStatus;
use App\Models\DiplomaRequest;
use App\Models\DiplomaRequestEvent;
use App\Models\PickupSlot;
use Illuminate\Support\Facades\DB;

class DiplomaAdminDashboardService
{
    public function snapshot(): array
    {
        return [
            'counts' => $this->statusCounts(),
            'active_queue' => $this->activeQueueCount(),
            'submitted_this_month' => $this->submittedThisMonth(),
            'avg_instruction_days' => $this->averageInstructionDays(),
            'avg_delivery_days' => $this->averageDeliveryDays(),
            'upcoming_slots' => $this->upcomingSlotsUtilization(),
            'recent_events' => $this->recentEvents(),
        ];
    }

    /**
     * @return array<int, array{value: string, label: string, count: int}>
     */
    private function statusCounts(): array
    {
        $counts = DiplomaRequest::query()
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status')
            ->all();

        return collect(DiplomaRequestStatus::cases())
            ->map(fn (DiplomaRequestStatus $s) => [
                'value' => $s->value,
                'label' => $s->label(),
                'count' => (int) ($counts[$s->value] ?? 0),
            ])
            ->all();
    }

    private function activeQueueCount(): int
    {
        return DiplomaRequest::query()
            ->whereIn('status', [
                DiplomaRequestStatus::Submitted,
                DiplomaRequestStatus::DocumentsValidated,
                DiplomaRequestStatus::ReadyForPickup,
                DiplomaRequestStatus::AppointmentScheduled,
            ])
            ->count();
    }

    private function submittedThisMonth(): int
    {
        return DiplomaRequest::query()
            ->whereNotNull('submitted_at')
            ->where('submitted_at', '>=', now()->startOfMonth())
            ->count();
    }

    private function averageInstructionDays(): ?float
    {
        $rows = DiplomaRequestEvent::query()
            ->where('to_status', DiplomaRequestStatus::DocumentsValidated)
            ->join('diploma_requests', 'diploma_requests.id', '=', 'diploma_request_events.diploma_request_id')
            ->whereNotNull('diploma_requests.submitted_at')
            ->select([
                'diploma_request_events.occurred_at as validated_at',
                'diploma_requests.submitted_at as submitted_at',
            ])
            ->get();

        return $this->averageDaysBetween($rows, 'submitted_at', 'validated_at');
    }

    private function averageDeliveryDays(): ?float
    {
        $rows = DiplomaRequestEvent::query()
            ->where('to_status', DiplomaRequestStatus::Delivered)
            ->join('diploma_requests', 'diploma_requests.id', '=', 'diploma_request_events.diploma_request_id')
            ->whereNotNull('diploma_requests.submitted_at')
            ->select([
                'diploma_request_events.occurred_at as delivered_at',
                'diploma_requests.submitted_at as submitted_at',
            ])
            ->get();

        return $this->averageDaysBetween($rows, 'submitted_at', 'delivered_at');
    }

    /**
     * @return array{capacity: int, reserved: int, utilization: float}
     */
    private function upcomingSlotsUtilization(): array
    {
        $slots = PickupSlot::query()
            ->withCount('appointments')
            ->where('starts_at', '>', now())
            ->get();

        $capacity = (int) $slots->sum('capacity');
        $reserved = (int) $slots->sum('appointments_count');

        return [
            'capacity' => $capacity,
            'reserved' => $reserved,
            'utilization' => $capacity > 0 ? round(($reserved / $capacity) * 100, 1) : 0.0,
        ];
    }

    /**
     * @return array<int, array{from: ?string, to: string, request: array, actor: ?string, occurred_at: string, note: ?string}>
     */
    private function recentEvents(int $limit = 10): array
    {
        return DiplomaRequestEvent::query()
            ->with(['diplomaRequest:id,tracking_code,owner_id', 'diplomaRequest.owner:id,name', 'actor:id,name'])
            ->latest('occurred_at')
            ->limit($limit)
            ->get()
            ->map(fn (DiplomaRequestEvent $e) => [
                'id' => $e->id,
                'from' => $e->from_status?->label(),
                'to' => $e->to_status->label(),
                'request' => [
                    'id' => $e->diplomaRequest->id,
                    'tracking_code' => $e->diplomaRequest->tracking_code,
                    'owner_name' => $e->diplomaRequest->owner?->name,
                ],
                'actor' => $e->actor?->name,
                'note' => $e->note,
                'occurred_at' => $e->occurred_at->toIso8601String(),
            ])
            ->all();
    }

    private function averageDaysBetween($rows, string $startField, string $endField): ?float
    {
        if ($rows->isEmpty()) {
            return null;
        }

        $totalSeconds = $rows->sum(function ($row) use ($startField, $endField) {
            return now()->parse($row->{$endField})->diffInSeconds(now()->parse($row->{$startField}), absolute: true);
        });

        $avgSeconds = $totalSeconds / $rows->count();

        return round($avgSeconds / 86400, 1);
    }
}
