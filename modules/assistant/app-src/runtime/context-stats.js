import { buildTokenCounterPayload, estimateTokenCount, estimateConversationTokens, resolveConversationTokens } from '../../../agent-core/runtime/context-tokens.js';

const textEncoder = new TextEncoder();
const CONTEXT_DEBUG_PREVIEW_CHARS = 140;
const CONTEXT_DEBUG_TOP_ENTRY_COUNT = 6;

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

function summarizeContextPayload(messages = [], tools = [], providerConfig = {}) {
    const payload = buildTokenCounterPayload(messages, tools, providerConfig);
    const entries = payload.map((message, index) => {
        const content = String(message.content || '');
        const countedText = content + (message.reasoning_content || '');
        const bytes = textEncoder.encode(countedText).length;
        const isTools = tools.length > 0 && index === payload.length - 1;
        return {
            index: isTools ? -1 : index,
            kind: isTools ? 'tools' : 'message',
            role: String(message.role || ''),
            bytes,
            estimatedTokens: estimateTokenCount(countedText),
            containsLocalPath: content.includes('local/'),
            preview: normalizeDebugPreview(content),
        };
    });

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
        messageCount: messages.length,
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
    const payloadSummary = summarizeContextPayload(messages, tools, providerConfig);
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
        countTokens = resolveConversationTokens,
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
        addJsonValueToSignature(hasher, buildTokenCounterPayload(messages, toolDefinitions, providerConfig), 'payload');
        return hasher.digest();
    }

    async function resolveContextTokens({ messages = [], tools = null, signal } = {}) {
        const providerConfig = getActiveProviderConfig();
        const resolvedTools = resolveToolDefinitions(tools);
        return await countTokens({ messages, tools: resolvedTools, providerConfig, signal });
    }

    async function forceUpdateContextStats(messages = [], tools = null, signal) {
        signal?.throwIfAborted();
        contextStatsAbortController?.abort();
        const requestController = new AbortController();
        contextStatsAbortController = requestController;
        const abort = () => requestController.abort();
        signal?.addEventListener('abort', abort, { once: true });
        const providerConfig = getActiveProviderConfig();
        const resolvedTools = resolveToolDefinitions(tools);
        const signature = buildContextStatsSignature(messages, resolvedTools);
        const summaryActive = !!state.historySummary;
        const cacheHit = latestResolvedContextStatsSignature === signature;
        let measurement;
        try {
            measurement = cacheHit
                ? { tokens: latestResolvedContextTokens, source: 'tokenizer' }
                : await resolveContextTokens({ messages, tools: resolvedTools, signal: requestController.signal });
            requestController.signal.throwIfAborted();
        } finally {
            signal?.removeEventListener('abort', abort);
            if (contextStatsAbortController === requestController) {
                contextStatsAbortController = null;
            }
        }

        const { tokens: usedTokens } = measurement;
        const source = measurement.source === 'tokenizer' ? 'resolved' : 'estimated';
        if (source === 'resolved') {
            latestResolvedContextStatsSignature = signature;
            latestResolvedContextTokens = usedTokens;
        }
        state.contextStats = {
            usedTokens,
            budgetTokens: MAX_CONTEXT_TOKENS,
            summaryActive,
            source,
        };
        logContextStats('forceUpdateContextStats', {
            providerConfig,
            messages,
            tools: resolvedTools,
            usedTokens,
            summaryActive,
            cacheHit,
            source: cacheHit ? 'resolved-cache' : source,
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
            : estimateConversationTokens({ messages, tools: resolvedTools, providerConfig });

        state.contextStats = {
            usedTokens: estimatedTokens,
            budgetTokens: MAX_CONTEXT_TOKENS,
            summaryActive,
            source: cacheHit ? 'resolved' : 'estimated',
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
