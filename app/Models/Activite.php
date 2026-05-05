<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Activite extends Model
{
    protected $fillable = [
        'titre',
        'description',
        'date_debut',
        'date_fin',
        'statut',
        'club_id',
        'created_by',
    ];

    protected $casts = [
        'date_debut' => 'datetime',
        'date_fin' => 'datetime',
    ];

    public function club()
    {
        return $this->belongsTo(Club::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
