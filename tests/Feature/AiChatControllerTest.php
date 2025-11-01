<?php

// tests/Feature/AiChatControllerTest.php

namespace Tests\Feature;

use App\Models\Conversation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use OpenAI\Laravel\Facades\OpenAI;
use OpenAI\Responses\Chat\CreateResponse;
use Tests\TestCase;

class AiChatControllerTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test creating a new conversation
     */
    public function test_user_can_create_conversation(): void
    {
        // Arrange
        /** @var User $user */
        $user = User::factory()->create();

        // Act
        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/conversations', [
                'title' => 'My AI Conversation',
            ]);

        // Assert
        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'conversation' => [
                    'title' => 'My AI Conversation',
                    'user_id' => $user->id,
                    'status' => 'active',
                ],
            ]);

        $this->assertDatabaseHas('conversations', [
            'user_id' => $user->id,
            'title' => 'My AI Conversation',
        ]);
    }

    /**
     * Test sending message to AI conversation
     */
    public function test_user_can_send_message_to_conversation(): void
    {
        // Arrange
        /** @var User $user */
        $user = User::factory()->create();
        $conversation = Conversation::factory()->create(['user_id' => $user->id]);

        OpenAI::fake([
            CreateResponse::fake([
                'choices' => [
                    [
                        'message' => [
                            'role' => 'assistant',
                            'content' => 'Laravel Eloquent is an ORM that simplifies database interactions.',
                        ],
                    ],
                ],
                'usage' => [
                    'prompt_tokens' => 30,
                    'completion_tokens' => 15,
                    'total_tokens' => 45,
                ],
            ]),
        ]);

        // Act
        $response = $this->actingAs($user, 'sanctum')
            ->postJson("/api/conversations/{$conversation->id}/messages", [
                'message' => 'What is Laravel Eloquent?',
            ]);

        // Assert - Should return 202 for async processing
        $response->assertStatus(202)
            ->assertJson([
                'success' => true,
                'status' => 'processing',
            ]);
    }

    /**
     * Test rate limiting prevents excessive requests
     */
    public function test_rate_limiting_blocks_excessive_requests(): void
    {
        // Arrange
        /** @var User $user */
        $user = User::factory()->create();
        $conversation = Conversation::factory()->create(['user_id' => $user->id]);

        // Create 21 fake responses for the rate limit test
        $fakeResponses = [];
        for ($i = 0; $i < 21; $i++) {
            $fakeResponses[] = CreateResponse::fake([
                'choices' => [['message' => ['role' => 'assistant', 'content' => "Response {$i}"]]],
                'usage' => ['prompt_tokens' => 10, 'completion_tokens' => 5, 'total_tokens' => 15],
            ]);
        }

        OpenAI::fake($fakeResponses);

        // Act - Make 21 requests (exceeds 20/minute limit)
        for ($i = 0; $i < 21; $i++) {
            $response = $this->actingAs($user, 'sanctum')
                ->postJson("/api/conversations/{$conversation->id}/messages", [
                    'message' => "Test message {$i}",
                ]);

            if ($i < 20) {
                // First 20 should return 202 (async processing accepted)
                $response->assertStatus(202);
            } else {
                // Assert - 21st request should be rate limited
                $response->assertStatus(429);
            }
        }
    }

    /**
     * Test user cannot access other users' conversations
     */
    public function test_user_cannot_access_other_users_conversations(): void
    {
        // Arrange
        /** @var User $user1 */
        $user1 = User::factory()->create();
        /** @var User $user2 */
        $user2 = User::factory()->create();
        $conversation = Conversation::factory()->create(['user_id' => $user2->id]);

        // Act
        $response = $this->actingAs($user1, 'sanctum')
            ->getJson("/api/conversations/{$conversation->id}");

        // Assert
        $response->assertStatus(404);  // Not found (authorization failure)
    }

    /**
     * Test user can list all their conversations
     */
    public function test_user_can_list_conversations(): void
    {
        // Arrange
        /** @var User $user */
        $user = User::factory()->create();
        $conversation1 = Conversation::factory()->create(['user_id' => $user->id, 'title' => 'Conv 1']);
        $conversation2 = Conversation::factory()->create(['user_id' => $user->id, 'title' => 'Conv 2']);
        $otherUserConv = Conversation::factory()->create(); // Another user's conversation

        // Act
        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/conversations');

        // Assert
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'conversations' => [
                    '*' => ['id', 'title', 'user_id', 'status', 'created_at', 'updated_at', 'messages'],
                ],
            ])
            ->assertJsonCount(2, 'conversations');
    }

    /**
     * Test user can delete their conversation
     */
    public function test_user_can_delete_conversation(): void
    {
        // Arrange
        /** @var User $user */
        $user = User::factory()->create();
        $conversation = Conversation::factory()->create(['user_id' => $user->id]);

        // Act
        $response = $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/conversations/{$conversation->id}");

        // Assert
        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        $this->assertSoftDeleted('conversations', ['id' => $conversation->id]);
    }

    /**
     * Test user cannot delete other users' conversations
     */
    public function test_user_cannot_delete_other_users_conversations(): void
    {
        // Arrange
        /** @var User $user1 */
        $user1 = User::factory()->create();
        /** @var User $user2 */
        $user2 = User::factory()->create();
        $conversation = Conversation::factory()->create(['user_id' => $user2->id]);

        // Act
        $response = $this->actingAs($user1, 'sanctum')
            ->deleteJson("/api/conversations/{$conversation->id}");

        // Assert
        $response->assertStatus(404);
        $this->assertDatabaseHas('conversations', ['id' => $conversation->id]);
    }
}
