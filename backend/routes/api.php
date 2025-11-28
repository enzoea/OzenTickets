<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\MetricController;
use App\Http\Controllers\TicketUpdateController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login'])
    ->middleware('throttle:10,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/tickets', [TicketController::class, 'index']);
    Route::post('/tickets', [TicketController::class, 'store']);
    Route::put('/tickets/{ticket}', [TicketController::class, 'update']);

    Route::get('/metrics/by-status', [MetricController::class, 'byStatus']);
    Route::get('/metrics/by-user', [MetricController::class, 'byUser']);

    Route::get('/tickets/{ticket}/updates', [TicketUpdateController::class, 'index']);
    Route::post('/tickets/{ticket}/updates', [TicketUpdateController::class, 'store']);
    Route::put('/tickets/{ticket}/updates/{update}', [TicketUpdateController::class, 'update']);
    Route::delete('/tickets/{ticket}/updates/{update}', [TicketUpdateController::class, 'destroy']);

    Route::middleware('can:manage-users')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::put('/users/{user}', [UserController::class, 'update']);
        Route::delete('/users/{user}', [UserController::class, 'destroy']);
    });

    Route::get('/user-list', [UserController::class, 'listBasic']);
});
