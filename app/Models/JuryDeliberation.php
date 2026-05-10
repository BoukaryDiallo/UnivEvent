<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JuryDeliberation extends Model
{
    use HasFactory;

    protected $fillable = [
        'jury_panel_id',
        'participant_id',
        'requested_by',
        'resolved_by',
        'status',
        'reason',
        'resolved_at',
    ];

    protected $casts = [
        'resolved_at' => 'datetime',
    ];

    public function panel()
    {
        return $this->belongsTo(JuryPanel::class, 'jury_panel_id');
    }

    public function participant()
    {
        return $this->belongsTo(User::class, 'participant_id');
    }

    public function requester()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function resolver()
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }
}
