<?php

use App\Http\Controllers\DispoController;
use App\Http\Controllers\PriseController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::middleware('role:enseignant')->group(function () {
        Route::get('dispos', [DispoController::class, 'dispos'])->name('dispos.index');
        Route::get('dispos/ajout', [DispoController::class, 'ajout'])->name('dispos.ajout');
        Route::get('dispos/{dispo}/modifier', [DispoController::class, 'modifier'])->name('dispos.modifier');
        Route::get('ecarts', [DispoController::class, 'ecarts'])->name('ecarts.index');
        Route::get('ecarts/ajout', [DispoController::class, 'ajoutEcart'])->name('ecarts.ajout');
        Route::get('mes-reservations', [DispoController::class, 'reservations'])->name('reservations.index');
        Route::get('historique-disponibilites', [DispoController::class, 'historique'])->name('dispos.historique');
        Route::get('mes-notifications', [DispoController::class, 'notifications'])->name('dispos.notifications');

        Route::post('dispos', [DispoController::class, 'store'])->name('dispos.store');
        Route::post('dispos/import', [DispoController::class, 'importer'])->name('dispos.import');
        Route::put('dispos/{dispo}', [DispoController::class, 'update'])->name('dispos.update');
        Route::delete('dispos/{dispo}', [DispoController::class, 'detruire'])->name('dispos.detruire');
        Route::post('dispos/{dispo}/restaurer', [DispoController::class, 'restaurer'])->name('dispos.restaurer');
        Route::post('ecarts', [DispoController::class, 'ecart'])->name('ecarts.store');
        Route::delete('ecarts/{ecart}', [DispoController::class, 'detruireEcart'])->name('ecarts.detruire');
        Route::get('charges/{charge}/modifier', [DispoController::class, 'editCharge'])->name('charges.edit');
        Route::put('charges', [DispoController::class, 'charge'])->name('charges.update');
        Route::delete('charges/{charge}', [DispoController::class, 'destroyCharge'])->name('charges.destroy');
    });

    Route::get('consultation', [DispoController::class, 'consultation'])
        ->middleware('role:admin')
        ->name('consultation');
    Route::get('consultation/notifications', [DispoController::class, 'notificationsAdmin'])
        ->middleware('role:admin')
        ->name('consultation.notifications');

    Route::prefix('api/dispos')->middleware('role:admin')->group(function () {
        Route::get('etat', [PriseController::class, 'etat'])->name('dispos.etat');
        Route::post('prises', [PriseController::class, 'store'])->name('prises.store');
        Route::delete('prises/{prise}', [PriseController::class, 'destroy'])->name('prises.detruire');
    });
});
