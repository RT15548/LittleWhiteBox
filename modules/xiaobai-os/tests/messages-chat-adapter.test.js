import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import process from 'node:process';
import test from 'node:test';
import { build } from 'esbuild';
import { PRIVATE_MESSAGE_MARKER } from '../apps/messages/application/projection.js';
import { createChatReferencePort } from '../storage/chat-reference.js';

// Production adapters run at the native HTTP/event boundary; no simulated saveChat acknowledgement.
const compiled = await build({
    stdin: { contents: `export { createMessagesChatAdapter } from './modules/xiaobai-os/apps/messages/host/chat-adapter.ts';
        export { createSillyTavernChatMetadataAdapter } from './modules/xiaobai-os/storage/sillytavern-chat-metadata.ts';
        export { saveSillyTavernChat } from './modules/xiaobai-os/host/sillytavern-chat-save.ts';
        export { host } from 'messages-test-host';`, resolveDir: process.cwd() },
    bundle: true, write: false, format: 'esm', platform: 'node', logLevel: 'silent',
    plugins: [{ name: 'native-chat-fixture', setup(builder) {
        // This optional host module is absent in SillyTavern 1.14–1.16; exercise actual module resolution.
        builder.onResolve({ filter: /\/request-compression\.js$/ }, () => ({
            errors: [{ text: 'The host does not provide request-compression.js' }],
        }));
        builder.onResolve({ filter: /(?:^messages-test-host$|\/(?:extensions|script|RossAscends-mods|event-manager|sillytavern-context|story-summary)\.js$)/ },
            () => ({ path: 'host', namespace: 'fixture' }));
        builder.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({ contents: `
            export const host = { context: null, identity: 'chat', listeners: new Map() };
            export const getContext = () => host.context;
            export const getSillyTavernChatIdentity = () => ({ key: host.identity });
            export const getStorySummaryCommittedThrough = () => -1;
            export const getRequestHeaders = () => ({ 'Content-Type': 'application/json', 'X-Test': 'native' });
            export const cancelDebouncedChatSave = () => {};
            export const default_avatar = 'default.png';
            export const isChatSaving = false;
            export const getMessageTimeStamp = () => '2026-09-06T00:00:00.000Z';
            export const addOneMessage = () => {};
            export const updateMessageBlock = () => {};
            export const event_types = Object.fromEntries(['CHAT_CHANGED', 'MESSAGE_SENT', 'MESSAGE_RECEIVED',
                'MESSAGE_EDITED', 'MESSAGE_UPDATED', 'MESSAGE_DELETED', 'MESSAGE_SWIPED', 'GENERATION_STARTED',
                'CHARACTER_MESSAGE_RENDERED', 'MORE_MESSAGES_LOADED'].map(key => [key, key]));
            export const createModuleEvents = () => {
                const owned = [];
                return { on(name, listener) {
                    const list = host.listeners.get(name) ?? new Set(); list.add(listener); host.listeners.set(name, list);
                    owned.push([name, listener]);
                }, cleanup() { for (const [name, listener] of owned) host.listeners.get(name)?.delete(listener); } };
            };
        ` }));
    } }],
});
// eslint-disable-next-line no-unsanitized/method -- Only repository code and the fixed native protocol fixture are bundled here.
const { createMessagesChatAdapter, createSillyTavernChatMetadataAdapter, saveSillyTavernChat, host } = await import(
    `data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].text).toString('base64')}`);

function harness(t, group = false, floors = 1) {
    host.identity = 'chat'; host.listeners.clear();
    host.context = { chat: Array.from({ length: floors }, (_, i) => ({ mes: `Story ${i}`, is_user: false })), chatId: 'chat',
        ...(group ? { groupId: 'group' } : { characterId: '0' }), characters: { 0: { name: 'NPC', avatar: 'npc.png' } },
        groups: [{ id: 'group' }], chatMetadata: { integrity: 'original' }, eventSource: { async emit(name, ...args) {
            for (const listener of host.listeners.get(name) ?? []) { await listener(...args); }
        } } };
    const h = { remote: [{ chat_metadata: {} }, ...structuredClone(host.context.chat)], mode: 'confirmed',
        failRead: false, reads: [], saves: [], upload: null };
    t.mock.method(globalThis, 'fetch', async (url, options) => {
        const body = JSON.parse(options.body);
        if (url.endsWith('/save')) {
            h.saves.push({ url, body, options });
            if (h.upload) { return h.upload(body); }
            if (h.mode === 'rejected') { return new Response('{"error":"integrity"}', { status: 400 }); }
            h.remote = body.chat;
            if (h.mode === 'lost-response') { throw new TypeError('disconnected'); }
            return new Response('{"ok":true}');
        }
        h.reads.push({ url, body });
        if (h.failRead) { throw new Error('offline read'); }
        return new Response(JSON.stringify(h.remote));
    });
    const adapter = createMessagesChatAdapter(() => false);
    const input = seq => ({ identity: 'chat', index: seq === 1 ? null : floors, text: `Private messages through ${seq}`,
        marker: { version: 1, segmentId: 'segment', throughSeq: seq, digest: String(seq).repeat(64) }, guard: () => true });
    return { h, ...adapter, input };
}

