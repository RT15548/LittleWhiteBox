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

test('all raw-evidence routes honor visibility, including a USER/AI pair across the boundary', async () => {
    const { visibility } = (await runAssemblyCheck()).packingChecks;
    assert.deepEqual(visibility.map(row => row.direct), [[2, 6], [2], [], [2, 6, 7], []]);
    assert.deepEqual(visibility.map(row => row.fallback), [[2, 6], [2], [], [2, 6, 7], []]);
    assert.ok(visibility.every(row => row.noSummary.length === 0 && row.eventPreserved && row.l0Preserved));
});

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

test('final prompt uses fixed soft budgets despite saved overrides and admits complete boundary evidence', { timeout: 120_000 }, async () => {
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
    assert.ok(result.evidence.temporalProtectedTokens >= result.evidence.temporalProtectionBudgetMax);
    assert.ok(result.evidence.temporalProtectedTokens - result.evidence.temporalProtectedCosts.at(-1)
        < result.evidence.temporalProtectionBudgetMax);
    assert.equal(result.evidence.temporalProtectedItems, 2);

    assert.equal(result.evidence.enumerated, 4);
    assert.equal(result.evidence.admitted, 4);
    assert.equal(result.evidence.skippedByBudget, 0);
    assert.deepEqual(result.evidence.markerRendered, {
        protected: true,
        ordinaryHigh: true,
        temporalOverflow: true,
        ordinaryLow: true,
    });
    assert.deepEqual(result.evidence.renderedEvidenceFloors, [102, 104, 106, 110]);
});

test('causes reserve evidence space without changing main-event admission; boundary text enters whole', async () => {
    const { charging } = (await runAssemblyCheck()).packingChecks;
    assert.equal(charging.eventTokens, charging.baselineEventTokens);
    assert.equal(charging.causeRendered, true);
    assert.ok(charging.causalTokens > 0);
    assert.equal(charging.evidenceTokens, charging.causalTokens);
    assert.equal(charging.breakdown.causalEvidence, charging.causalTokens);
    assert.equal(charging.breakdown.events, charging.eventTokens);
    assert.equal(charging.oversized.ownerRendered, true);
    assert.equal(charging.oversized.links, 1);
    assert.equal(charging.oversized.trace.length, 1);
    assert.equal(charging.full.rawRendered, true);
    assert.equal(charging.full.causeRendered, true);
    assert.ok(charging.full.tokens > 4000);
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
    const sharedBody = shared.references.find(item => !item.reference);
    const reference = shared.references.find(item => item.reference);
    assert.equal(reference.label, sharedBody.label);
    assert.equal(shared.text.split(sharedBody.label).length - 1, 2);
    assert.equal(reused.bodyCopies, 1);
    assert.equal(reused.stats.bodies, 0);
    assert.equal(reused.stats.links, 2);
    assert.ok(reused.stats.tokens > 0);
    assert.equal(reused.eventTokens, reused.baselineEventTokens);
    assert.deepEqual(new Set(reused.references.map(item => item.eventId)), new Set(['evt-1', 'evt-100']));
    assert.ok(reused.references.every(item => item.reference && reused.text.includes(item.label)));
    assert.equal(cyclic.stats.links, 4);
    assert.equal(cyclic.stats.bodies, 0);
});

test('causal supplementation rotates across events until its boundary cause enters', async () => {
    const { fair, capped } = (await runAssemblyCheck()).packingChecks;
    assert.equal(fair.firstA, true);
    assert.equal(fair.firstB, true);
    assert.equal(fair.secondA, true);
    assert.ok(fair.tokens > 4000);
    assert.equal(capped.stats.maxTokens, 1000);
    assert.equal(capped.stats.perEventMaxTokens, 400);
    assert.ok(capped.stats.tokens >= 1000);
    assert.equal(capped.stats.bodies, capped.perOwnerLinks.length);
    assert.equal(new Set(capped.perOwnerLinks).size, capped.perOwnerLinks.length);
});

test('selected main events bring connected later records into the actual prompt without promoting them', async () => {
    const { forward } = (await runAssemblyCheck()).packingChecks;
    assert.deepEqual(forward.rendered, [true, true, false]);
    assert.ok(forward.positions[0] < forward.positions[1] && forward.positions[1] < forward.positions[2]);
    assert.equal(forward.selectedMainEvents, 1);
    assert.equal(forward.eventTokens, forward.baselineEventTokens);
    assert.equal(forward.stats.causes, 1);
    assert.equal(forward.stats.consequences, 2);
    assert.equal(forward.evidenceTokens, forward.stats.tokens);
    assert.deepEqual(forward.admitted.find(item => item.eventId === 'evt-102').path,
        ['evt-100', 'evt-101', 'evt-102']);
});

