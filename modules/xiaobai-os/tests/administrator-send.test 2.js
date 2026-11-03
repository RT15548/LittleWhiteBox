import assert from 'node:assert/strict';
import test from 'node:test';
import { administratorHarness, settled, tick, withLoadedTools } from './administrator-harness.js';
import { createAdministratorImages } from '../apps/administrator/storage/images.js';

const image = { name: 'screen.png', dataUrl: 'data:image/png;base64,YQ==' };

test('a send is acknowledged when its USER is saved, while the model is still running', async () => {
    const h = await administratorHarness();
    let rejectReply;
    h.state.generate = () => new Promise((_, reject) => { rejectReply = reject; });
    const sent = await h.request('send', { submissionId: 'draft-a', text: 'request' });
    for (let i = 0; !rejectReply && i < 100; i++) { await tick(); }
    assert.ok(rejectReply);
    try {
        assert.equal(h.runtime.busy(), true);
        assert.deepEqual(sent.state.submission, { id: 'draft-a', turnId: sent.turnId, accepted: true });
        assert.equal(h.conversation.read().turns[0].assistant, null);
        assert.ok(h.pushed.some(message => message.type === 'administrator/state' && message.payload.state.submission?.accepted));
    } finally { rejectReply(new Error('provider failure')); await settled(h.runtime); }
    assert.equal(h.runtime.submission().accepted, true);
    assert.equal(h.conversation.read().turns[0].status, 'failed');
});

test('an unconfirmed USER keeps its submission identity through confirmation', async () => {
    const h = await administratorHarness();
    h.state.replace = async () => ({ status: 'unconfirmed', observed: null });
    await assert.rejects(h.request('send', { submissionId: 'draft-a', text: 'request' }));
    const pending = h.runtime.submission();
    assert.equal(pending.id, 'draft-a'); assert.equal(pending.accepted, false);
    assert.equal(h.state.requests.length, 0);
    h.state.replace = null;
    await h.request('confirm'); await settled(h.runtime);
    assert.deepEqual(h.runtime.submission(), { ...pending, accepted: true });
    assert.deepEqual(h.conversation.read().turns.map(turn => turn.id), [pending.turnId]);
    assert.equal(h.state.requests.length, 1);
});

test('regenerating history cannot acknowledge a failed upload as a sent draft', async () => {
    const h = await administratorHarness();
    const first = await h.request('send', { text: 'history' }); await settled(h.runtime);
    const save = h.images.save;
    h.images.save = async () => { throw new Error('upload failure'); };
    await assert.rejects(h.request('send', { submissionId: 'unsent-draft', text: 'new request', image }));
    assert.equal(h.runtime.submission().accepted, false);
    const offset = h.pushed.length;
    const rerolled = await h.request('regenerate', { turnId: first.turnId }); await settled(h.runtime);
    assert.equal(rerolled.submission, null);
    assert.ok(h.pushed.slice(offset).every(message => message.type !== 'administrator/state' || !message.payload.state.submission?.accepted));
    assert.deepEqual(h.conversation.read().turns.map(turn => turn.user.text), ['history']);
    h.images.save = save;
    const resent = await h.request('send', { submissionId: 'resent-draft', text: 'new request', image }); await settled(h.runtime);
    assert.deepEqual(resent.state.submission, { id: 'resent-draft', turnId: resent.turnId, accepted: true });
    assert.deepEqual(h.conversation.read().turns.map(turn => turn.user.text), ['history', 'new request']);
});

// Browser contract: LAN HTTP exposes getRandomValues, but not randomUUID.
// Exercise production ID creation through activation, sends, tools and attachment storage.
test('LAN HTTP can open administrator and save text, tool receipts and an image', async t => {
    const original = Object.getOwnPropertyDescriptor(globalThis, 'crypto');
    const getRandomValues = globalThis.crypto.getRandomValues.bind(globalThis.crypto);
    Object.defineProperty(globalThis, 'crypto', { configurable: true, value: { getRandomValues } });
    t.after(() => Object.defineProperty(globalThis, 'crypto', original));
    const h = await administratorHarness();
    t.after(() => h.runtime.reset());
    h.controller.emit();
    const opened = h.pushed.find(message => message.type === 'administrator/state').payload.state;
    assert.equal(opened.error, '');
    assert.ok(opened.context.used > 0);

    const files = new Map();
    Object.assign(h.images, createAdministratorImages({ headers: () => ({}),
        async upload(data, folder, name, format) {
            const path = `/user/images/${folder}/${name}.${format}`;
            files.set(path, Uint8Array.from(atob(data), char => char.charCodeAt(0)));
            return path;
        },
        async read(path) { return new Response(files.get(path), { status: files.has(path) ? 200 : 404 }); },
    }));
    let calls = 0;
    h.state.generate = withLoadedTools([], async () => calls++ % 2 === 0
        ? { toolCalls: [{ id: 'same-provider-id', name: 'ChatRead', arguments: JSON.stringify({ from: 55 }) }] }
        : { text: 'done' });
    for (const input of [{ text: 'read' }, { text: 'read image', image }]) {
        await h.request('send', input); await settled(h.runtime);
    }
    const turns = h.repository.read().turns;
    assert.equal(turns.length, 2);
    assert.ok(turns.every(turn => turn.status === 'finished'));
    assert.notEqual(turns[0].id, turns[1].id);
    assert.deepEqual(turns.map(turn => turn.operations.map(operation => operation.status)), [['read'], ['read']]);
    assert.notEqual(turns[0].operations[0].id, turns[1].operations[0].id);
    assert.equal(files.size, 1);
    assert.equal(await h.images.load(h.repository.osId(), turns[1].user.image), image.dataUrl);
    assert.ok(h.state.requests.some(request => request.messages.some(message => Array.isArray(message.content)
        && message.content.some(part => part.type === 'image_url' && part.image_url.url === image.dataUrl))));
});

