<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use App\Http\Controllers\EtudiantController;
use App\Http\Controllers\ElectionController;
use App\Http\Controllers\CirconscriptionController;
use App\Http\Controllers\CandidatureController;
use App\Http\Controllers\VoteController;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});
///////////////////////////////ROUTES POUR ELECTIONS//////////////////////////////////////////////////////

Route::get('/', function () {
    return view('pages.home');
});


/////////////////////////////////////GESTION DES UTILISATEUR///////////////////////////////////

// Creation d un compte user
Route::get('/create_user', function () {
    return view('pages.admin.create_user');
})->name('create.user');

/////////////////////////////////////GESTION DES ETUDIANTS///////////////////////////////////
// Liste
Route::get('/list_etudiant', [EtudiantController::class, 'list'])->name('admin.list.etudiant');

// Création
Route::get('/create_etudiant', [EtudiantController::class, 'create'])->name('admin.create.etudiant');
Route::post('/create_etudiant', [EtudiantController::class, 'store'])->name('admin.post_create.etudiant');

// Modification
Route::get('/modifier_etudiant/{id}', [EtudiantController::class, 'edit'])->name('admin.modifier.etudiant');
Route::post('/modifier_etudiant/{id}', [EtudiantController::class, 'update'])->name('admin.post_modifier.etudiant');

// Suppression
Route::delete('/supprimer_etudiant/{id}', [EtudiantController::class, 'delete'])->name('admin.delete.etudiant');


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

Route::get('/resultats', [ResultatController::class, 'index'])
    ->name('resultats.index');

Route::get('/resultats/{id}', [ResultatController::class, 'show'])
    ->name('resultats.show');

require __DIR__.'/settings.php';
