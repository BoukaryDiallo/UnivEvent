<?php

use App\Http\Controllers\UserController;
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
use App\Http\Controllers\ResultatController;

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
Route::get('/elections/{election}/liste-electorale', [ElectionController::class, 'voirListeElectorale'])
    ->name('elections.listeElectorale');

Route::get('/elections/{election}/ouvrir',
    [ElectionController::class, 'ouvrir'])
    ->name('elections.ouvrir');
Route::get('/elections/{election}/cloturer', [ElectionController::class, 'cloturer'])
    ->name('elections.cloturer');

Route::get('/elections/{election}/admin', [ElectionController::class, 'admin'])
    ->name('elections.admin');


/////////////////////////////////////GESTION DES CANDIDATURES///////////////////////////////////
Route::resource('candidatures', CandidatureController::class);

/////////////////////////////////////GESTION DES VOTES///////////////////////////////////

Route::get('/votes/participer', [VoteController::class, 'electionsOuvertes'])
    ->name('votes.elections');

Route::get('/votes/candidats/{election}', [VoteController::class, 'candidats'])
    ->name('votes.candidats');

Route::get('/votes/candidat/{candidature}', [VoteController::class, 'showCandidat'])
    ->name('votes.candidat.show');

Route::post('/votes/enregistrer', [VoteController::class, 'store'])
    ->name('votes.store');

// Routes de consultation des votes (LECTURE SEULE - pas de modification/suppression possible)
Route::get('/votes', [VoteController::class, 'index'])
    ->name('votes.index')
    ->middleware('auth');

Route::get('/votes/{vote}', [VoteController::class, 'show'])
    ->name('votes.show')
    ->middleware('auth');

// LIVE routes (duplicate removed)
Route::get('/votes/live', [VoteController::class, 'liveIndex'])
    ->name('votes.live.index');

Route::get('/votes/live/{election}', [VoteController::class, 'liveShow'])
    ->name('votes.live.show');
Route::get('/votes/live', [VoteController::class, 'liveIndex'])
    ->name('votes.live.index');

Route::get('/votes/live/{election}', [VoteController::class, 'liveShow'])
    ->name('votes.live.show');

Route::get('/resultats', [ResultatController::class, 'index'])
    ->name('resultats.index');

Route::get('/resultats/{election}', [ResultatController::class, 'show'])
    ->name('resultats.show');

Route::get('/depouillement/{election}', [DepouillementController::class, 'depouiller'])
    ->name('depouillement.depouiller');

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

require __DIR__.'/settings.php'; 
