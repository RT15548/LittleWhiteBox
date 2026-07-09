import 'fake-indexeddb/auto';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import db, {
    appendTavernMessage,
    createTavernSession,
    getTavernMessage,
    getTavernSession,
    tavernMetaTable,
} from '../shared/session-db';
import {
    resetTavernWorldbookCache,
    stripWorldbookFieldsFromSnapshot,
    TAVERN_WORLDBOOK_CACHE_RESET_META_KEY,
    TAVERN_WORLDBOOK_CACHE_RESET_VERSION,
} from '../shared/worldbook-cache-reset';

function staleContext() {
    return {
        character: { characterKey: 'char-a', name: 'Aster' },
        authorNote: { prompt: 'keep author note' },
        worldBooks: [{ name: 'Stale', entries: [{ content: 'stale entry' }] }],
        worldEntries: [{ uid: 'stale-entry', content: 'stale entry' }],
        sessionMeta: {
            worldbookSources: [{ name: 'Stale', sourceType: 'global' }],
            worldbookNames: ['Stale'],
            keepMe: 'yes',
        },
    };
}

function staleBuildSnapshot() {
    return {
        chatPresetId: 'preset',
        rawMessagesJson: '[{"content":"stale worldbook prompt"}]',
        worldBooks: [{ name: 'Stale', entries: 1 }],
        activatedWorldEntries: [{ sourceWorldBook: 'Stale', title: 'Entry' }],
        nativeWorldInfo: { sourceNames: [{ name: 'Stale', sourceType: 'global' }] },
        messageLayers: [{ role: 'system', content: 'stale worldbook layer' }],
    };
}

test('resetTavernWorldbookCache clears current session worldbook metadata without deleting chat content', async () => {
    await db.delete();
    await db.open();
    const session = await createTavernSession({
        title: 'Stale worldbooks',
        contextSnapshot: staleContext(),
        buildSnapshot: staleBuildSnapshot() as never,
        state: {
            activeMapDocId: 'atlas',
            worldEntryStates: { stale: { stickyUntilTurn: 4 } },
            nativeWorldInfoTimedState: { sticky: { stale: { hash: 1 } }, cooldown: { stale: { hash: 2 } } },
            lastRequestSnapshot: {
                rawRequestJson: '{"messages":[{"content":"stale worldbook prompt"}]}',
                provider: 'keep-provider',
            },
        },
    });
    await appendTavernMessage(session.id, {
        role: 'assistant',
        content: '正文不应该被清理。',
        contextSnapshot: staleContext(),
        buildSnapshot: staleBuildSnapshot() as never,
        requestSnapshot: {
            provider: 'keep-provider',
            rawRequestJson: '{"messages":[{"content":"stale worldbook prompt"}]}',
            requestInspection: {
                transport: 'openai',
                request: {
                    messages: [{ role: 'system', content: 'stale worldbook prompt' }],
                },
            },
            nativeWorldInfo: { sourceNames: [{ name: 'Stale' }] },
        },
    });
    const beforeResetSession = await getTavernSession(session.id);

    const result = await resetTavernWorldbookCache({ sessionId: session.id, mode: 'manual' });
    assert.equal(result.sessions, 1);
    assert.equal(result.messages, 1);

    const updatedSession = await getTavernSession(session.id);
    assert.deepEqual(updatedSession?.contextSnapshot?.worldBooks, []);
    assert.deepEqual(updatedSession?.contextSnapshot?.worldEntries, []);
    assert.deepEqual(updatedSession?.contextSnapshot?.sessionMeta?.worldbookSources, []);
    assert.deepEqual(updatedSession?.contextSnapshot?.sessionMeta?.worldbookNames, []);
    assert.equal(updatedSession?.contextSnapshot?.sessionMeta?.keepMe, 'yes');
    assert.equal(updatedSession?.contextSnapshot?.authorNote?.prompt, 'keep author note');
    assert.equal(updatedSession?.updatedAt, beforeResetSession?.updatedAt);
    assert.deepEqual(updatedSession?.state?.worldEntryStates, {});
    assert.deepEqual(updatedSession?.state?.nativeWorldInfoTimedState, { sticky: {}, cooldown: {} });
    assert.equal('lastRequestSnapshot' in (updatedSession?.state || {}), false);
    assert.equal(updatedSession?.state?.activeMapDocId, 'atlas');
    assert.equal(updatedSession?.buildSnapshot?.rawMessagesJson, undefined);
    assert.equal(updatedSession?.buildSnapshot?.messageLayers, undefined);
    assert.equal(updatedSession?.buildSnapshot?.nativeWorldInfo, undefined);

    const updatedMessage = await getTavernMessage(session.id, 0);
    assert.equal(updatedMessage?.content, '正文不应该被清理。');
    assert.equal(updatedMessage?.role, 'assistant');
    assert.equal(updatedMessage?.order, 0);
    assert.deepEqual(updatedMessage?.contextSnapshot?.worldBooks, []);
    assert.equal(updatedMessage?.buildSnapshot?.rawMessagesJson, undefined);
    assert.equal(updatedMessage?.buildSnapshot?.messageLayers, undefined);
    assert.equal((updatedMessage?.requestSnapshot as { provider?: string })?.provider, 'keep-provider');
    assert.equal((updatedMessage?.requestSnapshot as { rawRequestJson?: string })?.rawRequestJson, undefined);
    assert.equal((updatedMessage?.requestSnapshot as { requestInspection?: unknown })?.requestInspection, undefined);
    assert.equal((updatedMessage?.requestSnapshot as { nativeWorldInfo?: unknown })?.nativeWorldInfo, undefined);
});

