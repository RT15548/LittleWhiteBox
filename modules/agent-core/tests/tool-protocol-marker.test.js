import test from 'node:test';
import assert from 'node:assert/strict';

import {
    TOOL_PROTOCOL_MARKER as M,
    hasToolProtocolMarker,
    resolveToolProtocolMarker,
    stripToolProtocolMarker,
} from '../adapters/tool-protocol-marker.js';

const replaceWith = (messages, text) => resolveToolProtocolMarker(messages, text);

test('marker uses invisible separators that survive trim()', () => {
    assert.equal(M, '⁣XBDRAW_TOOL_PROTOCOL⁣');
    assert.equal(M.trim(), M);
});

test('hasToolProtocolMarker only looks at string content', () => {
    assert.equal(hasToolProtocolMarker([{ role: 'user', content: 'x' }]), false);
    assert.equal(hasToolProtocolMarker([{ role: 'user', content: `a\n\n${M}` }]), true);
    assert.equal(hasToolProtocolMarker([{ role: 'user', content: [{ type: 'text', text: M }] }]), false);
    assert.equal(hasToolProtocolMarker(null), false);
});

test('replacement: marker in the middle, tail, and head', () => {
    assert.deepEqual(
        replaceWith([{ role: 'system', content: `A\n\n${M}\n\nB` }], 'P').messages,
        [{ role: 'system', content: 'A\n\nP\n\nB' }],
    );
    assert.deepEqual(
        replaceWith([{ role: 'system', content: `A\n\n${M}` }], 'P').messages,
        [{ role: 'system', content: 'A\n\nP' }],
    );
    assert.deepEqual(
        replaceWith([{ role: 'system', content: `${M}\n\nA` }], 'P').messages,
        [{ role: 'system', content: 'P\n\nA' }],
    );
});

test('replacement: standalone message and whole-content message', () => {
    const result = replaceWith([
        { role: 'system', content: 'A' },
        { role: 'system', content: M },
        { role: 'user', content: 'U' },
    ], 'P');
    assert.equal(result.found, true);
    assert.deepEqual(result.messages, [
        { role: 'system', content: 'A' },
        { role: 'system', content: 'P' },
        { role: 'user', content: 'U' },
    ]);
});

test('replacement: only the first marker is replaced and the rest are removed', () => {
    const result = replaceWith([
        { role: 'system', content: `A\n\n${M}\n\nB\n\n${M}` },
        { role: 'user', content: `U\n\n${M}\n\nV` },
    ], 'P');
    assert.deepEqual(result.messages, [
        { role: 'system', content: 'A\n\nP\n\nB' },
        { role: 'user', content: 'U\n\nV' },
    ]);
});

test('replacement function is called at most once and lazily', () => {
    let calls = 0;
    const fn = () => { calls += 1; return 'P'; };
    resolveToolProtocolMarker([{ role: 'user', content: 'no marker' }], fn);
    assert.equal(calls, 0);
    const result = resolveToolProtocolMarker([
        { role: 'system', content: `${M}\n\nA` },
        { role: 'user', content: M },
    ], fn);
    assert.equal(calls, 1);
    assert.deepEqual(result.messages, [{ role: 'system', content: 'P\n\nA' }]);
});

test('empty replacement behaves like stripping', () => {
    assert.deepEqual(
        replaceWith([{ role: 'system', content: `A\n\n${M}\n\nB` }], '').messages,
        [{ role: 'system', content: 'A\n\nB' }],
    );
});

test('null replacement removes marker with one adjacent separator', () => {
    assert.deepEqual(
        stripToolProtocolMarker([
            { role: 'system', content: `A\n\n${M}\n\nB` },
            { role: 'user', content: `${M}\n\nU` },
            { role: 'assistant', content: `R\n\n${M}` },
        ]),
        [
            { role: 'system', content: 'A\n\nB' },
            { role: 'user', content: 'U' },
            { role: 'assistant', content: 'R' },
        ],
    );
});

test('null replacement drops empty messages and merges same-role neighbours', () => {
    const result = resolveToolProtocolMarker([
        { role: 'system', content: 'A' },
        { role: 'system', content: M },
        { role: 'system', content: 'B' },
        { role: 'user', content: 'U' },
    ], null);
    assert.equal(result.found, true);
    assert.deepEqual(result.messages, [
        { role: 'system', content: 'A\n\nB' },
        { role: 'user', content: 'U' },
    ]);
});

test('different-role neighbours are not merged and untouched neighbours stay separate', () => {
    assert.deepEqual(
        stripToolProtocolMarker([
            { role: 'system', content: 'A' },
            { role: 'user', content: M },
            { role: 'assistant', content: 'R' },
        ]),
        [
            { role: 'system', content: 'A' },
            { role: 'assistant', content: 'R' },
        ],
    );
    // 没有被剔除的消息，即使角色相同也保持原样，不额外合并。
    assert.deepEqual(
        stripToolProtocolMarker([
            { role: 'user', content: `${M}\n\nU1` },
            { role: 'user', content: 'U2' },
        ]),
        [
            { role: 'user', content: 'U1' },
            { role: 'user', content: 'U2' },
        ],
    );
});

test('whitespace-only leftovers are removed as empty messages', () => {
    assert.deepEqual(
        stripToolProtocolMarker([
            { role: 'system', content: `  \n${M}\n ` },
            { role: 'user', content: 'U' },
        ]),
        [{ role: 'user', content: 'U' }],
    );
});

test('no marker: found is false and content is unchanged', () => {
    const input = [{ role: 'system', content: 'A\n\nB' }, { role: 'user', content: 'U' }];
    const result = resolveToolProtocolMarker(input, 'P');
    assert.equal(result.found, false);
    assert.deepEqual(result.messages, input);
    assert.notEqual(result.messages, input);
    assert.deepEqual(stripToolProtocolMarker(input), input);
});

test('non-string content is left untouched and other fields are preserved', () => {
    const blocks = [{ type: 'text', text: M }];
    const toolMessage = { role: 'tool', tool_call_id: 'c1', content: 'result' };
    const result = resolveToolProtocolMarker([
        { role: 'user', content: blocks },
        { role: 'assistant', content: null, tool_calls: [{ id: 'c1' }] },
        toolMessage,
        { role: 'system', name: 'n', content: `A\n\n${M}` },
    ], 'P');
    assert.equal(result.messages[0].content, blocks);
    assert.deepEqual(result.messages[1], { role: 'assistant', content: null, tool_calls: [{ id: 'c1' }] });
    assert.equal(result.messages[2], toolMessage);
    assert.deepEqual(result.messages[3], { role: 'system', name: 'n', content: 'A\n\nP' });
});

test('input is never mutated and repeated calls give identical output', () => {
    const input = [
        { role: 'system', content: `A\n\n${M}` },
        { role: 'system', content: M },
        { role: 'user', content: 'U' },
    ];
    const snapshot = structuredClone(input);
    const first = replaceWith(input, 'P');
    const second = replaceWith(input, 'P');
    const strippedA = resolveToolProtocolMarker(input, null);
    const strippedB = resolveToolProtocolMarker(input, null);
    assert.deepEqual(input, snapshot);
    assert.deepEqual(first, second);
    assert.deepEqual(strippedA, strippedB);
    assert.notEqual(first.messages, input);
    assert.deepEqual(first.messages, [
        { role: 'system', content: 'A\n\nP' },
        { role: 'user', content: 'U' },
    ]);
});

test('non-array input yields an empty result', () => {
    assert.deepEqual(resolveToolProtocolMarker(undefined, null), { messages: [], found: false });
});
