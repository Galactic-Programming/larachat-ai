<?php

// app/Services/OpenAIService.php

namespace App\Services;

use App\Models\AiMessage;
use App\Models\Conversation;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use OpenAI\Laravel\Facades\OpenAI;

class OpenAIService implements AiServiceInterface
{
    private string $model = 'llama-3.3-70b-versatile'; // Groq default model

    private float $temperature = 0.3;

    private int $maxTokens = 1500;

    public function __construct(
        ?string $model = null,
        ?float $temperature = null,
        ?int $maxTokens = null
    ) {
        // Priority: 1. Constructor params, 2. Session, 3. Config, 4. Defaults
        $this->model = $model
            ?? session('ai_model')
            ?? config('openai.default_model')
            ?? $this->model;
        $this->temperature = $temperature ?? session('ai_temperature', $this->temperature);
        $this->maxTokens = $maxTokens ?? session('ai_max_tokens', $this->maxTokens);
    }

    /**
     * Generate AI response for a conversation
     *
     * @return array{response: string, usage: array}
     *
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
            ->map(fn ($msg) => [
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
        return 'ai_response:'.md5($conversationId.':'.$userMessage);
    }

    /**
     * Calculate estimated cost for API usage
     * Groq API is FREE - always returns $0.00
     */
    private function calculateCost(array $usage): float
    {
        // Groq API is completely FREE!
        // No cost calculation needed
        return 0.0;
    }

    /**
     * Generate a title for the conversation
     */
    public function generateTitle(string $context): string
    {
        try {
            $result = OpenAI::chat()->create([
                'model' => $this->model,
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'Generate a short, concise title (max 6 words) for this conversation. Return only the title, no quotes or extra text.',
                    ],
                    [
                        'role' => 'user',
                        'content' => "Conversation excerpt: {$context}",
                    ],
                ],
                'max_tokens' => 20,
                'temperature' => 0.7,
            ]);

            return trim($result->choices[0]->message->content, '"\'');
        } catch (\Exception $e) {
            Log::channel('ai')->error('Failed to generate title', [
                'error' => $e->getMessage(),
            ]);

            return 'New Conversation';
        }
    }

    /**
     * Generate a summary of the conversation
     */
    public function generateSummary(string $conversationText): string
    {
        try {
            $result = OpenAI::chat()->create([
                'model' => $this->model,
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'Summarize this conversation in 2-3 concise sentences. Focus on the main topics discussed and key points.',
                    ],
                    [
                        'role' => 'user',
                        'content' => "Conversation:\n{$conversationText}",
                    ],
                ],
                'max_tokens' => 150,
                'temperature' => 0.5,
            ]);

            return $result->choices[0]->message->content;
        } catch (\Exception $e) {
            Log::channel('ai')->error('Failed to generate summary', [
                'error' => $e->getMessage(),
            ]);

            return 'Unable to generate summary at this time.';
        }
    }

    /**
     * Categorize the conversation
     */
    public function categorize(string $context): string
    {
        try {
            $result = OpenAI::chat()->create([
                'model' => $this->model,
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'Categorize this conversation into ONE of these categories: Tech, Programming, Personal, Work, Education, Creative, Other. Return only the category name.',
                    ],
                    [
                        'role' => 'user',
                        'content' => "Conversation: {$context}",
                    ],
                ],
                'max_tokens' => 10,
                'temperature' => 0.3,
            ]);

            return trim($result->choices[0]->message->content);
        } catch (\Exception $e) {
            Log::channel('ai')->error('Failed to categorize conversation', [
                'error' => $e->getMessage(),
            ]);

            return 'General';
        }
    }

    /**
     * Extract topics from the conversation
     */
    public function extractTopics(string $conversationText): array
    {
        try {
            $result = OpenAI::chat()->create([
                'model' => $this->model,
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'Extract 3-5 key topics from this conversation. Return as comma-separated list. Be concise.',
                    ],
                    [
                        'role' => 'user',
                        'content' => "Conversation: {$conversationText}",
                    ],
                ],
                'max_tokens' => 50,
                'temperature' => 0.5,
            ]);

            $topicsString = $result->choices[0]->message->content;

            return array_map('trim', explode(',', $topicsString));
        } catch (\Exception $e) {
            Log::channel('ai')->error('Failed to extract topics', [
                'error' => $e->getMessage(),
            ]);

            return [];
        }
    }
}
