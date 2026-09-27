import assert from 'node:assert/strict';
import test from 'node:test';
import { userEconomyHarness } from './user-economy-harness.js';
import { MOVING_PARTITION } from '../apps/game/moving/partition.ts';
import { createMovingService } from '../apps/game/moving/service.ts';
import { analyzePuzzle } from '../apps/game/moving/puzzle.ts';
import { generateChallenge, puzzleOf } from '../apps/game/moving/levels.ts';
import { classifyChallenge } from '../apps/game/moving/difficulty.ts';
import { runStatus } from '../apps/game/moving/domain.ts';
import { MOVING_POLICY } from '../apps/game/moving/policy.ts';

function solutionActions(run) {
    const indices = run.level.stacks.map(() => 0);
    return analyzePuzzle(puzzleOf(run.level)).solution.map(lane => run.level.stacks[lane][indices[lane]++]);
}

async function setup(files, dependencies = {}) {
    const h = await userEconomyHarness({ files });
    let id = 0;
    const service = createMovingService(h.store(MOVING_PARTITION), h.transactions, h.economy,
        { seed: () => 4, id: () => `run-${Date.now()}-${++id}`, ...dependencies });
    await h.economy.ensureOpen(); await service.refresh();
    const request = command => ({ actionId: `action-${Date.now()}-${++id}`, revision: service.view().revision, command });
    const act = command => service.act(request(command), () => true);
    async function win() {
        for (const id of solutionActions(service.view().active)) await act({ type: 'pick', id });
        assert.equal(runStatus(service.view().active), 'won');
    }
    async function lose() {
        while (runStatus(service.view().active) === 'playing') {
            const { active, board } = service.view();
            const choices = active.level.items.filter(item => board.remaining.includes(item.id) && (!item.above || !board.remaining.includes(item.above)));
            const count = kind => board.tray.filter(id => active.level.items.find(item => item.id === id).kind === kind).length;
            choices.sort((a, b) => count(a.kind) - count(b.kind));
            await act({ type: 'pick', id: choices[0].id });
        }
        assert.equal(runStatus(service.view().active), 'lost');
    }
    async function chapter() {
        for (let stage = 0; stage < 5; stage++) { await act({ type: 'start', stage }); await win(); }
    }
    return { ...h, service, act, request, win, lose, chapter };
}

test('chapter rewards are atomic, once per stage across replay, reload and chat switching', async () => {
    const h = await setup();
    await assert.rejects(h.act({ type: 'start', stage: 1 }));
    await assert.rejects(h.act({ type: 'challenge' }));
    await h.chapter();
    assert.equal(h.service.view().balance, 100 + 5 * MOVING_POLICY.chapterReward);
    await h.act({ type: 'start', stage: 0 }); await h.win();
    await h.act({ type: 'undo' });
    const active = h.service.view().active;
    const remaining = h.service.view().board.remaining;
    await h.act({ type: 'pick', id: remaining[0] });
    assert.equal(runStatus(h.service.view().active), 'won');
    assert.equal(h.service.view().balance, 350);
    assert.equal(h.service.view().award, 0);
    const reopened = await setup(h.state.files);
    reopened.switchStory('b'); await reopened.service.refresh();
    assert.deepEqual(reopened.service.view().completed, [0, 1, 2, 3, 4]);
    assert.equal(reopened.service.view().balance, 350);
    assert.equal(reopened.service.view().active.id, active.id);
    const awards = h.document().partitions.economy.transactions.filter(tx => tx.kind === 'moving_first');
    assert.equal(awards.length, 5);
});

test('a prepared user-owned admission survives leaving its origin chat, without reopening that chat', async () => {
    const h = await setup(); await h.chapter();
    let originCurrent = true;
    h.state.mode = 'unknown';
    await assert.rejects(h.service.act(h.request({ type: 'challenge' }), () => originCurrent));
    const prepared = structuredClone(h.state.writes.at(-1).partitions.moving.active);
    originCurrent = false; h.switchStory('b'); h.state.mode = 'confirmed';
    await h.service.confirm(() => true);
    assert.equal(h.service.view().balance, 300);
    assert.deepEqual(h.service.view().active, prepared);
});

