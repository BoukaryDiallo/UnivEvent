<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DemandeBudget extends Model
{
    protected $table = 'demandes_budget';

    protected $fillable = [
        'club_id',
        'montant_demande',
        'justificatif',
        'statut',
        'commentaire',
    ];

    protected $casts = [
        'montant_demande' => 'decimal:2',
    ];

    public function club()
    {
        return $this->belongsTo(Club::class);
    }
}
