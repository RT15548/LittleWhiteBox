import assert from 'node:assert/strict';
import test from 'node:test';
import { CHAPTER_LEVELS, generateChallenge, puzzleOf, materializePuzzle } from '../apps/game/moving/levels.ts';
import { classifyChallenge, challengeProgressForWins } from '../apps/game/moving/difficulty.ts';
import { analyzePuzzle } from '../apps/game/moving/puzzle.ts';
import { actMoving, canPick, MATCH_SIZE, movingStatus, packedCount, startMoving, TRAY_CAPACITY } from '../apps/game/moving/rules.ts';
import { CHALLENGE_TIERS } from '../apps/game/moving/policy.ts';
import { advanceMoving, emptyMoving, replayRun } from '../apps/game/moving/domain.ts';

// Independent exploration of actual game actions checks the analyzer's lower-bound claim.
function solutionWithin(level, maximum, initial = startMoving(level)) {
    const seen = new Set();
    function visit(state) {
        if (movingStatus(state) === 'won') return true;
        if (movingStatus(state) === 'lost' || state.tray.length > maximum) return false;
        const key = state.remaining.join(',');
        if (seen.has(key)) return false;
        seen.add(key);
        return level.items.filter(item => canPick(state, item)).some(item => {
            const result = actMoving(level, state, { type: 'pick', id: item.id });
            return result.ok && visit(result.state);
        });
    }
    return visit(initial);
}
function replaySolution(level) {
    const analysis = analyzePuzzle(puzzleOf(level));
    const indices = level.stacks.map(() => 0);
    const shipped = new Set();
    let state = startMoving(level), peak = 0;
    for (const lane of analysis.solution) {
        const result = actMoving(level, state, { type: 'pick', id: level.stacks[lane][indices[lane]++] });
        assert.equal(result.ok, true);
        for (const id of result.packed) { assert.ok(!shipped.has(id)); shipped.add(id); }
        state = result.state; peak = Math.max(peak, state.tray.length);
        assert.equal(new Set([...state.remaining, ...state.tray, ...shipped]).size, level.items.length);
        assert.equal(state.remaining.length + state.tray.length + shipped.size, level.items.length);
        assert.equal(packedCount(level, state) * MATCH_SIZE, shipped.size);
        assert.ok(state.tray.length < TRAY_CAPACITY);
    }
    assert.equal(movingStatus(state), 'won');
    assert.equal(peak, analysis.minimumPeak);
}
test('five ordered stages demand increasing planning and every item is conserved', () => {
    const analyses = CHAPTER_LEVELS.map(level => analyzePuzzle(puzzleOf(level)));
    assert.equal(CHAPTER_LEVELS.length, 5);
    for (let index = 0; index < CHAPTER_LEVELS.length; index++) {
        const level = CHAPTER_LEVELS[index], a = analyses[index];
        replaySolution(level);
        assert.equal(solutionWithin(level, a.minimumPeak - 1), false);
        if (index) {
            assert.ok(a.minimumPeak >= analyses[index - 1].minimumPeak);
            assert.ok(a.randomWinProbability < analyses[index - 1].randomWinProbability);
        }
    }
});
test('the opening requires staging before any triple, can punish careless order, and permits every first choice', () => {
    const level = CHAPTER_LEVELS[0], analysis = analyzePuzzle(puzzleOf(level));
    assert.ok(analysis.minimumPeak >= 4);
    assert.ok(analysis.randomWinProbability >= .3 && analysis.randomWinProbability <= .6);
    assert.ok(analysis.losingBranches > 0);
    let frontier = [startMoving(level)];
    // Any first four legal picks must occupy the rack, not hand out an immediate triple.
    for (let step = 0; step < 4; step++) {
        frontier = frontier.flatMap(board => level.items.filter(item => canPick(board, item)).map(item => {
            const result = actMoving(level, board, { type: 'pick', id: item.id });
            assert.equal(result.ok, true);
            assert.equal(result.packed.length, 0);
            if (step === 0) assert.equal(solutionWithin(level, TRAY_CAPACITY - 1, result.state), true);
            return result.state;
        }));
    }
});
for (const tier of CHALLENGE_TIERS) test(`paid ${tier.id} seeds are reproducible, varied, solvable and in their exclusive band`, async () => {
    const finale = analyzePuzzle(puzzleOf(CHAPTER_LEVELS.at(-1)));
    const arrangements = new Set();
    const samples = tier.id === 'hard' ? 128 : 16;
    for (let seed = 0; seed < samples; seed++) {
        const level = await generateChallenge(seed, tier.id), a = analyzePuzzle(puzzleOf(level));
        assert.equal(classifyChallenge(a), tier.id);
        assert.ok(a.minimumPeak > finale.minimumPeak);
        assert.ok(a.randomWinProbability < finale.randomWinProbability);
        assert.ok(a.losingBranches / a.branches >= tier.minTrapRatio);
        assert.ok(a.randomWinProbability <= tier.maxRandomWin);
        replaySolution(level);
        if (seed < 8) assert.equal(solutionWithin(level, a.minimumPeak - 1), false);
        arrangements.add(JSON.stringify(puzzleOf(level)));
        assert.deepEqual(await generateChallenge(seed, tier.id), level);
    }
    assert.equal(arrangements.size, samples);
});

