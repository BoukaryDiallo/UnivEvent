<?php

use App\Http\Controllers\DepartementController;
use App\Http\Controllers\EtudiantController;
use App\Http\Controllers\FiliereController;
use App\Http\Controllers\UfrController;
use Illuminate\Support\Facades\Route;

// Routes pour la structure académique (accessibles uniquement aux admins)
Route::middleware(['auth', 'role:admin'])->group(function () {

    // Routes UFR
    Route::get('/ufr', [UfrController::class, 'index'])->name('ufr.index');
    Route::get('/ufr/create', [UfrController::class, 'create'])->name('ufr.create');
    Route::post('/ufr', [UfrController::class, 'store'])->name('ufr.store');
    Route::get('/ufr/{ufr}/edit', [UfrController::class, 'edit'])->name('ufr.edit');
    Route::put('/ufr/{ufr}', [UfrController::class, 'update'])->name('ufr.update');
    Route::delete('/ufr/{ufr}', [UfrController::class, 'destroy'])->name('ufr.destroy');

    // Routes Départements
    Route::get('/departement', [DepartementController::class, 'index'])->name('departement.index');
    Route::get('/departement/create', [DepartementController::class, 'create'])->name('departement.create');
    Route::post('/departement', [DepartementController::class, 'store'])->name('departement.store');
    Route::get('/departement/{departement}/edit', [DepartementController::class, 'edit'])->name('departement.edit');
    Route::put('/departement/{departement}', [DepartementController::class, 'update'])->name('departement.update');
    Route::delete('/departement/{departement}', [DepartementController::class, 'destroy'])->name('departement.destroy');

    // Routes Filières
    Route::get('/filiere', [FiliereController::class, 'index'])->name('filiere.index');
    Route::get('/filiere/create', [FiliereController::class, 'create'])->name('filiere.create');
    Route::post('/filiere', [FiliereController::class, 'store'])->name('filiere.store');
    Route::get('/filiere/{filiere}/edit', [FiliereController::class, 'edit'])->name('filiere.edit');
    Route::put('/filiere/{filiere}', [FiliereController::class, 'update'])->name('filiere.update');
    Route::delete('/filiere/{filiere}', [FiliereController::class, 'destroy'])->name('filiere.destroy');

    // Routes Étudiants
    Route::get('/etudiants', [EtudiantController::class, 'index'])->name('etudiants.index');
    Route::get('/etudiants/create', [EtudiantController::class, 'create'])->name('etudiants.create');
    Route::post('/etudiants', [EtudiantController::class, 'store'])->name('etudiants.store');
    Route::get('/etudiants/{etudiant}/edit', [EtudiantController::class, 'edit'])->name('etudiants.edit');
    Route::put('/etudiants/{etudiant}', [EtudiantController::class, 'update'])->name('etudiants.update');
    Route::delete('/etudiants/{etudiant}', [EtudiantController::class, 'destroy'])->name('etudiants.destroy');
});
