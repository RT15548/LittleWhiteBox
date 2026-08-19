import { normalizeAgentConfig, normalizeAgentSettings } from '../../agent-core/config.js';
import {
    createAgentAdapter,
    resolveActiveProviderConfig,
} from '../../agent-core/provider-config.js';
import { createAgentSettingsPanel } from '../../agent-core/ui/settings-panel.js';
import { buildAgentSettingsPanelMarkup } from '../../agent-core/ui/settings-markup.js';
import { setHostChatCompletionsRequestHeadersProvider } from '../../../shared/host-llm/chat-completions/client.js';

const FOURTH_WALL_SYSTEM_PROMPT = [
    '你是小白X“四次元壁”的交流生成器。',
    '只完成本轮四次元壁回复，不调用工具，不编造外部事实。',
    '严格遵循后续提示词里的输出格式，优先输出可被解析的 <thinking> 与 <msg> 内容。',
].join('\n');

function normalizeBuiltPrompt(builtPrompt = {}) {
    return {
        msg1: String(builtPrompt.msg1 || '').trim(),
        msg2: String(builtPrompt.msg2 || '').trim(),
        msg3: String(builtPrompt.msg3 || '').trim(),
        msg4: String(builtPrompt.msg4 || '').trim(),
    };
}

function buildFourthWallMessages(builtPrompt = {}, options = {}) {
    const { msg1, msg2, msg3, msg4 } = normalizeBuiltPrompt(builtPrompt);
    return [
        msg1 ? { role: 'user', content: msg1 } : null,
        msg2 ? { role: 'assistant', content: msg2 } : null,
        msg3 ? { role: 'user', content: msg3 } : null,
        msg4 && !options.disableAssistantPrefill ? { role: 'assistant', content: msg4 } : null,
    ].filter(Boolean);
}

export function configureFourthWallAgent(options = {}) {
    setHostChatCompletionsRequestHeadersProvider(
        typeof options.requestHeadersProvider === 'function'
            ? options.requestHeadersProvider
            : null,
    );
}

export {
    buildAgentSettingsPanelMarkup,
    createAgentSettingsPanel,
    normalizeAgentConfig,
};

export async function generateFourthWallResponse(options = {}) {
    const config = normalizeAgentSettings(options.config || {});
    const providerConfig = resolveActiveProviderConfig(config);
    const adapter = createAgentAdapter(providerConfig, {
        missingApiKeyMessage: '请先在小白agent的 API配置 里填写当前预设的 API Key。',
    });
    const shouldStream = !!options.stream && typeof options.onStreamProgress === 'function';
    const result = await adapter.chat({
        systemPrompt: FOURTH_WALL_SYSTEM_PROMPT,
        messages: buildFourthWallMessages(options.builtPrompt || {}, {
            disableAssistantPrefill: !!options.disableAssistantPrefill,
        }),
        tools: [],
        temperature: providerConfig.temperature,
        maxTokens: providerConfig.maxTokens,
        reasoning: {
            enabled: providerConfig.reasoningEnabled,
            effort: providerConfig.reasoningEffort,
            includeOutput: providerConfig.reasoningIncludeOutput,
        },
        signal: options.signal,
        onStreamProgress: shouldStream ? options.onStreamProgress : undefined,
    });

    return {
        text: String(result?.text || ''),
        thoughts: Array.isArray(result?.thoughts) ? result.thoughts : [],
        provider: result?.provider || providerConfig.provider,
        model: result?.model || providerConfig.model,
        finishReason: result?.finishReason || '',
    };
}
