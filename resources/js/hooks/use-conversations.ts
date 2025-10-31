import { useState, useEffect, useCallback } from 'react';
import axios from '@/lib/axios';
import {
    UseConversationsReturn,
    Conversation,
    ChatError,
    ConversationListResponse,
    CreateConversationResponse,
} from '@/types/chat';

/**
 * Hook for managing conversations list
 * Handles loading, creating, and deleting conversations
 */
export function useConversations(): UseConversationsReturn {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<ChatError | null>(null);

    // Load all conversations
    const loadConversations = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            // TODO: Update this when we create the actual endpoint
            // For now, we'll handle if the endpoint doesn't exist yet
            const response = await axios.get<ConversationListResponse>(
                '/api/conversations',
            );

            if (response.data.success) {
                setConversations(response.data.conversations);
            }
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.status === 404) {
                // Endpoint doesn't exist yet, silently ignore
                setConversations([]);
            } else {
                setError({
                    type: 'server',
                    message: 'Failed to load conversations',
                    details: err,
                });
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Create new conversation
    const createConversation = useCallback(
        async (title: string): Promise<Conversation | null> => {
            setError(null);

            try {
                const response = await axios.post<CreateConversationResponse>(
                    '/api/conversations',
                    { title },
                );

                if (response.data.success) {
                    const newConversation = response.data.conversation;
                    setConversations((prev) => [newConversation, ...prev]);
                    return newConversation;
                }

                return null;
            } catch (err) {
                setError({
                    type: 'server',
                    message: 'Failed to create conversation',
                    details: err,
                });
                return null;
            }
        },
        [],
    );

    // Delete conversation
    const deleteConversation = useCallback(async (id: number): Promise<boolean> => {
        setError(null);

        try {
            // TODO: Implement delete endpoint in backend
            await axios.delete(`/api/conversations/${id}`);

            setConversations((prev) => prev.filter((conv) => conv.id !== id));
            return true;
        } catch (err) {
            setError({
                type: 'server',
                message: 'Failed to delete conversation',
                details: err,
            });
            return false;
        }
    }, []);

    // Refresh conversations list
    const refresh = useCallback(async () => {
        await loadConversations();
    }, [loadConversations]);

    // Load conversations on mount
    useEffect(() => {
        loadConversations();
    }, [loadConversations]);

    return {
        conversations,
        isLoading,
        error,
        createConversation,
        deleteConversation,
        refresh,
    };
}
