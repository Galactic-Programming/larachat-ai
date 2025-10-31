<?php
// app/Models/ModelSelector.php
namespace App\Models;

class ModelSelector
{
    public static function selectModel(string $complexity = 'moderate'): string
    {
        return match ($complexity) {
            'simple' => 'gpt-4o-mini',      // Changed to public model
            'moderate' => 'gpt-4o-mini',    // Changed to public model
            'complex' => 'gpt-4o-mini',     // Changed to public model
            default => 'gpt-4o-mini',
        };
    }

    /**
     * Get all available models with metadata from config
     */
    public static function getAvailableModels(): array
    {
        $models = config('ai.models', []);

        // Filter only enabled models
        return array_filter($models, fn($model) => $model['enabled'] ?? false);
    }
}
