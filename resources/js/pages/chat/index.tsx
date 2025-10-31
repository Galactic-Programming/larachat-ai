import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import {
    ChatSidebar,
    ChatHeader,
    MessageList,
    ChatInput,
    EmptyState,
} from '@/components/chat';
import { useConversations } from '@/hooks/use-conversations';
import { useChat } from '@/hooks/use-chat';

export default function ChatIndex() {
    const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [deletingId, setDeletingId] = useState<number | null>(null);

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

    // AI-enhanced features - will implement in next step
    const handleGenerateSummary = () => {
        console.log('Generate summary for conversation:', selectedConversationId);
        // TODO: Call API endpoint
    };

    const handleExtractTopics = () => {
        console.log('Extract topics for conversation:', selectedConversationId);
        // TODO: Call API endpoint
    };

    const handleCategorize = () => {
        console.log('Categorize conversation:', selectedConversationId);
        // TODO: Call API endpoint
    };

    // FIXED: Use status from hook instead of conversation.status
    const isProcessing = status === 'processing' || isSending;

    return (
        <>
            <Head title="AI Chat" />

            <div className="flex h-screen overflow-hidden bg-background">
                {/* Sidebar */}
                <div
                    className={`${sidebarOpen ? 'w-80' : 'w-0'
                        } transition-all duration-300 lg:w-80`}
                >
                    {sidebarOpen && (
                        <ChatSidebar
                            conversations={conversations}
                            activeConversationId={selectedConversationId ?? undefined}
                            onSelectConversation={setSelectedConversationId}
                            onNewConversation={handleNewConversation}
                            onDeleteConversation={handleDeleteConversation}
                            deletingId={deletingId}
                            isLoading={conversationsLoading}
                        />
                    )}
                </div>

                {/* Main Chat Area */}
                <div className="flex flex-1 flex-col overflow-hidden">
                    {selectedConversationId && conversation ? (
                        <>
                            <ChatHeader
                                conversation={conversation}
                                onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                                showSidebarToggle
                                onRefresh={handleRefresh}
                                onGenerateSummary={handleGenerateSummary}
                                onExtractTopics={handleExtractTopics}
                                onCategorize={handleCategorize}
                                onDelete={() => handleDeleteConversation(conversation.id)}
                            />

                            <MessageList
                                messages={messages}
                                isProcessing={isProcessing}
                                conversationStatus={status}
                            />

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
        </>
    );
}
