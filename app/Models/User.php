<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /*
    |--------------------------------------------------------------------------
    | ATTRIBUTS MODIFIABLES
    |--------------------------------------------------------------------------
    */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'est_actif'
    ];

    /*
    |--------------------------------------------------------------------------
    | ATTRIBUTS CACHÉS
    |--------------------------------------------------------------------------
    */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /*
    |--------------------------------------------------------------------------
    | CASTS
    |--------------------------------------------------------------------------
    */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'two_factor_confirmed_at' => 'datetime',
        'est_actif' => 'boolean',
    ];

    /*
    |--------------------------------------------------------------------------
    | ROLES HELPERS
    |--------------------------------------------------------------------------
    */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isEtudiant(): bool
    {
        return $this->role === 'etudiant';
    }

    public function isEnseignant(): bool
    {
        return $this->role === 'enseignant';
    }

    public function isOrganisateur(): bool
    {
        return $this->role === 'organisateur';
    }

    public function isParticipant(): bool
    {
        return $this->role === 'participant';
    }

    public function isJury(): bool
    {
        return $this->role === 'jury';
    }

    public function isIntervenant(): bool
    {
        return $this->role === 'intervenant';
    }

    /*
    |--------------------------------------------------------------------------
    | RELATIONS
    |--------------------------------------------------------------------------
    */

    public function evenementsCrees()
    {
        return $this->hasMany(Evenement::class, 'cree_par');
    }

    public function inscriptions()
    {
        return $this->hasMany(InscriptionEvenement::class, 'utilisateur_id');
    }

    public function resultats()
    {
        return $this->hasMany(Resultat::class, 'utilisateur_id');
    }

    public function certificats()
    {
        return $this->hasMany(Certificat::class, 'utilisateur_id');
    }

    public function evenementComments()
    {
        return $this->hasMany(EvenementComment::class);
    }

    public function eventNotifications()
    {
        return $this->hasMany(EventNotification::class);
    }

    public function eventMessages()
    {
        return $this->hasMany(EventMessage::class);
    }

    public function evenementAssignments()
    {
        return $this->hasMany(EvenementRole::class);
    }

    public function assignments()
    {
        return $this->evenementAssignments();
    }

    public function moderationRestrictions()
    {
        return $this->hasMany(EvenementModerationRestriction::class);
    }

    public function juryPanelsAsPresident()
    {
        return $this->hasMany(JuryPanel::class, 'president_user_id');
    }

    public function juryScores()
    {
        return $this->hasMany(JuryScore::class, 'jury_user_id');
    }

    public function participantScores()
    {
        return $this->hasMany(JuryScore::class, 'participant_id');
    }
}
