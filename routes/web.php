<?php

use App\Http\Controllers\UserController;
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
    Route::resource('ufr', UfrController::class);
});


/////////////////////////////////////GESTION DES ETUDIANTS///////////////////////////////////
Route::resource('etudiants', EtudiantController::class);


/////////////////////////////////////GESTION DES ÉLECTIONS///////////////////////////////////
Route::get('/espace-elections', [ResultatController::class, 'espaceElections'])->name('elections.workflow');


/////////////////////////////////////GESTION DES RÉSULTATS///////////////////////////////////
// Ces routes sont gérées dans elections.php pour éviter les doublons

/////////////////////////////////////GESTION DES UFR///////////////////////////////////
Route::resource('ufr', UfrController::class);

/////////////////////////////////////GESTION DES DEPARTEMENTS///////////////////////////////////
Route::resource('departement', DepartementController::class);

/////////////////////////////////////GESTION DES FILIERES///////////////////////////////////
Route::resource('filiere', FiliereController::class);
Route::get('departements/by-ufr/{ufr_id}', [FiliereController::class, 'getDepartementsByUfr']);

Route::middleware(['auth', 'verified'])
    ->middleware('role:admin')
    ->group(function () {
        Route::get('roles', [UserController::class, 'index'])->name('roles');
    });
require __DIR__.'/elections.php'; 
require __DIR__.'/settings.php'; 

