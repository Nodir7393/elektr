<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\FilialController;
use App\Http\Controllers\SubstationController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// Auth routes (public)
Route::post('login', [AuthController::class , 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('logout', [AuthController::class , 'logout']);
    Route::get('me', [AuthController::class , 'me']);

    // Faqat admin: import, filiallar, foydalanuvchilar
    Route::middleware('admin')->group(function () {
        Route::post('substations/import', [SubstationController::class , 'import']);
        Route::apiResource('filiallar', FilialController::class)->except(['show']);
        Route::apiResource('users', UserController::class)->except(['show']);
    });

    // Podstansiyalar — admin hammasi, filial user faqat o'z filiali (controllerda scope)
    Route::apiResource('substations', SubstationController::class);
});
