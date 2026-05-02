<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class EmploiDuTemps extends Model
{
    use HasFactory;

    protected static function newFactory()
    {
        return \Database\Factories\Module2\EmploiDuTempsFactory::new();
    }

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


    protected static function booted()
    {
        static::saving(function ($edt) {
            if ($edt->date_fin && Carbon::parse($edt->date_fin)->isPast()) {
                $edt->statut = 'Archivé';
            }
        });

        static::updated(function ($edt) {
            if ($edt->wasChanged('statut') && $edt->statut === 'Archivé') {
                
                $seances = $edt->seances()
                    ->whereNotNull('prise_id')
                    ->with('prise')
                    ->get();

                foreach ($seances as $seance) {
                    if ($seance->prise && is_null($seance->prise->libere_at)) {
                        $seance->prise->update([
                            'libere_at' => now()
                        ]);
                    }

                    $seance->update(['prise_id' => null]);
                }
            }
        });
    }
}