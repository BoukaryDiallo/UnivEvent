<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JuryPanel extends Model
{
    use HasFactory;

    protected $fillable = [
        'evenement_id',
        'president_user_id',
        'admission_average',
        'seats_count',
        'ranking_mode',
        'tie_break_rule',
        'criteria_locked',
        'criteria_locked_at',
        'scoring_opened_at',
        'scoring_closed_at',
        'validated_at',
        'validated_by',
        'validation_note',
    ];

    protected $casts = [
        'admission_average' => 'decimal:2',
        'criteria_locked' => 'boolean',
        'criteria_locked_at' => 'datetime',
        'scoring_opened_at' => 'datetime',
        'scoring_closed_at' => 'datetime',
        'validated_at' => 'datetime',
    ];

    public function evenement()
    {
        return $this->belongsTo(Evenement::class);
    }

    public function president()
    {
        return $this->belongsTo(User::class, 'president_user_id');
    }

    public function validator()
    {
        return $this->belongsTo(User::class, 'validated_by');
    }

    public function criteria()
    {
        return $this->hasMany(JuryCriterion::class)->orderBy('ordre');
    }

    public function scores()
    {
        return $this->hasMany(JuryScore::class);
    }

    public function deliberations()
    {
        return $this->hasMany(JuryDeliberation::class)->latest();
    }
}
