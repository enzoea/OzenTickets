<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\MetricController;
use App\Http\Controllers\TicketUpdateController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\TicketAttachmentController;
use App\Http\Controllers\KbCategoryController;
use App\Http\Controllers\KbArticleController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login'])
    ->middleware('throttle:10,1');
Route::post('/register', [AuthController::class, 'register'])
    ->middleware('throttle:10,1');
Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])
    ->middleware('throttle:10,1');
Route::post('/reset-password', [AuthController::class, 'resetPassword'])
    ->middleware('throttle:10,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/tickets', [TicketController::class, 'index']);
    Route::post('/tickets', [TicketController::class, 'store'])->middleware('throttle:60,1');
    Route::put('/tickets/{ticket}', [TicketController::class, 'update'])->middleware('throttle:120,1');

    Route::get('/metrics/by-status', [MetricController::class, 'byStatus']);
    Route::get('/metrics/by-user', [MetricController::class, 'byUser']);

    Route::get('/tickets/{ticket}/updates', [TicketUpdateController::class, 'index']);
    Route::post('/tickets/{ticket}/updates', [TicketUpdateController::class, 'store'])->middleware('throttle:60,1');
    Route::put('/tickets/{ticket}/updates/{update}', [TicketUpdateController::class, 'update']);
    Route::delete('/tickets/{ticket}/updates/{update}', [TicketUpdateController::class, 'destroy']);

    Route::get('/tickets/{ticket}/attachments', [TicketAttachmentController::class, 'index']);
    Route::post('/tickets/{ticket}/attachments', [TicketAttachmentController::class, 'store'])->middleware('throttle:30,1');
    Route::delete('/tickets/{ticket}/attachments/{attachment}', [TicketAttachmentController::class, 'destroy']);

    Route::middleware('can:manage-users')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::put('/users/{user}', [UserController::class, 'update']);
        Route::delete('/users/{user}', [UserController::class, 'destroy']);
        Route::put('/tags/{tag}', [TagController::class, 'update']);
        Route::delete('/tags/{tag}', [TagController::class, 'destroy']);
    });

    Route::get('/user-list', [UserController::class, 'listBasic']);
    Route::get('/tags', [TagController::class, 'index']);
    Route::post('/tags', [TagController::class, 'store'])->middleware('throttle:30,1');

    Route::get('/projects', [ProjectController::class, 'index']);
    Route::post('/projects', [ProjectController::class, 'store']);
    Route::put('/projects/{project}', [ProjectController::class, 'update']);
    Route::delete('/projects/{project}', [ProjectController::class, 'destroy']);
    Route::get('/projects/{project}/members', [ProjectController::class, 'members']);
    Route::post('/projects/{project}/members', [ProjectController::class, 'addMember']);
    Route::delete('/projects/{project}/members/{user}', [ProjectController::class, 'removeMember']);

    Route::get('/kb/categories', [KbCategoryController::class, 'index']);
    Route::get('/kb/articles', [KbArticleController::class, 'index']);
    Route::get('/kb/articles/{article}', [KbArticleController::class, 'show']);

    Route::middleware('can:manage-users')->group(function () {
        Route::put('/kb/categories/{category}', [KbCategoryController::class, 'update']);
        Route::delete('/kb/categories/{category}', [KbCategoryController::class, 'destroy']);

        Route::post('/kb/articles', [KbArticleController::class, 'store']);
        Route::put('/kb/articles/{article}', [KbArticleController::class, 'update']);
        Route::delete('/kb/articles/{article}', [KbArticleController::class, 'destroy']);
    });

    Route::post('/kb/categories', [KbCategoryController::class, 'store'])->middleware('throttle:30,1');

    Route::post('/kb/articles/{article}/tickets/{ticket}', [KbArticleController::class, 'attachTicket'])
        ->middleware('throttle:60,1');
    Route::delete('/kb/articles/{article}/tickets/{ticket}', [KbArticleController::class, 'detachTicket']);
});
