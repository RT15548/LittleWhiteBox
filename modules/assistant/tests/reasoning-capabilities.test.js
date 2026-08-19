import test from 'node:test';
import assert from 'node:assert/strict';

import { OPENAI_REASONING_EFFORT_MODELS } from '../../../../../../../../src/constants.js';
import {
    getReasoningOutputOptions,
    ReasoningCapabilityError,
    resolveReasoningCapability,
    resolveTaskReasoning,
    resolveRuntimeReasoning,
    shouldOmitTemperatureForReasoning,
    ST_OPENAI_REASONING_MODELS,
} from '../../agent-core/reasoning-capabilities.js';
import { normalizeReasoningConfig } from '../../agent-core/reasoning-config.js';

const CAPABILITY_CASES = [
    {
        name: 'OpenAI GPT-5.6',
        context: { provider: 'openai-responses', model: 'gpt-5.6' },
        profileId: 'openai-gpt-5.6',
        modes: ['inherit', 'on', 'off'],
        intensity: { kind: 'effort', values: ['low', 'medium', 'high', 'xhigh', 'max'] },
    },
    {
        name: 'OpenAI GPT-5.1',
        context: { provider: 'openai-responses', model: 'gpt-5.1' },
        profileId: 'openai-gpt-5.1',
        modes: ['inherit', 'on', 'off'],
        intensity: { kind: 'effort', values: ['low', 'medium', 'high'] },
    },
    {
        name: 'OpenAI GPT-5.2',
        context: { provider: 'openai-responses', model: 'gpt-5.2' },
        profileId: 'openai-gpt-5.2-5.4',
        modes: ['inherit', 'on', 'off'],
        intensity: { kind: 'effort', values: ['low', 'medium', 'high', 'xhigh'] },
    },
    {
        name: 'Kimi K3',
        context: { provider: 'openai-compatible', baseUrl: 'https://api.moonshot.ai/v1', model: 'kimi-k3' },
        profileId: 'kimi-k3',
        modes: ['inherit', 'on', 'off'],
        intensity: { kind: 'effort', values: ['low', 'high', 'max'] },
    },
    {
        name: 'Kimi K2.6',
        context: { provider: 'openai-compatible', baseUrl: 'https://api.moonshot.ai/v1', model: 'kimi-k2.6' },
        profileId: 'kimi-k2.5-k2.6',
        modes: ['inherit', 'on', 'off'],
        intensity: { kind: 'none' },
    },
    {
        name: 'DeepSeek',
        context: { provider: 'openai-compatible', baseUrl: 'https://api.deepseek.com/v1', model: 'deepseek-reasoner' },
        profileId: 'deepseek-thinking',
        modes: ['inherit', 'on', 'off'],
        intensity: { kind: 'effort', values: ['low', 'high', 'max'] },
    },
    {
        name: 'Anthropic adaptive',
        context: { provider: 'anthropic', model: 'claude-opus-4-7' },
        profileId: 'anthropic-adaptive',
        modes: ['inherit', 'on', 'off'],
        intensity: { kind: 'effort', values: ['low', 'medium', 'high', 'xhigh', 'max'] },
    },
    {
        name: 'Anthropic manual',
        context: { provider: 'anthropic', model: 'claude-sonnet-4-5' },
        profileId: 'anthropic-manual',
        modes: ['inherit', 'on', 'off'],
        intensity: { kind: 'budget' },
    },
    {
        name: 'hosted Claude 4.6 conditional adaptive',
        context: { provider: 'sillytavern-claude', model: 'claude-sonnet-4-6' },
        profileId: 'sillytavern-claude-adaptive-conditional',
        modes: ['inherit', 'on', 'off'],
        intensity: { kind: 'effort', values: ['low', 'medium', 'high', 'max'] },
    },
    {
        name: 'Gemini 2.5 Flash',
        context: { provider: 'google', model: 'gemini-2.5-flash' },
        profileId: 'google-gemini-2.5-flash',
        modes: ['inherit', 'on', 'off'],
        intensity: { kind: 'budget' },
    },
    {
        name: 'Gemini 2.5 Flash-Lite',
        context: { provider: 'google', model: 'gemini-2.5-flash-lite' },
        profileId: 'google-gemini-2.5-flash-lite',
        modes: ['inherit', 'on', 'off'],
        intensity: { kind: 'budget' },
    },
    {
        name: 'Gemini 2.5 Pro',
        context: { provider: 'google', model: 'gemini-2.5-pro' },
        profileId: 'google-gemini-2.5-pro',
        modes: ['inherit', 'on'],
        intensity: { kind: 'budget' },
    },
    {
        name: 'Gemini 3 Flash',
        context: { provider: 'google', model: 'gemini-3-flash-preview' },
        profileId: 'google-gemini-3-flash',
        modes: ['inherit', 'on'],
        intensity: { kind: 'effort', values: ['minimal', 'low', 'medium', 'high'] },
    },
    {
        name: 'hosted Gemini 2.5 Flash',
        context: { provider: 'sillytavern-google', model: 'gemini-2.5-flash' },
        profileId: 'sillytavern-google-2.5-flash',
        modes: ['inherit', 'on', 'off'],
        intensity: { kind: 'effort', values: ['low', 'medium', 'high', 'max'] },
    },
    {
        name: 'hosted Gemini 2.5 Flash-Lite',
        context: { provider: 'sillytavern-google', model: 'gemini-2.5-flash-lite' },
        profileId: 'sillytavern-google-2.5-flash-lite',
        modes: ['inherit', 'on', 'off'],
        intensity: { kind: 'effort', values: ['low', 'medium', 'high', 'max'] },
    },
];

