// resources/js/types/chat.d.ts

/**
 * Chat-related TypeScript type definitions
 */

export type MessageRole = 'user' | 'assistant' | 'system';

export type ConversationStatus = 'active' | 'processing' | 'completed' | 'error';

// Groq FREE Models
export type AIModelName =
    | 'llama-3.3-70b-versatile'              // Recommended: Best overall
    | 'llama-3.1-70b-versatile'              // Stable and fast
    | 'llama3-groq-70b-8192-tool-use-preview' // Function calling
    | 'mixtral-8x7b-32768'                   // Ultra-fast, large context
    | 'gemma2-9b-it'                         // Lightweight
    // Legacy OpenAI models (disabled)
    | 'gpt-4.1-nano'
    | 'gpt-4o-mini'
    | 'gpt-4o'
    | 'gpt-4-turbo';

export interface AIModel {
    name: string;
    description: string;
    enabled: boolean;
    provider?: string;  // 'Groq' or 'OpenAI'
    pricing?: {
        input: number;  // per 1K tokens
        output: number; // per 1K tokens
    };
    max_tokens?: number;
    context_window?: number;
}

export interface AIModelsResponse {
    default_model: AIModelName;
    models: Record<AIModelName, AIModel>;
}

export interface Message {
    id: number;
    conversation_id: number;
    role: MessageRole;
    content: string;
    tokens?: number;
    created_at: string;
    updated_at: string;
}

export interface Conversation {
    id: number;
    user_id: number;
    title: string;
    status: ConversationStatus;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
    messages?: Message[];
    messages_count?: number;
}

export interface ConversationListResponse {
    success: boolean;
    conversations: Conversation[];
    pagination?: {
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
    };
}

export interface ConversationResponse {
    success: boolean;
    conversation: Conversation;
}

export interface CreateConversationResponse {
    success: boolean;
    conversation: Conversation;
}

export interface SendMessageResponse {
    success: boolean;
    status: 'processing' | 'completed';
    message: string;
    user_message_id: number;
    conversation?: Conversation; // Backend returns full conversation with updated messages
}

export interface PollConversationResponse {
    success: boolean;
    status: ConversationStatus;
    messages: Message[];
}

export interface GenerateSummaryResponse {
    success: boolean;
    summary?: string;
    message?: string;
    status?: 'processing';
    cached?: boolean;
}

export interface ExtractTopicsResponse {
    success: boolean;
    topics?: string[];
    message?: string;
    status?: 'processing';
    cached?: boolean;
}

export interface CategorizeResponse {
    success: boolean;
    category?: string;
    message?: string;
    status?: 'processing';
    cached?: boolean;
}

export interface ChatError {
    type: 'rate_limit' | 'unauthorized' | 'not_found' | 'network' | 'server' | 'validation';
    message: string;
    details?: unknown;
}

export interface UseChatOptions {
    conversationId: number;
    autoLoad?: boolean;
    pollingInterval?: number;
    onError?: (error: ChatError) => void;
    onMessageReceived?: (message: Message) => void;
}

export interface UseChatReturn {
    messages: Message[];
    conversation: Conversation | null;
    status: ConversationStatus;
    sendMessage: (content: string) => Promise<void>;
    isLoading: boolean;
    isSending: boolean;
    error: ChatError | null;
    remainingRequests: number;
    clearError: () => void;
    refresh: () => Promise<void>;
}

export interface UseConversationsReturn {
    conversations: Conversation[];
    isLoading: boolean;
    error: ChatError | null;
    createConversation: (title: string) => Promise<Conversation | null>;
    deleteConversation: (id: number) => Promise<boolean>;
    refresh: () => Promise<void>;
}

export interface UsePollingOptions {
    conversationId: number;
    enabled: boolean;
    interval?: number;
    onUpdate?: (data: PollConversationResponse) => void;
}

export interface UsePollingReturn {
    isPolling: boolean;
    startPolling: () => void;
    stopPolling: () => void;
}
