<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EvenementReaction extends Model
{
    protected $fillable = [
        'evenement_id',
        'user_id',
        'type',
    ];

    public function evenement()
    {
        return $this->belongsTo(Evenement::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
