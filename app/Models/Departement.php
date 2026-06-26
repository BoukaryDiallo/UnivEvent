<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Departement extends Model
{
    use SoftDeletes;

    protected $table = 'departements';

    protected $primaryKey = 'id_departement';

    protected $fillable = [
        'id_ufr',
        'nom',
    ];

    public function ufr()
    {
        return $this->belongsTo(Ufr::class, 'id_ufr');
    }

    public function filieres()
    {
        return $this->hasMany(Filiere::class, 'id_departement');
    }
}
