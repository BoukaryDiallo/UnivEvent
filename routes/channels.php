<?php

use App\Models\Evenement;
use App\Models\User;
use App\Services\EventAuthorizationService;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('user.{userId}', function (User $user, int $userId) {
    return $user->id === $userId;
});

Broadcast::channel('evenement.{evenementId}', function (User $user, int $evenementId) {
    $evenement = Evenement::query()
        ->with(['roles', 'assignments'])
        ->find($evenementId);

    if (! $evenement) {
        return false;
    }

    $authorization = app(EventAuthorizationService::class);

    return $authorization->canEditEvent($evenement, $user)
        || $authorization->canManageResults($evenement, $user)
        || $authorization->canManageCertificates($evenement, $user)
        || $authorization->isJuryMember($evenement, $user);
});
