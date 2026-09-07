import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import test from 'node:test';
import { XiaobaiOsPartitionRegistry } from '../kernel/partition-registry.js';
import { createTransactionCoordinator } from '../kernel/transaction-coordinator.js';
import { MESSAGES_PARTITION } from '../apps/messages/partition.js';
import { createMessagesService } from '../apps/messages/application/service.js';
import { createMessagesTimeline } from '../apps/messages/application/timeline.js';
import { sendPrivateMessage } from '../apps/messages/application/send.js';
import { addContact, appendMessages, deleteContact, deleteImageMessage } from '../domains/messages/commands.js';
import { branchMessages } from '../apps/messages/application/branch.js';
import { PRIVATE_MESSAGE_MARKER, projectionMarker, unsyncedIds } from '../apps/messages/application/projection.js';
import { normalizePromptContext } from '../host/prompt-context/normalize.js';
import { createMessagesRuntime, syncCurrentMessages } from '../apps/messages/host/runtime.js';
import { createMessagesController } from '../apps/messages/host/controller.js';
import { createMessageImages } from '../apps/messages/host/image-attachments.js';
import { parseOutgoingMessage } from '../apps/messages/application/image-upload.js';

const clone = structuredClone;
async function harness() {
    const binding = { kind: 'character', ownerLocator: 'test.png', chatId: 'chat' };
    const h = { identity: 'chat', persisted: null, writes: 0, replace: null, read: null, messages: [], remote: [], publishes: 0, failProjection: false, apiCalls: 0, response: null,
        images: new Map(), uploads: 0, upload: null, publish: null, requests: [], releasedConfirmations: [] };
    h.persisted = { formatVersion: 1, osId: 'os', binding, revision: 0, commitId: 'initial', partitions: {} };
    let serial = 0; const id = () => `id-${++serial}`;
    const capture = () => ({ identityKey: h.identity, binding, reference: { formatVersion: 1, osId: 'os' } });
    const registry = new XiaobaiOsPartitionRegistry(); registry.register(MESSAGES_PARTITION);
    const coordinator = createTransactionCoordinator({ partitions: registry, createId: id,
        chatReferences: { capture, isCurrent: value => value.identityKey === h.identity, install: async () => ({ status: 'confirmed' }) },
        storage: {
            async read() {return h.read ? h.read() : clone(h.persisted);},
            async replace(input) {h.writes++; if (h.replace) {return h.replace(input);} h.persisted = clone(input.candidate); return { status: 'confirmed' };},
            async delete() {return 'deleted';},
        },
    });
    const service = createMessagesService(coordinator.createScopedStore(MESSAGES_PARTITION), coordinator);
    const chat = {
        identity: () => h.identity, messages: () => h.messages,
        finalizedThrough: () => h.finalizedThrough ?? -1,
        releaseConfirmation(identity, marker) {h.releasedConfirmations.push({ identity, marker });},
        async confirm(identity, marker, text) {return identity === h.identity && h.remote.some(message => message.mes === text && projectionMarker(message)?.digest === marker.digest);},
        async publish({ index, text, marker, guard }) {
            assert.equal(guard(), true); h.publishes++;
            const message = { name: '私人信息', is_user: false, is_system: false, mes: text, extra: { swipeable: false, [PRIVATE_MESSAGE_MARKER]: marker } };
            if (index === null) {h.messages.push(message);} else {h.messages[index] = message;}
            if (h.publish) {await h.publish();}
            if (h.failProjection) {return false;}
            h.remote = clone(h.messages); return true;
        },
    };
    let timeline = createMessagesTimeline(service, chat, id);
    const images = createMessageImages(async (data, folder, name, format) => {
        h.uploads++;
        if (h.upload) {await h.upload();}
        const path = `/user/images/${folder}/${name}.${format}`;
        h.images.set(path, Buffer.from(data, 'base64'));
        return path;
    }, async path => h.images.has(path) ? new Response(h.images.get(path)) : new Response(null, { status: 404 }));
    const deps = { service, timeline, images, context: { capture: async () => ({ ...normalizePromptContext({}), people: [] }) },
        agent: { loadConfig: async () => ({}), openSession: async () => ({ providerConfig: { model: 'fixture' }, run: async request => {
            h.requests.push(request);
            h.apiCalls++; if (h.response) {return h.response();}
            return { text: '{"replies":[{"type":"text","text":"马上到。"},{"type":"voice","transcript":"等我一下。"}]}' };
        } }) }, playerName: () => '玩家', id,
    };
    await service.change(state => {
        for (const name of ['甲', '乙']) {addContact(state, { id: name, name, note: '', createdAt: 0, summary: null });}
    });
    const send = (contactId, messageId, payload = { type: 'text', text: '来吗？' }) => sendPrivateMessage(deps, { contactId, messageId, payload, guard: () => true, signal: new AbortController().signal, stage: () => undefined });
    return Object.assign(h, { service, deps, send, chat, coordinator, get timeline() {return timeline;}, restart() {timeline = createMessagesTimeline(service, chat, id); deps.timeline = timeline;} });
}

