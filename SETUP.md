# 🚀 Larachat AI - Setup Guide

## Prerequisites

- PHP 8.4+
- Composer
- Node.js 18+
- npm or yarn
- SQLite (default) or MySQL/PostgreSQL
- **Groq API Key (FREE!)** - Get from [https://console.groq.com](https://console.groq.com)

## 📦 Installation Steps

### 1. Clone & Install Dependencies

```bash
# Clone repository
git clone <your-repo-url>
cd larachat-ai

# Install PHP dependencies
composer install

# Install JavaScript dependencies
npm install
```

### 2. Environment Setup

```bash
# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

### 3. Configure Environment Variables

Edit `.env` file:

```env
# Application
APP_NAME="Larachat AI"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000

# Database (SQLite - default)
DB_CONNECTION=sqlite
# DB_DATABASE will use database/database.sqlite automatically

# Groq API (FREE!)
GROQ_API_KEY=your-groq-api-key-here
AI_DEFAULT_MODEL=llama-3.3-70b-versatile  # Recommended: fast & capable
AI_USE_MOCK=false  # Set to true for offline development

# OpenAI SDK Configuration (for Groq compatibility)
OPENAI_API_KEY=${GROQ_API_KEY}  # Use same key as Groq
OPENAI_BASE_URL=https://api.groq.com/openai/v1

# Queue (Use 'sync' for development, 'database' for production)
QUEUE_CONNECTION=sync

# Session & Cache
SESSION_DRIVER=database
CACHE_STORE=database
```

### 4. Database Setup

```bash
# Create SQLite database file (if using SQLite)
touch database/database.sqlite

# Run migrations
php artisan migrate

# Seed sample data (optional)
php artisan db:seed
```

### 5. Build Frontend Assets

```bash
# Development build with watch mode
npm run dev

# Or production build
npm run build
```

### 6. Start Development Server

```bash
# Start Laravel server
php artisan serve

# Application will be available at http://127.0.0.1:8000
```

## 🎯 Quick Start (One Command)

For first-time setup:

```bash
composer install && npm install && cp .env.example .env && php artisan key:generate && touch database/database.sqlite && php artisan migrate --seed && npm run build
```

Then just:

```bash
php artisan serve
```

## ⚙️ Configuration Options

### AI Models (Groq - All FREE!)

Available models:

- `llama-3.3-70b-versatile` - **Recommended**: Best overall, fast, versatile
- `llama-3.1-70b-versatile` - Great for coding and analysis
- `llama3-groq-70b-8192-tool-use-preview` - Optimized for function calling
- `mixtral-8x7b-32768` - Ultra-fast with large context window
- `gemma2-9b-it` - Lightweight and fast

Change model in `.env`:

```env
AI_DEFAULT_MODEL=llama-3.3-70b-versatile
```

### Mock Mode (Offline Development)

For development without API calls:

```env
AI_USE_MOCK=true
```

### Queue Driver

**Development (Recommended):**

```env
QUEUE_CONNECTION=sync

``` note
Jobs run immediately, no need for queue worker.

**Production:**

```env
QUEUE_CONNECTION=database
```

**Note:** Jobs run in background. **Must run queue worker:**

```bash
php artisan queue:work --tries=3 --timeout=90
```

### Database Options

**SQLite (Default - Easy for dev):**

```env
DB_CONNECTION=sqlite
```

**MySQL:**

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=larachat
DB_USERNAME=root
DB_PASSWORD=
```

## 🔐 Authentication Setup

The app uses Laravel Fortify with 2FA support:

1. Register at `/register`
2. Login at `/login`
3. Optional: Enable 2FA in profile settings

## 🧪 Testing

```bash
# Run all tests
php artisan test

# Run specific test suite
php artisan test --filter=AiChatController

# Run with coverage (requires Xdebug)
php artisan test --coverage
```

## 🛠️ Development Commands

```bash
# Clear all caches
php artisan optimize:clear

# Format code with Pint
./vendor/bin/pint

# Type check frontend
npm run types

# Lint frontend
npm run lint

# Build for production
npm run build
```

## 📝 Common Issues

### Issue: "CSRF token mismatch"

**Solution:**

```bash
php artisan config:clear
php artisan cache:clear
```

### Issue: "Queue jobs not processing"

**Solution:**

- Development: Use `QUEUE_CONNECTION=sync`
- Production: Run `php artisan queue:work`

### Issue: "Groq API errors"

**Solution:**

- Check API key is valid at [https://console.groq.com](https://console.groq.com)
- Verify model name matches available Groq models
- Check rate limits (generous for FREE tier)
- For offline development, set `AI_USE_MOCK=true`

### Issue: Frontend not updating

**Solution:**

```bash
npm run build
# Or for watch mode:
npm run dev
```

## 🚀 Production Deployment

1. Set environment to production:

```env
APP_ENV=production
APP_DEBUG=false
QUEUE_CONNECTION=database
```

1. Optimize for production:

```bash
composer install --optimize-autoloader --no-dev
npm run build
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

1. Setup queue worker as system service:

```bash
php artisan queue:work --daemon --tries=3 --timeout=90
```

1. Configure web server (Nginx/Apache)

## 📚 Additional Resources

- [Laravel Documentation](https://laravel.com/docs)
- [Inertia.js Documentation](https://inertiajs.com)
- [Groq API Documentation](https://console.groq.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🆘 Support

For issues or questions:

- Check logs: `storage/logs/laravel.log`
- Run tests: `php artisan test`

---

**Note:** Remember to add your Groq API key (FREE!) before using the chat features! Get yours at [https://console.groq.com](https://console.groq.com)
