import assert from 'node:assert/strict';
import test from 'node:test';
import 'fake-indexeddb/auto';

import db, {
    appendTavernMessage,
    branchTavernSession,
    createTavernSession,
    deleteTavernSession,
    getTavernMessage,
    tavernBankActivitiesTable,
    tavernBankStateVersionsTable,
    tavernEconomyAccountsTable,
    tavernEconomyTransactionsTable,
    tavernSessionsTable,
    updateTavernSessionState,
} from '../shared/session-db';
import {
    restoreTavernAcceptedEconomicStateToFloor,
    truncateTavernMessagesAndRestoreAcceptedEconomicState,
    updateTavernMessageAndRestoreAcceptedEconomicState,
} from '../shared/accepted-economic-state';
import { describeTavernBankRestoreImpact } from '../shared/bank/bank-timeline';
import {
    captureTavernPhoneBoundary,
} from '../shared/phone-boundary';
import {
    getTavernPlayerBalance,
    postTavernEconomyTransaction,
} from '../shared/economy/economy-service';
import {
    TAVERN_PLAYER_ACCOUNT_ID,
    TAVERN_SYSTEM_MINT_ACCOUNT_ID,
    TAVERN_SYSTEM_SINK_ACCOUNT_ID,
} from '../shared/economy/economy-types';

import {
    amountAtTavernBankBps,
    createTavernBankDepositContract,
    createTavernBankFundContract,
    getTavernBankDepositProduct,
    getTavernBankFundProduct,
    listTavernBankDepositProducts,
    listTavernBankFundProducts,
    multiplyTavernBankAmount,
    validateTavernBankProductCatalog,
} from '../shared/bank/bank-products';
import {
    assertTavernBankActivityInvariant,
    findTavernBankActivitiesInvariantViolation,
    findTavernBankActivityInvariantViolation,
    findTavernBankStateInvariantViolation,
} from '../shared/bank/bank-invariants';
import {
    createTavernBankSequenceRandom,
    drawTavernBankInclusiveInteger,
    rollTavernBankDie,
    shuffleTavernBankValues,
} from '../shared/bank/bank-random';
import {
    createTavernBankView,
} from '../shared/bank/bank-view';
import {
    bidTavernBankDiceGame,
    getCurrentTavernBankState,
    getCurrentTavernBankView,
    openTavernBankDeposit,
    openTavernBankFund,
    settleDueTavernBankPositions,
    startTavernBankDiceGame,
} from '../shared/bank/bank-service';
import {
    challengeTavernBankDiceGame,
    countTavernBankDiceBidMatches,
    countTavernBankDiceMatches,
    createTavernBankDiceGame,
    getTavernBankDiceBidProbabilityForDealer,
    isTavernBankDiceBidHigher,
    listTavernBankLegalDiceBids,
    respondToTavernBankDicePlayerBid,
    tavernBankBinomialAtLeastProbability,
} from '../shared/bank/games/dice-bluff';
import {
    cashOutTavernBankPushGame,
    createTavernBankPushGame,
    drawTavernBankPushCard,
    getTavernBankPushOptimalExpectedPayout,
} from '../shared/bank/games/push-your-luck';
import {
    calculateTavernBankLadderRiskBase,
    calculateTavernBankLadderSuccessAmount,
    cashOutTavernBankLadderGame,
    createTavernBankLadderGame,
    listTavernBankLadderOptions,
    stepTavernBankLadderGame,
} from '../shared/bank/games/risk-ladder';
import type {
    TavernBankActivityRecord,
    TavernBankPrivateDiceGame,
    TavernBankPrivatePushGame,
    TavernBankState,
} from '../shared/bank/bank-types';

const timing = {
    startedAtTurn: 3,
    startedAtOrder: 4,
    createdAt: 1_000,
};

async function resetDb() {
    await db.delete();
    await db.open();
}

function createDiceGame(overrides: Partial<TavernBankPrivateDiceGame> = {}): TavernBankPrivateDiceGame {
    return {
        ...createTavernBankDiceGame({ id: 'dice-1', bet: 50, ...timing }, createTavernBankSequenceRandom([0, 1, 2, 3, 4, 5, 0, 1, 2, 3])),
        ...overrides,
    };
}

function createPushGame(overrides: Partial<TavernBankPrivatePushGame> = {}): TavernBankPrivatePushGame {
    return {
        ...createTavernBankPushGame({ id: 'push-1', ...timing }, createTavernBankSequenceRandom([0], { repeat: true })),
        ...overrides,
    };
}

