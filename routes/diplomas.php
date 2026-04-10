<?php

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
    });
