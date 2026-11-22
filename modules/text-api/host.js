import { getRequestHeaders } from '../../../../../../script.js';
import { createIdentifier } from '../../shared/common/identifier.js';
import { setHostChatCompletionsRequestHeadersProvider } from '../../shared/host-llm/chat-completions/client.js';
import { getTextApiRepository } from './repository.js';
import { resolveFeaturePreset } from './model.js';
import { generateText } from './runtime.js';
import { createTextApiRequestHandler } from './bridge.js';

function encodeMessages(messages) {
    const bytes = new TextEncoder().encode(JSON.stringify(messages));
    let binary = '';
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function generateHost(preset, { messages, signal, onDelta }) {
    const { streamingGeneration } = await import('../streaming-generation.js');
    const args = { as: 'user', nonstream: preset.stream ? 'false' : 'true', top64: encodeMessages(messages),
        id: `text-api-${createIdentifier()}` };
    if (preset.temperature != null) args.temperature = preset.temperature;
    if (preset.maxTokens != null) args.max_tokens = preset.maxTokens;
    const fields = { topP: 'top_p', topK: 'top_k', presencePenalty: 'presence_penalty', frequencyPenalty: 'frequency_penalty' };
    for (const [key, field] of Object.entries(fields)) if (preset.sampling?.[key]?.enabled) args[field] = preset.sampling[key].value;
    const task = await streamingGeneration.startRawGeneration(args, '', { signal, onDelta });
    const text = String(await task.completion || '');
    return { text };
}

export async function resolveTextApi(feature) {
    return resolveFeaturePreset(await (await getTextApiRepository()).load(), feature);
}

export async function generateFeatureText(feature, options, snapshot) {
    setHostChatCompletionsRequestHeadersProvider(() => getRequestHeaders());
    return generateText(snapshot || await resolveTextApi(feature), options, { generateHost });
}

// The owning page verifies its iframe before dispatching.
export const handleTextApiRequest = createTextApiRequestHandler({
    getRepository: getTextApiRepository, generateHost,
    prepare: () => setHostChatCompletionsRequestHeadersProvider(() => getRequestHeaders()),
});