for (const group of [false, true]) {
    test(`${group ? 'group' : 'character'}: 10,000 floors save once without downloading the chat`, async t => {
        const { h, port, input } = harness(t, group, 10_000);
        const first = input(1);
        assert.equal(await port.publish(first), true);
        h.failRead = true;
        assert.equal(await port.confirm('chat', first.marker, first.text), true);
        assert.equal(h.reads.length, 0); assert.equal(h.saves.length, 1);
        assert.equal(h.remote.length, 10_002);
        assert.equal(h.saves[0].url, group ? '/api/chats/group/save' : '/api/chats/save');
        assert.equal(h.saves[0].options.method, 'POST');
        const headers = new Headers(h.saves[0].options.headers);
        assert.equal(headers.get('Content-Type'), 'application/json');
        assert.equal(headers.get('Content-Encoding'), null);
        assert.equal(headers.get('X-Test'), 'native');
        assert.equal(h.saves[0].body.force, false);
        assert.equal(h.remote[0].chat_metadata.integrity, 'original');
        assert.equal(h.remote.at(-1).extra[PRIVATE_MESSAGE_MARKER].throughSeq, 1);
    });

    test(`${group ? 'group' : 'character'}: rejection retries the same floor using current chat`, async t => {
        const { h, port, input } = harness(t, group);
        h.mode = 'rejected';
        const first = input(1);
        await assert.rejects(port.publish(first), /chat_save_http_400/);
        assert.equal(await port.confirm('chat', first.marker, first.text), false);
        assert.equal(h.reads.length, 0);
        host.context.chat[0].mes = 'Native edit after the failed save';
        h.mode = 'confirmed';
        assert.equal(await port.publish({ ...first, index: 1 }), true);
        assert.equal(h.remote.length, 3);
        assert.equal(h.remote[1].mes, 'Native edit after the failed save');
        assert.equal(h.saves.length, 2);
    });

    test(`${group ? 'group' : 'character'}: lost response is verified only on recovery`, async t => {
        const { h, port, input } = harness(t, group);
        const first = input(1); h.mode = 'lost-response';
        assert.equal(await port.publish(first), false);
        assert.equal(h.reads.length, 0);
        h.failRead = true; await assert.rejects(port.confirm('chat', first.marker, first.text), /offline read/);
        h.failRead = false; assert.equal(await port.confirm('chat', first.marker, first.text), true);
        h.failRead = true; assert.equal(await port.confirm('chat', first.marker, first.text), true);
        assert.equal(h.reads.length, 2); assert.equal(h.saves.length, 1);
        h.mode = 'confirmed'; assert.equal(await port.publish(input(2)), true);
        assert.equal(h.reads.length, 2); assert.equal(h.remote.length, 3);
    });

    test(`${group ? 'group' : 'character'}: first OS reference trusts the actual save ACK`, async t => {
        const { h } = harness(t, group);
        const references = createChatReferencePort(createSillyTavernChatMetadataAdapter());
        assert.equal((await references.install(references.capture(), { formatVersion: 1, osId: 'os-1' })).status, 'confirmed');
        assert.equal(h.reads.length, 0); assert.equal(h.saves.length, 1);
        assert.equal(h.remote[0].chat_metadata.extensions.LittleWhiteBox.xiaobaiOsRef.osId, 'os-1');
    });
}

test('a slow save survives 15 seconds and APP cancellation after dispatch without resending', async t => {
    const { h, port, input } = harness(t);
    t.mock.timers.enable({ apis: ['setTimeout'] });
    let release;
    h.upload = () => new Promise(resolve => { release = resolve; });
    let current = true, finished = false;
    const saving = port.publish({ ...input(1), guard: () => current }).then(value => { finished = true; return value; });
    while (!release) { await Promise.resolve(); }
    current = false;
    t.mock.timers.tick(20_000);
    await Promise.resolve();
    assert.equal(finished, false); assert.equal(h.saves.length, 1); assert.equal(h.reads.length, 0);
    release(new Response('{"ok":true}'));
    assert.equal(await saving, true);
});

test('a queued native save cannot write to a newly selected chat', async t => {
    const { h } = harness(t);
    let release;
    h.upload = () => new Promise(resolve => { release = resolve; });
    const first = saveSillyTavernChat(() => true);
    while (!release) { await Promise.resolve(); }
    const queued = saveSillyTavernChat(() => true);
    host.identity = 'other'; host.context = { ...host.context, chatId: 'other', chat: [] };
    release(new Response('{"ok":true}'));
    assert.equal((await first).status, 'confirmed');
    assert.equal((await queued).status, 'failed');
    assert.equal(h.saves.length, 1);
});

test('a confirmation finishing after switching chats cannot confirm the new chat', async t => {
    const { h, port, input } = harness(t);
    const first = input(1); h.mode = 'lost-response'; await port.publish(first);
    t.mock.method(globalThis, 'fetch', async () => {
        host.identity = 'another'; host.context = { ...host.context, chat: [], chatId: 'another' };
        return new Response(JSON.stringify(h.remote));
    });
    assert.equal(await port.confirm('chat', first.marker, first.text), false);
});
