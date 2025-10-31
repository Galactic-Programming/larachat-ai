import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { Conversation } from '@/types/chat';
import { ConversationItem } from './conversation-item';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search, X } from 'lucide-react';

interface ChatSidebarProps {
    conversations: Conversation[];
    activeConversationId?: number;
    onSelectConversation?: (id: number) => void;
    onNewConversation?: () => void;
    onDeleteConversation?: (id: number) => void;
    isLoading?: boolean;
    className?: string;
}

export function ChatSidebar({
    conversations,
    activeConversationId,
    onSelectConversation,
    onNewConversation,
    onDeleteConversation,
    isLoading = false,
    className,
}: ChatSidebarProps) {
    const [searchQuery, setSearchQuery] = useState('');

    // Filter conversations by search query
    const filteredConversations = conversations.filter((conv) =>
        conv.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    return (
        <div className={cn('flex h-full flex-col border-r bg-muted/10', className)}>
            {/* Header */}
            <div className="border-b p-4">
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Conversations</h2>
                    {onNewConversation && (
                        <Button size="sm" onClick={onNewConversation}>
                            <Plus className="mr-2 size-4" />
                            New
                        </Button>
                    )}
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-9"
                    />
                    {searchQuery && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 size-7 -translate-y-1/2"
                            onClick={() => setSearchQuery('')}
                        >
                            <X className="size-3" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Conversations List */}
            <ScrollArea className="flex-1">
                <div className="space-y-2 p-4">
                    {isLoading ? (
                        // Loading skeletons
                        <>
                            <ConversationSkeleton />
                            <ConversationSkeleton />
                            <ConversationSkeleton />
                        </>
                    ) : filteredConversations.length === 0 ? (
                        // Empty state
                        <div className="py-8 text-center">
                            <p className="text-sm text-muted-foreground">
                                {searchQuery ? 'No conversations found' : 'No conversations yet'}
                            </p>
                            {!searchQuery && onNewConversation && (
                                <Button
                                    variant="link"
                                    size="sm"
                                    className="mt-2"
                                    onClick={onNewConversation}
                                >
                                    Create your first conversation
                                </Button>
                            )}
                        </div>
                    ) : (
                        // Conversation items
                        filteredConversations.map((conversation) => (
                            <ConversationItem
                                key={conversation.id}
                                conversation={conversation}
                                isActive={conversation.id === activeConversationId}
                                onClick={() => onSelectConversation?.(conversation.id)}
                                onDelete={
                                    onDeleteConversation
                                        ? () => onDeleteConversation(conversation.id)
                                        : undefined
                                }
                            />
                        ))
                    )}
                </div>
            </ScrollArea>

            {/* Footer Stats */}
            {!isLoading && conversations.length > 0 && (
                <div className="border-t p-3 text-center text-xs text-muted-foreground">
                    {filteredConversations.length} of {conversations.length} conversations
                </div>
            )}
        </div>
    );
}

function ConversationSkeleton() {
    return (
        <div className="rounded-lg border p-3">
            <div className="mb-2 flex items-center gap-2">
                <Skeleton className="size-8 rounded-full" />
                <Skeleton className="h-4 flex-1" />
            </div>
            <Skeleton className="mb-2 h-8 w-full" />
            <div className="flex justify-between">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-16" />
            </div>
        </div>
    );
}
