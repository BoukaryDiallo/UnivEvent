<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Soutenance extends Model
{
    protected $fillable = [
        'titre', 'description', 'date_soutenance',
        'heure_debut', 'heure_fin', 'salle_id', 'etudiant_id', 'statut',
    ];

    public function salle()
    {
        return $this->belongsTo(Salle::class);
    }

    public function etudiant()
    {
        return $this->belongsTo(User::class, 'etudiant_id');
    }

    public function jury()
    {
        return $this->hasOne(Jury::class);
    }

    public function notifications()
    {
        return $this->hasMany(NotificationSoutenance::class);
    }
}
