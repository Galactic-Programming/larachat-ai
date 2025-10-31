# Chat Hooks Documentation

## Overview

Custom React hooks for managing AI chat functionality in the larachat-ai application.

---

## useChat

Main hook for managing a single chat conversation.

### Usage

```typescript
import { useChat } from '@/hooks';

function ChatPage({ conversationId }: { conversationId: number }) {
    const {
        messages,
        conversation,
        status,
        sendMessage,
        isLoading,
        isSending,
        error,
        remainingRequests,
        clearError,
        refresh,
    } = useChat({
        conversationId,
        autoLoad: true,
        pollingInterval: 2000,
        onError: (error) => console.error(error),
        onMessageReceived: (message) => console.log('New message:', message),
    });

    return (
        <div>
            {messages.map((msg) => (
                <div key={msg.id}>{msg.content}</div>
            ))}
            <button onClick={() => sendMessage('Hello!')}>Send</button>
        </div>
    );
}
```

### Parameters

- `conversationId` (number): ID of the conversation to manage
- `autoLoad` (boolean, optional): Auto-load conversation on mount. Default: `true`
- `pollingInterval` (number, optional): Polling interval in ms. Default: `2000`
- `onError` (function, optional): Callback when error occurs
- `onMessageReceived` (function, optional): Callback when new message received

### Returns

- `messages` (Message[]): Array of messages in conversation
- `conversation` (Conversation | null): Conversation object
- `status` (ConversationStatus): Current conversation status ('active' | 'processing' | 'completed' | 'failed')
- `sendMessage` (function): Send a message to AI
- `isLoading` (boolean): Loading conversation data
- `isSending` (boolean): Sending message in progress
- `error` (ChatError | null): Current error if any
- `remainingRequests` (number): Remaining API requests (rate limit)
- `clearError` (function): Clear current error
- `refresh` (function): Refresh conversation data

### Features

- ✅ Automatic polling when status is 'processing'
- ✅ Optimistic UI updates (messages appear immediately)
- ✅ Rate limit tracking
- ✅ Comprehensive error handling
- ✅ Auto-cleanup on unmount

---

## useConversations

Hook for managing the list of conversations.

### 1. Usage

```typescript
import { useConversations } from '@/hooks';

function ConversationsList() {
    const { conversations, isLoading, error, createConversation, deleteConversation, refresh } =
        useConversations();

    const handleCreate = async () => {
        const newConv = await createConversation('New Chat');
        if (newConv) {
            console.log('Created:', newConv);
        }
    };

    return (
        <div>
            {conversations.map((conv) => (
                <div key={conv.id}>
                    {conv.title}
                    <button onClick={() => deleteConversation(conv.id)}>Delete</button>
                </div>
            ))}
            <button onClick={handleCreate}>New Chat</button>
        </div>
    );
}
```

### 2. Returns

- `conversations` (Conversation[]): Array of conversations
- `isLoading` (boolean): Loading conversations
- `error` (ChatError | null): Current error if any
- `createConversation` (function): Create new conversation
- `deleteConversation` (function): Delete a conversation
- `refresh` (function): Refresh conversations list

### 3. Features

- ✅ Auto-load on mount
- ✅ Create conversation with title
- ✅ Delete conversation
- ✅ Error handling

---

## usePolling

Low-level hook for polling conversation status.

### 1.Usage

```typescript
import { usePolling } from '@/hooks';

function PollingExample() {
    const { isPolling, startPolling, stopPolling } = usePolling({
        conversationId: 1,
        enabled: true,
        interval: 2000,
        onUpdate: (data) => {
            console.log('Poll update:', data);
        },
    });

    return (
        <div>
            Status: {isPolling ? 'Polling...' : 'Stopped'}
            <button onClick={startPolling}>Start</button>
            <button onClick={stopPolling}>Stop</button>
        </div>
    );
}
```

### 2. Parameters

- `conversationId` (number): ID to poll
- `enabled` (boolean): Enable/disable polling
- `interval` (number, optional): Polling interval in ms. Default: `2000`
- `onUpdate` (function, optional): Callback with poll results

### 3. Returns

- `isPolling` (boolean): Current polling status
- `startPolling` (function): Manually start polling
- `stopPolling` (function): Manually stop polling

### 4. Features

- ✅ Auto-start/stop based on `enabled` prop
- ✅ Auto-stop when conversation is completed/failed
- ✅ Proper cleanup on unmount
- ✅ Configurable interval

---

## Chat Utilities

Additional utility functions in `lib/chat-utils.ts`:

### Time Formatting

```typescript
import { formatMessageTime, formatFullTime } from '@/lib/chat-utils';

formatMessageTime('2025-10-31T10:00:00'); // "5m ago"
formatFullTime('2025-10-31T10:00:00'); // "Oct 31, 2025, 10:00 AM"
```

### Message Helpers

```typescript
import {
    isUserMessage,
    isAssistantMessage,
    isSystemMessage,
    getConversationPreview,
    getMessageCount,
} from '@/lib/chat-utils';

isUserMessage('user'); // true
getConversationPreview(messages); // "Hello, how are you..."
getMessageCount(messages); // { total: 10, user: 5, assistant: 5 }
```

### Rate Limit Helpers

```typescript
import { formatRateLimit, getRateLimitColor } from '@/lib/chat-utils';

formatRateLimit(5, 20); // "5 requests left (low)"
getRateLimitColor(5, 20); // "text-orange-500"
```

---

## TypeScript Types

All types are available in `@/types/chat`:

```typescript
import type {
    Message,
    Conversation,
    MessageRole,
    ConversationStatus,
    ChatError,
    UseChatReturn,
    UseConversationsReturn,
} from '@/types/chat';
```

---

## Error Handling

All hooks use consistent error handling with `ChatError` type:

```typescript
interface ChatError {
    type: 'rate_limit' | 'unauthorized' | 'not_found' | 'network' | 'server' | 'validation';
    message: string;
    details?: any;
}
```

### Error Types

- `rate_limit`: Too many requests (429)
- `unauthorized`: Not logged in (401)
- `not_found`: Conversation not found (404)
- `network`: Network/connection error
- `server`: Server error (500)
- `validation`: Invalid input (422)

---

## Best Practices

### 1. Always handle errors

```typescript
const { error, clearError } = useChat({ conversationId });

useEffect(() => {
    if (error) {
        toast.error(error.message);
        clearError();
    }
}, [error, clearError]);
```

### 2. Use optimistic updates

The `useChat` hook automatically adds user messages optimistically before backend confirmation.

### 3. Monitor rate limits

```typescript
const { remainingRequests } = useChat({ conversationId });

if (remainingRequests < 5) {
    console.warn('Low rate limit!');
}
```

### 4. Clean up properly

All hooks handle cleanup automatically, but you can manually control:

```typescript
const { stopPolling } = usePolling({ conversationId, enabled: true });

useEffect(() => {
    return () => stopPolling(); // Manual cleanup if needed
}, [stopPolling]);
```

---

## Next Steps

1. Create UI components using these hooks
2. Add toast notifications for errors
3. Implement conversation list page
4. Add real-time indicators
