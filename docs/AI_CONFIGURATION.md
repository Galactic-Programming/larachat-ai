# AI Configuration Guide# AI Configuration Guide

This document explains how to configure the AI chatbot behavior in Larachat AI.This document explains how to configure the AI chatbot behavior in Larachat AI.

## Overview## Overview

The chatbot uses **Groq API (FREE)** with OpenAI SDK compatibility. Groq provides fast, free access to powerful models like Llama 3.3 70B Versatile. Users can customize settings via the AI Settings page or system defaults in `.env`.The chatbot uses **Groq API (FREE)** with OpenAI SDK compatibility. Groq provides fast, free access to powerful models like Llama 3.3 70B Versatile. Users can customize settings via the AI Settings page or system defaults in `.env`.

**Important:** As of November 2025, only 2 Groq models are currently working:**Important:** As of November 2025, only 2 Groq models are currently working:

- ✅ `llama-3.3-70b-versatile` - Best overall, recommended- ✅ `llama-3.3-70b-versatile` - Best overall, recommended

- ✅ `llama-3.1-8b-instant` - Ultra-fast for simple tasks- ✅ `llama-3.1-8b-instant` - Ultra-fast for simple tasks

## Key Configuration Parameters## Key Configuration Parameters

### 1. Model Selection### 1. Model Selection

Choose from available Groq models (verified Nov 2025):Choose from available Groq models (verified Nov 2025):

- **llama-3.3-70b-versatile** (Default) ⭐ - Best overall, fast, versatile- **llama-3.3-70b-versatile** (Default) ⭐ - Best overall, fast, versatile

- **llama-3.1-8b-instant** ⚡ - Ultra-fast, lightweight for simple tasks- **llama-3.1-8b-instant** ⚡ - Ultra-fast, lightweight for simple tasks

**Location:** AI Settings page or `AI_DEFAULT_MODEL` in `.env`**Location:** AI Settings page or `AI_DEFAULT_MODEL` in `.env`### 2. Temperature (0.0 - 1.0)

### 2. Temperature (0.0 - 1.0)### 2. Temperature (0.0 - 1.0)Controls randomness and creativity of responses

Controls randomness and creativity of responses:Controls randomness and creativity of responses:| Temperature | Behavior | Best For |

| Temperature | Behavior | Best For ||-------------|----------|----------|

|-------------|----------|----------|

| **0.0 - 0.3** | Focused, deterministic, precise | Factual answers, code generation, technical docs || Temperature | Behavior | Best For || **0.0 - 0.3** | Focused, deterministic, precise | Factual answers, code generation, technical docs |

| **0.4 - 0.6** | Balanced creativity and accuracy | General conversation, explanations |

| **0.7 - 1.0** | Creative, varied, exploratory | Brainstorming, creative writing, open-ended tasks ||-------------|----------|----------|| **0.4 - 0.6** | Balanced creativity and accuracy | General conversation, explanations |

**Default:** 0.7 (balanced)  | **0.0 - 0.3** | Focused, deterministic, precise | Factual answers, code generation, technical docs || **0.7 - 1.0** | Creative, varied, exploratory | Brainstorming, creative writing, open-ended tasks |

**Location:** AI Settings page or config `ai.temperature.default`

| **0.4 - 0.6** | Balanced creativity and accuracy | General conversation, explanations |

**Examples:**

| **0.7 - 1.0** | Creative, varied, exploratory | Brainstorming, creative writing, open-ended tasks |**Default:** 0.3 (precise and accurate)  

- Temperature 0.1: "Laravel is a web application framework..." (same answer every time)

- Temperature 0.9: "Laravel is an elegant PHP framework that..." (varied responses)**Location:** AI Settings page or `OPENAI_DEFAULT_TEMPERATURE` in `.env`

### 3. Max Tokens (100 - 32768)**Default:** 0.7 (balanced)  

Limits the length of AI responses:**Location:** AI Settings page or config `ai.temperature.default`**Examples:**

- **100-500 tokens** - Short, concise answers**Examples:**- Temperature 0.1: "Laravel is a web application framework..." (same answer every time)

