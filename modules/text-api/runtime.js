import { createAgentAdapter } from '../agent-core/provider-config.js';
import { getModelListApiPrefix, pullModelsForProvider } from '../agent-core/model-list.js';
import { resolveRuntimeReasoning } from '../agent-core/reasoning-capabilities.js';
import { getDefaultApiPrefix, resolveApiBaseUrl } from '../../shared/common/openai-url-utils.js';
import { runWithAbortDeadline } from '../../shared/common/abort-utils.js';
import { HOST_PROVIDER, assertPreset } from './model.js';
import { TEXT_API_COPY as COPY } from './copy.js';
import { CONNECTION_TEST_PROMPT } from './prompts.js';

export function resolveConnection(preset, { modelList = false } = {}) {
    const config = structuredClone(assertPreset(preset));
    const prefix = preset.prefixMode === 'custom' ? preset.customPrefix
        : modelList ? getModelListApiPrefix(preset)
            : getDefaultApiPrefix(['google', 'sillytavern-google'].includes(preset.provider) ? 'google' : 'openai');
    config.baseUrl = resolveApiBaseUrl(preset.baseUrl, prefix);
    config.resolvedBaseUrl = config.baseUrl;
    config.apiKey = String(preset.apiKey || '').trim();
    config.reasoning = resolveRuntimeReasoning(config, preset.reasoning);
    return config;
}

export async function listTextModels(preset, { signal, timeoutMs = 30000 } = {}) {
    if (preset.provider === HOST_PROVIDER) return [];
    const config = resolveConnection(preset, { modelList: true });
    if (!config.baseUrl) throw new Error(COPY.urlRequired);
    const controller = new AbortController();
    const abort = () => controller.abort(signal.reason);
    if (signal?.aborted) abort();
    signal?.addEventListener('abort', abort, { once: true });
    try {
        return await runWithAbortDeadline(() => pullModelsForProvider(config, {
            signal: controller.signal, baseUrlResolved: true,
        }), { controller, timeoutMs, timeoutMessage: COPY.timeout });
    } catch (error) {
        throw connectionError(error, preset);
    } finally { signal?.removeEventListener('abort', abort); }
}

export function connectionError(error, preset) {
    const key = String(preset?.apiKey || '').trim();
    const message = String(error?.message || COPY.requestFailed);
    const safe = new Error(key ? message.split(key).join('[redacted]').split(encodeURIComponent(key)).join('[redacted]') : message);
    safe.name = error?.name || 'Error';
    if (error?.code) safe.code = error.code;
    return safe;
}

export async function generateText(preset, { messages, signal, onDelta, timeoutMs = 180000 } = {}, dependencies = {}) {
    const snapshot = structuredClone(assertPreset(preset));
    const controller = new AbortController();
    const abort = () => controller.abort(signal.reason);
    if (signal?.aborted) abort();
    signal?.addEventListener('abort', abort, { once: true });
    try {
        return await runWithAbortDeadline(async () => {
            controller.signal.throwIfAborted();
            if (snapshot.provider === HOST_PROVIDER) {
                if (!dependencies.generateHost) throw new Error(COPY.hostUnavailable);
                return dependencies.generateHost(snapshot, { messages, signal: controller.signal, onDelta });
            }
            const config = resolveConnection(snapshot);
            if (!config.model.trim()) throw new Error(COPY.modelRequired);
            if (!config.baseUrl.trim()) throw new Error(COPY.urlRequired);
            const adapter = (dependencies.createAdapter || createAgentAdapter)({ ...config, timeoutMs });
            let previous = '';
            const result = await adapter.chat({
                messages, signal: controller.signal, reasoning: config.reasoning,
                ...(snapshot.maxTokens != null ? { maxTokens: snapshot.maxTokens } : {}),
                ...(snapshot.temperature != null ? { temperature: snapshot.temperature } : {}),
                ...(snapshot.stream ? { onStreamProgress: progress => {
                    if (typeof progress.text !== 'string') return;
                    const full = progress.text;
                    onDelta?.(full.startsWith(previous) ? full.slice(previous.length) : full, full);
                    previous = full;
                } } : {}),
            });
            if (!snapshot.stream) onDelta?.(result.text, result.text);
            return { text: result.text, usage: result.usage ?? result.responseInfo?.usage, finishReason: result.finishReason,
                completion: result.completion, truncated: result.truncated };
        }, { controller, timeoutMs, timeoutMessage: COPY.timeout });
    } catch (error) {
        throw connectionError(error, snapshot);
    } finally {
        signal?.removeEventListener('abort', abort);
    }
}

export async function testTextConnection(preset, options = {}, dependencies = {}) {
    const result = await generateText(preset, {
        ...options, messages: [{ role: 'user', content: CONNECTION_TEST_PROMPT }],
    }, dependencies);
    if (!String(result.text || '').trim()) throw new Error(COPY.emptyResponse);
    return { ok: true };
}
