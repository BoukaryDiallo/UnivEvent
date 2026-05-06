<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\NotificationCenterController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('dashboard/evenements', [DashboardController::class, 'eventDashboard'])->name('dashboard.evenements');
    Route::get('notifications', [NotificationCenterController::class, 'index'])->name('notifications.index');

    Route::middleware('role:admin')->group(function () {
        Route::get('roles', [UserController::class, 'index'])->name('roles');
    });
});

require __DIR__.'/module5.php';
require __DIR__.'/settings.php';
