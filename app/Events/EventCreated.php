<?php

namespace App\Events;

use App\Models\Evenement;
use App\Models\User;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class EventCreated
{
    use Dispatchable;
    use SerializesModels;

    public function __construct(
        public Evenement $evenement,
        public User $actor,
    ) {
    }
}
