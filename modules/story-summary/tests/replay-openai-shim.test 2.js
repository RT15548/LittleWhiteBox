import assert from 'node:assert/strict';
import test from 'node:test';

import { getStreamingReply } from '../../../scripts/story-summary-replay/shims/openai.js';

test('replay OpenAI shim keeps reasoning separate from response content', () => {
    assert.equal(getStreamingReply({ choices: [{ delta: { reasoning_content: '内部推理' } }] }), '');
    assert.equal(getStreamingReply({ choices: [{ delta: { content: '{"ok":true}' } }] }), '{"ok":true}');
});

test('replay OpenAI shim accepts message and text completion response shapes', () => {
    assert.equal(getStreamingReply({ choices: [{ message: { content: 'message' } }] }), 'message');
    assert.equal(getStreamingReply({ choices: [{ text: 'text' }] }), 'text');
});
