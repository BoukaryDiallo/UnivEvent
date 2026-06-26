<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Creneau extends Model
{
    protected $table = 'creneaux';

    protected $fillable = ['heure_debut', 'heure_fin', 'libelle'];

    protected $casts = [
        'heure_debut' => 'datetime:H:i',
        'heure_fin' => 'datetime:H:i',
    ];

    public function seances()
    {
        return $this->hasMany(Seance::class);
    }
}
