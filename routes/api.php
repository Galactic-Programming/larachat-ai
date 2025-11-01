<?php

// routes/api.php
use App\Http\Controllers\AiChatController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    // AI Chat Routes
    Route::get('/conversations', [AiChatController::class, 'listConversations']);
    Route::post('/conversations', [AiChatController::class, 'createConversation']);
    Route::get('/conversations/{id}', [AiChatController::class, 'getConversation']);
    Route::delete('/conversations/{id}', [AiChatController::class, 'deleteConversation']);
    Route::get('/conversations/{id}/poll', [AiChatController::class, 'pollConversation']);

    // Message sending with rate limiting
    Route::post('/conversations/{id}/messages', [AiChatController::class, 'sendMessage'])
        ->middleware('ai.rate');

    // AI-Enhanced Features
    Route::post('/conversations/{id}/summary', [AiChatController::class, 'generateSummary']);
    Route::post('/conversations/{id}/topics', [AiChatController::class, 'extractTopics']);
    Route::post('/conversations/{id}/categorize', [AiChatController::class, 'categorizeConversation']);

    // AI Models Configuration
    Route::get('/ai/models', function () {
        return response()->json([
            'default_model' => config('ai.default_model'),
            'models' => collect(config('ai.models'))->filter(fn ($model) => $model['enabled'])->toArray(),
        ]);
    });
});
