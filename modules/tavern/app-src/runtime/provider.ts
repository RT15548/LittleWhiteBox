import { resolveActiveProviderConfig } from '../../../agent-core/provider-config.js';

export interface XbTavernResolvedProvider {
    currentPresetName: string;
    provider: string;
    providerLabel: string;
    baseUrl: string;
    model: string;
    apiKey: string;
    temperature: number;
    maxTokens: number | null;
    timeoutMs: number;
    toolMode: string;
    readiness: {
        ok: boolean;
        missing: string[];
        message: string;
    };
}

const PROVIDER_LABELS: Record<string, string> = {
    'openai-responses': 'OpenAI Responses',
    'openai-compatible': 'OpenAI 兼容',
    'sillytavern-openai-compatible': '酒馆 OpenAI 兼容',
    'sillytavern-claude': '酒馆 Claude',
    'sillytavern-google': '酒馆 Google AI',
    anthropic: 'Anthropic',
    google: 'Google AI',
};

function isSillyTavernProvider(provider = ''): boolean {
    return provider === 'sillytavern-openai-compatible'
        || provider === 'sillytavern-claude'
        || provider === 'sillytavern-google';
}

export function getXbTavernProviderLabel(provider = ''): string {
    return PROVIDER_LABELS[provider] || provider || '未配置';
}

export function resolveXbTavernProviderConfig(agentConfig: Record<string, unknown> = {}): XbTavernResolvedProvider {
    const providerConfig = resolveActiveProviderConfig(agentConfig || {}, {
        timeoutMs: 15 * 60 * 1000,
    });
    const provider = String(providerConfig.provider || '');
    const model = String(providerConfig.model || '').trim();
    const apiKey = String(providerConfig.apiKey || '').trim();
    const missing: string[] = [];
    if (!model) {missing.push('模型');}
    if (!isSillyTavernProvider(provider) && !apiKey) {missing.push('API Key');}
    const message = missing.length
        ? `请先在 API 配置里选择模型/填写 Key：缺少 ${missing.join('、')}`
        : 'API 配置可用';
    return {
        currentPresetName: String(providerConfig.currentPresetName || ''),
        provider,
        providerLabel: getXbTavernProviderLabel(provider),
        baseUrl: String(providerConfig.baseUrl || ''),
        model,
        apiKey,
        temperature: Number(providerConfig.temperature ?? 0.2),
        maxTokens: providerConfig.maxTokens === null || providerConfig.maxTokens === undefined
            ? null
            : Number(providerConfig.maxTokens),
        timeoutMs: Number(providerConfig.timeoutMs) || 15 * 60 * 1000,
        toolMode: String(providerConfig.toolMode || 'native'),
        readiness: {
            ok: missing.length === 0,
            missing,
            message,
        },
    };
}

export function assertXbTavernProviderReady(agentConfig: Record<string, unknown> = {}): XbTavernResolvedProvider {
    const resolved = resolveXbTavernProviderConfig(agentConfig);
    if (!resolved.readiness.ok) {
        throw new Error(resolved.readiness.message);
    }
    return resolved;
}
