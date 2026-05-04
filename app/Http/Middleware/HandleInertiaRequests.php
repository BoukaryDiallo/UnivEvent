<?php

namespace App\Http\Middleware;

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
                'user' => $user,
                'isScolarite' => (bool) $user?->isScolarite(),
                'roles' => $user ? $user->getRoleNames() : [],
                'permissions' => $user ? $user->getAllPermissions()->pluck('name') : [],
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'notifications' => $user
                ? $this->buildNotificationsShare($user)
                : ['unread_count' => 0, 'recent' => []],
        ];
    }

    /**
     * @return array{unread_count: int, recent: array<int, array<string, mixed>>}
     */
    private function buildNotificationsShare($user): array
    {
        $unread = $user->unreadNotifications()->latest()->limit(10)->get();

        $count = $unread->count() < 10
            ? $unread->count()
            : $user->unreadNotifications()->count();

        return [
            'unread_count' => $count,
            'recent' => $unread
                ->map(fn (DatabaseNotification $n) => [
                    'id' => $n->id,
                    'title' => $n->data['title'] ?? 'Notification',
                    'tracking_code' => $n->data['tracking_code'] ?? null,
                    'status_label' => $n->data['status_label'] ?? null,
                    'created_at' => $n->created_at->toIso8601String(),
                ])
                ->all(),
        ];
    }
}
