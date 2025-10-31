<?php
// app/Services/ModelSelector.php
namespace App\Services;

class ModelSelector
{
    public static function selectForTask(string $taskComplexity): string
    {
        return match($taskComplexity) {
            'simple' => 'gpt-4.1-nano',      // Grammar, simple classification ($0.0005/1K tokens)
            'moderate' => 'gpt-4.1-nano', // Summaries, reasoning ($0.01/1K tokens)
            'complex' => 'gpt-4.1-nano',             // Advanced reasoning ($0.03/1K tokens)
            default => 'gpt-4.1-nano',
        };
    }
}
