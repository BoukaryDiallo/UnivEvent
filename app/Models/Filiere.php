<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Filiere extends Model
{
    protected $table = 'filieres';
    protected $primaryKey = 'id_filiere';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'nom',
        'id_departement',
    ];

    /*
     * PERMET AU ROUTE MODEL BINDING DE FONCTIONNER
     */
    public function getRouteKeyName()
    {
        return 'id_filiere';
    }

    public function departement()
    {
        return $this->belongsTo(Departement::class, 'id_departement');
    }
}