import assert from 'node:assert/strict';
import { test } from 'node:test';
import { entry, uiEntry } from './helpers/story-summary-entry.js';
import { SUMMARY_FEEDBACK_COPY } from '../feedback-copy.js';
import { ARCHIVE_COPY } from '../archive-view.js';
import { WORKSPACE_COPY } from '../workspace-copy.js';
import { summaryFailureReason } from '../summary-failure.js';
import { getChatIdentity } from '../data/chat-identity.js';
import { createSummaryDiagnostics } from '../summary-diagnostics.js';
import { connectionError } from '../../text-api/runtime.js';

// Acceptance: a failed run cannot revoke retry/hiding or strand cancellation.
// Cost: unusable summaries and repeated model requests. Execute real handlers.
// Acceptance: final errors retain the reason without exposing API credentials or request objects.
// Cost: repeated paid requests with no diagnosis / leaked credentials.
test('provider failure remains diagnosable after credential redaction and final panel rendering', () => {
    const apiKey = 'test/private+key';
    const error = connectionError(new Error(`HTTP 429 quota exceeded: ${apiKey} ${encodeURIComponent(apiKey)} Authorization: Bearer header-secret api_key=query-secret`), { apiKey });
    error.request = { headers: { authorization: 'request-secret' } };
    const p = panel();
    const execution = { chatId: 'test-chat', controller: new AbortController() };
    execution.identity = getChatIdentity(execution);
    const host = entry(['reportSummaryExecutionFailure', 'postSummaryExecution'], {
        activeSummaryExecution: execution, getContext: () => ({ chatId: execution.chatId }), getChatIdentity,
        getMemoryCommitState: () => 'ready', SUMMARY_FEEDBACK_COPY, summaryFailureReason, isSummaryGenerationCancelledError: () => false,
        xbLog: { error() {} }, MODULE_ID: 'test', postToFrame: p.send,
    });
    host.reportSummaryExecutionFailure(execution, error);
    const visible = p.$('summary-status').textContent;
    assert.ok(visible.includes('HTTP 429 quota exceeded'));
    for (const secret of [apiKey, encodeURIComponent(apiKey), 'header-secret', 'query-secret', 'request-secret']) {
        assert.equal(visible.includes(secret), false);
    }
    assert.equal(p.$('summary-notice').hidden, false);
});

test('save confirmation failure retains its underlying status and reason, not its request', () => {
    const cause = Object.assign(new Error('upstream unavailable api_key=private-key'), {
        status: 503, request: { headers: { authorization: 'request-secret' } },
    });
    const reason = summaryFailureReason(Object.assign(new Error('metadata_save_unconfirmed', { cause }), {
        code: 'metadata_save_unconfirmed', uncertain: true,
    }));
    assert.ok(reason.includes('upstream unavailable'));
    assert.ok(reason.includes('503'));
    assert.equal(reason.includes('private-key'), false);
    assert.equal(reason.includes('request-secret'), false);
});

function panel() {
    const nodes = new Map(), messages = [], parent = {};
    const $ = id => {
        if (!nodes.has(id)) nodes.set(id, {
            disabled: false, checked: false, textContent: '', hidden: false,
            classList: { toggle() {} }, setAttribute() {},
        });
        return nodes.get(id);
    };
    const ui = uiEntry(['canUseCurrentChatControls', 'syncCurrentChatSummaryControls', 'syncVectorBoundaryControl', 'renderSummaryStatus',
        'bindSummaryActions', 'handleParentMessage'], {
        $, SUMMARY_FEEDBACK_COPY, ARCHIVE_COPY, WORKSPACE_COPY, PARENT_ORIGIN: 'test', window: { parent }, document: { activeElement: null },
        cleanActionState: { canRollback: false }, isBusyLike: () => false,
        currentChatSummaryState: {}, summaryStatusId: 0, localGenerating: false,
        config: { api: {}, gen: {}, trigger: {}, vector: { enabled: true }, ui: { hideSummarized: true } },
        postMsg: (type, data) => messages.push({ type, ...data }),
    });
    ui.bindSummaryActions();
    const send = data => ui.handleParentMessage({ origin: 'test', source: parent, data: { source: 'LittleWhiteBox', ...data } });
    const state = overrides => send({ type: 'CHAT_SUMMARY_STATE', state: {
        hasChat: true, chatEnabled: true, effectiveEnabled: true, changing: false, ...overrides,
    } });
    return { ui, $, messages, send, state };
}

