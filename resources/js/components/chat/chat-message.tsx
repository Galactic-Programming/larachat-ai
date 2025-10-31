import { cn } from '@/lib/utils';
import { formatMessageTime, isUserMessage, sanitizeMessageContent } from '@/lib/chat-utils';
import type { Message } from '@/types/chat';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
    message: Message;
    isLatest?: boolean;
}

export function ChatMessage({ message, isLatest = false }: ChatMessageProps) {
    const isUser = isUserMessage(message.role);
    const isSystem = message.role === 'system';
    const sanitizedContent = sanitizeMessageContent(message.content);

    if (isSystem) {
        return (
            <div className="my-4 flex justify-center">
                <div className="rounded-md bg-muted px-3 py-1 text-xs text-muted-foreground">
                    {sanitizedContent}
                </div>
            </div>
        );
    }

    return (
        <div
            className={cn(
                'group mb-4 flex gap-3',
                isUser ? 'flex-row-reverse' : 'flex-row',
                isLatest && 'animate-in fade-in slide-in-from-bottom-2 duration-300',
            )}
        >
            {/* Avatar */}
            <Avatar className="size-8 shrink-0">
                <AvatarFallback
                    className={cn(
                        'text-xs',
                        isUser
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground',
                    )}
                >
                    {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
                </AvatarFallback>
            </Avatar>

            {/* Message Content */}
            <div
                className={cn(
                    'flex max-w-[75%] flex-col gap-1',
                    isUser ? 'items-end' : 'items-start',
                )}
            >
                <div
                    className={cn(
                        'rounded-lg px-4 py-2 shadow-sm',
                        isUser
                            ? 'bg-primary text-primary-foreground'
                            : 'border bg-card text-card-foreground',
                    )}
                >
                    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                        {sanitizedContent}
                    </p>
                </div>

                {/* Timestamp */}
                <span
                    className={cn(
                        'px-1 text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100',
                    )}
                >
                    {formatMessageTime(message.created_at)}
                </span>

                {/* Token count (if available) */}
                {message.tokens && (
                    <span className="px-1 text-xs text-muted-foreground/50">
                        ~{message.tokens} tokens
                    </span>
                )}
            </div>
        </div>
    );
}
