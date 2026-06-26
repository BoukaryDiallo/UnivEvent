<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EvenementMedia extends Model
{
    protected $table = 'evenement_medias';

    protected $fillable = [
        'evenement_id',
        'type',
        'chemin_fichier',
        'nom_original',
        'taille',
        'description',
        'is_public',
        'download_allowed',
        'confidentialite',
        'meta',
    ];

    protected $casts = [
        'is_public' => 'boolean',
        'download_allowed' => 'boolean',
        'meta' => 'array',
    ];

    public function evenement()
    {
        return $this->belongsTo(Evenement::class);
    }
}
