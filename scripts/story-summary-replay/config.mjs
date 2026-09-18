// Input adaptation only. Defaults and normalization belong to the plugin.
function defined(values) {
    return Object.fromEntries(Object.entries(values).filter(([, value]) => value !== undefined));
}

export function buildReplayPanelOverrides(config) {
    const api = config.summaryApi || {};
    const panel = config.panelConfig || {};
    const vector = { ...panel.vector, ...config.vectorConfig };
    for (const key of ['l0Api', 'embeddingApi', 'rerankApi']) {
        vector[key] = { ...panel.vector?.[key], ...config.vectorConfig?.[key] };
    }
    return {
        ...panel,
        api: { ...panel.api, ...defined({
            provider: api.provider, url: api.url, key: api.key, model: api.model,
            maxTokens: api.maxTokens, reasoningEffort: api.reasoningEffort,
        }) },
        gen: { ...panel.gen, ...defined({
            temperature: api.temperature, top_p: api.top_p, top_k: api.top_k,
            presence_penalty: api.presence_penalty, frequency_penalty: api.frequency_penalty,
        }) },
        trigger: {
            enabled: ['natural-capture', 'natural-resume'].includes(config.mode),
            ...panel.trigger,
            ...defined({
                interval: config.summaryTriggerInterval,
                useStream: api.useStream, maxPerRun: api.maxPerRun,
                wrapperHead: config.wrapperHead, wrapperTail: config.wrapperTail,
            }),
        },
        ...(config.textFilterRules ? { textFilterRules: config.textFilterRules } : {}),
        vector,
    };
}

// This projection is the executed configuration, not the unnormalized input.
// API credentials stay in runtime config; only this safe projection is archived.
export function describeReplayPanel(panel) {
    const describeApi = ({ provider, url, model }) => ({ provider, url, model });
    return {
        api: { ...describeApi(panel.api), maxTokens: panel.api.maxTokens, reasoningEffort: panel.api.reasoningEffort },
        gen: { ...panel.gen },
        trigger: { ...panel.trigger },
        ui: { ...panel.ui },
        textFilterRules: structuredClone(panel.textFilterRules),
        prompts: { ...panel.prompts },
        vector: {
            enabled: panel.vector.enabled,
            l0Concurrency: panel.vector.l0Concurrency,
            l0Api: describeApi(panel.vector.l0Api),
            embeddingApi: describeApi(panel.vector.embeddingApi),
            rerankApi: describeApi(panel.vector.rerankApi),
        },
    };
}

export function applyReplayConfig(config, modules) {
    const panel = modules.applySummaryPanelConfigSnapshot(buildReplayPanelOverrides(config));
    return {
        panel,
        config: {
            ...config,
            summaryApi: {
                ...panel.api, ...panel.gen,
                useStream: panel.trigger.useStream, maxPerRun: panel.trigger.maxPerRun,
            },
            vectorConfig: panel.vector,
            wrapperHead: panel.trigger.wrapperHead,
            wrapperTail: panel.trigger.wrapperTail,
            effectivePanel: describeReplayPanel(panel),
        },
    };
}
