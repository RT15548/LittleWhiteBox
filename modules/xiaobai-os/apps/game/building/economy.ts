import type { EconomyActionLeg, EconomyTransactionCapability } from '../../../capabilities/economy/index.js';
import { BUILDING_POLICY as P, TIER_RULES } from './policy.js';
import { fault, type Receipt, type BuildingData } from './domain.js';
import { COPY } from './copy.js';
const PREFIX = 'building:', RESERVE = 'counterparty:game:building';
export function legs(receipt: Receipt): EconomyActionLeg[] {
    function leg(kind: 'fee' | 'ready' | 'finished', actionId: string, amount: number): EconomyActionLeg {
        return { idempotencyKey: `${PREFIX}${receipt.runId}:${kind}`, actionId, sourceId: receipt.runId,
            fromAccountId: kind === 'fee' ? 'player' : RESERVE, toAccountId: kind === 'fee' ? RESERVE : 'player',
            amount, kind: `building_${kind}`, title: COPY.ledger[kind] };
    }
    const result = [leg('fee', receipt.admission, P.fee)];
    if (receipt.ready) { result.push(leg('ready', receipt.ready, P.habitableAward)); }
    if (receipt.finished) { result.push(leg('finished', receipt.finished, TIER_RULES[receipt.tier].award - P.habitableAward)); }
    return result;
}
export function validateEconomy(data: BuildingData, economy: EconomyTransactionCapability) {
    const expected = data.receipts.flatMap(legs), actual = economy.listOwnedTransactions().filter(t => t.idempotencyKey.startsWith(PREFIX));
    if (actual.length !== expected.length) { fault('invalid'); }
    for (const leg of expected) {
        const match = actual.find(t => t.idempotencyKey === leg.idempotencyKey);
        if (!match || match.actionId !== leg.actionId || match.sourceId !== leg.sourceId || match.amount !== leg.amount
            || match.kind !== leg.kind || match.fromAccountId !== leg.fromAccountId || match.toAccountId !== leg.toAccountId || match.reversalOfTransactionId) { fault('invalid'); }
    }
}
export function postDifference(before: BuildingData, after: BuildingData, economy: EconomyTransactionCapability) {
    const existing = new Set(before.receipts.flatMap(legs).map(leg => leg.idempotencyKey));
    const added = after.receipts.flatMap(legs).filter(leg => !existing.has(leg.idempotencyKey));
    if (added.length) { economy.postAction({ legs: added }); }
}