function validPositions() {
    const deposit = getTavernBankDepositProduct('short-term');
    const fund = getTavernBankFundProduct('steady-fund');
    return {
        deposit: {
            id: 'deposit-1',
            productId: deposit.id,
            principal: 100,
            startTurn: 2,
            maturityTurn: 12,
            ...createTavernBankDepositContract(deposit, 100),
            openedAtOrder: 3,
            openedAt: 1_000,
        },
        fund: {
            id: 'fund-1',
            productId: fund.id,
            principal: 200,
            startTurn: 2,
            maturityTurn: 22,
            ...createTavernBankFundContract(fund, 200, 0),
            openedAtOrder: 3,
            openedAt: 1_000,
        },
    };
}

test('bank catalog freezes the six reviewed products and integer contracts', () => {
    const deposits = listTavernBankDepositProducts();
    const funds = listTavernBankFundProducts();
    assert.equal(deposits.length, 3);
    assert.equal(funds.length, 3);
    assert.deepEqual(deposits.map((product) => product.id), ['short-term', 'mid-term', 'long-term']);
    assert.deepEqual(funds.map((product) => product.id), ['steady-fund', 'growth-fund', 'venture-fund']);
    assert.deepEqual(createTavernBankDepositContract(getTavernBankDepositProduct('short-term'), 101), {
        maturityAmount: 107,
        earlyWithdrawalAmount: 97,
    });
    assert.deepEqual(createTavernBankFundContract(getTavernBankFundProduct('steady-fund'), 201, -500), {
        resolvedReturnBps: -500,
        settlementAmount: 190,
    });
    assert.equal(amountAtTavernBankBps(101, 600), 107);
    assert.equal(multiplyTavernBankAmount(101, 5, 4), 126);
    assert.throws(() => amountAtTavernBankBps(Number.MAX_SAFE_INTEGER, 10_000), /bank_amount_overflow/);
    assert.throws(() => createTavernBankFundContract(getTavernBankFundProduct('steady-fund'), 200, 2_001), /bank_amount_out_of_range/);
    assert.throws(() => validateTavernBankProductCatalog({
        deposits: [{ ...deposits[0], id: 'same' }],
        funds: [{ ...funds[0], id: 'same' }],
    }), /bank_product_invalid/);
    assert.throws(() => validateTavernBankProductCatalog({
        deposits: [{ ...deposits[0], interestBps: Number.MAX_SAFE_INTEGER }],
        funds: [],
    }), /bank_product_invalid/);
    assert.equal(Object.isFrozen(deposits), true);
    assert.equal(Object.isFrozen(deposits[0]), true);
    assert.equal(Object.isFrozen(funds), true);
    assert.equal(Object.isFrozen(funds[0]), true);
    assert.equal(Object.isFrozen(funds[0].returnRangeBps), true);
});

test('bank random boundary is synchronous, deterministic and rejects invalid sources', () => {
    const source = createTavernBankSequenceRandom([0, 5, 2]);
    assert.equal(rollTavernBankDie(source), 1);
    assert.equal(rollTavernBankDie(source), 6);
    assert.equal(drawTavernBankInclusiveInteger(-2, 2, source), 0);
    assert.throws(() => rollTavernBankDie(source), /bank_random_exhausted/);
    assert.deepEqual(shuffleTavernBankValues(['a', 'b', 'c'], createTavernBankSequenceRandom([0, 0])), ['b', 'c', 'a']);
    assert.throws(() => rollTavernBankDie(createTavernBankSequenceRandom([6])), /bank_random_invalid/);
});

test('invalid game starts fail before they consume the transaction random source', () => {
    const diceRandom = createTavernBankSequenceRandom([0]);
    assert.throws(() => createTavernBankDiceGame({ id: 'dice-invalid', bet: 51, ...timing }, diceRandom), /bank_amount_out_of_range/);
    assert.equal(rollTavernBankDie(diceRandom), 1);
    const pushRandom = createTavernBankSequenceRandom([0]);
    assert.throws(() => createTavernBankPushGame({ id: '', ...timing }, pushRandom), /bank_game_id_required/);
    assert.equal(rollTavernBankDie(pushRandom), 1);
});

