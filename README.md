# 🤖 Larachat AI

A modern, real-time AI chat application built with Laravel 12, React, TypeScript, and **Groq FREE API**.

## ✨ Features

- 💬 **Real-time AI Conversations** - Chat with AI using Groq's FREE Llama models
- 🔄 **Multiple Conversations** - Create and manage multiple chat threads
- 🎯 **Smart AI Features** - Auto-generate summaries, extract topics, categorize conversations
- 🔐 **Secure Authentication** - Laravel Sanctum SPA authentication with 2FA support
- ⚡ **Rate Limiting** - Built-in rate limiting (20 requests/minute)
- 🎨 **Modern UI** - Beautiful interface with Tailwind CSS and shadcn/ui
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile
- 🧪 **Fully Tested** - Comprehensive test suite with Pest PHP
- 🆓 **100% FREE AI** - Powered by Groq's generous free tier

## 🛠️ Tech Stack

### Backend

- **Laravel 12** - PHP framework
- **PHP 8.4+** - Latest PHP version
- **SQLite/MySQL** - Database options
- **Laravel Sanctum** - API authentication
- **Laravel Fortify** - Authentication scaffolding
- **Groq API** - FREE AI integration (via OpenAI SDK compatibility)

### Frontend

- **React 19** - UI library
- **TypeScript** - Type safety
- **Inertia.js v2** - SPA framework
- **Tailwind CSS v4** - Styling
- **shadcn/ui** - Component library
- **Radix UI** - Accessible primitives

### Testing

- **Pest PHP** - Testing framework
- **PHPUnit** - Unit testing
- **Feature Tests** - E2E testing

## 🚀 Quick Start

See [SETUP.md](./SETUP.md) for detailed installation instructions.

**TL;DR:**

```bash
# 1. Install dependencies
composer install && npm install

# 2. Setup environment
cp .env.example .env
php artisan key:generate

# 3. Add your Groq API key to .env (FREE at https://console.groq.com)
# GROQ_API_KEY=gsk_...
# AI_DEFAULT_MODEL=llama-3.3-70b-versatile

# 4. Setup database
touch database/database.sqlite
php artisan migrate

# 5. Build frontend and start server
npm run build
php artisan serve
```

Visit `http://127.0.0.1:8000` and register to start chatting!

## 📖 Documentation

