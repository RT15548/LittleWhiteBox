import assert from 'node:assert/strict';
import test from 'node:test';
import { createRecallPrefetchCoordinator } from '../generate/recall-prefetch.js';
import { normalizeRecallTimeoutSec, MAX_RECALL_TIMEOUT_SEC } from '../data/recall-settings.js';
import { uiEntry } from './helpers/story-summary-entry.js';

// Acceptance: reloading settings preserves the chosen budget, invalid imported
// budgets cannot overflow browser timers, and an active run keeps its budget.
// Cost: silent interruption of chat generation or overwriting saved settings.
test('timeout settings normalize consistently and survive the panel reload path', () => {
    const ui = uiEntry(['normalizeVectorConfigUI'], {
        config: { vector: { recallTimeoutSec: 30, l0Api: {}, embeddingApi: {}, rerankApi: {} } },
        normalizeProviderProfiles: () => ({}), normalizeRecallTimeoutSec,
    });
    for (const [input, expected] of [[90, 90], ['60', 60], [undefined, 30], ['', 30],
        [1.9, 1], [0.5, 1], [-1, 30], [Infinity, 30], [3_000_000, MAX_RECALL_TIMEOUT_SEC]]) {
        assert.equal(normalizeRecallTimeoutSec(input), expected);
        assert.equal(ui.normalizeVectorConfigUI({ recallTimeoutSec: input }).recallTimeoutSec, expected);
    }
});

test('each generation freezes one budget for host waiting and subsequent computation', async () => {
    let clock = 0, nextId = 0, timeoutMs = 60_000;
    const timers = new Map();
    const advance = ms => {
        const target = clock + ms;
        for (;;) {
            const next = [...timers].filter(([, timer]) => timer.at <= target)
                .sort((a, b) => a[1].at - b[1].at || a[0] - b[0])[0];
            if (!next) break;
            timers.delete(next[0]); clock = next[1].at; next[1].callback();
        }
        clock = target;
    };
    const context = { chatId: 'fixture', chat: [] };
    const coordinator = createRecallPrefetchCoordinator({
        getContext: () => context, prepare: () => new Promise(() => {}),
        maxAgeMs: () => timeoutMs, now: () => clock,
        setTimeout: (callback, delay) => { timers.set(++nextId, { callback, at: clock + delay }); return nextId; },
        clearTimeout: id => timers.delete(id),
    });
    const first = coordinator.startWatching({ chatId: context.chatId, initialLength: 0 });
    assert.equal(first.timeoutMs, 60_000);
    timeoutMs = 90_000;
    context.chat.push({ is_user: true, mes: 'fixture' });
    advance(16); await Promise.resolve();
    advance(59_999); assert.equal(first.controller.signal.aborted, false);
    advance(1); assert.equal(first.cancelReason, 'recall-timeout');
    const second = coordinator.startWatching({ chatId: context.chatId, initialLength: 1 });
    assert.equal(second.timeoutMs, 90_000);
    advance(89_999); assert.equal(second.controller.signal.aborted, false);
    advance(1); assert.equal(second.cancelReason, 'host-wait-timeout');
    assert.equal(timers.size, 0);
});
