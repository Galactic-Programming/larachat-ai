<?php
// app/Services/MockOpenAIService.php
namespace App\Services;

use App\Models\Conversation;
use App\Models\AiMessage;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * Mock OpenAI Service for development and testing
 *
 * NOTE: With Groq FREE API, this is mainly useful for:
 * - Offline development (no internet connection)
 * - Unit tests (no external API dependency)
 * - CI/CD pipelines (faster, no rate limits)
 *
 * For normal development, use Groq API directly (AI_USE_MOCK=false in .env)
 */
class MockOpenAIService implements AiServiceInterface
{
    private string $model      = 'llama-3.3-70b-versatile'; // Match Groq default
    private float $temperature = 0.3;
    private int $maxTokens     = 1500;

    public function __construct(
        ?string $model      = null,
        ?float $temperature = null,
        ?int $maxTokens     = null
    ) {
        $this->model       = $model ?? session('ai_model', $this->model);
        $this->temperature = $temperature ?? session('ai_temperature', $this->temperature);
        $this->maxTokens   = $maxTokens ?? session('ai_max_tokens', $this->maxTokens);
    }

    /**
     * Generate mock AI response
     */
    public function generateResponse(Conversation $conversation, string $userMessage): array
    {
        $startTime = microtime(true);

        // Check cache first
        $cacheKey  = $this->getCacheKey($conversation->id, $userMessage);
        $cached    = Cache::get($cacheKey);

        if ($cached) {
            Log::channel('ai')->info('Mock AI response served from cache', [
                'conversation_id' => $conversation->id,
                'duration_ms'     => round((microtime(true) - $startTime) * 1000, 2),
            ]);
            return [
                'response' => $cached['response'],
                'usage'    => ['cached' => true, 'prompt_tokens' => 0, 'completion_tokens' => 0, 'total_tokens' => 0],
            ];
        }

        // Generate contextual mock response
        $response = $this->generateMockResponse($userMessage, $conversation);

        // Estimate token counts
        $promptTokens     = $this->estimateTokens($userMessage);
        $completionTokens = $this->estimateTokens($response);
        $usage            = [
            'prompt_tokens'     => $promptTokens,
            'completion_tokens' => $completionTokens,
            'total_tokens'      => $promptTokens + $completionTokens,
        ];

        // Store AI response
        AiMessage::create([
            'conversation_id' => $conversation->id,
            'role'            => 'assistant',
            'content'         => $response,
            'token_count'     => $usage['completion_tokens'],
        ]);

        // Cache response
        Cache::put($cacheKey, ['response' => $response], now()->addDay());

        $duration = round((microtime(true) - $startTime) * 1000, 2);

        Log::channel('ai')->info('Mock AI response generated', [
            'conversation_id' => $conversation->id,
            'model'           => $this->model . ' (MOCK)',
            'tokens_used'     => $usage['total_tokens'],
            'duration_ms'     => $duration,
            'cost_usd'        => 0.0, // Mock is free!
        ]);

        return [
            'response' => $response,
            'usage'    => $usage,
        ];
    }

    /**
     * Generate contextual mock response based on user input
     */
    private function generateMockResponse(string $userMessage, Conversation $conversation): string
    {
        $messageLower = strtolower($userMessage);

        // Greeting responses
        if (preg_match('/\b(hi|hello|hey|chào|xin chào)\b/i', $messageLower)) {
            return $this->getRandomResponse([
                "Hello! 👋 I'm your AI assistant. I'm currently running in **mock mode** for development and testing. How can I help you today?",
                "Hi there! 😊 I'm here to help. Note that I'm using simulated responses right now, but I can still assist with your questions!",
                "Hey! Welcome! I'm your friendly AI assistant (running in mock mode). What would you like to talk about?",
            ]);
        }

        // Introduction requests
        if (preg_match('/\b(introduce|who are you|what are you|tell me about yourself)\b/i', $messageLower)) {
            return "I'm an AI assistant powered by a mock service for development purposes. 🤖\n\n**About me:**\n- I can help with various topics including programming, Laravel, and general questions\n- Currently running in **mock mode** (no real OpenAI API calls)\n- Responses are simulated but contextually relevant\n- Perfect for testing UI/UX without API costs!\n\nOnce you add OpenAI credits, I'll switch to real GPT-4o-mini for actual AI-powered conversations. What would you like to know?";
        }

        // Laravel/Programming questions
        if (preg_match('/\b(laravel|php|code|programming|eloquent|blade)\b/i', $messageLower)) {
            return "Great question about Laravel/PHP! 💻\n\n**Mock Response:** In a real scenario, I would provide detailed technical guidance here. For example:\n\n```php\n// Example Laravel code\nRoute::get('/users', function () {\n    return User::with('posts')\n        ->latest()\n        ->paginate(15);\n});\n```\n\n**Note:** This is a simulated response. Once connected to OpenAI, I'll provide comprehensive, accurate technical assistance!\n\nWould you like to ask another question to test the chat functionality?";
        }

        // Help/Support requests
        if (preg_match('/\b(help|support|assist|problem|issue)\b/i', $messageLower)) {
            return "I'd be happy to help! 🙋‍♂️\n\n**Current Status:** Mock Mode Active\n\nI can assist with:\n- ✅ Testing the chat interface\n- ✅ Demonstrating conversation flow\n- ✅ Showing message rendering\n- ✅ Testing UI features (Summary, Topics, Export)\n\nFor real AI assistance, you'll need to:\n1. Add $5+ credit to OpenAI account\n2. Switch from mock to real service\n3. Then I'll provide actual AI-powered help!\n\nWhat else would you like to test?";
        }

        // Test/Demo requests
        if (preg_match('/\b(test|demo|try|check)\b/i', $messageLower)) {
            return "Perfect! You're testing the chat system. ✨\n\n**What's working:**\n- ✅ Message sending and receiving\n- ✅ Real-time UI updates\n- ✅ Conversation persistence\n- ✅ Mock AI responses\n\n**Try these commands:**\n- Ask about Laravel\n- Request a summary (after a few messages)\n- Test message export\n- Create multiple conversations\n\nEverything is functional! Once you add OpenAI credit, you'll get real AI responses instead of these simulated ones. 🚀";
        }

        // Vietnamese responses
        if (preg_match('/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/u', $messageLower)) {
            return "Xin chào! Tôi là trợ lý AI của bạn. 🇻🇳\n\n**Trạng thái hiện tại:** Chế độ Mock (Demo)\n\nTôi có thể giúp bạn với nhiều vấn đề khác nhau. Hiện tại tôi đang chạy ở chế độ mô phỏng để bạn có thể test giao diện mà không cần gọi OpenAI API thật.\n\n**Các tính năng hoạt động:**\n- ✅ Gửi và nhận tin nhắn\n- ✅ Lưu trữ hội thoại\n- ✅ Tạo tiêu đề tự động\n- ✅ Xuất dữ liệu\n\nSau khi bạn nạp credit vào OpenAI ($5+), tôi sẽ chuyển sang sử dụng AI thực để trả lời chính xác hơn! 🚀";
        }

        // Default contextual response
        $messageCount = $conversation->messages()->count();

        if ($messageCount <= 2) {
            return "Thanks for your message! 😊\n\n**Mock AI Response:** I understand you said: \"" . substr($userMessage, 0, 100) . (strlen($userMessage) > 100 ? '...' : '') . "\"\n\nIn real mode with OpenAI API, I would provide a detailed, contextual response here. For now, I'm simulating responses to help you test the chat interface.\n\n**This mock service allows you to:**\n- Test all UI features without API costs\n- Verify conversation flow\n- Demo to stakeholders\n- Develop and debug the frontend\n\nReady to switch to real AI? Just add OpenAI credit! 💳";
        }

        return "I've received your message: \"" . substr($userMessage, 0, 150) . (strlen($userMessage) > 150 ? '...' : '') . "\"\n\n**Mock Response #" . ($messageCount + 1) . "**\n\nThis is a simulated AI response for testing purposes. The conversation is being saved correctly, and all features are working!\n\n**Try testing:**\n- Generate Summary button\n- Extract Topics\n- Export conversation\n- Create new conversations\n\nOnce connected to real OpenAI, responses will be intelligent and contextual. For now, enjoy the mock experience! 🎭";
    }