test('hosted OpenAI Reasoning model membership matches SillyTavern', () => {
    const localModels = new Set(ST_OPENAI_REASONING_MODELS);
    const sillyTavernModels = new Set(OPENAI_REASONING_EFFORT_MODELS);

    assert.deepEqual({
        missingFromLittleWhiteBox: [...sillyTavernModels]
            .filter(model => !localModels.has(model))
            .sort(),
        noLongerInSillyTavern: [...localModels]
            .filter(model => !sillyTavernModels.has(model))
            .sort(),
    }, {
        missingFromLittleWhiteBox: [],
        noLongerInSillyTavern: [],
    });
});

test('Reasoning capabilities are resolved by Provider, transport, and model', () => {
    for (const item of CAPABILITY_CASES) {
        const capability = resolveReasoningCapability(item.context);
        assert.equal(capability.profileId, item.profileId, item.name);
        assert.deepEqual(capability.modes, item.modes, item.name);
        assert.equal(capability.intensity.kind, item.intensity.kind, item.name);
        if (item.intensity.values) {
            assert.deepEqual(capability.intensity.values, item.intensity.values, item.name);
        }
    }

    assert.equal(resolveReasoningCapability({
        provider: 'google',
        model: 'gemini-2.5-flash-image-preview',
    }).profileId, 'unsupported');
    assert.equal(resolveReasoningCapability({
        provider: 'openai-compatible',
        model: 'unknown-compatible-model',
    }).profileId, 'unsupported');
    assert.equal(resolveReasoningCapability({
        provider: 'openai-compatible',
        model: 'o1-mini',
    }).profileId, 'unsupported');
    assert.equal(resolveReasoningCapability({
        provider: 'sillytavern-openai-compatible',
        model: 'o1-mini',
    }).profileId, 'unsupported');
});

test('Reasoning runtime preserves inherit, validates on, and never degrades off to inherit', () => {
    const unknownContext = {
        provider: 'openai-compatible',
        model: 'unknown-compatible-model',
    };
    assert.deepEqual(resolveRuntimeReasoning(unknownContext, {
        mode: 'inherit',
        output: 'show',
    }), {
        mode: 'inherit',
        output: 'show',
        profileId: 'unsupported',
        valid: false,
        error: '当前模型不支持返回 Reasoning 内容，请选择“隐藏”。',
        code: 'REASONING_CAPABILITY_UNSUPPORTED',
    });
    assert.equal(
        getReasoningOutputOptions(resolveReasoningCapability(unknownContext))
            .find((option) => option.value === 'show').disabled,
        true,
    );

    const unsupportedOff = resolveRuntimeReasoning(unknownContext, {
        mode: 'off',
        output: 'hide',
    });
    assert.equal(unsupportedOff.mode, 'off');
    assert.equal(unsupportedOff.valid, false);
    assert.throws(
        () => resolveTaskReasoning(unknownContext.provider, unknownContext, unsupportedOff),
        (error) => error instanceof ReasoningCapabilityError
            && error.code === 'REASONING_CAPABILITY_UNSUPPORTED',
    );

    const kimi = resolveRuntimeReasoning({
        provider: 'openai-compatible',
        model: 'kimi-k3',
    }, {
        mode: 'on',
        effort: 'max',
        output: 'hide',
    });
    assert.equal(kimi.valid, true);
    assert.equal(kimi.effort, 'max');

    const invalidKimiEffort = resolveRuntimeReasoning({
        provider: 'openai-compatible',
        model: 'kimi-k3',
    }, {
        mode: 'on',
        effort: 'xhigh',
        output: 'hide',
    });
    assert.equal(invalidKimiEffort.valid, false);

    const gpt51Xhigh = resolveRuntimeReasoning({
        provider: 'openai-responses',
        model: 'gpt-5.1',
    }, {
        mode: 'on',
        effort: 'xhigh',
        output: 'hide',
    });
    assert.equal(gpt51Xhigh.valid, false);

    const gpt52Xhigh = resolveRuntimeReasoning({
        provider: 'openai-responses',
        model: 'gpt-5.2',
    }, {
        mode: 'on',
        effort: 'xhigh',
        output: 'hide',
    });
    assert.equal(gpt52Xhigh.valid, true);
    assert.equal(gpt52Xhigh.effort, 'xhigh');
});

