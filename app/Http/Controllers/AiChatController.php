<?php
// app/Http/Controllers/AiChatController.php
namespace App\Http\Controllers;

use App\Jobs\ProcessAiConversation;
use App\Models\Conversation;
use App\Services\OpenAIService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use App\Services\InputSanitizer;

class AiChatController extends Controller
{
    public function __construct(
        private OpenAIService $openAIService
    ) {
    }

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
            'content' => $request->input('message'),
            'token_count' => \App\Models\AiMessage::estimateTokens($request->input('message')),
        ]);

        // Update conversation status to processing
        $conversation->update(['status' => 'processing']);

        // Reload conversation with messages to return fresh data
        $conversation->load([
            'messages' => function ($query) {
                $query->orderBy('created_at', 'asc');
            }
        ]);

        // Dispatch job to queue for AI response generation
        ProcessAiConversation::dispatch($conversation->id, $request->input('message'));

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
            }
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
}
