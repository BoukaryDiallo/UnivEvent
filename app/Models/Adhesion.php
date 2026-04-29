<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Adhesion extends Model
{
    protected $fillable = [
        'user_id',
        'club_id',
        'date_adhesion',
        'statut',
        'role_dans_club',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function club()
    {
        return $this->belongsTo(Club::class);
    }
}
