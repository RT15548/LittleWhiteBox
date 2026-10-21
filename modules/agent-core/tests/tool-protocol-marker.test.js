import test from 'node:test';
import assert from 'node:assert/strict';
import {
    TOOL_PROTOCOL_MARKER as M,
    hasToolProtocolMarker,
    markToolProtocolMessages,
    resolveToolProtocolMarker,
    stripToolProtocolMarker,
} from '../adapters/tool-protocol-marker.js';

// Contract: conversation text must not control protocol assembly (lost instructions).
test('only explicitly trusted system messages control protocol placement', () => {
    for (const role of ['user', 'assistant', 'system', 'tool']) {
        const input = [{ role, content: M }];
        assert.equal(hasToolProtocolMarker(input), false);
        assert.deepEqual(resolveToolProtocolMarker(input, 'P'), { messages: input, found: false });
        assert.deepEqual(stripToolProtocolMarker(input), input);
    }
    assert.equal(hasToolProtocolMarker([{ role: 'user', content: M, toolProtocolMarker: true }]), false);
    assert.equal(hasToolProtocolMarker(null), false);
});

test('trusted assembly marks only system messages and does not mutate the snapshot', () => {
    const input = [{ role: 'system', content: M }, { role: 'user', content: M }];
    const snapshot = structuredClone(input);
    const marked = markToolProtocolMessages(input);
    assert.equal(marked[0].toolProtocolMarker, true);
    assert.equal(marked[1].toolProtocolMarker, undefined);
    assert.deepEqual(input, snapshot);
});

// Contract: moving the tools block changes its position, not surrounding data or tool count.
test('trusted replacement preserves placement, removes duplicates and strips internal metadata', () => {
    for (const [content, expected] of [[`A\n\n${M}\n\nB`, 'A\n\nP\n\nB'], [`${M}\n\nA`, 'P\n\nA'], [`A\n\n${M}`, 'A\n\nP']]) {
        const input = markToolProtocolMessages([{ role: 'system', content }, { role: 'system', content: M }, { role: 'user', content: M }]);
        const snapshot = structuredClone(input);
        let calls = 0;
        const result = resolveToolProtocolMarker(input, () => { calls += 1; return 'P'; });
        assert.equal(calls, 1);
        assert.equal(result.found, true);
        assert.deepEqual(result.messages, [{ role: 'system', content: expected }, { role: 'user', content: M }]);
        assert.deepEqual(input, snapshot);
    }
});

test('native stripping merges neighbours only across a removed protocol message', () => {
    const input = markToolProtocolMessages([
        { role: 'system', content: 'A' }, { role: 'system', content: M },
        { role: 'system', content: 'B' }, { role: 'system', content: 'C' },
        { role: 'user', content: M },
    ]);
    assert.deepEqual(stripToolProtocolMarker(input), [
        { role: 'system', content: 'A\n\nB' }, { role: 'system', content: 'C' }, { role: 'user', content: M },
    ]);
});

test('non-text content and tool fields survive protocol resolution', () => {
    const data = [{ role: 'user', content: [{ type: 'text', text: M }] }, { role: 'assistant', content: null, tool_calls: [{ id: 'c1' }] }, { role: 'tool', tool_call_id: 'c1', content: 'result' }];
    const input = [...data, { role: 'system', name: 'n', content: `A\n\n${M}`, toolProtocolMarker: true }];
    assert.deepEqual(resolveToolProtocolMarker(input, 'P').messages, [...data, { role: 'system', name: 'n', content: 'A\n\nP' }]);
});
