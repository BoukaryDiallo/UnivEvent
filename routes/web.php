<?php

use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use App\Http\Controllers\EmploiDuTempsController;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

Route::middleware(['auth', 'verified'])
    ->middleware('role:admin')
    ->group(function () {
        Route::get('roles', [UserController::class, 'index'])->name('roles');
    });
    
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('emploieDuTemps', [EmploiDuTempsController::class, 'index'])->name('emploieDuTemps');
    Route::get('/emploieDuTemps/create', [EmploiDuTempsController::class, 'create'])->name('emploieDuTemps.create');
    Route::post('/creer', [EmploiDuTempsController::class, 'store'])->name('emploieDuTemps.store');

         
});


require __DIR__.'/settings.php';



    

    // Route::get('{id}', [EmploiDuTempsController::class, 'show'])->name('show');

    // Route::get('{id}/edit', [EmploiDuTempsController::class, 'edit'])->name('edit');

    // Route::put('{id}', [EmploiDuTempsController::class, 'update'])->name('update');

    // Route::delete('{id}', [EmploiDuTempsController::class, 'destroy'])->name('destroy');