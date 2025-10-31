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
            'model' => session('ai_model', config('ai.default_model', 'gpt-4.1-nano')),
            'temperature' => session('ai_temperature', config('ai.temperature.default', 0.3)),
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
        // Get available models from config
        $availableModels = array_keys(config('ai.models', []));

        // If no models in config, use defaults including gpt-4.1-nano
        if (empty($availableModels)) {
            $availableModels = ['gpt-4.1-nano', 'gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo'];
        }

        $validated = $request->validate([
            'model' => 'required|string|in:' . implode(',', $availableModels),
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
