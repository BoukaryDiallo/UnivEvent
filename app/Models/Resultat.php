<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Resultat extends Model
{
    use SoftDeletes;

    protected $table = 'resultats';

    protected $primaryKey = 'id_resultat';

    protected $fillable = [
        'id_election',
        'id_candidature',
        'tour',
        'nb_voix',
        'pourcentage',
        'rang',
        'statut_publication',
    ];

    public function election()
    {
        return $this->belongsTo(
            Election::class,
            'id_election',
            'id_election'
        );
    }

    public function candidature()
    {
        return $this->belongsTo(
            Candidature::class,
            'id_candidature',
            'id_candidature'
        );
    }
}
