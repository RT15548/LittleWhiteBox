import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import process from 'node:process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const rootDir = fileURLToPath(new URL('../../../', import.meta.url));
const runnerPath = fileURLToPath(new URL('../../../scripts/story-summary-replay-runner.mjs', import.meta.url));
const resultPrefix = '[story-summary-replay] prompt assembly check: ';

let checkPromise;
async function runAssemblyCheck() {
    if (checkPromise) return checkPromise;
    checkPromise = loadAssemblyCheck();
    return checkPromise;
}

async function loadAssemblyCheck() {
    const { stdout } = await execFileAsync(
        process.execPath,
        [runnerPath, '--check-prompt-assembly'],
        { cwd: rootDir, windowsHide: true, maxBuffer: 1024 * 1024 },
    );
    const resultLine = stdout.split(/\r?\n/).find(line => line.startsWith(resultPrefix));
    assert.ok(resultLine, `missing prompt assembly result in output:\n${stdout}`);
    return JSON.parse(resultLine.slice(resultPrefix.length));
}

test('final prompt uses the fixed evidence budget despite saved overrides and bounds temporal protection', { timeout: 120_000 }, async () => {
    const result = await runAssemblyCheck();
    assert.deepEqual(result.externalCalls, []);

    assert.equal(result.event.temporalWinners, 7);
    assert.equal(result.event.temporalProtectionCap, 5);
    assert.ok(result.event.temporalProtected <= 5);
    assert.equal(result.event.temporalProtected, 5);
    assert.equal(result.event.temporalOverflow, 2);
    assert.deepEqual(result.event.overflowRendered, [true, true]);

    assert.equal(result.evidence.eventEvidenceBudgetMax, 4000);
    assert.equal(result.evidence.temporalProtectionBudgetMax, 1600);
    assert.ok(result.evidence.temporalProtectedTokens > 0);
    assert.ok(
        result.evidence.temporalProtectedTokens
            <= Math.floor(result.evidence.eventEvidenceBudgetMax * 0.40),
    );
    assert.equal(result.evidence.temporalProtectedItems, 1);

    assert.equal(result.evidence.enumerated, 4);
    assert.equal(result.evidence.admitted, 3);
    assert.equal(result.evidence.skippedByBudget, 1);
    assert.deepEqual(result.evidence.markerRendered, {
        protected: true,
        ordinaryHigh: true,
        temporalOverflow: true,
        ordinaryLow: false,
    });
    assert.deepEqual(result.evidence.renderedEvidenceFloors, [102, 106, 110]);
});

test('causes reserve evidence space without changing main-event admission; oversized raw text is skipped whole', async () => {
    const { charging } = (await runAssemblyCheck()).packingChecks;
    assert.equal(charging.eventTokens, charging.baselineEventTokens);
    assert.equal(charging.causeRendered, true);
    assert.ok(charging.causalTokens > 0);
    assert.equal(charging.evidenceTokens, charging.causalTokens);
    assert.equal(charging.breakdown.causalEvidence, charging.causalTokens);
    assert.equal(charging.breakdown.events, charging.eventTokens);
    assert.deepEqual(charging.oversized, { ownerRendered: true, links: 0, trace: [] });
    assert.equal(charging.full.rawRendered, false);
    assert.equal(charging.full.causeRendered, true);
    assert.ok(charging.full.tokens <= 4000);
    assert.equal(charging.full.trace.length, 1);
    assert.deepEqual(charging.mixed.rendered, [true, true, true]);
    assert.equal(charging.mixed.tokens,
        charging.mixed.breakdown.directEvidence
        + charging.mixed.breakdown.causalEvidence);
    assert.ok(charging.mixed.tokens <= 4000);
});

test('shared direct causes render once with resolved references and no recursive expansion', async () => {
    const { shared, reused, cyclic } = (await runAssemblyCheck()).packingChecks;
    assert.equal(shared.bodyCopies, 1);
    assert.equal(shared.stats.bodies, 1);
    assert.equal(shared.stats.links, 2);
    assert.deepEqual(shared.ownerUnits.sort(), ['event:evt-100', 'event:evt-200']);
    assert.equal(shared.grandparentRendered, false);
    // These are references in the model-facing output, not source-string checks.
    const reference = shared.text.match(/见(前因\d+)/u)?.[1];
    assert.ok(reference && shared.text.includes(`├─ ${reference}`));
    assert.equal(reused.bodyCopies, 1);
    assert.equal(reused.stats.bodies, 0);
    assert.equal(reused.stats.links, 1);
    assert.ok(reused.stats.tokens > 0);
    assert.equal(reused.eventTokens, reused.baselineEventTokens);
    assert.ok(reused.text.includes('见[印象深的事]第1条'));
    assert.equal(cyclic.stats.links, 2);
    assert.equal(cyclic.stats.bodies, 0);
});

