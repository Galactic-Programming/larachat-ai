import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import type { Message } from '@/types/chat';
import { ChatMessage } from './chat-message';
import { TypingIndicator } from './typing-indicator';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MessageListProps {
    messages: Message[];
    isLoading?: boolean;
    isProcessing?: boolean;
    className?: string;
    emptyMessage?: string;
    conversationStatus?: 'active' | 'processing' | 'completed' | 'failed';
}

export function MessageList({
    messages,
    isLoading = false,
    isProcessing = false,
    className,
    emptyMessage = 'No messages yet. Start a conversation!',
    conversationStatus,
}: MessageListProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'end',
        });
    }, [messages, isProcessing]);

    if (isLoading) {
        return (
            <div className={cn('flex flex-1 flex-col gap-4 p-4', className)}>
                <MessageSkeleton />
                <MessageSkeleton isUser />
                <MessageSkeleton />
            </div>
        );
    }

    if (messages.length === 0 && !isProcessing) {
        return (
            <div
                className={cn(
                    'flex flex-1 items-center justify-center p-4',
                    className,
                )}
            >
                <div className="text-center">
                    <p className="text-muted-foreground">{emptyMessage}</p>
                </div>
            </div>
        );
    }

    return (
        <ScrollArea className={cn('flex-1', className)}>
            <div className="mx-auto max-w-4xl p-4">
                {messages.map((message, index) => (
                    <ChatMessage
                        key={message.id}
                        message={message}
                        isLatest={index === messages.length - 1}
                    />
                ))}

                {isProcessing && <TypingIndicator />}

                {conversationStatus === 'failed' && (
                    <div className="mx-auto max-w-4xl rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20">
                        <div className="flex gap-3">
                            <div className="text-red-600 dark:text-red-400">⚠️</div>
                            <div>
                                <h4 className="font-medium text-red-900 dark:text-red-100">
                                    Failed to generate response
                                </h4>
                                <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                                    The AI service is temporarily unavailable or rate limited. Please
                                    try again in a few moments.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Scroll anchor */}
                <div ref={messagesEndRef} />
            </div>
        </ScrollArea>
    );
}

// Skeleton for loading state
function MessageSkeleton({ isUser = false }: { isUser?: boolean }) {
    return (
        <div
            className={cn(
                'mb-4 flex gap-3',
                isUser ? 'flex-row-reverse' : 'flex-row',
            )}
        >
            <Skeleton className="size-8 shrink-0 rounded-full" />
            <div className={cn('flex max-w-[75%] flex-col gap-2', isUser ? 'items-end' : 'items-start')}>
                <Skeleton className="h-16 w-64 rounded-lg" />
                <Skeleton className="h-3 w-16" />
            </div>
        </div>
    );
}
