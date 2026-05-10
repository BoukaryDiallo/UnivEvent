<?php

use App\Http\Controllers\Admin\PermissionController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;


Route::middleware(['auth', 'verified'])->group(function () {

    Route::middleware('role:admin')->prefix('admin')->name('admin.')->group(function () {

        Route::get('/users', [AdminUserController::class, 'index'])->name('users.index');
        Route::post('/users', [AdminUserController::class, 'store'])->name('users.store');
        Route::post('/users/{id}/promote-user', [AdminUserController::class, 'promouvoirUser'])->name('users.promote-user');
        Route::post('/users/{id}/roles', [AdminUserController::class, 'updateRoles'])->name('users.roles');
        Route::get('/permissions', [PermissionController::class, 'index'])->name('permissions.index');
        Route::post('/permissions', [PermissionController::class, 'store'])->name('permissions.store');
        Route::post('/permissions/assign', [PermissionController::class, 'assignerPermisson'])->name('permissions.assign');

    });


    // Pour les roles et permissions
    // Vous pouvez utiliser des middlewares tels que
    // middleware('role:admin|etudiant|enseignant') et middleware('permission:nom permission') pour protéger vos routes


});
