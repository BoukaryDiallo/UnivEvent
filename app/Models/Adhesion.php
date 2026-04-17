<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Adhesion extends Model
{
    protected $fillable = [
        'etudiant_id',
        'club_id',
        'date_adhesion',
        'statut',
    ];

    public function etudiant()
    {
        return $this->belongsTo(User::class, 'etudiant_id');
    }

    public function club()
    {
        return $this->belongsTo(Club::class);
    }
}
