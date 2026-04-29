<?php

use App\Http\Controllers\AdhesionController;
use App\Http\Controllers\ActiviteController;
use App\Http\Controllers\ClubController;
use App\Http\Controllers\DemandeBudgetController;
use App\Http\Controllers\DemandeLocalController;
use App\Http\Controllers\NotificationClubController;
use App\Http\Controllers\ForumController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    // Clubs
    Route::resource('clubs', ClubController::class);

    // Adhésions
    Route::post('clubs/{club}/adherer', [AdhesionController::class, 'store'])->name('clubs.adherer');
    Route::delete('clubs/{club}/quitter', [AdhesionController::class, 'destroy'])->name('clubs.quitter');
    Route::put('adhesions/{adhesion}/valider', [AdhesionController::class, 'valider'])->name('adhesions.valider');
    Route::put('adhesions/{adhesion}/rejeter', [AdhesionController::class, 'reject'])->name('adhesions.rejeter');
    Route::put('adhesions/{adhesion}', [AdhesionController::class, 'update'])->name('adhesions.update');

    // Activités
    Route::get('activites/create', [ActiviteController::class, 'create'])->name('activites.create');
    Route::resource('activites', ActiviteController::class)->except(['create']);
    Route::put('activites/{activite}/publier', [ActiviteController::class, 'publish'])->name('activites.publier');
    Route::put('activites/{activite}/annuler', [ActiviteController::class, 'cancel'])->name('activites.annuler');

    // Demandes de local
    Route::resource('demandes-local', DemandeLocalController::class);
    Route::get('clubs/{club}/demandes-local/create', [DemandeLocalController::class, 'create'])->name('clubs.demandes-local.create');
    Route::post('clubs/{club}/demandes/local', [DemandeLocalController::class, 'store'])->name('clubs.demandes.local');
    Route::put('demandes-local/{demande}/valider', [DemandeLocalController::class, 'valider'])->name('demandes-local.valider');
    Route::put('demandes-local/{demande}/rejeter', [DemandeLocalController::class, 'reject'])->name('demandes-local.rejeter');

    // Demandes de budget
    Route::resource('demandes-budget', DemandeBudgetController::class);
    Route::get('clubs/{club}/demandes-budget/create', [DemandeBudgetController::class, 'create'])->name('clubs.demandes-budget.create');
    Route::post('clubs/{club}/demandes/budget', [DemandeBudgetController::class, 'store'])->name('clubs.demandes.budget');
    Route::put('demandes-budget/{demande}/valider', [DemandeBudgetController::class, 'valider'])->name('demandes-budget.valider');
    Route::put('demandes-budget/{demande}/rejeter', [DemandeBudgetController::class, 'reject'])->name('demandes-budget.rejeter');

    // Notifications
    Route::get('notifications', [NotificationClubController::class, 'index'])->name('notifications.index');
    Route::put('notifications/{notification}/lire', [NotificationClubController::class, 'markAsRead'])->name('notifications.lire');
    Route::put('notifications/tout-lire', [NotificationClubController::class, 'markAllAsRead'])->name('notifications.tout-lire');

    // Administration
    Route::middleware(['role:admin'])->group(function () {
        Route::get('admin/clubs/en-attente', [ClubController::class, 'enAttente'])->name('admin.clubs.en-attente');
        Route::put('admin/clubs/{club}/valider', [ClubController::class, 'valider'])->name('admin.clubs.valider');
        Route::put('admin/clubs/{club}/rejeter', [ClubController::class, 'rejeter'])->name('admin.clubs.rejeter');
        Route::put('admin/clubs/{club}/suspendre', [ClubController::class, 'suspendre'])->name('admin.clubs.suspendre');
        Route::put('admin/clubs/{club}/dissoudre', [ClubController::class, 'dissoudre'])->name('admin.clubs.dissoudre');
        Route::put('admin/clubs/{club}/reactiver', [ClubController::class, 'reactiver'])->name('admin.clubs.reactiver');
    });

    // Transfer responsibility
    Route::put('clubs/{club}/transferer-responsabilite', [ClubController::class, 'transfererResponsabilite'])->name('clubs.transferer-responsabilite');

    // Forum
    Route::post('clubs/{club}/forum', [ForumController::class, 'store'])->name('forum.store');
    Route::delete('forum/{message}', [ForumController::class, 'destroy'])->name('forum.destroy');
});