- **[📚 Full Documentation](./docs/README.md)** - Complete project documentation index
- **[Setup Guide](./SETUP.md)** - Installation and configuration guide
- **[Foundation Complete](./docs/FOUNDATION_COMPLETE.md)** - Phase 1-4A development summary
- **[Task #10 Summary](./docs/TASK-10-COMPLETION-SUMMARY.md)** - Final polish implementation details
- **[AI Configuration](./docs/AI_CONFIGURATION.md)** - Groq API setup and configuration

## 🏗️ Architecture Overview

### Backend Structure

```plaintext
app/
├── Http/Controllers/
│   └── AiChatController.php      # Main API endpoints
├── Services/
│   ├── AiServiceInterface.php    # Service layer interface
│   ├── OpenAIService.php         # Groq API integration (via OpenAI SDK)
│   └── MockOpenAIService.php     # Mock service for testing
├── Jobs/
│   ├── ProcessAiConversation.php       # Async AI response processing
│   ├── GenerateConversationSummary.php # Summary generation
│   ├── ExtractConversationTopics.php   # Topic extraction
│   └── CategorizeConversation.php      # Conversation categorization
└── Models/
    ├── Conversation.php          # Chat conversations
    ├── AiMessage.php             # Individual messages
    └── User.php                  # User authentication
```

### Frontend Structure

```plaintext
resources/js/
├── pages/
│   └── chat/
│       └── index.tsx             # Main chat page
├── components/chat/
│   ├── chat-message.tsx          # Single message display
│   ├── chat-input.tsx            # Message input form
│   ├── message-list.tsx          # Message list container
│   ├── chat-sidebar.tsx          # Conversation list
│   └── chat-header.tsx           # Chat header with actions
├── hooks/
│   ├── use-chat.ts               # Chat state management
│   ├── use-conversations.ts      # Conversations CRUD
│   └── use-status-polling.ts     # AI response polling
└── types/
    └── chat.d.ts                 # TypeScript definitions
```

## 🔌 API Endpoints

### Conversations

```http
GET    /api/conversations           # List all conversations
POST   /api/conversations           # Create new conversation
GET    /api/conversations/{id}      # Get single conversation
DELETE /api/conversations/{id}      # Delete conversation
```

### Messages

```http
POST   /api/conversations/{id}/messages   # Send message
GET    /api/conversations/{id}/poll        # Poll AI response status
```

### AI Features

```http
POST   /api/conversations/{id}/summary     # Generate summary
POST   /api/conversations/{id}/topics      # Extract topics
POST   /api/conversations/{id}/categorize  # Categorize conversation
```

## 🧪 Testing

```bash
# Run all tests
php artisan test

# Run specific test file
php artisan test tests/Feature/AiChatControllerTest.php

# Run with coverage
php artisan test --coverage

# Format code before committing
./vendor/bin/pint
```

Current test coverage: **62 tests, 252 assertions** (100% passing)

## 🔧 Configuration

### Queue Driver

**Development (Default):**

```env
QUEUE_CONNECTION=sync
```

Jobs process immediately. No queue worker needed.

**Production:**

```env
QUEUE_CONNECTION=database
```

Requires running queue worker:

```bash
php artisan queue:work --tries=3 --timeout=90
```

### Rate Limiting

Default: 20 requests per minute per user

Configure in `app/Http/Middleware/AiRateLimitMiddleware.php`

### Groq AI Configuration

Edit `config/ai.php` or use environment variables:

```env
GROQ_API_KEY=gsk_...
AI_DEFAULT_MODEL=llama-3.3-70b-versatile
AI_USE_MOCK=false  # Set to true for offline development

# OpenAI SDK Configuration (for Groq compatibility)
OPENAI_API_KEY=${GROQ_API_KEY}
OPENAI_BASE_URL=https://api.groq.com/openai/v1
```

Available models (all FREE!):

- `llama-3.3-70b-versatile` - **Recommended**: Best overall, fast, versatile (131K context)
- `llama-3.1-8b-instant` - Ultra-fast responses, lightweight (131K context)

**Note:** As of November 2025, only these 2 Groq models are currently working. Many others have been deprecated.

## 📝 Development Workflow

1. **Make changes** to backend or frontend code
2. **Run tests** - `php artisan test --filter=relevant`
3. **Format code** - `./vendor/bin/pint`
4. **Type check** - `npm run types` (frontend)
5. **Build** - `npm run build` or `npm run dev`
6. **Test manually** - `php artisan serve`

## 🐛 Troubleshooting

### Queue Jobs Not Processing

**Symptom:** AI responses stuck on "Processing..."

**Solution:**

- Check `QUEUE_CONNECTION` in `.env`
- Use `sync` for development
- For production, run `php artisan queue:work`

### CSRF Token Mismatch

**Symptom:** 419 errors on API requests

**Solution:**

```bash
php artisan config:clear
php artisan cache:clear
```

### Frontend Not Updating

**Symptom:** Changes don't appear in browser

**Solution:**

```bash
npm run build  # Production build
# OR
npm run dev    # Watch mode
```

## 📊 Performance

- **Message send time:** ~100-200ms (excluding AI processing)
- **AI response time:** 2-5 seconds (depends on model)
- **Polling interval:** 2 seconds
- **Rate limit:** 20 requests/minute
- **Database:** SQLite (dev), MySQL/PostgreSQL (production)

## 🔐 Security Features

- ✅ CSRF protection on all state-changing requests
- ✅ Sanctum SPA authentication
- ✅ Rate limiting per user
- ✅ Input sanitization
- ✅ SQL injection prevention (Eloquent ORM)
- ✅ XSS protection (React escaping)
- ✅ 2FA support (Laravel Fortify)

## 🚀 Deployment

See [SETUP.md](./SETUP.md) for production deployment steps.

Key points:

- Set `APP_ENV=production` and `APP_DEBUG=false`
- Run optimization commands
- Setup queue worker as system service
- Configure web server (Nginx/Apache)
- Use proper database (MySQL/PostgreSQL)
- Enable Redis for cache/sessions

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Make changes and add tests
4. Run `./vendor/bin/pint` to format code
5. Run `php artisan test` to verify tests pass
6. Commit changes (`git commit -m 'Add amazing feature'`)
7. Push to branch (`git push origin feature/amazing-feature`)
8. Open Pull Request

## 📄 License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

## 🙏 Acknowledgments

- [Laravel](https://laravel.com) - PHP framework
- [React](https://react.dev) - UI library
- [Inertia.js](https://inertiajs.com) - SPA bridge
- [Groq](https://groq.com) - FREE ultra-fast AI inference
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [shadcn/ui](https://ui.shadcn.com) - Components

---

Happy Chatting! 🎉

For questions or issues, check the logs at `storage/logs/laravel.log`
