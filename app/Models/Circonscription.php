<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Circonscription extends Model
{
    use HasFactory, SoftDeletes;

    protected $primaryKey = 'id_circonscription';

    protected $fillable = [
        'departement',
        'filiere',
        'niveau',
    ];

    public function elections()
    {
        return $this->hasMany(Election::class, 'id_circonscription');
    }
}
