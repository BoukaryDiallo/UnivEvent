<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JuryMembre extends Model
{
    protected $fillable = ['jury_id', 'user_id', 'role'];

    public function jury()
    {
        return $this->belongsTo(Jury::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