test('dice bluff counts ones as wild, orders bids strictly and calculates exact dealer odds', () => {
    assert.equal(countTavernBankDiceMatches([1, 2, 3, 1, 6], 3), 3);
    const game = createDiceGame({
        playerDice: [1, 3, 3, 4, 5],
        dealerDice: [1, 3, 2, 2, 6],
    });
    assert.equal(countTavernBankDiceBidMatches(game, { face: 3 }), 5);
    assert.equal(isTavernBankDiceBidHigher({ count: 2, face: 2 }, { count: 1, face: 6 }), true);
    assert.equal(isTavernBankDiceBidHigher({ count: 1, face: 5 }, { count: 1, face: 6 }), false);
    assert.equal(listTavernBankLegalDiceBids({ count: 10, face: 6 }).length, 0);
    assert.equal(tavernBankBinomialAtLeastProbability(5, 1 / 3, 0), 1);
    assert.equal(tavernBankBinomialAtLeastProbability(5, 1 / 3, 6), 0);
    assert.equal(getTavernBankDiceBidProbabilityForDealer([3, 3, 3, 3, 3], { count: 1, face: 3 }), 1);
});

test('dice dealer response is always legal and challenges settle both winner directions', () => {
    const highProbability = createDiceGame({
        dealerDice: [3, 3, 3, 3, 3],
    });
    const response = respondToTavernBankDicePlayerBid(highProbability, { count: 1, face: 3 }, createTavernBankSequenceRandom([]));
    assert.equal(response.kind, 'dealer-bid');
    if (response.kind === 'dealer-bid') {
        assert.equal(response.game.bids.at(-1)?.by, 'dealer');
        assert.equal(isTavernBankDiceBidHigher(response.dealerBid, { count: 1, face: 3 }), true);
    }
    const dealerChallenge = respondToTavernBankDicePlayerBid(createDiceGame({
        playerDice: [6, 6, 6, 6, 6],
        dealerDice: [1, 1, 1, 1, 1],
    }), { count: 10, face: 6 }, createTavernBankSequenceRandom([]));
    assert.equal(dealerChallenge.kind, 'settled');
    if (dealerChallenge.kind === 'settled') {
        assert.equal(dealerChallenge.settlement.result, 'player-win');
        assert.equal(dealerChallenge.settlement.payout, 95);
    }
    const playerChallenge = challengeTavernBankDiceGame(createDiceGame({
        playerDice: [2, 2, 2, 2, 2],
        dealerDice: [3, 3, 3, 3, 3],
        bids: [
            { by: 'player', count: 1, face: 2 },
            { by: 'dealer', count: 4, face: 3 },
        ],
    }), 'player');
    assert.equal(playerChallenge.result, 'dealer-win');
    assert.equal(playerChallenge.payout, 0);
    assert.throws(() => respondToTavernBankDicePlayerBid(highProbability, { count: 1, face: 1 }, createTavernBankSequenceRandom([])), /bank_dice_bid_invalid/);
});

test('push game consumes one persisted card per draw and exposes only derived risk', () => {
    const firstCoinThenBomb = createPushGame({
        deck: ['coin', 'bomb', 'coin', 'coin', 'coin', 'coin', 'coin', 'coin', 'bomb', 'bomb'],
    });
    assert.throws(() => cashOutTavernBankPushGame(firstCoinThenBomb), /bank_push_cashout_invalid/);
    const coin = drawTavernBankPushCard(firstCoinThenBomb);
    assert.equal(coin.kind, 'continued');
    if (coin.kind === 'continued') {
        assert.equal(coin.game.drawIndex, 1);
        assert.equal(coin.game.cashoutAmount, 50);
        assert.deepEqual(coin.statistics, {
            remainingCards: 9,
            remainingBombs: 3,
            nextBombProbabilityBps: 3333,
        });
        const bomb = drawTavernBankPushCard(coin.game);
        assert.deepEqual(bomb, { kind: 'settled', outcome: 'busted', payout: 0, revealedCoins: 1 });
    }
    let current = createPushGame({
        deck: ['coin', 'coin', 'coin', 'coin', 'coin', 'coin', 'coin', 'bomb', 'bomb', 'bomb'],
    });
    for (let index = 0; index < 6; index += 1) {
        const transition = drawTavernBankPushCard(current);
        assert.equal(transition.kind, 'continued');
        if (transition.kind !== 'continued') {assert.fail('push should not settle before seventh coin');}
        current = transition.game;
    }
    assert.deepEqual(drawTavernBankPushCard(current), { kind: 'settled', outcome: 'cleared', payout: 350, revealedCoins: 7 });
    assert.deepEqual(getTavernBankPushOptimalExpectedPayout(), { numerator: 140, denominator: 3 });
});

