import assert from 'node:assert/strict';
import test from 'node:test';
import { createMessagesMedia } from '../apps/messages/host/media-adapter.js';
import { createHostPromptContextAdapter } from '../host/prompt-context/capture.js';
import { createMessageId } from '../apps/messages/application/identity.js';
import { privateMessageScan } from '../apps/messages/prompt/world-info-scan.js';
import { privateMessagesStableEnd } from '../apps/messages/application/summary-boundary.js';
import { registerSummarySourceBoundary, getSummarySourceEnd } from '../../story-summary/generate/source-boundary.js';
import { PRIVATE_MESSAGE_MARKER } from '../apps/messages/application/projection.js';

test('message identities work without secure-context Web Crypto APIs on LAN HTTP', () => {
    const original = Object.getOwnPropertyDescriptor(globalThis, 'crypto');
    const getRandomValues = globalThis.crypto.getRandomValues.bind(globalThis.crypto);
    Object.defineProperty(globalThis, 'crypto', { configurable: true, value: { getRandomValues } });
    try {
        const ids = Array.from({ length: 100 }, () => createMessageId());
        assert.equal(new Set(ids).size, 100);
        assert.ok(ids.every(id => /^[a-f0-9]{32}$/u.test(id)));
    } finally {Object.defineProperty(globalThis, 'crypto', original);}
});

// These exercise public asynchronous ports: closing while cache lookup is pending
// must not start a paid generation, and failed replacement playback must clear UI.
test('closing media during cache lookup prevents subsequent generation and late results', async () => {
    let release; let calls = 0;
    const media = createMessagesMedia(() => ({ xiaobaixDraw: {
        getStatus: () => ({ enabled: true, ready: true }),
        checkGeneratedImageCache: () => new Promise(resolve => {release = resolve;}),
        generateSharedImage: async () => {calls++; return 'AAAA';},
    } }));
    const pending = media.image({ id: 'image', payload: { type: 'image', description: '茶杯' } }, { requestId: 'closing' });
    media.cancelAll(); release(null);
    await assert.rejects(pending, /media_cancelled/);
    assert.equal(calls, 0);
});

test('voice replacement reports stopped before unavailable playback and ignores late callbacks', () => {
    let enabled = true; let notify; let stops = 0;
    const states = [];
    const media = createMessagesMedia(() => ({ xiaobaixTts: {
        isEnabled: () => enabled,
        playTransient: (_text, _emotion, options) => {notify = options.onState; notify('playing'); return { stop() {stops++;} };},
    } }));
    const voice = { id: 'voice', payload: { type: 'voice', transcript: '等你。' } };
    media.play(voice, state => states.push(state));
    enabled = false;
    assert.throws(() => media.play(voice, () => undefined), /voice_unavailable/);
    notify('playing');
    assert.deepEqual(states, ['playing', 'stopped']); assert.equal(stops, 1);
});

test('optional media failures and unsafe cached image URLs do not break text communications', async () => {
    const absent = createMessagesMedia(() => ({ xiaobaixDraw: { getStatus() {throw new Error('unavailable');} } }));
    assert.deepEqual(absent.capabilities(), { image: false, voice: false });
    const media = createMessagesMedia(() => ({ xiaobaixDraw: {
        getStatus: () => ({ enabled: true, ready: true }),
        checkGeneratedImageCache: async () => 'https://untrusted.example/tracker.png',
        generateSharedImage: async () => 'AAAA',
    } }));
    assert.equal(await media.image({ id: 'image', payload: { type: 'image', description: '茶杯' } }, { requestId: 'unsafe-cache' }), 'data:image/png;base64,AAAA');
});

test('excluded communications stay out of recent story and worldbook scanning without renumbering or changing turn count', async () => {
    let scanned;
    const context = { chatId: 'chat', characterId: 0, characters: [],
        chat: [{ is_user: false, mes: '普通剧情' }, { is_user: false, mes: '其他人的私人通讯' }, { is_user: true, mes: '新的行动' }],
        getWorldInfoPrompt: async messages => {scanned = messages; return {};},
    };
    const adapter = createHostPromptContextAdapter({ readContext: () => context, readStoryEvents: async () => '' });
    const result = await adapter.capture({ excludeMessageIndices: [1] });
    assert.deepEqual(scanned, ['新的行动', '普通剧情']);
    assert.deepEqual(result.contextSnapshot.recentMessages.map(message => message.index), [0, 2]);
    assert.equal(result.assistantCount, 2);
    await adapter.capture();
    assert.deepEqual(scanned, ['新的行动', '其他人的私人通讯', '普通剧情']);
});

test('current contact and private dialogue activate lore without leaking another contact or duplicating recent prose', async () => {
    const contact = { name: '林月', note: '花店店主' };
    const incoming = { from: '玩家', payload: { type: 'text', text: '明天见？' } };
    const history = [{ from: '林月', payload: { type: 'voice', transcript: '在白鹭码头等我。' } }];
    let scan;
    const host = { chatId: 'chat', characterId: 0, characters: [],
        chat: [{ is_user: false, mes: '在公司加班。' }, { is_user: false, mes: '另一联系人私聊的绝密暗号' }],
        getWorldInfoPrompt: async messages => {scan = messages; return { worldInfoBefore: messages.some(text => text.includes('林月')) ? '林月的人设' : '' };},
    };
    const adapter = createHostPromptContextAdapter({ readContext: () => host, readStoryEvents: () => '' });
    const result = await adapter.capture({ excludeMessageIndices: [1], worldInfoScanMessages: privateMessageScan(contact, history, incoming) });
    assert.equal(result.contextSnapshot.worldInfo.before, '林月的人设');
    assert.deepEqual(scan, ['林月（花店店主）\n玩家: 明天见？', '林月: 在白鹭码头等我。', '在公司加班。']);
    assert.deepEqual(result.contextSnapshot.recentMessages.map(message => message.text), ['在公司加班。']);
    assert.equal(result.assistantCount, 2);
});

test('summary source ownership defers an extending tail across replies and reopening, then includes all of it after story continues', () => {
    const chat = [{ mes: '普通剧情' }, { mes: '第一条私人消息', extra: { [PRIVATE_MESSAGE_MARKER]: { version: 1, segmentId: 'now', throughSeq: 1, digest: 'a'.repeat(64) } } }];
    const release = registerSummarySourceBoundary(privateMessagesStableEnd);
    try {
        assert.equal(getSummarySourceEnd(chat, 1), 0);
        chat[1].mes += '\n角色回复\n新约定';
        assert.equal(getSummarySourceEnd(chat, 1), 0);
        assert.equal(getSummarySourceEnd(structuredClone(chat), 1), 0);
        chat.push({ is_user: true, mes: '按刚才的约定出发。' });
        assert.equal(getSummarySourceEnd(chat, 1), 1);
        assert.equal(getSummarySourceEnd(chat, 2), 2);
        assert.equal(getSummarySourceEnd(chat, 0), 0);
        assert.equal(getSummarySourceEnd([], -1), -1);
    } finally {release();}
    chat.pop();
    assert.equal(getSummarySourceEnd(chat, 1), 1);
});
