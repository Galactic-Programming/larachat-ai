// resources/js/lib/chat-utils.ts

/**
 * Utility functions for chat features
 */

import { Message, MessageRole } from '@/types/chat';

/**
 * Format timestamp to readable time
 */
export function formatMessageTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // Less than 1 minute
    if (diffInSeconds < 60) {
        return 'Just now';
    }

    // Less than 1 hour
    if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes}m ago`;
    }

    // Less than 24 hours
    if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours}h ago`;
    }

    // Less than 7 days
    if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days}d ago`;
    }

    // Format as date
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
}

/**
 * Format full timestamp
 */
export function formatFullTime(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Estimate token count for a message
 * Rough estimation: 1 token ≈ 4 characters
 */
export function estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
}

/**
 * Group messages by date
 */
export function groupMessagesByDate(messages: Message[]): Record<string, Message[]> {
    const groups: Record<string, Message[]> = {};

    messages.forEach((message) => {
        const date = new Date(message.created_at);
        const dateKey = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

        if (!groups[dateKey]) {
            groups[dateKey] = [];
        }

        groups[dateKey].push(message);
    });

    return groups;
}

/**
 * Check if message is from user
 */
export function isUserMessage(role: MessageRole): boolean {
    return role === 'user';
}

/**
 * Check if message is from assistant
 */
export function isAssistantMessage(role: MessageRole): boolean {
    return role === 'assistant';
}

/**
 * Check if message is system message
 */
export function isSystemMessage(role: MessageRole): boolean {
    return role === 'system';
}

/**
 * Sanitize message content for display
 */
export function sanitizeMessageContent(content: string): string {
    // Trim whitespace
    let sanitized = content.trim();

    // Remove null bytes
    sanitized = sanitized.replace(/\0/g, '');

    return sanitized;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
        return text;
    }

    return text.substring(0, maxLength - 3) + '...';
}

/**
 * Get conversation preview text
 */
export function getConversationPreview(messages: Message[]): string {
    if (messages.length === 0) {
        return 'No messages yet';
    }

    const lastMessage = messages[messages.length - 1];
    const preview = sanitizeMessageContent(lastMessage.content);

    return truncateText(preview, 60);
}

/**
 * Calculate conversation message count
 */
export function getMessageCount(messages: Message[]): {
    total: number;
    user: number;
    assistant: number;
} {
    return messages.reduce(
        (acc, msg) => {
            acc.total++;
            if (isUserMessage(msg.role)) {
                acc.user++;
            } else if (isAssistantMessage(msg.role)) {
                acc.assistant++;
            }
            return acc;
        },
        { total: 0, user: 0, assistant: 0 },
    );
}

/**
 * Format rate limit remaining
 */
export function formatRateLimit(remaining: number, total: number = 20): string {
    const percentage = (remaining / total) * 100;

    if (remaining === 0) {
        return 'Rate limit reached';
    }

    if (percentage < 25) {
        return `${remaining} requests left (low)`;
    }

    return `${remaining}/${total} requests`;
}

/**
 * Get rate limit color class
 */
export function getRateLimitColor(remaining: number, total: number = 20): string {
    const percentage = (remaining / total) * 100;

    if (percentage === 0) {
        return 'text-red-500';
    }

    if (percentage < 25) {
        return 'text-orange-500';
    }

    if (percentage < 50) {
        return 'text-yellow-500';
    }

    return 'text-muted-foreground';
}
