<?php

use Illuminate\Support\Facades\Route;
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

require __DIR__.'/settings.php';
