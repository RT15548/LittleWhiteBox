import type { EconomyActionLeg, EconomyTransactionCapability } from '../../../capabilities/economy/index.js';
import { COPY } from './copy.js';
import { fault } from './random.js';
import type { ExpeditionData } from './types.js';
import { emptyExpedition } from './domain.js';
import { OUTFIT_IDS } from './ids.js';
import { member } from './validation.js';

/** Rebuilding a discarded test journey reads monetary rights from the current shared ledger, not any old game schema. */
export function expeditionRights(economy: EconomyTransactionCapability): ExpeditionData {
    const data = emptyExpedition();
    for (const entry of economy.listOwnedTransactions()) {
        if (!entry.idempotencyKey.startsWith('expedition:')) { continue; }
        if (entry.kind === 'expedition_outfit') {
            data.purchases.push({ id: member(entry.sourceId, OUTFIT_IDS), actionId: entry.actionId, amount: entry.amount });
        } else if (entry.kind === 'expedition_award') {
            data.awards.push({ key: entry.idempotencyKey.slice('expedition:'.length), actionId: entry.actionId, runId: entry.sourceId, amount: entry.amount });
        } else { fault('invalid'); }
    }
    validateEconomy(data, economy); return data;
}

function legs(data: ExpeditionData): EconomyActionLeg[] {
    return [...data.awards.map(a => ({ idempotencyKey: `expedition:${a.key}`, actionId: a.actionId, sourceId: a.runId,
        fromAccountId: 'counterparty:game:expedition', toAccountId: 'player', amount: a.amount, kind: 'expedition_award', title: COPY.name })),
    ...data.purchases.map(p => ({ idempotencyKey: `expedition:outfit:${p.id}`, actionId: p.actionId, sourceId: p.id,
        fromAccountId: 'player', toAccountId: 'system:sink', amount: p.amount, kind: 'expedition_outfit', title: COPY.wardrobe }))];
}
export function validateEconomy(data: ExpeditionData, economy: EconomyTransactionCapability) {
    const expected = legs(data), actual = economy.listOwnedTransactions().filter(t => t.idempotencyKey.startsWith('expedition:'));
    if (expected.length !== actual.length) { fault('invalid'); }
    for (const leg of expected) {
        const match = actual.find(t => t.idempotencyKey === leg.idempotencyKey);
        if (!match || match.actionId !== leg.actionId || match.sourceId !== leg.sourceId || match.amount !== leg.amount || match.kind !== leg.kind
            || match.fromAccountId !== leg.fromAccountId || match.toAccountId !== leg.toAccountId || match.reversalOfTransactionId) { fault('invalid'); }
    }
}
export function postExpeditionMoney(before: ExpeditionData, after: ExpeditionData, economy: EconomyTransactionCapability) {
    const known = new Set(legs(before).map(a => a.idempotencyKey)); const fresh = legs(after).filter(l => !known.has(l.idempotencyKey));
    if (fresh.filter(l => l.fromAccountId === 'player').reduce((sum, l) => sum + l.amount, 0) > economy.getAccountBalance('player')) { fault('funds'); }
    if (fresh.length) { economy.postAction({ legs: fresh }); }
}
