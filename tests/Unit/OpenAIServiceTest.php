<?php
// tests/Unit/OpenAIServiceTest.php
namespace Tests\Unit;

use App\Models\Conversation;
use App\Models\User;
use App\Services\OpenAIService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use OpenAI\Laravel\Facades\OpenAI;
use OpenAI\Responses\Chat\CreateResponse;
use Tests\TestCase;

class OpenAIServiceTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test AI response generation with mocked OpenAI
     */
    public function test_generates_ai_response_successfully(): void
    {
        // Arrange
        $user = User::factory()->create();
        $conversation = Conversation::factory()->create(['user_id' => $user->id]);

        // Create user message BEFORE service call (matching real controller flow)
        \App\Models\AiMessage::create([
            'conversation_id' => $conversation->id,
            'role' => 'user',
            'content' => 'What are Laravel service containers?',
        ]);

        // Mock OpenAI facade
        OpenAI::fake([
            CreateResponse::fake([
                'choices' => [
                    [
                        'message' => [
                            'role' => 'assistant',
                            'content' => 'Laravel service containers manage class dependencies and perform dependency injection.',
                        ],
                    ],
                ],
                'usage' => [
                    'prompt_tokens' => 50,
                    'completion_tokens' => 20,
                    'total_tokens' => 70,
                ],
            ]),
        ]);

        $service = new OpenAIService();

        // Act
        $result = $service->generateResponse($conversation, 'What are Laravel service containers?');

        // Assert
        $this->assertArrayHasKey('response', $result);
        $this->assertArrayHasKey('usage', $result);
        $this->assertStringContainsString('service container', strtolower($result['response']));
        $this->assertEquals(70, $result['usage']['total_tokens']);

        // Verify user message already exists (created above)
        $this->assertDatabaseHas('ai_messages', [
            'conversation_id' => $conversation->id,
            'role' => 'user',
            'content' => 'What are Laravel service containers?',
        ]);

        // Verify AI message was created by service
        $this->assertDatabaseHas('ai_messages', [
            'conversation_id' => $conversation->id,
            'role' => 'assistant',
            'content' => 'Laravel service containers manage class dependencies and perform dependency injection.',
        ]);
    }

    /**
     * Test error handling when OpenAI API fails
     */
    public function test_handles_openai_api_errors_gracefully(): void
    {
        // Arrange
        $user = User::factory()->create();
        $conversation = Conversation::factory()->create(['user_id' => $user->id]);

        // Mock OpenAI failure
        OpenAI::fake([
            new \Exception('OpenAI API connection failed'),
        ]);

        $service = new OpenAIService();

        // Act & Assert
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('OpenAI API connection failed');

        $service->generateResponse($conversation, 'Test question');
    }

    /**
     * Test caching prevents duplicate API calls
     */
    public function test_caching_prevents_duplicate_api_calls(): void
    {
        // Arrange
        $user = User::factory()->create();
        $conversation = Conversation::factory()->create(['user_id' => $user->id]);

        OpenAI::fake([
            CreateResponse::fake([
                'choices' => [
                    [
                        'message' => [
                            'role' => 'assistant',
                            'content' => 'Cached response',
                        ],
                    ],
                ],
                'usage' => [
                    'prompt_tokens' => 10,
                    'completion_tokens' => 5,
                    'total_tokens' => 15,
                ],
            ]),
        ]);

        $service = new OpenAIService();

        // Act - First call
        $result1 = $service->generateResponse($conversation, 'Same question');

        // Act - Second call (should use cache)
        $result2 = $service->generateResponse($conversation, 'Same question');

        // Assert
        $this->assertEquals($result1['response'], $result2['response']);
        $this->assertTrue($result2['usage']['cached'] ?? false);
        $this->assertEquals(0, $result2['usage']['total_tokens']);
    }
}
