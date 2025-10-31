import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface SummaryModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    summary: string;
    conversationTitle: string;
}

export function SummaryModal({
    open,
    onOpenChange,
    summary,
    conversationTitle,
}: SummaryModalProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(summary);
            setCopied(true);
            toast.success('Summary copied to clipboard');
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error('Failed to copy summary');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Conversation Summary</DialogTitle>
                    <DialogDescription>
                        AI-generated summary for "{conversationTitle}"
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto px-1">
                    <div className="prose dark:prose-invert max-w-none">
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {summary}
                        </p>
                    </div>
                </div>
                <DialogFooter className="flex-none">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopy}
                        className="gap-2"
                    >
                        {copied ? (
                            <>
                                <Check className="size-4" />
                                Copied!
                            </>
                        ) : (
                            <>
                                <Copy className="size-4" />
                                Copy to Clipboard
                            </>
                        )}
                    </Button>
                    <Button
                        variant="default"
                        size="sm"
                        onClick={() => onOpenChange(false)}
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
