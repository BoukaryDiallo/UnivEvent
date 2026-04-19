<?php

namespace App\Policies;

use App\Enums\DiplomaRequestStatus;
use App\Models\DiplomaDocument;
use App\Models\User;

class DiplomaDocumentPolicy
{
    public function download(User $user, DiplomaDocument $document): bool
    {
        return $user->id === $document->diplomaRequest->owner_id;
    }

    public function delete(User $user, DiplomaDocument $document): bool
    {
        return $user->id === $document->diplomaRequest->owner_id
            && $document->diplomaRequest->status === DiplomaRequestStatus::Draft;
    }

    public function validate(User $user, DiplomaDocument $document): bool
    {
        return $user->isScolarite()
            && $document->diplomaRequest->status === DiplomaRequestStatus::Submitted
            && $document->validated_at === null;
    }
}
