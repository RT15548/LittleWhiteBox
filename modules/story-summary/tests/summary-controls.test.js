import assert from 'node:assert/strict';
import { test } from 'node:test';
import { entry, uiEntry } from './helpers/story-summary-entry.js';
import { SUMMARY_FEEDBACK_COPY } from '../feedback-copy.js';
import { ARCHIVE_COPY } from '../archive-view.js';

// Acceptance: a failed run cannot revoke retry/hiding or strand cancellation.
// Cost: unusable summaries and repeated model requests. Execute real handlers.
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
        $, SUMMARY_FEEDBACK_COPY, ARCHIVE_COPY, PARENT_ORIGIN: 'test', window: { parent }, document: { activeElement: null },
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
        assert.equal(p.$('hide-summarized').disabled, true);
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
    const frame = { contentWindow: {} };
    const noop = () => {};
    const host = entry(['postToFrame', 'handleFrameMessage', 'lastSummaryStatus', 'summaryStatusSequence'], {
        document: { getElementById: () => frame }, frameReady: true, pendingFrameMessages: [],
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
});
