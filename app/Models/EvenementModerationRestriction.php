<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvenementModerationRestriction extends Model
{
    use HasFactory;

    protected $fillable = [
        'evenement_id',
        'user_id',
        'created_by',
        'comments_blocked',
        'replies_blocked',
        'messages_blocked',
        'muted',
        'status',
        'reason',
        'expires_at',
        'lifted_at',
        'lifted_by',
    ];

    protected $casts = [
        'comments_blocked' => 'boolean',
        'replies_blocked' => 'boolean',
        'messages_blocked' => 'boolean',
        'muted' => 'boolean',
        'expires_at' => 'datetime',
        'lifted_at' => 'datetime',
    ];

    public function evenement()
    {
        return $this->belongsTo(Evenement::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function lifter()
    {
        return $this->belongsTo(User::class, 'lifted_by');
    }
}
