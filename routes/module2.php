<?php

use App\Http\Controllers\CreneauController;
use App\Http\Controllers\EmploiDuTempsController;
use App\Http\Controllers\MatiereController;
use App\Http\Controllers\NiveauController;
use App\Http\Controllers\SalleController;
use Illuminate\Support\Facades\Route;


//  emploi du temps + seances
Route::middleware(['auth', 'verified'])->prefix('emploie-du-temps')->name('emploie-du-temps.')->group(function () {

  
   Route::middleware('role:admin')->group(function () {
        Route::get('/', [EmploiDuTempsController::class, 'adminVue'])->name('admin.index');
        Route::post('/ajouter', [EmploiDuTempsController::class, 'creerEmploiDuTemps'])->name('ajouter');
        Route::delete('/{id}/supprimer', [EmploiDuTempsController::class, 'supprimerEdt'])->name('supprimer');
        Route::put('/{id}/modifier', [EmploiDuTempsController::class, 'modifierEdt'])->name('modifier');
        Route::post('{id}/ajouter-seance', [EmploiDuTempsController::class, 'ajouterSeance'])->name('ajouter-seance');
        Route::put('{id}/modifier-seance', [EmploiDuTempsController::class, 'modifierSeance'])->name('modifier-seance');
        Route::delete('{id}/supprimer-seance', [EmploiDuTempsController::class, 'supprimerSeance'])->name('supprmier-seance');
        Route::post('{id}/publier', [EmploiDuTempsController::class, 'publierEdt'])->name('publier');
        Route::get('/{id}/vue-admin', [EmploiDuTempsController::class, 'adminSeanceEdt'])->name('vue');
        Route::post('{id}/envoyer-email', [EmploiDuTempsController::class, 'envoyerEdtParEmail'])->name('admin.envoyer-email');
        Route::post('/{id}/liberer-enseignant', [EmploiDuTempsController::class, 'libererEnseignant'])->name('seances.liberer-enseignant');
    });

    Route::middleware('role:enseignant')->group(function () {
        Route::get('/edt-enseignant', [EmploiDuTempsController::class, 'enseignantSeance'])->name('enseignant.edt-enseignant');
        Route::get('{id}/pdf-enseignant', [EmploiDuTempsController::class, 'edtEnseignantPdf'])->name('pdf');
    });

    Route::middleware('role:etudiant')->group(function () {
        Route::get('/edt-etudiant', [EmploiDuTempsController::class, 'etudiantSeance'])->name('edt-etudiant');
        Route::get('/{id}/vue', [EmploiDuTempsController::class, 'etudiantSeanceEdt'])->name('vue');
    });

    Route::get('{id}/pdf', [EmploiDuTempsController::class, 'telechargerPdf'])->name('pdf');
});


// Les salle
Route::middleware(['auth', 'verified'])->prefix('salles')->name('salles.')->group(function () {

    Route::middleware('role:admin')->group(function () {
        Route::post('/ajouter', [SalleController::class, 'ajouterSalle'])->name('ajouter');
        Route::get('/listes', [SalleController::class, 'vueSalle'])->name('listes');
        Route::put('/{id}/modifier', [SalleController::class, 'modifierSalle'])->name('modifier');
        Route::delete('/{id}/supprimer', [SalleController::class, 'supprimerSalle'])->name('supprimer');
        
    });

    
});


// Les cours
Route::middleware(['auth', 'verified'])->prefix('matieres')->name('matieres.')->group(function () {

    Route::middleware('role:admin')->group(function () {
        Route::post('/ajouter', [MatiereController::class, 'ajouterMatiere'])->name('ajouter');
        Route::get('/listes', [MatiereController::class, 'vueMatiere'])->name('listes');
        Route::put('/{id}/modifier', [MatiereController::class, 'modifierMatiere'])->name('modifier');
        Route::delete('/{id}/supprimer', [MatiereController::class, 'supprimerMatiere'])->name('supprimer');
    });
});


// Les niveau etude
Route::middleware(['auth', 'verified'])->prefix('niveaux')->name('niveaux.')->group(function () {

    Route::middleware('role:admin')->group(function () {
        Route::post('/ajouter', [NiveauController::class, 'ajouterNiveauEtude'])->name('ajouter');
        Route::get('/listes', [NiveauController::class, 'vueNiveau'])->name('listes');
        Route::put('/{id}/modifier', [NiveauController::class, 'modifierNiveau'])->name('modifier');
        Route::delete('/{id}/supprimer', [NiveauController::class, 'supprimerNiveau'])->name('supprimer');
    });
});



// 
// Les creneaux
Route::middleware(['auth', 'verified'])->prefix('creneaux')->name('creneaux.')->group(function () {

    Route::middleware('role:admin')->group(function () {
        Route::post('/ajouter', [CreneauController::class, 'ajouterCreneau'])->name('ajouter');
        Route::get('/listes', [CreneauController::class, 'vueCreneau'])->name('listes');
        Route::put('/{id}/modifier', [CreneauController::class, 'modifierCreneau'])->name('modifier');
        Route::delete('/{id}/supprimer', [CreneauController::class, 'supprimerCreneau'])->name('supprimer');
        
    });

    
});
