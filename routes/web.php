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
use App\Http\Controllers\DepouillementController;

Route::get('/', function () {
    return view('pages.admin.dashboard');
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
Route::get('/elections/{election}/prepare',
    [ElectionController::class, 'prepare'])
    ->name('elections.prepare');

Route::post('/elections/{election}/generer-liste',
    [ElectionController::class, 'genererListe'])
    ->name('elections.genererListe');
Route::get('/elections/{election}/generer-liste', [ElectionController::class, 'formGenererListe'])
    ->name('elections.genererListe.form');

Route::get('/elections/{election}/ouvrir',
    [ElectionController::class, 'ouvrir'])
    ->name('elections.ouvrir');
Route::get('/elections/{election}/cloturer', [ElectionController::class, 'cloturer'])
    ->name('elections.cloturer');


/////////////////////////////////////GESTION DES CANDIDATURES///////////////////////////////////
Route::resource('candidatures', CandidatureController::class);

/////////////////////////////////////GESTION DES VOTES///////////////////////////////////


// Liste des élections ouvertes
Route::get('/votes/participer', [VoteController::class, 'electionsOuvertes'])
    ->name('votes.elections');

// Liste des candidats d'une élection
Route::get('/votes/{election}/candidats', [VoteController::class, 'candidats'])
    ->name('votes.candidats');

// Détail d'un candidat
Route::get('/votes/candidat/{candidature}', [VoteController::class, 'showCandidat'])
    ->name('votes.candidat');

// Enregistrement du vote
Route::post('/votes/store', [VoteController::class, 'store'])
    ->name('votes.store');

Route::resource('votes', VoteController::class);

Route::get('/elections/{election}/depouillement', [DepouillementController::class, 'depouiller'])
    ->name('depouillement.depouiller');

// Route::resource('resultats', ResultatController::class);



/////////////////////////////////////GESTION DES UFR///////////////////////////////////
Route::resource('ufr', UfrController::class);

/////////////////////////////////////GESTION DES DEPARTEMENTS///////////////////////////////////
Route::resource('departement', DepartementController::class);

/////////////////////////////////////GESTION DES FILIERES///////////////////////////////////
Route::resource('filiere', FiliereController::class);
Route::get('departements/by-ufr/{ufr_id}', [FiliereController::class, 'getDepartementsByUfr']);

require __DIR__.'/settings.php';
