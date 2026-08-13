import test from 'node:test';
import assert from 'node:assert/strict';

import {
    aggregateNaturalConversationMacro,
    compareNaturalPair,
} from '../lib/natural-comparison.mjs';

function capture({ mode, runId, corpusId, passes, sourceRunId = null, hashes = null }) {
    const caseIds = passes.map((_, index) => `${corpusId}-case-${index}`);
    const boundaryHashes = hashes || caseIds.map((_, index) => String(index + 1).padStart(64, 'a'));
    return {
        manifest: {
            status: 'valid',
            mode,
            runId,
            ...(sourceRunId ? { sourceCapture: { runId: sourceRunId } } : {}),
            ...(mode === 'story-summary-replay-natural-capture'
                ? { boundarySnapshots: caseIds.map((caseId, index) => ({ caseId, sha256: boundaryHashes[index] })) }
                : { consumedBoundarySnapshots: caseIds.map((caseId, index) => ({ caseId, sha256: boundaryHashes[index] })) }),
        },
        cases: caseIds.map(id => ({ id, corpusId })),
        stageTraces: caseIds.map((id, index) => ({
            id,
            stages: { prompt: passes[index] ? 'hit' : 'miss' },
        })),
    };
}

function pair(corpusId, before, after) {
    const baseline = capture({
        mode: 'story-summary-replay-natural-capture',
        runId: `${corpusId}-baseline`,
        corpusId,
        passes: before,
    });
    const candidate = capture({
        mode: 'story-summary-replay-natural-recall',
        runId: `${corpusId}-candidate`,
        sourceRunId: baseline.manifest.runId,
        corpusId,
        passes: after,
    });
    return compareNaturalPair({ baseline, candidate, corpusId });
}

test('natural paired comparison要求同case、同corpus与同boundary snapshot', () => {
    const result = pair('world-a', [true, false, false], [true, true, false]);
    assert.deepEqual(result.baseline, { pass: 1, rate: 0.333333 });
    assert.deepEqual(result.candidate, { pass: 2, rate: 0.666667 });
    assert.deepEqual(result.paired, { wins: 1, losses: 0, ties: 2 });
    assert.equal(result.strictImprovement, true);

    const baseline = capture({
        mode: 'story-summary-replay-natural-capture',
        runId: 'baseline',
        corpusId: 'world-b',
        passes: [false],
    });
    const candidate = capture({
        mode: 'story-summary-replay-natural-recall',
        runId: 'candidate',
        sourceRunId: 'baseline',
        corpusId: 'world-b',
        passes: [true],
        hashes: ['b'.repeat(64)],
    });
    assert.throws(() => compareNaturalPair({ baseline, candidate, corpusId: 'world-b' }), /同一boundary/);
});

test('conversation macro让每份聊天等权而不是按题量pooled', () => {
    const large = pair(
        'large-world',
        Array.from({ length: 100 }, () => false),
        Array.from({ length: 100 }, (_, index) => index < 10),
    );
    const small = pair('small-world', [false, false], [true, false]);
    const macro = aggregateNaturalConversationMacro([large, small], {
        bootstrapIterations: 1000,
        bootstrapSeed: 7,
    });
    assert.equal(large.delta, 0.1);
    assert.equal(small.delta, 0.5);
    assert.equal(macro.delta, 0.3);
    assert.equal(macro.passed, true);
    assert.equal(macro.weighting, 'each corpusId has equal weight');
});

test('任一未满分聊天不提升时跨聊天闸门拒绝', () => {
    const improved = pair('world-a', [false, true], [true, true]);
    const unchanged = pair('world-b', [false, true], [false, true]);
    const macro = aggregateNaturalConversationMacro([improved, unchanged], { bootstrapIterations: 100 });
    assert.equal(macro.delta, 0.25);
    assert.equal(macro.allEligibleImproved, false);
    assert.equal(macro.passed, false);
});
