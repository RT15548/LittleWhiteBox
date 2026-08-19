import {
    normalizeReasoningConfig,
} from './reasoning-config.js';

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
        omitTemperatureWhenOn: options.omitTemperatureWhenOn === true,
    });
}

function budgetCapability(profileId, modes, range, options = {}) {
    return freezeCapability({
        profileId,
        modes,
        intensity: {
            kind: 'budget',
            min: range.min,
            max: range.max,
            defaultValue: range.defaultValue,
            allowAuto: range.allowAuto === true,
        },
        omitTemperatureWhenOn: options.omitTemperatureWhenOn === true,
    });
}

function switchCapability(profileId, modes, options = {}) {
    return freezeCapability({
        profileId,
        modes,
        intensity: { kind: 'none' },
        omitTemperatureWhenOn: options.omitTemperatureWhenOn === true,
    });
}

const INHERIT_ONLY = freezeCapability({
    profileId: 'unsupported',
    modes: ['inherit'],
    intensity: { kind: 'none' },
    omitTemperatureWhenOn: false,
    unsupportedReason: '当前 Provider、传输方式与模型组合没有已验证的 Reasoning 控制协议。',
});

const OPENAI_PROFILES = Object.freeze({
    latest: effortCapability(
        'openai-gpt-5.6',
        ['inherit', 'on', 'off'],
        ['low', 'medium', 'high', 'xhigh', 'max'],
        'medium',
        { omitTemperatureWhenOn: true },
    ),
    gpt55: effortCapability(
        'openai-gpt-5.5',
        ['inherit', 'on', 'off'],
        ['low', 'medium', 'high', 'xhigh'],
        'medium',
        { omitTemperatureWhenOn: true },
    ),
    gpt52To54: effortCapability(
        'openai-gpt-5.2-5.4',
        ['inherit', 'on', 'off'],
        ['low', 'medium', 'high', 'xhigh'],
        'medium',
        { omitTemperatureWhenOn: true },
    ),
    gpt51: effortCapability(
        'openai-gpt-5.1',
        ['inherit', 'on', 'off'],
        ['low', 'medium', 'high'],
        'medium',
        { omitTemperatureWhenOn: true },
    ),
    fixedMedium: effortCapability(
        'openai-gpt-5.3-chat',
        ['inherit', 'on'],
        ['medium'],
        'medium',
        { omitTemperatureWhenOn: true },
    ),
    gpt5: effortCapability(
        'openai-gpt-5',
        ['inherit', 'on'],
        ['minimal', 'low', 'medium', 'high'],
        'medium',
        { omitTemperatureWhenOn: true },
    ),
    oSeries: effortCapability(
        'openai-o-series',
        ['inherit', 'on'],
        ['low', 'medium', 'high'],
        'medium',
        { omitTemperatureWhenOn: true },
    ),
});

const ST_OPENAI_REASONING_MODELS = new Set([
    'o1',
    'o3-mini',
    'o3-mini-2025-01-31',
    'o4-mini',
    'o4-mini-2025-04-16',
    'o3',
    'o3-2025-04-16',
    'gpt-5',
    'gpt-5-2025-08-07',
    'gpt-5-mini',
    'gpt-5-mini-2025-08-07',
    'gpt-5-nano',
    'gpt-5-nano-2025-08-07',
    'gpt-5.1',
    'gpt-5.1-2025-11-13',
    'gpt-5.1-chat-latest',
    'gpt-5.2',
    'gpt-5.2-2025-12-11',
    'gpt-5.2-chat-latest',
    'gpt-5.3-chat-latest',
    'gpt-5.4',
    'gpt-5.4-2026-03-05',
    'gpt-5.4-mini',
    'gpt-5.4-mini-2026-03-17',
    'gpt-5.4-nano',
    'gpt-5.4-nano-2026-03-17',
    'gpt-5.5',
    'gpt-5.5-2026-04-23',
]);

const KIMI_K3 = effortCapability(
    'kimi-k3',
    ['inherit', 'on', 'off'],
    ['low', 'high', 'max'],
    'max',
    { omitTemperatureWhenOn: true },
);
const KIMI_K25_K26 = switchCapability(
    'kimi-k2.5-k2.6',
    ['inherit', 'on', 'off'],
    { omitTemperatureWhenOn: true },
);
const DEEPSEEK = effortCapability(
    'deepseek-thinking',
    ['inherit', 'on', 'off'],
    ['low', 'high', 'max'],
    'high',
    { omitTemperatureWhenOn: true },
);

