<?php

namespace App\Models;

use App\Enums\DocumentType;
use Database\Factories\DiplomaDocumentFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'diploma_request_id',
    'type',
    'path',
    'original_name',
    'mime',
    'size',
    'validated_at',
    'validated_by',
])]
class DiplomaDocument extends Model
{
    /** @use HasFactory<DiplomaDocumentFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'type' => DocumentType::class,
            'validated_at' => 'datetime',
            'size' => 'integer',
        ];
    }

    public function diplomaRequest(): BelongsTo
    {
        return $this->belongsTo(DiplomaRequest::class);
    }

    public function validator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'validated_by');
    }
}