test('Reasoning budgets are model-specific and the former boolean schema is not revived', () => {
    const flash = resolveRuntimeReasoning({
        provider: 'google',
        model: 'gemini-2.5-flash',
    }, {
        mode: 'on',
        budgetTokens: -1,
        output: 'show',
    });
    assert.equal(flash.valid, true);
    assert.equal(flash.budgetTokens, -1);

    const invalidPro = resolveRuntimeReasoning({
        provider: 'google',
        model: 'gemini-2.5-pro',
    }, {
        mode: 'on',
        budgetTokens: 0,
        output: 'hide',
    });
    assert.equal(invalidPro.valid, false);

    const flashLite = resolveRuntimeReasoning({
        provider: 'google',
        model: 'gemini-2.5-flash-lite',
    }, {
        mode: 'on',
        budgetTokens: 512,
        output: 'hide',
    });
    assert.equal(flashLite.valid, true);
    assert.equal(flashLite.profileId, 'google-gemini-2.5-flash-lite');
    assert.equal(resolveRuntimeReasoning({
        provider: 'google',
        model: 'gemini-2.5-flash-lite',
    }, {
        mode: 'on',
        budgetTokens: 511,
        output: 'hide',
    }).valid, false);

    assert.deepEqual(normalizeReasoningConfig({
        enabled: true,
        includeOutput: true,
    }), {
        mode: 'inherit',
        output: 'hide',
    });

    assert.equal(Object.hasOwn(resolveRuntimeReasoning({
        provider: 'google',
        model: 'gemini-2.5-flash',
    }, {
        mode: 'on',
        effort: 'high',
        budgetTokens: 4096,
        output: 'hide',
    }), 'effort'), false);
    assert.equal(Object.hasOwn(resolveRuntimeReasoning({
        provider: 'openai-responses',
        model: 'gpt-5.6',
    }, {
        mode: 'on',
        effort: 'high',
        budgetTokens: 4096,
        output: 'hide',
    }), 'budgetTokens'), false);
});

test('Anthropic manual Reasoning budget stays below the request output limit', () => {
    const runtime = resolveRuntimeReasoning({
        provider: 'anthropic',
        model: 'claude-sonnet-4-5',
        maxTokens: 8192,
    }, {
        mode: 'on',
        budgetTokens: 8192,
        output: 'hide',
    });

    assert.equal(runtime.valid, false);
    assert.equal(runtime.code, 'REASONING_CONFIG_INVALID');
    assert.throws(
        () => resolveTaskReasoning('anthropic', {
            model: 'claude-sonnet-4-5',
            maxTokens: 8192,
        }, {
            mode: 'on',
            budgetTokens: 8192,
            output: 'hide',
        }),
        (error) => error instanceof ReasoningCapabilityError
            && error.code === 'REASONING_CONFIG_INVALID',
    );
});

test('temperature omission follows each model and Reasoning mode contract', () => {
    const omit = (context, mode) => shouldOmitTemperatureForReasoning(context, { mode });
    const gpt55 = { provider: 'openai-responses', model: 'gpt-5.5' };
    assert.equal(omit(gpt55, 'inherit'), true);
    assert.equal(omit(gpt55, 'on'), true);
    assert.equal(omit(gpt55, 'off'), false);

    const gpt56 = { provider: 'openai-responses', model: 'gpt-5.6' };
    assert.equal(omit(gpt56, 'inherit'), true);
    assert.equal(omit(gpt56, 'on'), true);
    assert.equal(omit(gpt56, 'off'), true);

    const opus47 = { provider: 'anthropic', model: 'claude-opus-4-7' };
    assert.equal(omit(opus47, 'inherit'), true);
    assert.equal(omit(opus47, 'on'), true);
    assert.equal(omit(opus47, 'off'), true);

    const sonnet45 = { provider: 'anthropic', model: 'claude-sonnet-4-5' };
    assert.equal(omit(sonnet45, 'inherit'), false);
    assert.equal(omit(sonnet45, 'on'), true);
    assert.equal(omit(sonnet45, 'off'), false);
});
