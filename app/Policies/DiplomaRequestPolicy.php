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
}
