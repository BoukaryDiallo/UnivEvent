<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotificationClub extends Model
{
    protected $table = 'notifications_clubs';

    protected $fillable = [
        'club_id',
        'type_notif',
        'message',
        'lu',
        'date_envoi',
    ];

    protected $casts = [
        'lu' => 'boolean',
        'date_envoi' => 'datetime',
    ];

    public function club()
    {
        return $this->belongsTo(Club::class);
    }
}
