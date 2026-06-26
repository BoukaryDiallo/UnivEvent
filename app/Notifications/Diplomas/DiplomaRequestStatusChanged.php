<?php

namespace App\Notifications\Diplomas;

use App\Enums\DiplomaRequestStatus;
use App\Models\DiplomaRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DiplomaRequestStatusChanged extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly DiplomaRequest $request,
        public readonly DiplomaRequestStatus $newStatus,
    ) {
        $this->afterCommit();
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $message = (new MailMessage)
            ->subject($this->subject())
            ->greeting('Bonjour '.$this->request->owner->name.',');

        return match ($this->newStatus) {
            DiplomaRequestStatus::Submitted => $message
                ->line('Votre demande de retrait '.$this->request->tracking_code.' a bien été soumise.')
                ->line('La scolarité va l\'instruire et vous tiendra informé.'),

            DiplomaRequestStatus::DocumentsValidated => $message
                ->line('Toutes les pièces de votre dossier '.$this->request->tracking_code.' ont été validées.'),

            DiplomaRequestStatus::ReadyForPickup => $message
                ->line('Votre diplôme est prêt à être retiré.')
                ->line('Connectez-vous pour réserver un créneau.'),

            DiplomaRequestStatus::AppointmentScheduled => $message
                ->line($this->appointmentLine()),

            DiplomaRequestStatus::Delivered => $message
                ->line('Votre diplôme vous a été remis. Bonne continuation !'),

            DiplomaRequestStatus::Rejected => $message
                ->error()
                ->line('Votre demande '.$this->request->tracking_code.' a été rejetée.')
                ->line('Motif : '.($this->request->rejected_reason ?: 'Non précisé.')),

            default => $message->line('Le statut de votre demande a évolué.'),
        };
    }

    public function toArray(object $notifiable): array
    {
        return [
            'request_id' => $this->request->id,
            'tracking_code' => $this->request->tracking_code,
            'status' => $this->newStatus->value,
            'status_label' => $this->newStatus->label(),
            'title' => $this->subject(),
        ];
    }

    private function subject(): string
    {
        $code = $this->request->tracking_code;

        return match ($this->newStatus) {
            DiplomaRequestStatus::Submitted => "Demande {$code} soumise",
            DiplomaRequestStatus::DocumentsValidated => "Pièces validées — {$code}",
            DiplomaRequestStatus::ReadyForPickup => "Diplôme prêt à retirer — {$code}",
            DiplomaRequestStatus::AppointmentScheduled => "Rendez-vous confirmé — {$code}",
            DiplomaRequestStatus::Delivered => "Diplôme remis — {$code}",
            DiplomaRequestStatus::Rejected => "Demande rejetée — {$code}",
            default => "Mise à jour de votre demande {$code}",
        };
    }

    private function appointmentLine(): string
    {
        $appointment = $this->request->appointment;

        if (! $appointment) {
            return 'Votre rendez-vous a été enregistré.';
        }

        $slot = $appointment->pickupSlot;

        return sprintf(
            'Rendez-vous confirmé le %s à %s.',
            $slot->starts_at->format('d/m/Y à H\hi'),
            $slot->location,
        );
    }
}