const ANTHROPIC_ADAPTIVE = effortCapability(
    'anthropic-adaptive',
    ['inherit', 'on', 'off'],
    ['low', 'medium', 'high', 'xhigh', 'max'],
    'high',
    { omitTemperatureWhenOn: true },
);
const ANTHROPIC_MANUAL = budgetCapability(
    'anthropic-manual',
    ['inherit', 'on', 'off'],
    { min: 1024, max: 128000, defaultValue: 8192 },
    { omitTemperatureWhenOn: true },
);
const HOST_ANTHROPIC_ADAPTIVE = effortCapability(
    'sillytavern-claude-adaptive',
    ['inherit', 'on', 'off'],
    ['low', 'medium', 'high', 'max'],
    'high',
    { omitTemperatureWhenOn: true },
);
const HOST_ANTHROPIC_CONDITIONAL = effortCapability(
    'sillytavern-claude-adaptive-conditional',
    ['inherit', 'on', 'off'],
    ['low', 'medium', 'high', 'max'],
    'high',
    { omitTemperatureWhenOn: true },
);
const HOST_ANTHROPIC_MANUAL = effortCapability(
    'sillytavern-claude-manual',
    ['inherit', 'on', 'off'],
    ['min', 'low', 'medium', 'high', 'max'],
    'medium',
    { omitTemperatureWhenOn: true },
);

const GOOGLE_25_FLASH = budgetCapability(
    'google-gemini-2.5-flash',
    ['inherit', 'on', 'off'],
    { min: 1, max: 24576, defaultValue: -1, allowAuto: true },
);
const GOOGLE_25_PRO = budgetCapability(
    'google-gemini-2.5-pro',
    ['inherit', 'on'],
    { min: 128, max: 32768, defaultValue: -1, allowAuto: true },
);
const GOOGLE_3_FLASH = effortCapability(
    'google-gemini-3-flash',
    ['inherit', 'on'],
    ['minimal', 'low', 'medium', 'high'],
    'high',
);
const GOOGLE_3_PRO = effortCapability(
    'google-gemini-3-pro',
    ['inherit', 'on'],
    ['low', 'high'],
    'high',
);
const HOST_GOOGLE_25_FLASH = effortCapability(
    'sillytavern-google-2.5-flash',
    ['inherit', 'on', 'off'],
    ['low', 'medium', 'high', 'max'],
    'medium',
);
const HOST_GOOGLE_25_PRO = effortCapability(
    'sillytavern-google-2.5-pro',
    ['inherit', 'on'],
    ['min', 'low', 'medium', 'high', 'max'],
    'medium',
);
const HOST_GOOGLE_3_FLASH = effortCapability(
    'sillytavern-google-3-flash',
    ['inherit', 'on'],
    ['min', 'low', 'medium', 'high'],
    'high',
);
const HOST_GOOGLE_3_PRO = effortCapability(
    'sillytavern-google-3-pro',
    ['inherit', 'on'],
    ['low', 'high'],
    'high',
);

function normalizeModel(model = '') {
    return String(model || '').trim().toLowerCase();
}

function resolveOpenAIModelCapability(model = '') {
    const normalized = normalizeModel(model);
    if (/^gpt-5\.6(?:[-.]|$)/.test(normalized)) return OPENAI_PROFILES.latest;
    if (/^gpt-5\.5(?:[-.]|$)/.test(normalized)) return OPENAI_PROFILES.gpt55;
    if (/^gpt-5\.3-chat-latest(?:[-.]|$)/.test(normalized)) return OPENAI_PROFILES.fixedMedium;
    if (/^gpt-5\.(?:2|4)(?:[-.]|$)/.test(normalized)) return OPENAI_PROFILES.gpt52To54;
    if (/^gpt-5\.1(?:[-.]|$)/.test(normalized)) return OPENAI_PROFILES.gpt51;
    if (/^gpt-5(?:-(?:mini|nano))?(?:-|$)/.test(normalized)) return OPENAI_PROFILES.gpt5;
    if (/^o(?:1|3|3-mini|4-mini)(?:-|$)/.test(normalized)) return OPENAI_PROFILES.oSeries;
    return null;
}

function resolveOpenAICompatibleCapability(baseUrl = '', model = '') {
    const normalizedModel = normalizeModel(model);
    const normalizedBaseUrl = String(baseUrl || '').trim().toLowerCase();
    if (/^kimi-k3(?:[.-]|$)/.test(normalizedModel)) return KIMI_K3;
    if (/^kimi-k2[.-](?:5|6)(?:[.-]|$)/.test(normalizedModel)) return KIMI_K25_K26;
    if (/^kimi-k2[.-]7(?:[.-]|$)/.test(normalizedModel)) return INHERIT_ONLY;
    if (/^deepseek-(?:chat|reasoner|v3)/.test(normalizedModel)
        || (normalizedBaseUrl.includes('api.deepseek.com') && normalizedModel.startsWith('deepseek-'))) {
        return DEEPSEEK;
    }
    return resolveOpenAIModelCapability(normalizedModel) || INHERIT_ONLY;
}

