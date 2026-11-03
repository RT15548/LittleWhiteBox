import assert from 'node:assert/strict';
import test from 'node:test';

import { validateBankDomain } from '../domains/bank/invariants.js';
import {
    createBankDepositFrozenContract,
    createBankFundFrozenContract,
    getBankDepositContract,
    getBankFundContract,
} from '../domains/bank/products.js';
import {
    appendBankEvent,
    calculateBankLockedAmount,
    createEmptyBankDomain,
    createEmptyBankState,
    flattenBankActivities,
    getBankCasToken,
    replayBankEvents,
} from '../domains/bank/timeline.js';
import { createBankView } from '../domains/bank/view.js';

function depositPosition(id, productId = 'short-term', principal = 100, startTurn = 0) {
    const product = getBankDepositContract(productId);
    return {
        id,
        productId,
        principal,
        startTurn,
        maturityTurn: startTurn + product.lockRounds,
        ...createBankDepositFrozenContract(product, principal),
    };
}

function fundPosition(id, productId = 'steady-fund', principal = 200, startTurn = 0, returnBps = -500) {
    const product = getBankFundContract(productId);
    return {
        id,
        productId,
        principal,
        startTurn,
        maturityTurn: startTurn + product.lockRounds,
        ...createBankFundFrozenContract(product, principal, returnBps),
    };
}

function eventInput(domain, sequence, command, result, options = {}) {
    return {
        ...getBankCasToken(domain),
        eventId: `bank-event-${sequence}`,
        actionId: `bank-action-${sequence}`,
        command,
        result,
        assistantTurn: 0,
        createdAt: 1_000 + sequence,
        ...options,
    };
}

function append(domain, sequence, command, result, options) {
    const assistantTurn = options?.assistantTurn ?? domain.currentTurn;
    return appendBankEvent({ ...domain, currentTurn: Math.max(domain.currentTurn, assistantTurn) },
        eventInput(domain, sequence, command, result, { assistantTurn, ...options }));
}

function openDeposit(domain, sequence, position, options) {
    return append(domain, sequence, {
        kind: 'deposit-open',
        productId: position.productId,
        positionId: position.id,
        amount: position.principal,
        settledPositionIds: [],
    }, {
        changes: [{ kind: 'deposit-opened', position }],
        activities: [],
    }, options);
}

function openFund(domain, sequence, position, options) {
    return append(domain, sequence, {
        kind: 'fund-open',
        productId: position.productId,
        positionId: position.id,
        amount: position.principal,
        settledPositionIds: [],
    }, {
        changes: [{ kind: 'fund-opened', position }],
        activities: [],
    }, options);
}

function earlyWithdraw(domain, sequence, position, options = {}) {
    const assistantTurn = options.assistantTurn ?? position.startTurn + 1;
    return append(domain, sequence, {
        kind: 'deposit-withdraw-early',
        positionId: position.id,
        settledPositionIds: [],
    }, {
        changes: [{ kind: 'positions-closed', positionIds: [position.id] }],
        activities: [{
            id: `activity-${position.id}`,
            sourceId: position.id,
            detail: { kind: 'deposit', productId: position.productId, outcome: 'withdrawn-early' },
            amountIn: position.principal,
            payout: position.earlyWithdrawalAmount,
            net: position.earlyWithdrawalAmount - position.principal,
        }],
    }, { ...options, assistantTurn });
}

function maturityActivity(position) {
    if ('maturityAmount' in position) {
        return {
            id: `activity-${position.id}`,
            sourceId: position.id,
            detail: { kind: 'deposit', productId: position.productId, outcome: 'matured' },
            amountIn: position.principal,
            payout: position.maturityAmount,
            net: position.maturityAmount - position.principal,
        };
    }
    return {
        id: `activity-${position.id}`,
        sourceId: position.id,
        detail: { kind: 'fund', productId: position.productId, resolvedReturnBps: position.resolvedReturnBps },
        amountIn: position.principal,
        payout: position.settlementAmount,
        net: position.settlementAmount - position.principal,
    };
}

function settleDue(domain, sequence, positions, assistantTurn, options = {}) {
    const positionIds = positions.map((position) => position.id);
    return append(domain, sequence, {
        kind: 'settle-due',
        settledPositionIds: positionIds,
    }, {
        changes: [{ kind: 'positions-closed', positionIds }],
        activities: positions.map(maturityActivity),
    }, { ...options, assistantTurn });
}

