<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ElectionController;
use App\Http\Controllers\CandidatureController;
use App\Http\Controllers\VoteController;
use App\Http\Controllers\ResultatController;
use App\Http\Controllers\DepouillementController;

// Routes du module élections

Route::middleware(['auth', 'verified'])->group(function () {

    // Élections (CRUD + admin)
    Route::resource('elections', ElectionController::class);

    // Page admin d’une élection
    Route::get('/elections/{election}/admin', [ElectionController::class, 'admin'])
        ->name('elections.admin');

    // Préparation d’une élection
    Route::get('/elections/{election}/prepare', [ElectionController::class, 'prepare'])
        ->name('elections.prepare');

    // Formulaire génération liste électorale
    Route::get('/elections/{election}/generer-liste', [ElectionController::class, 'formGenererListe'])
        ->name('elections.genererListe.form');

    // Génération liste électorale
    Route::post('/elections/{election}/generer-liste', [ElectionController::class, 'genererListe'])
        ->name('elections.genererListe');

    // Voir liste électorale
    Route::get('/elections/{election}/liste-electorale', [ElectionController::class, 'voirListeElectorale'])
        ->name('elections.listeElectorale');

    // Ouvrir une élection
    Route::get('/elections/{election}/ouvrir', [ElectionController::class, 'ouvrir'])
        ->name('elections.ouvrir');

    // Clôturer une élection
    Route::post('/elections/{election}/cloturer', [ElectionController::class, 'cloturer'])
        ->name('elections.cloturer');

    // Candidatures
    Route::resource('candidatures', CandidatureController::class);

    // Liste des élections pour voter
    Route::get('/votes/participer', [VoteController::class, 'electionsOuvertes'])
        ->name('votes.elections');

    // Liste des candidats
    Route::get('/votes/candidats/{election}', [VoteController::class, 'candidats'])
        ->name('votes.candidats');

    // Voir un candidat
    Route::get('/votes/candidat/{candidature}', [VoteController::class, 'showCandidat'])
        ->name('votes.candidat.show');

    // Enregistrer un vote
    Route::post('/votes/enregistrer', [VoteController::class, 'store'])
        ->name('votes.store');

    // Liste live des votes
    Route::get('/votes/live', [VoteController::class, 'liveIndex'])
        ->name('votes.live.index');

    // Résultat live d’une élection
    Route::get('/votes/live/{election}', [VoteController::class, 'liveShow'])
        ->name('votes.live.show');

    // Liste des résultats
    Route::get('/resultats', [ResultatController::class, 'index'])
        ->name('resultats.index');

    // Détail d’un résultat
    Route::get('/resultats/{election}', [ResultatController::class, 'show'])
        ->name('resultats.show');

    // Dépouillement (GET/POST)
    Route::match(['get', 'post'], '/depouillement/{election}', [DepouillementController::class, 'depouiller'])
        ->name('depouillement.depouiller');
});
