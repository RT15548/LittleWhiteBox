'use strict';

const { MAX_TIMEOUT_MS } = require('../providers/upstream.js');

const MAX_ENVELOPE_BYTES = 2 * 1024 * 1024;
const MAX_IMAGE_ITEMS = 20;
const MAX_CONFIGURED_CHARACTERS_PER_IMAGE = 999;
const IMAGE_PROVIDERS = new Set(['novelai', 'sd-webui', 'comfyui']);
const AGENT_CHANNELS = new Set([
    'openai-compatible',
    'openai-responses',
    'anthropic',
    'google',
    'sillytavern-openai-compatible',
    'sillytavern-claude',
    'sillytavern-google',
]);
const HOSTED_AGENT_CHANNELS = new Set([
    'sillytavern-openai-compatible',
    'sillytavern-claude',
    'sillytavern-google',
]);

function invalid(message, status = 400, code = 'invalid_draw_run') {
    const error = new Error(message);
    error.status = status;
    error.code = code;
    return error;
}

function assertPlainObject(value, path) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw invalid(`${path} must be an object`);
    }
    return value;
}

function assertExactKeys(value, allowed, path, required = allowed) {
    const object = assertPlainObject(value, path);
    const allowedSet = new Set(allowed);
    for (const key of Object.keys(object)) {
        if (!allowedSet.has(key)) throw invalid(`${path}.${key} is not allowed`);
    }
    for (const key of required) {
        if (!Object.hasOwn(object, key)) throw invalid(`${path}.${key} is required`);
    }
    return object;
}

function requireString(value, path, { allowEmpty = false } = {}) {
    if (typeof value !== 'string') throw invalid(`${path} must be a string`);
    if (!allowEmpty && !value.trim()) throw invalid(`${path} must not be empty`);
    return value;
}

function requireInteger(value, path, min, max) {
    if (!Number.isInteger(value) || value < min || value > max) {
        throw invalid(`${path} must be an integer between ${min} and ${max}`);
    }
    return value;
}

function requirePositiveNumber(value, path, { allowZero = false } = {}) {
    if (typeof value !== 'number' || !Number.isFinite(value) || (allowZero ? value < 0 : value <= 0)) {
        throw invalid(`${path} must be ${allowZero ? 'non-negative' : 'positive'}`);
    }
    return value;
}

function requireImageDelay(value, path) {
    const normalized = Math.round(value);
    if (typeof value !== 'number' || !Number.isFinite(value)
        || normalized < 1 || normalized > MAX_TIMEOUT_MS) {
        throw invalid(`${path} must round to an integer between 1 and ${MAX_TIMEOUT_MS}`);
    }
    return normalized;
}

function requireBoolean(value, path) {
    if (typeof value !== 'boolean') throw invalid(`${path} must be a boolean`);
    return value;
}

function assertSafeJson(value, path = 'value', seen = new WeakSet()) {
    if (value === null || ['string', 'boolean'].includes(typeof value)) return;
    if (typeof value === 'number' && Number.isFinite(value)) return;
    if (Array.isArray(value)) {
        if (seen.has(value)) throw invalid(`${path} must not be circular`);
        seen.add(value);
        value.forEach((item, index) => assertSafeJson(item, `${path}[${index}]`, seen));
        seen.delete(value);
        return;
    }
    if (!value || typeof value !== 'object') throw invalid(`${path} must contain JSON values only`);
    if (seen.has(value)) throw invalid(`${path} must not be circular`);
    seen.add(value);
    for (const [key, child] of Object.entries(value)) {
        if (key === '__proto__' || key === 'prototype' || key === 'constructor') {
            throw invalid(`${path}.${key} is not allowed`);
        }
        assertSafeJson(child, `${path}.${key}`, seen);
    }
    seen.delete(value);
}

function cloneJson(value) {
    assertSafeJson(value);
    return JSON.parse(JSON.stringify(value));
}

