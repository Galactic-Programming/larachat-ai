# AI Configuration Guide# AI Configuration Guide

This document explains how to configure the AI chatbot behavior in Larachat AI.This document explains how to configure the AI chatbot behavior in Larachat AI.

## Overview## Overview

The chatbot uses **Groq API (FREE)** with OpenAI SDK compatibility. Groq provides fast, free access to powerful models like Llama 3.3 70B Versatile. Users can customize settings via the AI Settings page or system defaults in `.env`.The chatbot uses OpenAI's GPT models with configurable parameters to control response behavior. Users can customize these settings via the AI Settings page or system defaults can be set in `.env`.

## Key Configuration Parameters## Key Configuration Parameters

### 1. Model Selection### 1. Model Selection

Choose from available Groq models (all FREE):Choose from available OpenAI models:

- **llama-3.3-70b-versatile** (Default) - Best overall, fast, versatile- **gpt-4o-mini** (Default) - Fast, cost-effective, good for general use

- **llama-3.1-70b-versatile** - Fast and reliable, great for coding- **gpt-4o** - More advanced, better reasoning

- **mixtral-8x7b-32768** - Ultra-fast, large context window- **gpt-4-turbo** - Most capable, highest quality responses

- **gemma2-9b-it** - Lightweight and fast for simple tasks

- **llama3-groq-70b-8192-tool-use-preview** - Optimized for function calling**Location:** AI Settings page or `OPENAI_DEFAULT_MODEL` in `.env`

**Location:** AI Settings page or `AI_DEFAULT_MODEL` in `.env`### 2. Temperature (0.0 - 1.0)

### 2. Temperature (0.0 - 1.0)Controls randomness and creativity of responses

Controls randomness and creativity of responses:| Temperature | Behavior | Best For |

|-------------|----------|----------|

| Temperature | Behavior | Best For || **0.0 - 0.3** | Focused, deterministic, precise | Factual answers, code generation, technical docs |

|-------------|----------|----------|| **0.4 - 0.6** | Balanced creativity and accuracy | General conversation, explanations |

| **0.0 - 0.3** | Focused, deterministic, precise | Factual answers, code generation, technical docs || **0.7 - 1.0** | Creative, varied, exploratory | Brainstorming, creative writing, open-ended tasks |

| **0.4 - 0.6** | Balanced creativity and accuracy | General conversation, explanations |

| **0.7 - 1.0** | Creative, varied, exploratory | Brainstorming, creative writing, open-ended tasks |**Default:** 0.3 (precise and accurate)  

**Location:** AI Settings page or `OPENAI_DEFAULT_TEMPERATURE` in `.env`

**Default:** 0.7 (balanced)  

**Location:** AI Settings page or config `ai.temperature.default`**Examples:**

**Examples:**- Temperature 0.1: "Laravel is a web application framework..." (same answer every time)

- Temperature 0.9: "Laravel is an elegant PHP framework that..." (varied responses)

- Temperature 0.1: "Laravel is a web application framework..." (same answer every time)

- Temperature 0.9: "Laravel is an elegant PHP framework that..." (varied responses)### 3. Max Tokens (100 - 4000)

### 3. Max Tokens (100 - 32768)Limits the length of AI responses

Limits the length of AI responses:- **100-500 tokens** - Short, concise answers

- **500-1500 tokens** - Medium-length explanations (default: 1500)

- **100-500 tokens** - Short, concise answers- **1500-4000 tokens** - Long, detailed responses

- **500-1500 tokens** - Medium-length explanations

- **1500-8000 tokens** - Long, detailed responses**Note:** 1 token ≈ 4 characters or ≈ 0.75 words

- **8000-32768 tokens** - Very long documents (Llama 3.3 70B supports up to 32K)

**Location:** AI Settings page or `OPENAI_DEFAULT_MAX_TOKENS` in `.env`

**Note:** 1 token ≈ 4 characters or ≈ 0.75 words

## Configuration Methods

**Location:** Configured per request in OpenAIService

### Method 1: User Settings (Recommended)

## Configuration Methods *

1. Navigate to **AI Settings** page (`/settings/ai`)

### Method 1: User Settings (Recommended)2. Adjust model, temperature, and max tokens using the UI

1. Click **Save Settings**

2. Navigate to **AI Settings** page (`/settings/ai`)

3. Select model and adjust temperatureSettings are stored in user session and persist across conversations.

4. Click **Save Settings**

### Method 2: Environment Variables

Settings are stored in user session and persist across conversations.

Set system-wide defaults in `.env`:

### Method 2: Environment Variables *

