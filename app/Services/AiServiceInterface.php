<?php

namespace App\Services;

use App\Models\Conversation;

interface AiServiceInterface
{
    /**
     * Generate AI response for a conversation
     *
     * @return array{response: string, usage: array}
     */
    public function generateResponse(Conversation $conversation, string $userMessage): array;

    /**
     * Generate a title for the conversation
     */
    public function generateTitle(string $context): string;

    /**
     * Generate a summary of the conversation
     */
    public function generateSummary(string $conversationText): string;

    /**
     * Categorize the conversation
     */
    public function categorize(string $context): string;

    /**
     * Extract topics from the conversation
     */
    public function extractTopics(string $conversationText): array;
}
