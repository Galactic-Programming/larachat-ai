<?php
// app/Http/Middleware/AiRateLimitMiddleware.php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Symfony\Component\HttpFoundation\Response;

class AiRateLimitMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $key = 'ai-requests:' . $request->user()?->id ?? $request->ip();

        // Limit: 20 AI requests per minute per user
        $executed = RateLimiter::attempt(
            $key,
            $perMinute = 20,
            function () {},
            $decaySeconds = 60
        );

        if (!$executed) {
            return response()->json([
                'error'       => 'Too many AI requests. Please slow down.',
                'retry_after' => RateLimiter::availableIn($key),
            ], 429);
        }

        return $next($request);
    }
}
