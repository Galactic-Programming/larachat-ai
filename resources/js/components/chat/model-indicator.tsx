// resources/js/components/chat/model-indicator.tsx
import { useAIModels } from '@/hooks/use-ai-models';
import { usePage } from '@inertiajs/react';
import { Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { AIModelName } from '@/types/chat';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

export function ModelIndicator() {
    const { defaultModel, models, isLoading } = useAIModels();
    const page = usePage();

    // Get user's selected model from global shared settings
    const pageProps = page.props as Record<string, unknown>;
    const aiSettings = pageProps.aiSettings as { model?: string } | undefined;
    const userSelectedModel = aiSettings?.model as AIModelName | undefined;

    // Use user's selected model if available, otherwise use default
    const activeModelKey = userSelectedModel || defaultModel;    if (isLoading || !activeModelKey || !models) {
        return null;
    }

    const currentModel = models.models[activeModelKey as AIModelName];

    // If model not found in available models, don't render
    if (!currentModel) {
        return null;
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Badge
                        variant="secondary"
                        className="flex items-center gap-1.5 cursor-help"
                    >
                        <Sparkles className="h-3 w-3" />
                        <span className="text-xs font-medium">
                            {currentModel.name}
                        </span>
                    </Badge>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                    <div className="space-y-1">
                        <p className="font-semibold">{currentModel.name}</p>
                        <p className="text-xs text-muted-foreground">
                            {currentModel.description}
                        </p>
                        {currentModel.pricing && (
                            <p className="text-xs text-muted-foreground mt-2">
                                Pricing: ${currentModel.pricing.input.toFixed(5)}/
                                ${currentModel.pricing.output.toFixed(5)} per 1K tokens
                            </p>
                        )}
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
