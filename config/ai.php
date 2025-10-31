<?php

return [
    /*
    |--------------------------------------------------------------------------
    | AI Models Configuration
    |--------------------------------------------------------------------------
    |
    | Configure available AI models and their settings
    |
    */

    /*
    |--------------------------------------------------------------------------
    | Default AI Model
    |--------------------------------------------------------------------------
    |
    | The default AI model to use for conversations when no specific model
    | is selected. This can be overridden per-conversation or via session.
    |
    */
    'default_model' => env('AI_DEFAULT_MODEL', 'gpt-4o-mini'), // Changed from gpt-4.1-nano for testing

    /*
    |--------------------------------------------------------------------------
    | Available AI Models
    |--------------------------------------------------------------------------
    |
    | Define all available AI models with their metadata.
    | Each model includes: name, description, pricing, limits, and enabled status.
    |
    */
    'models' => [
        'gpt-4o-mini' => [
            'name' => 'GPT-4o Mini',
            'description' => 'Fast, affordable model for everyday tasks. Best for most use cases.',
            'pricing' => [
                'input' => 0.00015,  // per 1K tokens
                'output' => 0.0006,  // per 1K tokens
            ],
            'max_tokens' => 16384,
            'context_window' => 128000,
            'enabled' => true, // Enabled for testing with public model
        ],
        'gpt-4.1-nano' => [
            'name' => 'GPT-4.1 Nano',
            'description' => '⚠️ TESTING MODEL - May require beta access from OpenAI. Smallest GPT-4.1 model for simple tasks.',
            'pricing' => [
                'input' => 0.00015,  // Estimated - actual pricing unknown
                'output' => 0.0006,  // Estimated - actual pricing unknown
            ],
            'max_tokens' => 16384,
            'context_window' => 128000,
            'enabled' => false, // Disabled until whitelist confirmed
        ],
        'gpt-4o' => [
            'name' => 'GPT-4o',
            'description' => 'Balanced performance and capability',
            'enabled' => false, // Disabled for testing
            'pricing' => [
                'input' => 0.0025,   // per 1K tokens
                'output' => 0.010,   // per 1K tokens
            ],
            'max_tokens' => 16384,
            'context_window' => 128000,
        ],
        'gpt-4-turbo' => [
            'name' => 'GPT-4 Turbo',
            'description' => 'Most capable model',
            'enabled' => false, // Disabled for testing
            'pricing' => [
                'input' => 0.010,    // per 1K tokens
                'output' => 0.030,   // per 1K tokens
            ],
            'max_tokens' => 4096,
            'context_window' => 128000,
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
