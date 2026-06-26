<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Jury extends Model
{
    protected $table = 'jurys';

    protected $fillable = ['nom', 'soutenance_id', 'president_id'];

    public function soutenance()
    {
        return $this->belongsTo(Soutenance::class);
    }

    public function president()
    {
        return $this->belongsTo(User::class, 'president_id');
    }

    public function membres()
    {
        return $this->hasMany(JuryMembre::class);
    }
}
