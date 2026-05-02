<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Filiere extends Model
{
    use SoftDeletes;
    use HasFactory;

    protected static function newFactory()
    {
        return \Database\Factories\Module2\FiliereFactory::new();
    }

    protected $primaryKey = 'id_filiere';

    protected $fillable = ['id_departement', 'nom', 'code'];

    public function departement()
    {
        return $this->belongsTo(Departement::class, 'id_departement', 'id_departement');
    }

    public function emploisDuTemps()
    {
        return $this->hasMany(EmploiDuTemps::class, 'filiere_id', 'id_filiere');
    }
}