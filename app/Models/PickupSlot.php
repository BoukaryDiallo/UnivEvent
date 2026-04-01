<?php

namespace App\Models;

use Database\Factories\PickupSlotFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'starts_at',
    'ends_at',
    'capacity',
    'location',
    'created_by',
])]
class PickupSlot extends Model
{
    /** @use HasFactory<PickupSlotFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'capacity' => 'integer',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(PickupAppointment::class);
    }

    public function remainingCapacity(): int
    {
        return max(0, $this->capacity - $this->appointments()->count());
    }
}
