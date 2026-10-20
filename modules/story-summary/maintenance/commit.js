import { maintenanceImpact } from './domain.js';
import { appendMaintenanceReceipt } from '../data/summary-history.js';
import { updateMaintainedAnchorIndex } from '../data/anchor-invalidation.js';
import { requireMemory } from './errors.js';
import { maintenanceRanges } from './ranges.js';

/** Ports keep staging/verification testable; the host supplies its existing metadata and vector owners. */
export async function commitMemorySession(session, result, ports, signal) {
    const edit = session.pending;
    requireMemory(edit, 'pending_edit');
    requireMemory(!signal?.aborted, 'cancelled');
    // getRandomValues is available on LAN HTTP too; receipt IDs are opaque, not UUIDs.
    const id = Array.from(crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2, '0')).join('');
    const current = ports.read();
    // Receipts follow actual commit order, including writes from a run with an older cutoff.
    let memory;
    if (edit.outcome) {
        requireMemory(current.chatId === session.chatId, 'conflict');
        if (!session.ownsHistory(current)) return null;
    } else memory = session.assertCurrent(current);
    const operations = session.pending.operations;
    const impact = maintenanceImpact(operations);
    const previous = structuredClone({ store: current.store, atoms: current.atoms, l0Index: current.l0Index });
    const receipt = {
        version: 2, id, runId: result.runId, createdAt: Date.now(), policy: session.policy,
        start: session.start + 1, cutoff: session.cutoff + 1,
        operations, coverage: session.coverage(), summary: edit.note, calls: result.calls,
        ...(edit.outcome ? { outcome: { ...edit.outcome,
            ...(result.mode !== 'chat' && edit.outcome.status === 'completed' && maintenanceRanges(current.store.summaryHistory, session.cutoff).pending.length
                ? { status: 'partial' } : {}) } } : {}),
        ...(edit.completion ? { completion: edit.completion } : {}),
    };
    const next = structuredClone(previous);
    if (memory) next.store.json = memory.json;
    if (impact.summary) next.store.updatedAt = Date.now();
    appendMaintenanceReceipt(next.store, receipt);
    if (memory) next.atoms = memory.atoms;
    const snapshot = { storySummary: next.store, stateAtoms: next.atoms, l0Index: next.l0Index };
    updateMaintainedAnchorIndex(snapshot, impact.floors);
    try {
        await ports.commit(snapshot, { storySummary: previous.store, stateAtoms: previous.atoms, l0Index: previous.l0Index }, impact, () => {
            requireMemory(!signal?.aborted, 'cancelled');
            if (edit.outcome) {
                const fresh = ports.read();
                requireMemory(fresh.chatId === session.chatId && JSON.stringify({ store: fresh.store, atoms: fresh.atoms, l0Index: fresh.l0Index }) === JSON.stringify(previous), 'conflict');
            } else {
                const fresh = ports.read();
                session.assertCurrent(fresh);
                requireMemory(JSON.stringify({ store: fresh.store, atoms: fresh.atoms, l0Index: fresh.l0Index }) === JSON.stringify(previous), 'conflict');
            }
        });
    } catch (error) {
        if (error.uncertain) error.receiptId = receipt.id;
        throw error;
    }
    return { receipt, impact, ranges: maintenanceRanges(next.store.summaryHistory, session.cutoff),
        current: { ...current, store: next.store, json: next.store.json, atoms: next.atoms, l0Index: next.l0Index } };
}
