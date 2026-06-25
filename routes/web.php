<?php

use App\Http\Controllers\UserController;
use App\Http\Controllers\GestionController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\NotificationController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Administration
    Route::middleware(['role:admin'])->group(function () {
        Route::get('gestion', [GestionController::class, 'index'])->name('gestion');
        Route::get('roles', [UserController::class, 'index'])->name('roles');
        Route::put('users/{id}/toggle-status', [UserController::class, 'toggleStatus'])->name('users.toggle-status');
        Route::put('users/{id}/role', [UserController::class, 'updateRole'])->name('users.update-role');
        Route::delete('users/{id}', [UserController::class, 'destroy'])->name('users.destroy');
    });

    Route::post('notifications/{notification}/read', [NotificationController::class, 'read'])
        ->name('notifications.read');
    Route::post('notifications/read-all', [NotificationController::class, 'readAll'])
        ->name('notifications.read-all');
});

require __DIR__.'/settings.php';
require __DIR__.'/clubs.php';
require __DIR__.'/diplomas.php';
require __DIR__.'/module1.php';
