<?php

namespace App\Services;

use App\Events\UserNotificationCreated;
use App\Models\EventNotification;
use App\Models\User;
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

        UserNotificationCreated::dispatch($notification);

        return $notification;
    }
}
