<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EnseignantAuthController;
use App\Http\Controllers\EventDashboardController;
use App\Http\Controllers\GestionController;
use App\Http\Controllers\JuryController;
use App\Http\Controllers\NotificationCenterController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\NotificationSoutenanceController;
use App\Http\Controllers\SalleController;
use App\Http\Controllers\SoutenanceController;
use App\Http\Controllers\UserController;
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

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // Routes accessibles à tous les utilisateurs connectés
    Route::get('soutenances', [SoutenanceController::class, 'index'])->name('soutenances.index')
        ->middleware('permission:voir soutenances');
    Route::get('soutenances/{soutenance}', [SoutenanceController::class, 'show'])->name('soutenances.show')
        ->middleware('permission:voir soutenances');

    // Routes réservées à l'admin
    Route::middleware('role:admin')->group(function () {
        Route::get('soutenances/create', [SoutenanceController::class, 'create'])->name('soutenances.create');
        Route::post('soutenances', [SoutenanceController::class, 'store'])->name('soutenances.store');
        Route::get('soutenances/{soutenance}/edit', [SoutenanceController::class, 'edit'])->name('soutenances.edit');
        Route::put('soutenances/{soutenance}', [SoutenanceController::class, 'update'])->name('soutenances.update');
        Route::delete('soutenances/{soutenance}', [SoutenanceController::class, 'destroy'])->name('soutenances.destroy');

        Route::resource('salles', SalleController::class);
        Route::resource('jurys', JuryController::class);
        Route::resource('notifications-soutenance', NotificationSoutenanceController::class);
        Route::patch('notifications-soutenance/{notification}/lu', [NotificationSoutenanceController::class, 'marquerLu'])
            ->name('notifications-soutenance.lu');

        Route::get('roles', [UserController::class, 'index'])->name('roles');
    });
});

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
        Route::get('gestion', [GestionController::class, 'index'])
            ->name('gestion');
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
require __DIR__.'/clubs.php';
require __DIR__.'/elections.php';
require __DIR__.'/academic.php';
