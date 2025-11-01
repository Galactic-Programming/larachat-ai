import { memo } from 'react';
import { cn } from '@/lib/utils';
import type { Conversation } from '@/types/chat';
import { formatMessageTime, getConversationPreview } from '@/lib/chat-utils';
import { MessageSquare, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HighlightedText } from '@/components/ui/highlighted-text';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ConversationItemProps {
    conversation: Conversation;
    isActive?: boolean;
    isDeleting?: boolean;
    onClick?: () => void;
    onDelete?: () => void;
    searchQuery?: string;
}

function ConversationItemComponent({
    conversation,
    isActive = false,
    isDeleting = false,
    onClick,
    onDelete,
    searchQuery = '',
}: ConversationItemProps) {
    const preview = getConversationPreview(conversation.messages || []);
    const messageCount = conversation.messages?.length || 0;

    return (
        <div
            className={cn(
                'group relative flex cursor-pointer flex-col gap-2 rounded-lg border p-3 transition-colors hover:bg-accent md:p-3',
                isActive && 'border-primary bg-accent',
                isDeleting && 'pointer-events-none opacity-50',
            )}
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick?.();
                }
            }}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 overflow-hidden">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                        <MessageSquare className="size-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="line-clamp-2 text-sm font-semibold leading-tight">
                            <HighlightedText text={conversation.title} query={searchQuery} />
                        </h3>
                    </div>
                </div>

                {/* Delete Button */}
                {onDelete && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-9 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 md:size-8"
                                onClick={(e) => e.stopPropagation()}
                                disabled={isDeleting}
                                aria-label="Delete conversation"
                            >
                                {isDeleting ? (
                                    <Loader2 className="size-4 animate-spin text-destructive" />
                                ) : (
                                    <Trash2 className="size-4 text-destructive" />
                                )}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent onEscapeKeyDown={(e) => !isDeleting && e.preventDefault()}>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete Conversation?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete &quot;{conversation.title}&quot;
                                    and all its messages. This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={(e: React.MouseEvent) => {
                                        e.stopPropagation();
                                        onDelete();
                                    }}
                                    disabled={isDeleting}
                                    className="bg-destructive text-white hover:bg-destructive/90 disabled:opacity-50"
                                >
                                    {isDeleting ? (
                                        <>
                                            <Loader2 className="mr-2 size-4 animate-spin" />
                                            Deleting...
                                        </>
                                    ) : (
                                        'Delete'
                                    )}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>

            {/* Preview */}
            {messageCount > 0 && (
                <p className="line-clamp-2 text-xs text-muted-foreground">{preview}</p>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{messageCount} messages</span>
                <span>{formatMessageTime(conversation.updated_at)}</span>
            </div>

            {/* Status Badge */}
            {conversation.status === 'processing' && (
                <div className="absolute right-2 top-2">
                    <span className="flex size-2">
                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
                        <span className="relative inline-flex size-2 rounded-full bg-primary" />
                    </span>
                </div>
            )}
        </div>
    );
}

// Memoize with custom comparison to prevent unnecessary re-renders
export const ConversationItem = memo(ConversationItemComponent, (prevProps, nextProps) => {
    return (
        prevProps.conversation.id === nextProps.conversation.id &&
        prevProps.conversation.title === nextProps.conversation.title &&
        prevProps.conversation.updated_at === nextProps.conversation.updated_at &&
        prevProps.isActive === nextProps.isActive &&
        prevProps.isDeleting === nextProps.isDeleting &&
        prevProps.searchQuery === nextProps.searchQuery &&
        prevProps.conversation.messages?.length === nextProps.conversation.messages?.length
    );
});

ConversationItem.displayName = 'ConversationItem';