test('bank events replay finance changes and flatten activities at their event boundary', () => {
    const position = depositPosition('deposit-1');
    const opened = openDeposit(createEmptyBankDomain(), 1, position);
    const closed = earlyWithdraw(opened.domain, 2, position);

    assert.deepEqual(createEmptyBankState(), { openDeposits: [], openInvestments: [] });
    assert.deepEqual(replayBankEvents(opened.domain), {
        openDeposits: [position],
        openInvestments: [],
    });
    assert.deepEqual(replayBankEvents(closed.domain), createEmptyBankState());
    assert.deepEqual(flattenBankActivities(closed.domain), [{
        id: 'activity-deposit-1',
        sourceId: 'deposit-1',
        detail: { kind: 'deposit', productId: 'short-term', outcome: 'withdrawn-early' },
        amountIn: 100,
        payout: 97,
        net: -3,
        revision: 2,
        eventId: 'bank-event-2',
        actionId: 'bank-action-2',
        assistantTurn: 1,
        createdAt: 1_002,
    }]);
    assert.deepEqual(getBankCasToken(closed.domain), {
        expectedRevision: 2,
        expectedEventId: 'bank-event-2',
    });
});

test('Bank chronology preserves regressed wall-clock timestamps', () => {
    const position = depositPosition('clock-bank');
    const opened = openDeposit(createEmptyBankDomain(), 1, position, { createdAt: 2_000 });
    const closed = earlyWithdraw(opened.domain, 2, position, { createdAt: 1_000 });

    assert.equal(closed.domain.events[1].createdAt, 1_000);
    assert.deepEqual(replayBankEvents(closed.domain), createEmptyBankState());
});

test('validation rejects non-canonical shapes, forged contracts, money, activities and timelines', () => {
    const position = depositPosition('deposit-strict');
    const valid = openDeposit(createEmptyBankDomain(), 1, position).domain;
    validateBankDomain(valid);

    const extraDomain = structuredClone(valid);
    extraDomain.metadata = {};
    const extraCommand = structuredClone(valid);
    extraCommand.events[0].command.untrusted = true;
    const wrongRevision = structuredClone(valid);
    wrongRevision.events[0].revision = 2;
    const paddedId = structuredClone(valid);
    paddedId.events[0].eventId = ' padded ';
    const badTimestamp = structuredClone(valid);
    badTimestamp.events[0].createdAt = 1.5;
    const badPrincipal = structuredClone(valid);
    badPrincipal.events[0].result.changes[0].position.principal = -100;
    const forgedContract = structuredClone(valid);
    forgedContract.events[0].result.changes[0].position.maturityAmount += 1;

    for (const candidate of [
        extraDomain,
        extraCommand,
        wrongRevision,
        paddedId,
        badTimestamp,
        badPrincipal,
        forgedContract,
    ]) {
        assert.throws(() => validateBankDomain(candidate), error => error.code === 'bank_invalid_domain');
    }

    const closed = earlyWithdraw(valid, 2, position).domain;
    const badNet = structuredClone(closed);
    badNet.events[1].result.activities[0].net = 0;
    assert.throws(() => validateBankDomain(badNet), error => error.code === 'bank_invalid_domain');
    const extraDetail = structuredClone(closed);
    extraDetail.events[1].result.activities[0].detail.note = 'forged';
    assert.throws(() => validateBankDomain(extraDetail), error => error.code === 'bank_invalid_domain');
    const duplicateActivity = structuredClone(closed);
    duplicateActivity.events[1].result.activities.push(structuredClone(duplicateActivity.events[1].result.activities[0]));
    assert.throws(() => validateBankDomain(duplicateActivity), error => error.code === 'bank_invalid_domain');
});

test('due settlement and early withdrawal close positions with their exact frozen payouts', () => {
    const deposit = depositPosition('deposit-due');
    const fund = fundPosition('fund-later');
    let domain = openDeposit(createEmptyBankDomain(), 1, deposit).domain;
    domain = openFund(domain, 2, fund).domain;

    assert.throws(() => append(domain, 3, {
        kind: 'settle-due',
        settledPositionIds: [],
    }, {
        changes: [],
        activities: [],
    }, { assistantTurn: 10 }), error => error.code === 'bank_invalid_domain');

    const settled = settleDue(domain, 3, [deposit], 10);
    assert.deepEqual(settled.event.result.activities, [maturityActivity(deposit)]);
    assert.deepEqual(settled.state, {
        openDeposits: [],
        openInvestments: [fund],
    });
    assert.equal(calculateBankLockedAmount(settled.state), 200);

    const early = depositPosition('deposit-early', 'mid-term', 200, 5);
    const earlyDomain = openDeposit(createEmptyBankDomain(), 4, early, { assistantTurn: 5 }).domain;
    const withdrawn = earlyWithdraw(earlyDomain, 5, early, { assistantTurn: 6 });
    assert.deepEqual(withdrawn.state, createEmptyBankState());
    assert.equal(withdrawn.event.result.activities[0].payout, 190);
    assert.equal(withdrawn.event.result.activities[0].detail.outcome, 'withdrawn-early');
});

