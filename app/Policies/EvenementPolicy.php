<?php

namespace App\Policies;

use App\Models\Evenement;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class EvenementPolicy
{
    public function viewAny(User $user)
    {
        return $user->isAdmin();
    }

    public function create(User $user)
    {
        return $user->isAdmin() || $user->isEnseignant() || $user->isOrganisateur() || $user->isEtudiant();
    }

    public function update(User $user, Evenement $evenement)
    {
        if ($user->isAdmin() || $evenement->cree_par === $user->id) {
            return true;
        }

        $assignment = $evenement->assignments()->where('user_id', $user->id)->first();

        return (bool) ($assignment?->can_edit_event);
    }

    public function approve(User $user, Evenement $evenement)
    {
        return $user->isAdmin();
    }

    public function manage(User $user, Evenement $evenement)
    {
        if ($user->isAdmin() || $evenement->cree_par === $user->id) {
            return true;
        }

        $assignment = $evenement->assignments()->where('user_id', $user->id)->first();

        return (bool) ($assignment && $assignment->role === 'organisateur');
    }

    public function assignUsers(User $user, Evenement $evenement)
    {
        return $user->isAdmin() || $evenement->cree_par === $user->id;
    }

    public function manageProgram(User $user, Evenement $evenement)
    {
        return $user->isAdmin() || $evenement->cree_par === $user->id;
    }

    public function manageMedia(User $user, Evenement $evenement)
    {
        return $user->isAdmin() || $evenement->cree_par === $user->id;
    }
}
