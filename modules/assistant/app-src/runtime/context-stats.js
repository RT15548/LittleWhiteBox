import { estimateTokenCount, estimateConversationTokens, resolveConversationTokens } from '../../../agent-core/runtime/context-tokens.js';

const textEncoder = new TextEncoder();
const CONTEXT_DEBUG_PREVIEW_CHARS = 140;
const CONTEXT_DEBUG_TOP_ENTRY_COUNT = 6;

function buildTokenCounterMessages(messages = []) {
    return messages.map((message) => {
        const contentText = Array.isArray(message.content)
            ? message.content.map((part) => {
                if (!part || typeof part !== 'object') return '';
                if (part.type === 'text') return part.text || '';
                if (part.type === 'image_url') return `[image:${part.name || part.mimeType || 'image'}]`;
                return '';
            }).filter(Boolean).join('\n')
            : (message.content || '');

        if (message.role === 'assistant' && Array.isArray(message.tool_calls) && message.tool_calls.length) {
            const toolCalls = message.tool_calls.map((toolCall) => JSON.stringify({
                id: toolCall.id,
                name: toolCall.function?.name || '',
                arguments: toolCall.function?.arguments || '{}',
            })).join('\n');
            return {
                role: 'assistant',
                content: [contentText, toolCalls].filter(Boolean).join('\n'),
            };
        }

        if (message.role === 'tool') {
            return {
                role: 'tool',
                content: [message.tool_call_id || '', message.content || ''].filter(Boolean).join('\n'),
            };
        }

        return {
            role: message.role,
            content: contentText,
        };
    });
}

function buildTokenCounterPayload(messages = [], tools = []) {
    return [
        ...buildTokenCounterMessages(messages),
        {
            role: 'system',
            content: tools.length ? `TOOLS\n${JSON.stringify(tools)}` : '',
        },
    ].filter((message) => message.content);
}

function createSignatureHasher() {
    let hashA = 2166136261;
    let hashB = 2166136261 ^ 0x9e3779b9;
    let charCount = 0;
    let chunkCount = 0;

    function addText(value = '') {
        const text = String(value ?? '');
        chunkCount += 1;
        charCount += text.length;
        for (let index = 0; index < text.length; index += 1) {
            const code = text.charCodeAt(index);
            hashA ^= code;
            hashA = Math.imul(hashA, 16777619);
            hashB ^= code + 0x9e3779b9 + (hashB << 6) + (hashB >>> 2);
            hashB = Math.imul(hashB, 1597334677);
        }
    }

    function addField(name, value = '') {
        addText('\u001e');
        addText(name);
        addText('\u001f');
        addText(value);
    }

    function digest() {
        return [
            charCount,
            chunkCount,
            (hashA >>> 0).toString(36),
            (hashB >>> 0).toString(36),
        ].join(':');
    }

    return {
        addText,
        addField,
        digest,
    };
}

function addContentToSignature(hasher, content) {
    if (Array.isArray(content)) {
        hasher.addField('content-kind', 'parts');
        hasher.addField('part-count', content.length);
        content.forEach((part, index) => {
            if (!part || typeof part !== 'object') {
                hasher.addField(`part:${index}:empty`, '');
                return;
            }
            hasher.addField(`part:${index}:type`, part.type || '');
            if (part.type === 'text') {
                hasher.addField(`part:${index}:text`, part.text || '');
                return;
            }
            if (part.type === 'image_url') {
                hasher.addField(`part:${index}:image`, part.name || part.mimeType || 'image');
            }
        });
        return;
    }

    hasher.addField('content-kind', 'text');
    hasher.addField('content', content || '');
}

function addToolCallToSignature(hasher, toolCall = {}, index = 0) {
    hasher.addField(`tool-call:${index}:id`, toolCall.id || '');
    hasher.addField(`tool-call:${index}:name`, toolCall.function?.name || '');
    hasher.addField(`tool-call:${index}:arguments`, toolCall.function?.arguments || '{}');
}

function addMessageToSignature(hasher, message = {}, index = 0) {
    hasher.addField(`message:${index}:role`, message.role || '');
    if (message.role === 'tool') {
        hasher.addField(`message:${index}:tool-call-id`, message.tool_call_id || '');
        hasher.addField(`message:${index}:tool-content`, message.content || '');
        return;
    }

    addContentToSignature(hasher, message.content);
    if (message.role === 'assistant' && Array.isArray(message.tool_calls) && message.tool_calls.length) {
        hasher.addField(`message:${index}:tool-call-count`, message.tool_calls.length);
        message.tool_calls.forEach((toolCall, toolCallIndex) => {
            addToolCallToSignature(hasher, toolCall, `${index}:${toolCallIndex}`);
        });
    }
}

