<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ClubCreationFailedNotification extends Notification
{
    use Queueable;

    public $studentName;

    /**
     * Create a new notification instance.
     */
    public function __construct($studentName)
    {
        $this->studentName = $studentName;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'message' => 'Création de club échouée: l\'étudiant ' . $this->studentName . ' n\'est pas inscrit/actif.',
            'type' => 'error',
        ];
    }
}
