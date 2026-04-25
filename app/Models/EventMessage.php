<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EventMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'evenement_id',
        'user_id',
        'type',
        'contenu',
        'parent_id',
        'status',
        'is_pinned',
        'moderated_by',
        'moderation_reason',
        'moderated_at',
    ];

    protected $casts = [
        'is_pinned' => 'boolean',
        'moderated_at' => 'datetime',
    ];

    public function evenement()
    {
        return $this->belongsTo(Evenement::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function parent()
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function replies()
    {
        return $this->hasMany(self::class, 'parent_id')->with('user:id,name,email,role');
    }

    public function moderator()
    {
        return $this->belongsTo(User::class, 'moderated_by');
    }
}