test('a first image send resumes initialization, upload, message save and generation exactly once', async () => {
    const h = await administratorHarness({}, { fresh: true });
    h.state.replace = async () => ({ status: 'unconfirmed', observed: null });
    let uploads = 0;
    const save = h.images.save;
    h.images.save = async (...args) => { uploads++; return save(...args); };
    await assert.rejects(h.request('send', { text: '查看图片', image }));
    const turnId = h.runtime.submission()?.turnId;
    assert.ok(turnId); assert.equal(uploads, 0); assert.equal(h.state.requests.length, 0);
    await h.request('check'); assert.equal(h.conversation.unsaved(), true);
    h.state.replace = null;
    await h.request('confirm'); await settled(h.runtime);
    await h.request('confirm'); await settled(h.runtime);
    assert.equal(uploads, 1); assert.equal(h.state.requests.length, 1);
    assert.deepEqual(h.conversation.read().turns.map(t => t.id), [turnId]);
    assert.ok(h.conversation.read().turns[0].user.image);
    assert.equal(h.conversation.read().turns[0].status, 'finished');
});

for (const method of ['stop', 'cancelAll', 'stopBackground']) {
    for (const stage of ['initialization', 'upload', 'message']) {
        test(`${method} invalidates a send waiting at ${stage}, including late successful saves`, async () => {
            const h = await administratorHarness({}, { fresh: stage === 'initialization' });
            let release;
            const wait = () => new Promise(resolve => { release = resolve; });
            if (stage === 'upload') {
                const save = h.images.save;
                h.images.save = async (...args) => { await wait(); return save(...args); };
            } else {
                h.state.replace = async input => { await wait(); h.state.persisted = structuredClone(input.candidate); return { status: 'confirmed' }; };
            }
            h.state.generate = async () => ({ toolCalls: [{ id: 'write', name: 'WorldEdit', arguments: '{"overview":"unexpected"}' }] });
            const sending = h.request('send', { text: '旧发送', ...(stage === 'message' ? {} : { image }) }).catch(error => error);
            for (let i = 0; !release && i < 100; i++) { await tick(); }
            assert.ok(release);
            assert.equal(h.runtime.busy(), true);
            assert.equal(h.runtime.live().phase, 'preparing');
            assert.ok(h.pushed.some(message => message.payload.state?.live?.phase === 'preparing'));
            if (method === 'stop') { await h.request('stop'); } else { await h.controller[method](); }
            if (method === 'stop') { assert.equal(h.runtime.live().phase, 'stopping'); }
            release(); await sending; await settled(h.runtime);
            h.state.replace = null;
            await h.request('check'); await settled(h.runtime);
            assert.equal(h.state.requests.length, 0);
            assert.equal(h.state.persisted?.partitions.world, undefined);
            if (stage === 'upload') { assert.equal(h.state.removed.length, 1); }
        });
    }
}

test('a never-created first sidecar can be abandoned and a fresh send is not blocked', async () => {
    const h = await administratorHarness({}, { fresh: true });
    h.state.replace = async () => ({ status: 'unconfirmed', observed: null });
    await assert.rejects(h.request('send', { text: 'old', image }));
    await h.controller.cancelAll();
    await h.request('adopt');
    assert.equal(h.conversation.unsaved(), false); assert.equal(h.repository.osId(), null);
    assert.equal(h.state.capture.reference, null); assert.equal(h.conversation.read().turns.length, 0);
    h.state.replace = null;
    await h.request('send', { text: 'new', image }); await settled(h.runtime);
    assert.equal(h.conversation.read().turns.length, 1); assert.equal(h.state.requests.length, 1);
});

test('a disappeared existing sidecar is not treated as an abandoned first creation', async () => {
    const h = await administratorHarness();
    h.state.replace = async () => ({ status: 'unconfirmed', observed: h.state.persisted });
    await assert.rejects(h.request('send', { text: 'old' }));
    h.state.persisted = null;
    await assert.rejects(h.request('adopt'));
    assert.equal(h.conversation.unsaved(), true); assert.equal(h.conversation.conflict(), true);
    assert.equal(h.state.capture.reference.osId, 'admin-os');
});

test('reopening the panel during image upload does not continue the same send twice', async () => {
    const h = await administratorHarness(); let release, uploads = 0;
    const save = h.images.save;
    h.images.save = async (...args) => { uploads++; await new Promise(resolve => { release = resolve; }); return save(...args); };
    const sending = h.request('send', { text: 'image', image });
    for (let i = 0; !release && i < 100; i++) { await tick(); }
    assert.ok(release);
    h.controller.deactivate();
    await h.controller.activate({ isCurrent: () => true, activationToken: 'reopened', post: () => true });
    assert.equal(h.runtime.live().phase, 'preparing');
    assert.equal(uploads, 1); assert.equal(h.state.requests.length, 0);
    release(); await sending; await settled(h.runtime);
    assert.equal(h.conversation.read().turns.length, 1); assert.equal(h.state.requests.length, 1);
});