    /**
     * Get random response from array
     */
    private function getRandomResponse(array $responses): string
    {
        return $responses[array_rand($responses)];
    }

    /**
     * Estimate token count (rough approximation)
     */
    private function estimateTokens(string $text): int
    {
        // Rough estimate: 1 token ≈ 4 characters
        return (int) ceil(strlen($text) / 4);
    }

    /**
     * Generate cache key
     */
    private function getCacheKey(int $conversationId, string $userMessage): string
    {
        return 'mock_ai_response:' . md5($conversationId . ':' . $userMessage);
    }

    /**
     * Generate a title for the conversation (Mock)
     */
    public function generateTitle(string $context): string
    {
        Log::channel('ai')->info('Mock: Generating conversation title');

        // Extract first few words as title
        $words = explode(' ', $context);
        $title = implode(' ', array_slice($words, 0, 6));

        return strlen($title) > 50 ? substr($title, 0, 50) . '...' : $title;
    }

    /**
     * Generate a summary of the conversation (Mock)
     */
    public function generateSummary(string $conversationText): string
    {
        Log::channel('ai')->info('Mock: Generating conversation summary');

        return "📝 **Mock Summary**: This is a simulated conversation summary. The actual conversation contains various messages discussing different topics. In production with real AI, this would be an intelligent, context-aware summary of the key points discussed.";
    }

    /**
     * Categorize the conversation (Mock)
     */
    public function categorize(string $context): string
    {
        Log::channel('ai')->info('Mock: Categorizing conversation');

        // Simple keyword-based categorization for mock
        $contextLower = strtolower($context);

        if (preg_match('/\b(code|programming|laravel|php|javascript|developer)\b/i', $contextLower)) {
            return 'Programming';
        }
        if (preg_match('/\b(work|job|career|business|meeting)\b/i', $contextLower)) {
            return 'Work';
        }
        if (preg_match('/\b(learn|study|course|education|tutorial)\b/i', $contextLower)) {
            return 'Education';
        }
        if (preg_match('/\b(creative|design|art|music|writing)\b/i', $contextLower)) {
            return 'Creative';
        }
        if (preg_match('/\b(tech|technology|ai|software|hardware)\b/i', $contextLower)) {
            return 'Tech';
        }

        return 'General';
    }

    /**
     * Extract topics from the conversation (Mock)
     */
    public function extractTopics(string $conversationText): array
    {
        Log::channel('ai')->info('Mock: Extracting conversation topics');

        // Simple keyword extraction for mock
        $keywords = [];
        $text     = strtolower($conversationText);

        // Common tech/programming keywords
        $techKeywords = ['laravel', 'php', 'javascript', 'react', 'database', 'api', 'code', 'development'];
        foreach ($techKeywords as $keyword) {
            if (str_contains($text, $keyword)) {
                $keywords[] = ucfirst($keyword);
            }
        }

        // If no specific keywords found, return generic topics
        if (empty($keywords)) {
            return ['General Discussion', 'Questions', 'Assistance'];
        }

        return array_slice(array_unique($keywords), 0, 5);
    }
}