test('cumulative paid wins advance at three and six, then remain at the highest tier', () => {
    for (const [wins, tier, nextTier, winsToNext] of [
        [0, 'hard', 'expert', 3], [2, 'hard', 'expert', 1],
        [3, 'expert', 'extreme', 3], [5, 'expert', 'extreme', 1],
        [6, 'extreme', null, 0], [100, 'extreme', null, 0],
    ]) assert.deepEqual(challengeProgressForWins(wins), { wins, tier, nextTier, winsToNext });
});
test('a lower item cannot be taken until the supporting top has been removed', () => {
    const level = CHAPTER_LEVELS[0], before = startMoving(level);
    const lower = level.stacks[0][1], upper = level.stacks[0][0];
    assert.deepEqual(actMoving(level, before, { type: 'pick', id: lower }), { ok: false, reason: 'blocked' });
    assert.deepEqual(actMoving(level, before, { type: 'pick', id: 'absent' }), { ok: false, reason: 'missing' });
    const result = actMoving(level, before, { type: 'pick', id: upper });
    assert.equal(result.ok, true);
    assert.equal(canPick(result.state, level.items.find(item => item.id === lower)), true);
    assert.deepEqual(before, startMoving(level));
});
test('the seventh slot completes a triple before overflow; an unmatched seventh loses', () => {
    const kinds = ['cat', 'cat', 'cup', 'plant', 'toast', 'duck', 'cat', 'ufo'];
    const level = materializePuzzle([kinds], 'weekend', 'boundary', 0);
    let state = startMoving(level);
    for (const item of level.items.slice(0, 6)) state = actMoving(level, state, { type: 'pick', id: item.id }).state;
    const last = actMoving(level, state, { type: 'pick', id: level.items[6].id });
    assert.equal(last.ok, true); assert.equal(last.packed.length, MATCH_SIZE);
    assert.equal(movingStatus(last.state), 'playing');
    const other = { ...level, items: level.items.map((item, index) => index === 6 ? { ...item, kind: 'ufo' } : item) };
    const failed = actMoving(other, state, { type: 'pick', id: other.items[6].id });
    assert.equal(movingStatus(failed.state), 'lost');
    assert.deepEqual(actMoving(other, failed.state, { type: 'pick', id: other.items[7].id }), { ok: false, reason: 'finished' });
});
test('chapter undo restores the exact legal history while paid rules prohibit undo and reroll', async () => {
    let data = advanceMoving(emptyMoving(), { type: 'start', stage: 0 }, 'start', { id: 'free', level: CHAPTER_LEVELS[0] });
    const before = replayRun(data.active);
    data = advanceMoving(data, { type: 'pick', id: data.active.level.stacks[0][0] }, 'pick');
    data = advanceMoving(data, { type: 'undo' }, 'undo');
    assert.deepEqual(replayRun(data.active), before);
    const invalid = structuredClone(data);
    invalid.active.stage = null;
    for (const type of ['undo', 'restart']) assert.throws(() => advanceMoving(invalid, { type }, type), { code: 'moving_paidRule' });
});
