import { copyRequest, MediaApiError, mediaFailure, requireFields, selectPreset } from '../../../shared/media-api.js';

export const DRAW_REQUEST_FIELDS = Object.freeze([
    'provider', 'apiPresetId', 'paramsPresetId', 'workflowPresetId', 'prompt', 'negativePrompt',
    'positivePrefix', 'characterPrompts', 'params', 'overrideSize', 'seed', 'workflowMode', 'customWorkflow',
    'signal', 'onProgress',
]);

/** Resolve one request against an isolated provider snapshot, never the saved object. */
export function resolveDrawSettings(saved, request, { presetsKey, selectedKey }) {
    const settings = structuredClone(saved);
    if (request.apiPresetId !== undefined) {
        Object.assign(settings, selectPreset(settings.apiPresets, request.apiPresetId, 'apiPresetId').config);
        settings.activeApiPresetId = request.apiPresetId;
    }
    if (request.paramsPresetId !== undefined) {
        selectPreset(settings[presetsKey], request.paramsPresetId, 'paramsPresetId');
        settings[selectedKey] = request.paramsPresetId;
    }
    if (request.workflowPresetId !== undefined) {
        if (!settings.workflowPresets) throw new MediaApiError('unsupported_field', { field: 'workflowPresetId' });
        const workflow = selectPreset(settings.workflowPresets, request.workflowPresetId, 'workflowPresetId');
        settings.customWorkflow = { ...workflow };
        delete settings.customWorkflow.id;
        delete settings.customWorkflow.name;
        settings.selectedWorkflowPresetId = workflow.id;
        settings.workflowMode = 'custom';
    }
    if (request.overrideSize !== undefined) settings.overrideSize = request.overrideSize;
    if (request.workflowMode !== undefined) settings.workflowMode = request.workflowMode;
    if (request.customWorkflow !== undefined) {
        requireFields(request.customWorkflow, Object.keys(settings.customWorkflow || {}), 'customWorkflow');
        for (const [key, value] of Object.entries(request.customWorkflow)) {
            if (typeof value !== 'string') throw new MediaApiError('invalid_request', { field: `customWorkflow.${key}` });
        }
        settings.customWorkflow = { ...settings.customWorkflow, ...request.customWorkflow };
    }
    return settings;
}

export function validateDrawParams(params, defaults) {
    requireFields(params, Object.keys(defaults), 'params');
    for (const [field, value] of Object.entries(params)) {
        const expected = typeof defaults[field];
        if (value === undefined) continue;
        if (value === null || (['number', 'string', 'boolean'].includes(expected) && typeof value !== expected)
            || (typeof value === 'number' && !Number.isFinite(value))) {
            throw new MediaApiError('invalid_request', { field: `params.${field}` });
        }
    }
}

export function validateDrawInput(request, defaults, { workflow = false, seed = false } = {}) {
    for (const field of ['prompt', 'negativePrompt', 'positivePrefix', 'overrideSize']) {
        if (request[field] !== undefined && typeof request[field] !== 'string') throw new MediaApiError('invalid_request', { field });
    }
    if (typeof request.prompt !== 'string') throw new MediaApiError('invalid_request', { field: 'prompt' });
    if (!workflow) {
        for (const field of ['workflowPresetId', 'workflowMode', 'customWorkflow']) {
            if (request[field] !== undefined) throw new MediaApiError('unsupported_field', { field });
        }
    }
    if (!seed && request.seed !== undefined) throw new MediaApiError('unsupported_field', { field: 'seed' });
    if (request.seed !== undefined && (!Number.isInteger(request.seed) || request.seed < 0)) throw new MediaApiError('invalid_request', { field: 'seed' });
    validateDrawParams(request.params === undefined ? {} : request.params, defaults);
    for (const field of ['width', 'height', 'steps', 'batch_size', 'n_iter', 'clip_skip']) {
        const value = request.params?.[field];
        if (value !== undefined && (!Number.isInteger(value) || value <= 0)) throw new MediaApiError('invalid_request', { field: `params.${field}` });
    }
    if (request.params?.seed !== undefined && (!Number.isSafeInteger(request.params.seed) || request.params.seed < -1)) throw new MediaApiError('invalid_request', { field: 'params.seed' });
    if (request.characterPrompts !== undefined) {
        if (!Array.isArray(request.characterPrompts)) throw new MediaApiError('invalid_request', { field: 'characterPrompts' });
        for (const character of request.characterPrompts) {
            requireFields(character, ['prompt', 'uc', 'center'], 'characterPrompts');
            for (const key of ['prompt', 'uc']) {
                if (character[key] !== undefined && typeof character[key] !== 'string') throw new MediaApiError('invalid_request', { field: `characterPrompts.${key}` });
            }
            if (character.center !== undefined) {
                requireFields(character.center, ['x', 'y'], 'characterPrompts.center');
                if (![character.center.x, character.center.y].every(value => Number.isFinite(value) && value >= 0 && value <= 1)) {
                    throw new MediaApiError('invalid_request', { field: 'characterPrompts.center' });
                }
            }
        }
    }
}

export function createDrawPublicApi({ isEnabled, getProvider, providers }) {
    const requests = new Set();
    function resolveProvider(provider = getProvider()) {
        if (!isEnabled()) throw new MediaApiError('disabled');
        if (!Object.hasOwn(providers, provider)) throw new MediaApiError('invalid_request', { field: 'provider' });
        return { provider, adapter: providers[provider] };
    }
    return {
        async getPresets(options = {}) {
            requireFields(options, ['provider']);
            const resolved = resolveProvider(options.provider);
            let settings;
            try { settings = await resolved.adapter.snapshot(); }
            catch (error) { throw mediaFailure(error); }
            const list = (items, selected) => (items || []).map(item => ({ id: item.id, name: item.name, selected: item.id === selected }));
            return {
                provider: resolved.provider,
                api: list(settings.apiPresets, settings.activeApiPresetId),
                params: list(settings[resolved.adapter.presetsKey], settings[resolved.adapter.selectedKey]),
                workflows: list(settings.workflowPresets, settings.selectedWorkflowPresetId),
            };
        },
        async generate(input) {
            requireFields(input, DRAW_REQUEST_FIELDS);
            const request = copyRequest(input);
            const { signal, onProgress } = input;
            if (signal !== undefined && (typeof signal?.addEventListener !== 'function' || typeof signal?.aborted !== 'boolean')) throw new MediaApiError('invalid_request', { field: 'signal' });
            if (onProgress !== undefined && typeof onProgress !== 'function') throw new MediaApiError('invalid_request', { field: 'onProgress' });
            const { adapter } = resolveProvider(request.provider);
            const controller = new AbortController();
            const abort = () => controller.abort();
            if (signal?.aborted) abort();
            else signal?.addEventListener('abort', abort, { once: true });
            requests.add(controller);
            try {
                controller.signal.throwIfAborted();
                const snapshot = adapter.snapshot();
                const saved = snapshot instanceof Promise ? await snapshot : snapshot;
                controller.signal.throwIfAborted();
                const settings = resolveDrawSettings(saved, request, adapter);
                const images = await adapter.generate(request, settings, {
                    signal: controller.signal,
                    onProgress,
                });
                if (controller.signal.aborted) throw new MediaApiError('aborted', { partialResult: { images } });
                if (!Array.isArray(images) || !images.length) throw new MediaApiError('invalid_result');
                return { images };
            } catch (error) { throw mediaFailure(error, controller.signal); }
            finally {
                requests.delete(controller);
                signal?.removeEventListener('abort', abort);
            }
        },
        cancelAll() { for (const controller of requests) controller.abort(); },
    };
}
