<?php

namespace App\Http\Controllers;

use App\Models\DiplomaRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;

class NotificationController extends Controller
{
    public function read(DatabaseNotification $notification): RedirectResponse
    {
        $this->authorize('read', $notification);

        $notification->markAsRead();

        $requestId = $notification->data['request_id'] ?? null;
        if ($requestId && $diplomaRequest = DiplomaRequest::find($requestId)) {
            return to_route('diplomas.show', $diplomaRequest);
        }

        return back();
    }

    public function readAll(Request $request): RedirectResponse
    {
        $request->user()->unreadNotifications()->update(['read_at' => now()]);

        return back();
    }
}
