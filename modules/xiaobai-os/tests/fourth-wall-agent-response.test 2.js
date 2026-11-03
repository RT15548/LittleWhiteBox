import assert from 'node:assert/strict';
import test from 'node:test';

import { createFourthWallAgentResponse } from '../apps/fourth-wall/host/agent-response.js';

test('Fourth Wall keeps its prompt protocol while using the shared Agent gateway', async () => {
    let request = null;
    const generate = createFourthWallAgentResponse({
        async run(next) {
            request = next;
            next.onStreamProgress?.({ text: 'partial' });
            return {
                text: 'final',
                thoughts: [{ label: 'analysis', text: 'thought' }],
                provider: 'test-provider',
                model: 'test-model',
                finishReason: 'stop',
            };
        },
    });
    const progress = [];
    const signal = new AbortController().signal;
    const result = await generate({
        config: { currentPresetName: '共享预设' },
        builtPrompt: { protocol: 'role protocol', msg1: 'u1', msg2: 'a1', msg3: 'u2', msg4: 'request' },
        stream: true,
        signal,
        onStreamProgress: snapshot => progress.push(snapshot),
    });

    assert.deepEqual(request.messages, [
        { role: 'user', content: 'u1' },
        { role: 'assistant', content: 'a1' },
        { role: 'user', content: 'u2\n\nrequest' },
    ]);
    assert.equal(request.config.currentPresetName, '共享预设');
    assert.equal(request.signal, signal);
    assert.match(request.systemPrompt, /四次元壁/);
    assert.ok(request.systemPrompt.includes('role protocol'));
    assert.deepEqual(progress, [{ text: 'partial' }]);
    assert.deepEqual(result, {
        text: 'final',
        thoughts: [{ label: 'analysis', text: 'thought' }],
        provider: 'test-provider',
        model: 'test-model',
        finishReason: 'stop',
    });
});

test('the final request remains a user message without earlier turns', async () => {
    let request = null;
    const generate = createFourthWallAgentResponse({
        async run(next) {
            request = next;
            return {};
        },
    });
    await generate({
        config: {},
        builtPrompt: { protocol: 'rules', msg1: '', msg2: '', msg3: 'question', msg4: 'format cue' },
        stream: false,
        signal: new AbortController().signal,
    });

    assert.deepEqual(request.messages, [{ role: 'user', content: 'question\n\nformat cue' }]);
    assert.equal(request.onStreamProgress, undefined);
});
