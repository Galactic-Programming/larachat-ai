<?php

use Illuminate\Support\Facades\Route;
use OpenAI\Laravel\Facades\OpenAI;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Chat demo route
    Route::get('chat/demo', function () {
        return Inertia::render('chat/demo');
    })->name('chat.demo');

    Route::get('chat/layout-demo', function () {
        return Inertia::render('chat/layout-demo');
    })->name('chat.layout-demo');

    Route::get('chat', function () {
        return Inertia::render('chat/index');
    })->name('chat.index');
});

Route::get('/ai/test', function () {
    try {
        $result = OpenAI::chat()->create([
            'model' => 'gpt-4.1-nano',
            'messages' => [
                ['role' => 'system', 'content' => 'You are a helpful Laravel assistant.'],
                ['role' => 'user', 'content' => 'Explain Laravel in exactly 3 sentences. Be encouraging!'],
            ],
        ]);

        $response = $result->choices[0]->message->content;

        return response()->json([
            'success' => true,
            'response' => $response,
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage(),
        ], 500);
    }
});

require __DIR__ . '/settings.php';
