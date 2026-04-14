<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Candidature extends Model
{
    use HasFactory, SoftDeletes;

    protected $primaryKey = 'id_candidature';

    protected $fillable = [
        'programme',
        'photo',
        'cnib_pdf',
        'casier_judiciaire_pdf',
        'attestation_inscription_pdf',
        'statut',   
        'resultat',
        'id_user',
        'id_election',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'id_user');
    }

    public function election()
    {
        return $this->belongsTo(Election::class, 'id_election');
    }
}