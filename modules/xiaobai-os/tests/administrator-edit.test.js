import assert from 'node:assert/strict';
import test from 'node:test';
import { administratorHarness, settled, tick } from './administrator-harness.js';
import { createAdministratorData } from '../apps/administrator/domain/data.js';
import { ADMINISTRATOR_POLICY } from '../apps/administrator/domain/policy.js';

const turn = id => ({ id, createdAt: 1, user: { text: `input-${id}` }, assistant: `reply-${id}`, toolMessages: [], operations: [], status: 'finished', error: '' });
const seed = () => ({ ...createAdministratorData(), turns: [turn('before'), { ...turn('target'),
    user: { text: 'old input', image: { name: 'image.png', path: '/user/images/xb-os-admin-admin-os/test.png' } },
    operations: [{ id: 'op', appId: 'world', name: 'update', target: '', status: 'saved', elapsedMs: 1, summary: 'done' }],
}, turn('later')], summary: { text: 'old summary', throughId: 'target', throughToolMessage: null } });

test('editing changes only user text, retains attachments and following turns, and invalidates the affected summary', async () => {
    const data = seed(), h = await administratorHarness({ administrator: data });
    const result = await h.request('edit', { turnId: 'target', revision: 0, text: ' new\ninput ' });
    const expected = structuredClone(data); expected.turns[1].user.text = 'new\ninput'; expected.summary = null; expected.revision++;
    assert.deepEqual(h.repository.read(), expected);
    assert.equal(result.page.revision, 1); assert.equal(h.state.requests.length, 0); assert.deepEqual(h.state.removed, []);
    await h.conversation.refresh(); assert.deepEqual(h.conversation.read(), expected);
    await h.request('regenerate', { turnId: 'target' }); await settled(h.runtime);
    assert.equal(h.state.requests.at(-1).messages.at(-1).content[0].text, 'new\ninput');
});

test('edits validate their target, revision and text and cannot change active or unconfirmed work', async t => {
    const data = seed(), h = await administratorHarness({ administrator: data });
    for (const payload of [
        { turnId: 'missing', revision: 0, text: 'change' }, { turnId: 'target', revision: 1, text: 'change' },
        { turnId: 'before', revision: 0, text: '' }, { turnId: 'target', revision: 0, text: null },
        { turnId: 'target', revision: 0, text: 'x'.repeat(ADMINISTRATOR_POLICY.maxInputChars + 1) },
    ]) { await assert.rejects(h.request('edit', payload)); }
    assert.deepEqual(h.repository.read(), data); assert.equal(h.state.writes.length, 0);
    await h.request('edit', { turnId: 'target', revision: 0, text: '' });
    assert.equal(h.repository.read().turns[1].user.text, '');
    assert.deepEqual(h.repository.read().turns[1].user.image, data.turns[1].user.image);
    let started = false;
    h.state.generate = request => new Promise((_, reject) => { started = true; request.signal.addEventListener('abort', () => reject(request.signal.reason), { once: true }); });
    t.after(() => h.runtime.reset());
    await h.request('send', { text: 'running' }); while (!started) { await tick(); }
    await assert.rejects(h.request('edit', { turnId: 'target', revision: h.repository.read().revision, text: 'blocked' }));
    assert.equal(h.repository.read().turns[1].user.text, '');
});

test('a failed edit retains a recoverable candidate without replacing confirmed text or rerunning the model', async () => {
    const data = seed(), h = await administratorHarness({ administrator: data });
    h.state.replace = async () => ({ status: 'failed', error: new Error('fixture_save_failed') });
    await assert.rejects(h.request('edit', { turnId: 'target', revision: 0, text: 'kept draft' }));
    assert.equal(h.conversation.unsaved(), true); assert.deepEqual(h.repository.read(), data);
    await assert.rejects(h.request('edit', { turnId: 'before', revision: 0, text: 'other edit' }));
    h.state.replace = null; await h.request('confirm');
    assert.equal(h.conversation.unsaved(), false); assert.equal(h.repository.read().turns[1].user.text, 'kept draft');
    assert.equal(h.repository.read().turns[2].id, 'later'); assert.equal(h.state.requests.length, 0);
});
