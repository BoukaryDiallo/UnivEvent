<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Niveau extends Model
{
    use HasFactory;

    protected static function newFactory()
    {
        return \Database\Factories\Module2\NiveauFactory::new();
    }

    protected $fillable = ['nom', 'code', 'ordre'];

    public function emploisDuTemps()
    {
        return $this->hasMany(EmploiDuTemps::class);
    }
}