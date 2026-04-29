<?php

use App\Http\Controllers\UserController;
use App\Http\Controllers\GestionController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // Administration
    Route::middleware(['role:admin'])->group(function () {
        Route::get('gestion', [GestionController::class, 'index'])->name('gestion');
        Route::get('roles', [UserController::class, 'index'])->name('roles');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/clubs.php';
