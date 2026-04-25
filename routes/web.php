<?php

use App\Http\Controllers\CertificatController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EventAccessController;
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

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('notifications', [NotificationCenterController::class, 'index'])->name('notifications.index');

    Route::middleware('role:admin')->group(function () {
        Route::get('roles', [UserController::class, 'index'])->name('roles');
    });

    Route::resource('evenements', EvenementController::class);
    Route::post('evenements/{evenement}/publier', [EvenementController::class, 'publier'])
        ->name('evenements.publier');
    Route::post('evenements/{evenement}/archiver', [EvenementController::class, 'archiver'])
        ->name('evenements.archiver');
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
});

Route::get('certificats/verifier/{code}', [CertificatController::class, 'verifier'])
    ->name('certificats.verifier');
Route::get('acces/{token}', [EventAccessController::class, 'scan'])
    ->name('acces.scan');

Route::middleware(['auth', 'verified'])->post('acces/{token}/check-in', [EventAccessController::class, 'checkIn'])
    ->name('acces.checkIn');

require __DIR__.'/settings.php';
