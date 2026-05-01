<?php

namespace App\Http\Controllers;

use App\Models\NotificationClub;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class NotificationClubController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $notifications = NotificationClub::with('club')
            ->whereHas('club', function ($query) use ($user) {
                $query->where('responsable_id', $user->id)
                    ->orWhereHas('adhesions', function ($q) use ($user) {
                        $q->where('user_id', $user->id);
                    });
            })
            ->orderBy('date_envoi', 'desc')
            ->get();

        return Inertia::render('Notifications/Index', ['notifications' => $notifications]);
    }

    public function markAsRead(string $id)
    {
        $notification = NotificationClub::findOrFail($id);
        $notification->update(['lu' => true]);
        return redirect()->back()->with('success', 'Notification marquée comme lue');
    }

    public function markAllAsRead()
    {
        $user = Auth::user();
        NotificationClub::whereHas('club', function ($query) use ($user) {
            $query->where('responsable_id', $user->id)
                ->orWhereHas('adhesions', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                });
        })->update(['lu' => true]);

        return redirect()->back()->with('success', 'Toutes les notifications marquées comme lues');
    }
}