test('causal supplementation rotates across events and respects both caps within the evidence pool', async () => {
    const { fair, capped } = (await runAssemblyCheck()).packingChecks;
    assert.equal(fair.firstA, true);
    assert.equal(fair.firstB, true);
    assert.equal(fair.secondA, true);
    assert.ok(fair.tokens <= 4000);
    assert.equal(capped.stats.maxTokens, 1000);
    assert.equal(capped.stats.perEventMaxTokens, 400);
    assert.ok(capped.stats.tokens <= 1000);
    assert.ok(capped.stats.bodies >= 3);
    assert.equal(new Set(capped.perOwnerLinks).size, capped.perOwnerLinks.length);
});

test('budget overflow keeps accepted facts and later fitting events, without orphaned causes', async () => {
    const { packing } = (await runAssemblyCheck()).packingChecks;
    assert.deepEqual(packing.factsRendered, [true, true, true]);
    assert.equal(packing.injectedFacts, 3);
    assert.equal(packing.laterEventRendered, true);
    assert.equal(packing.droppedOwnerCauseRendered, false);
    assert.equal(packing.droppedOwnerLinks, 0);
});

test('loose history has its own 1000-token cap even when event evidence is full or other pools are free', async () => {
    const { full, allPools, history } = (await runAssemblyCheck()).packingChecks.independentPools;
    assert.equal(full.historyRendered, true);
    assert.ok(full.budget.eventEvidenceUsed > 3800);
    assert.ok(full.budget.distantEvidenceUsed > 600);
    assert.deepEqual(allPools.rendered, Array(7).fill(true));
    for (const { budget } of [full, allPools, history]) {
        assert.equal(budget.eventEvidenceMax, 4000);
        assert.equal(budget.distantEvidenceMax, 1000);
        assert.ok(budget.eventEvidenceUsed <= 4000);
        assert.ok(budget.distantEvidenceUsed > 0 && budget.distantEvidenceUsed <= 1000);
        assert.equal(budget.eventEvidenceUsed,
            budget.metrics.breakdown.directEvidence + budget.metrics.breakdown.causalEvidence);
        assert.equal(budget.distantEvidenceUsed, budget.metrics.breakdown.distantEvidence);
    }
    assert.ok(history.budget.eventEvidenceUsed < 200, 'unused event-evidence space must not increase the history cap');
    assert.equal(history.dropped, 2);
});

test('loose history retains focus filtering, summary boundary, ranked whole-floor admission and chronological output', async () => {
    const { history } = (await runAssemblyCheck()).packingChecks.independentPools;
    assert.deepEqual(history.rendered, {
        HIGH_ANCHOR: true, SAME_FLOOR_ANCHOR: true, HIGH_RAW: true,
        EDGE_MATCH: true, PAIR_USER: true, PAIR_AI: true, BOUNDARY_ANCHOR: true,
        OVERSIZED_GROUP: false, OVERSIZED_RAW: false, LOW_ANCHOR: false,
        OTHER_PERSON: false, UNSUMMARIZED_ANCHOR: false,
    });
    assert.deepEqual(history.copies, [1, 1]);
    assert.ok(history.positions.every(position => position >= 0));
    assert.deepEqual(history.positions, [...history.positions].sort((a, b) => a - b));
    assert.equal(history.units, 3);
    assert.equal(history.unusedInEventRange, 1);
    assert.equal(history.noFocusRendered, true);
});

test('aggregate budget sums the independent pools once and reports 15500 even for empty memory', async () => {
    const { allPools, empty } = (await runAssemblyCheck()).packingChecks.independentPools;
    const limits = { constraints: 2000, arcs: 1500, events: 5000, directEvidence: 4000, causalEvidence: 1000, distantEvidence: 1000, recentEvidence: 2000 };
    for (const [pool, limit] of Object.entries(limits)) {
        assert.ok(allPools.budget.metrics.breakdown[pool] > 0);
        assert.ok(allPools.budget.metrics.breakdown[pool] <= limit);
    }
    for (const { budget } of [allPools, empty]) {
        const used = Object.values(budget.metrics.breakdown).reduce((sum, tokens) => sum + tokens, 0);
        assert.deepEqual(budget.injection, { max: 15500, used });
        assert.equal(budget.metrics.total, used);
        assert.equal(budget.metrics.limit, 15500);
        assert.equal(budget.metrics.utilization, Math.round(used / 15500 * 100));
    }
    assert.equal(empty.promptText, '');
    assert.equal(empty.budget.injection.used, 0);
});

test('local L1 retains its explicit owner across overlapping ranges and cannot starve L0 or causes', async () => {
    const { newEvidence } = (await runAssemblyCheck()).packingChecks;
    assert.ok(newEvidence.overlapPositions.every(position => position >= 0));
    assert.deepEqual(newEvidence.overlapPositions, [...newEvidence.overlapPositions].sort((a, b) => a - b));
    assert.equal(newEvidence.overlapCopies, 1);
    assert.deepEqual(newEvidence.protectedRendered, [true, true, true]);
    assert.ok(newEvidence.protectedTokens > 750 && newEvidence.protectedTokens <= 1000);
    assert.ok(newEvidence.budget.eventEvidenceUsed <= 4000);
    assert.equal(newEvidence.budget.eventEvidenceUsed,
        newEvidence.budget.metrics.breakdown.directEvidence + newEvidence.budget.metrics.breakdown.causalEvidence);
});
