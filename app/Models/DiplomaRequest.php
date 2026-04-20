<?php

namespace App\Models;

use App\Enums\DiplomaRequestStatus;
use Database\Factories\DiplomaRequestFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'owner_id',
    'tracking_code',
    'diploma_type',
    'academic_year',
    'status',
    'submitted_at',
    'rejected_reason',
    'archived_at',
])]
class DiplomaRequest extends Model
{
    /** @use HasFactory<DiplomaRequestFactory> */
    use HasFactory, SoftDeletes;

    protected function casts(): array
    {
        return [
            'status' => DiplomaRequestStatus::class,
            'submitted_at' => 'datetime',
            'archived_at' => 'datetime',
        ];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(DiplomaDocument::class);
    }

    public function events(): HasMany
    {
        return $this->hasMany(DiplomaRequestEvent::class);
    }

    public function appointment(): HasOne
    {
        return $this->hasOne(PickupAppointment::class);
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(PickupAppointment::class);
    }
}
