<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotificationSoutenance extends Model
{
    protected $table = 'notifications_soutenance';

    protected $fillable = ['soutenance_id', 'user_id', 'type', 'message', 'lu'];

    public function soutenance()
    {
        return $this->belongsTo(Soutenance::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
