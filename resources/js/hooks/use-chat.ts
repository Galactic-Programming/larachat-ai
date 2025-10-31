import { useState, useEffect, useCallback, useRef } from 'react';
import axios from '@/lib/axios';
import { AxiosError } from 'axios';
import {
    UseChatOptions,
    UseChatReturn,
    Message,
    Conversation,
    ConversationStatus,
    ChatError,
    ConversationResponse,
    SendMessageResponse,
    PollConversationResponse,
} from '@/types/chat';
import { usePolling } from './use-polling';

/**
 * Main hook for managing chat conversation
 * Handles message sending, receiving, and real-time updates
 */
export function useChat({
    conversationId,
    autoLoad = true,
    pollingInterval = 2000,
    onError,
    onMessageReceived,
}: UseChatOptions): UseChatReturn {
    const [messages, setMessages] = useState<Message[]>([]);
    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [status, setStatus] = useState<ConversationStatus>('active');
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<ChatError | null>(null);
    const [remainingRequests, setRemainingRequests] = useState(20);

    // Use ref to store onMessageReceived callback to avoid recreating handlePollingUpdate
    const onMessageReceivedRef = useRef(onMessageReceived);
    useEffect(() => {
        onMessageReceivedRef.current = onMessageReceived;
    }, [onMessageReceived]);

    // Helper to create ChatError from axios error
    const createChatError = useCallback((err: unknown): ChatError => {
        if (axios.isAxiosError(err)) {
            const axiosError = err as AxiosError<{ message?: string; errors?: unknown }>;

            if (axiosError.response) {
                switch (axiosError.response.status) {
                    case 429:
                        return {
                            type: 'rate_limit',
                            message: 'Rate limit exceeded. Please wait a moment.',
                            details: axiosError.response.data,
                        };
                    case 401:
                        return {
                            type: 'unauthorized',
                            message: 'Please log in to continue.',
                            details: axiosError.response.data,
                        };
                    case 404:
                        return {
                            type: 'not_found',
                            message: 'Conversation not found.',
                            details: axiosError.response.data,
                        };
                    case 422:
                        return {
                            type: 'validation',
                            message:
                                axiosError.response.data?.message ||
                                'Invalid input. Please check your message.',
                            details: axiosError.response.data,
                        };
                    default:
                        return {
                            type: 'server',
                            message: 'Server error. Please try again later.',
                            details: axiosError.response.data,
                        };
                }
            } else if (axiosError.request) {
                return {
                    type: 'network',
                    message: 'Network error. Please check your connection.',
                    details: err,
                };
            }
        }

        return {
            type: 'server',
            message: 'An unexpected error occurred.',
            details: err,
        };
    }, []);

    // Handle error with optional callback
    const handleError = useCallback(
        (err: unknown) => {
            const chatError = createChatError(err);
            setError(chatError);
            if (onError) {
                onError(chatError);
            }
        },
        [createChatError, onError],
    );

    // Load conversation data
    const loadConversation = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.get<ConversationResponse>(
                `/api/conversations/${conversationId}`,
            );

            if (response.data.success) {
                setConversation(response.data.conversation);
                setMessages(response.data.conversation.messages || []);
                setStatus(response.data.conversation.status);
            }
        } catch (err) {
            handleError(err);
        } finally {
            setIsLoading(false);
        }
    }, [conversationId, handleError]);

    // Send message
    const sendMessage = useCallback(
        async (content: string) => {
            if (!content.trim()) {
                return;
            }

            if (remainingRequests <= 0) {
                handleError({
                    type: 'rate_limit',
                    message: 'Rate limit exceeded. Please wait.',
                });
                return;
            }

            setIsSending(true);
            setError(null);

            // Optimistic update: Add user message immediately to UI
            const optimisticMessage: Message = {
                id: Date.now(), // Temporary ID
                conversation_id: conversationId,
                role: 'user',
                content: content.trim(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            setMessages((prev) => [...prev, optimisticMessage]);

            try {
                // Send to backend
                const response = await axios.post<SendMessageResponse>(
                    `/api/conversations/${conversationId}/messages`,
                    { message: content },
                );

                if (response.data.success) {
                    // Use conversation from response if available, otherwise fetch
                    if (response.data.conversation) {
                        setConversation(response.data.conversation);
                        const backendMessages = response.data.conversation.messages || [];
                        setMessages(backendMessages);
                        setStatus(response.data.conversation.status);
                    } else {
                        // Fallback: Fetch updated conversation
                        const conversationResponse = await axios.get<ConversationResponse>(
                            `/api/conversations/${conversationId}`,
                        );

                        if (conversationResponse.data.success) {
                            setConversation(conversationResponse.data.conversation);
                            setMessages(conversationResponse.data.conversation.messages || []);
                            setStatus(conversationResponse.data.conversation.status);
                        }
                    }

                    // Update rate limit counter
                    if (response.data.status === 'processing') {
                        setRemainingRequests((prev) => Math.max(0, prev - 1));
                    }
                }
            } catch (err) {
                // Remove optimistic message on error
                setMessages((prev) => {
                    const filtered = prev.filter((msg) => msg.id !== optimisticMessage.id);
                    return filtered;
                });
                handleError(err);
            } finally {
                setIsSending(false);
            }
        },
        [conversationId, remainingRequests, handleError],
    );

    // Handle polling updates - STABLE callback (no dependencies that change)
    const handlePollingUpdate = useCallback(
        (data: PollConversationResponse) => {
            if (data.success) {
                setMessages((prevMessages) => {
                    // Check if we actually have new messages before updating
                    if (data.messages.length !== prevMessages.length) {
                        // Notify about new messages using ref
                        if (onMessageReceivedRef.current && data.messages.length > prevMessages.length) {
                            const newMessage = data.messages[data.messages.length - 1];
                            if (newMessage.role === 'assistant') {
                                onMessageReceivedRef.current(newMessage);
                            }
                        }

                        return data.messages;
                    }
                    return prevMessages;
                });

                setStatus(data.status);
            }
        },
        [], // NO DEPENDENCIES - completely stable!
    );

    // Setup polling when status is processing
    const shouldPoll = status === 'processing';

    usePolling({
        conversationId,
        enabled: shouldPoll,
        interval: pollingInterval,
        onUpdate: handlePollingUpdate,
    });

    // Auto-load conversation on mount
    useEffect(() => {
        if (autoLoad && conversationId) {
            loadConversation();
        }
    }, [conversationId, autoLoad, loadConversation]);

    // Clear error
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Refresh conversation
    const refresh = useCallback(async () => {
        await loadConversation();
    }, [loadConversation]);

    return {
        messages,
        conversation,
        status,
        sendMessage,
        isLoading,
        isSending,
        error,
        remainingRequests,
        clearError,
        refresh,
    };
}
