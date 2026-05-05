<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Casts\Attribute;

class Etudiant extends Model
{
    use HasFactory;

    protected const NIVEAUX = [
        'Licence1' => 'Licence 1',
        'Licence2' => 'Licence 2',
        'Licence3' => 'Licence 3',
        'Master1' => 'Master 1',
        'Master2' => 'Master 2',
        'Doctorat1' => 'Doctorat 1',
        'Doctorat2' => 'Doctorat 2',
        'Doctorat3' => 'Doctorat 3',
    ];

    public static function getNiveaux(): array
    {
        return self::NIVEAUX;
    }

    protected function niveau(): Attribute
    {
        return Attribute::make(
            get: fn (string $value) => self::NIVEAUX[$value] ?? $value,
        );
    }

    protected $fillable = [
        'id_user',
        'INE',
        'id_ufr',
        'id_departement',
        'id_filiere',
        'niveau',
        'date_naissance',
        'statut',
        'photo',
    ];

    public function ufr()
    {
        return $this->belongsTo(Ufr::class, 'id_ufr');
    }

    public function departement()
    {
        return $this->belongsTo(Departement::class, 'id_departement');
    }

    public function filiere()
    {
        return $this->belongsTo(Filiere::class, 'id_filiere');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'id_user');
    }

    public function listesElectorales()
{
    return $this->hasMany(ListeElectorale::class, 'id_etudiant');
}
}