function addJsonValueToSignature(hasher, value, path = 'json') {
    if (value === null) {
        hasher.addField(path, 'null');
        return;
    }
    if (Array.isArray(value)) {
        hasher.addField(`${path}:type`, 'array');
        hasher.addField(`${path}:length`, value.length);
        value.forEach((item, index) => addJsonValueToSignature(hasher, item === undefined ? null : item, `${path}:${index}`));
        return;
    }
    if (typeof value === 'object') {
        hasher.addField(`${path}:type`, 'object');
        Object.keys(value).forEach((key) => {
            const item = value[key];
            if (item === undefined || typeof item === 'function' || typeof item === 'symbol') return;
            hasher.addField(`${path}:key`, key);
            addJsonValueToSignature(hasher, item, `${path}:${key}`);
        });
        return;
    }
    hasher.addField(`${path}:type`, typeof value);
    hasher.addField(path, String(value));
}

function normalizeDebugPreview(value, limit = CONTEXT_DEBUG_PREVIEW_CHARS) {
    const text = String(value || '').replace(/\s+/g, ' ').trim();
    if (!text) return '';
    return text.length > limit ? `${text.slice(0, limit)}...` : text;
}

function summarizeContextPayload(messages = [], tools = []) {
    const counterMessages = buildTokenCounterMessages(messages);
    const entries = counterMessages.map((message, index) => {
        const content = String(message.content || '');
        const bytes = textEncoder.encode(content).length;
        return {
            index,
            kind: 'message',
            role: String(message.role || ''),
            bytes,
            estimatedTokens: estimateTokenCount(content),
            containsLocalPath: content.includes('local/'),
            preview: normalizeDebugPreview(content),
        };
    });

    if (tools.length) {
        const toolContent = `TOOLS\n${JSON.stringify(tools)}`;
        const toolBytes = textEncoder.encode(toolContent).length;
        entries.push({
            index: -1,
            kind: 'tools',
            role: 'system',
            bytes: toolBytes,
            estimatedTokens: estimateTokenCount(toolContent),
            containsLocalPath: toolContent.includes('local/'),
            preview: normalizeDebugPreview(toolContent),
        });
    }

    const payload = buildTokenCounterPayload(messages, tools);
    const serializedPayload = JSON.stringify(payload);
    const payloadBytes = textEncoder.encode(serializedPayload).length;
    const totalMessageBytes = entries
        .filter((entry) => entry.kind === 'message')
        .reduce((sum, entry) => sum + entry.bytes, 0);
    const toolEntry = entries.find((entry) => entry.kind === 'tools') || null;

    return {
        payloadBytes,
        payloadEstimatedTokens: estimateTokenCount(serializedPayload),
        totalMessageBytes,
        toolBytes: toolEntry?.bytes || 0,
        toolEstimatedTokens: toolEntry?.estimatedTokens || 0,
        messageCount: counterMessages.length,
        entries,
        topEntries: [...entries]
            .sort((left, right) => right.bytes - left.bytes)
            .slice(0, CONTEXT_DEBUG_TOP_ENTRY_COUNT),
    };
}

function isContextStatsDebugEnabled() {
    try {
        return localStorage.getItem('xiaobaix_assistant_context_stats_debug') === '1';
    } catch {
        return false;
    }
}

function logContextStats(reason, {
    providerConfig,
    messages,
    tools,
    usedTokens,
    summaryActive,
    cacheHit = false,
    source = 'estimated',
} = {}) {
    if (!isContextStatsDebugEnabled()) return;
    const payloadSummary = summarizeContextPayload(messages, tools);
    console.info('[Assistant][ContextStats]', {
        reason,
        source,
        cacheHit,
        provider: String(providerConfig?.provider || ''),
        model: String(providerConfig?.model || ''),
        usedTokens,
        summaryActive: !!summaryActive,
        messageCount: payloadSummary.messageCount,
        toolCount: Array.isArray(tools) ? tools.length : 0,
        payloadBytes: payloadSummary.payloadBytes,
        payloadEstimatedTokens: payloadSummary.payloadEstimatedTokens,
        messageBytes: payloadSummary.totalMessageBytes,
        toolBytes: payloadSummary.toolBytes,
        toolEstimatedTokens: payloadSummary.toolEstimatedTokens,
    });
    console.info('[Assistant][ContextStats][TopEntries]', payloadSummary.topEntries);
}

