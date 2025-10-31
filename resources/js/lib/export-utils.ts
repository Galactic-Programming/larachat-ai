/**
 * Export utilities for conversation data
 */

import type { Conversation, Message } from '@/types/chat';

interface ExportMetadata {
    summary?: string;
    topics?: string[];
    category?: string;
}

/**
 * Export conversation as JSON file
 */
export function exportAsJSON(
    conversation: Conversation,
    metadata?: ExportMetadata,
): void {
    const exportData = {
        conversation: {
            id: conversation.id,
            title: conversation.title,
            status: conversation.status,
            created_at: conversation.created_at,
            updated_at: conversation.updated_at,
            message_count: conversation.messages?.length || 0,
        },
        metadata: metadata || {},
        messages: conversation.messages || [],
        exported_at: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
    });

    downloadFile(blob, `${sanitizeFilename(conversation.title)}.json`);
}

/**
 * Export conversation as Markdown file
 */
export function exportAsMarkdown(
    conversation: Conversation,
    metadata?: ExportMetadata,
): void {
    const messages = conversation.messages || [];
    let markdown = `# ${conversation.title}\n\n`;

    // Metadata section
    if (metadata) {
        markdown += `## Metadata\n\n`;
        if (metadata.category) {
            markdown += `- **Category**: ${metadata.category}\n`;
        }
        if (metadata.topics && metadata.topics.length > 0) {
            markdown += `- **Topics**: ${metadata.topics.join(', ')}\n`;
        }
        if (metadata.summary) {
            markdown += `- **Summary**: ${metadata.summary}\n`;
        }
        markdown += `\n`;
    }

    // Info section
    markdown += `## Information\n\n`;
    markdown += `- **Created**: ${new Date(conversation.created_at).toLocaleString()}\n`;
    markdown += `- **Updated**: ${new Date(conversation.updated_at).toLocaleString()}\n`;
    markdown += `- **Messages**: ${messages.length}\n`;
    markdown += `- **Status**: ${conversation.status}\n\n`;

    // Messages section
    markdown += `## Conversation\n\n`;

    messages.forEach((message, index) => {
        const timestamp = new Date(message.created_at).toLocaleString();
        const role = message.role.charAt(0).toUpperCase() + message.role.slice(1);

        markdown += `### ${role} (${timestamp})\n\n`;
        markdown += `${message.content}\n\n`;

        // Add separator between messages except for the last one
        if (index < messages.length - 1) {
            markdown += `---\n\n`;
        }
    });

    // Footer
    markdown += `\n---\n\n`;
    markdown += `*Exported: ${new Date().toLocaleString()}*\n`;

    const blob = new Blob([markdown], { type: 'text/markdown' });
    downloadFile(blob, `${sanitizeFilename(conversation.title)}.md`);
}

/**
 * Export conversation as plain text file
 */
export function exportAsText(
    conversation: Conversation,
    metadata?: ExportMetadata,
): void {
    const messages = conversation.messages || [];
    let text = `${conversation.title}\n`;
    text += `${'='.repeat(conversation.title.length)}\n\n`;

    // Metadata section
    if (metadata) {
        text += `METADATA\n`;
        text += `--------\n`;
        if (metadata.category) {
            text += `Category: ${metadata.category}\n`;
        }
        if (metadata.topics && metadata.topics.length > 0) {
            text += `Topics: ${metadata.topics.join(', ')}\n`;
        }
        if (metadata.summary) {
            text += `Summary: ${metadata.summary}\n`;
        }
        text += `\n`;
    }

    // Info section
    text += `INFORMATION\n`;
    text += `-----------\n`;
    text += `Created: ${new Date(conversation.created_at).toLocaleString()}\n`;
    text += `Updated: ${new Date(conversation.updated_at).toLocaleString()}\n`;
    text += `Messages: ${messages.length}\n`;
    text += `Status: ${conversation.status}\n\n`;

    // Messages section
    text += `CONVERSATION\n`;
    text += `------------\n\n`;

    messages.forEach((message, index) => {
        const timestamp = new Date(message.created_at).toLocaleString();
        const role = message.role.toUpperCase();

        text += `[${role}] ${timestamp}\n`;
        text += `${message.content}\n`;

        if (index < messages.length - 1) {
            text += `\n${'─'.repeat(80)}\n\n`;
        }
    });

    // Footer
    text += `\n\n`;
    text += `${'='.repeat(80)}\n`;
    text += `Exported: ${new Date().toLocaleString()}\n`;

    const blob = new Blob([text], { type: 'text/plain' });
    downloadFile(blob, `${sanitizeFilename(conversation.title)}.txt`);
}

/**
 * Sanitize filename by removing invalid characters
 */
function sanitizeFilename(filename: string): string {
    return filename
        .replace(/[^a-z0-9\s-]/gi, '') // Remove invalid chars
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Remove consecutive hyphens
        .toLowerCase()
        .substring(0, 50); // Limit length
}

/**
 * Trigger file download in browser
 */
function downloadFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
