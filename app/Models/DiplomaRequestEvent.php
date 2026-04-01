<?php

namespace App\Models;

use App\Enums\DiplomaRequestStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'diploma_request_id',
    'from_status',
    'to_status',
    'actor_id',
    'note',
    'occurred_at',
])]
class DiplomaRequestEvent extends Model
{
    protected function casts(): array
    {
        return [
            'from_status' => DiplomaRequestStatus::class,
            'to_status' => DiplomaRequestStatus::class,
            'occurred_at' => 'datetime',
        ];
    }

    public function diplomaRequest(): BelongsTo
    {
        return $this->belongsTo(DiplomaRequest::class);
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }
}