- **500-1500 tokens** - Medium-length explanations

- **1500-8000 tokens** - Long, detailed responses- Temperature 0.9: "Laravel is an elegant PHP framework that..." (varied responses)

- **8000-32768 tokens** - Very long documents (Llama 3.3 70B supports up to 32K)

- Temperature 0.1: "Laravel is a web application framework..." (same answer every time)

**Note:** 1 token ≈ 4 characters or ≈ 0.75 words

- Temperature 0.9: "Laravel is an elegant PHP framework that..." (varied responses)### 3. Max Tokens (100 - 4000)

**Location:** Configured per request in OpenAIService

### 3. Max Tokens (100 - 32768)Limits the length of AI responses

## Configuration Methods

Limits the length of AI responses:- **100-500 tokens** - Short, concise answers

### Method 1: User Settings (Recommended)

- **500-1500 tokens** - Medium-length explanations (default: 1500)

1. Navigate to **AI Settings** page (`/settings/ai`)

2. Select from 2 working models:- **100-500 tokens** - Short, concise answers- **1500-4000 tokens** - Long, detailed responses

   - Llama 3.3 70B Versatile (Recommended) ⭐

   - Llama 3.1 8B Instant (Fast) ⚡- **500-1500 tokens** - Medium-length explanations

3. Adjust temperature (0.0-1.0)

4. Click **Save Settings**- **1500-8000 tokens** - Long, detailed responses**Note:** 1 token ≈ 4 characters or ≈ 0.75 words

Settings are stored in user session and persist across conversations.- **8000-32768 tokens** - Very long documents (Llama 3.3 70B supports up to 32K)

### Method 2: Environment Variables**Location:** AI Settings page or `OPENAI_DEFAULT_MAX_TOKENS` in `.env`

Set system-wide defaults in `.env`:**Note:** 1 token ≈ 4 characters or ≈ 0.75 words

```bash## Configuration Methods

# Groq API Configuration (FREE!)

GROQ_API_KEY=your_groq_api_key_here**Location:** Configured per request in OpenAIService

AI_DEFAULT_MODEL=llama-3.3-70b-versatile

AI_USE_MOCK=false### Method 1: User Settings (Recommended)

# OpenAI SDK Compatibility - Points to Groq## Configuration Methods *

OPENAI_BASE_URL=https://api.groq.com/openai/v1

```1. Navigate to **AI Settings** page (`/settings/ai`)

Get your FREE Groq API key at: <https://console.groq.com/keys>### Method 1: User Settings (Recommended)2. Adjust model, temperature, and max tokens using the UI

### Method 3: Programmatic (Advanced)1. Click **Save Settings**

Use the AI Service Interface:2. Navigate to **AI Settings** page (`/settings/ai`)

```php3. Select model and adjust temperatureSettings are stored in user session and persist across conversations.

use App\Services\AiServiceInterface;

4. Click **Save Settings**

$aiService = app(AiServiceInterface::class);

$result = $aiService->generateResponse($conversation, $userMessage);### Method 2: Environment Variables

```

Settings are stored in user session and persist across conversations.

## System Prompt Customization

Set system-wide defaults in `.env`:

The system prompt defines the AI's personality and scope. Located in:

### Method 2: Environment Variables *

**File:** `app/Services/OpenAIService.php`  

**Method:** `buildMessagesArray()````bash

**Current Prompt:**Set system-wide defaults in `.env`:# Default AI Model Settings

```OPENAI_DEFAULT_MODEL=gpt-4o-mini

You are a highly knowledgeable and helpful AI assistant powered by Groq. 

You can assist with a wide range of topics including programming, web development, ```bashOPENAI_DEFAULT_TEMPERATURE=0.3

general knowledge, problem-solving, and creative tasks. When discussing code or 

technical topics, provide clear explanations with practical examples. Be accurate, # Groq API Configuration (FREE!)OPENAI_DEFAULT_MAX_TOKENS=1500

concise, and adapt your responses to the user's level of understanding.

```GROQ_API_KEY=your_groq_api_key_here```

### Customizing System PromptAI_DEFAULT_MODEL=llama-3.3-70b-versatile

To change AI behavior scope:AI_USE_MOCK=falseThese values are used when no user-specific settings exist.

```php

