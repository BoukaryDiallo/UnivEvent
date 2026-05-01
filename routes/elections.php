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

    Route::get('/elections/{election}/second-tour-form', [ElectionController::class, 'secondTourForm'])
        ->name('elections.secondTour.form')
        ->middleware('role:admin');
        
    Route::post('/elections/{election}/second-tour', [ElectionController::class, 'secondTourStore'])
        ->name('elections.secondTour.store')
        ->middleware('role:admin');

    Route::post('/resultats/{election}/publier-provisoire', [ResultatController::class, 'publierProvisoire'])
        ->name('resultats.publierProvisoire')
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

    // Route pour candidater depuis une élection spécifique
    Route::get('/candidatures/create/{election}', [CandidatureController::class, 'createForElection'])
        ->name('candidatures.create.election');
        
    // Route create classique pour admin uniquement
    Route::get('/candidatures/create', [CandidatureController::class, 'create'])
        ->name('candidatures.create')
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

    /////////////////////////////////////GESTION DES RÉSULTATS///////////////////////////////////
    
    // Routes de consultation des résultats (frontend)
    Route::get('/resultats', [ResultatController::class, 'index'])
        ->name('resultats.index');

    Route::get('/resultats/{election}', [ResultatController::class, 'show'])
        ->name('resultats.show');

    // Routes de gestion des résultats (admin)
    Route::get('/resultats/{election}/preview', [ResultatController::class, 'preview'])
        ->name('resultats.preview')
        ->middleware('role:admin');

    Route::post('/resultats/{election}/publier', [ResultatController::class, 'publier'])
        ->name('resultats.publier')
        ->middleware('role:admin');

    /////////////////////////////////////GESTION DU DÉPOUILLEMENT///////////////////////////////////
    
    // Routes de calcul du dépouillement (admin)
    Route::post('/depouillement/{election}/calculer', [DepouillementController::class, 'calculer'])
        ->name('depouillement.calculer')
        ->middleware('role:admin');

    Route::get('/depouillement/{election}/results', [DepouillementController::class, 'showResults'])
        ->name('depouillement.results')
        ->middleware('role:admin');

    // Route de vérification de l'état du dépouillement (admin)
    Route::get('/depouillement/{election}/etat', [DepouillementController::class, 'etat'])
        ->name('depouillement.etat')
        ->middleware('role:admin');
    });