test('risk ladder applies a 90 percent risk base, fair conditional choices and terminal rules', () => {
    const options = listTavernBankLadderOptions();
    for (const option of options) {
        assert.equal(option.successProbabilityBps * option.numerator, 10_000 * option.denominator);
    }
    assert.equal(calculateTavernBankLadderRiskBase(30), 27);
    assert.equal(calculateTavernBankLadderSuccessAmount(27, 'safe'), 33);
    assert.equal(calculateTavernBankLadderSuccessAmount(49_000, 'risky'), 50_000);
    const first = createTavernBankLadderGame({ id: 'ladder-1', bet: 30, ...timing });
    assert.throws(() => cashOutTavernBankLadderGame(first), /bank_ladder_cashout_invalid/);
    const failed = stepTavernBankLadderGame(first, 'safe', createTavernBankSequenceRandom([9_999]));
    assert.deepEqual(failed, {
        kind: 'settled',
        outcome: 'failed',
        payout: 0,
        success: false,
        step: { floor: 1, choice: 'safe', success: false, amountAfterStep: 0 },
    });
    let current = first;
    for (let floor = 1; floor <= 4; floor += 1) {
        const transition = stepTavernBankLadderGame(current, 'safe', createTavernBankSequenceRandom([0]));
        assert.equal(transition.kind, 'continued');
        if (transition.kind !== 'continued') {assert.fail('ladder should still be active');}
        current = transition.game;
    }
    const cleared = stepTavernBankLadderGame(current, 'safe', createTavernBankSequenceRandom([0]));
    assert.equal(cleared.kind, 'settled');
    if (cleared.kind === 'settled') {
        assert.equal(cleared.outcome, 'cleared');
        assert.equal(cleared.payout, 78);
    }
});

test('bank public view is a deep redacted projection of current private state', () => {
    const { deposit, fund } = validPositions();
    const privateDice = createDiceGame({
        dealerDice: [6, 6, 6, 6, 6],
        bids: [{ by: 'player', count: 1, face: 6 }, { by: 'dealer', count: 2, face: 6 }],
    });
    const state: TavernBankState = {
        openDeposits: [deposit],
        openInvestments: [fund],
        activeGame: { kind: 'dice', game: privateDice },
    };
    const view = createTavernBankView({
        currentTurn: 5,
        record: { revision: 2, versionId: 'bank-version-2', state },
    });
    assert.equal(view.deposits[0]?.remainingRounds, 7);
    assert.equal(view.investments[0]?.remainingRounds, 17);
    assert.equal(Object.hasOwn(view.investments[0] || {}, 'resolvedReturnBps'), false);
    assert.equal(Object.hasOwn(view.investments[0] || {}, 'settlementAmount'), false);
    assert.equal(Object.hasOwn(view.activeGame || {}, 'dealerDice'), false);
    if (view.activeGame?.kind === 'dice') {
        view.activeGame.playerDice[0] = 6;
        view.activeGame.bids[0].count = 9;
    }
    assert.equal(privateDice.playerDice[0], 1);
    assert.equal(privateDice.bids[0].count, 1);

    const pushView = createTavernBankView({
        currentTurn: 3,
        record: {
            revision: 3,
            versionId: 'bank-version-3',
            state: { openDeposits: [], openInvestments: [], activeGame: { kind: 'push', game: createPushGame() } },
        },
    });
    assert.equal(Object.hasOwn(pushView.activeGame || {}, 'deck'), false);
});

