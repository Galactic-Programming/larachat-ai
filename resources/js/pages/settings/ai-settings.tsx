import AiSettingsController from '@/actions/App/Http/Controllers/Settings/AiSettingsController';
import AppLayout from '@/layouts/app-layout';
import { Form, Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useAIModels } from '@/hooks/use-ai-models';
import { Loader2 } from 'lucide-react';
import type { AIModelName } from '@/types/chat';
import { toast } from 'sonner';

interface Props {
    settings: {
        model: string;
        temperature: number;
        max_tokens: number;
    };
}

export default function AiSettings({ settings }: Props) {
    // Fetch available models from API
    const { models: availableModelsData, defaultModel, availableModels, isLoading } = useAIModels();

    // Get flash messages from Inertia
    const page = usePage();
    const flash = (page.props as Record<string, unknown>).flash as { success?: string; error?: string } | undefined;

    // Use default model if settings.model is not available, otherwise use settings
    const initialModel = availableModels.length > 0 && !availableModels.includes(settings.model as AIModelName)
        ? (defaultModel || settings.model)
        : settings.model;

    const [model, setModel] = useState(initialModel);
    const [temperature, setTemperature] = useState(settings.temperature);
    const [maxTokens, setMaxTokens] = useState(settings.max_tokens);

    // Show toast when flash message is set
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    // Get model details for display
    const getModelInfo = (modelKey: string) => {
        if (!availableModelsData?.models) return null;
        return availableModelsData.models[modelKey as AIModelName];
    };

    return (
        <AppLayout>
            <Head title="AI Settings" />

            <div className="mx-auto max-w-2xl space-y-8 px-4 py-8">
                <div>
                    <h1 className="text-3xl font-bold">AI Settings</h1>
                    <p className="mt-2 text-muted-foreground">
                        Configure how the AI assistant responds to your questions.
                    </p>
                </div>

                <Form
                    {...AiSettingsController.update.form()}
                    transform={(data) => ({
                        ...data,
                        model,
                        temperature,
                        max_tokens: maxTokens,
                    })}
                    options={{
                        preserveScroll: true,
                    }}
                >
                    {({ processing }) => (
                        <div className="space-y-6 rounded-lg border bg-card p-6">
                            {/* Model Selection */}
                            <div className="space-y-2">
                                <Label htmlFor="model">Model</Label>
                                <select
                                    id="model"
                                    value={model}
                                    onChange={(e) => setModel(e.target.value)}
                                    className="w-full rounded-md border bg-background px-3 py-2"
                                    aria-label="AI Model Selection"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <option>Loading models...</option>
                                    ) : availableModels.length > 0 ? (
                                        availableModels.map((modelKey) => {
                                            const modelInfo = getModelInfo(modelKey);
                                            return (
                                                <option key={modelKey} value={modelKey}>
                                                    {modelInfo?.name || modelKey}
                                                    {modelInfo?.description && ` - ${modelInfo.description}`}
                                                </option>
                                            );
                                        })
                                    ) : (
                                        <>
                                            <option value="llama-3.3-70b-versatile">Llama 3.3 70B Versatile (Recommended)</option>
                                            <option value="llama-3.1-70b-versatile">Llama 3.1 70B Versatile (Fast)</option>
                                            <option value="mixtral-8x7b-32768">Mixtral 8x7B (Ultra-fast)</option>
                                            <option value="gemma2-9b-it">Gemma 2 9B (Lightweight)</option>
                                        </>
                                    )}
                                </select>
                                <p className="text-sm text-muted-foreground">
                                    Choose the AI model to use. More advanced models provide better responses but may be
                                    slower.
                                </p>
                                {isLoading && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Loading available models...
                                    </div>
                                )}
                            </div>

                            {/* Temperature */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="temperature">Temperature: {temperature.toFixed(1)}</Label>
                                </div>
                                <input
                                    type="range"
                                    id="temperature"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={temperature}
                                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                                    className="w-full"
                                    aria-label="Temperature slider"
                                />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>More Precise (0.0)</span>
                                    <span>More Creative (1.0)</span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Lower values (0.1-0.3) make responses more focused and deterministic. Higher values
                                    (0.7-1.0) make them more creative and varied.
                                </p>
                            </div>

                            {/* Max Tokens */}
                            <div className="space-y-2">
                                <Label htmlFor="max_tokens">Max Response Length (tokens)</Label>
                                <Input
                                    type="number"
                                    id="max_tokens"
                                    min="100"
                                    max="4000"
                                    step="100"
                                    value={maxTokens}
                                    onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                                />
                                <p className="text-sm text-muted-foreground">
                                    Maximum length of AI responses. Higher values allow longer responses but use more tokens.
                                    Recommended: 1000-2000.
                                </p>
                            </div>

                            {/* Recommendations */}
                            <div className="rounded-md border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-900/20">
                                <h3 className="mb-2 font-semibold text-blue-900 dark:text-blue-100">
                                    💡 Recommended Settings (Groq FREE API)
                                </h3>
                                <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                                    <li>
                                        <strong>For precise answers:</strong> Temperature 0.1-0.3, Llama 3.3 70B
                                    </li>
                                    <li>
                                        <strong>For creative writing:</strong> Temperature 0.7-0.9, Llama 3.3 70B
                                    </li>
                                    <li>
                                        <strong>For speed:</strong> Gemma 2 9B or Mixtral 8x7B
                                    </li>
                                    <li>
                                        <strong>For function calling:</strong> Llama 3 70B Tool Use
                                    </li>
                                </ul>
                                <div className="mt-3 rounded border border-green-300 bg-green-50 p-2 dark:border-green-700 dark:bg-green-900/20">
                                    <p className="text-xs text-green-800 dark:text-green-200">
                                        <strong>✨ All models are FREE!</strong> Powered by Groq's ultra-fast inference.
                                    </p>
                                </div>
                            </div>

                            {/* Save Button */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                            >
                                {processing ? 'Saving...' : 'Save Settings'}
                            </button>
                        </div>
                    )}
                </Form>

                {/* Current Settings Info */}
                <div className="rounded-md border p-4">
                    <h3 className="mb-2 font-semibold">Current Configuration</h3>
                    <dl className="space-y-1 text-sm">
                        <div className="flex justify-between">
                            <dt className="text-muted-foreground">Model:</dt>
                            <dd className="font-mono">{model}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-muted-foreground">Temperature:</dt>
                            <dd className="font-mono">{temperature}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-muted-foreground">Max Tokens:</dt>
                            <dd className="font-mono">{maxTokens}</dd>
                        </div>
                    </dl>
                </div>
            </div>
        </AppLayout>
    );
}
