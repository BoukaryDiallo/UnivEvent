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

    public function getPermissionsAttribute(): array
    {
        return [
            'can_manage_messages' => (bool) $this->can_manage_messages,
            'can_manage_comments' => (bool) $this->can_manage_comments,
            'can_edit_event' => (bool) $this->can_edit_event,
            'can_change_visibility' => (bool) $this->can_change_visibility,
            'can_manage_participants' => (bool) $this->can_manage_participants,
            'can_assign_jury' => (bool) $this->can_assign_jury,
            'can_assign_organizers' => (bool) $this->can_assign_organizers,
            'can_manage_certificates' => (bool) $this->can_manage_certificates,
            'can_manage_results' => (bool) $this->can_manage_results,
        ];
    }

    public function setPermissionsAttribute(array $permissions): void
    {
        $this->attributes['can_manage_messages'] = (bool) ($permissions['can_manage_messages'] ?? false);
        $this->attributes['can_manage_comments'] = (bool) ($permissions['can_manage_comments'] ?? false);
        $this->attributes['can_edit_event'] = (bool) ($permissions['can_edit_event'] ?? false);
        $this->attributes['can_change_visibility'] = (bool) ($permissions['can_change_visibility'] ?? false);
        $this->attributes['can_manage_participants'] = (bool) ($permissions['can_manage_participants'] ?? false);
        $this->attributes['can_assign_jury'] = (bool) ($permissions['can_assign_jury'] ?? false);
        $this->attributes['can_assign_organizers'] = (bool) ($permissions['can_assign_organizers'] ?? false);
        $this->attributes['can_manage_certificates'] = (bool) ($permissions['can_manage_certificates'] ?? false);
        $this->attributes['can_manage_results'] = (bool) ($permissions['can_manage_results'] ?? false);
    }

    public function evenement()
    {
        return $this->belongsTo(Evenement::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
