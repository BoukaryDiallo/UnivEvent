<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class EmploiDuTemps extends Model
{
    protected $table = 'emploi_du_temps';

    protected $fillable = [
        'titre', 'semestre', 'groupe', 'statut', 'date_debut', 'date_fin',
        'annee_academique_id', 'filiere_id', 'niveau_id', 'user_id'
    ];

    protected $casts = [
        'date_debut' => 'date',
        'date_fin' => 'date',
    ];

    public function anneeAcademique()
    {
        return $this->belongsTo(AnneeAcademique::class);
    }

    public function filiere()
    {
        return $this->belongsTo(Filiere::class, 'filiere_id', 'id_filiere');
    }

    public function niveau()
    {
        return $this->belongsTo(Niveau::class);
    }

    public function createur()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function seances()
    {
        return $this->hasMany(Seance::class);
    }

    public function exports()
    {
        return $this->hasMany(ExportPdf::class);
    }

    // protected static function booted()
    // {
    //     static::saving(function ($edt) {
    //         if ($edt->date_fin && Carbon::parse($edt->date_fin)->isPast()) {
    //             $edt->statut = 'Archivé';
    //         }
    //     });
    // }


    protected static function booted()
    {
        static::saving(function ($edt) {
            if ($edt->date_fin && Carbon::parse($edt->date_fin)->isPast()) {
                $edt->statut = 'Archivé';
            }
        });

        static::updated(function ($edt) {
            // Si le statut vient de passer à Archivé
            if ($edt->wasChanged('statut') && $edt->statut === 'Archivé') {
                
                // Récupérer toutes les séances avec une prise active
                $seances = $edt->seances()
                    ->whereNotNull('prise_id')
                    ->with('prise')
                    ->get();

                foreach ($seances as $seance) {
                    // Libérer la prise → renseigner libere_at
                    if ($seance->prise && is_null($seance->prise->libere_at)) {
                        $seance->prise->update([
                            'libere_at' => now()
                        ]);
                    }

                    // Mettre prise_id à null dans la séance
                    $seance->update(['prise_id' => null]);
                }
            }
        });
    }
}