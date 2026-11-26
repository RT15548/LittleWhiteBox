import test from 'node:test';
import assert from 'node:assert/strict';
import { createContextStatsController } from '../app-src/runtime/context-stats.js';

test('input budget reserves configured output without a provider-wide discount', () => {
    let config = { maxTokens: 64000 };
    const state = {};
    const controller = createContextStatsController({
        state,
        getActiveProviderConfig: () => config,
        TOOL_DEFINITIONS: [],
        MAX_CONTEXT_TOKENS: 256000,
        SUMMARY_TRIGGER_TOKENS: 228000,
    });
    assert.equal(controller.requestInputLimit(), 192000);
    assert.equal(controller.compactionThreshold(), 192000);
    controller.updateContextStats([]);
    assert.equal(state.contextStats.budgetTokens, 256000);

    // Switching the active provider's output allowance updates both budgets.
    config = { maxTokens: 32000 };
    assert.equal(controller.requestInputLimit(), 224000);
    assert.equal(controller.compactionThreshold(), 224000);

    config = { maxTokens: 16000 };
    assert.equal(controller.requestInputLimit(), 240000);
    assert.equal(controller.compactionThreshold(), 228000);
});
