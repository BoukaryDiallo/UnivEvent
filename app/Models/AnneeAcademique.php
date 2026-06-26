<?php

namespace App\Models;

use Database\Factories\Module2\AnneeAcademiqueFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnneeAcademique extends Model
{
    use HasFactory;

    protected static function newFactory()
    {
        return AnneeAcademiqueFactory::new();
    }

    protected $fillable = ['libelle', 'date_debut', 'date_fin', 'est_courante'];

    protected $casts = [
        'est_courante' => 'boolean',
    ];

    public function emploisDuTemps()
    {
        return $this->hasMany(EmploiDuTemps::class);
    }
}
