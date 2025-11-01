<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Mock Mode
    |--------------------------------------------------------------------------
    |
    | Enable mock AI service for development/testing without OpenAI API.
    | Set to false when using Groq FREE API for real AI responses.
    |
    */
    'use_mock' => env('AI_USE_MOCK', false), // false = use Groq API (FREE!)

    /*
    |--------------------------------------------------------------------------
    | Default AI Model
    |--------------------------------------------------------------------------
    |
    | The default AI model to use for conversations when no specific model
    | is selected. This can be overridden per-conversation or via session.
    | Now using Groq FREE API with Llama 3.3 70B Versatile!
    |
    */
    'default_model' => env('AI_DEFAULT_MODEL', 'llama-3.3-70b-versatile'),

    /*
    |--------------------------------------------------------------------------
    | AI Models Configuration
    |--------------------------------------------------------------------------
    |
    | Configure available AI models from Groq (FREE API)
    | All models are FREE to use with generous rate limits!
    |
    */
    'models' => [
        // GROQ FREE MODELS (Only 2 Working - Nov 2025)
        'llama-3.3-70b-versatile' => [
            'name' => 'Llama 3.3 70B Versatile',
            'description' => '🚀 RECOMMENDED - Best overall, fast, versatile. Perfect for conversations, summaries, and general tasks.',
            'pricing' => [
                'input' => 0.00,   // FREE!
                'output' => 0.00,  // FREE!
            ],
            'max_tokens' => 32768,
            'context_window' => 131072,
            'enabled' => true,
            'provider' => 'Groq',
        ],
        'llama-3.1-8b-instant' => [
            'name' => 'Llama 3.1 8B Instant',
            'description' => '⚡ Ultra-fast responses. Lightweight model for quick interactions and simple tasks.',
            'pricing' => [
                'input' => 0.00,
                'output' => 0.00,
            ],
            'max_tokens' => 8192,
            'context_window' => 131072,
            'enabled' => true,
            'provider' => 'Groq',
        ],

        // LEGACY OPENAI MODELS (Disabled - require paid API key)
        'gpt-4o-mini' => [
            'name' => 'GPT-4o Mini',
            'description' => 'Fast, affordable model for everyday tasks. Requires OpenAI API key.',
            'pricing' => [
                'input' => 0.00015,  // per 1K tokens
                'output' => 0.0006,  // per 1K tokens
            ],
            'max_tokens' => 16384,
            'context_window' => 128000,
            'enabled' => false, // Disabled - use Groq instead
            'provider' => 'OpenAI',
        ],
        'gpt-4.1-nano' => [
            'name' => 'GPT-4.1 Nano',
            'description' => '⚠️ TESTING MODEL - May require beta access from OpenAI.',
            'pricing' => [
                'input' => 0.00015,
                'output' => 0.0006,
            ],
            'max_tokens' => 16384,
            'context_window' => 128000,
            'enabled' => false,
            'provider' => 'OpenAI',
        ],
        'gpt-4o' => [
            'name' => 'GPT-4o',
            'description' => 'Balanced performance and capability. Requires OpenAI API key.',
            'enabled' => false,
            'pricing' => [
                'input' => 0.0025,
                'output' => 0.010,
            ],
            'max_tokens' => 16384,
            'context_window' => 128000,
            'provider' => 'OpenAI',
        ],
        'gpt-4-turbo' => [
            'name' => 'GPT-4 Turbo',
            'description' => 'Most capable model. Requires OpenAI API key.',
            'enabled' => false,
            'pricing' => [
                'input' => 0.010,
                'output' => 0.030,
            ],
            'max_tokens' => 4096,
            'context_window' => 128000,
            'provider' => 'OpenAI',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Temperature Settings
    |--------------------------------------------------------------------------
    */

    'temperature' => [
        'default' => 0.7,
        'precise' => 0.3,  // For categorization, classification
        'creative' => 0.9, // For brainstorming, creative writing
    ],
];
