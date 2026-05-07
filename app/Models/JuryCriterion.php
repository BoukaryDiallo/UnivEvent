<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JuryCriterion extends Model
{
    use HasFactory;

    protected $fillable = [
        'jury_panel_id',
        'nom',
        'description',
        'bareme',
        'coefficient',
        'ordre',
        'actif',
    ];

    protected $casts = [
        'bareme' => 'decimal:2',
        'coefficient' => 'decimal:2',
        'actif' => 'boolean',
    ];

    public function panel()
    {
        return $this->belongsTo(JuryPanel::class, 'jury_panel_id');
    }

    public function scores()
    {
        return $this->hasMany(JuryScore::class);
    }
}
