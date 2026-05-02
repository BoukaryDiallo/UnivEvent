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

require __DIR__.'/settings.php';