import { cn } from '@/lib/utils';
import { MessageSquare, Sparkles } from 'lucide-react';

interface EmptyStateProps {
    title?: string;
    description?: string;
    icon?: 'message' | 'sparkles';
    className?: string;
}

export function EmptyState({
    title = 'No messages yet',
    description = 'Start a conversation by sending a message below.',
    icon = 'message',
    className,
}: EmptyStateProps) {
    const Icon = icon === 'sparkles' ? Sparkles : MessageSquare;

    return (
        <div
            className={cn(
                'flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center',
                className,
            )}
        >
            <div className="rounded-full bg-muted p-6">
                <Icon className="size-12 text-muted-foreground" />
            </div>

            <div className="space-y-2">
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
            </div>

            <div className="mt-4 space-y-2">
                <p className="text-xs text-muted-foreground">Try asking:</p>
                <div className="flex flex-wrap justify-center gap-2">
                    {suggestedPrompts.map((prompt, index) => (
                        <span
                            key={index}
                            className="rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground"
                        >
                            {prompt}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

const suggestedPrompts = [
    'Explain Laravel service container',
    'How to use Inertia.js?',
    'Write a PHP function',
    'Debug my code',
];
