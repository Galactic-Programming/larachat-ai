<?php

namespace App\Services;

use App\Models\Conversation;

interface AiServiceInterface
{
    /**
     * Generate AI response for a conversation
     *
     * @param Conversation $conversation
     * @param string $userMessage
     * @return array{response: string, usage: array}
     */
    public function generateResponse(Conversation $conversation, string $userMessage): array;

    /**
     * Generate a title for the conversation
     *
     * @param string $context
     * @return string
     */
    public function generateTitle(string $context): string;

    /**
     * Generate a summary of the conversation
     *
     * @param string $conversationText
     * @return string
     */
    public function generateSummary(string $conversationText): string;

    /**
     * Categorize the conversation
     *
     * @param string $context
     * @return string
     */
    public function categorize(string $context): string;

    /**
     * Extract topics from the conversation
     *
     * @param string $conversationText
     * @return array
     */
    public function extractTopics(string $conversationText): array;
}
