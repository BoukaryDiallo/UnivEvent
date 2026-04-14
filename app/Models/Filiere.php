<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Filiere extends Model
{
    use SoftDeletes;

    protected $table = 'filieres';
    protected $primaryKey = 'id_filiere';

    protected $fillable = [
        'id_departement',
        'nom'
    ];


    public function departement()
    {
        return $this->belongsTo(Departement::class, 'id_departement');
    }
}