test('boundary facts and events stay whole without smaller replacements or orphaned causes', async () => {
    const { packing } = (await runAssemblyCheck()).packingChecks;
    assert.deepEqual(packing.factsRendered, [true, false, false]);
    assert.equal(packing.injectedFacts, 2);
    assert.equal(packing.laterEventRendered, false);
    assert.equal(packing.boundaryEventRenderedWhole, true);
    assert.equal(packing.boundaryFactRenderedWhole, true);
    assert.deepEqual(packing.relatedRendered, [true, true, false, true]);
    assert.equal(packing.droppedOwnerCauseRendered, false);
    assert.equal(packing.droppedOwnerConsequenceRendered, false);
    assert.equal(packing.droppedOwnerLinks, 0);
});

test('loose history has its own soft budget even when event evidence is full or other pools are free', async () => {
    const { full, allPools, history } = (await runAssemblyCheck()).packingChecks.independentPools;
    assert.equal(full.historyRendered, true);
    assert.ok(full.budget.eventEvidenceUsed > 3800);
    assert.ok(full.budget.distantEvidenceUsed > 600);
    assert.deepEqual(allPools.rendered, Array(7).fill(true));
    for (const { budget } of [full, allPools, history]) {
        assert.equal(budget.eventEvidenceMax, 4000);
        assert.equal(budget.distantEvidenceMax, 2000);
        assert.ok(budget.distantEvidenceUsed > 0);
        assert.equal(budget.eventEvidenceUsed,
            budget.metrics.breakdown.directEvidence + budget.metrics.breakdown.causalEvidence);
        assert.equal(budget.distantEvidenceUsed, budget.metrics.breakdown.distantEvidence);
    }
    assert.ok(history.budget.eventEvidenceUsed < 200, 'unused event-evidence space must not increase the history cap');
    assert.equal(history.dropped, 0);
});

test('loose history retains focus filtering and chronological output while admitting scenes before raw details', async () => {
    const { history } = (await runAssemblyCheck()).packingChecks.independentPools;
    assert.deepEqual(history.rendered, {
        HIGH_ANCHOR: true, SAME_FLOOR_ANCHOR: true, HIGH_RAW: true,
        EDGE_MATCH: true, PAIR_USER: true, PAIR_AI: true, BOUNDARY_ANCHOR: true,
        OVERSIZED_GROUP: true, OVERSIZED_RAW: true, LOW_ANCHOR: true,
        OTHER_PERSON: false, UNSUMMARIZED_ANCHOR: false,
    });
    assert.deepEqual(history.copies, [1, 1]);
    assert.ok(history.positions.every(position => position >= 0));
    assert.deepEqual(history.positions, [...history.positions].sort((a, b) => a - b));
    assert.equal(history.units, 5);
    assert.equal(history.unusedInEventRange, 1);
    assert.equal(history.noFocusRendered, true);
});

test('aggregate budget sums the independent pools once and reports 16500 even for empty memory', async () => {
    const { allPools, empty } = (await runAssemblyCheck()).packingChecks.independentPools;
    const limits = { constraints: 2000, arcs: 1500, events: 5000, directEvidence: 4000, causalEvidence: 1000, distantEvidence: 2000, recentEvidence: 2000 };
    for (const [pool, limit] of Object.entries(limits)) {
        assert.ok(allPools.budget.metrics.breakdown[pool] > 0);
        assert.ok(allPools.budget.metrics.breakdown[pool] <= limit);
    }
    for (const { budget } of [allPools, empty]) {
        const used = Object.values(budget.metrics.breakdown).reduce((sum, tokens) => sum + tokens, 0);
        assert.deepEqual(budget.injection, { max: 16500, used });
        assert.equal(budget.metrics.total, used);
        assert.equal(budget.metrics.limit, 16500);
        assert.equal(budget.metrics.utilization, Math.round(used / 16500 * 100));
    }
    assert.equal(empty.promptText, '');
    assert.equal(empty.budget.injection.used, 0);
});

