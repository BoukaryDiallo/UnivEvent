<?php

namespace App\Concerns;

trait MapsParticipationStatus
{
    /**
     * Map backend participation status to frontend-friendly labels
     */
    protected function mapParticipationStatus(?string $status): string
    {
        return match ($status) {
            'accepte' => 'participe',
            'en_attente' => 'interesse',
            default => 'refuse',
        };
    }
}