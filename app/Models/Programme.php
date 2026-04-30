<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Programme extends Model
{
    use HasFactory;

    protected $fillable = [
        'evenement_id',
        'titre',
        'description',
        'intervenant',
        'date_programme',
        'heure_debut',
        'heure_fin',
        'salle',
        'type_section',
        'ordre'
    ];
    
    protected $casts = [
        'date_programme' => 'date',
    ];
    public function evenement()
    {
        return $this->belongsTo(Evenement::class);
    }
}
