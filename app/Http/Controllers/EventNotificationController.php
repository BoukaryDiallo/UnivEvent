<?php

namespace App\Http\Controllers;

use App\Models\EventNotification;
use Illuminate\Http\Request;

class EventNotificationController extends Controller
{
    public function markRead(Request $request, EventNotification $notification)
    {
        abort_unless($request->user() && $notification->user_id === $request->user()->id, 403);

        $notification->update([
            'read_at' => now(),
        ]);

        return back();
    }

    public function markAllRead(Request $request)
    {
        abort_unless($request->user(), 403);

        EventNotification::query()
            ->where('user_id', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return back();
    }
}
