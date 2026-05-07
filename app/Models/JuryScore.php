<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JuryScore extends Model
{
    use HasFactory;

    protected $fillable = [
        'jury_panel_id',
        'jury_criterion_id',
        'participant_id',
        'jury_user_id',
        'score',
        'commentaire',
        'status',
        'submitted_at',
        'reopened_at',
    ];

    protected $casts = [
        'score' => 'decimal:2',
        'submitted_at' => 'datetime',
        'reopened_at' => 'datetime',
    ];

    public function panel()
    {
        return $this->belongsTo(JuryPanel::class, 'jury_panel_id');
    }

    public function criterion()
    {
        return $this->belongsTo(JuryCriterion::class, 'jury_criterion_id');
    }

    public function participant()
    {
        return $this->belongsTo(User::class, 'participant_id');
    }

    public function jury()
    {
        return $this->belongsTo(User::class, 'jury_user_id');
    }
}
