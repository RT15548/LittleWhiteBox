import { MediaApiError } from '../../../../shared/media-api.js';
import { runPublicImageJob } from '../../shared/public-image-job.js';
import { validateDrawParams } from '../../shared/public-api.js';
import { compileMultimodalBatch, createGenerationRecipe, validateMultimodalInput } from './compiler.js';
import { defaultParams, getActiveParamsPreset } from './settings-model.js';

export function createDirectGeneration(provider, { jobs, frontend, plan, snapshot }) {
    return {
        presetsKey: 'paramsPresets', selectedKey: 'selectedParamsPresetId', snapshot,
        async generate(request, settings, { signal, onProgress, onPrepared, sceneConfig, onAgentRequest } = {}) {
            signal?.throwIfAborted();
            validateMultimodalInput(provider, request);
            for (const character of request.characterPrompts || []) {
                if (character.center !== undefined) throw new MediaApiError('unsupported_field', { field: 'characterPrompts.center' });
            }
            validateDrawParams(request.params === undefined ? {} : request.params, defaultParams(provider));
            if (!settings.apiKey) throw new MediaApiError('not_configured');
            let recipe;
            try {
                recipe = createGenerationRecipe(provider, { ...settings, overrideSize: request.overrideSize ?? settings.overrideSize }, request);
            }
            catch (cause) { throw new MediaApiError('invalid_request', { field: 'params', cause }); }
            const adapted = await plan(provider, { ...request, params: recipe.params }, settings, { signal, sceneConfig, onAgentRequest,
                onStateChange: (state, data) => onProgress?.({ state, ...data }) });
            signal?.throwIfAborted();
            // Only the adapted scene and transport fields may reach the image provider.
            const { context, delay, items: [item], artifacts: [artifact] } = compileMultimodalBatch(provider,
                [{ scene: adapted.prompt, referenceImages: adapted.referenceImages }], recipe);
            onPrepared?.({ presetId: getActiveParamsPreset(settings).id, ...(artifact.providerMetadata ? { providerMetadata: artifact.providerMetadata } : {}) });
            const requestItem = { ...item, request: { ...item.request, resultMode: 'all' } };
            if (settings.sendMode === 'backend') {
                return runPublicImageJob(jobs, { provider, context, delay, items: [requestItem] }, { signal, onProgress });
            }
            return frontend.requestImage(context, requestItem, { signal,
                onStarting: () => { onProgress?.({ state: 'progress', current: 1, total: 1 }); },
                onQueued: data => onProgress?.({ state: 'queued', ...data }),
            });
        },
    };
}

export async function adaptUnplannedTask(provider, task, settings, { signal, onStateChange, promptOverride, negativePrompt, referenceImages, plan }) {
    // A previous provider may have created an existing card. Rewrite all of its
    // input together without moving or re-identifying its chat slot.
    const characterPrompts = (task.characterPrompts || []).map(({ name, prompt, uc }) => ({ name, prompt, uc }));
    const prompt = [promptOverride || task.scene, task.post_prompt].filter(Boolean).join('\n');
    const adapted = await plan(provider, { prompt, characterPrompts,
        negativePrompt: task.negativePrompt ?? negativePrompt, referenceImages: task.referenceImages ?? referenceImages },
    settings, { signal, onStateChange });
    const { placement, title, orientation } = task;
    return { scene: adapted.prompt, placement, title, orientation, referenceImages: adapted.referenceImages };
}