const photo = parseOutgoingMessage({ type: 'image', description: '', upload: {
    name: '照片.png', dataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a2XsAAAAASUVORK5CYII=',
} });

async function controllerHarness(h) {
    const waiters = [];
    const runtime = createMessagesRuntime({ ...h.deps, identity: () => h.identity, isGenerating: () => false,
        changed() {if (!runtime.active) {waiters.splice(0).forEach(resolve => resolve());}} });
    const controller = createMessagesController({ ...h.deps, runtime, identity: () => h.identity,
        context: { ...h.deps.context, knownPeople: () => [] }, media: { capabilities: () => ({ image: false, voice: false }), cancelAll() {} },
        isGenerating: () => false, subscribeGeneration: () => () => {}, subscribeChat: () => () => {} });
    const activate = () => controller.activate({ isCurrent: () => true, post() {} });
    const command = (type, payload = {}) => controller.handleMessage({ type: `messages/${type}`, payload: { chatIdentity: h.identity, ...payload } });
    activate(); await command('refresh');
    return { controller, runtime, activate, command, idle: () => runtime.active ? new Promise(resolve => waiters.push(resolve)) : Promise.resolve() };
}

test('unconfirmed input remains visible across APP reentry; confirmation and retry preserve its identity', async () => {
    const h = await harness(); const c = await controllerHarness(h);
    let release; let saving;
    const entered = new Promise(resolve => {saving = resolve;});
    h.replace = input => {
        h.persisted = clone(input.candidate);
        saving(); return new Promise(resolve => {release = () => resolve({ status: 'unconfirmed', observed: null });});
    };
    const state = await c.command('send', { contactId: '甲', actionId: 'instant', payload: { type: 'text', text: '立刻显示' } });
    assert.equal(state.outgoing.messageId, 'input:instant');
    assert.equal(state.outgoing.payload.text, '立刻显示');
    await entered;
    assert.deepEqual((await c.command('thread', { contactId: '甲' })).messages, []);
    assert.equal(h.apiCalls, 0);
    c.controller.deactivate(); release(); await c.idle();
    const reopened = c.activate();
    assert.equal(reopened.outgoing.messageId, 'input:instant'); assert.equal(reopened.pendingSave, true);
    assert.equal(reopened.sendFailure.messageId, 'input:instant');
    await assert.rejects(c.command('discard-send', { messageId: 'input:instant' }));
    h.replace = null;
    assert.equal((await c.command('confirm')).outgoing, null);
    await c.command('retry', { contactId: '甲', messageId: 'input:instant' }); await c.idle();
    assert.equal(h.apiCalls, 1);
    assert.equal(h.service.current().messages.filter(m => m.id === 'input:instant').length, 1);
    assert.deepEqual(unsyncedIds(h.service.current()), []);
    await c.runtime.stop(); c.controller.deactivate();
});

