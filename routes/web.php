<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // Clubs
    Route::resource('clubs', ClubController::class);

    // Adhésions
    Route::post('clubs/{club}/adherer', [AdhesionController::class, 'store'])->name('clubs.adherer');
    Route::delete('clubs/{club}/quitter', [AdhesionController::class, 'destroy'])->name('clubs.quitter');
    Route::put('clubs/{club}/adhesions/{adhesion}', [AdhesionController::class, 'update'])->name('adhesions.update');

    // Activités
    Route::resource('clubs.activites', ActiviteController::class)->shallow();

    // Demandes
    Route::post('clubs/{club}/demandes/local', [DemandeLocalController::class, 'store'])->name('clubs.demandes.local');
    Route::post('clubs/{club}/demandes/budget', [DemandeBudgetController::class, 'store'])->name('clubs.demandes.budget');

    // Administration
    Route::middleware(['role:admin'])->group(function () {
        Route::put('demandes/local/{demande}/valider', [DemandeLocalController::class, 'valider'])->name('demandes.local.valider');
        Route::put('demandes/budget/{demande}/valider', [DemandeBudgetController::class, 'valider'])->name('demandes.budget.valider');
    });
});

require __DIR__.'/settings.php';
