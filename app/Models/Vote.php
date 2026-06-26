<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Vote extends Model
{
    use HasFactory, SoftDeletes;

    protected $primaryKey = 'id_vote';

    protected $fillable = [
        'date_vote',
        'tour',
        'id_user',
        'id_election',
        'id_candidature',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'id_user');
    }

    public function election()
    {
        return $this->belongsTo(Election::class, 'id_election');
    }

    public function candidature()
    {
        return $this->belongsTo(Candidature::class, 'id_candidature');
    }
}
