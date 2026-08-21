import {
    normalizeReasoningConfig,
} from './reasoning-config.js';
import { resolveModelFamily } from '../../shared/host-llm/model-family.js';

export { resolveModelFamily } from '../../shared/host-llm/model-family.js';

const EFFORT_LABELS = Object.freeze({
    minimal: '最小',
    low: '低',
    medium: '中',
    high: '高',
    xhigh: '超高',
    max: '最大',
    min: '最小',
});

function freezeCapability(capability) {
    const intensity = capability.intensity || { kind: 'none' };
    return Object.freeze({
        ...capability,
        modes: Object.freeze([...(capability.modes || ['inherit'])]),
        outputModes: Object.freeze([...(capability.outputModes || ['hide', 'show'])]),
        temperatureOmitModes: Object.freeze([...(capability.temperatureOmitModes || [])]),
        intensity: Object.freeze({
            ...intensity,
            ...(Array.isArray(intensity.values)
                ? { values: Object.freeze([...intensity.values]) }
                : {}),
        }),
    });
}

function effortCapability(profileId, modes, values, defaultValue, options = {}) {
    return freezeCapability({
        profileId,
        modes,
        intensity: {
            kind: 'effort',
            values,
            defaultValue,
        },
        outputModes: options.outputModes,
        temperatureOmitModes: options.temperatureOmitModes,
    });
}

const INHERIT_ONLY = freezeCapability({
    profileId: 'unsupported',
    modes: ['inherit'],
    outputModes: ['hide'],
    intensity: { kind: 'none' },
    unsupportedReason: '当前 Provider、传输方式与模型组合没有已验证的 Reasoning 控制协议。',
});

const OMIT_TEMPERATURE_WHEN_REASONING = Object.freeze(['on']);
const OMIT_TEMPERATURE_ALWAYS = Object.freeze(['inherit', 'on', 'off']);

const OPENAI_LATEST = effortCapability(
    'openai-gpt-5.6',
    ['inherit', 'on', 'off'],
    ['low', 'medium', 'high', 'xhigh', 'max'],
    'medium',
    { temperatureOmitModes: OMIT_TEMPERATURE_ALWAYS },
);
const KIMI_LATEST = effortCapability(
    'kimi-k3',
    ['inherit', 'on', 'off'],
    ['low', 'high', 'max'],
    'max',
    { temperatureOmitModes: OMIT_TEMPERATURE_WHEN_REASONING },
);
const DEEPSEEK_LATEST = effortCapability(
    'deepseek-thinking',
    ['inherit', 'on', 'off'],
    ['low', 'high', 'max'],
    'high',
    { temperatureOmitModes: OMIT_TEMPERATURE_WHEN_REASONING },
);

const OPENAI_COMPATIBLE_GEMINI_LATEST = effortCapability(
    'openai-compatible-gemini-latest',
    ['inherit', 'on', 'off'],
    ['minimal', 'low', 'medium', 'high'],
    'high',
    { temperatureOmitModes: OMIT_TEMPERATURE_WHEN_REASONING },
);
const OPENAI_COMPATIBLE_CLAUDE_LATEST = effortCapability(
    'openai-compatible-claude-latest',
    ['inherit', 'on', 'off'],
    ['low', 'medium', 'high', 'xhigh', 'max'],
    'high',
    { temperatureOmitModes: OMIT_TEMPERATURE_WHEN_REASONING },
);
const OPENAI_COMPATIBLE_DEFAULT = effortCapability(
    'openai-compatible-default',
    ['inherit', 'on', 'off'],
    ['low', 'medium', 'high'],
    'medium',
    { temperatureOmitModes: OMIT_TEMPERATURE_WHEN_REASONING },
);
const ANTHROPIC_LATEST = effortCapability(
    'anthropic-adaptive',
    ['inherit', 'on', 'off'],
    ['low', 'medium', 'high', 'xhigh', 'max'],
    'high',
    { temperatureOmitModes: OMIT_TEMPERATURE_ALWAYS },
);
const HOST_ANTHROPIC_LATEST = effortCapability(
    'sillytavern-claude-adaptive',
    ['inherit', 'on', 'off'],
    ['low', 'medium', 'high', 'max'],
    'high',
    { temperatureOmitModes: OMIT_TEMPERATURE_ALWAYS },
);
const GOOGLE_LATEST = effortCapability(
    'google-gemini-3-flash',
    ['inherit', 'on'],
    ['minimal', 'low', 'medium', 'high'],
    'high',
);
const HOST_GOOGLE_LATEST = effortCapability(
    'sillytavern-google-3-flash',
    ['inherit', 'on'],
    ['min', 'low', 'medium', 'high'],
    'high',
);
function resolveOpenAICompatibleCapability(model = '') {
    switch (resolveModelFamily(model)) {
        case 'deepseek': return DEEPSEEK_LATEST;
        case 'kimi': return KIMI_LATEST;
        case 'gemini': return OPENAI_COMPATIBLE_GEMINI_LATEST;
        case 'claude': return OPENAI_COMPATIBLE_CLAUDE_LATEST;
        case 'openai': return OPENAI_LATEST;
        default: return OPENAI_COMPATIBLE_DEFAULT;
    }
}

