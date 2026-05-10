<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EvenementCommentReaction extends Model
{
    protected $fillable = [
        'comment_id',
        'user_id',
        'type',
    ];

    public function comment()
    {
        return $this->belongsTo(EvenementComment::class, 'comment_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
