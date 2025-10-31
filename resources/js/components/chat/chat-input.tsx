import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send } from 'lucide-react';
import { formatRateLimit, getRateLimitColor } from '@/lib/chat-utils';

interface ChatInputProps {
    onSend: (message: string) => void;
    disabled?: boolean;
    remainingRequests?: number;
    maxRequests?: number;
    placeholder?: string;
    maxLength?: number;
}

export function ChatInput({
    onSend,
    disabled = false,
    remainingRequests = 20,
    maxRequests = 20,
    placeholder = 'Type your message...',
    maxLength = 2000,
}: ChatInputProps) {
    const [message, setMessage] = useState('');
    const charCount = message.length;
    const canSend = message.trim().length > 0 && !disabled && remainingRequests > 0;

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (canSend) {
            onSend(message.trim());
            setMessage('');
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        // Submit on Enter (without Shift)
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const isRateLimitLow = remainingRequests < 5;
    const isRateLimitExhausted = remainingRequests === 0;

    return (
        <form onSubmit={handleSubmit} className="border-t bg-background p-4">
            <div className="mx-auto max-w-4xl space-y-2">
                {/* Input Area */}
                <div className="flex items-start gap-2">
                    <Textarea
                        value={message}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                            setMessage(e.target.value)
                        }
                        onKeyDown={handleKeyDown}
                        placeholder={
                            isRateLimitExhausted
                                ? 'Rate limit reached. Please wait...'
                                : placeholder
                        }
                        disabled={disabled || isRateLimitExhausted}
                        maxLength={maxLength}
                        rows={2}
                        className="min-h-[60px] max-h-[200px] resize-none"
                    />

                    {/* Send Button */}
                    <Button
                        type="submit"
                        size="icon"
                        disabled={!canSend}
                        className="size-11 shrink-0"
                        aria-label="Send message"
                    >
                        {disabled ? (
                            <Loader2 className="size-5 animate-spin" />
                        ) : (
                            <Send className="size-5" />
                        )}
                    </Button>
                </div>

                {/* Footer Info */}
                <div className="flex items-center justify-between text-xs">
                    {/* Character Count */}
                    <span
                        className={cn(
                            'text-muted-foreground',
                            charCount > maxLength * 0.9 && 'text-orange-500',
                            charCount >= maxLength && 'text-red-500',
                        )}
                    >
                        {charCount}/{maxLength}
                    </span>

                    {/* Rate Limit */}
                    <div className="flex items-center gap-1.5">
                        {isRateLimitLow && !isRateLimitExhausted && (
                            <span className="text-xs">⚠️</span>
                        )}
                        {isRateLimitExhausted && <span className="text-xs">🚫</span>}
                        <span className={getRateLimitColor(remainingRequests, maxRequests)}>
                            {formatRateLimit(remainingRequests, maxRequests)}
                        </span>
                    </div>
                </div>

                {/* Helper Text */}
                {!disabled && (
                    <p className="text-center text-xs text-muted-foreground">
                        <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                            Enter
                        </kbd>{' '}
                        to send •{' '}
                        <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                            Shift + Enter
                        </kbd>{' '}
                        for new line
                    </p>
                )}
            </div>
        </form>
    );
}
