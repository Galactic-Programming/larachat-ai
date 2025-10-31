<?php
// app/Services/OpenAIService.php
namespace App\Services;

use App\Models\Conversation;
use App\Models\AiMessage;
use OpenAI\Laravel\Facades\OpenAI;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class OpenAIService
{
    private string $model = 'gpt-4.1-nano';
    private float $temperature = 0.3;
    private int $maxTokens = 1500;

    public function __construct(
        ?string $model = null,
        ?float $temperature = null,
        ?int $maxTokens = null
    ) {
        // Priority: 1. Constructor params, 2. Session, 3. Defaults
        $this->model = $model ?? session('ai_model', $this->model);
        $this->temperature = $temperature ?? session('ai_temperature', $this->temperature);
        $this->maxTokens = $maxTokens ?? session('ai_max_tokens', $this->maxTokens);
    }

    /**
     * Generate AI response for a conversation
     *
     * @param Conversation $conversation
     * @param string $userMessage
     * @return array{response: string, usage: array}
     * @throws \Exception
     */
    public function generateResponse(Conversation $conversation, string $userMessage): array
    {
        $startTime = microtime(true);

        // Check cache first (identical questions within 24 hours)
        $cacheKey = $this->getCacheKey($conversation->id, $userMessage);
        $cached = Cache::get($cacheKey);

        if ($cached) {
            Log::channel('ai')->info('AI response served from cache', [
                'conversation_id' => $conversation->id,
                'duration_ms' => round((microtime(true) - $startTime) * 1000, 2),
            ]);
            return [
                'response' => $cached['response'],
                'usage' => ['cached' => true, 'prompt_tokens' => 0, 'completion_tokens' => 0, 'total_tokens' => 0],
            ];
        }

        // NOTE: User message is already stored by controller before job dispatch
        // We don't create it again here to avoid duplicates

        // Build message array for OpenAI (include conversation history)
        $messages = $this->buildMessagesArray($conversation);

        try {
            // Call OpenAI API
            $result = OpenAI::chat()->create([
                'model' => $this->model,
                'messages' => $messages,
                'temperature' => $this->temperature,
                'max_tokens' => $this->maxTokens,
            ]);

            $response = $result->choices[0]->message->content;
            $usage = [
                'prompt_tokens' => $result->usage->promptTokens,
                'completion_tokens' => $result->usage->completionTokens,
                'total_tokens' => $result->usage->totalTokens,
            ];

            // Store AI response
            AiMessage::create([
                'conversation_id' => $conversation->id,
                'role' => 'assistant',
                'content' => $response,
                'token_count' => $usage['completion_tokens'],
            ]);

            // Cache response for 24 hours
            Cache::put($cacheKey, ['response' => $response], now()->addDay());

            // Log successful API call with metrics
            $duration = round((microtime(true) - $startTime) * 1000, 2);
            $cost = $this->calculateCost($usage);

            Log::channel('ai')->info('OpenAI API call succeeded', [
                'conversation_id' => $conversation->id,
                'model' => $this->model,
                'tokens_used' => $usage['total_tokens'],
                'duration_ms' => $duration,
                'cost_usd' => $cost,
            ]);

            // Alert if costs spike
            if ($usage['total_tokens'] > 5000) {
                Log::channel('ai')->warning('High token usage detected', [
                    'conversation_id' => $conversation->id,
                    'tokens' => $usage['total_tokens'],
                ]);
            }

            return [
                'response' => $response,
                'usage' => $usage,
            ];

        } catch (\Exception $e) {
            Log::channel('ai')->error('OpenAI API call failed', [
                'conversation_id' => $conversation->id,
                'error' => $e->getMessage(),
                'duration_ms' => round((microtime(true) - $startTime) * 1000, 2),
            ]);
            throw $e;
        }
    }

    /**
     * Build messages array for OpenAI API from conversation history
     */
    private function buildMessagesArray(Conversation $conversation): array
    {
        // System message first
        $messages = [
            ['role' => 'system', 'content' => 'You are a highly knowledgeable and helpful AI assistant. You can assist with a wide range of topics including programming, web development, general knowledge, problem-solving, and creative tasks. When discussing code or technical topics, provide clear explanations with practical examples. Be accurate, concise, and adapt your responses to the user\'s level of understanding.'],
        ];

        // Append conversation history (last 10 messages to stay under token limits)
        $historyMessages = $conversation->messages()
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->reverse()
            ->map(fn($msg) => [
                'role' => $msg->role,
                'content' => $msg->content,
            ])
            ->toArray();

        return array_merge($messages, $historyMessages);
    }

    /**
     * Generate cache key for identical user messages
     */
    private function getCacheKey(int $conversationId, string $userMessage): string
    {
        return 'ai_response:' . md5($conversationId . ':' . $userMessage);
    }

    /**
     * Cache AI responses with semantic similarity matching
     */
    private function getCachedResponse(string $message): ?string
    {
        // Exact match cache (24 hours)
        $exactCacheKey = 'ai_exact:' . md5($message);
        if ($cached = Cache::store('ai_responses')->get($exactCacheKey)) {
            return $cached;
        }

        // Semantic similarity cache (for similar questions)
        // In production, use vector similarity search
        $similarCacheKey = 'ai_similar:' . md5(substr($message, 0, 100));
        if ($cached = Cache::store('ai_responses')->get($similarCacheKey)) {
            return $cached;
        }

        return null;
    }

    private function cacheResponse(string $message, string $response): void
    {
        $exactCacheKey = 'ai_exact:' . md5($message);
        $similarCacheKey = 'ai_similar:' . md5(substr($message, 0, 100));

        // Cache exact match for 24 hours
        Cache::store('ai_responses')->put($exactCacheKey, $response, now()->addDay());

        // Cache semantic match for 12 hours
        Cache::store('ai_responses')->put($similarCacheKey, $response, now()->addHours(12));
    }

    /**
     * Calculate estimated cost for API usage
     * Based on model pricing (adjust as needed)
     */
    private function calculateCost(array $usage): float
    {
        // Pricing for gpt-4.1-nano (example - adjust to actual pricing)
        // For free tier models, cost is 0
        $promptCostPer1k = 0.0; // Free tier
        $completionCostPer1k = 0.0; // Free tier

        // If using paid models, uncomment and adjust:
        // $promptCostPer1k = 0.01; // GPT-4 Turbo example
        // $completionCostPer1k = 0.03;

        $promptCost = ($usage['prompt_tokens'] / 1000) * $promptCostPer1k;
        $completionCost = ($usage['completion_tokens'] / 1000) * $completionCostPer1k;

        return round($promptCost + $completionCost, 6);
    }
}
