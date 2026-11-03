import assert from 'node:assert/strict';
import test from 'node:test';

import { createGameController } from '../apps/game/host/controller.js';

function deferred() {
    let resolve;
    const promise = new Promise(resolvePromise => { resolve = resolvePromise; });
    return { promise, resolve };
}

function nextTask() {
    return new Promise(resolve => setTimeout(resolve, 0));
}

function activity(index = 1) {
    return {
        id: `activity-${index}`,
        sourceId: `game-${index}`,
        detail: {
            kind: 'dice',
            outcome: 'player-win',
            challenger: 'dealer',
            finalBid: { count: 3, face: 4, by: 'player' },
            bids: [{ count: 3, face: 4, by: 'player' }],
            playerDice: [1, 2, 3, 4, 5],
            matchingDiceCount: 3,
            dealerDice: ['hidden-die'],
            privateState: 'hidden-record-state',
        },
        amountIn: 50,
        payout: 90,
        net: 40,
        revision: index,
        eventId: `event-${index}`,
        actionId: `action-${index}`,
        assistantTurn: 0,
        createdAt: 1_000 + index,
        deck: ['hidden-card'],
    };
}

function baseView(writeState = 'ready') {
    return {
        revision: 2,
        eventId: 'event-2',
        lockedAmount: 50,
        activeGame: {
            kind: 'dice',
            id: 'dice-1',
            bet: 50,
            playerDice: [1, 2, 3, 4, 5],
            bids: [{ count: 2, face: 3, by: 'player' }, { count: 2, face: 4, by: 'dealer' }],
            legalActions: ['bid', 'challenge'],
            legalBids: [{ count: 2, face: 5 }],
            dealerDice: ['hidden-die'],
            deck: ['hidden-card'],
            random: 'hidden-random',
            privateState: 'hidden-game-state',
        },
        activities: [activity(2)],
        activityPage: { offset: 0, limit: 50, total: 1, hasMore: false },
        balance: 150,
        writeState,
        pendingCommit: false,
        privateState: 'hidden-root-state',
    };
}

function createHarness({ economyOpened = true, writeState = 'ready', records = null } = {}) {
    const host = {
        identity: { key: 'character:game:chat-a', chatId: 'chat-a' },
        posts: [],
    };
    let opened = economyOpened;
    let view = baseView(writeState);
    const allRecords = records || view.activities;
    const commands = [];
    const generationListeners = new Set();
    const dataListeners = new Set();
    let generationActive = false;
    let ensureCalls = 0;
    let refreshCalls = 0;
    const record = method => async (input) => {
        commands.push({ method, input: structuredClone(input) });
        return structuredClone(view);
    };
    const game = {
        readCurrent(input = {}) {
            const offset = input.activityOffset || 0;
            const limit = input.activityLimit || 50;
            const selected = allRecords.slice(offset, offset + limit);
            return structuredClone({
                ...view,
                activities: selected,
                activityPage: {
                    offset,
                    limit,
                    total: allRecords.length,
                    hasMore: offset + selected.length < allRecords.length,
                },
            });
        },
        async refreshCurrent() {
            refreshCalls += 1;
            return structuredClone(view);
        },
        startDice: record('startDice'),
        bidDice: record('bidDice'),
        challengeDice: record('challengeDice'),
        startPush: record('startPush'),
        drawPush: record('drawPush'),
        cashOutPush: record('cashOutPush'),
        startLadder: record('startLadder'),
        stepLadder: record('stepLadder'),
        cashOutLadder: record('cashOutLadder'),
        async confirmPending() {
            view = { ...view, writeState: 'ready' };
            return { status: 'confirmed' };
        },
        getWriteState: () => view.writeState,
        hasPendingSave: () => view.pendingCommit === true,
        subscribe(listener) {
            dataListeners.add(listener);
            return () => dataListeners.delete(listener);
        },
    };
    const economy = {
        isOpen: () => opened,
        async ensureOpen() {
            ensureCalls += 1;
            opened = true;
        },
    };
    const controller = createGameController({
        game,
        economy,
        getChatIdentity: () => host.identity,
        isMainGenerationActive: () => generationActive,
        subscribeGeneration(listener) {
            generationListeners.add(listener);
            return () => generationListeners.delete(listener);
        },
    });
    controller.startBackground();
    return {
        game,
        commands,
        controller,
        host,
        get ensureCalls() {return ensureCalls;},
        get refreshCalls() {return refreshCalls;},
        setGeneration(active) {
            generationActive = active;
            generationListeners.forEach(listener => listener(active));
        },
        setView(next) {view = structuredClone(next);},
        publishData() {dataListeners.forEach(listener => listener({ identityKey: host.identity.key }));},
    };
}

