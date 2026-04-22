<?php

namespace App\Policies;

use App\Enums\DiplomaRequestStatus;
use App\Models\DiplomaRequest;
use App\Models\User;

class DiplomaRequestPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, DiplomaRequest $request): bool
    {
        return $user->id === $request->owner_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, DiplomaRequest $request): bool
    {
        return $user->id === $request->owner_id
            && $request->status === DiplomaRequestStatus::Draft;
    }

    public function delete(User $user, DiplomaRequest $request): bool
    {
        return $user->id === $request->owner_id
            && $request->status === DiplomaRequestStatus::Draft;
    }

    public function submit(User $user, DiplomaRequest $request): bool
    {
        return $user->id === $request->owner_id
            && $request->status === DiplomaRequestStatus::Draft;
    }

    public function addDocument(User $user, DiplomaRequest $request): bool
    {
        return $user->id === $request->owner_id
            && $request->status === DiplomaRequestStatus::Draft;
    }

    public function instruct(User $user, DiplomaRequest $request): bool
    {
        return $user->isScolarite()
            && $request->status !== DiplomaRequestStatus::Draft;
    }

    public function validateDossier(User $user, DiplomaRequest $request): bool
    {
        return $user->isScolarite()
            && $request->status === DiplomaRequestStatus::Submitted;
    }

    public function reject(User $user, DiplomaRequest $request): bool
    {
        return $user->isScolarite()
            && in_array($request->status, [
                DiplomaRequestStatus::Submitted,
                DiplomaRequestStatus::DocumentsValidated,
            ], true);
    }

    public function markReadyForPickup(User $user, DiplomaRequest $request): bool
    {
        return $user->isScolarite()
            && $request->status === DiplomaRequestStatus::DocumentsValidated;
    }

    public function book(User $user, DiplomaRequest $request): bool
    {
        return $user->id === $request->owner_id
            && $request->status === DiplomaRequestStatus::ReadyForPickup;
    }

    public function deliver(User $user, DiplomaRequest $request): bool
    {
        return $user->isScolarite()
            && $request->status === DiplomaRequestStatus::AppointmentScheduled;
    }

    public function archive(User $user, DiplomaRequest $request): bool
    {
        return $user->isScolarite()
            && $request->status === DiplomaRequestStatus::Delivered;
    }
}
