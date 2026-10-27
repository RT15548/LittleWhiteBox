import assert from 'node:assert/strict';
import test from 'node:test';
import { administratorHarness, settled } from './administrator-harness.js';

// Failed generation must remain visible on its turn, not become a second page error;
// partial output must survive, and failures before a turn exists must not disappear.
test('administrator generation failures belong to the saved turn while rejected actions remain page errors', async t => {
    for (const partial of ['', 'Partial reply']) {
        const h = await administratorHarness();
        t.after(() => h.runtime.reset());
        const cause = 'fixture-provider-rejected';
        h.state.generate = async request => {
            if (partial) request.onStreamProgress({ text: partial });
            throw new Error(cause);
        };
        await h.request('send', { text: 'test' }); await settled(h.runtime);
        const state = h.pushed.filter(message => message.type === 'administrator/state').at(-1).payload.state;
        const row = state.page.rows.find(item => item.role === 'assistant');
        assert.equal(row.error, cause);
        assert.equal(row.text, partial);
        assert.equal(row.status, 'failed');
        assert.equal(state.error, '');
        assert.equal(h.runtime.error(), '');
        await h.conversation.refresh();
        assert.equal(h.conversation.page().rows.find(item => item.role === 'assistant').error, cause);
        await assert.rejects(h.request('send', { text: '' }));
        assert.ok(h.pushed.filter(message => message.type === 'administrator/state').at(-1).payload.state.error);
    }
    const h = await administratorHarness();
    t.after(() => h.runtime.reset());
    h.state.generate = async () => {
        h.state.replace = async () => ({ status: 'unconfirmed', observed: null });
        throw new Error('fixture-provider-rejected');
    };
    await h.request('send', { text: 'test save recovery' }); await settled(h.runtime);
    const state = h.pushed.filter(message => message.type === 'administrator/state').at(-1).payload.state;
    assert.equal(state.unsaved, true, 'unconfirmed persistence still exposes recovery controls');
    assert.ok(state.error, 'the separate save failure remains visible');
    assert.notEqual(state.error, 'fixture-provider-rejected');
});
