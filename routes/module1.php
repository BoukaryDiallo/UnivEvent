<?php

use App\Http\Controllers\Admin\PermissionController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;


Route::middleware(['auth', 'verified'])->group(function () {

    Route::middleware('role:admin')->prefix('admin')->group(function () {

        Route::get('/users', [AdminUserController::class, 'index']);
        Route::post('/users', [AdminUserController::class, 'store']);
        Route::post('/users/{id}/promote-user', [AdminUserController::class, 'promouvoirUser']);
        Route::post('/users/{id}/roles', [AdminUserController::class, 'updateRoles']);
        Route::get('/permissions', [PermissionController::class, 'index']);
        Route::post('/permissions', [PermissionController::class, 'store']);
        Route::post('/permissions/assign', [PermissionController::class, 'assignerPermisson']);

    });


    // Pour les roles et permissions
    // Vous pouvez utiliser des middlewares tels que
    // middleware('role:admin|etudiant|enseignant') et middleware('permission:nom permission') pour protéger vos routes


});