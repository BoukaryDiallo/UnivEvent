<?php

namespace App\Http\Controllers;

use App\Models\EventNotification;
use App\Models\Evenement;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationCenterController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        abort_unless($user, 403);

        $notifications = EventNotification::query()
            ->where('user_id', $user->id)
            ->latest()
            ->paginate(12)
            ->through(fn (EventNotification $notification) => [
                'id' => $notification->id,
                'type' => $notification->type,
                'title' => $notification->title,
                'message' => $notification->message,
                'read_at' => optional($notification->read_at)->toIso8601String(),
                'created_at' => optional($notification->created_at)->toIso8601String(),
                'event_id' => $notification->evenement_id,
            ]);

        $feed = $this->relevantEventsQuery($user)
            ->with(['activities.user:id,name,email,role'])
            ->latest('updated_at')
            ->take(16)
            ->get()
            ->flatMap(fn (Evenement $evenement) => $evenement->activities->take(3)->map(fn ($activity) => [
                'id' => $activity->id,
                'event_id' => $evenement->id,
                'event_title' => $evenement->titre,
                'label' => $activity->label,
                'description' => $activity->description,
                'created_at' => optional($activity->created_at)->toIso8601String(),
                'user' => [
                    'name' => $activity->user?->name,
                    'role' => $activity->user?->role,
                ],
            ]))
            ->sortByDesc('created_at')
            ->values()
            ->take(18)
            ->values();

        return Inertia::render('notifications/Index', [
            'stats' => [
                'total' => EventNotification::query()->where('user_id', $user->id)->count(),
                'unread' => EventNotification::query()->where('user_id', $user->id)->whereNull('read_at')->count(),
                'feed_count' => $feed->count(),
            ],
            'notifications' => $notifications,
            'feed' => $feed,
        ]);
    }

    private function relevantEventsQuery(User $user): Builder
    {
        return Evenement::query()
            ->when(! $user->isAdmin(), function (Builder $builder) use ($user) {
                $builder->where(function (Builder $query) use ($user) {
                    $query->where('cree_par', $user->id)
                        ->orWhereHas('assignments', fn (Builder $assignments) => $assignments->where('user_id', $user->id))
                        ->orWhereHas('inscriptions', fn (Builder $inscriptions) => $inscriptions->where('utilisateur_id', $user->id));
                });
            });
    }
}
