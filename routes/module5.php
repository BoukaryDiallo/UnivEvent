<?php

use App\Http\Controllers\CertificatController;
use App\Http\Controllers\EvenementCommentController;
use App\Http\Controllers\EvenementController;
use App\Http\Controllers\EvenementMediaController;
use App\Http\Controllers\EventAccessController;
use App\Http\Controllers\EventAdminController;
use App\Http\Controllers\EventMessageController;
use App\Http\Controllers\EventModerationController;
use App\Http\Controllers\EventNotificationController;
use App\Http\Controllers\InscriptionEvenementController;
use App\Http\Controllers\JuryController;
use App\Http\Controllers\M5\ActivityController;
use App\Http\Controllers\M5\EventAdminDashboardController;
use App\Http\Controllers\M5\EventController;
use App\Http\Controllers\M5\EventDashboardController;
use App\Http\Controllers\M5\InscriptionController;
use App\Http\Controllers\M5\RoleEvenementielController;
use App\Http\Controllers\ParticipantController;
use App\Http\Controllers\ProgrammeController;
use App\Http\Controllers\ResultatEvaluationController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    // Admin specific event management
    Route::middleware('role:admin')->group(function () {
        Route::get('admin/events/pending', [EventAdminController::class, 'pendingEvents'])->name('admin.events.pending');
        Route::post('admin/events/{evenement}/approve', [EventAdminController::class, 'approve'])->name('admin.events.approve');
        Route::post('admin/events/{evenement}/reject', [EventAdminController::class, 'reject'])->name('admin.events.reject');
    });

    // Main Event Management
    Route::get('evenements/gestion', [EvenementController::class, 'gestion'])->name('evenements.gestion');
    Route::get('evenements/gestion/conferences', [EvenementController::class, 'gestionConferences'])->name('evenements.gestion.conferences');
    Route::get('evenements/gestion/concours', [EvenementController::class, 'gestionConcours'])->name('evenements.gestion.concours');
    Route::get('evenements/create/concours', [EvenementController::class, 'createConcours'])->name('evenements.create.concours');
    Route::get('evenements/create/conference', [EvenementController::class, 'createConference'])->name('evenements.create.conference');
    Route::get('evenements/{evenement}/manage', [EvenementController::class, 'manage'])->name('evenements.manage');
    Route::get('evenements/{evenement}/edit', [EvenementController::class, 'edit'])->name('evenements.edit');
    Route::get('evenements/{evenement}', [EvenementController::class, 'show'])->name('evenements.show');
    Route::resource('evenements', EvenementController::class)->except(['show', 'edit']);

    Route::post('evenements/{evenement}/publier', [EvenementController::class, 'publier'])->name('evenements.publier');
    Route::post('evenements/{evenement}/archiver', [EvenementController::class, 'archiver'])->name('evenements.archiver');
    Route::patch('evenements/{evenement}/manage/{section}', [EvenementController::class, 'saveSection'])->name('evenements.saveSection');
    Route::post('evenements/{evenement}/submit-validation', [EvenementController::class, 'submitForValidation'])->name('evenements.submitValidation');
    Route::post('evenements/{evenement}/approve', [EvenementController::class, 'approve'])->name('evenements.approve');
    Route::post('evenements/{evenement}/reject', [EvenementController::class, 'reject'])->name('evenements.reject');
    Route::post('evenements/{evenement}/reset-pending', [EvenementController::class, 'resetToPending'])->name('evenements.resetPending');
    Route::post('evenements/{evenement}/assign-user', [EvenementController::class, 'assignUser'])->name('evenements.assignUser');
    Route::delete('evenements/{evenement}/assignments/{user}', [EvenementController::class, 'removeUser'])->name('evenements.removeUser');
    Route::patch('evenements/{evenement}/permissions', [EvenementController::class, 'updatePermissions'])->name('evenements.updatePermissions');
    Route::post('evenements/{evenement}/request-permission', [EvenementController::class, 'requestPermission'])->name('evenements.request-permission');

    // Program Management
    Route::post('evenements/{evenement}/program', [EvenementController::class, 'addProgram'])->name('evenements.addProgram');
    Route::patch('evenements/{evenement}/program/{programme}', [EvenementController::class, 'updateProgram'])->name('evenements.updateProgram');
    Route::delete('evenements/{evenement}/program/{programme}', [EvenementController::class, 'deleteProgram'])->name('evenements.deleteProgram');
    Route::patch('evenements/{evenement}/program/reorder', [EvenementController::class, 'reorderProgram'])->name('evenements.reorderProgram');

    // Media Management
    Route::post('evenements/{evenement}/media', [EvenementController::class, 'uploadMedia'])->name('evenements.uploadMedia');
    Route::patch('evenements/{evenement}/media/{media}', [EvenementController::class, 'updateMedia'])->name('evenements.updateMedia');
    Route::delete('evenements/{evenement}/media/{media}', [EvenementController::class, 'deleteMedia'])->name('evenements.deleteMedia');
    Route::get('evenements/{evenement}/media/{media}/download', [EvenementController::class, 'downloadMedia'])->name('evenements.downloadMedia');

    // Interactions
    Route::post('evenements/{evenement}/commentaires', [EvenementCommentController::class, 'store'])->name('evenements.commentaires.store');
    Route::delete('commentaires/{commentaire}', [EvenementCommentController::class, 'destroy'])->name('commentaires.destroy');
    Route::post('commentaires/{commentaire}/reactions/toggle', [EvenementCommentController::class, 'toggleReaction'])->name('commentaires.reactions.toggle');
    Route::post('evenements/{evenement}/messages', [EventMessageController::class, 'store'])->name('evenements.messages.store');
    Route::post('evenements/{evenement}/messages/{message}/reply', [EventMessageController::class, 'reply'])->name('evenements.messages.reply');

    // Notifications
    Route::post('event-notifications/{notification}/read', [EventNotificationController::class, 'markRead'])->name('event-notifications.read');
    Route::post('event-notifications/read-all', [EventNotificationController::class, 'markAllRead'])->name('event-notifications.readAll');

    // Inscriptions
    Route::resource('inscriptions', InscriptionEvenementController::class)->only(['index', 'store', 'destroy']);
    Route::get('mes-inscriptions', [InscriptionEvenementController::class, 'mine'])->name('inscriptions.mine');
    Route::get('evenements/{evenement}/inscriptions', [InscriptionEvenementController::class, 'byEvenement'])->name('evenements.inscriptions');
    Route::patch('inscriptions/{inscription}/valider', [InscriptionEvenementController::class, 'valider'])->name('inscriptions.valider');
    Route::patch('inscriptions/{inscription}/refuser', [InscriptionEvenementController::class, 'refuser'])->name('inscriptions.refuser');
    Route::get('inscriptions/{inscription}/qr', [EventAccessController::class, 'qr'])->name('inscriptions.qr');
    Route::get('admin/scanner-acces', [EventAccessController::class, 'adminScanner'])->name('acces.admin');

    // Resources
    Route::resource('programmes', ProgrammeController::class)->only(['store', 'update', 'destroy']);
    Route::resource('evenement-medias', EvenementMediaController::class)->only(['index', 'store', 'show', 'update', 'destroy']);

    // Moderation
    Route::post('evenements/{evenement}/moderation/users/{user}', [EventModerationController::class, 'restrict'])->name('evenements.moderation.restrict');
    Route::patch('moderation/{restriction}/lift', [EventModerationController::class, 'lift'])->name('evenements.moderation.lift');
    Route::patch('commentaires/{commentaire}/moderate', [EventModerationController::class, 'moderateComment'])->name('commentaires.moderate');
    Route::patch('messages/{message}/moderate', [EventModerationController::class, 'moderateMessage'])->name('messages.moderate');

    // Results
    Route::resource('resultats', ResultatEvaluationController::class)->only(['store', 'update', 'destroy']);
    Route::get('evenements/{evenement}/classement', [ResultatEvaluationController::class, 'classement'])->name('evenements.classement');
    Route::get('evenements/{evenement}/classement/export', [ResultatEvaluationController::class, 'exportPdf'])->name('evenements.classement.export');

    // Certificates
    Route::resource('certificats', CertificatController::class)->only(['index', 'store', 'show', 'destroy']);
    Route::post('certificats/generer', [CertificatController::class, 'generer'])->name('certificats.generer');
    Route::post('certificats/previsualiser', [CertificatController::class, 'preview'])->name('certificats.preview');

    // Jury
    Route::post('evenements/{evenement}/jury/configurer', [JuryController::class, 'configure'])->name('jury.configure');
    Route::post('evenements/{evenement}/jury/ouvrir-notation', [JuryController::class, 'openScoring'])->name('jury.openScoring');
    Route::post('evenements/{evenement}/jury/fermer-notation', [JuryController::class, 'closeScoring'])->name('jury.closeScoring');
    Route::post('evenements/{evenement}/jury/participants/{participant}/noter', [JuryController::class, 'score'])->name('jury.score');
    Route::post('evenements/{evenement}/jury/participants/{participant}/revision', [JuryController::class, 'requestRevision'])->name('jury.requestRevision');
    Route::post('evenements/{evenement}/jury/finaliser', [JuryController::class, 'finalize'])->name('jury.finalize');
    Route::post('jury/deliberations/{deliberation}/resolve', [JuryController::class, 'resolveRevision'])->name('jury.resolveRevision');

    // --- MODULE 5: Conférences & Concours (Native Namespace) ---
    Route::prefix('module5')->name('module5.')->group(function () {
        Route::get('events', [EventController::class, 'index'])->name('index');
        Route::get('events/create', [EventController::class, 'create'])->name('create');
        Route::post('events', [EventController::class, 'store'])->name('store');
        Route::get('events/{evenement}', [EventController::class, 'show'])->name('show');
        Route::get('events/{evenement}/manage', [EventController::class, 'manage'])->name('manage');
        Route::post('events/{evenement}/toggle-reaction', [EventController::class, 'toggleReaction'])->name('toggleReaction');
        Route::get('events/{evenement}/edit', [EventController::class, 'edit'])->name('edit');
        Route::patch('events/{evenement}', [EventController::class, 'update'])->name('update');

        Route::get('events/{evenement}/participant', [ParticipantController::class, 'show'])
            ->name('participantShow');
        Route::get('events/{evenement}/participant/certificate', [ParticipantController::class, 'downloadCertificate'])
            ->name('participantCertificateDownload');

        Route::post('events/{evenement}/register', [App\Http\Controllers\M5\ParticipantController::class, 'register'])->name('register');
        Route::patch('participations/{id}/cancel', [App\Http\Controllers\M5\ParticipantController::class, 'cancel'])->name('participations.cancel');
        Route::patch('inscriptions/{id}/approve', [InscriptionController::class, 'approve'])->name('inscriptions.approve');
        Route::patch('inscriptions/{id}/reject', [InscriptionController::class, 'reject'])->name('inscriptions.reject');

        Route::get('dashboard', [EventDashboardController::class, 'index'])->name('dashboard');

        // Activities / Actualités
        Route::get('activities', [ActivityController::class, 'index'])->name('activities.index');
        Route::patch('activities/{activity}/read', [ActivityController::class, 'markAsRead'])->name('activities.read');
        Route::post('activities/read-all', [ActivityController::class, 'markAllAsRead'])->name('activities.readAll');
        Route::delete('activities/{activity}', [ActivityController::class, 'destroy'])->name('activities.destroy');
        Route::delete('activities-clear', [ActivityController::class, 'clearAll'])->name('activities.clearAll');

        // Certificates
        Route::get('certificats', [App\Http\Controllers\M5\CertificatController::class, 'index'])->name('certificats.index');
        Route::post('certificats/bulk-generate', [App\Http\Controllers\M5\CertificatController::class, 'bulkGenerate'])->name('certificats.bulkGenerate');
        Route::get('certificats/{certificat}/download', [App\Http\Controllers\M5\CertificatController::class, 'download'])->name('certificats.download');

        // Participation & Tickets
        Route::get('inscriptions/{inscription}/ticket', [EventAccessController::class, 'downloadTicket'])->name('inscriptions.ticket');
        Route::post('inscriptions/check-in/{inscription}', [EventAccessController::class, 'checkIn'])->name('inscriptions.checkIn');

        Route::post('events/{evenement}/roles', [RoleEvenementielController::class, 'store'])->name('roles.store');
        Route::post('events/{evenement}/request-permission', [EvenementController::class, 'requestPermission'])->name('requestPermission');

        Route::post('events/{evenement}/submit-validation', [EvenementController::class, 'submitForValidation'])->name('submitValidation');
        Route::post('events/{evenement}/assign-user', [EvenementController::class, 'assignUser'])->name('assignUser');
        Route::delete('events/{evenement}/assignments/{user}', [EvenementController::class, 'removeUser'])->name('removeUser');
        Route::post('events/{evenement}/media', [EvenementController::class, 'uploadMedia'])->name('uploadMedia');
        Route::patch('events/{evenement}/media/{media}', [EvenementController::class, 'updateMedia'])->name('updateMedia');
        Route::delete('events/{evenement}/media/{media}', [EvenementController::class, 'deleteMedia'])->name('deleteMedia');
        Route::post('events/{evenement}/commentaires', [EvenementCommentController::class, 'store'])->name('commentaires.store');
        Route::post('events/{evenement}/messages', [EventMessageController::class, 'store'])->name('messages.store');
        Route::post('events/{evenement}/messages/{message}/reply', [EventMessageController::class, 'reply'])->name('messages.reply');

        Route::get('jury/{evenement}/panel', [App\Http\Controllers\M5\JuryController::class, 'panel'])->name('jury.panel');
        Route::post('evaluations', [App\Http\Controllers\M5\JuryController::class, 'evaluate'])->name('evaluations.store');
        Route::post('deliberations/{id}/valider', [App\Http\Controllers\M5\JuryController::class, 'valider'])->name('deliberations.valider');
    });

    // Global Administration
    Route::middleware('role:admin')->group(function () {
        Route::get('admin', [EventAdminDashboardController::class, 'index'])->name('admin.index');
        Route::get('admin/participants', [EventAdminDashboardController::class, 'participants'])->name('admin.participants');
        Route::post('admin/types', [EventAdminDashboardController::class, 'storeType'])->name('admin.types.store');
        Route::patch('admin/types/{eventType}', [EventAdminDashboardController::class, 'updateType'])->name('admin.types.update');
        Route::delete('admin/types/{eventType}', [EventAdminDashboardController::class, 'deleteType'])->name('admin.types.delete');
    });
});

Route::get('certificats/verifier/{code}', [CertificatController::class, 'verifier'])->name('certificats.verifier');
Route::get('verify/{token}', [App\Http\Controllers\M5\CertificatController::class, 'verify'])->name('module5.verify');