test('failed uploads retry from the retained original file and can be discarded without touching history', async () => {
    const h = await harness(); const c = await controllerHarness(h);
    h.upload = async () => {throw new Error('offline');};
    await c.command('send', { contactId: '甲', actionId: 'photo', payload: photo }); await c.idle();
    assert.equal(c.activate().outgoing.payload.upload.dataUrl, photo.upload.dataUrl);
    assert.equal(h.service.current().messages.length, 0);
    h.upload = null;
    await c.command('retry', { contactId: '甲', messageId: 'input:photo' }); await c.idle();
    assert.equal(h.apiCalls, 1); assert.equal(c.activate().outgoing, null);
    assert.equal(h.service.current().messages.filter(m => m.id === 'input:photo').length, 1);
    h.upload = async () => {throw new Error('offline');};
    await c.command('send', { contactId: '甲', actionId: 'discard', payload: photo }); await c.idle();
    const saved = h.service.current();
    assert.equal((await c.command('discard-send', { messageId: 'input:discard' })).outgoing, null);
    assert.deepEqual(h.service.current(), saved);
    await c.runtime.stop(); c.controller.deactivate();
});

test('a stalled native save starts only after the reply is confirmed and never hides that reply', async () => {
    const h = await harness(); let release; let syncing;
    const entered = new Promise(resolve => {syncing = resolve;});
    h.publish = () => {syncing(); return new Promise(resolve => {release = resolve;});};
    const sending = h.send('甲', 'fast');
    await entered;
    assert.equal(h.apiCalls, 1);
    assert.equal(h.service.current().messages.length, 3);
    assert.equal(h.service.current().messages[1].payload.text, '马上到。');
    assert.equal(h.publishes, 1);
    release(); await sending;
    assert.deepEqual(unsyncedIds(h.service.current()), []);
});

test('a provider failure remains attached to its input even if mirroring fails as well', async () => {
    const h = await harness(); const c = await controllerHarness(h);
    h.failProjection = true; h.response = async () => {throw new Error('provider offline');};
    await c.command('send', { contactId: '甲', actionId: 'failed', payload: { type: 'text', text: '还在吗' } }); await c.idle();
    const state = c.activate();
    assert.equal(state.outgoing, null); assert.equal(state.sendFailure.messageId, 'input:failed');
    assert.match(state.sendFailure.message, /没有收到回复/); assert.equal(state.unsynced, 1);
    h.failProjection = false; h.response = null;
    await c.command('retry', { contactId: '甲', messageId: 'input:failed' }); await c.idle();
    assert.equal(h.service.current().messages.length, 3); assert.equal(h.apiCalls, 2);
    await c.runtime.stop(); c.controller.deactivate();
});

