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
        'taille'
    ];

    public function evenement()
    {
        return $this->belongsTo(Evenement::class);
    }
}