test('unavailable snapshot followed by failure and finish leaves retry and hiding operable', () => {
    const p = panel();
    p.state({ consumable: false });
    p.send({ type: 'SUMMARY_ERROR', message: 'failure', statusId: 1 });
    p.send({ type: 'GENERATION_STATE', isGenerating: false });
    assert.equal(p.$('btn-generate').disabled, false);
    assert.equal(p.$('hide-summarized').disabled, false);
    p.$('btn-generate').onclick();
    assert.equal(p.messages.at(-1).type, 'REQUEST_GENERATE');
    assert.equal(p.ui.localGenerating, true);
    p.$('btn-generate').onclick();
    assert.equal(p.messages.at(-1).type, 'REQUEST_CANCEL');
    assert.equal(p.ui.localGenerating, true); // Do not offer a new run before host settlement.
});

for (const state of [{ hasChat: false }, { effectiveEnabled: false }, { changing: true }]) {
    test(`running stop remains operable while controls are unavailable: ${JSON.stringify(state)}`, () => {
        const p = panel(); p.state(state);
        assert.equal(p.$('btn-generate').disabled, true);
        assert.equal(p.$('hide-summarized').disabled, false); // Global settings remain editable without a current chat.
        p.send({ type: 'GENERATION_STATE', isGenerating: true });
        assert.equal(p.$('btn-generate').disabled, false);
        p.$('btn-generate').onclick();
        assert.equal(p.messages.at(-1).type, 'REQUEST_CANCEL');
        p.send({ type: 'GENERATION_STATE', isGenerating: false });
        assert.equal(p.$('btn-generate').disabled, true);
    });
}

test('dismissal clears host cache, survives frame reopen, and cannot dismiss a newer error', async () => {
    const p = panel(); p.state();
    const summaryDiagnostics = createSummaryDiagnostics();
    const diagnosticId = summaryDiagnostics.begin(summaryDiagnostics.startRun('owner', false));
    summaryDiagnostics.finish(diagnosticId, { success: false, error: new Error('fixture failure') });
    const diagnosticsBefore = summaryDiagnostics.read('owner');
    const frame = { contentWindow: {} };
    const noop = () => {};
    const host = entry(['postToFrame', 'handleFrameMessage', 'lastSummaryStatus', 'summaryStatusSequence'], {
        document: { getElementById: () => frame }, frameReady: true, pendingFrameMessages: [], summaryDiagnostics,
        isTrustedMessage: () => true, postToIframe: (_frame, data) => p.send(data),
        flushPendingFrameMessages: noop, notifySummaryState: noop, sendSavedConfigToFrame: noop,
        sendVectorConfigToFrame: noop, sendVectorStatsToFrame: noop, sendAnchorStatsToFrame: noop,
        notifyStorySummaryChatState: noop,
    });
    host.postToFrame({ type: 'SUMMARY_ERROR', message: 'first' });
    p.$('btn-dismiss-summary').onclick();
    const firstDismiss = p.messages.at(-1);
    await host.handleFrameMessage({ data: firstDismiss });
    assert.equal(p.$('summary-notice').hidden, true);
    await host.handleFrameMessage({ data: { type: 'FRAME_READY' } });
    assert.equal(p.$('summary-notice').hidden, true);
    host.postToFrame({ type: 'SUMMARY_ERROR', message: 'second' });
    await host.handleFrameMessage({ data: firstDismiss });
    assert.equal(p.$('summary-notice').hidden, false);
    assert.equal(p.$('btn-dismiss-summary').hidden, false);
    p.$('btn-dismiss-summary').onclick();
    await host.handleFrameMessage({ data: p.messages.at(-1) });
    assert.equal(p.$('summary-notice').hidden, true);
    assert.deepEqual(summaryDiagnostics.read('owner'), diagnosticsBefore);
});
