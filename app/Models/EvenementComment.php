<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvenementComment extends Model
{
    use HasFactory;

    protected $fillable = [
        'evenement_id',
        'user_id',
        'parent_id',
        'contenu',
        'status',
        'moderated_by',
        'moderation_reason',
        'moderated_at',
    ];

    protected $casts = [
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
        return $this->hasMany(self::class, 'parent_id')
            ->where('status', 'visible')
            ->with(['user:id,name,email,role', 'reactions']);
    }

    public function reactions()
    {
        return $this->hasMany(EvenementCommentReaction::class, 'comment_id');
    }

    public function moderator()
    {
        return $this->belongsTo(User::class, 'moderated_by');
    }
}