test('a real sidecar conflict can be explicitly adopted through Messages, then edited and sent again', async () => {
    const h = await harness(); await h.send('甲', 'existing');
    const runtime = createMessagesRuntime({ ...h.deps, identity: () => h.identity, isGenerating: () => false, changed() {} });
    const controller = createMessagesController({ ...h.deps, runtime, identity: () => h.identity,
        context: { ...h.deps.context, knownPeople: () => [] }, media: { capabilities: () => ({ image: false, voice: false }), cancelAll() {} },
        isGenerating: () => false, subscribeGeneration: () => () => {}, subscribeChat: () => () => {} });
    controller.activate({ isCurrent: () => true, post() {} });
    const command = (type, payload = {}) => controller.handleMessage({ type: `messages/${type}`, payload: { chatIdentity: 'chat', ...payload } });
    await command('refresh');
    const original = h.service.current(); const calls = h.apiCalls; const native = clone(h.messages);
    h.replace = () => {
        h.persisted.revision++; h.persisted.commitId = 'server-conflict';
        h.persisted.partitions.messages.contacts[0].note = '服务器的备注';
        return { status: 'conflict', observed: clone(h.persisted) };
    };
    await assert.rejects(command('contact/note', { contactId: '甲', note: '未保存的备注' }));
    for (let i = 0; i < 3; i++) {
        const state = await command('confirm');
        assert.equal(state.fileState, 'conflict'); assert.equal(state.pendingSave, true);
    }
    assert.deepEqual(h.service.current(), original);
    h.read = async () => {throw new Error('offline');};
    assert.equal((await command('adopt-server-state')).fileState, 'conflict');
    assert.equal(h.service.pending(), true); assert.deepEqual(h.service.current(), original);
    h.read = null; h.replace = null;
    const recovered = await command('adopt-server-state');
    assert.equal(recovered.fileState, 'ready'); assert.equal(recovered.pendingSave, false);
    assert.equal(recovered.contacts.find(contact => contact.id === '甲').note, '服务器的备注');
    assert.equal(h.apiCalls, calls); assert.deepEqual(h.messages, native);
    assert.equal((await command('contact/delete', { contactId: '乙' })).contacts.length, 1);
    await h.send('甲', 'after-recovery');
    assert.equal(h.apiCalls, calls + 1);
    h.identity = 'another';
    await assert.rejects(command('adopt-server-state'), /messages_chat_changed/);
    await runtime.stop(); controller.deactivate();
});

