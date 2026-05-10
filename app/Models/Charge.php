<?php

namespace App\Models;

use App\Metiers\DispoMetier;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Charge extends Model
{
    protected $fillable = [
        'user_id',
        'semestre',
        'annee_academique',
        'max_jour',
        'max_semaine',
    ];

    protected $casts = [
        'max_jour' => 'integer',
        'max_semaine' => 'integer',
    ];

    protected function semestre(): Attribute
    {
        return Attribute::make(
            get: fn (?string $value) => app(DispoMetier::class)->deserializeSemestresCharge($value),
            set: fn (null|string|array $value) => app(DispoMetier::class)->serializeSemestresCharge(
                app(DispoMetier::class)->deserializeSemestresCharge($value)
            ),
        );
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
