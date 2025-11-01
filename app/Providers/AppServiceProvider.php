<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Share AI settings globally with all Inertia pages
        Inertia::share([
            'aiSettings' => function () {
                return [
                    'model' => session('ai_model', config('ai.default_model')),
                    'temperature' => session('ai_temperature', config('ai.temperature.default', 0.7)),
                    'max_tokens' => session('ai_max_tokens', 1500),
                ];
            },
        ]);
    }
}
