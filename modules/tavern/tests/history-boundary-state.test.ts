import 'fake-indexeddb/auto';
import test from 'node:test';
import assert from 'node:assert/strict';

import db, {
    appendTavernMessage,
    createTavernSession,
    getTavernMessage,
} from '../shared/session-db';
import { resolveTavernHistoryBoundaryState } from '../app-src/runtime/history-boundary-state';

test('history boundary restoration uses the clicked checkpoint and leaves later checkpoints untouched', async () => {
    await db.delete();
    await db.open();
    const session = await createTavernSession({
        title: 'Checkpoint boundary',
        state: {
            turn: 150,
            activeMapDocId: 'map-current',
            contract: {
                memoryArchiving: false,
                cartographyEngine: true,
                statusPanel: true,
                actionChecks: true,
                randomEncounters: true,
            },
            worldEntryStates: { current: { stickyUntilTurn: 999 } },
            nativeWorldInfoTimedState: {
                sticky: { current: { start: 999, end: 1000 } },
                cooldown: {},
            },
        },
    });
    const largePayload = 'x'.repeat(32_000);
    let boundaryOrder = -1;
    let laterUserOrder = -1;
    for (let turn = 0; turn < 150; turn += 1) {
        const isBoundary = turn === 50;
        const user = await appendTavernMessage(session.id, {
            role: 'user',
            content: `用户 ${turn}`,
            requestSnapshot: { largePayload },
            runtimeStateSnapshot: {
                turn,
                contextWindowStartOrder: Math.max(0, turn * 2 - 18),
                worldEntryStates: isBoundary
                    ? { boundary: { stickyUntilTurn: 77, cooldownUntilTurn: 81 } }
                    : { [`turn-${turn}`]: { delayUntilTurn: turn + 2 } },
                nativeWorldInfoTimedState: isBoundary
                    ? {
                        sticky: { boundary: { start: 50, end: 77 } },
                        cooldown: { boundary: { start: 77, end: 81 } },
                    }
                    : { sticky: {}, cooldown: {} },
            },
        });
        if (isBoundary) {boundaryOrder = user.order;}
        if (turn === 120) {laterUserOrder = user.order;}
        await appendTavernMessage(session.id, {
            role: 'assistant',
            content: `助手 ${turn}`,
            provider: `provider-${turn}`,
            model: `model-${turn}`,
            providerPayload: { largePayload },
            requestSnapshot: { turn, largePayload },
        });
    }
    const laterCheckpointBefore = (await getTavernMessage(session.id, laterUserOrder))?.runtimeStateSnapshot;

    const restored = await resolveTavernHistoryBoundaryState({
        sessionId: session.id,
        boundaryOrder,
        currentState: session.state,
    });

    assert.equal(restored.turn, 50);
    assert.deepEqual(restored.worldEntryStates, {
        boundary: { stickyUntilTurn: 77, cooldownUntilTurn: 81 },
    });
    assert.deepEqual(restored.nativeWorldInfoTimedState, {
        sticky: { boundary: { start: 50, end: 77 } },
        cooldown: { boundary: { start: 77, end: 81 } },
    });
    assert.equal(restored.activeMapDocId, 'map-current');
    assert.equal(restored.contract?.memoryArchiving, false);
    assert.equal(restored.lastProvider, 'provider-49');
    assert.equal(restored.lastModel, 'model-49');
    assert.ok(Number(restored.contextWindowStartOrder) < boundaryOrder);
    assert.deepEqual(
        (await getTavernMessage(session.id, laterUserOrder))?.runtimeStateSnapshot,
        laterCheckpointBefore,
    );
});

test('legacy boundary without a checkpoint counts completed turns and clears all worldbook timing gates', async () => {
    await db.delete();
    await db.open();
    const session = await createTavernSession({
        title: 'Legacy boundary',
        state: {
            turn: 4,
            worldEntryStates: { stale: { stickyUntilTurn: 99 } },
            nativeWorldInfoTimedState: {
                sticky: { stale: { start: 1, end: 99 } },
                cooldown: { stale: { start: 1, end: 99 } },
            },
        },
    });
    for (let turn = 0; turn < 3; turn += 1) {
        await appendTavernMessage(session.id, { role: 'user', content: `用户 ${turn}` });
        await appendTavernMessage(session.id, { role: 'assistant', content: `助手 ${turn}` });
    }
    await appendTavernMessage(session.id, { role: 'user', content: '失败轮' });
    await appendTavernMessage(session.id, { role: 'assistant', content: '失败', error: true });
    const boundary = await appendTavernMessage(session.id, { role: 'user', content: '旧用户楼，无锚点' });
    await appendTavernMessage(session.id, { role: 'assistant', content: '边界之后' });

    const restored = await resolveTavernHistoryBoundaryState({
        sessionId: session.id,
        boundaryOrder: boundary.order,
        boundaryUserMessage: boundary,
        currentState: session.state,
    });

    assert.equal(restored.turn, 3);
    assert.deepEqual(restored.worldEntryStates, {});
    assert.deepEqual(restored.nativeWorldInfoTimedState, { sticky: {}, cooldown: {} });
    assert.equal(restored.lastError, '失败');
});
