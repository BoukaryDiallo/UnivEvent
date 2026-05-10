<?php

namespace App\Contrats;

use App\Models\Prise;

interface DispoContrat
{
    /**
     * @return array{ok: bool, niveau: string, motif: ?string}
     */
    public function etat(int $userId, string $date, string $debut, string $fin): array;

    public function prendre(
        int $userId,
        string $date,
        string $debut,
        string $fin,
        string $source,
        ?string $ref = null,
        ?string $motif = null,
    ): Prise;

    public function liberer(Prise $prise): Prise;
}
