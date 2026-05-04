<?php

namespace App\Enums;

enum DocumentType: string
{
    case NationalId = 'cni';
    case TranscriptOfRecords = 'releve_notes';
    case SuccessAttestation = 'attestation_succes';
    case IdentityPhoto = 'photo_identite';
    case PaymentReceipt = 'recu_paiement';
    case Other = 'autre';

    public function label(): string
    {
        return match ($this) {
            self::NationalId => "Pièce d'identité",
            self::TranscriptOfRecords => 'Relevé de notes',
            self::SuccessAttestation => 'Attestation de succès',
            self::IdentityPhoto => "Photo d'identité",
            self::PaymentReceipt => 'Reçu de paiement',
            self::Other => 'Autre',
        };
    }
}
