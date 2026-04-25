<?php

namespace App\Policies;

use App\Models\Evenement;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class EvenementPolicy
{
    public function view(User $user, Evenement $evenement)
    {
        return $user->isAdmin() || $evenement->cree_par === $user->id;
    }

    public function update(User $user, Evenement $evenement)
    {
        return $user->isAdmin() || $evenement->cree_par === $user->id;
    }

    public function delete(User $user, Evenement $evenement)
    {
        return $user->isAdmin() || $evenement->cree_par === $user->id;
    }
}
