<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EventNotification extends Model
{
    protected $fillable = [
        'user_id',
        'evenement_id',
        'type',
        'title',
        'message',
        'data',
        'read_at',
        'emailed_at',
    ];

    protected $casts = [
        'data' => 'array',
        'read_at' => 'datetime',
        'emailed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function evenement()
    {
        return $this->belongsTo(Evenement::class);
    }
}
