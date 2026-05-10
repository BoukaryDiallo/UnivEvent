<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Prise extends Model
{
    protected $fillable = [
        'user_id',
        'date',
        'debut',
        'fin',
        'source',
        'ref',
        'motif',
        'niveau',
        'libere_at',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'libere_at' => 'datetime',
        ];
    }

    protected function niveau(): Attribute
    {
        return Attribute::make(
            get: fn (?string $value) => $value === 'acceptable' ? 'prefere' : $value,
            set: fn (?string $value) => $value === 'acceptable' ? 'prefere' : $value,
        );
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
