import { getRequestHeaders } from '../../../../../../../../script.js';
import { getCurrentUserHandle } from '../../../../../../../user.js';
import { sha256 } from '../../../../libs/js-sha256.mjs';
import { createImageBackendJobsClient, readImageBlobBase64 } from '../../shared/backend-image-jobs.js';
import { resolveDrawAgentProviderConfig } from '../../shared/draw-agent.js';
import { stableSerialize } from '../../shared/generation-fingerprint.js';
import { capturePublicGallery } from '../../shared/public-gallery.js';
import { generateCollectedDrawResult } from '../../shared/public-api.js';
import { createDirectGeneration } from './direct-generation.js';
import { createMultimodalChatRuntime } from './chat-runtime.js';
import { planDirectInput } from './planning.js';
import { getActiveParamsPreset, PROVIDERS } from './settings-model.js';
import { getSettings, loadSettings } from './settings.js';
import { createMultimodalFrontendTransport } from './frontend-transport.js';
import { drawNotify } from '../../shared/draw-toast.js';
import { formatOpenAiImageMismatch } from './openai-image-errors.js';

const client = createImageBackendJobsClient({ getHeaders: getRequestHeaders, getOwner: getCurrentUserHandle });

export function createMultimodalPublicGeneration(provider, jobs = client, plan = planDirectInput, frontend = createMultimodalFrontendTransport(provider)) {
    return createDirectGeneration(provider, { jobs, frontend, plan, snapshot: () => loadSettings(provider) });
}

export async function captureMultimodalGeneration(execution, resolveScene = resolveDrawAgentProviderConfig) {
    const { apiBaseUrl, apiKey, timeout, sendMode, imageApi, responsesModel, overrideSize, paramsPresets, selectedParamsPresetId, promptPresets, selectedPromptPresetId } = execution;
    const { providerConfig: sceneConfig } = await resolveScene({ timeout });
    return { execution, sceneConfig, fingerprint: {
        imageConnection: sha256(stableSerialize({ apiBaseUrl, apiKey, sendMode, imageApi, responsesModel })),
        sceneConfig: sha256(stableSerialize(sceneConfig)),
        timeout, overrideSize,
        paramsPreset: paramsPresets.find(preset => preset.id === selectedParamsPresetId),
        promptPreset: promptPresets.find(preset => preset.id === selectedPromptPresetId),
    } };
}

export const multimodalProviders = Object.fromEntries(Object.keys(PROVIDERS).map(provider => {
    const publicGeneration = createMultimodalPublicGeneration(provider);
    const openSettings = options => import('./settings-ui.js').then(ui => ui.openSettings(provider, options));
    const closeSettings = () => import('./settings-ui.js').then(ui => ui.closeSettings(provider));
    const chat = createMultimodalChatRuntime(provider, client, { openSettings, closeSettings });
    const facade = {
        ...chat.facade,
        openSettings,
        buildPromptData(input) {
            const settings = getSettings(provider);
            const preset = getActiveParamsPreset(settings);
            const prompt = input.prompt ?? input.tags;
            // Keep guidance separate until the scene model adapts the request.
            return { tags: prompt, positive: prompt, positivePrefix: input.positivePrefix ?? preset.positivePrefix,
                negativePrompt: input.negativePrompt ?? input.negative, characterPrompts: input.characterPrompts,
                referenceImages: input.referenceImages, params: input.params,
                overrideSize: input.overrideSize };
        },
        getGenerationSnapshot() {
            return captureMultimodalGeneration(getSettings(provider));
        },
        async generateImage({ generationConfig = getSettings(provider), sceneConfig, onQueueStateChange, signal, ...request } = {}) {
            let requested;
            const [image] = await publicGeneration.generate(request, generationConfig, { signal, sceneConfig,
                onPrepared: ({ providerMetadata }) => { requested = providerMetadata?.requestedOutputFormat; },
                onProgress: ({ state, ...info }) => onQueueStateChange?.(state === 'progress' ? 'start' : state, info) });
            const notice = formatOpenAiImageMismatch(requested, image.type);
            if (notice) drawNotify.warning(notice);
            return readImageBlobBase64(image);
        },
    };
    return [provider, { ...chat, facade, publicGeneration }];
}));

export async function generateTestImage(provider, { settings, signal, onProgress, onAgentRequest, ...request } = {}) {
    const saveImages = capturePublicGallery(request, provider);
    const { publicGeneration: adapter } = multimodalProviders[provider];
    return generateCollectedDrawResult({
        adapter: { generate: (input, config, options) => adapter.generate(input, config, { ...options, onAgentRequest }) },
        request, settings: settings ?? await adapter.snapshot(), saveImages, signal, onProgress,
    });
}
