<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Election extends Model
{
    use HasFactory, SoftDeletes;

    protected $primaryKey = 'id_election';

    protected $fillable = [
        'titre',
        'description',
        'date_debut',
        'date_fin',
        'statut',
        'tour',
        'type',
        'id_ufr',
        'id_filiere',
    ];

    public function ufr()
    {
        return $this->belongsTo(Ufr::class, 'id_ufr');
    }

    public function filiere()
    {
        return $this->belongsTo(Filiere::class, 'id_filiere');
    }

    public function listesElectorales()
    {
        return $this->hasMany(ListeElectorale::class, 'id_election');
    }

    public function candidatures()
    {
        return $this->hasMany(Candidature::class, 'id_election');
    }

    /**
     * 🔄 Synchronise automatiquement le statut avec les dates
     * - 'planifiee' → 'ouverte' si now() >= date_debut
     * - 'ouverte' → 'cloturee' si now() >= date_fin
     */
    public function synchronizeStatus()
    {
        if ($this->statut === 'planifiee' && now() >= $this->date_debut) {
            $this->update(['statut' => 'ouverte']);
            return 'ouverte';
        }

        if ($this->statut === 'second_tour_planifie' && now() >= $this->date_debut) {
            $this->update(['statut' => 'second_tour']);
            return 'second_tour';
        }

        if ($this->statut === 'ouverte' && now() >= $this->date_fin) {
            $this->update(['statut' => 'cloturee']);
            return 'cloturee';
        }

        if ($this->statut === 'second_tour' && now() >= $this->date_fin) {
            $this->update(['statut' => 'cloturee']);
            return 'cloturee';
        }

        return $this->statut;
    }

    public function votes()
    {
        return $this->hasMany(Vote::class, 'id_election');
    }
}

