<?php

namespace App\Notifications\Diplomas;

use App\Models\PickupAppointment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PickupReminder extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly PickupAppointment $appointment)
    {
        $this->afterCommit();
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $slot = $this->appointment->pickupSlot;
        $request = $this->appointment->diplomaRequest;

        return (new MailMessage())
            ->subject('Rappel — retrait de diplôme demain')
            ->greeting('Bonjour '.$request->owner->name.',')
            ->line(sprintf(
                'Petit rappel : votre rendez-vous de retrait du diplôme %s est prévu demain.',
                $request->tracking_code,
            ))
            ->line(sprintf(
                'Date : %s à %s.',
                $slot->starts_at->translatedFormat('l d F Y \à H\hi'),
                $slot->location,
            ))
            ->line('Pensez à vous munir d\'une pièce d\'identité.');
    }

    public function toArray(object $notifiable): array
    {
        $slot = $this->appointment->pickupSlot;

        return [
            'request_id' => $this->appointment->diploma_request_id,
            'tracking_code' => $this->appointment->diplomaRequest->tracking_code,
            'title' => 'Rappel : retrait de diplôme demain',
            'status' => 'reminder',
            'status_label' => 'Rappel RDV',
            'starts_at' => $slot->starts_at->toIso8601String(),
            'location' => $slot->location,
        ];
    }
}
