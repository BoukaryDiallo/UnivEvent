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
        'is_waitlist',
        'waitlist_position',
    ];

    protected $casts = [
        'donnees_formulaire' => 'array',
        'checked_in_at' => 'datetime',
        'is_waitlist' => 'boolean',
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
