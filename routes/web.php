<?php

use App\Http\Controllers\UserController;
use App\Http\Controllers\SoutenanceController;
use App\Http\Controllers\SalleController;
use App\Http\Controllers\JuryController;
use App\Http\Controllers\NotificationSoutenanceController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // Module 4 — Gestion des soutenances
    Route::resource('soutenances', SoutenanceController::class);
    Route::resource('salles', SalleController::class);
    Route::resource('jurys', JuryController::class);
    Route::resource('notifications-soutenance', NotificationSoutenanceController::class);
    Route::patch('notifications-soutenance/{notification}/lu', [NotificationSoutenanceController::class, 'marquerLu'])
        ->name('notifications-soutenance.lu');
});

Route::middleware(['auth', 'verified'])
    ->middleware('role:admin')
    ->group(function () {
        Route::get('roles', [UserController::class, 'index'])->name('roles');
    });

require __DIR__.'/settings.php';