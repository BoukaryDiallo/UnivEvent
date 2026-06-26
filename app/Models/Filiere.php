<?php

namespace App\Models;

use Database\Factories\Module2\FiliereFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Filiere extends Model
{
    /* pour module 2 */
    use HasFactory;

    protected static function newFactory()
    {
        return FiliereFactory::new();
    }
    /* fin module 2 */

    protected $table = 'filieres';

    protected $primaryKey = 'id_filiere';

    public $incrementing = true;

    protected $keyType = 'int';

    protected $fillable = [
        'nom',
        'id_departement',
        'code',
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

    // module 2
    public function emploisDuTemps()
    {
        return $this->hasMany(EmploiDuTemps::class, 'filiere_id', 'id_filiere');
    }
}
