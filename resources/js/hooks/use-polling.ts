import { useEffect, useRef, useCallback, useState } from 'react';
import axios from 'axios';
import { UsePollingOptions, UsePollingReturn, PollConversationResponse } from '@/types/chat';

/**
 * Hook for polling conversation status and messages
 * Used to check when AI has finished processing
 */
export function usePolling({
    conversationId,
    enabled,
    interval = 2000,
    onUpdate,
}: UsePollingOptions): UsePollingReturn {
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const [isPolling, setIsPolling] = useState(false);

    const stopPolling = useCallback(() => {
        setIsPolling(false);

        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    const poll = useCallback(async () => {
        if (!enabled || !conversationId) return;

        try {
            const response = await axios.get<PollConversationResponse>(
                `/api/conversations/${conversationId}/poll`,
            );

            if (onUpdate && response.data) {
                onUpdate(response.data);
            }

            // Stop polling if conversation is completed or error
            if (
                response.data.status === 'completed' ||
                response.data.status === 'error'
            ) {
                stopPolling();
            }
        } catch (error) {
            console.error('Polling error:', error);
            // Continue polling even on error (might be temporary)
        }
    }, [conversationId, enabled, onUpdate, stopPolling]);

    const startPolling = useCallback(() => {
        if (isPolling) return;

        setIsPolling(true);

        // Immediate first poll
        poll();

        // Then poll at intervals
        intervalRef.current = setInterval(poll, interval);
    }, [poll, interval, isPolling]);

    // Auto-start/stop based on enabled prop
    useEffect(() => {
        if (enabled && conversationId) {
            if (!isPolling) {
                startPolling();
            }
        } else {
            if (isPolling) {
                stopPolling();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, conversationId]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopPolling();
        };
    }, [stopPolling]);

    return {
        isPolling,
        startPolling,
        stopPolling,
    };
}
