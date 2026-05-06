<?php

use App\Http\Controllers\EnseignantAuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\NotificationController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::middleware(['role:admin'])->group(function () {
        Route::get('gestion', [GestionController::class, 'index'])->name('gestion');
        Route::get('roles', [UserController::class, 'index'])->name('roles');
    });
});

Route::middleware('guest')->group(function () {
    Route::get('enseignant/inscription', [EnseignantAuthController::class, 'inscription'])->name('enseignant.inscription');
    Route::post('enseignant/inscription', [EnseignantAuthController::class, 'enregistrer'])->name('enseignant.enregistrer');
    Route::get('enseignant/connexion', [EnseignantAuthController::class, 'connexion'])->name('enseignant.connexion');
    Route::post('enseignant/connexion', [EnseignantAuthController::class, 'connecter'])->name('enseignant.connecter');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
});

Route::middleware(['auth', 'verified'])
    ->middleware('role:admin')
    ->group(function () {
        Route::get('roles', [UserController::class, 'index'])->name('roles');
    });
    
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::post('notifications/{notification}/read', [NotificationController::class, 'read'])
        ->name('notifications.read');
    Route::post('notifications/read-all', [NotificationController::class, 'readAll'])
        ->name('notifications.read-all');
});

require __DIR__.'/diplomas.php';
require __DIR__.'/module1.php';
require __DIR__.'/dispo.php';
require __DIR__.'/module2.php';
require __DIR__.'/settings.php';
require __DIR__.'/clubs.php';
require __DIR__.'/elections.php';
require __DIR__.'/academic.php';
