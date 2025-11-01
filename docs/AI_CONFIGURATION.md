# AI Configuration Guide
<!-- markdownlint-disable MD013 -->

This document explains how to configure the AI chatbot behavior in Larachat AI.

## Overview

The chatbot uses **Groq API (FREE)** with OpenAI SDK compatibility. Groq provides
fast, free access to powerful models like Llama 3.3 70B Versatile. Users can
customize settings via the AI Settings page or system defaults in .env.

**Important:** As of November 2025, only 2 Groq models are currently working:

- llama-3.3-70b-versatile - Best overall, recommended
- llama-3.1-8b-instant - Ultra-fast for simple tasks

## Key Configuration Parameters

### 1. Model Selection

Choose from available Groq models (verified Nov 2025):

- **llama-3.3-70b-versatile** (Default)  - Best overall, fast, versatile
- **llama-3.1-8b-instant**  - Ultra-fast, lightweight for simple tasks

**Location:** AI Settings page or AI_DEFAULT_MODEL in .env

### 2. Temperature (0.0 - 1.0)

Controls randomness and creativity of responses:

| Temperature | Behavior | Best For |
|-------------|----------|----------|
| **0.0 - 0.3** | Focused, deterministic, precise | Factual answers |
| **0.4 - 0.6** | Balanced creativity and accuracy | General conv. |
| **0.7 - 1.0** | Creative, varied, exploratory | Brainstorming |

**Default:** 0.7 (balanced)  
**Location:** AI Settings page or config
ai.temperature.default

**Examples:**

- Temperature 0.1: 'Laravel is a web application framework...' (same answer every time)
- Temperature 0.9: 'Laravel is an elegant PHP framework that...' (varied responses)

### 3. Max Tokens (100 - 32768)

Limits the length of AI responses:

- **100-500 tokens** - Short, concise answers
- **500-1500 tokens** - Medium-length explanations
- **1500-8000 tokens** - Long, detailed responses
- **8000-32768 tokens** - Very long documents (Llama 3.3 70B supports up to 32K)

**Note:** 1 token ≈ 4 characters or ≈ 0.75 words

**Location:** Configured per request in OpenAIService

## Configuration Methods

### Method 1: User Settings (Recommended)

1. Navigate to **AI Settings** page (/settings/ai)
2. Select from 2 working models:
   - Llama 3.3 70B Versatile (Recommended)
   - Llama 3.1 8B Instant (Fast)
3. Adjust temperature (0.0-1.0)
4. Click **Save Settings**

Settings are stored in user session and persist across conversations.

### Method 2: Environment Variables

Set system-wide defaults in .env:

```bash
# Groq API Configuration (FREE!)

GROQ_API_KEY=your_groq_api_key_here
AI_DEFAULT_MODEL=llama-3.3-70b-versatile
AI_USE_MOCK=false

# OpenAI SDK Compatibility - Points to Groq
OPENAI_BASE_URL=https://api.groq.com/openai/v1
```

Get your FREE Groq API key at: <https://console.groq.com/keys>

### Method 3: Programmatic (Advanced)

Use the AI Service Interface:

```php
use App\Services\AiServiceInterface;

$aiService = app(AiServiceInterface::class);
$response = $aiService->generateResponse($message, $context);
```

## System Prompt Customization

The system prompt defines the AI's personality and scope. Located in:

**File:** app/Services/OpenAIService.php  
**Method:** buildMessagesArray()

**Current Prompt:**

```text
You are a highly knowledgeable and helpful AI assistant powered by Groq.
You can assist with a wide range of topics including programming, web development,
general knowledge, problem-solving, and creative tasks. When discussing code or
technical topics, provide clear explanations with practical examples. Be accurate,
concise, and adapt your responses to the user's level of understanding.
```

### Customizing System Prompt

To change AI behavior scope:

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

```text
You are an expert Laravel developer. Provide practical Laravel advice with
code examples following Laravel best practices.
```

