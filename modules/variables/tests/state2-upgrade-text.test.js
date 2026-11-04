import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHarness, readStoredValue } from './helpers/state2-harness.js';

const fixture = JSON.parse(readFileSync(new URL('./fixtures/state2-wal-v1.json', import.meta.url), 'utf8'));
const block = text => `<state>\n${text}\n</state>`;
let harness;
const context = () => harness.env.state.ctx;
test.before(async () => { harness = await createHarness(); });
test.beforeEach(() => harness.reset());
test.after(() => harness.cleanup());

for (const openFirst of [false, true]) {
    test(`the preserved text API skips an already executed official request ${openFirst ? 'after chat open' : 'at lazy migration'}`, () => {
        context().chat = Array.from({ length: 4 }, () => ({ mes: 'cleaned old body', swipe_id: 0, swipe_info: [{ extra: {} }] }));
        context().chatMetadata = structuredClone(fixture.metadata);
        if (openFirst) harness.executor.openStateChat();
        const api = harness.executor.createStateApi();
        const text = fixture.metadata.extensions.LittleWhiteBox.stateLogV2.floors[3].signature;
        const result = api.applyText(text, { floor: 3, silent: true });
        assert.equal(result.skipped, true);
        assert.deepEqual(result.atoms, []);
        assert.deepEqual(result.errors, []);
        assert.equal(readStoredValue(context(), '角色').金钱, 15);
        assert.equal(context().chat[3].extra.LittleWhiteBox_state2.entries.length, 1);
        const savedChat = structuredClone(context().chat);
        const savedMetadata = structuredClone(context().chatMetadata);
        harness.reset();
        context().chat = savedChat;
        context().chatMetadata = savedMetadata;
        harness.executor.openStateChat();
        const reopened = harness.executor.createStateApi().applyText(text, { floor: 3, silent: true });
        assert.equal(reopened.skipped, true);
        assert.equal(readStoredValue(context(), '角色').金钱, 15);
    });
}

test('text API deduplication compares the complete continued body, not individual fragments', () => {
    context().chat = [{ mes: '', swipe_id: 0 }, { mes: '', swipe_id: 0 }];
    const first = block('角色.金钱: -10');
    const second = block('角色.背包: +"药"');
    harness.executor.applyStateForMessage(0, block('角色: {"金钱":100,"背包":[]}'));
    harness.executor.applyStateForMessage(1, first);
    harness.executor.applyStateForMessage(1, first + second);
    const api = harness.executor.createStateApi();
    assert.equal(api.applyText(first + second, { silent: true }).skipped, true);
    assert.deepEqual(readStoredValue(context(), '角色'), { 金钱: 90, 背包: ['药'] });
    assert.equal(api.applyText(first, { silent: true }).skipped, false);
    assert.deepEqual(readStoredValue(context(), '角色'), { 金钱: 80, 背包: ['药'] });
    assert.equal(api.apply({ ops: [{ op: 'inc', path: '角色.金钱', delta: -10 }] }).status, 'success');
    assert.equal(api.apply({ ops: [{ op: 'inc', path: '角色.金钱', delta: -10 }] }).status, 'success');
    assert.equal(readStoredValue(context(), '角色').金钱, 60);
});