test('paid overflow consumes admission only and a failed prize save cannot duplicate winnings', async () => {
    const h = await setup(); await h.chapter(); await h.act({ type: 'challenge' });
    // All four tops are visible; choose non-matching fronts until the rack overflows.
    await h.lose();
    assert.equal(runStatus(h.service.view().active), 'lost');
    assert.equal(h.service.view().balance, 300);
    await assert.rejects(h.act({ type: 'undo' }));
    await h.act({ type: 'challenge' });
    const actions = solutionActions(h.service.view().active);
    for (const id of actions.slice(0, -1)) await h.act({ type: 'pick', id });
    h.state.mode = 'unknown';
    const request = h.request({ type: 'pick', id: actions.at(-1) });
    await assert.rejects(h.service.act(request, () => true));
    assert.equal(h.service.view().balance, 250);
    assert.equal(runStatus(h.service.view().active), 'playing');
    h.state.mode = 'confirmed'; await h.service.confirm(() => true);
    await h.service.act(request, () => true);
    assert.equal(h.service.view().balance, 350);
    assert.equal(runStatus(h.service.view().active), 'won');
    assert.equal(h.document().partitions.economy.transactions.filter(tx => tx.kind === 'moving_prize').length, 1);
});

test('paid admission, victory, abandonment, retries and a second admission conserve money', async () => {
    const h = await setup(); await h.chapter();
    const request = h.request({ type: 'challenge' });
    await h.service.act(request, () => true);
    const started = structuredClone(h.service.view().active);
    assert.equal(h.service.view().balance, 300);
    await h.service.act(request, () => true);
    assert.equal(h.service.view().balance, 300);
    await assert.rejects(h.act({ type: 'undo' }));
    await assert.rejects(h.act({ type: 'restart' }));
    await assert.rejects(h.act({ type: 'challenge' }));
    await assert.rejects(h.act({ type: 'start', stage: 0 }));
    const reopened = await setup(h.state.files);
    assert.deepEqual(reopened.service.view().active, started);
    await reopened.win();
    assert.equal(reopened.service.view().balance, 400);
    const last = reopened.document().partitions.moving.last;
    await reopened.service.act({ actionId: last.id, revision: reopened.service.view().revision - 1, command: last.command }, () => true);
    assert.equal(reopened.service.view().balance, 400);
    await reopened.act({ type: 'challenge' });
    await reopened.act({ type: 'abandon' });
    assert.equal(reopened.service.view().balance, 350);
    assert.equal(runStatus(reopened.service.view().active), 'abandoned');
});

test('rejected and unknown admission writes recover the exact candidate without generating or charging again', async () => {
    for (const failure of ['rejected', 'unknown', 'written-unknown']) {
        const h = await setup(); await h.chapter();
        h.state.mode = failure;
        const request = h.request({ type: 'challenge' });
        try { await h.service.act(request, () => true); } catch (error) { assert.ok(error); }
        const candidate = structuredClone(h.state.writes.at(-1));
        h.state.mode = 'confirmed';
        await h.service.confirm(() => true);
        assert.equal(h.service.view().balance, 300);
        assert.deepEqual(h.service.view().active, candidate.partitions.moving.active);
        await h.service.act(request, () => true);
        assert.equal(h.service.view().balance, 300);
        assert.equal(h.document().partitions.economy.transactions.filter(tx => tx.kind === 'moving_fee').length, 1);
    }
});

test('generation failure, stale commands and changed retry parameters leave the wallet and puzzle unchanged', async () => {
    const h = await setup(undefined, { generate: async () => { throw new Error('moving_generation_exhausted'); } });
    await h.chapter();
    const before = structuredClone(h.document());
    await assert.rejects(h.act({ type: 'challenge' }), { message: 'moving_generation_exhausted' });
    const last = h.service.view().revision;
    await assert.rejects(h.service.act({ ...h.request({ type: 'restart' }), revision: last - 1 }, () => true), { code: 'moving_stale' });
    await assert.rejects(h.service.act({ actionId: before.partitions.moving.last.id, revision: last, command: { type: 'restart' } }, () => true), { code: 'moving_identity' });
    assert.deepEqual(h.document(), before);
});

