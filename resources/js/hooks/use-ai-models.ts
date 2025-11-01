// resources/js/hooks/use-ai-models.ts
import { useState, useEffect } from 'react';
import axios from 'axios';
import type { AIModelsResponse, AIModelName } from '@/types/chat';

interface UseAIModelsReturn {
    models: AIModelsResponse | null;
    defaultModel: AIModelName | null;
    availableModels: AIModelName[];
    isLoading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
}

/**
 * Hook to fetch and manage available AI models
 */
export function useAIModels(): UseAIModelsReturn {
    const [models, setModels] = useState<AIModelsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchModels = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await axios.get<AIModelsResponse>('/api/ai/models');
            setModels(response.data);
        } catch (err) {
            console.error('Failed to fetch AI models:', err);
            setError('Failed to load available AI models');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchModels();
    }, []);

    // Backend already filters enabled models, so all returned models are available
    const availableModels = models
        ? (Object.keys(models.models) as AIModelName[])
        : [];

    return {
        models,
        defaultModel: models?.default_model ?? null,
        availableModels,
        isLoading,
        error,
        refresh: fetchModels,
    };
}
