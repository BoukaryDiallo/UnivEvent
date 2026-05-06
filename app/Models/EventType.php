<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EventType extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'features',
        'is_active',
        'allow_organizer',
        'allow_intervenant',
        'allow_jury',
        'allow_participant',
    ];

    protected $casts = [
        'features' => 'array',
        'is_active' => 'boolean',
        'allow_organizer' => 'boolean',
        'allow_intervenant' => 'boolean',
        'allow_jury' => 'boolean',
        'allow_participant' => 'boolean',
    ];
}
