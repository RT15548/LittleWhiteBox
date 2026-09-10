import assert from 'node:assert/strict';
import test from 'node:test';
import { logScenePlannerValidationFailure } from '../scene-planner-debug.js';

test('F12 diagnostics bypass the real monitor hooks whether monitoring is enabled or disabled', async (t) => {
    const browserConsole = [];
    t.mock.method(console, 'log', (...args) => browserConsole.push(args));
    const { xbLog } = await import('../../../../core/debug-core.js');
    t.after(() => { xbLog.disable(); xbLog.clear(); });
    xbLog.enable();
    for (const enabled of [true, false]) {
        if (!enabled) xbLog.disable();
        logScenePlannerValidationFailure({
            attempt: 1,
            durationMs: 21000,
            errorCode: 'TOOL_ARGUMENTS_INVALID_JSON',
            modelOutput: JSON.stringify({ text: 'full model reply', toolCalls: [{ arguments: '{broken' }] }),
        });
        assert.deepEqual(xbLog.getAll(), []);
    }
    assert.equal(browserConsole.length, 2);
    for (const [prefix, details] of browserConsole) {
        assert.match(prefix, /\[Scene Planner\]/);
        assert.equal(details.llmResult.text, 'full model reply');
        assert.equal(details.llmResult.toolCalls[0].arguments, '{broken');
        assert.equal(details.durationMs, 21000);
    }
});

test('console failures do not affect drawing and old truncated backend diagnostics stay identifiable', () => {
    const entries = [];
    const failure = { modelOutput: '{partial', modelOutputTruncated: true };
    assert.equal(logScenePlannerValidationFailure(failure, {}, { log: (_label, details) => entries.push(details) }), true);
    assert.equal(entries[0].llmResult, '{partial');
    assert.equal(entries[0].llmResultTruncated, true);
    assert.equal(logScenePlannerValidationFailure(failure, {}, { log() { throw new Error('unavailable'); } }), false);
});
