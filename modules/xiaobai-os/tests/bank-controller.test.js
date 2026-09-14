import assert from 'node:assert/strict';
import test from 'node:test';

import { createBankController } from '../apps/bank/host/controller.js';

function deferred() {
    let resolve;
    const promise = new Promise(resolvePromise => {resolve = resolvePromise;});
    return { promise, resolve };
}

function nextTask() {
    return new Promise(resolve => setTimeout(resolve, 0));
}

function products() {
    return {
        deposits: [{
            id: 'short-term',
            name: '短期存单',
            lockRounds: 10,
            interestBps: 600,
            earlyPenaltyBps: 300,
            minAmount: 100,
            maxAmount: 2_000,
        }],
        funds: [{
            id: 'steady-fund',
            name: '稳健基金',
            description: '小幅波动，稳步前行。',
            lockRounds: 20,
            returnRangeBps: { min: -500, max: 2_000 },
            riskLevel: 'low',
            minAmount: 200,
            maxAmount: 3_000,
        }],
    };
}

function activity(index) {
    const fund = index % 2 === 1;
    return {
        id: `activity-${index}`,
        sourceId: `position-${index}`,
        detail: fund
            ? { kind: 'fund', productId: 'steady-fund', resolvedReturnBps: 500 }
            : { kind: 'deposit', productId: 'short-term', outcome: 'matured' },
        amountIn: 100,
        payout: fund ? 105 : 106,
        net: fund ? 5 : 6,
        revision: index + 1,
        eventId: `event-${index}`,
        actionId: `action-${index}`,
        assistantTurn: index + 10,
        createdAt: 1_000 + index,
    };
}

