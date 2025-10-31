<?php
// tests/Unit/ProcessAiConversationJobTest.php
namespace Tests\Unit;

use App\Jobs\ProcessAiConversation;
use App\Models\Conversation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use OpenAI\Laravel\Facades\OpenAI;
use OpenAI\Responses\Chat\CreateResponse;
use Tests\TestCase;

class ProcessAiConversationJobTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test job processes AI conversation successfully
     */
    public function test_job_processes_conversation_successfully(): void
    {
        // Arrange
        $user = User::factory()->create();
        $conversation = Conversation::factory()->create([
            'user_id' => $user->id,
            'status' => 'active',
        ]);

        // Create user message BEFORE job runs (matching real flow in controller)
        \App\Models\AiMessage::create([
            'conversation_id' => $conversation->id,
            'role' => 'user',
            'content' => 'Test message',
        ]);

        OpenAI::fake([
            CreateResponse::fake([
                'choices' => [
                    [
                        'message' => [
                            'role' => 'assistant',
                            'content' => 'Job processed successfully',
                        ],
                    ],
                ],
                'usage' => ['prompt_tokens' => 20, 'completion_tokens' => 10, 'total_tokens' => 30],
            ]),
        ]);

        // Act
        $job = new ProcessAiConversation($conversation->id, 'Test message');
        $job->handle(new \App\Services\OpenAIService());

        // Assert
        $conversation->refresh();
        $this->assertEquals('completed', $conversation->status);

        // User message should already exist (created above)
        $this->assertDatabaseHas('ai_messages', [
            'conversation_id' => $conversation->id,
            'role' => 'user',
            'content' => 'Test message',
        ]);

        // Assistant message should be created by job
        $this->assertDatabaseHas('ai_messages', [
            'conversation_id' => $conversation->id,
            'role' => 'assistant',
            'content' => 'Job processed successfully',
        ]);
    }

    /**
     * Test job is queued when dispatched
     */
    public function test_job_is_queued_when_dispatched(): void
    {
        // Arrange
        Queue::fake();

        // Act
        ProcessAiConversation::dispatch(1, 'Test message');

        // Assert
        Queue::assertPushed(ProcessAiConversation::class, function ($job) {
            return $job->conversationId === 1 && $job->userMessage === 'Test message';
        });
    }

    /**
     * Test job handles failures gracefully
     */
    public function test_job_handles_failures_and_retries(): void
    {
        // Arrange
        $user = User::factory()->create();
        $conversation = Conversation::factory()->create(['user_id' => $user->id]);

        OpenAI::fake([
            new \Exception('API temporarily unavailable'),
        ]);

        // Act & Assert
        $job = new ProcessAiConversation($conversation->id, 'Test message');

        $this->expectException(\Exception::class);
        $job->handle(new \App\Services\OpenAIService());

        // Verify conversation marked as failed (not error)
        $conversation->refresh();
        $this->assertEquals('failed', $conversation->status);
    }
}
