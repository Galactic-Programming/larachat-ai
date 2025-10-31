import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
    className?: string;
}

export function TypingIndicator({ className }: TypingIndicatorProps) {
    return (
        <div className={cn('mb-4 flex gap-3', className)}>
            {/* Bot Avatar */}
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                <div className="size-4 text-muted-foreground">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                </div>
            </div>

            {/* Typing Animation */}
            <div className="flex items-center gap-1 rounded-lg border bg-card px-4 py-3 shadow-sm">
                <span className="text-xs text-muted-foreground">AI is thinking</span>
                <div className="ml-2 flex gap-1">
                    <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:0ms]" />
                    <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:150ms]" />
                    <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:300ms]" />
                </div>
            </div>
        </div>
    );
}