async function activate(harness, { waitForPreparation = true } = {}) {
    const initial = await harness.controller.activate({
        post(type, payload) {
            harness.host.posts.push({ type, payload });
            return true;
        },
    });
    if (!waitForPreparation) {return initial;}
    await nextTask();
    return harness.host.posts.findLast(post => post.type === 'game/state')?.payload.state || initial;
}

function assertNoHiddenFields(value) {
    // `dealerDice` is not forbidden outright: a settled hand publishes it so the
    // showdown can be rendered. Only a live game must keep it secret, which is
    // asserted separately below.
    const forbidden = new Set(['deck', 'random', 'privateState']);
    const visit = current => {
        if (!current || typeof current !== 'object') {return;}
        for (const [key, child] of Object.entries(current)) {
            assert.equal(forbidden.has(key), false, `public state included ${key}`);
            visit(child);
        }
    };
    visit(value);
    if (value?.activeGame) {
        assert.equal(
            Object.hasOwn(value.activeGame, 'dealerDice'),
            false,
            'live game leaked dealerDice',
        );
    }
}

test('Game prepares a missing Economy only and strips hidden service fields', async () => {
    const unopened = createHarness({ economyOpened: false });
    const loading = await activate(unopened, { waitForPreparation: false });
    assert.equal(loading.status, 'loading');
    assert.equal(unopened.ensureCalls, 0);
    await nextTask();
    const openedState = unopened.host.posts.findLast(post => post.type === 'game/state').payload.state;
    assert.equal(openedState.balance, 150);
    assert.equal(unopened.ensureCalls, 1);
    assertNoHiddenFields(openedState);

    const existing = createHarness();
    const initial = await activate(existing, { waitForPreparation: false });
    assert.equal(initial.status, 'ready');
    assert.equal(existing.ensureCalls, 0);
    assert.deepEqual(initial.activeGame.playerDice, [1, 2, 3, 4, 5]);
    assert.equal(initial.records[0].payout, 90);
    assertNoHiddenFields(initial);
    await nextTask();
    assert.equal(existing.ensureCalls, 0);
    assert.equal(existing.host.posts.length, 0);
});

test('Game protocol forwards only explicit fields for every game action', async () => {
    const scenarios = [
        ['game/dice/start', 'startDice', { bet: 80 }, { bet: 80 }],
        ['game/dice/bid', 'bidDice', { gameId: 'dice-1', bid: { count: 3, face: 4, probability: 1 }, payout: 999 }, {
            gameId: 'dice-1', bid: { count: 3, face: 4 },
        }],
        ['game/dice/challenge', 'challengeDice', { gameId: 'dice-1' }, { gameId: 'dice-1' }],
        ['game/push/start', 'startPush', {}, {}],
        ['game/push/draw', 'drawPush', { gameId: 'push-1', deck: ['coin'] }, { gameId: 'push-1' }],
        ['game/push/cash-out', 'cashOutPush', { gameId: 'push-1', payout: 500 }, { gameId: 'push-1' }],
        ['game/ladder/start', 'startLadder', { bet: 120, probability: 10_000 }, { bet: 120 }],
        ['game/ladder/step', 'stepLadder', { gameId: 'ladder-1', choice: 'risky', random: 0 }, {
            gameId: 'ladder-1', choice: 'risky',
        }],
        ['game/ladder/cash-out', 'cashOutLadder', { gameId: 'ladder-1', privateState: {} }, { gameId: 'ladder-1' }],
    ];

    for (const [type, method, fields, expectedFields] of scenarios) {
        const harness = createHarness();
        await activate(harness);
        await harness.controller.handleMessage({
            type,
            payload: {
                chatIdentity: harness.host.identity.key,
                expectedRevision: 2,
                expectedEventId: 'event-2',
                actionId: `ui-${method}`,
                dealerDice: [6, 6, 6, 6, 6],
                ...fields,
            },
        });
        assert.deepEqual(harness.commands, [{
            method,
            input: {
                expectedRevision: 2,
                expectedEventId: 'event-2',
                actionId: `ui-${method}`,
                ...expectedFields,
            },
        }]);
    }
});

