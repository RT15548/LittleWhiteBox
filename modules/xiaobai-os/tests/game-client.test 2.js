import assert from 'node:assert/strict';
import test from 'node:test';
import { createGameClient } from '../apps/game/ui/game-client.js';
import { diceCall, availableFaces } from '../apps/game/ui/rooms/dice/bid-presentation.js';

// These tests exercise the frame connection's money/retry contract, not Vue markup.
const initial = (patch = {}) => ({
    chatIdentity: 'chat-a', currency: '小白币', balance: 950, lockedAmount: 50,
    revision: 2, eventId: 'event-2', status: 'ready', message: '', generationActive: false,
    activeGame: { kind: 'push', id: 'hand-1', bet: 50, revealedCoins: 1, cashoutAmount: 50, remainingCards: 9, remainingBombs: 3, nextBombProbabilityBps: 3333, legalActions: ['draw', 'cash-out'] },
    records: [], offset: 0, total: 0, hasMore: false, ...patch,
});
function harness(value = initial()) {
    const calls = [];
    let subscriber = () => {};
    const bridge = {
        subscribe(fn) {subscriber = fn; return () => {subscriber = () => {};};},
        request(endpoint, payload) {
            return new Promise((resolve, reject) => {calls.push({endpoint, payload: structuredClone(payload), resolve, reject});});
        },
    };
    return { client: createGameClient(bridge, value), calls, push(state) {subscriber({type: 'game/state', payload: {state}});} };
}
const draw = {endpoint: 'game/push/draw', payload: {gameId: 'hand-1'}};
const record = { id: 'r1', gameId: 'hand-1', game: 'push', gameLabel: '翻牌寻金', outcome: 'busted', outcomeLabel: '翻到了炸弹', outcomeTone: 'loss', amountIn: 50, payout: 0, net: -50, createdAt: 1, detail: {kind: 'push', revealedCoins: 1} };

test('a timed out action retries its exact original CAS, action id and payload', async () => {
    const {client, calls} = harness();
    const action = structuredClone(draw);
    const pending = client.act(action);
    action.payload.gameId = 'changed-draft';
    calls[0].reject(new Error('host_request_timeout'));
    assert.equal(await pending, false);
    assert.equal(await client.act(draw), false);
    assert.equal(calls.length, 1);
    const retried = client.retry();
    assert.deepEqual(calls[1].payload, calls[0].payload);
    assert.equal(calls[1].payload.gameId, 'hand-1');
    calls[1].resolve({result: initial({revision: 3, eventId: 'event-3'})});
    assert.equal(await retried, true);
    assert.equal(client.failed.value, null);
    client.dispose();
});

for (const [code, status] of [['game_save_pending','save-failed'], ['storage_unconfirmed','unconfirmed'], ['storage_conflict','conflict']]) {
    test(code + ' freezes new actions without exposing an unconfirmed result', async () => {
        const {client, calls} = harness();
        const action = client.act(draw);
        calls[0].reject(Object.assign(new Error(code), {code}));
        await action;
        assert.equal(client.state.value.status, status);
        assert.equal(client.settlement.value, null);
        assert.equal(client.funds.value.balance, 950);
        assert.equal(await client.act(draw), false);
        await client.refresh();
        assert.equal(calls.length, 1);
        if (status !== 'conflict') {
            const confirmation = client.confirmSave();
            assert.equal(calls[1].endpoint, 'game/confirm-save');
            assert.deepEqual(calls[1].payload, {chatIdentity: 'chat-a'});
            calls[1].resolve({result: {state: initial({activeGame: null, lockedAmount: 0, records: [record], total: 1})}});
            await confirmation;
            assert.equal(client.settlement.value.record.outcome, 'busted');
        }
        client.dispose();
    });
}

test('confirmed endings hold the old balance until the result is revealed', async () => {
    const {client, calls} = harness();
    const pending = client.act(draw);
    assert.equal(await client.act(draw), false);
    assert.equal(client.settlement.value, null);
    const won = {...record, payout: 100, net: 50, outcome: 'cashed-out'};
    calls[0].resolve({result: initial({balance: 1050, lockedAmount: 0, activeGame: null, records: [won], total: 1})});
    await pending;
    assert.equal(client.settlement.value.before.revealedCoins, 1);
    assert.equal(client.settlement.value.balanceAfter, 1050);
    assert.deepEqual({...client.funds.value}, {balance: 950, lockedAmount: 50});
    client.revealComplete();
    assert.equal(client.funds.value.balance, 1050);
    assert.equal(client.settlement.value.record.id, won.id);
    client.dismissSettlement();
    assert.equal(client.settlement.value, null);
    assert.equal(calls.length, 1); // "again" never places another stake.
    client.dispose();
});

test('a newer host push wins over a late reply or error', async () => {
    for (const reject of [false, true]) {
        const {client, calls, push} = harness();
        const pending = client.act(draw);
        push(initial({revision: 4, eventId: 'event-4'}));
        if (reject) {calls[0].reject(Object.assign(new Error('storage_unconfirmed'), {code: 'storage_unconfirmed'}));}
        else {calls[0].resolve({result: initial({revision: 3, eventId: 'event-3'})});}
        await pending;
        assert.equal(client.state.value.revision, 4);
        assert.equal(client.state.value.status, 'ready');
        assert.equal(client.failed.value, null);
        client.dispose();
    }
});

test('switching away and back fences the previous chat request', async () => {
    const {client, calls, push} = harness();
    const old = client.act(draw);
    push(initial({chatIdentity: 'chat-b', activeGame: null}));
    push(initial());
    const current = client.act(draw);
    calls[0].resolve({result: initial({balance: 0})});
    await old;
    assert.equal(client.funds.value.balance, 950);
    assert.notEqual(client.inFlight.value, null);
    calls[1].resolve({result: initial({revision: 3})});
    await current;
    client.dispose();
});

test('late record pages do not mix with a newer host state', async () => {
    const {client, calls, push} = harness(initial({hasMore: true, records: [record], total: 100}));
    const pending = client.loadMore();
    push(initial({revision: 8, records: [], total: 0}));
    calls[0].resolve({result: {records: [record], total: 100, hasMore: true}});
    await pending;
    assert.equal(client.state.value.records.length, 0);
    assert.equal(client.state.value.total, 0);
    client.dispose();
});

test('main generation and disposed views cannot issue new actions', async () => {
    const {client, calls} = harness(initial({generationActive: true}));
    assert.equal(await client.act(draw), false);
    client.dispose();
    assert.equal(await client.act(draw), false);
    assert.equal(calls.length, 0);
});

test('calls read like table talk and only offer legal faces at the selected count', () => {
    assert.equal(diceCall({count: 4, face: 6}), '四个六');
    assert.equal(diceCall({count: 10, face: 2}), '十个二');
    assert.equal(diceCall({count: 0, face: 5}), '零个五');
    assert.deepEqual(availableFaces([{count: 4, face: 5}, {count: 4, face: 6}, {count: 5, face: 2}], 4), [5, 6]);
});
