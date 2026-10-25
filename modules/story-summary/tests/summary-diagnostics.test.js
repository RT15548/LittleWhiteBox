import assert from 'node:assert/strict';
import test from 'node:test';
import { createSummaryDiagnostics, SUMMARY_DIAGNOSTIC_LIMIT, SUMMARY_DIAGNOSTIC_REASON_CHARS } from '../summary-diagnostics.js';
import { getChatIdentity } from '../data/chat-identity.js';
import { entry } from './helpers/story-summary-entry.js';

// Acceptance: records are bounded, chat-isolated and cleared with their owner;
// late completions cannot resurrect cleared records. Cost: cross-chat disclosure.
// Acceptance: diagnostic errors expose only redacted reasons, never attached API
// requests, and clearly identify truncation. Cost: credential disclosure / false diagnosis.
test('bounded journal isolates same-filename chats and makes incomplete coverage explicit', () => {
    const journal = createSummaryDiagnostics();
    const first = getChatIdentity({ chatId: 'same', characterId: 1 });
    const second = getChatIdentity({ chatId: 'same', characterId: 2 });
    assert.equal(journal.read(first).scope, 'page_session');
    assert.equal(journal.read(first).total, 0);
    const run = journal.startRun(first, true);
    const id = journal.begin(run);
    journal.progress(id, { stage: 'request', range: { from: 1, to: 20 } });
    assert.equal(journal.read(second).total, 0);
    const error = Object.assign(new Error('HTTP 429 api_key=private-key Bearer header-secret'), {
        request: { body: 'private dialogue', headers: { authorization: 'private-auth' } },
    });
    journal.finish(id, { success: false, error });
    const snapshot = journal.read(first);
    snapshot.attempts[0].range.from = 999;
    assert.equal(journal.read(first).attempts[0].range.from, 1);
    for (const secret of ['private-key', 'header-secret', 'private dialogue', 'private-auth']) {
        assert.equal(JSON.stringify(snapshot).includes(secret), false);
    }
    for (let i = 0; i < SUMMARY_DIAGNOSTIC_LIMIT; i++) {
        const attempt = journal.begin(run);
        journal.finish(attempt, { success: false, error: new Error('x'.repeat(SUMMARY_DIAGNOSTIC_REASON_CHARS + 1)) });
    }
    const page = journal.read(first, { limit: 20 });
    assert.equal(page.total, SUMMARY_DIAGNOSTIC_LIMIT);
    assert.equal(page.historyMayBeTruncated, true);
    assert.equal(page.attempts[0].reasonTruncated, true);
    assert.equal(page.attempts[0].reason.length, SUMMARY_DIAGNOSTIC_REASON_CHARS);
    assert.equal(journal.read(first, { offset: page.next, limit: 20 }).next, null);
    const pending = journal.begin(run);
    journal.clear();
    journal.finish(pending, { success: true, committed: true });
    assert.equal(journal.read(first).total, 0);
    assert.equal(journal.read(first).historyMayBeTruncated, false);
});

// Acceptance: a filename-only deletion event cannot erase another owner's
// diagnostic history. Cost: losing the evidence needed to explain a failure.
test('host chat deletion preserves page diagnostics across same-filename owners', async () => {
    const summaryDiagnostics = createSummaryDiagnostics();
    const identities = [getChatIdentity({ chatId: 'same', characterId: 1 }),
        getChatIdentity({ chatId: 'same', characterId: 2 }), getChatIdentity({ chatId: 'same', groupId: 1 })];
    for (const identity of identities) {
        const id = summaryDiagnostics.begin(summaryDiagnostics.startRun(identity, false));
        summaryDiagnostics.finish(id, { success: false, error: new Error(identity) });
    }
    const before = identities.map(identity => summaryDiagnostics.read(identity));
    const cleaned = [];
    const host = entry(['handleChatDeleted'], {
        summaryDiagnostics, logRecallRuntimeCheckpoint() {}, clearWarningCooldownsForChat() {},
        waitForVectorWrites: async () => {}, clearChatData: async chatId => cleaned.push(chatId),
        messageSources: { forget() {} }, getBackupFilename: chatId => chatId,
        deleteServerBackup: async () => {}, xbLog: { info() {} }, MODULE_ID: 'fixture',
    });
    await host.handleChatDeleted('same');
    assert.deepEqual(cleaned, ['same']);
    assert.deepEqual(identities.map(identity => summaryDiagnostics.read(identity)), before);
});
