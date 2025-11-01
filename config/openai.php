<?php

return [

    /*
    |--------------------------------------------------------------------------
    | OpenAI API Key and Organization
    |--------------------------------------------------------------------------
    |
    | Here you may specify your OpenAI API Key and organization. This will be
    | used to authenticate with the OpenAI API - you can find your API key
    | and organization on your OpenAI dashboard, at https://openai.com.
    |
    | For Groq API integration:
    | - Set OPENAI_API_KEY to your Groq API key
    | - Set OPENAI_BASE_URL to https://api.groq.com/openai/v1
    | - Or use GROQ_API_KEY which will be auto-detected
    */

    'api_key' => env('GROQ_API_KEY') ?: env('OPENAI_API_KEY'),
    'organization' => env('OPENAI_ORGANIZATION'),

    /*
    |--------------------------------------------------------------------------
    | OpenAI API Project
    |--------------------------------------------------------------------------
    |
    | Here you may specify your OpenAI API project. This is used optionally in
    | situations where you are using a legacy user API key and need association
    | with a project. This is not required for the newer API keys.
    */
    'project' => env('OPENAI_PROJECT'),

    /*
    |--------------------------------------------------------------------------
    | OpenAI Base URL
    |--------------------------------------------------------------------------
    |
    | Here you may specify your OpenAI API base URL used to make requests. This
    | is needed if using a custom API endpoint. Defaults to: api.openai.com/v1
    |
    | For Groq API: https://api.groq.com/openai/v1
    */
    'base_uri' => env('OPENAI_BASE_URL', 'https://api.groq.com/openai/v1'),

    /*
    |--------------------------------------------------------------------------
    | Request Timeout
    |--------------------------------------------------------------------------
    |
    | The timeout may be used to specify the maximum number of seconds to wait
    | for a response. By default, the client will time out after 30 seconds.
    */

    'request_timeout' => env('OPENAI_REQUEST_TIMEOUT', 60),

    /*
    |--------------------------------------------------------------------------
    | Fallback API Key
    |--------------------------------------------------------------------------
    |
    | Optional fallback API key for redundancy in production environments.
    | This will be used if the primary API key fails or is unavailable.
    */

    'fallback_api_key' => env('OPENAI_FALLBACK_API_KEY'),

    /*
    |--------------------------------------------------------------------------
    | Proxy Configuration
    |--------------------------------------------------------------------------
    |
    | If you need to use a proxy for OpenAI API requests, configure it here.
    | This is useful for corporate environments or when using a VPN.
    */

    'proxy' => env('HTTP_PROXY'),

    /*
    |--------------------------------------------------------------------------
    | Default AI Model Settings
    |--------------------------------------------------------------------------
    |
    | These are the default settings for AI model behavior. Users can override
    | these settings via the AI Settings page (stored in session).
    |
    | NOTE: For Groq API integration, use AI_DEFAULT_MODEL instead.
    |       This config is maintained for backward compatibility.
    */

    'default_model' => env('AI_DEFAULT_MODEL', 'llama-3.3-70b-versatile'),
    'default_temperature' => env('OPENAI_DEFAULT_TEMPERATURE', 0.3),
    'default_max_tokens' => env('OPENAI_DEFAULT_MAX_TOKENS', 1500),
];
