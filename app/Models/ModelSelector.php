<?php
// app/Services/ModelSelector.php
namespace App\Services;

class ModelSelector
{
    public static function selectModel(string $complexity = 'moderate'): string
    {
        return match ($complexity) {
            'simple' => 'gpt-4o-mini',      // Grammar, simple classification - Very cheap!
            'moderate' => 'gpt-4o-mini',    // Summaries, reasoning - Best value
            'complex' => 'gpt-4o-mini',     // Advanced reasoning - Still affordable
            default => 'gpt-4o-mini',
        };
    }
}