test('L1 attaches once to an admitted event by range without starving L0 or causes', async () => {
    const { newEvidence } = (await runAssemblyCheck()).packingChecks;
    assert.ok(newEvidence.overlapPositions.every(position => position >= 0));
    assert.deepEqual(newEvidence.overlapPositions, [...newEvidence.overlapPositions].sort((a, b) => a - b));
    assert.equal(newEvidence.overlapCopies, 1);
    assert.deepEqual(newEvidence.protectedRendered, [true, true, true]);
    assert.ok(newEvidence.protectedTokens > 750 && newEvidence.protectedTokens <= 1000);
    assert.ok(newEvidence.budget.eventEvidenceUsed > 4000);
    assert.equal(newEvidence.budget.eventEvidenceUsed,
        newEvidence.budget.metrics.breakdown.directEvidence + newEvidence.budget.metrics.breakdown.causalEvidence);
});

test('L1 with no admitted L2 is rendered once and charged to its original pool', async () => {
    const { independent } = (await runAssemblyCheck()).packingChecks.newEvidence;
    assert.equal(independent.copies, 1);
    assert.equal(independent.eventCount, 0);
    assert.deepEqual(independent.admitted.map(item => [item.id, item.ownerEventId, item.admitted]),
        [['l1:INDEPENDENT_RAW', null, true]]);
    assert.ok(independent.budget.metrics.breakdown.directEvidence > 500);
    assert.ok(independent.budget.metrics.breakdown.distantEvidence < 100);
    assert.equal(independent.budget.eventEvidenceMax, 4000);
    assert.equal(independent.budget.distantEvidenceMax, 2000);
    assert.equal(independent.parentOverBudget.rendered, true);
    assert.equal(independent.parentOverBudget.ownerRendered, false);
    assert.equal(independent.parentOverBudget.admitted[0].ownerEventId, null);
});

test('recalled hidden unsummarized scenes enter without L2, group with their raw turn and appear only once', async () => {
    const { joined } = (await runAssemblyCheck()).packingChecks.unsummarized;
    assert.equal(joined.eventCount, 0);
    assert.deepEqual(joined.copies, [1, 1, 0, 1, 1]);
    assert.ok(joined.positions.every(position => position >= 0));
    assert.deepEqual(joined.positions, [...joined.positions].sort((a, b) => a - b));
    assert.deepEqual(joined.scattered, [21]);
    assert.deepEqual(joined.recent, [23]);
    assert.ok(joined.budget.metrics.breakdown.directEvidence > 0);
    assert.ok(joined.budget.metrics.breakdown.distantEvidence > 0);
    assert.ok(joined.budget.metrics.breakdown.recentEvidence > 0);
    const used = Object.values(joined.budget.metrics.breakdown).reduce((sum, tokens) => sum + tokens, 0);
    assert.equal(joined.budget.injection.used, used);
});

test('unsummarized scene admission follows the actual hide boundary and does not copy visible dialogue', async () => {
    const { eligibility } = (await runAssemblyCheck()).packingChecks.unsummarized;
    assert.deepEqual(eligibility.map(row => row.scene), [true, false, false, false]);
    assert.ok(eligibility.every(row => !row.visible));
});

test('a long attached raw passage cannot displace another recalled scene from scattered memory', async () => {
    const { anchorFirst } = (await runAssemblyCheck()).packingChecks.unsummarized;
    assert.deepEqual(anchorFirst.copies, [1, 1, 1]);
    assert.equal(anchorFirst.completeRaw, true);
    assert.deepEqual(anchorFirst.scattered, [21, 23]);
    assert.deepEqual(anchorFirst.recent, []);
    assert.ok(anchorFirst.budget.distantEvidenceUsed > 2000);
    assert.equal(anchorFirst.budget.eventEvidenceUsed, 0);
});

test('scattered overflow remains eligible for recent memory and both paths share the stored anchor identity', async () => {
    const { overflow } = (await runAssemblyCheck()).packingChecks.unsummarized;
    assert.deepEqual(overflow.copies, [1, 1, 1, 1, 1]);
    assert.deepEqual(overflow.scattered, [21, 23, 25]);
    assert.deepEqual(overflow.recent, [27, 29]);
    assert.ok(overflow.budget.distantEvidenceUsed > 2000);
    assert.ok(overflow.budget.metrics.breakdown.recentEvidence > 0);
    assert.ok(overflow.budget.metrics.breakdown.recentEvidence < 2000);
});