private function buildMessagesArray(Conversation $conversation): array

{# OpenAI SDK Compatibility - Points to Groq### Method 3: Programmatic (Advanced)

    $messages = [

        ['role' => 'system', 'content' => 'Your custom prompt here...'],OPENAI_BASE_URL=https://api.groq.com/openai/v1

    ];

    ```Instantiate `OpenAIService` with custom parameters:

    // ... rest of code

}

```

Get your FREE Groq API key at: `https://console.groq.com/keys```php`

**Example Specialized Prompts:**

use App\Services\OpenAIService;

**Laravel Expert:**

### Method 3: Programmatic (Advanced)

``` note

You are an expert Laravel developer. Provide practical Laravel advice with $service = new OpenAIService(

code examples following Laravel best practices.

```Use the AI Service Interface:    model: 'gpt-4o',

**Creative Writer:**    temperature: 0.7,

``````php    maxTokens: 2000

You are a creative writing assistant. Help users with storytelling, character 

development, and narrative structure.use App\Services\AiServiceInterface;);

```

**Code Reviewer:**

$aiService = app(AiServiceInterface::class);$result = $service->generateResponse($conversation, $message);

``` note

You are a senior code reviewer. Analyze code for bugs, performance issues, $result = $aiService->generateResponse($conversation, $userMessage);```

security vulnerabilities, and best practices.

``````

## Recommended Settings by Use Case## System Prompt Customization

### 1. Technical Q&A / Coding Help## System Prompt Customization *

```The system prompt defines the AI's personality and scope. Located in:

Model: llama-3.3-70b-versatile

Temperature: 0.3The system prompt defines the AI's personality and scope. Located in:

```

**File:** `app/Services/OpenAIService.php`  

### 2. General Conversation

**File:** `app/Services/OpenAIService.php`  **Method:** `buildMessagesArray()`

``` note

Model: llama-3.3-70b-versatile**Method:** `buildMessagesArray()`

Temperature: 0.7

```**Current Prompt:**

### 3. Creative Writing**Current Prompt:**

`````` note

Model: llama-3.3-70b-versatile

Temperature: 0.9```You are a highly knowledgeable and helpful AI assistant. You can assist with 

```

You are a highly knowledgeable and helpful AI assistant powered by Groq. a wide range of topics including programming, web development, general knowledge,

### 4. Code Generation

You can assist with a wide range of topics including programming, web development, problem-solving, and creative tasks. When discussing code or technical topics,

``` note

Model: llama-3.3-70b-versatilegeneral knowledge, problem-solving, and creative tasks. When discussing code or provide clear explanations with practical examples. Be accurate, concise, and 

Temperature: 0.2

```technical topics, provide clear explanations with practical examples. Be accurate, adapt your responses to the user's level of understanding.

### 5. Fast Responses / Simple Tasksconcise, and adapt your responses to the user's level of understanding.```



``````

Model: llama-3.1-8b-instant

Temperature: 0.5### Customizing System Prompt

``` prompt

### Customizing System Prompt *

## Cost & Performance

To change AI behavior scope (e.g., make it Laravel-only again):

**Groq API Benefits:**

To change AI behavior scope:

- ✅ **100% FREE** - No credit card required

- ✅ **Fast inference** - Up to 800+ tokens/second```php

- ✅ **Generous rate limits** - Suitable for development and small production apps

- ✅ **OpenAI compatible** - Use familiar OpenAI SDK syntax```phpprivate function buildMessagesArray(Conversation $conversation): array

- ✅ **Multiple models** - Switch between Llama models

private function buildMessagesArray(Conversation $conversation): array{

**No Cost Optimization Needed:**

{    $messages = [

- All models are free to use

- No token counting required    $messages = [        ['role' => 'system', 'content' => 'Your custom prompt here...'],

- Focus on functionality, not billing

        ['role' => 'system', 'content' => 'Your custom prompt here...'],    ];

## Mock Mode for Development

    ];    

Enable mock mode to develop/test without API calls:

        // ... rest of code

```bash

AI_USE_MOCK=true    // ... rest of code}

```

}```

Mock service returns realistic fake responses instantly. Perfect for:

``` note
- Frontend development
- Testing**Example Specialized Prompts:**
- Offline development
- CI/CD pipelines**Example Specialized Prompts:**

## Testing Configuration**Laravel Expert:**

Run AI settings tests:**Laravel Expert:**

```bash``` note
php artisan test tests/Feature/Settings/AiSettingsTest.php

``````You are an expert Laravel developer. Provide practical Laravel advice with 

## TroubleshootingYou are an expert Laravel developer. Provide practical Laravel advice with code examples following Laravel best practices.

### Issue: Rate Limit Errorscode examples following Laravel best practices.```

**Solution:** Groq has generous rate limits. If you hit them, wait briefly or consider upgrading to Groq paid tier for higher limits.```

### Issue: Responses too short/long**Creative Writer:**

**Solution:** Groq models have different max_tokens. Llama 3.3 supports up to 32K tokens.**Creative Writer:**

### Issue: Responses too creative/random``` note

**Solution:** Lower `temperature` to 0.1-0.3```You are a creative writing assistant. Help users with storytelling, character 

### Issue: Responses too rigid/repetitiveYou are a creative writing assistant. Help users with storytelling, character development, and narrative structure.

**Solution:** Increase `temperature` to 0.6-0.9development, and narrative structure.```

### Issue: Want to switch back to OpenAI```

**Solution:****Code Reviewer:**

1. Get OpenAI API key**Code Reviewer:**

2. Set `OPENAI_API_KEY` in `.env`

3. Remove `OPENAI_BASE_URL` or set to `https://api.openai.com/v1```` note

4. Update `AI_DEFAULT_MODEL` to OpenAI model (e.g., `gpt-4o-mini`)

```You are a senior code reviewer. Analyze code for bugs, performance issues, 

### Issue: Only 2 models available

You are a senior code reviewer. Analyze code for bugs, performance issues, security vulnerabilities, and best practices.

**Explanation:** As of November 2025, Groq has deprecated many models. Only 2 models are currently working:

security vulnerabilities, and best practices.```

- `llama-3.3-70b-versatile`

- `llama-3.1-8b-instant````

All deprecated models have been disabled in `config/ai.php`. This may change in the future - check Groq console for updates.## Recommended Settings by Use Case

## API Reference## Recommended Settings by Use Case *

### Session Keys### 1. Technical Q&A / Coding Help

```php### 1. Technical Q&A / Coding Help *

session('ai_model')       // string: model name

session('ai_temperature') // float: 0.0 - 1.0``` note

```

```Model: gpt-4o-mini

### Config Keys

Model: llama-3.3-70b-versatileTemperature: 0.2

```php

config('ai.default_model')        // Default: 'llama-3.3-70b-versatile'Temperature: 0.3

config('ai.use_mock')             // bool: false (use real API)Max Tokens: 1500

config('ai.temperature.default')  // Default: 0.7

config('ai.models')               // Array of available models``````

```

### 2. General Conversation### 2. General Conversation

### OpenAI Config (Groq Compatibility)

`````` note

```php

config('openai.api_key')     // Groq API keyModel: llama-3.3-70b-versatileModel: gpt-4o-mini

config('openai.base_uri')    // 'https://api.groq.com/openai/v1'

```Temperature: 0.7Temperature: 0.5



## Further Reading```Max Tokens: 1000



- [Groq Documentation](https://console.groq.com/docs)```

- [Groq Models](https://console.groq.com/docs/models)

- [Groq API Keys](https://console.groq.com/keys) - Get your free key### 3. Creative Writing

- [OpenAI SDK Compatibility](https://console.groq.com/docs/openai)

- [Temperature Parameter Guide](https://platform.openai.com/docs/guides/text-generation/temperature)### 3. Creative Writing



---```



**Last Updated:** November 1, 2025  Model: llama-3.3-70b-versatile``` note

**Groq Models Verified:** November 1, 2025

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

### OpenAI Config (Groq Compatibility) *

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