test('insufficient admission funds cannot replace a finished puzzle or create a ledger entry', async () => {
    const h = await setup(); await h.chapter();
    while (h.service.view().balance >= MOVING_POLICY.challengeFee) {
        await h.act({ type: 'challenge' }); await h.act({ type: 'abandon' });
    }
    const before = structuredClone(h.document());
    await assert.rejects(h.act({ type: 'challenge' }), { code: 'moving_funds' });
    assert.deepEqual(h.document(), before);
});

test('only confirmed paid wins upgrade admissions; old boards, retries, reloads and losses preserve the correct tier', async () => {
    let h = await setup(); await h.chapter();
    const initialBalance = h.service.view().balance;
    assert.equal(h.service.view().challenge.wins, 0);
    let failures = 0;
    for (let wins = 0; wins < 8; wins++) {
        const admissionTier = wins < 3 ? 'hard' : wins < 6 ? 'expert' : 'extreme';
        assert.equal(h.service.view().challenge.tier, admissionTier);
        await h.act({ type: 'challenge' });
        assert.equal(classifyChallenge(analyzePuzzle(puzzleOf(h.service.view().active.level))), admissionTier);
        if (wins === 2 || wins === 5) {
            const actions = solutionActions(h.service.view().active);
            for (const id of actions.slice(0, -1)) await h.act({ type: 'pick', id });
            const request = h.request({ type: 'pick', id: actions.at(-1) });
            const before = h.service.view().challenge;
            h.state.mode = 'unknown';
            await assert.rejects(h.service.act(request, () => true));
            assert.deepEqual(h.service.view().challenge, before);
            h.state.mode = 'confirmed'; h.switchStory(`boundary-${wins}`);
            await h.service.confirm(() => true);
            await h.service.act(request, () => true);
        } else { await h.win(); }
        const won = h.service.view();
        assert.equal(won.challenge.wins, wins + 1);
        assert.equal(won.challenge.activeTier, admissionTier);
        assert.equal(won.challenge.tier, wins + 1 < 3 ? 'hard' : wins + 1 < 6 ? 'expert' : 'extreme');
        h = await setup(h.state.files);
        assert.deepEqual(h.service.view().challenge, won.challenge);
        assert.equal(runStatus(h.service.view().active), 'won');
        if ([2, 5, 7].includes(wins)) {
            // Each tier survives both an overflow and deliberate abandonment, then a free replay.
            for (const outcome of ['lost', 'abandoned']) {
                await h.act({ type: 'challenge' });
                if (outcome === 'lost') await h.lose(); else await h.act({ type: 'abandon' });
                failures++;
                assert.equal(h.service.view().challenge.tier, won.challenge.tier);
                assert.equal(h.service.view().challenge.wins, wins + 1);
            }
            await h.act({ type: 'start', stage: 0 }); await h.win();
            assert.equal(h.service.view().challenge.wins, wins + 1);
            assert.equal(h.service.view().challenge.activeTier, null);
        }
    }
    const ledger = h.document().partitions.economy.transactions;
    assert.equal(ledger.filter(tx => tx.kind === 'moving_prize').length, 8);
    assert.equal(ledger.filter(tx => tx.kind === 'moving_fee').length, 8 + failures);
    assert.equal(h.service.view().balance, initialBalance + 8 * (MOVING_POLICY.challengePrize - MOVING_POLICY.challengeFee) - failures * MOVING_POLICY.challengeFee);
});

test('wrong-tier generation and tampered saved boards are rejected without a fee or progress change', async () => {
    const h = await setup(undefined, { generate: seed => generateChallenge(seed, 'expert') });
    await h.chapter();
    const before = structuredClone(h.document());
    await assert.rejects(h.act({ type: 'challenge' }));
    assert.deepEqual(h.document(), before);
    const valid = await setup(h.state.files);
    await valid.act({ type: 'challenge' });
    const altered = structuredClone(valid.document().partitions.moving);
    altered.active.level = await generateChallenge(4, 'extreme');
    assert.equal(MOVING_PARTITION.parse(altered).ok, false);
    assert.equal(MOVING_PARTITION.parse(valid.document().partitions.moving).ok, true);
});
