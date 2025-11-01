<?php

namespace Database\Seeders;

use App\Models\AiMessage;
use App\Models\Conversation;
use App\Models\User;
use Illuminate\Database\Seeder;

class ConversationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get first user or create one for testing
        $user = User::first();

        if (!$user) {
            $user = User::factory()->create([
                'name'  => 'Test User',
                'email' => 'test@example.com',
            ]);
        }

        // Create sample conversations with messages
        $conversation1 = Conversation::factory()->create([
            'user_id' => $user->id,
            'title'   => 'Laravel Development Questions',
            'status'  => 'completed',
        ]);

        // Add messages to first conversation
        AiMessage::factory()->user()->create([
            'conversation_id' => $conversation1->id,
            'content'         => 'What is Laravel Service Container?',
        ]);

        AiMessage::factory()->assistant()->create([
            'conversation_id' => $conversation1->id,
            'content'         => 'The Laravel Service Container is a powerful tool for managing class dependencies and performing dependency injection. It\'s essentially a container that binds interfaces to their concrete implementations, making it easier to manage your application\'s dependencies.',
        ]);

        AiMessage::factory()->user()->create([
            'conversation_id' => $conversation1->id,
            'content'         => 'Can you give me an example?',
        ]);

        AiMessage::factory()->assistant()->create([
            'conversation_id' => $conversation1->id,
            'content'         => 'Sure! Here\'s a simple example: `app()->bind(PaymentInterface::class, StripePayment::class);` This tells Laravel that whenever PaymentInterface is requested, it should provide an instance of StripePayment.',
        ]);

        // Create second conversation
        $conversation2 = Conversation::factory()->create([
            'user_id' => $user->id,
            'title'   => 'Database Queries Help',
            'status'  => 'active',
        ]);

        AiMessage::factory()->user()->create([
            'conversation_id' => $conversation2->id,
            'content'         => 'How do I optimize my Eloquent queries?',
        ]);

        AiMessage::factory()->assistant()->create([
            'conversation_id' => $conversation2->id,
            'content'         => 'Here are key optimization techniques: 1) Use eager loading with `with()` to prevent N+1 queries, 2) Select only needed columns, 3) Use indexing on frequently queried columns, 4) Cache query results when appropriate, 5) Use `chunk()` for processing large datasets.',
        ]);

        // Create third conversation - processing
        $conversation3 = Conversation::factory()->create([
            'user_id' => $user->id,
            'title'   => 'API Development in Laravel',
            'status'  => 'processing',
        ]);

        AiMessage::factory()->user()->create([
            'conversation_id' => $conversation3->id,
            'content'         => 'What are the best practices for building REST APIs in Laravel?',
        ]);

        $this->command->info('✅ Created 3 sample conversations with multiple messages');
    }
}
