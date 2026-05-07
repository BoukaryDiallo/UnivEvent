<?php

use App\Http\Controllers\EnseignantAuthController;
use App\Http\Controllers\EventDashboardController;
use App\Http\Controllers\NotificationCenterController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\NotificationController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

/*
|--------------------------------------------------------------------------
| Public
|--------------------------------------------------------------------------
*/

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

/*
|--------------------------------------------------------------------------
| Guest (auth enseignant)
|--------------------------------------------------------------------------
*/

Route::middleware('guest')->group(function () {
    Route::get('enseignant/inscription', [EnseignantAuthController::class, 'inscription'])
        ->name('enseignant.inscription');

    Route::post('enseignant/inscription', [EnseignantAuthController::class, 'enregistrer'])
        ->name('enseignant.enregistrer');

    Route::get('enseignant/connexion', [EnseignantAuthController::class, 'connexion'])
        ->name('enseignant.connexion');

    Route::post('enseignant/connexion', [EnseignantAuthController::class, 'connecter'])
        ->name('enseignant.connecter');
});

/*
|--------------------------------------------------------------------------
| Authenticated
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified'])->group(function () {

    // Dashboard principal (Unified)
    Route::get('dashboard', [DashboardController::class, 'index'])
        ->name('dashboard');

    // Dashboard événements (Module 5)
    Route::get('dashboard/evenements', [EventDashboardController::class, 'index'])
        ->name('dashboard.evenements');

    // Notifications Hub (Module 5)
    Route::get('notifications', [NotificationCenterController::class, 'index'])
        ->name('notifications.index');

    // Standard Notifications
    Route::post('notifications/{notification}/read', [NotificationController::class, 'read'])
        ->name('notifications.read');

    Route::post('notifications/read-all', [NotificationController::class, 'readAll'])
        ->name('notifications.read-all');

    // Admin only
    Route::middleware('role:admin')->group(function () {
        Route::get('roles', [UserController::class, 'index'])
            ->name('roles');
    });
});

/*
|--------------------------------------------------------------------------
| Modules
|--------------------------------------------------------------------------
*/

require __DIR__.'/diplomas.php';
require __DIR__.'/module1.php';
require __DIR__.'/dispo.php';
require __DIR__.'/module2.php';
require __DIR__.'/module5.php';
require __DIR__.'/settings.php';