test('bank invariants reject corrupted stored facts and completed activities', () => {
    const { deposit, fund } = validPositions();
    const validState: TavernBankState = {
        openDeposits: [deposit],
        openInvestments: [fund],
        activeGame: { kind: 'ladder', game: createTavernBankLadderGame({ id: 'ladder-invariant', bet: 30, ...timing }) },
    };
    assert.equal(findTavernBankStateInvariantViolation(validState), null);
    assert.equal(findTavernBankStateInvariantViolation({
        ...validState,
        openInvestments: [{ ...fund, id: deposit.id }],
    })?.code, 'position-id-duplicate');
    assert.equal(findTavernBankStateInvariantViolation({
        ...validState,
        openDeposits: [{ ...deposit, maturityAmount: 1 }],
    })?.code, 'position-invalid');
    assert.equal(findTavernBankStateInvariantViolation({
        ...validState,
        openInvestments: [{ ...fund, resolvedReturnBps: '0' }],
    })?.code, 'position-invalid');
    assert.equal(findTavernBankStateInvariantViolation({
        ...validState,
        activeGame: { kind: 'push', game: createPushGame({ deck: ['coin'] }) },
    })?.code, 'active-game-invalid');

    const activity: TavernBankActivityRecord = {
        sessionId: 'session-1',
        id: 'activity-1',
        sourceId: 'dice-1',
        detail: {
            kind: 'dice',
            result: 'dealer-win',
            challenger: 'player',
            finalBid: { by: 'dealer', count: 4, face: 3 },
            bids: [{ by: 'player', count: 1, face: 2 }, { by: 'dealer', count: 4, face: 3 }],
            playerDice: [2, 2, 2, 2, 2],
            dealerDice: [3, 3, 3, 3, 3],
        },
        amountIn: 50,
        payout: 0,
        net: -50,
        anchorOrder: 3,
        createdAt: 1_000,
    };
    assert.equal(findTavernBankActivityInvariantViolation(activity), null);
    assertTavernBankActivityInvariant(activity);
    assert.equal(findTavernBankActivityInvariantViolation({ ...activity, payout: 1, net: -49 })?.code, 'activity-invalid');
    assert.equal(findTavernBankActivitiesInvariantViolation([
        activity,
        { ...activity, id: 'activity-2' },
    ])?.detail, 'source-id-duplicate:dice-1');
});

test('bank writes wager and state atomically, and an action replay returns the current head', async () => {
    await resetDb();
    const session = await createTavernSession({ title: 'Bank atomic' });
    const start = await startTavernBankDiceGame({
        sessionId: session.id,
        boundary: null,
        actionId: 'dice-start',
        expectedRevision: 0,
        expectedVersionId: '',
        bet: 50,
    }, { random: createTavernBankSequenceRandom([0, 1, 2, 3, 4, 5, 0, 1, 2, 3]) });
    assert.equal(start.replay, false);
    assert.equal(start.playerBalance, 50);
    const gameId = (await getCurrentTavernBankState(session.id))?.state.activeGame?.game.id;
    assert.ok(gameId);
    const next = await bidTavernBankDiceGame({
        sessionId: session.id,
        boundary: null,
        actionId: 'dice-bid',
        expectedRevision: 1,
        expectedVersionId: String(start.record?.versionId),
        gameId: String(gameId),
        bid: { count: 1, face: 3 },
    }, { random: createTavernBankSequenceRandom([0]) });
    assert.equal(next.record?.revision, 2);
    await appendTavernMessage(session.id, { role: 'user', content: '剧情已经推进' });
    const replay = await startTavernBankDiceGame({
        sessionId: session.id,
        boundary: null,
        actionId: 'dice-start',
        expectedRevision: 0,
        expectedVersionId: '',
        bet: 50,
    }, { random: createTavernBankSequenceRandom([]) });
    assert.equal(replay.replay, true);
    assert.equal(replay.actionRecord?.revision, 1);
    assert.equal(replay.record?.revision, 2);
    assert.equal(await getTavernPlayerBalance(session.id), 50);
    assert.equal(await tavernBankStateVersionsTable.where('sessionId').equals(session.id).count(), 2);
    assert.equal(await tavernEconomyTransactionsTable.where('sessionId').equals(session.id).count(), 2);
});

test('settlement-only checks with no due positions perform zero writes', async () => {
    await resetDb();
    const session = await createTavernSession({ title: 'Bank no-op settlement' });
    const before = await tavernSessionsTable.get(session.id);
    const result = await settleDueTavernBankPositions({
        sessionId: session.id,
        boundary: null,
        actionId: 'settle-no-due',
        expectedRevision: 0,
        expectedVersionId: '',
    });
    const after = await tavernSessionsTable.get(session.id);
    assert.equal(result.changed, false);
    assert.equal(result.playerBalance, 100);
    assert.equal(await tavernBankStateVersionsTable.where('sessionId').equals(session.id).count(), 0);
    assert.equal(await tavernEconomyAccountsTable.where('sessionId').equals(session.id).count(), 0);
    assert.equal(await tavernEconomyTransactionsTable.where('sessionId').equals(session.id).count(), 0);
    assert.equal(after?.updatedAt, before?.updatedAt);
});

