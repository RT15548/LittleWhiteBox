import test from 'node:test';
import assert from 'node:assert/strict';

import {
    resolveModelFamily,
    resolveReasoningCapability,
    resolveTaskReasoning,
    resolveRuntimeReasoning,
    shouldOmitTemperatureForReasoning,
} from '../../agent-core/reasoning-capabilities.js';
import { normalizeReasoningConfig } from '../../agent-core/reasoning-config.js';

const CAPABILITY_CASES = [
    {
        name: 'OpenAI family uses the latest GPT contract',
        context: { provider: 'openai-responses', model: 'vendor/gpt-4o-custom' },
        profileId: 'openai-gpt-5.6',
        modes: ['inherit', 'on', 'off'],
        intensity: { kind: 'effort', values: ['low', 'medium', 'high', 'xhigh', 'max'] },
    },
    {
        name: 'hosted OpenAI aliases use the latest GPT contract',
        context: { provider: 'sillytavern-openai-compatible', model: 'relay/GPT-5.1-chat-latest' },
        profileId: 'openai-gpt-5.6',
        modes: ['inherit', 'on', 'off'],
        intensity: { kind: 'effort', values: ['low', 'medium', 'high', 'xhigh', 'max'] },
    },
    {
        name: 'Kimi old versions use the latest K3 contract',
        context: { provider: 'openai-compatible', model: 'vendor/KIMI-K2.6-thinking' },
        profileId: 'kimi-k3',
        modes: ['inherit', 'on', 'off'],
        intensity: { kind: 'effort', values: ['low', 'high', 'max'] },
    },
    {
        name: 'DeepSeek aliases are matched by family name only',
        context: { provider: 'openai-compatible', model: 'relay/Experimental-DeepSeek-R1-0528' },
        profileId: 'deepseek-thinking',
        modes: ['inherit', 'on', 'off'],
        intensity: { kind: 'effort', values: ['low', 'high', 'max'] },
    },
    {
        name: 'Gemini over OpenAI-compatible uses the latest family contract',
        context: { provider: 'openai-compatible', model: 'proxy/google-gemini-2.5-pro-preview' },
        profileId: 'openai-compatible-gemini-latest',
        modes: ['inherit', 'on', 'off'],
        intensity: { kind: 'effort', values: ['minimal', 'low', 'medium', 'high'] },
    },
    {
        name: 'Claude over OpenAI-compatible uses the latest family contract',
        context: { provider: 'openai-compatible', model: 'anthropic/claude-sonnet-4-5' },
        profileId: 'openai-compatible-claude-latest',
        modes: ['inherit', 'on', 'off'],
        intensity: { kind: 'effort', values: ['low', 'medium', 'high', 'xhigh', 'max'] },
    },
    {
        name: 'unrecognized OpenAI-compatible names use the conventional default contract',
        context: { provider: 'openai-compatible', model: 'my-local-model' },
        profileId: 'openai-compatible-default',
        modes: ['inherit', 'on', 'off'],
        intensity: { kind: 'effort', values: ['low', 'medium', 'high'] },
    },
    {
        name: 'Anthropic models use the latest adaptive contract',
        context: { provider: 'anthropic', model: 'legacy-prefix/claude-sonnet-4-5' },
        profileId: 'anthropic-adaptive',
        modes: ['inherit', 'on', 'off'],
        intensity: { kind: 'effort', values: ['low', 'medium', 'high', 'xhigh', 'max'] },
    },
    {
        name: 'hosted Claude models use the latest adaptive contract',
        context: { provider: 'sillytavern-claude', model: 'claude-sonnet-4-0' },
        profileId: 'sillytavern-claude-adaptive',
        modes: ['inherit', 'on', 'off'],
        intensity: { kind: 'effort', values: ['low', 'medium', 'high', 'max'] },
    },
    {
        name: 'Google models use the latest Gemini contract',
        context: { provider: 'google', model: 'publisher/gemini-2.5-flash-lite' },
        profileId: 'google-gemini-3-flash',
        modes: ['inherit', 'on'],
        intensity: { kind: 'effort', values: ['minimal', 'low', 'medium', 'high'] },
    },
    {
        name: 'hosted Google models use the latest Gemini contract',
        context: { provider: 'sillytavern-google', model: 'gemini-2.0-flash' },
        profileId: 'sillytavern-google-3-flash',
        modes: ['inherit', 'on'],
        intensity: { kind: 'effort', values: ['min', 'low', 'medium', 'high'] },
    },
];

test('model families are resolved by broad names instead of exact versions or endpoint URLs', () => {
    assert.equal(resolveModelFamily('prefix/DeepSeek-anything'), 'deepseek');
    assert.equal(resolveModelFamily('vendor/KIMI-K2.5'), 'kimi');
    assert.equal(resolveModelFamily('google/gemini-custom'), 'gemini');
    assert.equal(resolveModelFamily('anthropic/claude-custom'), 'claude');
    assert.equal(resolveModelFamily('openai/gpt-custom'), 'openai');
    assert.equal(resolveModelFamily('relay/gpt5.6-custom'), 'openai');
    assert.equal(resolveModelFamily('vendor/o1-mini'), 'openai');
    assert.equal(resolveModelFamily('deepseek-name-with-no-matching-url'), 'deepseek');
    assert.equal(resolveModelFamily('openai/relay/deepseek-custom'), 'deepseek');
    assert.equal(resolveModelFamily('openai/my-local-model'), '');
    assert.equal(resolveModelFamily('vendor/qwen3-max'), '');
    assert.equal(resolveModelFamily('TheBloke/Llama-2-7B-GPTQ'), '');
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
        model: 'private-google-model-alias',
    }).profileId, 'google-gemini-3-flash');
    assert.equal(resolveReasoningCapability({
        provider: 'openai-compatible',
        model: 'unknown-compatible-model',
    }).profileId, 'openai-compatible-default');
    assert.equal(resolveReasoningCapability({
        provider: 'openai-compatible',
        model: 'o1-mini',
    }).profileId, 'openai-gpt-5.6');
    assert.equal(resolveReasoningCapability({
        provider: 'sillytavern-openai-compatible',
        model: 'o1-mini',
    }).profileId, 'openai-gpt-5.6');
    assert.equal(resolveReasoningCapability({
        provider: 'openai-responses',
        model: 'custom-model-without-family-name',
    }).profileId, 'openai-gpt-5.6');
});

