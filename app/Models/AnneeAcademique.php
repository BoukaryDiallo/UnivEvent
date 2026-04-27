<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AnneeAcademique extends Model
{
    protected $fillable = ['libelle', 'date_debut', 'date_fin', 'est_courante'];

    protected $casts = [
        'date_debut' => 'date',
        'date_fin' => 'date',
        'est_courante' => 'boolean',
    ];

    public function emploisDuTemps()
    {
        return $this->hasMany(EmploiDuTemps::class);
    }
}