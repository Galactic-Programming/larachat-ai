# AI Configuration Guide

This document explains how to configure the AI chatbot behavior in Larachat AI.

## Overview

The chatbot uses OpenAI's GPT models with configurable parameters to control response behavior. Users can customize these settings via the AI Settings page or system defaults can be set in `.env`.

## Key Configuration Parameters

### 1. Model Selection

Choose from available OpenAI models:

- **gpt-4o-mini** (Default) - Fast, cost-effective, good for general use
- **gpt-4o** - More advanced, better reasoning
- **gpt-4-turbo** - Most capable, highest quality responses

**Location:** AI Settings page or `OPENAI_DEFAULT_MODEL` in `.env`

### 2. Temperature (0.0 - 1.0)

Controls randomness and creativity of responses:

| Temperature | Behavior | Best For |
|-------------|----------|----------|
| **0.0 - 0.3** | Focused, deterministic, precise | Factual answers, code generation, technical docs |
| **0.4 - 0.6** | Balanced creativity and accuracy | General conversation, explanations |
| **0.7 - 1.0** | Creative, varied, exploratory | Brainstorming, creative writing, open-ended tasks |

**Default:** 0.3 (precise and accurate)  
**Location:** AI Settings page or `OPENAI_DEFAULT_TEMPERATURE` in `.env`

**Examples:**

- Temperature 0.1: "Laravel is a web application framework..." (same answer every time)
- Temperature 0.9: "Laravel is an elegant PHP framework that..." (varied responses)

### 3. Max Tokens (100 - 4000)

Limits the length of AI responses:

- **100-500 tokens** - Short, concise answers
- **500-1500 tokens** - Medium-length explanations (default: 1500)
- **1500-4000 tokens** - Long, detailed responses

**Note:** 1 token ≈ 4 characters or ≈ 0.75 words

**Location:** AI Settings page or `OPENAI_DEFAULT_MAX_TOKENS` in `.env`

## Configuration Methods

### Method 1: User Settings (Recommended)

1. Navigate to **AI Settings** page (`/settings/ai`)
2. Adjust model, temperature, and max tokens using the UI
3. Click **Save Settings**

Settings are stored in user session and persist across conversations.

### Method 2: Environment Variables

Set system-wide defaults in `.env`:

```bash
# Default AI Model Settings
OPENAI_DEFAULT_MODEL=gpt-4o-mini
OPENAI_DEFAULT_TEMPERATURE=0.3
OPENAI_DEFAULT_MAX_TOKENS=1500
```

These values are used when no user-specific settings exist.

### Method 3: Programmatic (Advanced)

Instantiate `OpenAIService` with custom parameters:

```php
use App\Services\OpenAIService;

$service = new OpenAIService(
    model: 'gpt-4o',
    temperature: 0.7,
    maxTokens: 2000
);

$result = $service->generateResponse($conversation, $message);
```

## System Prompt Customization

The system prompt defines the AI's personality and scope. Located in:

**File:** `app/Services/OpenAIService.php`  
**Method:** `buildMessagesArray()`

**Current Prompt:**

``` note
You are a highly knowledgeable and helpful AI assistant. You can assist with 
a wide range of topics including programming, web development, general knowledge, 
problem-solving, and creative tasks. When discussing code or technical topics, 
provide clear explanations with practical examples. Be accurate, concise, and 
adapt your responses to the user's level of understanding.
```

### Customizing System Prompt

To change AI behavior scope (e.g., make it Laravel-only again):

```php
private function buildMessagesArray(Conversation $conversation): array
{
    $messages = [
        ['role' => 'system', 'content' => 'Your custom prompt here...'],
    ];
    
    // ... rest of code
}
```

**Example Specialized Prompts:**

**Laravel Expert:**

``` note
You are an expert Laravel developer. Provide practical Laravel advice with 
code examples following Laravel best practices.
```

**Creative Writer:**

``` note
You are a creative writing assistant. Help users with storytelling, character 
development, and narrative structure.
```

**Code Reviewer:**

``` note
You are a senior code reviewer. Analyze code for bugs, performance issues, 
security vulnerabilities, and best practices.
```

## Recommended Settings by Use Case

### 1. Technical Q&A / Coding Help

``` note
Model: gpt-4o-mini
Temperature: 0.2
Max Tokens: 1500
```

### 2. General Conversation

``` note
Model: gpt-4o-mini
Temperature: 0.5
Max Tokens: 1000
```

### 3. Creative Writing

``` note
Model: gpt-4o
Temperature: 0.8
Max Tokens: 2500
```

### 4. Code Generation

``` note
Model: gpt-4o
Temperature: 0.1
Max Tokens: 2000
```

### 5. Brainstorming / Ideas

``` note
Model: gpt-4-turbo
Temperature: 0.9
Max Tokens: 1500
```

## Cost Optimization

**Free Tier Limits:**

- OpenAI free tier has strict rate limits
- Use `gpt-4o-mini` for cost-effective responses
- Lower `max_tokens` to reduce usage
- Enable caching (already implemented) for repeated questions

**Production Recommendations:**

- Upgrade to paid OpenAI plan
- Monitor token usage via logs (`storage/logs/ai.log`)
- Set alerts for high usage (see `OpenAIService::calculateCost()`)

## Testing Configuration

Run AI settings tests:

```bash
php artisan test tests/Feature/Settings/AiSettingsTest.php
```

## Troubleshooting

### Issue: Rate Limit Errors

**Solution:** Wait 5-10 minutes or upgrade OpenAI plan

### Issue: Responses too short/long

**Solution:** Adjust `max_tokens` in AI Settings

### Issue: Responses too creative/random

**Solution:** Lower `temperature` to 0.1-0.3

### Issue: Responses too rigid/repetitive

**Solution:** Increase `temperature` to 0.6-0.8

## API Reference

### Session Keys

```php
session('ai_model')       // string: model name
session('ai_temperature') // float: 0.0 - 1.0
session('ai_max_tokens')  // int: 100 - 4000
```

### Config Keys

```php
config('openai.default_model')       // Default: 'gpt-4o-mini'
config('openai.default_temperature') // Default: 0.3
config('openai.default_max_tokens')  // Default: 1500
```

## Further Reading

- [OpenAI Models Documentation](https://platform.openai.com/docs/models)
- [OpenAI Pricing](https://openai.com/pricing)
- [Temperature Parameter Guide](https://platform.openai.com/docs/guides/text-generation/temperature)
