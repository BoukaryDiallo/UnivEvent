<?php

use App\Http\Controllers\UserController;
use App\Http\Controllers\GestionController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use App\Http\Controllers\EtudiantController;
use App\Http\Controllers\ElectionController;
use App\Http\Controllers\CirconscriptionController;
use App\Http\Controllers\CandidatureController;
use App\Http\Controllers\VoteController;
use Inertia\Inertia;
use App\Http\Controllers\UfrController;
use App\Http\Controllers\DepartementController;
use App\Http\Controllers\FiliereController;
use App\Http\Controllers\DepouillementController;
use App\Http\Controllers\ResultatController;
use App\Http\Controllers\ResultatBrouillonController;

Route::inertia('/', 'welcome', [
])->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Espace Élections
    Route::get('espace-election', [ResultatController::class, 'espaceElections'])->name('espace.elections');

    // Administration
    Route::middleware(['role:admin'])->group(function () {
        Route::get('gestion', [GestionController::class, 'index'])->name('gestion');
        Route::get('roles', [UserController::class, 'index'])->name('roles');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/clubs.php';
require __DIR__.'/elections.php';
