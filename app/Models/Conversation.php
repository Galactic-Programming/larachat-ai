<?php
// app/Models/Conversation.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Log;

class Conversation extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'title',
        'status',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(AiMessage::class);
    }

    public function getFormattedMessagesForOpenAI(): array
    {
        return $this->messages()
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(fn($message) => [
                'role'    => $message->role,
                'content' => $message->content,
            ])
            ->toArray();
    }

    /**
     * Auto-generate conversation title from first few messages
     * More meaningful than "New Conversation"
     */
    public function autoGenerateTitle(): void
    {
        // Only generate if title is generic or empty
        if (!$this->title || str_contains(strtolower($this->title), 'new conversation')) {
            $messages = $this->messages()
                ->orderBy('created_at', 'asc')
                ->limit(3)
                ->get();

            if ($messages->isEmpty()) {
                return;
            }

            $context = $messages->map(fn($msg) => $msg->content)->join(' ');

            try {
                // Use AI Service based on config
                $aiService = config('ai.use_mock', false)
                    ? app(\App\Services\MockOpenAIService::class)
                    : app(\App\Services\OpenAIService::class);

                $title = $aiService->generateTitle($context);
                $this->update(['title' => substr($title, 0, 100)]);

                Log::channel('ai')->info('Auto-generated conversation title', [
                    'conversation_id' => $this->id,
                    'title'           => $title,
                ]);
            } catch (\Exception $e) {
                Log::channel('ai')->error('Failed to auto-generate title', [
                    'conversation_id' => $this->id,
                    'error'           => $e->getMessage(),
                ]);
            }
        }
    }

    /**
     * Generate a summary of the entire conversation
     * Useful for long conversations
     */
    public function generateSummary(): string
    {
        $messages = $this->messages()
            ->orderBy('created_at', 'asc')
            ->get();

        if ($messages->isEmpty()) {
            return 'No messages in this conversation yet.';
        }

        $conversation = $messages->map(function ($msg) {
            $role = ucfirst($msg->role);
            return "{$role}: {$msg->content}";
        })->join("\n");

        try {
            // Use AI Service based on config
            $aiService = config('ai.use_mock', false)
                ? app(\App\Services\MockOpenAIService::class)
                : app(\App\Services\OpenAIService::class);

            $summary = $aiService->generateSummary($conversation);

            Log::channel('ai')->info('Generated conversation summary', [
                'conversation_id' => $this->id,
                'message_count'   => $messages->count(),
            ]);

            return $summary;
        } catch (\Exception $e) {
            Log::channel('ai')->error('Failed to generate summary', [
                'conversation_id' => $this->id,
                'error'           => $e->getMessage(),
            ]);

            return 'Unable to generate summary at this time.';
        }
    }

    /**
     * Categorize conversation into topics
     * Helps organize conversations
     */
    public function categorize(): string
    {
        $messages = $this->messages()
            ->orderBy('created_at', 'asc')
            ->limit(10)
            ->get();

        if ($messages->isEmpty()) {
            return 'General';
        }

        $context = $messages->map(fn($msg) => $msg->content)->join(' ');

        try {
            // Use AI Service based on config
            $aiService = config('ai.use_mock', false)
                ? app(\App\Services\MockOpenAIService::class)
                : app(\App\Services\OpenAIService::class);

            $category = $aiService->categorize($context);

            Log::channel('ai')->info('Categorized conversation', [
                'conversation_id' => $this->id,
                'category'        => $category,
            ]);

            return $category;
        } catch (\Exception $e) {
            Log::channel('ai')->error('Failed to categorize conversation', [
                'conversation_id' => $this->id,
                'error'           => $e->getMessage(),
            ]);

            return 'General';
        }
    }

    /**
     * Extract key topics discussed in the conversation
     * Returns array of topics
     */
    public function extractTopics(): array
    {
        $messages = $this->messages()
            ->orderBy('created_at', 'asc')
            ->get();

        if ($messages->isEmpty()) {
            return [];
        }

        $conversation = $messages->map(fn($msg) => $msg->content)->join(' ');

        try {
            // Use AI Service based on config
            $aiService = config('ai.use_mock', false)
                ? app(\App\Services\MockOpenAIService::class)
                : app(\App\Services\OpenAIService::class);

            $topics = $aiService->extractTopics($conversation);

            Log::channel('ai')->info('Extracted conversation topics', [
                'conversation_id' => $this->id,
                'topics'          => $topics,
            ]);

            return $topics;
        } catch (\Exception $e) {
            Log::channel('ai')->error('Failed to extract topics', [
                'conversation_id' => $this->id,
                'error'           => $e->getMessage(),
            ]);

            return [];
        }
    }
}
