<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use App\Models\Charge;
use App\Models\Dispo;
use App\Models\Ecart;
use App\Models\HistoriqueDisponibilite;
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

#[Fillable(['name', 'email', 'password', 'est_actif'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, SoftDeletes, TwoFactorAuthenticatable, HasRoles;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'est_actif' => 'boolean'
        ];
    }


    public function isAdmin(){
        return $this->role === 'admin';
    }

    public function isEtudiant(){
        return $this->role === 'etudiant';
    }

    public function isEnseignant(){
        return $this->role === 'enseignant';
    }

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
}
