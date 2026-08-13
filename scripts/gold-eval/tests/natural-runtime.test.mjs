import test from 'node:test';
import assert from 'node:assert/strict';

import {
    assertNaturalHistoryHealthy,
    maintainNaturalHistoryAfterAi,
} from '../../story-summary-replay/natural-runtime.mjs';

function message(floor) {
    return {
        is_user: floor % 2 === 0,
        mes: floor % 2 === 0 ? `用户 ${floor}` : `角色 ${floor}`,
    };
}

test('natural runtime保留L0 fail供下一AI回合重试，并只在query boundary要求全健康', async () => {
    const statuses = new Map();
    const atoms = [];
    const vectors = [];
    let lastChunkFloor = -1;
    let extractionRuns = 0;
    let lexicalInvalidations = 0;
    const modules = {
        buildIncrementalChunks: async () => {
            lastChunkFloor = extractionRuns === 0 ? 1 : 3;
            return { built: 1 };
        },
        incrementalExtractAtoms: async () => {
            extractionRuns += 1;
            if (extractionRuns === 1) {
                statuses.set(1, { status: 'fail', attempts: 1, reason: 'invalid_json' });
                return { built: 0 };
            }
            statuses.set(1, { status: 'ok', attempts: 2, atoms: 1 });
            statuses.set(3, { status: 'empty', reason: 'llm_empty', atoms: 0 });
            atoms.push({ atomId: 'atom-floor-1', floor: 1, semantic: '记忆' });
            vectors.push({ atomId: 'atom-floor-1', floor: 1, vector: [0.1] });
            return { built: 1 };
        },
        getMeta: async () => ({ lastChunkFloor }),
        getL0FloorStatus: floor => statuses.get(floor) || null,
        getStateAtoms: () => atoms,
        getAllStateVectors: async () => vectors,
        invalidateLexicalIndex: () => { lexicalInvalidations += 1; },
    };
    const panelConfig = { vector: { enabled: true } };
    const firstVisible = [message(0), message(1)];
    const first = await maintainNaturalHistoryAfterAi({
        modules,
        chatId: 'fixture-chat',
        panelConfig,
        floor: 1,
        visibleMessages: firstVisible,
        nextCaseId: 'case-later',
    });
    assert.equal(first.result.l0Status, 'fail');
    assert.equal(first.result.l0Reason, 'invalid_json');
    assert.equal(first.result.l0PendingRetry, true);
    assert.equal(first.allowUnrecoveredTransient, true);
    await assert.rejects(() => assertNaturalHistoryHealthy({
        modules,
        chatId: 'fixture-chat',
        floor: 2,
        visibleMessages: firstVisible,
        nextCaseId: 'case-now',
    }), /仍有未恢复 L0: 1:fail\(invalid_json\)/);

    const secondVisible = [message(0), message(1), message(2), message(3)];
    const second = await maintainNaturalHistoryAfterAi({
        modules,
        chatId: 'fixture-chat',
        panelConfig,
        floor: 3,
        visibleMessages: secondVisible,
        nextCaseId: 'case-later',
    });
    assert.equal(second.result.l0Status, 'empty');
    assert.equal(second.allowUnrecoveredTransient, false);
    const health = await assertNaturalHistoryHealthy({
        modules,
        chatId: 'fixture-chat',
        floor: 4,
        visibleMessages: secondVisible,
        nextCaseId: 'case-now',
    });
    assert.deepEqual(health.result, {
        latestAiFloor: 3,
        aiFloors: 2,
        l0Ok: 1,
        l0Empty: 1,
    });
    assert.equal(extractionRuns, 2);
    assert.equal(lexicalInvalidations, 2);
});
