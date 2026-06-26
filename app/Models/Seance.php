<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Seance extends Model
{
    protected $fillable = [
        'jour_semaine', 'type_seance', 'description',
        'emploi_du_temps_id', 'creneau_id', 'salle_id',
        'matiere_id', 'enseignant_id', 'prise_id',
    ];

    public function emploiDuTemps()
    {
        return $this->belongsTo(EmploiDuTemps::class);
    }

    public function creneau()
    {
        return $this->belongsTo(Creneau::class);
    }

    public function salle()
    {
        return $this->belongsTo(Salle::class);
    }

    public function matiere()
    {
        return $this->belongsTo(Matiere::class);
    }

    public function enseignant()
    {
        return $this->belongsTo(Enseignant::class);
    }

    public function prise()
    {
        return $this->belongsTo(Prise::class);
    }
}
