<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Matiere extends Model
{
    protected $fillable = [
        'code', 'intitule', 'volume_horaire_cm',
        'volume_horaire_td', 'volume_horaire_tp'
    ];

    public function seances()
    {
        return $this->hasMany(Seance::class);
    }
}