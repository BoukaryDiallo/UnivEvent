<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ElectionController;
use App\Http\Controllers\CandidatureController;
use App\Http\Controllers\VoteController;
use App\Http\Controllers\ResultatController;
use App\Http\Controllers\DepouillementController;

// Routes du module élections

Route::middleware(['auth', 'verified'])->group(function () {

        
    Route::resource('elections', 
    ElectionController::class)
    ->middleware('role:admin');

    Route::get('/elections/{election}/prepare',
        [ElectionController::class, 'prepare'])
        ->name('elections.prepare')
        ->middleware('role:admin');

    Route::post('/elections/{election}/generer-liste',
        [ElectionController::class, 'genererListe'])
        ->name('elections.genererListe')
        ->middleware('role:admin');

    Route::get('/elections/{election}/generer-liste', [ElectionController::class, 'formGenererListe'])
        ->name('elections.genererListe.form')
        ->middleware('role:admin');

    Route::get('/elections/{election}/liste-electorale', [ElectionController::class, 'voirListeElectorale'])
        ->name('elections.listeElectorale')
        ->middleware('role:admin');

    Route::get('/elections/{election}/ouvrir',
        [ElectionController::class, 'ouvrir'])
        ->name('elections.ouvrir')
        ->middleware('role:admin');

    Route::post('/elections/{election}/cloturer', [ElectionController::class, 'cloturer'])
        ->name('elections.cloturer')
        ->middleware('role:admin');

    Route::post('/elections/{election}/cloturer-candidatures', [ElectionController::class, 'cloturerCandidatures'])
        ->name('elections.cloturerCandidatures')
        ->middleware('role:admin');

    Route::get('/elections/{election}/second-tour', [ElectionController::class, 'secondTourForm'])
        ->name('elections.secondTour.form')
        ->middleware('role:admin');
        
    Route::post('/elections/{election}/second-tour', [ElectionController::class, 'secondTourStore'])
        ->name('elections.secondTour.store')
        ->middleware('role:admin');

    Route::get('/elections/{election}/admin', [ElectionController::class, 'admin'])
        ->name('elections.admin')
        ->middleware('role:admin');

    /////////////////////////////////////GESTION DES CANDIDATURES///////////////////////////////////
    Route::resource('candidatures', CandidatureController::class);

    Route::post('/candidatures/{candidature}/valider', [CandidatureController::class, 'valider'])
        ->name('candidatures.valider')
        ->middleware('role:admin');

    Route::post('/candidatures/{candidature}/refuser', [CandidatureController::class, 'refuser'])
        ->name('candidatures.refuser')
        ->middleware('role:admin');

    /////////////////////////////////////GESTION DES VOTES///////////////////////////////////

    Route::get('/votes/participer', [VoteController::class, 'electionsOuvertes'])
        ->name('votes.elections');

    Route::get('/votes/candidats/{election}', [VoteController::class, 'candidats'])
        ->name('votes.candidats');

    Route::get('/votes/candidat/{candidature}', [VoteController::class, 'showCandidat'])
        ->name('votes.candidat.show');

    Route::post('/votes/enregistrer', [VoteController::class, 'store'])
        ->name('votes.store');

    // Routes de consultation des votes 
    Route::get('/votes', [VoteController::class, 'index'])
        ->name('votes.index')
        ->middleware('auth')
        ->middleware('role:admin');

    Route::get('/votes/{vote}', [VoteController::class, 'show'])
        ->name('votes.show')
        ->middleware('auth');


    Route::get('/votes/live', [VoteController::class, 'liveIndex'])
        ->name('votes.live.index')
        ->middleware('role:admin');

    Route::get('/votes/live/{election}', [VoteController::class, 'liveShow'])
        ->name('votes.live.show')
        ->middleware('role:admin');

    Route::get('/votes/live', [VoteController::class, 'liveIndex'])
        ->name('votes.live.index')
        ->middleware('role:admin');

    Route::get('/votes/live/{election}', [VoteController::class, 'liveShow'])
        ->name('votes.live.show')
        ->middleware('role:admin');

    Route::get('/resultats', [ResultatController::class, 'index'])
        ->name('resultats.index');

    Route::get('/resultats/{election}', [ResultatController::class, 'show'])
        ->name('resultats.show');

    Route::get('/depouillement/{election}', [DepouillementController::class, 'depouiller'])
        ->name('depouillement.show')
        ->middleware('role:admin');

    Route::post('/depouillement/{election}', [DepouillementController::class, 'depouiller'])
        ->name('depouillement.depouiller')
        ->middleware('role:admin');

    Route::post('/depouillement/{election}/publier', [DepouillementController::class, 'publier'])
        ->name('depouillement.publier')
        ->middleware('role:admin');
    });