export function createContextStatsController(deps) {
    const {
        state,
        getActiveProviderConfig,
        getToolDefinitions,
        TOOL_DEFINITIONS,
        MAX_CONTEXT_TOKENS,
    } = deps;

    let latestResolvedContextStatsSignature = '';
    let latestResolvedContextTokens = 0;
    let contextStatsAbortController = null;

    function resolveToolDefinitions(tools = null) {
        if (Array.isArray(tools)) return tools;
        if (typeof getToolDefinitions === 'function') {
            return getToolDefinitions();
        }
        return TOOL_DEFINITIONS;
    }

    function buildContextStatsSignature(messages = [], tools = null) {
        const providerConfig = getActiveProviderConfig();
        const resolvedTools = resolveToolDefinitions(tools);
        const toolDefinitions = Array.isArray(resolvedTools) ? resolvedTools : [];
        const hasher = createSignatureHasher();
        hasher.addField('provider', providerConfig?.provider || '');
        hasher.addField('model', providerConfig?.model || '');
        hasher.addField('message-count', messages.length);
        messages.forEach((message, index) => addMessageToSignature(hasher, message, index));
        hasher.addField('tool-count', toolDefinitions.length);
        addJsonValueToSignature(hasher, toolDefinitions, 'tools');
        return hasher.digest();
    }

    async function resolveContextTokens({ messages = [], tools = null, signal } = {}) {
        const providerConfig = getActiveProviderConfig();
        const resolvedTools = resolveToolDefinitions(tools);
        return await resolveConversationTokens({ messages, tools: resolvedTools, providerConfig, signal });
    }

    async function forceUpdateContextStats(messages = [], tools = null) {
        contextStatsAbortController?.abort();
        const requestController = new AbortController();
        contextStatsAbortController = requestController;
        const providerConfig = getActiveProviderConfig();
        const resolvedTools = resolveToolDefinitions(tools);
        const signature = buildContextStatsSignature(messages, resolvedTools);
        const summaryActive = !!state.historySummary;
        const cacheHit = latestResolvedContextStatsSignature === signature;
        let usedTokens;
        try {
            usedTokens = cacheHit
                ? latestResolvedContextTokens
                : await resolveContextTokens({ messages, tools: resolvedTools, signal: requestController.signal });
        } finally {
            if (contextStatsAbortController === requestController) {
                contextStatsAbortController = null;
            }
        }

        if (!Number.isFinite(usedTokens)) {
            usedTokens = estimateConversationTokens({ messages, tools: resolvedTools });
        }

        latestResolvedContextStatsSignature = signature;
        latestResolvedContextTokens = usedTokens;
        state.contextStats = {
            usedTokens,
            budgetTokens: MAX_CONTEXT_TOKENS,
            summaryActive,
        };
        logContextStats('forceUpdateContextStats', {
            providerConfig,
            messages,
            tools: resolvedTools,
            usedTokens,
            summaryActive,
            cacheHit,
            source: cacheHit ? 'resolved-cache' : 'resolved',
        });
        return usedTokens;
    }

    function formatContextCount(tokens) {
        return `${Math.max(0, Math.round((Number(tokens) || 0) / 1000))}k`;
    }

    function buildContextMeterLabel(stats = state.contextStats) {
        return `${formatContextCount(stats.usedTokens)}/${formatContextCount(stats.budgetTokens)}`;
    }

    function updateContextStats(messages = [], tools = null) {
        const providerConfig = getActiveProviderConfig();
        const resolvedTools = resolveToolDefinitions(tools);
        const signature = buildContextStatsSignature(messages, resolvedTools);
        const summaryActive = !!state.historySummary;
        const cacheHit = latestResolvedContextStatsSignature === signature;
        const estimatedTokens = cacheHit
            ? latestResolvedContextTokens
            : estimateConversationTokens({ messages, tools: resolvedTools });

        state.contextStats = {
            usedTokens: estimatedTokens,
            budgetTokens: MAX_CONTEXT_TOKENS,
            summaryActive,
        };
        logContextStats('updateContextStats', {
            providerConfig,
            messages,
            tools: resolvedTools,
            usedTokens: estimatedTokens,
            summaryActive,
            cacheHit,
            source: cacheHit ? 'resolved-cache' : 'estimated',
        });
    }

    return {
        buildContextMeterLabel,
        forceUpdateContextStats,
        updateContextStats,
    };
}
