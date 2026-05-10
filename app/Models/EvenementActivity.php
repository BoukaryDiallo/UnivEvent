<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EvenementActivity extends Model
{
    protected $fillable = [
        'evenement_id',
        'user_id',
        'type',
        'label',
        'description',
        'meta',
    ];

    protected $casts = [
        'meta' => 'array',
    ];

    public function evenement()
    {
        return $this->belongsTo(Evenement::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