test('CAS append is immutable and idempotent action replay precedes stale-token checks', () => {
    const deposit = depositPosition('deposit-cas');
    const empty = createEmptyBankDomain();
    const firstInput = eventInput(empty, 1, {
        kind: 'deposit-open',
        productId: deposit.productId,
        positionId: deposit.id,
        amount: deposit.principal,
        settledPositionIds: [],
    }, {
        changes: [{ kind: 'deposit-opened', position: deposit }],
        activities: [],
    });
    const first = appendBankEvent(empty, firstInput);
    const fund = fundPosition('fund-cas');
    const second = openFund(first.domain, 2, fund);
    const replay = appendBankEvent(second.domain, firstInput);

    assert.equal(first.created, true);
    assert.equal(replay.created, false);
    assert.equal(replay.event.eventId, 'bank-event-1');
    assert.equal(replay.domain.events.length, 2);
    assert.deepEqual(empty, createEmptyBankDomain());
    replay.state.openDeposits[0].principal = 999;
    assert.equal(second.domain.events[0].result.changes[0].position.principal, 100);

    assert.throws(() => appendBankEvent(second.domain, {
        ...firstInput,
        command: { ...firstInput.command, amount: 101 },
    }), error => error.code === 'bank_action_conflict');
    assert.throws(() => openFund(second.domain, 3, fund, {
        expectedRevision: 0,
        expectedEventId: '',
    }), error => error.code === 'bank_revision_conflict');
});

test('global turn clock rejects event regressions without deleting committed positions', () => {
    const later = depositPosition('opened-later', 'short-term', 100, 8);
    let domain = openDeposit(createEmptyBankDomain(), 1, later, { assistantTurn: 8 }).domain;
    const afterDeletion = fundPosition('opened-after-deletion', 'steady-fund', 200, 3);
    assert.throws(() => openFund(domain, 2, afterDeletion, { assistantTurn: 3 }),
        error => error.code === 'bank_invalid_domain');
    assert.deepEqual(replayBankEvents(domain).openDeposits, [later]);
    assert.deepEqual(replayBankEvents(domain).openInvestments, []);
});

test('public view exposes products and claimability without leaking locked fund outcomes', () => {
    const fund = fundPosition('private-fund');
    const domain = openFund(createEmptyBankDomain(), 1, fund).domain;

    const locked = createBankView({ domain: { ...domain, currentTurn: 19 } });
    assert.equal(locked.products.deposits.length, 3);
    assert.equal(locked.products.funds.length, 3);
    assert.equal(locked.lockedAmount, 200);
    assert.equal(locked.investments[0].claimable, false);
    assert.equal(Object.hasOwn(locked.investments[0], 'resolvedReturnBps'), false);
    assert.equal(Object.hasOwn(locked.investments[0], 'settlementAmount'), false);
    assert.equal(JSON.stringify(locked).includes('resolvedReturnBps'), false);

    const claimable = createBankView({ domain: { ...domain, currentTurn: 20 } });
    assert.deepEqual({
        claimable: claimable.investments[0].claimable,
        resolvedReturnBps: claimable.investments[0].resolvedReturnBps,
        settlementAmount: claimable.investments[0].settlementAmount,
    }, { claimable: true, resolvedReturnBps: -500, settlementAmount: 190 });

    locked.products.funds[0].returnRangeBps.min = 999;
    locked.investments[0].principal = 999;
    assert.equal(getBankFundContract('steady-fund').returnRangeBps.min, -500);
    assert.equal(domain.events[0].result.changes[0].position.principal, 200);
});

test('public activity paging is newest-first, anchor-free and independently copied', () => {
    const first = depositPosition('history-1');
    let domain = openDeposit(createEmptyBankDomain(), 1, first).domain;
    domain = earlyWithdraw(domain, 2, first).domain;
    const second = depositPosition('history-2', 'short-term', 100, 1);
    domain = openDeposit(domain, 3, second, { assistantTurn: 1 }).domain;
    domain = earlyWithdraw(domain, 4, second, { assistantTurn: 2 }).domain;

    const latest = createBankView({ domain, currentTurn: 2, activityLimit: 1 });
    const older = createBankView({ domain, currentTurn: 2, activityOffset: 1, activityLimit: 1 });
    assert.equal(latest.activities[0].sourceId, 'history-2');
    assert.equal(Object.hasOwn(latest.activities[0], 'anchor'), false);
    assert.deepEqual(latest.activityPage, { offset: 0, limit: 1, total: 2, hasMore: true });
    assert.equal(older.activities[0].sourceId, 'history-1');
    assert.deepEqual(older.activityPage, { offset: 1, limit: 1, total: 2, hasMore: false });

    latest.activities[0].detail.outcome = 'matured';
    assert.equal(domain.events[3].result.activities[0].detail.outcome, 'withdrawn-early');
});
