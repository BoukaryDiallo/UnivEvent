<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Notifications\DatabaseNotification;

class NotificationPolicy
{
    public function read(User $user, DatabaseNotification $notification): bool
    {
        return $notification->notifiable_id === $user->id
            && $notification->notifiable_type === $user->getMorphClass();
    }
}
