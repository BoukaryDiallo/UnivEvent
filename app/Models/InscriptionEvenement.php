<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InscriptionEvenement extends Model
{
    use HasFactory;

    protected $fillable = [
        'evenement_id',
        'utilisateur_id',
        'donnees_formulaire',
        'statut',
        'access_token',
        'checked_in_at',
    ];

    protected $casts = [
        'donnees_formulaire' => 'array',
        'checked_in_at' => 'datetime',
    ];

    public function evenement()
    {
        return $this->belongsTo(Evenement::class);
    }

    public function utilisateur()
    {
        return $this->belongsTo(User::class, 'utilisateur_id');
    }
}