test('bank freezes hidden fund facts, settles due positions in one version, and rejects stale phone boundaries before writes', async () => {
    await resetDb();
    const session = await createTavernSession({ title: 'Bank settlement' });
    const deposit = await openTavernBankDeposit({
        sessionId: session.id,
        boundary: null,
        actionId: 'deposit-open',
        expectedRevision: 0,
        expectedVersionId: '',
        productId: 'short-term',
        amount: 100,
    });
    assert.equal(deposit.playerBalance, 0);
    await updateTavernSessionState(session.id, { turn: 10 });
    const settled = await settleDueTavernBankPositions({
        sessionId: session.id,
        boundary: null,
        actionId: 'settle-due',
        expectedRevision: 1,
        expectedVersionId: String(deposit.record?.versionId),
    });
    assert.equal(settled.changed, true);
    assert.equal(settled.record?.revision, 2);
    assert.equal((await getCurrentTavernBankState(session.id))?.state.openDeposits.length, 0);
    assert.equal(settled.activities[0]?.payout, 106);
    assert.equal(await getTavernPlayerBalance(session.id), 106);
    assert.equal(await tavernBankActivitiesTable.where('sessionId').equals(session.id).count(), 1);
    const depositLedger = await tavernEconomyTransactionsTable.where('sessionId').equals(session.id).toArray();
    assert.equal(depositLedger.find((transaction) => transaction.idempotencyKey.startsWith('bank:lock:'))?.kind, 'bank_deposit_lock');
    assert.equal(depositLedger.find((transaction) => transaction.idempotencyKey.startsWith('bank:settle:'))?.kind, 'bank_settlement');

    const fundSession = await createTavernSession({ title: 'Bank private fund' });
    await postTavernEconomyTransaction({
        sessionId: fundSession.id,
        idempotencyKey: 'bank-test-fund-topup',
        fromAccountId: TAVERN_SYSTEM_MINT_ACCOUNT_ID,
        toAccountId: TAVERN_PLAYER_ACCOUNT_ID,
        amount: 200,
        kind: 'bank_test_topup',
        title: '测试充值',
        sourceDomain: 'test',
        sourceId: 'bank-test-fund-topup',
        anchorOrder: 0,
    });
    const fund = await openTavernBankFund({
        sessionId: fundSession.id,
        boundary: null,
        actionId: 'fund-open',
        expectedRevision: 0,
        expectedVersionId: '',
        productId: 'steady-fund',
        amount: 200,
    }, { random: createTavernBankSequenceRandom([500]) });
    assert.equal((await getCurrentTavernBankState(fundSession.id))?.state.openInvestments[0]?.resolvedReturnBps, 0);
    assert.equal(
        (await tavernEconomyTransactionsTable.where('sessionId').equals(fundSession.id).toArray())
            .find((transaction) => transaction.idempotencyKey.startsWith('bank:lock:'))?.kind,
        'bank_fund_lock',
    );
    const fundView = await getCurrentTavernBankView(fundSession.id);
    assert.equal(Object.hasOwn(fundView.investments[0] || {}, 'resolvedReturnBps'), false);
    assert.equal(Object.hasOwn(fundView.investments[0] || {}, 'settlementAmount'), false);

    const boundary = await captureTavernPhoneBoundary(fundSession.id);
    await appendTavernMessage(fundSession.id, { role: 'user', content: '剧情推进' });
    await assert.rejects(
        openTavernBankDeposit({
            sessionId: fundSession.id,
            boundary,
            actionId: 'stale-deposit',
            expectedRevision: 1,
            expectedVersionId: String(fund.record?.versionId),
            productId: 'short-term',
            amount: 100,
        }),
        /phone_timeline_conflict/,
    );
    const afterStale = await getCurrentTavernBankState(fundSession.id);
    assert.equal(afterStale?.revision, 1);

    const insufficientSession = await createTavernSession({ title: 'Bank random gate' });
    await assert.rejects(openTavernBankFund({
        sessionId: insufficientSession.id,
        boundary: null,
        actionId: 'fund-insufficient',
        expectedRevision: 0,
        expectedVersionId: '',
        productId: 'steady-fund',
        amount: 200,
    }, { random: createTavernBankSequenceRandom([9_999]) }), /economy_balance_insufficient/);
    assert.equal(await tavernBankStateVersionsTable.where('sessionId').equals(insufficientSession.id).count(), 0);
});

