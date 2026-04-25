<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ElectionController;
use App\Http\Controllers\CandidatureController;
use App\Http\Controllers\VoteController;
use App\Http\Controllers\ResultatController;
use App\Http\Controllers\DepouillementController;

// Routes du module élections

Route::middleware(['auth', 'verified'])->group(function () {

    
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
Route::post('/elections/{election}/cloturer', [ElectionController::class, 'cloturer'])
    ->name('elections.cloturer');
Route::post('/elections/{election}/cloturer-candidatures', [ElectionController::class, 'cloturerCandidatures'])
    ->name('elections.cloturerCandidatures');
Route::get('/elections/{election}/second-tour', [ElectionController::class, 'secondTourForm'])
    ->name('elections.secondTour.form');
Route::post('/elections/{election}/second-tour', [ElectionController::class, 'secondTourStore'])
    ->name('elections.secondTour.store');

Route::get('/elections/{election}/admin', [ElectionController::class, 'admin'])
    ->name('elections.admin');

/////////////////////////////////////GESTION DES CANDIDATURES///////////////////////////////////
Route::resource('candidatures', CandidatureController::class);
Route::post('/candidatures/{candidature}/valider', [CandidatureController::class, 'valider'])
    ->name('candidatures.valider');
Route::post('/candidatures/{candidature}/refuser', [CandidatureController::class, 'refuser'])
    ->name('candidatures.refuser');

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
    ->name('depouillement.show');
Route::post('/depouillement/{election}', [DepouillementController::class, 'depouiller'])
    ->name('depouillement.depouiller');

Route::post('/depouillement/{election}/publier', [DepouillementController::class, 'publier'])
    ->name('depouillement.publier');
});
