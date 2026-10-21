import { maintenanceImpact, sameMemory } from './domain.js';
import { appendMaintenanceReceipt } from '../data/summary-history.js';
import { updateMaintainedAnchorIndex } from '../data/anchor-invalidation.js';
import { requireMemory } from './errors.js';
import { maintenanceRanges } from './ranges.js';
import { projectMaintenanceResult } from './result.js';

const receiptId = () => Array.from(crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2, '0')).join('');
const projection = current => ({ storySummary: { ...current.store }, stateAtoms: current.atoms, l0Index: current.l0Index });

// Confirmation may coexist with source retirement. Report the published receipt,
// never the pre-swipe draft, both on the initial save and read-only recovery.
export function publishedMaintenanceCommit(prepared, snapshot) {
    const byId = new Map(snapshot.storySummary.summaryHistory.flatMap(batch => batch.maintenance || []).map(receipt => [receipt.id, receipt]));
    const receipts = prepared.receipts.map(receipt => byId.get(receipt.id));
    requireMemory(receipts.every(Boolean), 'conflict');
    const receipt = byId.get(prepared.receipt.id);
    const result = projectMaintenanceResult(receipts, receipt.outcome);
    const impact = maintenanceImpact(result.operations);
    return { ...prepared, receipts, receipt, impact, outcome: result.outcome,
        ranges: maintenanceRanges(snapshot.storySummary.summaryHistory, prepared.ranges.cutoff - 1),
        current: { ...prepared.current, store: snapshot.storySummary, json: snapshot.storySummary.json,
            atoms: snapshot.stateAtoms, l0Index: snapshot.l0Index } };
}

/** All task edits and completion receipts share one existing persistence transaction. */
export async function commitMemorySession(session, result, ports, signal) {
    requireMemory(session.hasPending, 'pending_edit');
    requireMemory(!signal?.aborted, 'cancelled');
    const current = ports.read();
    requireMemory(current.chatId === session.chatId, 'conflict');
    requireMemory(session.ownsHistory(current), 'conflict');
    const memory = session.assertCurrent(current), edit = session.pending;
    const operations = edit.operations, impact = maintenanceImpact(operations);
    const previous = projection(current);
    const boundary = current.store.lastSummarizedMesId;
    const store = { ...current.store, json: memory.json,
        summaryHistory: current.store.summaryHistory.map(batch => batch.endMesId === boundary
            ? { ...batch, maintenance: [...batch.maintenance] } : batch),
        ...(impact.summary ? { updatedAt: Date.now() } : {}),
    };
    const receipts = [];
    const create = extra => ({ version: 2, id: receiptId(), runId: result.runId, createdAt: Date.now(), policy: session.policy,
        start: session.start + 1, cutoff: session.cutoff + 1, operations: [],
        coverage: { supplied: [], missingAnchors: [] }, summary: '', calls: [], ...extra });
    for (const completion of edit.completions) {
        const receipt = create({ completion });
        appendMaintenanceReceipt(store, receipt); receipts.push(receipt);
    }
    let outcome = edit.outcome;
    if (outcome && result.mode !== 'chat' && outcome.status === 'completed'
        && maintenanceRanges(store.summaryHistory, session.cutoff).pending.length) outcome = { ...outcome, status: 'partial' };
    if (operations.length || outcome || !receipts.length) {
        const receipt = create({ operations, ...(outcome ? { outcome } : {}) });
        appendMaintenanceReceipt(store, receipt); receipts.push(receipt);
    }
    const receipt = receipts.at(-1);
    receipt.coverage = session.coverage(); receipt.summary = edit.note; receipt.calls = structuredClone(result.calls || []);
    const snapshot = { storySummary: store, stateAtoms: memory.atoms,
        l0Index: impact.floors.length ? { ...current.l0Index, byFloor: { ...current.l0Index.byFloor } } : current.l0Index };
    updateMaintainedAnchorIndex(snapshot, impact.floors);
    const prepared = { receipt, receipts, impact, ranges: maintenanceRanges(store.summaryHistory, session.cutoff),
        current: { ...current, store, json: store.json, atoms: snapshot.stateAtoms, l0Index: snapshot.l0Index } };
    try {
        const published = await ports.commit(snapshot, previous, impact, () => {
            requireMemory(!signal?.aborted, 'cancelled');
            const fresh = ports.read();
            session.assertCurrent(fresh);
            requireMemory(sameMemory(projection(fresh), previous), 'conflict');
        });
        return publishedMaintenanceCommit(prepared, published);
    } catch (error) {
        if (error.uncertain) {
            // Recovery confirms this exact transaction; it must not mint IDs or send the edit again.
            error.receiptId = receipt.id;
            error.receiptIds = receipts.map(item => item.id);
            error.commitResult = prepared;
        }
        throw error;
    }
}