function validateSceneSource(value, runtime) {
    const source = assertExactKeys(
        value,
        ['sourceText', 'sourceHash', 'content', 'numberedContent', 'points'],
        'planner.validationContext.sceneSource',
    );
    const sourceText = requireString(source.sourceText, 'planner.validationContext.sceneSource.sourceText', { allowEmpty: true });
    const sourceHash = requireString(source.sourceHash, 'planner.validationContext.sceneSource.sourceHash');
    if (runtime.hashSceneSource(sourceText) !== sourceHash) {
        throw invalid('planner.validationContext.sceneSource.sourceHash does not match sourceText');
    }
    requireString(source.content, 'planner.validationContext.sceneSource.content', { allowEmpty: true });
    requireString(source.numberedContent, 'planner.validationContext.sceneSource.numberedContent', { allowEmpty: true });
    if (!Array.isArray(source.points) || source.points.length === 0 || source.points.length > 100_000) {
        throw invalid('planner.validationContext.sceneSource.points is invalid');
    }
    let previousOffset = -1;
    source.points.forEach((point, index) => {
        assertExactKeys(point, ['number', 'offset'], `planner.validationContext.sceneSource.points[${index}]`);
        if (point.number !== index + 1) throw invalid('scene point numbers must be consecutive');
        const offset = requireInteger(point.offset, `sceneSource.points[${index}].offset`, 0, sourceText.length);
        if (offset <= previousOffset) throw invalid('scene point offsets must be strictly increasing');
        previousOffset = offset;
    });
    return cloneJson(source);
}

function validatePlanner(value, runtime) {
    const planner = assertExactKeys(value, ['prompt', 'validationContext', 'presentCharacters'], 'planner');
    const prompt = assertExactKeys(planner.prompt, ['systemPrompt', 'messages'], 'planner.prompt');
    requireString(prompt.systemPrompt, 'planner.prompt.systemPrompt', { allowEmpty: true });
    if (!Array.isArray(prompt.messages) || prompt.messages.length !== 1) {
        throw invalid('planner.prompt.messages must contain exactly one user message');
    }
    const message = assertExactKeys(prompt.messages[0], ['role', 'content'], 'planner.prompt.messages[0]');
    if (message.role !== 'user') throw invalid('planner.prompt.messages[0].role must be user');
    requireString(message.content, 'planner.prompt.messages[0].content');

    const context = assertExactKeys(
        planner.validationContext,
        ['sceneSource', 'effectiveMaxImages', 'maxPlanImages', 'effectiveMaxCharactersPerImage', 'centerMode'],
        'planner.validationContext',
    );
    const sceneSource = validateSceneSource(context.sceneSource, runtime);
    const effectiveMaxImages = requireInteger(
        context.effectiveMaxImages,
        'planner.validationContext.effectiveMaxImages',
        0,
        MAX_IMAGE_ITEMS,
    );
    const maxPlanImages = requireInteger(
        context.maxPlanImages,
        'planner.validationContext.maxPlanImages',
        1,
        MAX_IMAGE_ITEMS,
    );
    if (effectiveMaxImages > maxPlanImages) throw invalid('effectiveMaxImages exceeds maxPlanImages');
    if (maxPlanImages > sceneSource.points.length) throw invalid('maxPlanImages exceeds available scene points');
    const effectiveMaxCharactersPerImage = requireInteger(
        context.effectiveMaxCharactersPerImage,
        'planner.validationContext.effectiveMaxCharactersPerImage',
        0,
        MAX_CONFIGURED_CHARACTERS_PER_IMAGE,
    );
    if (context.centerMode !== 'grid' && context.centerMode !== 'normalized') {
        throw invalid('planner.validationContext.centerMode is invalid');
    }
    if (!Array.isArray(planner.presentCharacters) || planner.presentCharacters.length > 500) {
        throw invalid('planner.presentCharacters must be an array with at most 500 entries');
    }
    assertSafeJson(planner.presentCharacters, 'planner.presentCharacters');
    return {
        prompt: cloneJson(prompt),
        validationContext: {
            sceneSource,
            effectiveMaxImages,
            maxPlanImages,
            effectiveMaxCharactersPerImage,
            centerMode: context.centerMode,
        },
        presentCharacters: cloneJson(planner.presentCharacters),
    };
}

