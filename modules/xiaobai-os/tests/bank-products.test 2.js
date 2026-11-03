import assert from 'node:assert/strict';
import test from 'node:test';

import {
    BANK_MAX_PAYOUT,
    amountAtBps,
    multiplyBankAmount,
} from '../domains/bank/money.js';
import {
    createBankDepositContract,
    createBankFundContract,
    drawBankFundFrozenContract,
    listBankDepositProducts,
    listBankFundProducts,
} from '../domains/bank/products.js';
import {
    createBankRandomSource,
    createBankSequenceRandom,
    nextBankRandomInt,
    rollBankDie,
    shuffleBankValues,
} from '../domains/bank/random.js';

test('the six immutable products and all money calculations use exact integer contracts', () => {
    const deposits = listBankDepositProducts();
    const funds = listBankFundProducts();
    assert.deepEqual(deposits.map(({ id, lockRounds, interestBps, earlyPenaltyBps, minAmount, maxAmount }) => ({
        id, lockRounds, interestBps, earlyPenaltyBps, minAmount, maxAmount,
    })), [
        { id: 'short-term', lockRounds: 10, interestBps: 600, earlyPenaltyBps: 300, minAmount: 100, maxAmount: 2_000 },
        { id: 'mid-term', lockRounds: 25, interestBps: 1_800, earlyPenaltyBps: 500, minAmount: 200, maxAmount: 5_000 },
        { id: 'long-term', lockRounds: 50, interestBps: 4_500, earlyPenaltyBps: 1_000, minAmount: 500, maxAmount: 10_000 },
    ]);
    assert.deepEqual(funds.map(({ id, lockRounds, returnRangeBps, riskLevel, minAmount, maxAmount }) => ({
        id, lockRounds, returnRangeBps, riskLevel, minAmount, maxAmount,
    })), [
        { id: 'steady-fund', lockRounds: 20, returnRangeBps: { min: -500, max: 2_000 }, riskLevel: 'low', minAmount: 200, maxAmount: 3_000 },
        { id: 'growth-fund', lockRounds: 30, returnRangeBps: { min: -2_000, max: 5_000 }, riskLevel: 'medium', minAmount: 500, maxAmount: 5_000 },
        { id: 'venture-fund', lockRounds: 40, returnRangeBps: { min: -5_000, max: 15_000 }, riskLevel: 'high', minAmount: 1_000, maxAmount: 10_000 },
    ]);
    assert.equal(Object.isFrozen(deposits), true);
    assert.equal(Object.isFrozen(deposits[0]), true);
    assert.equal(Object.isFrozen(funds[0].returnRangeBps), true);

    assert.equal(BANK_MAX_PAYOUT, 50_000);
    assert.equal(amountAtBps(101, 600), 107);
    assert.equal(amountAtBps(201, -500), 190);
    assert.equal(multiplyBankAmount(101, 5, 4), 126);
    assert.deepEqual(createBankDepositContract(deposits[0], 101), {
        maturityAmount: 107,
        earlyWithdrawalAmount: 97,
    });
    assert.deepEqual(createBankFundContract(funds[0], 201, -500), {
        resolvedReturnBps: -500,
        settlementAmount: 190,
    });
    assert.throws(() => amountAtBps(Number.MAX_SAFE_INTEGER, 10_000), /bank_amount_overflow/);
    assert.throws(() => amountAtBps('100', 600), /bank_amount_invalid/);
    assert.throws(() => multiplyBankAmount(30_000, 2, 1), /bank_amount_overflow/);
    assert.throws(() => createBankDepositContract(deposits[0], 99), /bank_amount_out_of_range/);
});

test('random boundaries validate callers and results and include both fund endpoints', () => {
    let calls = 0;
    const invalid = createBankRandomSource(() => {
        calls += 1;
        return 2;
    });
    assert.throws(() => nextBankRandomInt(invalid, 2), /bank_random_invalid/);
    assert.throws(() => nextBankRandomInt(invalid, 0), /bank_random_invalid/);
    assert.equal(calls, 1, 'an invalid bound must fail before calling the source');

    const sequence = createBankSequenceRandom([0, 5, 2]);
    assert.equal(rollBankDie(sequence), 1);
    assert.equal(rollBankDie(sequence), 6);
    assert.equal(rollBankDie(sequence), 3);
    assert.throws(() => rollBankDie(sequence), /bank_random_exhausted/);
    assert.deepEqual(shuffleBankValues(['a', 'b', 'c'], createBankSequenceRandom([0, 0])), ['b', 'c', 'a']);

    const steady = listBankFundProducts()[0];
    assert.equal(drawBankFundFrozenContract(steady, 200, createBankSequenceRandom([0])).resolvedReturnBps, -500);
    assert.equal(drawBankFundFrozenContract(steady, 200, createBankSequenceRandom([2_500])).resolvedReturnBps, 2_000);
});