function resolveAnthropicCapability(model = '', hosted = false) {
    const normalized = normalizeModel(model);
    if (/^claude-opus-4-7/.test(normalized)) {
        return hosted ? HOST_ANTHROPIC_ADAPTIVE : ANTHROPIC_ADAPTIVE;
    }
    if (/^claude-(?:opus-4-6|sonnet-4-6)/.test(normalized)) {
        // SillyTavern can disable adaptive thinking for 4.6 in server config. The
        // browser cannot observe that switch, so this profile exposes only the
        // common effort vocabulary and is treated conservatively for forced tools.
        return hosted ? HOST_ANTHROPIC_CONDITIONAL : ANTHROPIC_ADAPTIVE;
    }
    if (/^claude-(?:3-7|opus-4|sonnet-4|haiku-4-5)/.test(normalized)) {
        return hosted ? HOST_ANTHROPIC_MANUAL : ANTHROPIC_MANUAL;
    }
    return INHERIT_ONLY;
}

function resolveGoogleCapability(model = '', hosted = false) {
    const normalized = normalizeModel(model);
    if (normalized.includes('image')) return INHERIT_ONLY;
    if (/^gemini-2\.5-flash/.test(normalized)) {
        return hosted ? HOST_GOOGLE_25_FLASH : GOOGLE_25_FLASH;
    }
    if (/^gemini-2\.5-pro/.test(normalized)) {
        return hosted ? HOST_GOOGLE_25_PRO : GOOGLE_25_PRO;
    }
    if (/^gemini-3(?:[.\d]*)?-flash/.test(normalized)) {
        return hosted ? HOST_GOOGLE_3_FLASH : GOOGLE_3_FLASH;
    }
    if (/^gemini-3(?:[.\d]*)?-pro/.test(normalized)) {
        return hosted ? HOST_GOOGLE_3_PRO : GOOGLE_3_PRO;
    }
    return INHERIT_ONLY;
}

export function resolveReasoningCapability(context = {}) {
    const provider = String(context.provider || '').trim();
    const model = normalizeModel(context.model);
    switch (provider) {
        case 'openai-responses':
            return resolveOpenAIModelCapability(model) || INHERIT_ONLY;
        case 'openai-compatible':
            return resolveOpenAICompatibleCapability(context.baseUrl, model);
        case 'sillytavern-openai-compatible':
            return ST_OPENAI_REASONING_MODELS.has(model)
                ? (resolveOpenAIModelCapability(model) || INHERIT_ONLY)
                : INHERIT_ONLY;
        case 'anthropic':
            return resolveAnthropicCapability(model, false);
        case 'sillytavern-claude':
            return resolveAnthropicCapability(model, true);
        case 'google':
            return resolveGoogleCapability(model, false);
        case 'sillytavern-google':
            return resolveGoogleCapability(model, true);
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

function buildInvalidRuntime(reasoning, capability, error) {
    return {
        ...reasoning,
        profileId: capability.profileId,
        valid: false,
        error,
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
    if (capability.intensity?.kind === 'budget') {
        return {
            ...base,
            ...(reasoning.budgetTokens !== undefined
                ? { budgetTokens: reasoning.budgetTokens }
                : {}),
        };
    }
    return base;
}

export function resolveRuntimeReasoning(context = {}, source = {}) {
    const capability = resolveReasoningCapability(context);
    const reasoning = selectCapabilityIntensity(
        normalizeReasoningConfig(source),
        capability,
    );
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
            );
        }
        return {
            ...reasoning,
            effort,
            profileId: capability.profileId,
            valid: true,
        };
    }

    if (capability.intensity.kind === 'budget') {
        const budgetTokens = reasoning.budgetTokens ?? capability.intensity.defaultValue;
        const isAuto = capability.intensity.allowAuto && budgetTokens === -1;
        if (!isAuto && (
            !Number.isInteger(budgetTokens)
            || budgetTokens < capability.intensity.min
            || budgetTokens > capability.intensity.max
        )) {
            return buildInvalidRuntime(
                reasoning,
                capability,
                `Reasoning Token 预算必须在 ${capability.intensity.min}–${capability.intensity.max} 之间${capability.intensity.allowAuto ? '，或填写 -1 使用自动预算' : ''}。`,
            );
        }
        return {
            ...reasoning,
            budgetTokens,
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
        this.code = 'REASONING_CAPABILITY_UNSUPPORTED';
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

export function resolveTaskReasoning(provider = '', config = {}, source = {}) {
    return assertRuntimeReasoning(resolveRuntimeReasoning({
        provider,
        baseUrl: config.baseUrl,
        model: config.model,
    }, source));
}

export function shouldOmitTemperatureForReasoning(context = {}, reasoning = {}) {
    const capability = resolveReasoningCapability(context);
    return reasoning.mode === 'on' && capability.omitTemperatureWhenOn === true;
}
