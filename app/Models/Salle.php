<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Salle extends Model
{
    protected $fillable = ['nom', 'capacite', 'batiment', 'disponible'];

    public function soutenances()
    {
        return $this->hasMany(Soutenance::class);
    }

    public function seances()
    {
        return $this->hasMany(Seance::class);
    }
}
