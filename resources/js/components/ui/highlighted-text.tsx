import { highlightText } from '@/lib/highlight-utils';

interface HighlightedTextProps {
    text: string;
    query: string;
    className?: string;
}

export function HighlightedText({ text, query, className }: HighlightedTextProps) {
    const parts = highlightText(text, query);

    return (
        <span className={className}>
            {parts.map((part, index) =>
                part.highlight ? (
                    <mark
                        key={index}
                        className="rounded bg-yellow-200 px-0.5 font-medium text-foreground dark:bg-yellow-900/50"
                    >
                        {part.text}
                    </mark>
                ) : (
                    <span key={index}>{part.text}</span>
                ),
            )}
        </span>
    );
}
