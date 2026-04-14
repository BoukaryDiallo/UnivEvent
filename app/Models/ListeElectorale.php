<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ListeElectorale extends Model
{
    protected $table = 'liste_electorales';

    protected $fillable = [
        'id_election',
        'id_etudiant',
    ];

    public function etudiant()
    {
        return $this->belongsTo(Etudiant::class, 'id_etudiant');
    }

    public function election()
    {
        return $this->belongsTo(Election::class, 'id_election');
    }
}