import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import axios from '@/lib/axios';
import { exportAsJSON, exportAsMarkdown, exportAsText } from '@/lib/export-utils';
import { toast } from 'sonner';
import type {
    GenerateSummaryResponse,
    ExtractTopicsResponse,
    CategorizeResponse,
} from '@/types/chat';
import {
    ChatSidebar,
    ChatHeader,
    MessageList,
    ChatInput,
    EmptyState,
} from '@/components/chat';
import { SummaryModal } from '@/components/chat/summary-modal';
import { ErrorBoundary } from '@/components/error-boundary';
import { useConversations } from '@/hooks/use-conversations';
import { useChat } from '@/hooks/use-chat';

export default function ChatIndex() {
    const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [aiFeatureLoading, setAiFeatureLoading] = useState<
        'summary' | 'topics' | 'category' | null
    >(null);
    // Store metadata per conversation ID
    const [conversationMetadata, setConversationMetadata] = useState<Record<number, {
        summary?: string;
        topics?: string[];
        category?: string;
    }>>({});
    const [summaryModalOpen, setSummaryModalOpen] = useState(false);
    const [currentSummary, setCurrentSummary] = useState('');

    const {
        conversations,
        isLoading: conversationsLoading,
        createConversation,
        deleteConversation,
        refresh: refreshConversations,
    } = useConversations();

    const {
        messages,
        conversation,
        status,
        sendMessage,
        isSending,
        remainingRequests,
        refresh: refreshChat,
    } = useChat(
        selectedConversationId
            ? { conversationId: selectedConversationId }
            : { conversationId: 0 },
    );

    // Auto-select first conversation if none selected
    useEffect(() => {
        if (!selectedConversationId && conversations.length > 0 && !conversationsLoading) {
            // Use setTimeout to avoid calling setState during render
            const timer = setTimeout(() => {
                setSelectedConversationId(conversations[0].id);
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [conversations, selectedConversationId, conversationsLoading]);

    // Get current conversation metadata
    const currentMetadata = selectedConversationId
        ? conversationMetadata[selectedConversationId] || {}
        : {};

    const handleNewConversation = async () => {
        try {
            const newConv = await createConversation('New Conversation');
            if (newConv) {
                setSelectedConversationId(newConv.id);
            }
        } catch (error) {
            console.error('Failed to create conversation:', error);
        }
    };

    const handleDeleteConversation = async (id: number) => {
        setDeletingId(id);
        try {
            await deleteConversation(id);

            // If deleted the currently selected conversation, select another
            if (selectedConversationId === id) {
                const remaining = conversations.filter((c) => c.id !== id);
                setSelectedConversationId(remaining.length > 0 ? remaining[0].id : null);
            }
        } catch (error) {
            console.error('Failed to delete conversation:', error);
        } finally {
            setDeletingId(null);
        }
    };

    const handleSendMessage = async (content: string) => {
        if (!selectedConversationId) return;

        try {
            await sendMessage(content);
            // Hook already refreshes conversation after sending
            // Just refresh conversations list to update preview/timestamp
            await refreshConversations();
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const handleRefresh = () => {
        refreshChat();
        refreshConversations();
    };

    // AI-enhanced features with retry logic for async operations
    const handleGenerateSummary = async () => {
        if (!selectedConversationId) return;

        setAiFeatureLoading('summary');

        const maxRetries = 3;
        const retryDelay = 5000; // 5 seconds

        const attemptGenerate = async (attempt: number): Promise<void> => {
            try {
                const response = await axios.post<GenerateSummaryResponse>(
                    `/api/conversations/${selectedConversationId}/summary`,
                );

                // Handle 202 Accepted (processing)
                if (response.status === 202 || response.data.status === 'processing') {
                    if (attempt < maxRetries) {
                        toast.info(`Generating summary... (attempt ${attempt}/${maxRetries})`, {
                            duration: 3000,
                        });

                        // Retry after delay
                        await new Promise(resolve => setTimeout(resolve, retryDelay));
                        return attemptGenerate(attempt + 1);
                    } else {
                        toast.warning('Summary generation is taking longer than expected. It will be available soon.', {
                            duration: 5000,
                        });
                        return;
                    }
                }

                // Handle 200 OK (success with data)
                if (response.data.success && response.data.summary) {
                    setConversationMetadata((prev) => ({
                        ...prev,
                        [selectedConversationId]: {
                            ...prev[selectedConversationId],
                            summary: response.data.summary,
                        },
                    }));
                    setCurrentSummary(response.data.summary!);

                    const cachedLabel = response.data.cached ? ' (from cache)' : '';
                    toast.success(`Summary generated successfully${cachedLabel}`, {
                        action: {
                            label: 'View',
                            onClick: () => setSummaryModalOpen(true),
                        },
                        duration: 5000,
                    });
                }
            } catch (error) {
                console.error('Failed to generate summary:', error);
                toast.error('Failed to generate summary. Please try again.');
                throw error;
            }
        };

        try {
            await attemptGenerate(1);
        } finally {
            setAiFeatureLoading(null);
        }
    };

    const handleExtractTopics = async () => {
        if (!selectedConversationId) return;

        setAiFeatureLoading('topics');

        const maxRetries = 3;
        const retryDelay = 5000;

        const attemptExtract = async (attempt: number): Promise<void> => {
            try {
                const response = await axios.post<ExtractTopicsResponse>(
                    `/api/conversations/${selectedConversationId}/topics`,
                );

                // Handle 202 Accepted (processing)
                if (response.status === 202 || response.data.status === 'processing') {
                    if (attempt < maxRetries) {
                        toast.info(`Extracting topics... (attempt ${attempt}/${maxRetries})`, {
                            duration: 3000,
                        });

                        await new Promise(resolve => setTimeout(resolve, retryDelay));
                        return attemptExtract(attempt + 1);
                    } else {
                        toast.warning('Topic extraction is taking longer than expected. It will be available soon.', {
                            duration: 5000,
                        });
                        return;
                    }
                }

                // Handle 200 OK (success with data)
                if (response.data.success && response.data.topics) {
                    setConversationMetadata((prev) => ({
                        ...prev,
                        [selectedConversationId]: {
                            ...prev[selectedConversationId],
                            topics: response.data.topics,
                        },
                    }));

                    const cachedLabel = response.data.cached ? ' (from cache)' : '';
                    toast.success(`Topics extracted${cachedLabel}: ${response.data.topics!.join(', ')}`, {
                        duration: 5000,
                    });
                }
            } catch (error) {
                console.error('Failed to extract topics:', error);
                toast.error('Failed to extract topics. Please try again.');
                throw error;
            }
        };

        try {
            await attemptExtract(1);
        } finally {
            setAiFeatureLoading(null);
        }
    };

    const handleCategorize = async () => {
        if (!selectedConversationId) return;

        setAiFeatureLoading('category');

        const maxRetries = 3;
        const retryDelay = 5000;

        const attemptCategorize = async (attempt: number): Promise<void> => {
            try {
                const response = await axios.post<CategorizeResponse>(
                    `/api/conversations/${selectedConversationId}/categorize`,
                );

                // Handle 202 Accepted (processing)
                if (response.status === 202 || response.data.status === 'processing') {
                    if (attempt < maxRetries) {
                        toast.info(`Categorizing conversation... (attempt ${attempt}/${maxRetries})`, {
                            duration: 3000,
                        });

                        await new Promise(resolve => setTimeout(resolve, retryDelay));
                        return attemptCategorize(attempt + 1);
                    } else {
                        toast.warning('Categorization is taking longer than expected. It will be available soon.', {
                            duration: 5000,
                        });
                        return;
                    }
                }

                // Handle 200 OK (success with data)
                if (response.data.success && response.data.category) {
                    setConversationMetadata((prev) => ({
                        ...prev,
                        [selectedConversationId]: {
                            ...prev[selectedConversationId],
                            category: response.data.category,
                        },
                    }));

                    const cachedLabel = response.data.cached ? ' (from cache)' : '';
                    toast.success(`Categorized as${cachedLabel}: ${response.data.category!}`, {
                        duration: 4000,
                    });
                }
            } catch (error) {
                console.error('Failed to categorize:', error);
                toast.error('Failed to categorize. Please try again.');
                throw error;
            }
        };

        try {
            await attemptCategorize(1);
        } finally {
            setAiFeatureLoading(null);
        }
    };

    // Export conversation handler
    const handleExport = (format: 'json' | 'markdown' | 'text') => {
        if (!conversation) return;

        switch (format) {
            case 'json':
                exportAsJSON(conversation, currentMetadata);
                break;
            case 'markdown':
                exportAsMarkdown(conversation, currentMetadata);
                break;
            case 'text':
                exportAsText(conversation, currentMetadata);
                break;
        }
    };

    // FIXED: Use status from hook instead of conversation.status
    const isProcessing = status === 'processing' || isSending;

    return (
        <>
            <Head title="AI Chat" />

            <div className="flex h-screen overflow-hidden bg-background">
                {/* Mobile Backdrop Overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                        aria-hidden="true"
                    />
                )}

                {/* Sidebar */}
                <div
                    className={cn(
                        'fixed inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 lg:relative lg:z-auto lg:translate-x-0',
                        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
                    )}
                >
                    <ErrorBoundary>
                        <ChatSidebar
                            conversations={conversations}
                            activeConversationId={selectedConversationId ?? undefined}
                            onSelectConversation={(id) => {
                                setSelectedConversationId(id);
                                // Auto-close sidebar on mobile after selection
                                if (window.innerWidth < 1024) {
                                    setSidebarOpen(false);
                                }
                            }}
                            onNewConversation={handleNewConversation}
                            onDeleteConversation={handleDeleteConversation}
                            deletingId={deletingId}
                            isLoading={conversationsLoading}
                        />
                    </ErrorBoundary>
                </div>

                {/* Main Chat Area */}
                <div className="flex flex-1 flex-col overflow-hidden">
                    {selectedConversationId && conversation ? (
                        <>
                            <ErrorBoundary>
                                <ChatHeader
                                    conversation={conversation}
                                    onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                                    showSidebarToggle
                                    onRefresh={handleRefresh}
                                    onGenerateSummary={handleGenerateSummary}
                                    onExtractTopics={handleExtractTopics}
                                    onCategorize={handleCategorize}
                                    onExport={handleExport}
                                    aiFeatureLoading={aiFeatureLoading}
                                    onDelete={() => handleDeleteConversation(conversation.id)}
                                    topics={currentMetadata.topics}
                                    category={currentMetadata.category}
                                />
                            </ErrorBoundary>

                            <ErrorBoundary>
                                <MessageList
                                    messages={messages}
                                    isProcessing={isProcessing}
                                    conversationStatus={status}
                                />
                            </ErrorBoundary>

                            <ChatInput
                                onSend={handleSendMessage}
                                disabled={isProcessing || remainingRequests === 0}
                                remainingRequests={remainingRequests}
                            />
                        </>
                    ) : (
                        <>
                            {/* Empty state header with sidebar toggle */}
                            <div className="flex items-center justify-between border-b p-4">
                                <h1 className="text-lg font-semibold">AI Chat</h1>
                                <button
                                    onClick={() => setSidebarOpen(!sidebarOpen)}
                                    className="lg:hidden"
                                    aria-label="Toggle sidebar"
                                    title="Toggle sidebar"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <line x1="4" x2="20" y1="12" y2="12" />
                                        <line x1="4" x2="20" y1="6" y2="6" />
                                        <line x1="4" x2="20" y1="18" y2="18" />
                                    </svg>
                                </button>
                            </div>

                            <div className="flex flex-1 items-center justify-center">
                                <EmptyState
                                    title="No conversation selected"
                                    description={
                                        conversations.length > 0
                                            ? 'Select a conversation from the sidebar to start chatting'
                                            : 'Create a new conversation to get started'
                                    }
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Summary Modal */}
            <SummaryModal
                open={summaryModalOpen}
                onOpenChange={setSummaryModalOpen}
                summary={currentSummary}
                conversationTitle={conversation?.title || 'Untitled'}
            />
        </>
    );
}
