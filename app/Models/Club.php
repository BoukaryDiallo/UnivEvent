<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Club extends Model
{
    protected $fillable = [
        'nom',
        'type',
        'statut',
        'description',
        'responsable_id',
    ];

    public function responsable()
    {
        return $this->belongsTo(User::class, 'responsable_id');
    }

    public function adhesions()
    {
        return $this->hasMany(Adhesion::class);
    }

    public function membres()
    {
        return $this->belongsToMany(User::class, 'adhesions')
                    ->wherePivot('statut', 'approuvee')
                    ->withPivot('role_dans_club', 'statut');
    }

    public function activites()
    {
        return $this->hasMany(Activite::class);
    }

    public function demandesLocal()
    {
        return $this->hasMany(DemandeLocal::class);
    }

    public function demandesBudget()
    {
        return $this->hasMany(DemandeBudget::class);
    }

    public function notifications()
    {
        return $this->hasMany(NotificationClub::class, 'club_id');
    }

    public function forumMessages()
    {
        return $this->hasMany(ForumMessage::class)->orderBy('created_at', 'desc');
    }
}
