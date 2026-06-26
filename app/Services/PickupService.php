<?php

namespace App\Services;

use App\Enums\DiplomaRequestStatus;
use App\Models\DiplomaRequest;
use App\Models\PickupAppointment;
use App\Models\PickupSlot;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PickupService
{
    public function __construct(private readonly DiplomaRequestService $requests) {}

    public function createSlot(User $actor, array $attributes): PickupSlot
    {
        $this->assertNoOverlap($attributes['location'], $attributes['starts_at'], $attributes['ends_at']);

        return PickupSlot::create([
            ...$attributes,
            'created_by' => $actor->id,
        ]);
    }

    public function updateSlot(PickupSlot $slot, array $attributes): PickupSlot
    {
        $this->assertNoOverlap(
            $attributes['location'],
            $attributes['starts_at'],
            $attributes['ends_at'],
            excluding: $slot->id,
        );

        if ($attributes['capacity'] < $slot->appointments()->count()) {
            throw ValidationException::withMessages([
                'capacity' => 'La capacité ne peut pas être inférieure au nombre de RDV déjà réservés.',
            ]);
        }

        $slot->update($attributes);

        return $slot->refresh();
    }

    public function deleteSlot(PickupSlot $slot): void
    {
        if ($slot->appointments()->exists()) {
            throw ValidationException::withMessages([
                'slot' => 'Impossible de supprimer un créneau comportant des RDV.',
            ]);
        }

        $slot->delete();
    }

    public function bookSlot(DiplomaRequest $request, PickupSlot $slot, User $actor): PickupAppointment
    {
        return DB::transaction(function () use ($request, $slot, $actor) {
            $lockedRequest = DiplomaRequest::query()
                ->whereKey($request->id)
                ->lockForUpdate()
                ->first();

            $locked = PickupSlot::query()
                ->whereKey($slot->id)
                ->withCount('appointments')
                ->lockForUpdate()
                ->first();

            if (! $locked) {
                throw ValidationException::withMessages([
                    'slot' => 'Ce créneau n\'existe plus.',
                ]);
            }

            if ($lockedRequest->status !== DiplomaRequestStatus::ReadyForPickup) {
                throw new \DomainException('La demande n\'est pas prête pour une réservation.');
            }

            if ($locked->starts_at->isPast()) {
                throw ValidationException::withMessages([
                    'slot' => 'Ce créneau est déjà passé.',
                ]);
            }

            if ($locked->appointments_count >= $locked->capacity) {
                throw ValidationException::withMessages([
                    'slot' => 'Ce créneau est complet.',
                ]);
            }

            if ($lockedRequest->appointment()->exists()) {
                throw new \DomainException('Un rendez-vous est déjà associé à cette demande.');
            }

            $appointment = $lockedRequest->appointment()->create([
                'pickup_slot_id' => $locked->id,
                'confirmed_at' => now(),
            ]);

            $from = $lockedRequest->status;

            $lockedRequest->forceFill([
                'status' => DiplomaRequestStatus::AppointmentScheduled,
            ])->save();

            $this->requests->recordEvent(
                $lockedRequest,
                $from,
                DiplomaRequestStatus::AppointmentScheduled,
                $actor,
                sprintf(
                    'RDV confirmé pour le %s à %s',
                    $locked->starts_at->format('d/m/Y H:i'),
                    $locked->location,
                ),
            );

            return $appointment;
        });
    }

    public function deliver(
        DiplomaRequest $request,
        User $actor,
        ?UploadedFile $receipt = null,
    ): DiplomaRequest {
        return DB::transaction(function () use ($request, $actor, $receipt) {
            if ($request->status !== DiplomaRequestStatus::AppointmentScheduled) {
                throw new \DomainException('Aucun rendez-vous actif à finaliser.');
            }

            $appointment = $request->appointment;

            if (! $appointment) {
                throw new \DomainException('Aucun rendez-vous associé à la demande.');
            }

            $receiptPath = $receipt
                ? $receipt->storeAs(
                    "diplomas/{$request->id}/receipts",
                    Str::uuid().'.'.$receipt->getClientOriginalExtension(),
                    'local',
                )
                : null;

            $appointment->forceFill([
                'delivered_at' => now(),
                'delivered_by' => $actor->id,
                'receipt_path' => $receiptPath,
            ])->save();

            $from = $request->status;

            $request->forceFill([
                'status' => DiplomaRequestStatus::Delivered,
            ])->save();

            $this->requests->recordEvent(
                $request,
                $from,
                DiplomaRequestStatus::Delivered,
                $actor,
                'Diplôme remis',
            );

            return $request->refresh();
        });
    }

    public function cancelAppointment(PickupAppointment $appointment, User $actor): void
    {
        DB::transaction(function () use ($appointment, $actor) {
            $request = $appointment->diplomaRequest;

            if ($request->status !== DiplomaRequestStatus::AppointmentScheduled) {
                throw new \DomainException('Aucun RDV actif à annuler.');
            }

            $appointment->delete();

            $from = $request->status;

            $request->forceFill([
                'status' => DiplomaRequestStatus::ReadyForPickup,
            ])->save();

            $this->requests->recordEvent(
                $request,
                $from,
                DiplomaRequestStatus::ReadyForPickup,
                $actor,
                'RDV annulé',
            );
        });
    }

    private function assertNoOverlap(
        string $location,
        string $startsAt,
        string $endsAt,
        ?int $excluding = null,
    ): void {
        $overlap = PickupSlot::query()
            ->where('location', $location)
            ->when($excluding, fn ($q) => $q->whereKeyNot($excluding))
            ->where('starts_at', '<', $endsAt)
            ->where('ends_at', '>', $startsAt)
            ->exists();

        if ($overlap) {
            throw ValidationException::withMessages([
                'starts_at' => 'Ce créneau chevauche un autre créneau au même lieu.',
            ]);
        }
    }
}
