<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Election extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_election';

    protected $fillable = [
        'titre',
        'description',
        'date_debut',
        'date_fin',
        'statut',
        'id_circonscription',
    ];

    public function circonscription()
    {
        return $this->belongsTo(Circonscription::class, 'id_circonscription');
    }
}
