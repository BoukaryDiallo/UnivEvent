<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'diploma_request_id',
    'pickup_slot_id',
    'confirmed_at',
    'delivered_at',
    'delivered_by',
    'receipt_path',
])]
class PickupAppointment extends Model
{
    protected function casts(): array
    {
        return [
            'confirmed_at' => 'datetime',
            'delivered_at' => 'datetime',
        ];
    }

    public function diplomaRequest(): BelongsTo
    {
        return $this->belongsTo(DiplomaRequest::class);
    }

    public function pickupSlot(): BelongsTo
    {
        return $this->belongsTo(PickupSlot::class);
    }

    public function deliveredBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'delivered_by');
    }
}
