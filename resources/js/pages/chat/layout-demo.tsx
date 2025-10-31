import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { ChatSidebar, ChatHeader, MessageList, ChatInput } from '@/components/chat';
import type { Conversation, Message } from '@/types/chat';

// Mock data
const mockConversations: Conversation[] = [
    {
        id: 1,
        user_id: 1,
        title: 'Laravel Best Practices',
        status: 'completed',
        created_at: '2025-10-30T10:00:00Z',
        updated_at: '2025-10-31T09:00:00Z',
        messages: [
            {
                id: 1,
                conversation_id: 1,
                role: 'user',
                content: 'What are Laravel best practices?',
                created_at: '2025-10-30T10:00:00Z',
                updated_at: '2025-10-30T10:00:00Z',
            },
            {
                id: 2,
                conversation_id: 1,
                role: 'assistant',
                content:
                    'Here are key Laravel best practices:\n\n1. Use Service Containers\n2. Follow PSR standards\n3. Use Eloquent properly\n4. Implement validation\n5. Use queues for heavy tasks',
                created_at: '2025-10-30T10:01:00Z',
                updated_at: '2025-10-30T10:01:00Z',
            },
        ],
    },
    {
        id: 2,
        user_id: 1,
        title: 'React + Inertia.js Setup',
        status: 'active',
        created_at: '2025-10-31T08:00:00Z',
        updated_at: '2025-10-31T08:30:00Z',
        messages: [
            {
                id: 3,
                conversation_id: 2,
                role: 'user',
                content: 'How to set up React with Inertia?',
                created_at: '2025-10-31T08:00:00Z',
                updated_at: '2025-10-31T08:00:00Z',
            },
        ],
    },
    {
        id: 3,
        user_id: 1,
        title: 'Database Optimization',
        status: 'processing',
        created_at: '2025-10-31T09:00:00Z',
        updated_at: '2025-10-31T09:15:00Z',
        messages: [],
    },
];

export default function ChatLayoutDemo() {
    const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
    const [activeConversationId, setActiveConversationId] = useState<number>(1);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const activeConversation = conversations.find((c) => c.id === activeConversationId);

    const handleNewConversation = () => {
        const newConv: Conversation = {
            id: Date.now(),
            user_id: 1,
            title: 'New Conversation',
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            messages: [],
        };
        setConversations([newConv, ...conversations]);
        setActiveConversationId(newConv.id);
    };

    const handleDeleteConversation = (id: number) => {
        setConversations(conversations.filter((c) => c.id !== id));
        if (activeConversationId === id && conversations.length > 1) {
            const nextConv = conversations.find((c) => c.id !== id);
            if (nextConv) setActiveConversationId(nextConv.id);
        }
    };

    const handleSendMessage = (content: string) => {
        if (!activeConversation) return;

        const userMessage: Message = {
            id: Date.now(),
            conversation_id: activeConversationId,
            role: 'user',
            content,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        const updatedConversations = conversations.map((conv) => {
            if (conv.id === activeConversationId) {
                return {
                    ...conv,
                    messages: [...(conv.messages || []), userMessage],
                    status: 'processing' as const,
                };
            }
            return conv;
        });

        setConversations(updatedConversations);

        // Simulate AI response
        setTimeout(() => {
            const aiMessage: Message = {
                id: Date.now() + 1,
                conversation_id: activeConversationId,
                role: 'assistant',
                content: `This is a demo response to: "${content}"`,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            setConversations((prev) =>
                prev.map((conv) => {
                    if (conv.id === activeConversationId) {
                        return {
                            ...conv,
                            messages: [...(conv.messages || []), aiMessage],
                            status: 'completed' as const,
                        };
                    }
                    return conv;
                }),
            );
        }, 2000);
    };

    return (
        <>
            <Head title="Chat Layout Demo" />

            <div className="flex h-screen overflow-hidden bg-background">
                {/* Sidebar */}
                <div
                    className={`${sidebarOpen ? 'w-80' : 'w-0'
                        } transition-all duration-300 lg:w-80`}
                >
                    {sidebarOpen && (
                        <ChatSidebar
                            conversations={conversations}
                            activeConversationId={activeConversationId}
                            onSelectConversation={setActiveConversationId}
                            onNewConversation={handleNewConversation}
                            onDeleteConversation={handleDeleteConversation}
                        />
                    )}
                </div>

                {/* Main Chat Area */}
                <div className="flex flex-1 flex-col overflow-hidden">
                    <ChatHeader
                        conversation={activeConversation}
                        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                        showSidebarToggle
                        onRefresh={() => console.log('Refresh')}
                        onGenerateSummary={() => console.log('Generate summary')}
                        onExtractTopics={() => console.log('Extract topics')}
                        onCategorize={() => console.log('Categorize')}
                        onDelete={() =>
                            activeConversation && handleDeleteConversation(activeConversation.id)
                        }
                    />

                    <MessageList
                        messages={activeConversation?.messages || []}
                        isProcessing={activeConversation?.status === 'processing'}
                    />

                    <ChatInput
                        onSend={handleSendMessage}
                        disabled={activeConversation?.status === 'processing'}
                    />
                </div>
            </div>
        </>
    );
}
