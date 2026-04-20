<?php

use App\Http\Controllers\EnseignantAuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

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

require __DIR__.'/dispo.php';
require __DIR__.'/settings.php';