test('bank rejects a new write when the session turn regresses behind the current head', async () => {
    await resetDb();
    const session = await createTavernSession({ title: 'Bank turn regression' });
    await updateTavernSessionState(session.id, { turn: 10 });
    const opened = await openTavernBankDeposit({
        sessionId: session.id,
        boundary: null,
        actionId: 'turn-regression-open',
        expectedRevision: 0,
        expectedVersionId: '',
        productId: 'short-term',
        amount: 100,
    });
    const transactionsBefore = await tavernEconomyTransactionsTable.where('sessionId').equals(session.id).count();
    await updateTavernSessionState(session.id, { turn: 5 });

    await assert.rejects(
        openTavernBankDeposit({
            sessionId: session.id,
            boundary: null,
            actionId: 'turn-regression-rejected',
            expectedRevision: 1,
            expectedVersionId: String(opened.record?.versionId),
            productId: 'short-term',
            amount: 100,
        }),
        /bank_turn_regression/,
    );

    assert.equal((await getCurrentTavernBankState(session.id))?.revision, 1);
    assert.equal(await tavernBankStateVersionsTable.where('sessionId').equals(session.id).count(), 1);
    assert.equal(await tavernEconomyTransactionsTable.where('sessionId').equals(session.id).count(), transactionsBefore);
});

test('accepted rollback, branching and deletion carry Bank facts with the wallet lifecycle', async () => {
    await resetDb();
    const source = await createTavernSession({ title: 'Bank lifecycle' });
    const opened = await openTavernBankDeposit({
        sessionId: source.id,
        boundary: null,
        actionId: 'lifecycle-deposit',
        expectedRevision: 0,
        expectedVersionId: '',
        productId: 'short-term',
        amount: 100,
    });
    const branch = await branchTavernSession(source.id);
    assert.ok(branch?.id && branch.id !== source.id);
    assert.equal(await tavernBankStateVersionsTable.where('sessionId').equals(String(branch?.id)).count(), 1);
    await restoreTavernAcceptedEconomicStateToFloor(source.id, -1);
    assert.equal(await getCurrentTavernBankState(source.id), null);
    assert.equal(await getTavernPlayerBalance(source.id), 100);
    assert.equal(await tavernBankStateVersionsTable.where('sessionId').equals(source.id).count(), 0);
    const branchRows = await tavernBankStateVersionsTable.where('sessionId').equals(String(branch?.id)).toArray();
    assert.equal(branchRows[0]?.currentMarker, 'current');
    assert.equal((await getCurrentTavernBankState(String(branch?.id)))?.versionId, opened.record?.versionId);
    await deleteTavernSession(source.id);
    assert.equal(await tavernBankStateVersionsTable.where('sessionId').equals(source.id).count(), 0);
    assert.equal(await tavernBankStateVersionsTable.where('sessionId').equals(String(branch?.id)).count(), 1);
});

test('accepted story edit commits its message and Bank rollback as one transaction', async () => {
    await resetDb();
    const session = await createTavernSession({ title: 'Bank atomic story edit' });
    await appendTavernMessage(session.id, { role: 'user', content: '原始用户楼层' });
    const assistant = await appendTavernMessage(session.id, { role: 'assistant', content: '原始助手楼层' });
    await openTavernBankDeposit({
        sessionId: session.id,
        boundary: await captureTavernPhoneBoundary(session.id),
        actionId: 'atomic-edit-deposit',
        expectedRevision: 0,
        expectedVersionId: '',
        productId: 'short-term',
        amount: 100,
    });

    const mutation = await updateTavernMessageAndRestoreAcceptedEconomicState({
        sessionId: session.id,
        order: assistant.order,
        patch: { content: '改写后的助手楼层' },
        incrementTimelineRevision: true,
    });

    assert.equal(mutation.message?.content, '改写后的助手楼层');
    assert.equal(mutation.economic?.bank.changed, true);
    assert.equal((await getTavernMessage(session.id, assistant.order))?.content, '改写后的助手楼层');
    assert.equal(await getCurrentTavernBankState(session.id), null);
    assert.equal(await getTavernPlayerBalance(session.id), 100);
});

