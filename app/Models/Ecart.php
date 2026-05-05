<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Ecart extends Model
{
    protected $fillable = [
        'user_id',
        'date',
        'date_fin',
        'debut',
        'fin',
        'niveau',
        'motif',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'date_fin' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
