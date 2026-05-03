<?php

namespace App\Support;

use Illuminate\Support\Collection;

class AcademicYear
{
    private const LOOKBACK = 2;

    /**
     * @return Collection<int, string>
     */
    public static function values(): Collection
    {
        $current = (int) now()->format('Y');

        return collect(range($current - self::LOOKBACK, $current))
            ->map(fn (int $y) => "{$y}-".($y + 1))
            ->values();
    }

    /**
     * @return array<int, array{value: string, label: string}>
     */
    public static function options(): array
    {
        return self::values()
            ->map(fn (string $v) => ['value' => $v, 'label' => $v])
            ->all();
    }
}
