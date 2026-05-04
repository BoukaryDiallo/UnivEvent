<?php

namespace App\Models;

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

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
