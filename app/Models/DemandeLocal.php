<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DemandeLocal extends Model
{
    protected $table = 'demandes_local';

    protected $fillable = [
        'club_id',
        'salle_souhaitee',
        'date',
        'statut',
        'commentaire',
    ];

    protected $casts = [
        'date' => 'datetime',
    ];

    public function club()
    {
        return $this->belongsTo(Club::class);
    }
}
