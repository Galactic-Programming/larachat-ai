<?php

// app/Services/InputSanitizer.php

namespace App\Services;

class InputSanitizer
{
    /**
     * Sanitize user input to prevent prompt injection
     */
    public static function sanitizeForAI(string $input): string
    {
        // Remove potential prompt injection patterns
        $patterns = [
            '/ignore\s+previous\s+instructions/i',
            '/you\s+are\s+now/i',
            '/forget\s+everything/i',
            '/disregard\s+all/i',
        ];

        $cleaned = $input;
        foreach ($patterns as $pattern) {
            $cleaned = preg_replace($pattern, '', $cleaned);
        }

        // Limit length to prevent token exhaustion attacks
        $cleaned = substr($cleaned, 0, 2000);

        // Strip HTML tags
        $cleaned = strip_tags($cleaned);

        return trim($cleaned);
    }
}
