<?php

namespace App\Enums;

enum DiplomaRequestStatus: string
{
    case Draft = 'draft';
    case Submitted = 'submitted';
    case DocumentsValidated = 'documents_validated';
    case ReadyForPickup = 'ready_for_pickup';
    case AppointmentScheduled = 'appointment_scheduled';
    case Delivered = 'delivered';
    case Archived = 'archived';
    case Rejected = 'rejected';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Brouillon',
            self::Submitted => 'Déposé',
            self::DocumentsValidated => 'Pièces validées',
            self::ReadyForPickup => 'Prêt à retirer',
            self::AppointmentScheduled => 'Rendez-vous programmé',
            self::Delivered => 'Remis',
            self::Archived => 'Archivé',
            self::Rejected => 'Rejeté',
        };
    }

    public function isTerminal(): bool
    {
        return in_array($this, [self::Delivered, self::Archived, self::Rejected], true);
    }
}
