import assert from 'node:assert/strict';
import { test } from 'node:test';
import { entry, uiEntry } from './helpers/story-summary-entry.js';
import { SUMMARY_TRANSFER_COPY } from '../transfer-copy.js';
import { SUMMARY_MEMORY_PACKAGE, readSummaryPackageData } from '../data/summary-import.js';
import { normalizeCharacterAliases } from '../data/character-aliases.js';
import { normalizeEventMemoryRole } from '../data/events.js';
import { memorySaveError } from '../data/memory-copy.js';
import { getChatIdentity } from '../data/chat-identity.js';

// Acceptance contracts:
// - Downloaded files round-trip all portable memory, without old floor ownership (silent data loss / wrong source).
// - Cancelled selection/confirmation never submits an import; reselecting the same file works (unintended overwrite).
// - An import stays bound to the selected chat through confirmation, queueing and file reads (wrong-chat data loss).
// - Unreadable/malformed files and busy generation never overwrite memory (data loss).
test('downloaded JSON round-trips memory without carrying old floor ownership', async () => {
    const json = {
        keywords: [{ text: '信物', weight: '高', _addedAt: 99 }],
        events: [{ id: 'e-1', title: '相逢', timeLabel: '春', summary: '在桥上相逢。 (#90-100)', participants: ['小雪'], memoryRole: '具体经历', causedBy: [], _addedAt: 99 }],
        characters: { main: [{ name: '小雪', _addedAt: 99 }] },
        characterAliases: [{ from: '旅人', to: '小雪', evidence: '她说出了名字', _addedAt: 99 }],
        arcs: [{ name: '小雪', trajectory: '愿意信任', progress: 0.5, moments: [{ text: '交付信物', _addedAt: 99 }], _addedAt: 99 }],
        facts: [{ id: 'f-1', s: '小雪', p: '物品', o: '信物', _isState: true, trend: '持平', _addedAt: 99 }],
    };
    const before = structuredClone(json);
    let blob, clicked = false, removed = false, revoked = false;
    const link = { click() { clicked = true; }, remove() { removed = true; } };
    const api = entry(['downloadSummaryMemoryPackage', 'buildSummaryExportPackage', 'cloneSummaryJsonForPortability',
        'stripFloorMarker', 'normalizeInternalFact', 'normalizePortableFact', 'serializePortableFact', 'extractSummaryImportJson'], {
        SUMMARY_TRANSFER_COPY, SUMMARY_MEMORY_PACKAGE, readSummaryPackageData, normalizeCharacterAliases, normalizeEventMemoryRole,
        getContext: () => ({ chatId: '测试/聊天' }), getSummaryStore: () => ({ json }), Blob,
        URL: { createObjectURL(value) { blob = value; return 'blob:test'; }, revokeObjectURL() { revoked = true; } },
        document: { createElement: () => link, body: { appendChild() {} } },
    });
    api.downloadSummaryMemoryPackage();
    assert.ok(clicked && removed && revoked);
    const payload = JSON.parse(await blob.text());
    assert.equal(payload.type, SUMMARY_MEMORY_PACKAGE.type);
    const imported = JSON.parse(JSON.stringify(api.extractSummaryImportJson(payload)));
    assert.deepEqual(imported, {
        keywords: [{ text: '信物', weight: '高' }],
        events: [{ id: 'e-1', title: '相逢', timeLabel: '春', summary: '在桥上相逢。', participants: ['小雪'], memoryRole: '具体经历', causedBy: [] }],
        characters: { main: [{ name: '小雪' }] },
        characterAliases: [{ from: '旅人', to: '小雪', evidence: '她说出了名字' }],
        arcs: [{ name: '小雪', trajectory: '愿意信任', progress: 0.5, moments: [{ text: '交付信物' }] }],
        facts: [{ id: '', s: '小雪', p: '物品', o: '信物', _isState: true, trend: '持平' }],
    });
    assert.equal(imported.events[0].summary, '在桥上相逢。');
    assert.equal(JSON.stringify(payload).includes('_addedAt'), false);
    assert.deepEqual(json, before);
});

