<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Etudiant extends Model
{
    use HasFactory;

    protected $fillable = [
        'id_user',
        'INE',
        'filiere',
        'niveau',
        'date_naissance',
        'statut',
        'photo',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'id_user');
    }

    public function listesElectorales()
{
    return $this->hasMany(ListeElectorale::class, 'id_etudiant');
}
}