function validateAgent(value) {
    const agent = assertExactKeys(value, ['channel', 'providerConfig'], 'agent');
    const channel = requireString(agent.channel, 'agent.channel');
    if (!AGENT_CHANNELS.has(channel)) throw invalid('agent.channel is invalid');
    const allowedConfigFields = [
        'currentPresetName', 'provider', 'baseUrl', 'model', 'apiKey',
        'temperature', 'sendTemperature', 'maxTokens', 'timeoutMs',
        'toolMode', 'reasoning',
    ];
    const config = assertExactKeys(agent.providerConfig, allowedConfigFields, 'agent.providerConfig', [
        'provider', 'baseUrl', 'model', 'maxTokens', 'timeoutMs', 'toolMode', 'reasoning',
    ]);
    if (config.provider !== channel) throw invalid('agent.providerConfig.provider must match agent.channel');
    if (Object.hasOwn(config, 'currentPresetName')) {
        requireString(config.currentPresetName, 'agent.providerConfig.currentPresetName', { allowEmpty: true });
    }
    requireString(config.model, 'agent.providerConfig.model');
    requireString(config.baseUrl, 'agent.providerConfig.baseUrl', { allowEmpty: true });
    if (Object.hasOwn(config, 'apiKey')) {
        requireString(config.apiKey, 'agent.providerConfig.apiKey', { allowEmpty: true });
    }
    if (Object.hasOwn(config, 'temperature')) {
        requirePositiveNumber(config.temperature, 'agent.providerConfig.temperature', { allowZero: true });
    }
    if (Object.hasOwn(config, 'sendTemperature')) {
        requireBoolean(config.sendTemperature, 'agent.providerConfig.sendTemperature');
    }
    requirePositiveNumber(config.maxTokens, 'agent.providerConfig.maxTokens');
    requirePositiveNumber(config.timeoutMs, 'agent.providerConfig.timeoutMs');
    if (config.toolMode !== 'native' && config.toolMode !== 'tagged-json') {
        throw invalid('agent.providerConfig.toolMode is invalid');
    }
    assertPlainObject(config.reasoning, 'agent.providerConfig.reasoning');
    assertSafeJson(config.reasoning, 'agent.providerConfig.reasoning');
    if (!HOSTED_AGENT_CHANNELS.has(channel) && !String(config.apiKey || '').trim()) {
        throw invalid('direct agent channels require agent.providerConfig.apiKey');
    }
    return { channel, providerConfig: cloneJson(config) };
}

function validateCommonRecipe(recipe, path) {
    requirePositiveNumber(recipe.timeout, `${path}.timeout`);
    if (!Array.isArray(recipe.knownCharacters) || recipe.knownCharacters.length > 500) {
        throw invalid(`${path}.knownCharacters must be an array with at most 500 entries`);
    }
    assertSafeJson(recipe.knownCharacters, `${path}.knownCharacters`);
    requireString(recipe.positivePrefix, `${path}.positivePrefix`, { allowEmpty: true });
    requireString(recipe.negativePrefix, `${path}.negativePrefix`, { allowEmpty: true });
}

