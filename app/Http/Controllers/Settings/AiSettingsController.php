<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AiSettingsController extends Controller
{
    /**
     * Display AI settings page
     */
    public function index(): Response
    {
        $settings = [
            'model' => session('ai_model', config('openai.default_model', 'gpt-4o-mini')),
            'temperature' => session('ai_temperature', 0.3),
            'max_tokens' => session('ai_max_tokens', 1500),
        ];

        return Inertia::render('settings/ai-settings', [
            'settings' => $settings,
        ]);
    }

    /**
     * Update AI settings
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'model' => 'required|string|in:gpt-4o-mini,gpt-4o,gpt-4-turbo',
            'temperature' => 'required|numeric|min:0|max:1',
            'max_tokens' => 'required|integer|min:100|max:4000',
        ]);

        // Store in session
        session([
            'ai_model' => $validated['model'],
            'ai_temperature' => $validated['temperature'],
            'ai_max_tokens' => $validated['max_tokens'],
        ]);

        return back()->with('success', 'AI settings updated successfully!');
    }
}
