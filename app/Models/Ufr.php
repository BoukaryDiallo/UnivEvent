<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Ufr extends Model
{
    use SoftDeletes;

    protected $table = 'ufrs';
    protected $primaryKey = 'id_ufr';

    protected $fillable = [
        'nom'
    ];

    public function departements()
    {
        return $this->hasMany(Departement::class, 'id_ufr');
    }
}