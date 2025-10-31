import { cn } from '@/lib/utils';
import type { Conversation } from '@/types/chat';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
    MoreVertical,
    Sparkles,
    Tags,
    FileText,
    Trash2,
    RotateCcw,
    Menu,
} from 'lucide-react';

interface ChatHeaderProps {
    conversation?: Conversation | null;
    onGenerateSummary?: () => void;
    onExtractTopics?: () => void;
    onCategorize?: () => void;
    onDelete?: () => void;
    onRefresh?: () => void;
    onToggleSidebar?: () => void;
    showSidebarToggle?: boolean;
    className?: string;
}

export function ChatHeader({
    conversation,
    onGenerateSummary,
    onExtractTopics,
    onCategorize,
    onDelete,
    onRefresh,
    onToggleSidebar,
    showSidebarToggle = false,
    className,
}: ChatHeaderProps) {
    return (
        <div className={cn('flex items-center justify-between border-b bg-background p-4', className)}>
            {/* Left: Title */}
            <div className="flex items-center gap-3">
                {showSidebarToggle && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden"
                        onClick={onToggleSidebar}
                    >
                        <Menu className="size-5" />
                    </Button>
                )}

                <div className="flex flex-col">
                    <h1 className="text-lg font-semibold">
                        {conversation?.title || 'Select a conversation'}
                    </h1>
                    {conversation && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{conversation.messages?.length || 0} messages</span>
                            {conversation.status === 'processing' && (
                                <>
                                    <span>•</span>
                                    <Badge variant="secondary" className="gap-1">
                                        <span className="relative flex size-2">
                                            <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
                                            <span className="relative inline-flex size-2 rounded-full bg-primary" />
                                        </span>
                                        Processing
                                    </Badge>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Actions */}
            {conversation && (
                <div className="flex items-center gap-2">
                    {/* Refresh Button */}
                    {onRefresh && (
                        <Button variant="ghost" size="icon" onClick={onRefresh} title="Refresh">
                            <RotateCcw className="size-4" />
                        </Button>
                    )}

                    {/* More Actions Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreVertical className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            {/* AI Features */}
                            {onGenerateSummary && (
                                <DropdownMenuItem onClick={onGenerateSummary}>
                                    <FileText className="mr-2 size-4" />
                                    Generate Summary
                                </DropdownMenuItem>
                            )}
                            {onExtractTopics && (
                                <DropdownMenuItem onClick={onExtractTopics}>
                                    <Tags className="mr-2 size-4" />
                                    Extract Topics
                                </DropdownMenuItem>
                            )}
                            {onCategorize && (
                                <DropdownMenuItem onClick={onCategorize}>
                                    <Sparkles className="mr-2 size-4" />
                                    Categorize
                                </DropdownMenuItem>
                            )}

                            {(onGenerateSummary || onExtractTopics || onCategorize) && onDelete && (
                                <DropdownMenuSeparator />
                            )}

                            {/* Delete */}
                            {onDelete && (
                                <DropdownMenuItem
                                    onClick={onDelete}
                                    className="text-destructive focus:text-destructive"
                                >
                                    <Trash2 className="mr-2 size-4" />
                                    Delete Conversation
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}
        </div>
    );
}
