<?php

namespace App\Http\Middleware;

use App\Models\EventNotification;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
<<<<<<< HEAD
                'user' => $request->user(),
                'roles' => $request->user() ? $request->user()->getRoleNames() : [],
                'permissions' => $request->user() ? $request->user()->getAllPermissions()->pluck('name') : [],
=======
                'user' => $request->user()
                    ? array_merge(
                        $request->user()->toArray(),
                        [
                            'isScolarite' => (bool) $user?->isScolarite(),
                            'roles' => $user ? $user->getRoleNames() : [],
                            'permissions' => $user ? $user->getAllPermissions()->pluck('name') : [],
                            'event_roles' => $request->user()->assignments()->pluck('role')->unique()->toArray(),
                            'has_managed_events' =>
                                $request->user()->isAdmin()
                                || \App\Models\Evenement::where('cree_par', $request->user()->id)->exists()
                                || $request->user()->assignments()
                                    ->whereIn('role', ['organisateur', 'jury', 'intervenant'])
                                    ->exists(),
                        ]
                    )
                    : null,
>>>>>>> main
            ],
            'notifications' => fn () => $request->user()
                ? [
                    'unread_count' => EventNotification::query()
                        ->where('user_id', $request->user()->id)
                        ->whereNull('read_at')
                        ->count() + $request->user()->unreadNotifications()->count(),
                    'items' => EventNotification::query()
                        ->where('user_id', $request->user()->id)
                        ->latest()
                        ->take(5)
                        ->get(['id', 'type', 'title', 'message', 'evenement_id', 'read_at', 'created_at'])
                        ->map(fn (EventNotification $notification) => [
                            'id' => $notification->id,
                            'type' => $notification->type,
                            'title' => $notification->title,
                            'message' => $notification->message,
                            'event_id' => $notification->evenement_id,
                            'read_at' => optional($notification->read_at)->toIso8601String(),
                            'created_at' => optional($notification->created_at)->toIso8601String(),
                        ])
                        ->values(),
                    'recent' => $request->user()->unreadNotifications()
                        ->latest()
                        ->limit(10)
                        ->get()
                        ->map(fn (DatabaseNotification $n) => [
                            'id' => $n->id,
                            'title' => $n->data['title'] ?? 'Notification',
                            'tracking_code' => $n->data['tracking_code'] ?? null,
                            'status_label' => $n->data['status_label'] ?? null,
                            'created_at' => $n->created_at->toIso8601String(),
                        ])
                        ->all(),
                ]
                : ['unread_count' => 0, 'items' => [], 'recent' => []],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
