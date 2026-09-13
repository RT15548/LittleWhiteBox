import assert from 'node:assert/strict';
import test from 'node:test';
import { MESSAGES_PARTITION } from '../apps/messages/partition.js';
import { sendPrivateMessage } from '../apps/messages/application/send.js';
import { appendMessages } from '../domains/messages/commands.js';
import { messagesRevision } from '../apps/messages/application/modifications.js';
import { projectionMarker, unsyncedIds } from '../apps/messages/application/projection.js';
import { createMessagesRuntime, syncCurrentMessages } from '../apps/messages/host/runtime.js';
import { createMessagesController } from '../apps/messages/host/controller.js';

import { harness, controllerHarness, photo } from './helpers/messages-harness.js';
const clone = structuredClone;

test('saved capabilities select the advertised reply formats for sending and retrying without changing history or uploaded images', async () => {
    const h = await harness(); const c = await controllerHarness(h);
    const examples = request => {
        // Execute the JSON examples actually sent in the external reply
        // protocol through compilation and storage, without checking source text.
        return [...request.systemPrompt.matchAll(/\{"type":"(?:text|image|voice)"[^{}\n]*\}/gu)].map(([json]) => JSON.parse(json));
    };
    const respond = () => {
        const replies = examples(h.requests.at(-1));
        return { text: JSON.stringify(replies.length ? { replies } : { summary: '双方通过私人通讯分享了花店照片。' }) };
    };
    h.response = respond;
    for (const [imagePrompt, voicePrompt] of [[false, false], [true, false], [false, true], [true, true], [false, false]]) {
        const settings = { imagePrompt, voicePrompt };
        const before = clone(h.service.current()); const writes = h.writes;
        const saved = await c.command('settings', { settings });
        assert.deepEqual(saved.settings, settings);
        assert.deepEqual(c.activate().settings, settings);
        assert.deepEqual(h.service.current(), before); assert.equal(h.writes, writes);
        const id = `input:capability-${h.apiCalls}`;
        await c.command('send', { contactId: '甲', actionId: id.slice(6), payload: photo }); await c.idle();
        const request = h.requests.at(-1);
        const declared = examples(request);
        assert.deepEqual(declared.map(item => item.type), ['text', ...(imagePrompt ? ['image'] : []), ...(voicePrompt ? ['voice'] : [])]);
        assert.deepEqual(h.service.current().messages.filter(m => m.replyTo === id).map(m => m.payload), declared);
        assert.ok(request.messages.some(m => Array.isArray(m.content) && m.content.some(part => part.type === 'image_url')));
    }
    await assert.rejects(c.command('settings', { settings: { imagePrompt: true, voicePrompt: 'yes' } }));
    assert.deepEqual(c.activate().settings, { imagePrompt: false, voicePrompt: false });
    h.response = async () => {throw new Error('offline');};
    await c.command('send', { contactId: '乙', actionId: 'retry-settings', payload: { type: 'text', text: '在吗？' } }); await c.idle();
    await c.command('settings', { settings: { imagePrompt: false, voicePrompt: true } });
    h.response = respond;
    await c.command('retry', { contactId: '乙', messageId: 'input:retry-settings' }); await c.idle();
    assert.deepEqual(examples(h.requests.at(-1)).map(item => item.type), ['text', 'voice']);
    assert.equal(h.service.current().messages.filter(m => m.id === 'input:retry-settings').length, 1);
    await c.runtime.stop(); c.controller.deactivate();
});

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
        context: { ...h.deps.context, knownPeople: () => [] }, media: { capabilities: () => ({ image: false, voice: false }), stop() {}, cancelAll() {} },
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
    assert.equal((await command('contact/delete', { contactId: '乙', revision: messagesRevision(h.service.current()) })).contacts.length, 1);
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
    await h.deps.modifications.commit({ contactId: '甲', revision: messagesRevision(h.service.current()) }, 'delete-contact', () => true);
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
        context: { ...h.deps.context, knownPeople: () => [] }, media: { capabilities: () => ({ image: false, voice: false }), stop() {}, cancelAll() {} },
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
        context: { ...h.deps.context, knownPeople: () => [] }, media: { capabilities: () => ({ image: false, voice: false }), stop() {}, cancelAll() {} },
        isGenerating: () => generating, subscribeGeneration: () => () => {}, subscribeChat(listener) {onChat = listener; return () => {};},
    });
    controller.startBackground();
    h.messages[0].mes = 'edited'; onChat(); generating = true; onChat(); runtime.cancel();
    await h.service.change(() => {});
    assert.equal(h.service.current().segments[0].sealed, true);
    await controller.stopBackground();
});