test('device image is saved once, persists as a local reference, and reaches the reply model as pixels after rereading', async () => {
    const h = await harness();
    await h.send('甲', 'photo', photo);
    const stored = MESSAGES_PARTITION.parse(h.persisted.partitions.messages).value;
    const attachment = stored.messages[0].payload.attachment;
    assert.equal(attachment.name, '照片.png');
    assert.equal(h.images.has(attachment.path), true);
    assert.equal(JSON.stringify(stored).includes('data:image'), false);
    assert.match(h.messages[0].mes, /附件="\/user\/images\/xb-os-messages\//u);
    const pixels = request => request.messages.flatMap(m => Array.isArray(m.content) ? m.content : []).filter(p => p.type === 'image_url').map(p => p.image_url.url);
    assert.deepEqual(pixels(h.requests[0]), [photo.upload.dataUrl]);
    h.restart(); await h.send('甲', 'photo', photo);
    assert.equal(h.uploads, 1); assert.equal(h.apiCalls, 1);
    await h.send('甲', 'later');
    assert.deepEqual(pixels(h.requests[1]), [photo.upload.dataUrl]);
    await h.send('乙', 'other');
    assert.deepEqual(pixels(h.requests[2]), []);
    await h.service.change(state => deleteContact(state, '甲'));
    assert.equal(h.images.has(attachment.path), true); // native floors / other branches still refer to host media
});

test('failed upload publishes no outgoing message; retry keeps one image and missing pixels do not silently become a text-only request', async () => {
    const h = await harness(); h.upload = async () => {throw new Error('offline');};
    await assert.rejects(h.send('甲', 'photo', photo), /offline/);
    assert.equal(h.service.current().messages.length, 0); assert.equal(h.messages.length, 0); assert.equal(h.apiCalls, 0);
    h.upload = null; h.failProjection = true;
    await assert.rejects(h.send('甲', 'photo', photo), /projection_unconfirmed/);
    const uploads = h.uploads;
    assert.equal(h.apiCalls, 1); assert.equal(h.service.current().messages.length, 3);
    h.failProjection = false; await h.send('甲', 'photo', photo);
    h.images.clear();
    await assert.rejects(h.send('甲', 'later'), /image_missing/);
    assert.equal(h.uploads, uploads); assert.equal(h.apiCalls, 1);
    assert.equal(h.service.current().messages.length, 4);
});

test('an image-rejecting provider can recover by deleting the picture, then sending or retrying text without rolling back history', async t => {
    for (const older of [false, true]) {
        await t.test(older ? 'delete a historical picture and retry the latest text' : 'delete the failed picture and send text', async () => {
            const h = await harness();
            if (older) {await h.send('甲', 'photo', photo); await h.send('乙', 'other');}
            h.response = async () => {
                if (h.requests.at(-1).messages.some(m => Array.isArray(m.content) && m.content.some(p => p.type === 'image_url'))) {
                    throw Object.assign(new Error('image input unsupported'), { status: 400 });
                }
                return { text: '{"replies":[{"type":"text","text":"文字可以继续。"}]}' };
            };
            await assert.rejects(older ? h.send('甲', 'later') : h.send('甲', 'photo', photo), error => error.cause?.status === 400);
            const original = h.service.current(); const native = clone(h.messages); const apiCalls = h.apiCalls;
            const runtime = createMessagesRuntime({ ...h.deps, identity: () => h.identity, isGenerating: () => false, changed() {} });
            const controller = createMessagesController({ ...h.deps, runtime, identity: () => h.identity,
                context: { ...h.deps.context, knownPeople: () => [] }, media: { capabilities: () => ({ image: false, voice: false }) },
                isGenerating: () => false, subscribeGeneration: () => () => {}, subscribeChat: () => () => {} });
            controller.activate({ isCurrent: () => true, post() {} });
            const deletion = { type: 'messages/message/delete-image', payload: { chatIdentity: 'chat', contactId: '甲', messageId: 'photo' } };
            const result = await controller.handleMessage(deletion);
            assert.deepEqual(await controller.handleMessage(deletion), result); // retry after a lost acknowledgement
            assert.equal(result.retryMessageId, older ? 'later' : null);
            const retained = original.messages.filter(m => m.id !== 'photo').map(m => m.replyTo === 'photo' ? { ...m, replyTo: null } : m);
            assert.deepEqual(h.service.current().messages, retained);
            assert.deepEqual(h.messages, native); assert.equal(h.images.size, 1); assert.equal(h.apiCalls, apiCalls);
            assert.deepEqual(unsyncedIds(h.service.current()), []);
            assert.deepEqual(branchMessages(h.service.current(), h.messages).messages, retained);
            h.restart(); await h.send('甲', 'later');
            assert.equal(h.service.current().messages.at(-1).payload.text, '文字可以继续。');
            assert.equal(h.service.current().messages.filter(m => m.id === 'later').length, 1);
            assert.equal(h.requests.at(-1).messages.some(m => Array.isArray(m.content) && m.content.some(p => p.type === 'image_url')), false);
            assert.deepEqual(h.messages.slice(0, native.length), native);
        });
    }
});

test('failed or uncertain image deletion stays visible until storage confirms; a stale guard cannot delete it', async t => {
    for (const status of ['failed', 'unconfirmed']) {
        await t.test(status, async () => {
            const h = await harness(); await h.send('甲', 'photo', photo); await h.send('甲', 'later');
            const original = h.service.current();
            await assert.rejects(h.service.change(state => deleteImageMessage(state, '甲', 'photo'), () => false));
            assert.deepEqual(h.service.current(), original);
            h.replace = input => {
                if (status === 'unconfirmed') {h.persisted = clone(input.candidate); return { status, observed: null };}
                return { status, error: { code: 'network', message: 'offline', retryable: true } };
            };
            await assert.rejects(h.service.change(state => deleteImageMessage(state, '甲', 'photo')), new RegExp('save_' + status));
            assert.deepEqual(h.service.current(), original); assert.equal(h.service.pending(), true);
            h.replace = null; await h.service.confirm();
            assert.equal(h.service.current().messages.some(m => m.id === 'photo'), false);
            assert.equal(h.service.current().messages.at(-1).id, original.messages.at(-1).id);
            assert.equal(h.service.pending(), false); assert.equal(h.images.size, 1);
            assert.equal(MESSAGES_PARTITION.parse(h.persisted.partitions.messages).ok, true);
        });
    }
});

test('cancel during image upload cannot publish a late picture into the original or a different chat', async () => {
    const h = await harness(); let release; let started;
    const uploading = new Promise(resolve => {started = resolve;});
    h.upload = () => {started(); return new Promise(resolve => {release = resolve;});};
    const signal = new AbortController();
    const sending = sendPrivateMessage(h.deps, { contactId: '甲', messageId: 'photo', payload: photo,
        guard: () => h.identity === 'chat', signal: signal.signal, stage() {} });
    await uploading; h.identity = 'different'; signal.abort(); release();
    await assert.rejects(sending);
    assert.equal(h.service.current().messages.length, 0); assert.equal(h.apiCalls, 0);
});

test('cross-contact messages share one native assistant floor; ordinary story seals it permanently', async () => {
    const h = await harness(); await h.send('甲', 'a', { type: 'text', text: '早些时候的通讯' }); await h.send('乙', 'b');
    assert.equal(h.messages.length, 1); assert.equal(h.service.current().messages.length, 6);
    assert.equal(h.messages[0].extra.swipeable, false);
    const old = h.messages[0].mes;
    h.messages.push({ mes: '下一段剧情', is_user: false });
    await h.deps.timeline.seal(h.deps.timeline.observe(), () => true);
    h.messages.pop(); // deleting later story must not reopen the old timepoint
    await h.send('甲', 'c', { type: 'text', text: '现在这次的通讯' });
    assert.equal(h.messages.length, 2); assert.equal(h.messages[0].mes, old);
    assert.match(h.messages[1].mes, /现在这次的通讯/u);
    assert.doesNotMatch(h.messages[1].mes, /早些时候的通讯/u);
    assert.equal((h.messages[1].mes.match(/<消息 /gu) ?? []).length, 3); // this send + its two replies only
    assert.deepEqual(unsyncedIds(h.service.current()), []);
});

test('native edits/deletes never rewrite app history or resurrect a floor after restart', async () => {
    const h = await harness(); await h.send('甲', 'a');
    h.messages[0].mes = '主人改写的内容'; h.remote = clone(h.messages); h.restart();
    await h.send('乙', 'b'); assert.equal(h.messages[0].mes, '主人改写的内容'); assert.equal(h.messages.length, 2);
    h.messages.pop(); h.remote = clone(h.messages); h.restart();
    await h.send('乙', 'c'); assert.equal(h.messages.length, 2);
    assert.equal(h.service.current().messages.length, 9);
    assert.notEqual(projectionMarker(h.messages[1]).segmentId, h.service.current().segments[1].id);
});

test('failed native sync cannot block a reply; retry mirrors the saved exchange without another Agent call', async () => {
    const h = await harness(); h.failProjection = true;
    await assert.rejects(h.send('甲', 'a'), /projection_unconfirmed/);
    assert.equal(h.apiCalls, 1); assert.equal(h.service.current().messages.length, 3);
    h.failProjection = false; await h.send('甲', 'a');
    assert.equal(h.messages.length, 1); assert.equal(h.apiCalls, 1); assert.equal(h.service.current().messages.length, 3);
    await h.send('甲', 'a'); assert.equal(h.apiCalls, 1); assert.equal(h.service.current().messages.length, 3);
});

test('chat confirmation recovers a missing sidecar receipt without publishing another floor', async () => {
    const h = await harness();
    const segmentId = await h.deps.timeline.select(() => true);
    await h.service.change(state => appendMessages(state, { segmentId, contactId: '甲', playerName: '玩家', replyTo: null,
        entries: [{ id: 'a', payload: { type: 'text', text: 'hello' } }], createdAt: 0 }));
    h.replace = () => ({ status: 'failed', error: { code: 'network', message: 'offline', retryable: true } });
    await assert.rejects(h.deps.timeline.sync(segmentId, () => true), /save_failed/);
    assert.equal(h.releasedConfirmations.length, 0, 'keep the host acknowledgement while the receipt is unsaved');
    assert.equal(h.messages.length, 1); assert.equal(h.publishes, 1);
    h.replace = null; await h.service.confirm(); h.restart();
    await h.deps.timeline.sync(segmentId, () => true);
    assert.ok(h.releasedConfirmations.some(item => item.marker.segmentId === segmentId));
    assert.equal(h.publishes, 1); assert.deepEqual(unsyncedIds(h.service.current()), []);
});

test('ambiguous missing floor after restart needs explicit current-time recovery, never automatic recreation', async () => {
    const h = await harness(); h.failProjection = true;
    await assert.rejects(h.send('甲', 'a'));
    h.messages = []; h.remote = []; h.failProjection = false; h.restart();
    await assert.rejects(h.send('甲', 'a'), /projection_closed/);
    assert.equal(h.messages.length, 0);
    await h.deps.timeline.recover(() => true);
    assert.equal(h.messages.length, 1); assert.match(h.messages[0].mes, /补录说明/);
    await syncCurrentMessages(h.service, h.deps.timeline, () => true);
    await h.deps.timeline.recover(() => true);
    assert.equal(h.messages.length, 1);
    await h.send('甲', 'a'); assert.equal(h.apiCalls, 1); assert.equal(h.messages.length, 1);
});

test('uncertain reply save retains the complete candidate; confirming it never reruns generation', async () => {
    const h = await harness();
    h.response = async () => {
        h.replace = input => {h.persisted = clone(input.candidate); return { status: 'unconfirmed', observed: null };};
        return { text: '{"replies":[{"type":"text","text":"a"},{"type":"text","text":"b"}]}' };
    };
    await assert.rejects(h.send('甲', 'a'), /save_unconfirmed/);
    assert.equal(h.service.current().messages.length, 1);
    h.replace = null; await h.service.confirm();
    await h.send('甲', 'a');
    assert.equal(h.apiCalls, 1); assert.equal(h.service.current().messages.length, 3);
    assert.equal(h.messages.length, 1);
});

test('contact removal seals shared floors and keeps other contact history and native evidence intact', async () => {
    const h = await harness(); await h.send('甲', 'a'); await h.send('乙', 'b');
    const before = clone(h.messages);
    await h.service.change(state => deleteContact(state, '甲'));
    await h.send('乙', 'c');
    assert.deepEqual(h.messages[0], before[0]); assert.equal(h.messages.length, 2);
    assert.equal(h.service.current().messages.filter(m => m.contactId === '甲').length, 0);
});

test('a floor summarized while the producer was disabled cannot be extended when it resumes', async () => {
    const h = await harness(); await h.send('甲', 'a');
    const original = h.messages[0].mes;
    h.finalizedThrough = 0;
    h.restart();
    await h.send('乙', 'b');
    assert.equal(h.messages.length, 2);
    assert.equal(h.messages[0].mes, original);
    assert.equal(h.service.current().segments[0].sealed, true);
    assert.deepEqual(unsyncedIds(h.service.current()), []);
});

test('chat/run cancellation rejects a late Provider result while preserving the confirmed outgoing message', async () => {
    const h = await harness(); let release;
    const called = new Promise(resolve => {h.response = () => {resolve(); return new Promise(r => {release = r;});};});
    const runtime = createMessagesRuntime({ ...h.deps, identity: () => h.identity, isGenerating: () => false, changed: () => undefined });
    runtime.start('甲', 'a', { type: 'text', text: 'hi' }); await called;
    runtime.cancel(); h.identity = 'another'; h.identity = 'chat';
    release({ text: '{"replies":[{"type":"text","text":"late"}]}' }); await runtime.stop();
    assert.equal(h.service.current().messages.length, 1);
    assert.equal(h.messages.length, 0);
    assert.deepEqual(unsyncedIds(h.service.current()), ['a']);
});

test('leaving the APP keeps an accepted reply running and reactivation reads the confirmed facts', async () => {
    const h = await harness(); let release;
    const called = new Promise(resolve => {h.response = () => {resolve(); return new Promise(r => {release = r;});};});
    let finished;
    const idle = new Promise(resolve => {finished = resolve;});
    const runtime = createMessagesRuntime({ ...h.deps, identity: () => h.identity, isGenerating: () => false,
        changed: () => {if (!runtime.active) {finished();}} });
    const controller = createMessagesController({ ...h.deps, runtime, identity: () => h.identity,
        context: { ...h.deps.context, knownPeople: () => [] }, media: { capabilities: () => ({ image: false, voice: false }), cancelAll() {} },
        isGenerating: () => false, subscribeGeneration: () => () => {}, subscribeChat: () => () => {} });
    const updates = [];
    const activation = { isCurrent: () => true, post(type, payload) {updates.push({ type, payload });} };
    controller.activate(activation);
    await controller.handleMessage({ type: 'messages/send', payload: { chatIdentity: 'chat', actionId: 'a', contactId: '甲', payload: { type: 'text', text: 'hi' } } });
    await called; controller.deactivate();
    release({ text: '{"replies":[{"type":"text","text":"still here"}]}' }); await idle;
    const view = controller.activate(activation);
    controller.emit();
    assert.equal(updates.at(-1).type, 'messages/state');
    assert.equal(updates.at(-1).payload.state.chatIdentity, 'chat');
    assert.equal(view.contacts.find(contact => contact.id === '甲').preview, 'still here');
    assert.equal(view.busy, null); assert.equal(h.apiCalls, 1); assert.equal(h.messages.length, 1);
    await runtime.stop();
});

test('cancellation after reply replace begins preserves its confirmed batch but defers chat projection', async () => {
    const h = await harness(); let release; let started;
    const writing = new Promise(resolve => {started = resolve;});
    h.replace = input => {
        if (input.candidate.partitions.messages.messages.length > 1) {
            started(); return new Promise(resolve => {release = () => {h.persisted = clone(input.candidate); resolve({ status: 'confirmed' });};});
        }
        h.persisted = clone(input.candidate); return { status: 'confirmed' };
    };
    const runtime = createMessagesRuntime({ ...h.deps, identity: () => h.identity, isGenerating: () => false, changed() {} });
    runtime.start('甲', 'a', { type: 'text', text: 'hi' }); await writing;
    const stopped = runtime.stop(); release(); await stopped;
    assert.equal(h.service.current().messages.length, 3);
    assert.equal(h.messages.length, 0);
    assert.equal(unsyncedIds(h.service.current()).length, 3);
    h.replace = null; await syncCurrentMessages(h.service, h.deps.timeline, () => true);
    assert.equal(h.messages[0].mes.includes('马上到'), true); assert.equal(h.apiCalls, 1);
});

test('consecutive native edit events persist the sealed timepoint even while generation starts', async () => {
    const h = await harness(); await h.send('甲', 'a'); let onChat; let generating = false;
    const runtime = createMessagesRuntime({ ...h.deps, identity: () => h.identity, isGenerating: () => generating, changed() {} });
    const controller = createMessagesController({ ...h.deps, runtime, identity: () => h.identity,
        context: { ...h.deps.context, knownPeople: () => [] }, media: { capabilities: () => ({ image: false, voice: false }), cancelAll() {} },
        isGenerating: () => generating, subscribeGeneration: () => () => {}, subscribeChat(listener) {onChat = listener; return () => {};},
    });
    controller.startBackground();
    h.messages[0].mes = 'edited'; onChat(); generating = true; onChat(); runtime.cancel();
    await h.service.change(() => {});
    assert.equal(h.service.current().segments[0].sealed, true);
    await controller.stopBackground();
});
