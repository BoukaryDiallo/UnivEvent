<?php

namespace App\Policies;

use App\Models\PickupSlot;
use App\Models\User;

class PickupSlotPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isScolarite();
    }

    public function manage(User $user): bool
    {
        return $user->isScolarite();
    }

    public function update(User $user, PickupSlot $slot): bool
    {
        return $user->isScolarite();
    }

    public function delete(User $user, PickupSlot $slot): bool
    {
        return $user->isScolarite();
    }
}