test('a chat without a summary can import; cancellation and reselection preserve the selected chat', async () => {
    const nodes = new Map(), messages = [], picks = [];
    const $ = id => { if (!nodes.has(id)) nodes.set(id, {}); return nodes.get(id); };
    let confirmed = false;
    const ui = uiEntry(['initSummaryIOUI'], {
        $, SUMMARY_TRANSFER_COPY, currentTimelineChatId: '', currentChatSummaryState: { chatId: 'source-chat', chatIdentity: 'source-owner' },
        document: { createElement() { const input = { click() {} }; picks.push(input); return input; } },
        showConfirm: async () => confirmed,
        postMsg: (type, data) => messages.push({ type, ...data }),
    });
    ui.initSummaryIOUI();
    $('btn-import-summary').onclick();
    await picks.at(-1).onchange();
    assert.equal(messages.length, 0);
    const file = new File(['{}'], 'memory.json');
    for (let i = 0; i < 2; i++) {
        $('btn-import-summary').onclick();
        picks.at(-1).files = [file];
        await picks.at(-1).onchange();
        assert.equal(messages.length, 0);
        assert.equal($('btn-import-summary').disabled, false);
    }
    $('btn-import-summary').onclick();
    picks.at(-1).files = [file];
    ui.currentChatSummaryState = { chatId: 'other-chat', chatIdentity: 'other-owner' };
    confirmed = true;
    await picks.at(-1).onchange();
    assert.equal(messages.length, 1);
    assert.equal(messages[0].chatId, 'source-chat');
    assert.equal(messages[0].chatIdentity, 'source-owner');
    assert.equal(messages[0].file, file);
});

function hostHarness({ busy = false, queue = task => task() } = {}) {
    const selectedContext = { chatId: 'selected-chat', characterId: 0, characters: [{ avatar: 'A.png' }] };
    let context = selectedContext, replaced = 0;
    const messages = [];
    let finish;
    const result = new Promise(resolve => { finish = resolve; });
    const api = entry(['handleFrameMessage'], {
        SUMMARY_TRANSFER_COPY, document: { getElementById() {} }, isTrustedMessage: () => true,
        guard: { isAnyRunning: () => busy }, getContext: () => context, getChatIdentity,
        VECTOR_WRITE_SCOPES: { IO: 'io' }, runVectorWriteTask: (_descriptor, task) => queue(task),
        changeRecallData: (_id, task) => { replaced++; return task(); },
        importSummaryMemoryPackage: async () => ({ counts: { events: 1, facts: 1 } }),
        notifyStorySummaryChatState() {}, memorySaveError,
        postToFrame: data => { messages.push(data); finish(data); },
    });
    return {
        api, result, messages, replaced: () => replaced,
        switchChat(sameChatId = false) {
            context = { chatId: sameChatId ? selectedContext.chatId : 'other-chat', characterId: 0, characters: [{ avatar: 'B.png' }] };
        },
        send: file => api.handleFrameMessage({ data: {
            type: 'SUMMARY_IMPORT_FILE', chatId: selectedContext.chatId,
            chatIdentity: getChatIdentity(selectedContext), file,
        } }),
    };
}

for (const stage of ['before', 'queued', 'reading', 'same filename']) test(`chat switch ${stage} cannot overwrite another chat`, async () => {
    let host;
    host = hostHarness({ queue: task => { if (stage === 'queued') host.switchChat(); return task(); } });
    if (stage === 'before') host.switchChat();
    await host.send({ async text() {
        if (stage === 'reading') host.switchChat();
        if (stage === 'same filename') host.switchChat(true);
        return '{}';
    } });
    assert.equal((await host.result).success, false);
    assert.equal(host.messages.at(-1).error, SUMMARY_TRANSFER_COPY.chatChanged);
    assert.equal(host.replaced(), 0);
});

test('read failure and busy tasks do not replace memory; normal files reach the existing importer', async () => {
    for (const mode of ['unreadable', 'busy', 'normal']) {
        const host = hostHarness({ busy: mode === 'busy' });
        await host.send({ async text() { if (mode === 'unreadable') throw new Error('fixture read failure'); return '{}'; } });
        assert.equal((await host.result).success, mode === 'normal');
        if (mode === 'unreadable') assert.equal(host.messages.at(-1).error, SUMMARY_TRANSFER_COPY.readFailed);
        assert.equal(host.replaced(), mode === 'normal' ? 1 : 0);
    }
});

test('empty, malformed and unrelated JSON fail before reading or changing current memory', async () => {
    let memoryRead = false;
    const api = entry(['importSummaryMemoryPackage', 'extractSummaryImportJson'], {
        readSummaryPackageData, getSummaryStore() { memoryRead = true; },
    });
    for (const [text, code] of [['', 'summary_import_empty'], ['{', 'summary_import_json'], ['{}', 'summary_import_unsupported']]) {
        await assert.rejects(api.importSummaryMemoryPackage(text, 'selected-chat'), error => error.code === code);
        assert.equal(memoryRead, false);
    }
});
