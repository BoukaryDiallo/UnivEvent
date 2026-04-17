<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Club extends Model
{
    protected $fillable = [
        'nom',
        'type',
        'statut',
        'description',
        'president_id',
    ];

    public function president()
    {
        return $this->belongsTo(User::class, 'president_id');
    }

    public function adhesions()
    {
        return $this->hasMany(Adhesion::class);
    }

    public function membres()
    {
        return $this->belongsToMany(User::class, 'adhesions')
                    ->wherePivot('statut', 'approuvee')
                    ->withPivot('role_dans_club', 'statut');
    }

    public function activites()
    {
        return $this->hasMany(Activite::class);
    }

    public function demandesLocal()
    {
        return $this->hasMany(DemandeLocal::class);
    }

    public function demandesBudget()
    {
        return $this->hasMany(DemandeBudget::class);
    }
}
