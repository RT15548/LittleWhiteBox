import assert from 'node:assert/strict';
import test from 'node:test';
import { extractTaggedToolCalls } from '../../agent-core/adapters/openai-compatible.js';
import { DEEPSEEK_TOOL_MODE_GUIDANCE, DSML_TOOL_CALL_INVALID } from '../../agent-core/runtime/error-guidance.js';
import { memoryRunError } from '../../story-summary/maintenance/run-feedback.js';
import { memoryChatErrorText } from '../../story-summary/maintenance/chat-copy.js';
import { administratorError } from '../apps/administrator/ui/copy.js';
import { learningTeachingFailure } from '../apps/learning/application/feedback.js';

// Acceptance contracts (cost: invalid tool execution / missing diagnostics):
// - A malformed DSML batch emits no executable calls, even after a valid prefix.
// - All affected error surfaces use one guidance value, with parser detail kept out of display text.
// - Diagnostic receipts retain the original parser failure; unrelated errors remain unchanged.
test('DSML rejection shares user guidance while preserving original diagnostic cause', () => {
    let emitted = false, error;
    try {
        extractTaggedToolCalls('<｜DSML｜invoke name="Read"></｜DSML｜invoke><｜DSML｜invoke name="Write">');
        emitted = true;
    } catch (cause) { error = cause; }
    assert.equal(emitted, false);
    assert.equal(error.code, DSML_TOOL_CALL_INVALID);
    assert.equal(error.message, DEEPSEEK_TOOL_MODE_GUIDANCE);
    assert.ok(error.cause instanceof SyntaxError);
    assert.ok(error.cause.message.length > 0);
    assert.notEqual(error.cause.message, error.message);
    assert.ok(Number.isInteger(error.offset));
    const receipt = memoryRunError(error);
    assert.equal(receipt.cause.message, error.cause.message);
    for (const text of [memoryChatErrorText({ ...receipt, stage: 'response' }), administratorError(error),
        learningTeachingFailure('provider-failed', error), learningTeachingFailure('learning_protocol_failed', error)]) {
        assert.equal(text, DEEPSEEK_TOOL_MODE_GUIDANCE);
    }
});

test('non-DSML failures retain their original error path', () => {
    const error = new Error('offline');
    assert.equal(administratorError(error), error.message);
    assert.equal(learningTeachingFailure('provider-failed', error), error.message);
    assert.equal(memoryRunError(error).message, error.message);
});
