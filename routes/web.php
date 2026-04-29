<?php

use App\Http\Controllers\UserController;
use App\Http\Controllers\GestionController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
])->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Administration
    Route::middleware(['role:admin'])->group(function () {
        Route::get('gestion', [GestionController::class, 'index'])->name('gestion');
        Route::get('roles', [UserController::class, 'index'])->name('roles');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/clubs.php';