test('Game serializes writes and invalidates a pending result after a chat switch', async () => {
    const harness = createHarness();
    await activate(harness);
    const pending = deferred();
    harness.game.drawPush = () => pending.promise;
    const payload = {
        chatIdentity: harness.host.identity.key,
        expectedRevision: 2,
        expectedEventId: 'event-2',
        actionId: 'pending-draw',
        gameId: 'push-1',
    };
    const first = harness.controller.handleMessage({ type: 'game/push/draw', payload });
    await assert.rejects(
        harness.controller.handleMessage({
            type: 'game/push/cash-out',
            payload: { ...payload, actionId: 'second-action' },
        }),
        /已有游戏操作正在处理/,
    );

    harness.host.identity = { key: 'character:game:chat-b', chatId: 'chat-b' };
    pending.resolve(baseView());
    await assert.rejects(first, /聊天已切换/);
    harness.controller.handleChatChanged();
    await assert.rejects(
        harness.controller.handleMessage({ type: 'game/refresh', payload: { chatIdentity: payload.chatIdentity } }),
        /游戏 APP 未激活/,
    );
});

test('Game pages records explicitly and publishes save recovery states', async () => {
    const records = Array.from({ length: 55 }, (_, index) => activity(55 - index));
    const harness = createHarness({ writeState: 'unconfirmed', records });
    const initial = await activate(harness);
    assert.equal(initial.status, 'unconfirmed');
    assert.equal(initial.records.length, 50);
    assert.equal(initial.hasMore, true);

    const page = await harness.controller.handleMessage({
        type: 'game/records/load-more',
        payload: { chatIdentity: harness.host.identity.key, offset: 50, limit: 1, deck: ['hidden-card'] },
    });
    assert.equal(page.records.length, 5);
    assert.equal(page.offset, 50);
    assert.equal(page.hasMore, false);
    assertNoHiddenFields(page);

    const confirmation = await harness.controller.handleMessage({
        type: 'game/confirm-save',
        payload: { chatIdentity: harness.host.identity.key },
    });
    assert.equal(confirmation.confirmation, 'confirmed');
    assert.equal(confirmation.state.status, 'ready');

});

test('Game refresh strongly reloads its current Game and Economy projection', async () => {
    const harness = createHarness();
    await activate(harness);

    const result = await harness.controller.handleMessage({
        type: 'game/refresh',
        payload: { chatIdentity: harness.host.identity.key },
    });

    assert.equal(harness.refreshCalls, 1);
    assert.equal(result.status, 'ready');
});

test('Game does not present another partition pending write as an unsaved round', async () => {
    const harness = createHarness({ writeState: 'failed' });

    const state = await activate(harness);

    assert.equal(state.status, 'blocked');
    assert.doesNotMatch(state.message, /本局|赌局/);
});

test('Game keeps in-flight projections private and identifies a retained save candidate', async () => {
    const harness = createHarness();
    await activate(harness);
    const pending = deferred();
    harness.game.challengeDice = () => pending.promise;
    const payload = {
        chatIdentity: harness.host.identity.key,
        expectedRevision: 2,
        expectedEventId: 'event-2',
        actionId: 'challenge-with-slow-save',
        gameId: 'dice-1',
    };
    const action = harness.controller.handleMessage({ type: 'game/dice/challenge', payload });

    harness.setView({ ...baseView('saving'), revision: 3, eventId: 'event-3', activeGame: undefined });
    harness.publishData();
    assert.equal(harness.host.posts.length, 0);

    harness.setView({ ...baseView('failed'), pendingCommit: true });
    pending.resolve(Promise.reject(Object.assign(new Error('rejected'), { code: 'storage_rejected' })));
    await assert.rejects(
        action,
        error => error.code === 'game_save_pending' && error.retryable === true,
    );
    assert.equal(harness.host.posts.length, 0);
});

test('Game publishes main-generation state without invoking a game command', async () => {
    const harness = createHarness();
    await activate(harness);

    harness.setGeneration(true);

    const pushed = harness.host.posts.findLast(post => post.type === 'game/state').payload.state;
    assert.equal(pushed.generationActive, true);
    assert.deepEqual(harness.commands, []);
});

test('Game publishes a transient saving candidate before persistence completes', async () => {
    const harness = createHarness();
    await activate(harness);
    harness.setView({
        ...baseView('saving'),
        revision: 3,
        eventId: 'event-3',
        lockedAmount: 0,
        activeGame: undefined,
    });

    harness.publishData();

    const pushed = harness.host.posts.findLast(post => post.type === 'game/state').payload.state;
    assert.equal(pushed.status, 'saving');
    assert.equal(pushed.revision, 3);
    assert.equal(pushed.activeGame, null);
});
