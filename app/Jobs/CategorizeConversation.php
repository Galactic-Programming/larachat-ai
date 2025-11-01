<?php

namespace App\Jobs;

use App\Models\Conversation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class CategorizeConversation implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 2;
    public int $backoff = 3;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public int $conversationId
    ) {
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            $conversation = Conversation::findOrFail($this->conversationId);
            $category = $conversation->categorize();

            // Store category in cache for quick retrieval
            cache()->put(
                "conversation_category:{$this->conversationId}",
                $category,
                now()->addDay()
            );

            Log::channel('ai')->info('Conversation categorized successfully', [
                'conversation_id' => $this->conversationId,
                'category'        => $category,
            ]);
        } catch (\Exception $e) {
            Log::channel('ai')->error('Failed to categorize conversation', [
                'conversation_id' => $this->conversationId,
                'error'           => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
