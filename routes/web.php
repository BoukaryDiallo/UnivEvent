<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use App\Http\Controllers\EtudiantController;
use App\Http\Controllers\ElectionController;
use App\Http\Controllers\CirconscriptionController;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});
///////////////////////////////ROUTES POUR ELECTIONS//////////////////////////////////////////////////////

Route::get('/', function () {
    return view('pages.elections.home');
});

Route::get('/create_election', function () {
    return view('pages.elections.create');
});

/////////////////////////////////////ROUTES POUR VOTE////////////////////////////////

// crer un nouvel vote
Route::get('/create_vote', function () {
    return view('pages.votes.create');
})->name('create.vote');

/////////////////////////////////////ROUTES POUR CANDIDATURE////////////////////////////////

// Creer un candidat
Route::get('/create_candidature', function () {
    return view('pages.candidatures.create');
})->name('create.candidature');

// voir les details d'un candidat
Route::get('/detail_candidature', function () {
    return view('pages.candidatures.programme');
})->name('detail.candidature');

// voir la liste des candidats inscrits
Route::get('/list_candidature', function () {
    return view('pages.candidatures.list');
})->name('list.candidature');

/////////////////////////////////////ROUTES POUR ADMIN////////////////////////////////

// valider ou confirmer une candidature
Route::get('/traiter_candidature', function () {
    return view('pages.admin.traiter_candidature');
})->name('traiter.candidature');

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

/////////////////////////////////////GESTION DES ETUDIANTS///////////////////////////////////
Route::resource('circonscriptions', CirconscriptionController::class);



require __DIR__.'/settings.php';
