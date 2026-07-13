<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\SubstationController;
use Illuminate\Support\Facades\Route;

// Auth routes (public)
Route::post('login', [AuthController::class , 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('logout', [AuthController::class , 'logout']);
    Route::get('me', [AuthController::class , 'me']);

    Route::apiResource('substations', SubstationController::class);
    Route::post('substations/import', [SubstationController::class , 'import']);
});