function createHarness({ economyOpened = true, writeState = 'ready', activityCount = 0, prepareGate = null } = {}) {
    const host = {
        identity: { key: 'character:1:bank-chat', chatId: 'bank-chat' },
        posts: [],
    };
    const activities = Array.from({ length: activityCount }, (_, index) => activity(index));
    let opened = economyOpened;
    let generationActive = false;
    let generationListener = null;
    let ensureCalls = 0;
    let view = {
        revision: 0,
        eventId: '',
        currentTurn: 4,
        lockedAmount: 500,
        products: products(),
        deposits: [{
            id: 'deposit-1',
            productId: 'short-term',
            name: '短期存单',
            principal: 100,
            startTurn: 0,
            maturityTurn: 10,
            remainingTurns: 6,
            claimable: false,
            maturityAmount: 106,
            earlyWithdrawalAmount: 97,
        }],
        investments: [{
            id: 'fund-1',
            productId: 'steady-fund',
            name: '稳健基金',
            description: '小幅波动，稳步前行。',
            riskLevel: 'low',
            principal: 400,
            startTurn: 0,
            maturityTurn: 20,
            remainingTurns: 16,
            claimable: false,
            resolvedReturnBps: 1_777,
            settlementAmount: 471,
            randomSeed: 'must-not-leak',
        }],
        balance: 1_500,
        writeState,
    };
    const commands = [];
    const reads = [];

    function readCurrent(options = {}) {
        reads.push(structuredClone(options));
        const offset = options.activityOffset || 0;
        const limit = options.activityLimit || 50;
        return structuredClone({
            ...view,
            activities: activities.slice(offset, offset + limit),
            activityPage: {
                offset,
                limit,
                total: activities.length,
                hasMore: offset + limit < activities.length,
            },
        });
    }

    function mutate(kind, input) {
        commands.push({ kind, input: structuredClone(input) });
        const revision = view.revision + 1;
        view = { ...view, revision, eventId: `bank-event-${revision}` };
        return Promise.resolve(readCurrent());
    }

    const bank = {
        readCurrent,
        subscribe: () => () => undefined,
        openDeposit: input => mutate('deposit-open', input),
        withdrawDeposit: input => mutate('deposit-withdraw', input),
        openFund: input => mutate('fund-open', input),
        settleDue: input => mutate('settle-due', input),
        async confirmPending() {
            view = { ...view, writeState: 'ready' };
            return { status: 'confirmed' };
        },
        getWriteState: () => view.writeState,
    };
    const economy = {
        isOpen: () => opened,
        async ensureOpen() {
            ensureCalls += 1;
            if (prepareGate) {await prepareGate.promise;}
            opened = true;
        },
    };
    const controller = createBankController({
        bank,
        economy,
        getChatIdentity: () => host.identity,
        isMainGenerationActive: () => generationActive,
        subscribeGeneration(listener) {
            generationListener = listener;
            return () => {generationListener = null;};
        },
    });
    controller.startBackground();
    return {
        bank,
        commands,
        controller,
        host,
        reads,
        get ensureCalls() {return ensureCalls;},
        setGeneration(active) {
            generationActive = active;
            generationListener?.();
        },
        setWriteState(next) {view = { ...view, writeState: next };},
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
    return harness.host.posts.findLast(post => post.type === 'bank/state')?.payload.state || initial;
}

function payload(harness, state, intent = {}) {
    return {
        chatIdentity: harness.host.identity.key,
        expectedRevision: state.revision,
        expectedEventId: state.eventId,
        actionId: `ui-action-${state.revision + 1}`,
        ...intent,
    };
}

test('activation prepares a missing Economy only and projects safe locked-fund fields', async () => {
    const unopened = createHarness({ economyOpened: false });
    const loading = await activate(unopened, { waitForPreparation: false });
    assert.equal(loading.status, 'loading');
    assert.equal(unopened.ensureCalls, 0);
    await nextTask();
    const fresh = unopened.host.posts.findLast(post => post.type === 'bank/state').payload.state;
    assert.equal(fresh.balance, 1_500);
    assert.equal(fresh.status, 'ready');
    assert.equal(unopened.ensureCalls, 1);

    const lockedFund = fresh.investments[0];
    assert.equal(lockedFund.status, 'locked');
    assert.equal(lockedFund.remainingTurns, 16);
    assert.equal(lockedFund.claimable, false);
    assert.equal(Object.hasOwn(lockedFund, 'resolvedReturnBps'), false);
    assert.equal(Object.hasOwn(lockedFund, 'settlementAmount'), false);
    assert.equal(Object.hasOwn(lockedFund, 'randomSeed'), false);

    const existing = createHarness();
    const ready = await activate(existing, { waitForPreparation: false });
    assert.equal(ready.status, 'ready');
    assert.equal(existing.ensureCalls, 0);
    await nextTask();
    assert.equal(existing.ensureCalls, 0);
    assert.equal(existing.host.posts.length, 0);
});

test('write protocols forward only identity-bound intent, CAS, and action fields', async () => {
    const harness = createHarness();
    let state = await activate(harness);
    const forbidden = {
        contract: { interestBps: 99_999 },
        maturityAmount: 99_999,
        earlyWithdrawalAmount: 99_999,
        resolvedReturnBps: 99_999,
        settlementAmount: 99_999,
        payout: 99_999,
        random: 7,
    };

    state = await harness.controller.handleMessage({
        type: 'bank/deposit/open',
        payload: payload(harness, state, { productId: 'short-term', amount: 200, ...forbidden }),
    });
    state = await harness.controller.handleMessage({
        type: 'bank/deposit/withdraw',
        payload: payload(harness, state, { positionId: 'deposit-1', ...forbidden }),
    });
    state = await harness.controller.handleMessage({
        type: 'bank/fund/open',
        payload: payload(harness, state, { productId: 'steady-fund', amount: 300, ...forbidden }),
    });
    await harness.controller.handleMessage({
        type: 'bank/settle-due',
        payload: payload(harness, state, forbidden),
    });

    assert.deepEqual(harness.commands, [
        {
            kind: 'deposit-open',
            input: { expectedRevision: 0, expectedEventId: '', actionId: 'ui-action-1', productId: 'short-term', amount: 200 },
        },
        {
            kind: 'deposit-withdraw',
            input: { expectedRevision: 1, expectedEventId: 'bank-event-1', actionId: 'ui-action-2', positionId: 'deposit-1' },
        },
        {
            kind: 'fund-open',
            input: { expectedRevision: 2, expectedEventId: 'bank-event-2', actionId: 'ui-action-3', productId: 'steady-fund', amount: 300 },
        },
        {
            kind: 'settle-due',
            input: { expectedRevision: 3, expectedEventId: 'bank-event-3', actionId: 'ui-action-4' },
        },
    ]);

    await assert.rejects(harness.controller.handleMessage({
        type: 'bank/deposit/open',
        payload: payload(harness, state, { productId: 'short-term', amount: '200' }),
    }));
    assert.equal(harness.commands.length, 4);
});

test('records use service-backed offset pagination and preserve settlement amounts', async () => {
    const harness = createHarness({ activityCount: 75 });
    const initial = await activate(harness);
    assert.equal(initial.activities.length, 50);
    assert.equal(initial.activityPage.hasMore, true);
    assert.equal(initial.activities[1].kind, 'fund');
    assert.equal(initial.activities[1].payout, 105);
    assert.equal(initial.activities[1].net, 5);

    const page = await harness.controller.handleMessage({
        type: 'bank/records/load-more',
        payload: { chatIdentity: harness.host.identity.key, offset: 50, payout: 100_000 },
    });
    assert.equal(page.activities.length, 25);
    assert.equal(page.activityPage.offset, 50);
    assert.equal(page.activityPage.hasMore, false);
    assert.deepEqual(harness.reads.at(-1), { activityOffset: 50, activityLimit: 50 });
});

test('controller serializes every write and rejects a late result after chat identity changes', async () => {
    const harness = createHarness();
    const initial = await activate(harness);
    const pending = deferred();
    harness.bank.openDeposit = () => pending.promise;
    const commandPayload = payload(harness, initial, { productId: 'short-term', amount: 200 });
    const first = harness.controller.handleMessage({ type: 'bank/deposit/open', payload: commandPayload });

    await assert.rejects(harness.controller.handleMessage({
        type: 'bank/confirm-save',
        payload: { chatIdentity: harness.host.identity.key },
    }));

    harness.host.identity = { key: 'character:2:other-chat', chatId: 'other-chat' };
    pending.resolve(harness.bank.readCurrent());
    await assert.rejects(first);
    harness.controller.handleChatChanged();
    await assert.rejects(harness.controller.handleMessage({
        type: 'bank/refresh',
        payload: { chatIdentity: commandPayload.chatIdentity },
    }));
});

test('a stale first-time Economy preparation cannot update a page after the chat changes', async () => {
    const gate = deferred();
    const harness = createHarness({ economyOpened: false, prepareGate: gate });
    const opening = await activate(harness, { waitForPreparation: false });
    assert.equal(opening.status, 'loading');
    await nextTask();
    const postCount = harness.host.posts.length;
    harness.host.identity = { key: 'character:2:other-chat', chatId: 'other-chat' };
    gate.resolve();
    await nextTask();
    assert.equal(harness.host.posts.length, postCount);
    harness.controller.handleChatChanged();
    await assert.rejects(harness.controller.handleMessage({
        type: 'bank/refresh',
        payload: { chatIdentity: 'character:1:bank-chat' },
    }));
});

test('unconfirmed status recovers through the shared save confirmation', async () => {
    const harness = createHarness({ writeState: 'unconfirmed' });
    const initial = await activate(harness);
    assert.equal(initial.status, 'unconfirmed');

    const result = await harness.controller.handleMessage({
        type: 'bank/confirm-save',
        payload: { chatIdentity: harness.host.identity.key, payout: 100_000 },
    });
    assert.equal(result.confirmation, 'confirmed');
    assert.equal(result.state.status, 'ready');
});

test('generation changes push a fresh first page without writing Bank data', async () => {
    const harness = createHarness({ activityCount: 75 });
    await activate(harness);
    harness.setGeneration(true);
    assert.equal(harness.host.posts.at(-1).payload.state.generationActive, true);

    const pushed = harness.host.posts.at(-1).payload.state;
    assert.equal(pushed.status, 'ready');
    assert.equal(pushed.activities.length, 50);
    assert.equal(harness.commands.length, 0);
});
