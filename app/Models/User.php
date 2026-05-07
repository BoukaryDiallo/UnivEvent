<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use App\Models\Charge;
use App\Models\Dispo;
use App\Models\Ecart;
use App\Models\HistoriqueDisponibilite;
use App\Models\Etudiant;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Permission\Traits\HasRoles;

#[Fillable(['name', 'email', 'password', 'role', 'est_actif'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, SoftDeletes, TwoFactorAuthenticatable, HasRoles;

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'est_actif' => 'boolean',
        ];
    }


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

    public function isScolarite(): bool
    {
        return $this->can('diplomas.manage');
    }

    /*
    |--------------------------------------------------------------------------
    | RELATIONS (Module 1 & 2)
    |--------------------------------------------------------------------------
    */

    public function enseignant(): HasOne
    {
        return $this->hasOne(Enseignant::class);
    }

    public function charge(): HasOne
    {
        return $this->hasOne(Charge::class);
    }

    public function dispos(): HasMany
    {
        return $this->hasMany(Dispo::class);
    }

    public function ecarts(): HasMany
    {
        return $this->hasMany(Ecart::class);
    }

    public function historiqueDisponibilites(): HasMany
    {
        return $this->hasMany(HistoriqueDisponibilite::class, 'enseignant_id');
    }

    public function etudiant(): HasOne
    {
        return $this->hasOne(Etudiant::class);
    }

    /*
    |--------------------------------------------------------------------------
    | RELATIONS (Module 5)
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
        return $this->hasMany(ResultatEvaluation::class, 'utilisateur_id');
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