**Creative Writer:**

```text
You are a creative writing assistant. Help users with storytelling, character
development, and narrative structure.
```

**Code Reviewer:**

```text
You are a senior code reviewer. Analyze code for bugs, performance issues,
security vulnerabilities, and best practices.
```

## Recommended Settings by Use Case

### 1. Technical Q&A / Coding Help

```yaml
Model: llama-3.3-70b-versatile
Temperature: 0.3
```

### 2. General Conversation

```yaml
Model: llama-3.3-70b-versatile
Temperature: 0.7
```

### 3. Creative Writing

```yaml
Model: llama-3.3-70b-versatile
Temperature: 0.9
```

### 4. Code Generation

```yaml
Model: llama-3.3-70b-versatile
Temperature: 0.2
```

### 5. Fast Responses / Simple Tasks

```yaml
Model: llama-3.1-8b-instant
Temperature: 0.5
```

## Cost & Performance

**Groq API Benefits:**

- **100% FREE** - No credit card required
- **Fast inference** - Up to 800+ tokens/second
- **Generous rate limits** - Suitable for development and small production apps
- **OpenAI compatible** - Use familiar OpenAI SDK syntax
- **Multiple models** - Switch between Llama models

**No Cost Optimization Needed:**

- All models are free to use
- No token counting required
- Focus on functionality, not billing

## Mock Mode for Development

Enable mock mode to develop/test without API calls:

```bash
AI_USE_MOCK=true
```

Mock service returns realistic fake responses instantly. Perfect for:

- Frontend development
- Testing
- Offline development
- CI/CD pipelines

## Testing Configuration

Run AI settings tests:

```bash
php artisan test tests/Feature/Settings/AiSettingsTest.php
```

## Troubleshooting

### Issue: Rate Limit Errors

**Solution:** Groq has generous rate limits. If you hit them, wait briefly or consider upgrading to Groq paid tier for higher limits.

### Issue: Responses too short/long

**Solution:** Groq models have different max_tokens. Llama 3.3 supports up to 32K tokens.

### Issue: Responses too creative/random

**Solution:** Lower temperature to 0.1-0.3

### Issue: Responses too rigid/repetitive

**Solution:** Increase temperature to 0.6-0.9

### Issue: Want to switch back to OpenAI

**Solution:**

1. Get OpenAI API key
2. Set OPENAI_API_KEY in .env
3. Remove OPENAI_BASE_URL or set to <https://api.openai.com/v1>
4. Update AI_DEFAULT_MODEL to OpenAI model (e.g., gpt-4o-mini)

### Issue: Only 2 models available

**Explanation:** As of November 2025, Groq has deprecated many models.
Only 2 models are currently working: llama-3.3-70b-versatile and
llama-3.1-8b-instant. All deprecated models have been disabled in
config/ai.php. This may change in the future - check Groq console
for updates.

## API Reference

### Session Keys

```php
session('ai_model')       // string: model name
session('ai_temperature') // float: 0.0 - 1.0
```

### Config Keys

```php
config('ai.default_model')        // Default: 'llama-3.3-70b-versatile'
config('ai.use_mock')             // bool: false (use real API)
config('ai.temperature.default')  // Default: 0.7
config('ai.models')               // Array of available
models
```

### OpenAI Config (Groq Compatibility)

```php
config('openai.api_key')     // Groq API key
config('openai.base_uri')    // 'https://api.groq.com/openai/v1'
```

## Further Reading

- [Groq Documentation](https://console.groq.com/docs)
- [Groq Models](https://console.groq.com/docs/models)
- [Groq API Keys](https://console.groq.com/keys) - Get your free key
- [OpenAI SDK Compatibility](https://console.groq.com/docs/openai)
- [Temperature Parameter Guide](https://platform.openai.com/docs/guides/text-generation/temperature)

---

**Last Updated:** November 1, 2025  
**Groq Models Verified:** November 1, 2025