test('migration reset runs once and records a meta version', async () => {
    await db.delete();
    await db.open();
    const first = await createTavernSession({
        title: 'First stale session',
        contextSnapshot: staleContext(),
    });

    const firstResult = await resetTavernWorldbookCache({ mode: 'migration' });
    assert.equal(firstResult.skipped, false);
    assert.equal(firstResult.version, TAVERN_WORLDBOOK_CACHE_RESET_VERSION);
    assert.deepEqual((await getTavernSession(first.id))?.contextSnapshot?.worldBooks, []);
    assert.equal((await getTavernSession(first.id))?.updatedAt, first.updatedAt);
    assert.equal((await tavernMetaTable.get(TAVERN_WORLDBOOK_CACHE_RESET_META_KEY))?.value, TAVERN_WORLDBOOK_CACHE_RESET_VERSION);

    const second = await createTavernSession({
        title: 'Second stale session',
        contextSnapshot: staleContext(),
    });
    const secondResult = await resetTavernWorldbookCache({ mode: 'migration' });
    assert.equal(secondResult.skipped, true);
    assert.deepEqual((await getTavernSession(second.id))?.contextSnapshot?.worldBooks, staleContext().worldBooks);
});

test('snapshot sanitizer removes only known worldbook cache keys', () => {
    const sanitized = stripWorldbookFieldsFromSnapshot({
        content: '正文保留',
        messages: [{ role: 'system', content: '消息结构保留' }],
        rawRequestJson: '{"stale":true}',
        nested: {
            worldInfoBefore: 'stale',
            provider: 'keep',
        },
    });
    assert.deepEqual(sanitized, {
        content: '正文保留',
        messages: [{ role: 'system', content: '消息结构保留' }],
        nested: {
            provider: 'keep',
        },
    });
});

test('/xbwireset is intercepted before the host slash-command bridge', async () => {
    const source = await readFile(new URL('../app-src/App.vue', import.meta.url), 'utf8');
    const resetIndex = source.indexOf('isTavernWorldbookCacheResetCommand(messageText)');
    const hostIndex = source.indexOf("requestHost('xb-tavern:run-slash-command'");
    assert.notEqual(resetIndex, -1);
    assert.notEqual(hostIndex, -1);
    assert.ok(resetIndex < hostIndex);
    assert.match(source, /await runManualTavernWorldbookCacheReset\(\);\s*return '';/);
});

test('/xbwireset refreshes cleaned local UI before treating ST live sync as optional', async () => {
    const source = await readFile(new URL('../app-src/App.vue', import.meta.url), 'utf8');
    assert.match(source, /const cleanedSession = await getTavernSession\(sessionId\);[\s\S]*sessionController\.updateSessionRecord\(cleanedSession\);[\s\S]*applySessionSnapshotContext\(cleanedSession\);[\s\S]*await loadSelectedSessionMessageWindow\(\{ reset: true, sessionId \}\);/);
    assert.match(source, /try \{[\s\S]*await syncSessionCharacterContext\(\{ sessionId, force: true \}\);[\s\S]*\} catch \(error\) \{[\s\S]*syncError = error;[\s\S]*setSelectedSessionCharacterError\(error, sessionId\);[\s\S]*\}/);
    assert.match(source, /重新读取 ST 当前状态失败/);
});
