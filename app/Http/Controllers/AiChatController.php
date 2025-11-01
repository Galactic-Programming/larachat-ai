<?php

// app/Http/Controllers/AiChatController.php

namespace App\Http\Controllers;

use App\Jobs\CategorizeConversation;
use App\Jobs\ExtractConversationTopics;
use App\Jobs\GenerateConversationSummary;
use App\Jobs\ProcessAiConversation;
use App\Models\Conversation;
use App\Services\InputSanitizer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class AiChatController extends Controller
{
    /**
     * Create new conversation
     */
    public function createConversation(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:200',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $conversation = Conversation::create([
            'user_id' => Auth::id(),
            'title' => $request->input('title'),
            'status' => 'active',
        ]);

        return response()->json([
            'success' => true,
            'conversation' => $conversation,
        ], 201);
    }

    /**
     * Send message to AI (async processing)
     */
    public function sendMessage(Request $request, int $conversationId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'message' => 'required|string|max:2000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Sanitize input before processing
        $sanitizedMessage = InputSanitizer::sanitizeForAI($request->input('message'));

        // Find conversation
        $conversation = Conversation::where('id', $conversationId)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        // Store user message IMMEDIATELY before dispatching job
        // This ensures message is visible to user right away
        $userMessage = \App\Models\AiMessage::create([
            'conversation_id' => $conversation->id,
            'role' => 'user',
            'content' => $sanitizedMessage, // Use sanitized input
            'token_count' => \App\Models\AiMessage::estimateTokens($sanitizedMessage),
        ]);

        // Update conversation status to processing
        $conversation->update(['status' => 'processing']);

        // Reload conversation with messages to return fresh data
        $conversation->load([
            'messages' => function ($query) {
                $query->orderBy('created_at', 'asc');
            },
        ]);

        // Dispatch job to queue for AI response generation
        ProcessAiConversation::dispatch($conversation->id, $sanitizedMessage); // Use sanitized input

        return response()->json([
            'success' => true,
            'status' => 'processing',
            'message' => 'Your message is being processed. Check back shortly.',
            'user_message_id' => $userMessage->id,
            'conversation' => $conversation, // Return full conversation with messages
        ], 202); // 202 Accepted
    }

    /**
     * Poll for conversation status and latest messages
     */
    public function pollConversation(int $conversationId): JsonResponse
    {
        $conversation = Conversation::with([
            'messages' => function ($query) {
                $query->orderBy('created_at', 'desc')->limit(20);
            },
        ])
            ->where('id', $conversationId)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'status' => $conversation->status,
            'messages' => $conversation->messages->reverse()->values(),
        ]);
    }

    /**
     * Get conversation history
     */
    public function getConversation(int $conversationId): JsonResponse
    {
        $conversation = Conversation::with('messages')
            ->where('id', $conversationId)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'conversation' => $conversation,
        ]);
    }

    /**
     * List all conversations for the authenticated user
     */
    public function listConversations(): JsonResponse
    {
        $conversations = Conversation::with('messages')
            ->where('user_id', Auth::id())
            ->orderBy('updated_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'conversations' => $conversations,
        ]);
    }

    /**
     * Delete a conversation
     */
    public function deleteConversation(int $conversationId): JsonResponse
    {
        $conversation = Conversation::where('id', $conversationId)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $conversation->delete();

        return response()->json([
            'success' => true,
            'message' => 'Conversation deleted successfully',
        ]);
    }

    /**
     * Generate conversation summary (async)
     */
    public function generateSummary(int $conversationId): JsonResponse
    {
        $conversation = Conversation::where('id', $conversationId)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        // Check if summary already exists in cache
        $cachedSummary = cache()->get("conversation_summary:{$conversationId}");

        if ($cachedSummary) {
            return response()->json([
                'success' => true,
                'summary' => $cachedSummary,
                'cached' => true,
            ]);
        }

        // Dispatch job to generate summary asynchronously
        GenerateConversationSummary::dispatch($conversationId);

        return response()->json([
            'success' => true,
            'message' => 'Summary generation in progress. Please check back shortly.',
            'status' => 'processing',
        ], 202);
    }

    /**
     * Extract conversation topics (async)
     */
    public function extractTopics(int $conversationId): JsonResponse
    {
        $conversation = Conversation::where('id', $conversationId)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        // Check if topics already exist in cache
        $cachedTopics = cache()->get("conversation_topics:{$conversationId}");

        if ($cachedTopics) {
            return response()->json([
                'success' => true,
                'topics' => $cachedTopics,
                'cached' => true,
            ]);
        }

        // Dispatch job to extract topics asynchronously
        ExtractConversationTopics::dispatch($conversationId);

        return response()->json([
            'success' => true,
            'message' => 'Topic extraction in progress. Please check back shortly.',
            'status' => 'processing',
        ], 202);
    }

    /**
     * Categorize conversation (async)
     */
    public function categorizeConversation(int $conversationId): JsonResponse
    {
        $conversation = Conversation::where('id', $conversationId)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        // Check if category already exists in cache
        $cachedCategory = cache()->get("conversation_category:{$conversationId}");

        if ($cachedCategory) {
            return response()->json([
                'success' => true,
                'category' => $cachedCategory,
                'cached' => true,
            ]);
        }

        // Dispatch job to categorize asynchronously
        CategorizeConversation::dispatch($conversationId);

        return response()->json([
            'success' => true,
            'message' => 'Categorization in progress. Please check back shortly.',
            'status' => 'processing',
        ], 202);
    }
}
