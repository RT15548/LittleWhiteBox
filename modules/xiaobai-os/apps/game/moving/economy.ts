import type { EconomyActionLeg, EconomyTransactionCapability } from '../../../capabilities/economy/index.js';
import { MOVING_POLICY } from './policy.js';
import { movingFault, type MovingData, type MovingReceipt } from './domain.js';

const PREFIX = 'moving:';
const RESERVE = 'counterparty:game:moving';
const LEDGER_COPY = { fee: '小白搬家 · 挑战报名', prize: '小白搬家 · 挑战通关', first: '小白搬家 · 首次通关' };

export function movingLegs(receipt: MovingReceipt): EconomyActionLeg[] {
    const leg = (kind: keyof typeof LEDGER_COPY, actionId: string, amount: number): EconomyActionLeg => ({
        idempotencyKey: `${PREFIX}${receipt.runId}:${kind}`, actionId, sourceId: receipt.runId,
        fromAccountId: kind === 'fee' ? 'player' : RESERVE,
        toAccountId: kind === 'fee' ? RESERVE : 'player',
        amount, kind: `moving_${kind}`, title: LEDGER_COPY[kind],
    });
    const legs: EconomyActionLeg[] = [];
    if (receipt.admissionAction) { legs.push(leg('fee', receipt.admissionAction, MOVING_POLICY.challengeFee)); }
    if (receipt.settlement?.outcome === 'won') {
        legs.push(leg(receipt.stage === null ? 'prize' : 'first', receipt.settlement.actionId,
            receipt.stage === null ? MOVING_POLICY.challengePrize : MOVING_POLICY.chapterReward));
    }
    return legs;
}

export function validateMovingEconomy(data: MovingData, economy: EconomyTransactionCapability) {
    const expected = data.receipts.flatMap(movingLegs);
    const actual = economy.listOwnedTransactions().filter(entry => entry.idempotencyKey.startsWith(PREFIX));
    if (expected.length !== actual.length) { movingFault('invalid'); }
    for (const leg of expected) {
        const match = actual.find(entry => entry.idempotencyKey === leg.idempotencyKey);
        if (!match || match.actionId !== leg.actionId || match.sourceId !== leg.sourceId
            || match.amount !== leg.amount || match.kind !== leg.kind || match.fromAccountId !== leg.fromAccountId
            || match.toAccountId !== leg.toAccountId || match.reversalOfTransactionId) { movingFault('invalid'); }
    }
}

export function postMovingDifference(before: MovingData, after: MovingData, economy: EconomyTransactionCapability) {
    const existing = new Set(before.receipts.flatMap(movingLegs).map(leg => leg.idempotencyKey));
    const legs = after.receipts.flatMap(movingLegs).filter(leg => !existing.has(leg.idempotencyKey));
    if (legs.length) { economy.postAction({ legs }); }
}
