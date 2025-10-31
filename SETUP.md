# 🚀 Laravel AI Chat - Setup Guide

## Prerequisites

- PHP 8.2+
- Composer
- Node.js 18+
- npm or yarn
- SQLite (default) or MySQL/PostgreSQL
- OpenAI API Key

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
APP_NAME="Laravel AI Chat"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000

# Database (SQLite - default)
DB_CONNECTION=sqlite
# DB_DATABASE will use database/database.sqlite automatically

# OpenAI API
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-4o-mini  # or gpt-4o, gpt-4-turbo

# Queue (Use 'sync' for development, 'database' for production)
QUEUE_CONNECTION=sync

# Session & Cache
SESSION_DRIVER=file
CACHE_STORE=file
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

### Queue Driver

**Development (Recommended):**

```env
QUEUE_CONNECTION=sync

``` note
Jobs run immediately, no need for queue worker.

**Production:**
```env
QUEUE_CONNECTION=database

``` note
Jobs run in background. **Must run queue worker:**

```bash
php artisan queue:work --tries=3 --timeout=90
```

### OpenAI Model Options

- `gpt-4o-mini` - Fast & cheap (recommended for dev)
- `gpt-4o` - More capable, slower
- `gpt-4-turbo` - Balanced performance

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

### Issue: "OpenAI API errors"

**Solution:**

- Check API key is valid
- Ensure you have credits in OpenAI account
- Verify model name is correct

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
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🆘 Support

For issues or questions:

- Check logs: `storage/logs/laravel.log`
- AI-specific logs: `storage/logs/ai.log`
- Run tests: `php artisan test`

---

**Note:** Remember to add your OpenAI API key before using the chat features!