test('Reasoning runtime keeps custom OpenAI-compatible models usable with the conventional protocol', () => {
    const unknownContext = {
        provider: 'openai-compatible',
        model: 'unknown-compatible-model',
    };
    assert.deepEqual(resolveRuntimeReasoning(unknownContext, {
        mode: 'inherit',
        output: 'hide',
    }), {
        mode: 'inherit',
        output: 'hide',
        profileId: 'openai-compatible-default',
        valid: true,
    });
    assert.equal(resolveRuntimeReasoning(unknownContext, { mode: 'inherit' }).output, 'show');
    assert.equal(resolveRuntimeReasoning({ provider: 'unknown' }, { mode: 'inherit' }).output, 'hide');

    const customOff = resolveRuntimeReasoning(unknownContext, {
        mode: 'off',
        output: 'show',
    });
    assert.equal(customOff.mode, 'off');
    assert.equal(customOff.output, 'hide');
    assert.equal(customOff.valid, true);

    const unsupportedOff = resolveRuntimeReasoning({ provider: 'unknown' }, {
        mode: 'off',
        output: 'show',
    });
    assert.equal(unsupportedOff.output, 'hide');
    assert.equal(unsupportedOff.valid, false);

    const customOn = resolveTaskReasoning(unknownContext.provider, unknownContext, {
        mode: 'on',
        output: 'show',
    });
    assert.equal(customOn.profileId, 'openai-compatible-default');
    assert.equal(customOn.effort, 'medium');

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

    const olderGptUsesLatestMax = resolveRuntimeReasoning({
        provider: 'openai-responses',
        model: 'gpt-5.1',
    }, {
        mode: 'on',
        effort: 'max',
        output: 'hide',
    });
    assert.equal(olderGptUsesLatestMax.valid, true);
    assert.equal(olderGptUsesLatestMax.effort, 'max');

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

test('older family members use the latest family effort contract', () => {
    const flash = resolveRuntimeReasoning({
        provider: 'google',
        model: 'gemini-2.5-flash',
    }, {
        mode: 'on',
        effort: 'high',
        budgetTokens: 4096,
        output: 'show',
    });
    assert.equal(flash.valid, true);
    assert.equal(flash.effort, 'high');
    assert.equal(Object.hasOwn(flash, 'budgetTokens'), false);

    const legacyClaude = resolveRuntimeReasoning({
        provider: 'anthropic',
        model: 'claude-sonnet-4-0',
    }, {
        mode: 'on',
        effort: 'max',
        output: 'hide',
    });
    assert.equal(legacyClaude.valid, true);
    assert.equal(legacyClaude.profileId, 'anthropic-adaptive');
    assert.equal(legacyClaude.effort, 'max');

    const aliasedDeepSeek = resolveRuntimeReasoning({
        provider: 'openai-compatible',
        model: 'relay/DeepSeek-custom-build',
    }, {
        mode: 'on',
        effort: 'high',
        output: 'hide',
    });
    assert.equal(aliasedDeepSeek.valid, true);
    assert.equal(aliasedDeepSeek.profileId, 'deepseek-thinking');

    assert.deepEqual(normalizeReasoningConfig({
        mode: 'on',
        effort: 'high',
        output: 'show',
    }), {
        mode: 'on',
        effort: 'high',
    });

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

test('temperature omission follows each latest family contract', () => {
    const omit = (context, mode) => shouldOmitTemperatureForReasoning(context, { mode });
    const gpt55 = { provider: 'openai-responses', model: 'gpt-5.5' };
    assert.equal(omit(gpt55, 'inherit'), true);
    assert.equal(omit(gpt55, 'on'), true);
    assert.equal(omit(gpt55, 'off'), true);

    const gpt56 = { provider: 'openai-responses', model: 'gpt-5.6' };
    assert.equal(omit(gpt56, 'inherit'), true);
    assert.equal(omit(gpt56, 'on'), true);
    assert.equal(omit(gpt56, 'off'), true);

    const opus47 = { provider: 'anthropic', model: 'claude-opus-4-7' };
    assert.equal(omit(opus47, 'inherit'), true);
    assert.equal(omit(opus47, 'on'), true);
    assert.equal(omit(opus47, 'off'), true);

    const sonnet40 = { provider: 'anthropic', model: 'claude-sonnet-4-0' };
    assert.equal(omit(sonnet40, 'inherit'), true);
    assert.equal(omit(sonnet40, 'on'), true);
    assert.equal(omit(sonnet40, 'off'), true);

    const kimi = { provider: 'openai-compatible', model: 'relay/kimi-k2.5' };
    assert.equal(omit(kimi, 'inherit'), false);
    assert.equal(omit(kimi, 'on'), true);
    assert.equal(omit(kimi, 'off'), false);
});
