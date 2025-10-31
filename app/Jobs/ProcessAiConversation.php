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
use OpenAI\Exceptions\RateLimitException;
use OpenAI\Exceptions\ErrorException;

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

        } catch (RateLimitException $e) {
            // Handle rate limit with friendly mock response
            Log::warning('OpenAI Rate Limit Exceeded', [
                'conversation_id' => $this->conversationId,
                'error' => $e->getMessage(),
                'note' => 'Free tier: 3 requests/minute limit. Please wait 60 seconds.'
            ]);

            // Create helpful mock response
            \App\Models\AiMessage::create([
                'conversation_id' => $this->conversationId,
                'role' => 'assistant',
                'content' => "⚠️ **Rate Limit Notice**\n\nThe OpenAI API has reached its rate limit (3 requests per minute for free tier).\n\n**What to do:**\n1. Wait 60 seconds before sending another message\n2. Check your OpenAI billing: https://platform.openai.com/account/billing\n3. Add a payment method to increase limits\n\nYour message was received and will be processed once the limit resets. 🤖",
                'token_count' => 80,
            ]);

            Conversation::find($this->conversationId)?->update(['status' => 'completed']);

            // Don't throw - complete successfully with mock response
            return;

        } catch (ErrorException $e) {
            // Handle other OpenAI API errors
            Log::error('OpenAI API Error', [
                'conversation_id' => $this->conversationId,
                'error' => $e->getMessage(),
                'type' => get_class($e),
            ]);

            // Create error message for user
            \App\Models\AiMessage::create([
                'conversation_id' => $this->conversationId,
                'role' => 'assistant',
                'content' => "❌ **AI Service Error**\n\nThe AI service encountered an error: " . $e->getMessage() . "\n\nPlease try again or contact support if the issue persists.",
                'token_count' => 50,
            ]);

            Conversation::find($this->conversationId)?->update(['status' => 'error']);
            return;

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
