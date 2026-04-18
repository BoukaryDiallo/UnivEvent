<?php

use App\Http\Controllers\Admin\DiplomaRequestController as AdminDiplomaRequestController;
use App\Http\Controllers\DiplomaDocumentController;
use App\Http\Controllers\DiplomaRequestController;
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
    });

Route::middleware(['auth', 'verified', 'scolarite'])
    ->prefix('admin/diplomas')
    ->name('admin.diplomas.')
    ->group(function () {
        Route::get('/', [AdminDiplomaRequestController::class, 'index'])->name('index');
        Route::get('/{diplomaRequest}', [AdminDiplomaRequestController::class, 'show'])->name('show');
    });
