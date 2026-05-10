<?php

namespace App\Services;

use App\Models\Evenement;
use App\Models\EvenementModerationRestriction;
use App\Models\User;

class EventModerationService
{
    public function activeRestriction(Evenement $evenement, ?User $user): ?EvenementModerationRestriction
    {
        if (! $user) {
            return null;
        }

        return $evenement->moderationRestrictions()
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->latest()
            ->first();
    }

    public function isBlockedForComments(Evenement $evenement, ?User $user): bool
    {
        return (bool) $this->activeRestriction($evenement, $user)?->comments_blocked;
    }

    public function isBlockedForReplies(Evenement $evenement, ?User $user): bool
    {
        return (bool) $this->activeRestriction($evenement, $user)?->replies_blocked;
    }

    public function isBlockedForMessages(Evenement $evenement, ?User $user): bool
    {
        return (bool) $this->activeRestriction($evenement, $user)?->messages_blocked;
    }
}
