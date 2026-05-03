<?php

use App\Http\Controllers\CertificatController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EventAccessController;
use App\Http\Controllers\EventAdminController;
use App\Http\Controllers\EventMessageController;
use App\Http\Controllers\EventModerationController;
use App\Http\Controllers\EventNotificationController;
use App\Http\Controllers\EvenementCommentController;
use App\Http\Controllers\EvenementController;
use App\Http\Controllers\EvenementMediaController;
use App\Http\Controllers\InscriptionEvenementController;
use App\Http\Controllers\JuryController;
use App\Http\Controllers\NotificationCenterController;
use App\Http\Controllers\ProgrammeController;
use App\Http\Controllers\ResultatController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

    Route::get('acces/{token}', [EventAccessController::class, 'scan'])
        ->name('acces.scan');

    Route::middleware(['auth', 'verified'])->post('acces/{token}/check-in', [EventAccessController::class, 'checkIn'])
        ->name('acces.checkIn');

    Route::middleware(['auth', 'verified'])->group(function () {
        Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
        Route::get('notifications', [NotificationCenterController::class, 'index'])->name('notifications.index');

    Route::middleware('role:admin')->group(function () {
        Route::get('roles', [UserController::class, 'index'])->name('roles');
        Route::get('admin/events/pending', [EventAdminController::class, 'pendingEvents'])->name('admin.events.pending');
        Route::post('admin/events/{evenement}/approve', [EventAdminController::class, 'approve'])->name('admin.events.approve');
        Route::post('admin/events/{evenement}/reject', [EventAdminController::class, 'reject'])->name('admin.events.reject');
    });

    Route::get('evenements/gestion', [EvenementController::class, 'gestion'])->name('evenements.gestion');
    Route::get('evenements/gestion/conferences', [EvenementController::class, 'gestionConferences'])->name('evenements.gestion.conferences');
    Route::get('evenements/gestion/concours', [EvenementController::class, 'gestionConcours'])->name('evenements.gestion.concours');
    Route::get('evenements/create/concours', [EvenementController::class, 'createConcours'])->name('evenements.create.concours');
    Route::get('evenements/create/conference', [EvenementController::class, 'createConference'])->name('evenements.create.conference');
    Route::get('evenements/{evenement}/manage', [EvenementController::class, 'manage'])->name('evenements.manage');
    Route::get('evenements/{evenement}/edit', [EvenementController::class, 'edit'])->name('evenements.edit');
    Route::get('evenements/{evenement}', [EvenementController::class, 'show'])->name('evenements.show');
    Route::resource('evenements', EvenementController::class)->except(['show', 'edit']);
    Route::get('evenements/{evenement}/participant', [\App\Http\Controllers\ParticipantController::class, 'show'])
        ->name('evenements.participant.show');
    Route::get('evenements/{evenement}/participant/certificate', [\App\Http\Controllers\ParticipantController::class, 'downloadCertificate'])
        ->name('evenements.participant.certificate.download');
    Route::post('evenements/{evenement}/publier', [EvenementController::class, 'publier'])
        ->name('evenements.publier');
    Route::post('evenements/{evenement}/archiver', [EvenementController::class, 'archiver'])
        ->name('evenements.archiver');
    Route::patch('evenements/{evenement}/manage/{section}', [EvenementController::class, 'saveSection'])->name('evenements.saveSection');
    Route::post('evenements/{evenement}/submit-validation', [EvenementController::class, 'submitForValidation'])->name('evenements.submitValidation');
    Route::post('evenements/{evenement}/approve', [EvenementController::class, 'approve'])->name('evenements.approve');
    Route::post('evenements/{evenement}/reject', [EvenementController::class, 'reject'])->name('evenements.reject');
    Route::post('evenements/{evenement}/reset-pending', [EvenementController::class, 'resetToPending'])->name('evenements.resetPending');
    Route::post('evenements/{evenement}/assign-user', [EvenementController::class, 'assignUser'])->name('evenements.assignUser');
    Route::delete('evenements/{evenement}/assignments/{user}', [EvenementController::class, 'removeUser'])->name('evenements.removeUser');
    Route::patch('evenements/{evenement}/permissions', [EvenementController::class, 'updatePermissions'])->name('evenements.updatePermissions');
    Route::post('evenements/{evenement}/program', [EvenementController::class, 'addProgram'])->name('evenements.addProgram');
    Route::patch('evenements/{evenement}/program/{programme}', [EvenementController::class, 'updateProgram'])->name('evenements.updateProgram');
    Route::delete('evenements/{evenement}/program/{programme}', [EvenementController::class, 'deleteProgram'])->name('evenements.deleteProgram');
    Route::patch('evenements/{evenement}/program/reorder', [EvenementController::class, 'reorderProgram'])->name('evenements.reorderProgram');
    Route::post('evenements/{evenement}/media', [EvenementController::class, 'uploadMedia'])->name('evenements.uploadMedia');
    Route::patch('evenements/{evenement}/media/{media}', [EvenementController::class, 'updateMedia'])->name('evenements.updateMedia');
    Route::delete('evenements/{evenement}/media/{media}', [EvenementController::class, 'deleteMedia'])->name('evenements.deleteMedia');
    Route::get('evenements/{evenement}/media/{media}/download', [EvenementController::class, 'downloadMedia'])->name('evenements.downloadMedia');
    Route::post('evenements/{evenement}/commentaires', [EvenementCommentController::class, 'store'])
        ->name('evenements.commentaires.store');
    Route::delete('commentaires/{commentaire}', [EvenementCommentController::class, 'destroy'])
        ->name('commentaires.destroy');
    Route::post('commentaires/{commentaire}/reactions/toggle', [EvenementCommentController::class, 'toggleReaction'])
        ->name('commentaires.reactions.toggle');
    Route::post('evenements/{evenement}/messages', [EventMessageController::class, 'store'])
        ->name('evenements.messages.store');
    Route::post('evenements/{evenement}/messages/{message}/reply', [EventMessageController::class, 'reply'])
        ->name('evenements.messages.reply');
    Route::post('notifications/{notification}/read', [EventNotificationController::class, 'markRead'])
        ->name('notifications.read');
    Route::post('notifications/read-all', [EventNotificationController::class, 'markAllRead'])
        ->name('notifications.readAll');

    Route::resource('inscriptions', InscriptionEvenementController::class)
        ->only(['index', 'store', 'destroy']);
    Route::get('mes-inscriptions', [InscriptionEvenementController::class, 'mine'])
        ->name('inscriptions.mine');
    Route::get('evenements/{evenement}/inscriptions', [InscriptionEvenementController::class, 'byEvenement'])
        ->name('evenements.inscriptions');
    Route::patch('inscriptions/{inscription}/valider', [InscriptionEvenementController::class, 'valider'])
        ->name('inscriptions.valider');
    Route::patch('inscriptions/{inscription}/refuser', [InscriptionEvenementController::class, 'refuser'])
        ->name('inscriptions.refuser');
    Route::get('inscriptions/{inscription}/qr', [EventAccessController::class, 'qr'])
        ->name('inscriptions.qr');
    Route::get('admin/scanner-acces', [EventAccessController::class, 'adminScanner'])
        ->name('acces.admin');

    Route::resource('programmes', ProgrammeController::class)
        ->only(['store', 'update', 'destroy']);

    Route::resource('evenement-medias', EvenementMediaController::class)
        ->only(['index', 'store', 'show', 'update', 'destroy']);

    Route::post('evenements/{evenement}/moderation/users/{user}', [EventModerationController::class, 'restrict'])
        ->name('evenements.moderation.restrict');
    Route::patch('moderation/{restriction}/lift', [EventModerationController::class, 'lift'])
        ->name('evenements.moderation.lift');
    Route::patch('commentaires/{commentaire}/moderate', [EventModerationController::class, 'moderateComment'])
        ->name('commentaires.moderate');
    Route::patch('messages/{message}/moderate', [EventModerationController::class, 'moderateMessage'])
        ->name('messages.moderate');

    Route::resource('resultats', ResultatController::class)
        ->only(['store', 'update', 'destroy']);
    Route::get('evenements/{evenement}/classement', [ResultatController::class, 'classement'])
        ->name('evenements.classement');
    Route::get('evenements/{evenement}/classement/export', [ResultatController::class, 'exportPdf'])
        ->name('evenements.classement.export');

    Route::resource('certificats', CertificatController::class)
        ->only(['index', 'store', 'show', 'destroy']);
    Route::post('certificats/generer', [CertificatController::class, 'generer'])
        ->name('certificats.generer');
    Route::post('certificats/previsualiser', [CertificatController::class, 'preview'])
        ->name('certificats.preview');

    Route::post('evenements/{evenement}/jury/configurer', [JuryController::class, 'configure'])
        ->name('jury.configure');
    Route::post('evenements/{evenement}/jury/ouvrir-notation', [JuryController::class, 'openScoring'])
        ->name('jury.openScoring');
    Route::post('evenements/{evenement}/jury/fermer-notation', [JuryController::class, 'closeScoring'])
        ->name('jury.closeScoring');
    Route::post('evenements/{evenement}/jury/participants/{participant}/noter', [JuryController::class, 'score'])
        ->name('jury.score');
    Route::post('evenements/{evenement}/jury/participants/{participant}/revision', [JuryController::class, 'requestRevision'])
        ->name('jury.requestRevision');
    Route::post('evenements/{evenement}/jury/finaliser', [JuryController::class, 'finalize'])
        ->name('jury.finalize');
    Route::post('jury/deliberations/{deliberation}/resolve', [JuryController::class, 'resolveRevision'])
        ->name('jury.resolveRevision');

    // --- MODULE 5: Conférences & Concours ---
    Route::prefix('m5')->name('m5.')->group(function () {
        // Events
        Route::get('events', [\App\Http\Controllers\M5\EventController::class, 'index'])->name('events.index');
        Route::get('events/create', [\App\Http\Controllers\M5\EventController::class, 'create'])->name('events.create');
        Route::post('events', [\App\Http\Controllers\M5\EventController::class, 'store'])->name('events.store');
        Route::get('events/{evenement}', [\App\Http\Controllers\M5\EventController::class, 'show'])->name('events.show');
        Route::get('events/{evenement}/edit', [\App\Http\Controllers\M5\EventController::class, 'edit'])->name('events.edit');
        Route::patch('events/{evenement}', [\App\Http\Controllers\M5\EventController::class, 'update'])->name('events.update');
        
        // Participation
        Route::post('events/{evenement}/register', [\App\Http\Controllers\M5\ParticipantController::class, 'register'])->name('events.register');
        Route::patch('participations/{id}/cancel', [\App\Http\Controllers\M5\ParticipantController::class, 'cancel'])->name('participations.cancel');
        Route::patch('inscriptions/{id}/approve', [\App\Http\Controllers\M5\InscriptionController::class, 'approve'])->name('inscriptions.approve');
        Route::patch('inscriptions/{id}/reject', [\App\Http\Controllers\M5\InscriptionController::class, 'reject'])->name('inscriptions.reject');

        // Dashboard
        Route::get('dashboard', [\App\Http\Controllers\M5\DashboardController::class, 'index'])->name('dashboard');

        // Certificats
        Route::get('certificats', [\App\Http\Controllers\M5\CertificatController::class, 'index'])->name('certificats.index');
        Route::post('certificats/{certificat}/download', [\App\Http\Controllers\M5\CertificatController::class, 'download'])->name('certificats.download');

        // Rôles
        Route::post('events/{evenement}/roles', [\App\Http\Controllers\M5\RoleEvenementielController::class, 'store'])->name('events.roles.store');

        // Jury
        Route::get('jury/{evenement}/panel', [\App\Http\Controllers\M5\JuryController::class, 'panel'])->name('jury.panel');
        Route::post('evaluations', [\App\Http\Controllers\M5\JuryController::class, 'evaluate'])->name('evaluations.store');
        Route::post('deliberations/{id}/valider', [\App\Http\Controllers\M5\JuryController::class, 'valider'])->name('deliberations.valider');
    });

    // Global Administration (Module 5 focus)
    Route::middleware('role:admin')->group(function () {
        Route::get('admin', [\App\Http\Controllers\M5\AdminController::class, 'index'])->name('admin.index');
        Route::post('admin/types', [\App\Http\Controllers\M5\AdminController::class, 'storeType'])->name('admin.types.store');
        Route::patch('admin/types/{eventType}', [\App\Http\Controllers\M5\AdminController::class, 'updateType'])->name('admin.types.update');
        Route::delete('admin/types/{eventType}', [\App\Http\Controllers\M5\AdminController::class, 'deleteType'])->name('admin.types.delete');
    });
});

Route::get('certificats/verifier/{code}', [CertificatController::class, 'verifier'])
    ->name('certificats.verifier');

Route::get('verify/{token}', [\App\Http\Controllers\M5\CertificatController::class, 'verify'])->name('m5.verify');

require __DIR__.'/settings.php';
