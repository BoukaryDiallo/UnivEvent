<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use App\Models\Club;
use Spatie\Permission\Traits\HasRoles;

use App\Models\Etudiant;

#[Fillable(['name', 'email', 'password', 'est_actif'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable, HasRoles;

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

    /**
     * Get the etudiant associated with the user.
     */
    public function etudiant()
    {
        return $this->hasOne(Etudiant::class, 'id_user');
    }

    public function isResponsable()
    {
        return Club::where('responsable_id', $this->id)->exists();
    }
}
