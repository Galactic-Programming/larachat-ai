<?php
// app/Jobs/ProcessAiConversation.php
namespace App\Jobs;

use App\Models\Conversation;
use App\Services\OpenAIService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessAiConversation implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The number of seconds to wait before retrying the job.
     */
    public int $backoff = 5;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public int $conversationId,
        public string $userMessage
    ) {
    }

    /**
     * Execute the job.
     */
    public function handle(OpenAIService $openAIService): void
    {
        try {
            $conversation = Conversation::findOrFail($this->conversationId);

            // NOTE: Status is already set to 'processing' by controller before dispatching
            // No need to set it again here

            // Generate AI response
            $result = $openAIService->generateResponse($conversation, $this->userMessage);

            // Update conversation status to completed
            $conversation->update(['status' => 'completed']);

            Log::info('AI conversation processed successfully', [
                'conversation_id' => $this->conversationId,
                'tokens_used' => $result['usage']['total_tokens'],
            ]);

        } catch (\OpenAI\Exceptions\ErrorException $e) {
            // Check if it's specifically a rate limit error
            $errorMessage = $e->getMessage();
            $isRateLimit = str_contains(strtolower($errorMessage), 'rate limit') ||
                str_contains(strtolower($errorMessage), 'quota');

            if ($isRateLimit) {
                Log::warning('OpenAI Rate Limit Exceeded', [
                    'conversation_id' => $this->conversationId,
                    'error' => $errorMessage,
                    'note' => 'Free tier rate limit. Please wait or upgrade plan.'
                ]);

                // Create a mock AI response so user can still see the UI working
                \App\Models\AiMessage::create([
                    'conversation_id' => $this->conversationId,
                    'role' => 'assistant',
                    'content' => "⚠️ OpenAI API rate limit exceeded. Your free tier quota may have been reached. Please wait a few minutes or check your OpenAI account billing settings. 🤖",
                    'token_count' => 50,
                ]);

                Conversation::find($this->conversationId)?->update(['status' => 'completed']);
                return;
            }

            // If not rate limit, log and rethrow
            throw $e;

        } catch (\Exception $e) {
            // Log detailed error information for debugging
            Log::error('AI conversation processing failed', [
                'conversation_id' => $this->conversationId,
                'error' => $e->getMessage(),
                'type' => get_class($e),
                'code' => $e->getCode(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            // Update conversation status to error (valid status from migration)
            Conversation::find($this->conversationId)?->update(['status' => 'error']);

            // Re-throw to trigger Laravel's retry mechanism
            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('AI job failed after all retries', [
            'conversation_id' => $this->conversationId,
            'error' => $exception->getMessage(),
        ]);

        // Notify user or admin about failure
        // Could send notification, email, etc.
    }
}
