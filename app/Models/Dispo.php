<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Dispo extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'jour',
        'debut',
        'fin',
        'niveau',
        'motif',
        'avant',
        'maj_le',
    ];

    protected function casts(): array
    {
        return [
            'avant' => 'array',
            'maj_le' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function historiques(): HasMany
    {
        return $this->hasMany(HistoriqueDisponibilite::class);
    }
}
