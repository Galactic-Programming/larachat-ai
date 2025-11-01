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
            'model' => session('ai_model', config('ai.default_model')),
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

        // If no models in config, use Groq FREE models as defaults
        if (empty($availableModels)) {
            $availableModels = [
                'llama-3.3-70b-versatile',
                'llama-3.1-70b-versatile',
                'llama3-groq-70b-8192-tool-use-preview',
                'mixtral-8x7b-32768',
                'gemma2-9b-it',
            ];
        }

        $validated = $request->validate([
            'model' => 'required|string|in:'.implode(',', $availableModels),
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
