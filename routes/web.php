<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use App\Http\Controllers\EtudiantController;
use App\Http\Controllers\ElectionController;
use App\Http\Controllers\CirconscriptionController;
use App\Http\Controllers\CandidatureController;
use App\Http\Controllers\VoteController;
use App\Http\Controllers\UfrController;
use App\Http\Controllers\DepartementController;
use App\Http\Controllers\FiliereController;

Route::get('/', function () {
    return view('pages.home');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});
///////////////////////////////ROUTES POUR ELECTIONS//////////////////////////////////////////////////////



/////////////////////////////////////GESTION DES UTILISATEUR///////////////////////////////////

// Creation d un compte user
Route::get('/create_user', function () {
    return view('pages.admin.create_user');
})->name('create.user');

/////////////////////////////////////GESTION DES ETUDIANTS///////////////////////////////////
Route::resource('etudiants', EtudiantController::class);


/////////////////////////////////////GESTION DES ETUDIANTS///////////////////////////////////
Route::resource('elections', ElectionController::class);
Route::get('/elections/{id}/ouvrir', [ElectionController::class, 'ouvrir']);
Route::get('/elections/{id}/cloturer', [ElectionController::class, 'cloturer']);
Route::post('/elections/{id}/generer-liste', [ElectionController::class, 'genererListeElectorale'])
     ->name('elections.generer-liste');

/////////////////////////////////////GESTION DES CANDIDATURES///////////////////////////////////
Route::resource('candidatures', CandidatureController::class);

/////////////////////////////////////GESTION DES VOTES///////////////////////////////////
Route::resource('votes', VoteController::class);

// Route::get('/resultats', [ResultatController::class, 'index'])
    // ->name('resultats.index');
//
// Route::get('/resultats/{id}', [ResultatController::class, 'show'])
    // ->name('resultats.show');

/////////////////////////////////////GESTION DES UFR///////////////////////////////////
Route::resource('ufr', UfrController::class);

/////////////////////////////////////GESTION DES DEPARTEMENTS///////////////////////////////////
Route::resource('departement', DepartementController::class);

/////////////////////////////////////GESTION DES FILIERES///////////////////////////////////
Route::resource('filiere', FiliereController::class);
Route::get('departements/by-ufr/{ufr_id}', [FiliereController::class, 'getDepartementsByUfr']);

require __DIR__.'/settings.php';