test('accepted story edit rolls its message back when an economic restore cannot complete', async () => {
    await resetDb();
    const session = await createTavernSession({ title: 'Bank failed atomic story edit' });
    await appendTavernMessage(session.id, { role: 'user', content: '原始用户楼层' });
    const assistant = await appendTavernMessage(session.id, { role: 'assistant', content: '必须保留的助手楼层' });
    await openTavernBankDeposit({
        sessionId: session.id,
        boundary: await captureTavernPhoneBoundary(session.id),
        actionId: 'failed-atomic-edit-deposit',
        expectedRevision: 0,
        expectedVersionId: '',
        productId: 'short-term',
        amount: 100,
    });
    await tavernEconomyAccountsTable.delete([session.id, TAVERN_SYSTEM_SINK_ACCOUNT_ID]);

    await assert.rejects(updateTavernMessageAndRestoreAcceptedEconomicState({
        sessionId: session.id,
        order: assistant.order,
        patch: { content: '绝不能部分提交' },
        incrementTimelineRevision: true,
    }), /economy_account_missing/);

    assert.equal((await getTavernMessage(session.id, assistant.order))?.content, '必须保留的助手楼层');
    assert.equal((await getCurrentTavernBankState(session.id))?.revision, 1);
    assert.equal(await tavernBankStateVersionsTable.where('sessionId').equals(session.id).count(), 1);
});

test('accepted story truncation removes messages and Bank facts in one transaction', async () => {
    await resetDb();
    const session = await createTavernSession({ title: 'Bank atomic story truncation' });
    await appendTavernMessage(session.id, { role: 'user', content: '保留楼层' });
    const assistant = await appendTavernMessage(session.id, { role: 'assistant', content: '删除楼层' });
    await openTavernBankDeposit({
        sessionId: session.id,
        boundary: await captureTavernPhoneBoundary(session.id),
        actionId: 'atomic-truncate-deposit',
        expectedRevision: 0,
        expectedVersionId: '',
        productId: 'short-term',
        amount: 100,
    });

    const mutation = await truncateTavernMessagesAndRestoreAcceptedEconomicState({
        sessionId: session.id,
        fromOrder: assistant.order,
        state: { turn: 0 },
    });

    assert.equal(mutation.deleted, 1);
    assert.equal(mutation.economic?.bank.changed, true);
    assert.equal(await getTavernMessage(session.id, assistant.order), null);
    assert.equal(await getCurrentTavernBankState(session.id), null);
    assert.equal(await getTavernPlayerBalance(session.id), 100);
});

test('Bank rollback impact compares the current active game with the target floor', async () => {
    await resetDb();
    const session = await createTavernSession({ title: 'Bank rollback impact' });
    await postTavernEconomyTransaction({
        sessionId: session.id,
        idempotencyKey: 'bank-impact-top-up',
        fromAccountId: TAVERN_SYSTEM_MINT_ACCOUNT_ID,
        toAccountId: TAVERN_PLAYER_ACCOUNT_ID,
        amount: 100,
        kind: 'bank_impact_top_up',
        title: '回滚影响测试充值',
        sourceDomain: 'test',
        sourceId: 'bank-impact-top-up',
        anchorOrder: -1,
    });
    await appendTavernMessage(session.id, { role: 'user', content: '先开一桌骰局' });
    const started = await startTavernBankDiceGame({
        sessionId: session.id,
        boundary: await captureTavernPhoneBoundary(session.id),
        actionId: 'bank-impact-dice',
        expectedRevision: 0,
        expectedVersionId: '',
        bet: 50,
    }, { random: createTavernBankSequenceRandom([0, 1, 2, 3, 4, 5, 0, 1, 2, 3]) });
    await appendTavernMessage(session.id, { role: 'assistant', content: '牌桌仍然原样，随后只新增存单' });
    await openTavernBankDeposit({
        sessionId: session.id,
        boundary: await captureTavernPhoneBoundary(session.id),
        actionId: 'bank-impact-deposit',
        expectedRevision: 1,
        expectedVersionId: String(started.record?.versionId),
        productId: 'short-term',
        amount: 100,
    });

    const keepSameGame = await describeTavernBankRestoreImpact(session.id, 1);
    assert.equal(keepSameGame.changed, true);
    assert.equal(keepSameGame.activeGameAffected, false);

    const removeGame = await describeTavernBankRestoreImpact(session.id, 0);
    assert.equal(removeGame.changed, true);
    assert.equal(removeGame.activeGameAffected, true);
});
