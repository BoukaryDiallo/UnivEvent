<?php

use App\Http\Controllers\Admin\DiplomaDocumentController as AdminDiplomaDocumentController;
use App\Http\Controllers\Admin\DiplomaRequestController as AdminDiplomaRequestController;
use App\Http\Controllers\Admin\PickupSlotController as AdminPickupSlotController;
use App\Http\Controllers\DiplomaDocumentController;
use App\Http\Controllers\DiplomaRequestController;
use App\Http\Controllers\PickupAppointmentController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'student'])
    ->prefix('diplomas')
    ->name('diplomas.')
    ->group(function () {
        Route::get('/', [DiplomaRequestController::class, 'index'])->name('index');
        Route::get('/create', [DiplomaRequestController::class, 'create'])->name('create');
        Route::post('/', [DiplomaRequestController::class, 'store'])->name('store');
        Route::get('/{diplomaRequest}', [DiplomaRequestController::class, 'show'])->name('show');
        Route::post('/{diplomaRequest}/submit', [DiplomaRequestController::class, 'submit'])->name('submit');

        Route::post('/{diplomaRequest}/documents', [DiplomaDocumentController::class, 'store'])
            ->name('documents.store');
        Route::get('/{diplomaRequest}/documents/{document}/download', [DiplomaDocumentController::class, 'download'])
            ->scopeBindings()
            ->name('documents.download');
        Route::delete('/{diplomaRequest}/documents/{document}', [DiplomaDocumentController::class, 'destroy'])
            ->scopeBindings()
            ->name('documents.destroy');

        Route::post('/{diplomaRequest}/appointment/{pickupSlot}', [PickupAppointmentController::class, 'store'])
            ->name('appointment.store');
        Route::delete('/{diplomaRequest}/appointment/{appointment}', [PickupAppointmentController::class, 'destroy'])
            ->scopeBindings()
            ->name('appointment.destroy');
    });

Route::middleware(['auth', 'verified', 'scolarite'])
    ->prefix('admin/diplomas')
    ->name('admin.diplomas.')
    ->group(function () {
        Route::get('/', [AdminDiplomaRequestController::class, 'index'])->name('index');
        Route::get('/{diplomaRequest}', [AdminDiplomaRequestController::class, 'show'])->name('show');
        Route::post('/{diplomaRequest}/validate', [AdminDiplomaRequestController::class, 'validateDossier'])
            ->name('validate');
        Route::post('/{diplomaRequest}/reject', [AdminDiplomaRequestController::class, 'reject'])
            ->name('reject');
        Route::post('/{diplomaRequest}/mark-ready', [AdminDiplomaRequestController::class, 'markReadyForPickup'])
            ->name('mark-ready');
        Route::post('/{diplomaRequest}/deliver', [AdminDiplomaRequestController::class, 'deliver'])
            ->name('deliver');
        Route::post('/{diplomaRequest}/archive', [AdminDiplomaRequestController::class, 'archive'])
            ->name('archive');
        Route::post('/{diplomaRequest}/documents/{document}/validate', [AdminDiplomaDocumentController::class, 'validateDocument'])
            ->scopeBindings()
            ->name('documents.validate');
    });

Route::middleware(['auth', 'verified', 'scolarite'])
    ->prefix('admin/pickup-slots')
    ->name('admin.pickup-slots.')
    ->group(function () {
        Route::get('/', [AdminPickupSlotController::class, 'index'])->name('index');
        Route::get('/create', [AdminPickupSlotController::class, 'create'])->name('create');
        Route::post('/', [AdminPickupSlotController::class, 'store'])->name('store');
        Route::get('/{pickupSlot}/edit', [AdminPickupSlotController::class, 'edit'])->name('edit');
        Route::put('/{pickupSlot}', [AdminPickupSlotController::class, 'update'])->name('update');
        Route::delete('/{pickupSlot}', [AdminPickupSlotController::class, 'destroy'])->name('destroy');
    });