function validateGenerationRecipe(provider, value, imageCount) {
    const path = 'generationRecipe';
    let recipe;
    if (provider === 'novelai') {
        recipe = assertExactKeys(value, [
            'apiBaseUrl', 'apiKey', 'insecureTLS', 'timeout', 'requestDelay', 'overrideSize',
            'baseHref', 'resolveForBackend', 'params', 'positivePrefix', 'negativePrefix',
            'knownCharacters', 'autoLearnEnabled', 'autoLearnMode', 'seeds',
        ], path, [
            'apiBaseUrl', 'apiKey', 'insecureTLS', 'timeout', 'requestDelay', 'overrideSize',
            'resolveForBackend', 'params', 'positivePrefix', 'negativePrefix', 'knownCharacters',
            'autoLearnEnabled', 'autoLearnMode', 'seeds',
        ]);
        validateCommonRecipe(recipe, path);
        // 空值是 NovelAI 官方图片域名的现行设置语义；compiler 会在服务端解析为官方端点。
        requireString(recipe.apiBaseUrl, `${path}.apiBaseUrl`, { allowEmpty: true });
        requireString(recipe.apiKey, `${path}.apiKey`);
        requireBoolean(recipe.insecureTLS, `${path}.insecureTLS`);
        if (recipe.resolveForBackend !== true) throw invalid(`${path}.resolveForBackend must be true`);
        requireString(recipe.overrideSize, `${path}.overrideSize`, { allowEmpty: true });
        if (Object.hasOwn(recipe, 'baseHref')) {
            requireString(recipe.baseHref, `${path}.baseHref`, { allowEmpty: true });
        }
        const delay = assertExactKeys(recipe.requestDelay, ['min', 'max'], `${path}.requestDelay`);
        const min = requireImageDelay(delay.min, `${path}.requestDelay.min`);
        const max = requireImageDelay(delay.max, `${path}.requestDelay.max`);
        if (min > max) throw invalid(`${path}.requestDelay.min must not exceed max`);
        assertPlainObject(recipe.params, `${path}.params`);
        requireBoolean(recipe.autoLearnEnabled, `${path}.autoLearnEnabled`);
        if (!['new_only', 'auto_update'].includes(recipe.autoLearnMode)) {
            throw invalid(`${path}.autoLearnMode must be new_only or auto_update`);
        }
        if (!Array.isArray(recipe.seeds) || recipe.seeds.length !== imageCount) {
            throw invalid(`${path}.seeds must match maxPlanImages`);
        }
        recipe.seeds.forEach((seed, index) => requireInteger(
            seed,
            `${path}.seeds[${index}]`,
            0,
            0xFFFFFFFF,
        ));
    } else if (provider === 'sd-webui') {
        recipe = assertExactKeys(value, [
            'host', 'auth', 'timeout', 'delayMs', 'params', 'positivePrefix', 'negativePrefix',
            'knownCharacters', 'promptOverride', 'negativePromptOverride',
        ], path);
        validateCommonRecipe(recipe, path);
        requireString(recipe.host, `${path}.host`);
        requireString(recipe.auth, `${path}.auth`, { allowEmpty: true });
        requireImageDelay(recipe.delayMs, `${path}.delayMs`);
        assertPlainObject(recipe.params, `${path}.params`);
        requireString(recipe.promptOverride, `${path}.promptOverride`, { allowEmpty: true });
        requireString(recipe.negativePromptOverride, `${path}.negativePromptOverride`, { allowEmpty: true });
    } else {
        recipe = assertExactKeys(value, [
            'host', 'auth', 'timeout', 'delayMs', 'workflowMode', 'customWorkflow', 'params',
            'positivePrefix', 'negativePrefix', 'knownCharacters', 'promptOverride',
            'negativePromptOverride', 'seeds',
        ], path);
        validateCommonRecipe(recipe, path);
        requireString(recipe.host, `${path}.host`);
        requireString(recipe.auth, `${path}.auth`, { allowEmpty: true });
        requireImageDelay(recipe.delayMs, `${path}.delayMs`);
        if (recipe.workflowMode !== 'simple' && recipe.workflowMode !== 'custom') {
            throw invalid(`${path}.workflowMode is invalid`);
        }
        const customWorkflow = assertExactKeys(recipe.customWorkflow, [
            'json', 'nodePositive', 'nodeNegative', 'nodeWidth', 'nodeHeight', 'nodeSeed', 'nodeSaveImage',
        ], `${path}.customWorkflow`);
        Object.keys(customWorkflow).forEach(key => requireString(
            customWorkflow[key],
            `${path}.customWorkflow.${key}`,
            { allowEmpty: true },
        ));
        assertPlainObject(recipe.params, `${path}.params`);
        requireString(recipe.promptOverride, `${path}.promptOverride`, { allowEmpty: true });
        requireString(recipe.negativePromptOverride, `${path}.negativePromptOverride`, { allowEmpty: true });
        if (!Array.isArray(recipe.seeds) || recipe.seeds.length !== imageCount) {
            throw invalid(`${path}.seeds must match maxPlanImages`);
        }
        recipe.seeds.forEach((seed, index) => requireInteger(
            seed,
            `${path}.seeds[${index}]`,
            0,
            0xFFFFFFFF,
        ));
    }
    assertSafeJson(recipe, path);
    return cloneJson(recipe);
}

