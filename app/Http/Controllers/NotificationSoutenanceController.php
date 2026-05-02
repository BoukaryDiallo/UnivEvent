<?php

namespace App\Http\Controllers;

use App\Models\NotificationSoutenance;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationSoutenanceController extends Controller
{
    public function index()
    {
        $notifications = NotificationSoutenance::with(['soutenance', 'user'])
            ->orderBy('created_at', 'desc')
            ->get();
        return Inertia::render('soutenances/notifications/index', compact('notifications'));
    }

    public function marquerLu(NotificationSoutenance $notification)
    {
        $notification->update(['lu' => true]);
        return redirect()->back()->with('success', 'Notification marquée comme lue.');
    }

    public function destroy(NotificationSoutenance $notification)
    {
        $notification->delete();
        return redirect()->route('notifications-soutenance.index')->with('success', 'Notification supprimée.');
    }
}