<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HistoriqueDisponibilite extends Model
{
    public $timestamps = false;

    protected $table = 'historique_disponibilites';

    protected $fillable = [
        'dispo_id',
        'enseignant_id',
        'action',
        'description',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }

    public function dispo(): BelongsTo
    {
        return $this->belongsTo(Dispo::class);
    }

    public function enseignant(): BelongsTo
    {
        return $this->belongsTo(User::class, 'enseignant_id');
    }
}
