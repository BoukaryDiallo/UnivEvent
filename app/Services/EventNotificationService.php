<?php

namespace App\Services;

use App\Events\UserNotificationCreated;
use App\Models\EventNotification;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class EventNotificationService
{
    public function notify(User $user, string $type, string $title, string $message, ?int $eventId = null, array $data = [], bool $email = false): EventNotification
    {
        $notification = EventNotification::create([
            'user_id' => $user->id,
            'evenement_id' => $eventId,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'data' => $data,
        ]);

        if ($email && filled($user->email)) {
            try {
                Mail::raw($title."\n\n".$message, function ($mail) use ($user, $title) {
                    $mail->to($user->email)->subject($title);
                });

                $notification->update(['emailed_at' => now()]);
            } catch (\Throwable) {
                // Keep in-app notification even if email transport is unavailable.
            }
        }

        try {
            UserNotificationCreated::dispatch($notification);
        } catch (\Throwable $exception) {
            Log::warning('Event notification broadcast failed.', [
                'notification_id' => $notification->id,
                'user_id' => $user->id,
                'type' => $type,
                'error' => $exception->getMessage(),
            ]);
        }

        return $notification;
    }

    /**
     * @param iterable<User> $users
     */
    public function notifyMany(iterable $users, string $type, string $title, string $message, ?int $eventId = null, array $data = [], bool $email = false): void
    {
        collect($users)
            ->filter(fn ($user) => $user instanceof User)
            ->unique('id')
            ->each(fn (User $user) => $this->notify($user, $type, $title, $message, $eventId, $data, $email));
    }
}
