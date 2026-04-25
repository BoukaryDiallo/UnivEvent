<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvenementRole extends Model
{
    use HasFactory;

    protected $fillable = [
        'evenement_id',
        'category',
        'role',
        'user_id',
        'is_president_jury',
        'can_manage_messages',
        'can_manage_comments',
        'can_edit_event',
        'can_change_visibility',
        'can_manage_participants',
        'can_assign_jury',
        'can_assign_organizers',
        'can_manage_certificates',
        'can_manage_results',
        'meta',
    ];

    protected $casts = [
        'is_president_jury' => 'boolean',
        'can_manage_messages' => 'boolean',
        'can_manage_comments' => 'boolean',
        'can_edit_event' => 'boolean',
        'can_change_visibility' => 'boolean',
        'can_manage_participants' => 'boolean',
        'can_assign_jury' => 'boolean',
        'can_assign_organizers' => 'boolean',
        'can_manage_certificates' => 'boolean',
        'can_manage_results' => 'boolean',
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