```bash

Set system-wide defaults in `.env`:# Default AI Model Settings

OPENAI_DEFAULT_MODEL=gpt-4o-mini

```bashOPENAI_DEFAULT_TEMPERATURE=0.3

# Groq API Configuration (FREE!)OPENAI_DEFAULT_MAX_TOKENS=1500

GROQ_API_KEY=your_groq_api_key_here```

AI_DEFAULT_MODEL=llama-3.3-70b-versatile

AI_USE_MOCK=falseThese values are used when no user-specific settings exist.



# OpenAI SDK Compatibility - Points to Groq### Method 3: Programmatic (Advanced)

OPENAI_BASE_URL=https://api.groq.com/openai/v1

```Instantiate `OpenAIService` with custom parameters:



Get your FREE Groq API key at: https://console.groq.com/keys```php

use App\Services\OpenAIService;

### Method 3: Programmatic (Advanced)

$service = new OpenAIService(

Use the AI Service Interface:    model: 'gpt-4o',

    temperature: 0.7,

```php    maxTokens: 2000

use App\Services\AiServiceInterface;);



$aiService = app(AiServiceInterface::class);$result = $service->generateResponse($conversation, $message);

$result = $aiService->generateResponse($conversation, $userMessage);```

```

## System Prompt Customization

## System Prompt Customization *

The system prompt defines the AI's personality and scope. Located in:

The system prompt defines the AI's personality and scope. Located in:

**File:** `app/Services/OpenAIService.php`  

**File:** `app/Services/OpenAIService.php`  **Method:** `buildMessagesArray()`

**Method:** `buildMessagesArray()`

**Current Prompt:**

**Current Prompt:**

``` note

```You are a highly knowledgeable and helpful AI assistant. You can assist with 

You are a highly knowledgeable and helpful AI assistant powered by Groq. a wide range of topics including programming, web development, general knowledge, 

You can assist with a wide range of topics including programming, web development, problem-solving, and creative tasks. When discussing code or technical topics, 

general knowledge, problem-solving, and creative tasks. When discussing code or provide clear explanations with practical examples. Be accurate, concise, and 

technical topics, provide clear explanations with practical examples. Be accurate, adapt your responses to the user's level of understanding.

concise, and adapt your responses to the user's level of understanding.```

```

### Customizing System Prompt

### Customizing System Prompt *

To change AI behavior scope (e.g., make it Laravel-only again):

To change AI behavior scope:

```php

```phpprivate function buildMessagesArray(Conversation $conversation): array

private function buildMessagesArray(Conversation $conversation): array{

{    $messages = [

    $messages = [        ['role' => 'system', 'content' => 'Your custom prompt here...'],

        ['role' => 'system', 'content' => 'Your custom prompt here...'],    ];

    ];    

        // ... rest of code

    // ... rest of code}

}```

```

**Example Specialized Prompts:**

**Example Specialized Prompts:**

**Laravel Expert:**

**Laravel Expert:**

``` note

```You are an expert Laravel developer. Provide practical Laravel advice with 

You are an expert Laravel developer. Provide practical Laravel advice with code examples following Laravel best practices.

code examples following Laravel best practices.```

```

**Creative Writer:**

**Creative Writer:**

``` note

```You are a creative writing assistant. Help users with storytelling, character 

You are a creative writing assistant. Help users with storytelling, character development, and narrative structure.

development, and narrative structure.```

```

**Code Reviewer:**

**Code Reviewer:**

``` note

```You are a senior code reviewer. Analyze code for bugs, performance issues, 

You are a senior code reviewer. Analyze code for bugs, performance issues, security vulnerabilities, and best practices.

security vulnerabilities, and best practices.```

```

## Recommended Settings by Use Case

## Recommended Settings by Use Case *

### 1. Technical Q&A / Coding Help

### 1. Technical Q&A / Coding Help *

``` note

```Model: gpt-4o-mini

Model: llama-3.3-70b-versatileTemperature: 0.2

Temperature: 0.3
Max Tokens: 1500

``````

### 2. General Conversation### 2. General Conversation

`````` note

Model: llama-3.3-70b-versatileModel: gpt-4o-mini

Temperature: 0.7Temperature: 0.5

```Max Tokens: 1000

```

### 3. Creative Writing

### 3. Creative Writing

```

Model: llama-3.3-70b-versatile``` note

Temperature: 0.9Model: gpt-4o

```Temperature: 0.8

Max Tokens: 2500

### 4. Code Generation```



```### 4. Code Generation

Model: llama-3.1-70b-versatile

Temperature: 0.2``` note

```Model: gpt-4o

Temperature: 0.1

### 5. Function Calling / Structured OutputMax Tokens: 2000

```

```

Model: llama3-groq-70b-8192-tool-use-preview### 5. Brainstorming / Ideas

Temperature: 0.3

`````` note

Model: gpt-4-turbo

### 6. Fast ResponsesTemperature: 0.9

Max Tokens: 1500

``````

Model: mixtral-8x7b-32768

Temperature: 0.5

## Cost Optimization

**Free Tier Limits:**

## Cost & Performance

- OpenAI free tier has strict rate limits

**Groq API Benefits:**- Use `gpt-4o-mini` for cost-effective responses

- Lower `max_tokens` to reduce usage

- ✅ **100% FREE** - No credit card required- Enable caching (already implemented) for repeated questions

- ✅ **Fast inference** - Up to 800+ tokens/second

- ✅ **Generous rate limits** - Suitable for development and small production apps**Production Recommendations:**

- ✅ **OpenAI compatible** - Use familiar OpenAI SDK syntax

- ✅ **Multiple models** - Switch between Llama, Mixtral, Gemma- Upgrade to paid OpenAI plan

- Monitor token usage via logs (`storage/logs/ai.log`)

**No Cost Optimization Needed:**- Set alerts for high usage (see `OpenAIService::calculateCost()`)

- All models are free to use

- No token counting required## Testing Configuration

- Focus on functionality, not billing

Run AI settings tests:

## Mock Mode for Development

```bash

Enable mock mode to develop/test without API calls:php artisan test tests/Feature/Settings/AiSettingsTest.php

```

```bash

AI_USE_MOCK=true## Troubleshooting

```

### Issue: Rate Limit Errors

Mock service returns realistic fake responses instantly. Perfect for:

- Frontend development**Solution:** Wait 5-10 minutes or upgrade OpenAI plan

- Testing

- Offline development### Issue: Responses too short/long

- CI/CD pipelines

**Solution:** Adjust `max_tokens` in AI Settings

## Testing Configuration

### Issue: Responses too creative/random

Run AI settings tests:

**Solution:** Lower `temperature` to 0.1-0.3

```bash

php artisan test tests/Feature/Settings/AiSettingsTest.php### Issue: Responses too rigid/repetitive

```

**Solution:** Increase `temperature` to 0.6-0.8

## Troubleshooting

## API Reference

### Issue: Rate Limit Errors *

### Session Keys

**Solution:** Groq has generous rate limits. If you hit them, wait briefly or consider upgrading to Groq paid tier for higher limits.

```php

### Issue: Responses too short/longsession('ai_model')       // string: model name

session('ai_temperature') // float: 0.0 - 1.0

**Solution:** Groq models have different max_tokens. Llama 3.3 supports up to 32K tokens.session('ai_max_tokens')  // int: 100 - 4000

```

### Issue: Responses too creative/random *

### Config Keys

**Solution:** Lower `temperature` to 0.1-0.3

```php

### Issue: Responses too rigid/repetitiveconfig('openai.default_model')       // Default: 'gpt-4o-mini'

config('openai.default_temperature') // Default: 0.3

**Solution:** Increase `temperature` to 0.6-0.9config('openai.default_max_tokens')  // Default: 1500

```

### Issue: Want to switch back to OpenAI

## Further Reading

**Solution:**

1. Get OpenAI API key- [OpenAI Models Documentation](https://platform.openai.com/docs/models)

2. Set `OPENAI_API_KEY` in `.env`- [OpenAI Pricing](https://openai.com/pricing)

3. Remove `OPENAI_BASE_URL` or set to `https://api.openai.com/v1`- [Temperature Parameter Guide](https://platform.openai.com/docs/guides/text-generation/temperature)

4. Update `AI_DEFAULT_MODEL` to OpenAI model (e.g., `gpt-4o-mini`)

## API Reference Notes

### Session Keys Configuration

```php
session('ai_model')       // string: model name
session('ai_temperature') // float: 0.0 - 1.0
```

### Config Keys Configuration

```php
config('ai.default_model')        // Default: 'llama-3.3-70b-versatile'
config('ai.use_mock')             // bool: false (use real API)
config('ai.temperature.default')  // Default: 0.7
config('ai.models')               // Array of available models
```

### OpenAI Config (Groq Compatibility)

```php
config('openai.api_key')     // Groq API key
config('openai.base_uri')    // 'https://api.groq.com/openai/v1'
```

## Further Reading This

- [Groq Documentation](https://console.groq.com/docs)
- [Groq Models](https://console.groq.com/docs/models)
- [Groq API Keys](https://console.groq.com/keys) - Get your free key
- [OpenAI SDK Compatibility](https://console.groq.com/docs/openai)
- [Temperature Parameter Guide](https://platform.openai.com/docs/guides/text-generation/temperature)
