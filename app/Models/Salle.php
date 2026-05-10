<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Salle extends Model
{
<<<<<<< HEAD
    protected $fillable = ['nom', 'capacite', 'batiment', 'disponible'];

    public function soutenances()
    {
        return $this->hasMany(Soutenance::class);
=======
    protected $fillable = ['nom'];

    public function seances()
    {
        return $this->hasMany(Seance::class);
>>>>>>> main
    }
}