import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface Props {
    settings: {
        model: string;
        temperature: number;
        max_tokens: number;
    };
}

export default function AiSettings({ settings }: Props) {
    const [model, setModel] = useState(settings.model);
    const [temperature, setTemperature] = useState(settings.temperature);
    const [maxTokens, setMaxTokens] = useState(settings.max_tokens);
    const [saving, setSaving] = useState(false);

    const handleSave = () => {
        setSaving(true);
        router.post(
            '/settings/ai',
            {
                model,
                temperature,
                max_tokens: maxTokens,
            },
            {
                onFinish: () => setSaving(false),
            },
        );
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
                        >
                            <option value="gpt-4o-mini">GPT-4o Mini (Fast & Cost-effective)</option>
                            <option value="gpt-4o">GPT-4o (Advanced)</option>
                            <option value="gpt-4-turbo">GPT-4 Turbo (Most Capable)</option>
                        </select>
                        <p className="text-sm text-muted-foreground">
                            Choose the AI model to use. More advanced models provide better responses but may be
                            slower.
                        </p>
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
                            💡 Recommended Settings
                        </h3>
                        <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                            <li>
                                <strong>For precise answers:</strong> Temperature 0.1-0.3, GPT-4o Mini
                            </li>
                            <li>
                                <strong>For creative writing:</strong> Temperature 0.7-0.9, GPT-4o
                            </li>
                            <li>
                                <strong>For balanced responses:</strong> Temperature 0.5, GPT-4o Mini
                            </li>
                        </ul>
                    </div>

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>

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