export function resolveReasoningCapability(context = {}) {
    const provider = String(context.provider || '').trim();
    const model = String(context.model || '').trim().toLowerCase();
    switch (provider) {
        case 'openai-responses':
            return OPENAI_LATEST;
        case 'openai-compatible':
        case 'sillytavern-openai-compatible':
            return resolveOpenAICompatibleCapability(model);
        case 'anthropic':
            return ANTHROPIC_LATEST;
        case 'sillytavern-claude':
            return HOST_ANTHROPIC_LATEST;
        case 'google':
            return GOOGLE_LATEST;
        case 'sillytavern-google':
            return HOST_GOOGLE_LATEST;
        default:
            return INHERIT_ONLY;
    }
}

export function getReasoningModeOptions(capability = INHERIT_ONLY) {
    const supportedModes = new Set(capability.modes || ['inherit']);
    return [
        { value: 'inherit', label: '跟随模型默认', disabled: false },
        { value: 'on', label: '开启', disabled: !supportedModes.has('on') },
        { value: 'off', label: '关闭', disabled: !supportedModes.has('off') },
    ];
}

export function getReasoningEffortOptions(capability = INHERIT_ONLY) {
    if (capability.intensity?.kind !== 'effort') return [];
    return capability.intensity.values.map((value) => ({
        value,
        label: EFFORT_LABELS[value] || value,
    }));
}

function buildInvalidRuntime(reasoning, capability, error, code = 'REASONING_CAPABILITY_UNSUPPORTED') {
    return {
        ...reasoning,
        profileId: capability.profileId,
        valid: false,
        error,
        code,
    };
}

function selectCapabilityIntensity(reasoning, capability) {
    const base = { ...reasoning };
    delete base.effort;
    delete base.budgetTokens;
    if (capability.intensity?.kind === 'effort') {
        return {
            ...base,
            ...(reasoning.effort ? { effort: reasoning.effort } : {}),
        };
    }
    return base;
}

export function resolveRuntimeReasoning(context = {}, source = {}) {
    const capability = resolveReasoningCapability(context);
    const normalized = normalizeReasoningConfig(source);
    const requestedOutput = source?.output === 'show' || source?.output === 'hide'
        ? source.output
        : null;
    const reasoning = selectCapabilityIntensity(
        {
            ...normalized,
            output: normalized.mode === 'off'
                ? 'hide'
                : (requestedOutput
                    || (capability.outputModes.includes('show') ? 'show' : 'hide')),
        },
        capability,
    );
    if (!capability.outputModes.includes(reasoning.output)) {
        return buildInvalidRuntime(
            reasoning,
            capability,
            '当前任务要求返回 Reasoning 内容，但所选模型不支持。',
        );
    }
    if (!capability.modes.includes(reasoning.mode)) {
        return buildInvalidRuntime(
            reasoning,
            capability,
            reasoning.mode === 'off'
                ? '当前模型不支持显式关闭 Reasoning。请选择“跟随模型默认”。'
                : (capability.unsupportedReason || '当前模型不支持显式开启 Reasoning。'),
        );
    }

    if (reasoning.mode !== 'on') {
        return {
            ...reasoning,
            profileId: capability.profileId,
            valid: true,
        };
    }

    if (capability.intensity.kind === 'effort') {
        const effort = reasoning.effort || capability.intensity.defaultValue;
        if (!capability.intensity.values.includes(effort)) {
            return buildInvalidRuntime(
                reasoning,
                capability,
                `当前模型不支持 Reasoning 强度“${effort}”。`,
                'REASONING_CONFIG_INVALID',
            );
        }
        return {
            ...reasoning,
            effort,
            profileId: capability.profileId,
            valid: true,
        };
    }

    return {
        ...reasoning,
        profileId: capability.profileId,
        valid: true,
    };
}

export class ReasoningCapabilityError extends Error {
    constructor(runtime = {}) {
        super(runtime.error || '当前模型不支持所选 Reasoning 配置。');
        this.name = 'ReasoningCapabilityError';
        this.code = runtime.code || 'REASONING_CAPABILITY_UNSUPPORTED';
        this.profileId = runtime.profileId || 'unsupported';
        this.reasoning = runtime;
    }
}

export function assertRuntimeReasoning(runtime = {}) {
    if (runtime.valid === false) {
        throw new ReasoningCapabilityError(runtime);
    }
    return runtime;
}

export function resolveTaskReasoning(provider = '', config = {}, source = {}, runtimeContext = {}) {
    return assertRuntimeReasoning(resolveRuntimeReasoning({
        provider,
        baseUrl: config.baseUrl,
        model: config.model,
        maxTokens: runtimeContext.maxTokens ?? config.maxTokens,
    }, source));
}

export function shouldOmitTemperatureForReasoning(context = {}, reasoning = {}) {
    const capability = resolveReasoningCapability(context);
    return capability.temperatureOmitModes.includes(reasoning.mode);
}