function createEnvelopeValidator(runtime) {
    if (!runtime || typeof runtime.hashSceneSource !== 'function'
        || typeof runtime.assertDrawRunId !== 'function'
        || typeof runtime.getNovelModelCapability !== 'function') {
        throw new TypeError('Draw Run envelope validator requires the Node runtime');
    }
    return function validateEnvelope(raw) {
        let serialized;
        try {
            serialized = JSON.stringify(raw);
        } catch {
            throw invalid('Draw Run envelope must be serializable');
        }
        const inputBytes = Buffer.byteLength(serialized || '');
        if (inputBytes > MAX_ENVELOPE_BYTES) {
            throw invalid('Draw Run envelope is too large', 413, 'draw_run_input_limit');
        }
        const envelope = assertExactKeys(
            raw,
            ['version', 'runId', 'sourceHash', 'imageProvider', 'planner', 'agent', 'generationRecipe'],
            'envelope',
        );
        if (envelope.version !== 1) throw invalid('envelope.version must be 1');
        let runId;
        try {
            runId = runtime.assertDrawRunId(envelope.runId);
        } catch (error) {
            throw invalid(String(error?.message || 'envelope.runId is invalid'));
        }
        const sourceHash = requireString(envelope.sourceHash, 'envelope.sourceHash');
        const imageProvider = requireString(envelope.imageProvider, 'envelope.imageProvider');
        if (!IMAGE_PROVIDERS.has(imageProvider)) throw invalid('envelope.imageProvider is invalid');
        const planner = validatePlanner(envelope.planner, runtime);
        if (planner.validationContext.sceneSource.sourceHash !== sourceHash) {
            throw invalid('envelope.sourceHash must match planner sceneSource');
        }
        const agent = validateAgent(envelope.agent);
        const generationRecipe = validateGenerationRecipe(
            imageProvider,
            envelope.generationRecipe,
            planner.validationContext.maxPlanImages,
        );
        if (imageProvider === 'novelai') {
            const capability = runtime.getNovelModelCapability(generationRecipe.params?.model);
            const characterLimit = Number(capability?.maxCharactersPerImage) || 0;
            if (characterLimit > 0 && (
                planner.validationContext.effectiveMaxCharactersPerImage < 1
                || planner.validationContext.effectiveMaxCharactersPerImage > characterLimit
            )) {
                throw invalid(
                    `planner.validationContext.effectiveMaxCharactersPerImage must be between 1 and ${characterLimit} for this NovelAI model`,
                );
            }
        }
        return {
            envelope: {
                version: 1,
                runId,
                sourceHash,
                imageProvider,
                planner,
                agent,
                generationRecipe,
            },
            inputBytes,
        };
    };
}

module.exports = {
    AGENT_CHANNELS,
    HOSTED_AGENT_CHANNELS,
    IMAGE_PROVIDERS,
    MAX_ENVELOPE_BYTES,
    createEnvelopeValidator,
};
