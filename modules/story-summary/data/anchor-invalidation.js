import { invalidateReceiptCompletion } from '../maintenance/ranges.js';

function mapChanged(items, transform) {
    let next = items;
    for (let index = 0; index < items.length; index++) {
        const value = transform(items[index]);
        if (value === items[index]) continue;
        if (next === items) next = items.slice();
        next[index] = value;
    }
    return next;
}

const affectedChange = (change, affects) => change.collection === 'anchors' && !change.retired
    && ((change.before && affects(change.before.floor)) || (change.after && affects(change.after.floor)));

/** Pure source retirement. Unchanged branches, including L2 content, are shared read-only. */
export function invalidateMemoryAnchors(snapshot, fromFloor = 0, reason = 'source_changed') {
    const ranges = [
        { from: fromFloor + 1, to: (snapshot.storySummary.lastSummarizedMesId ?? -1) + 1 },
    ];
    return retireAnchors(snapshot, floor => floor >= fromFloor, ranges, reason);
}

export function invalidateMemoryAnchorsAtFloors(snapshot, floors, reason = 'source_changed') {
    const selected = new Set(floors);
    return retireAnchors(snapshot, floor => selected.has(floor), floors.map(floor => ({ from: floor + 1, to: floor + 1 })), reason);
}

function retireAnchors(snapshot, affects, ranges, reason) {
    const ids = new Set();
    const retained = snapshot.stateAtoms.filter(atom => {
        if (!affects(atom.floor)) return true;
        ids.add(atom.atomId);
        return false;
    });
    const stateAtoms = retained.length === snapshot.stateAtoms.length ? snapshot.stateAtoms : retained;
    let retired = 0;
    const history = snapshot.storySummary.summaryHistory || [];
    const summaryHistory = mapChanged(history, batch => {
        if (!batch.maintenance) return batch;
        const maintenance = mapChanged(batch.maintenance, receipt => {
            const next = invalidateReceiptCompletion(receipt, ranges);
            const operations = mapChanged(receipt.operations, operation => {
                const changes = mapChanged(operation.changes, change => {
                    if (!affectedChange(change, affects)) return change;
                    ids.add(change.key);
                    retired++;
                    return { ...change, retired: { reason, at: Date.now() } };
                });
                return changes === operation.changes ? operation : { ...operation, changes };
            });
            return operations === receipt.operations ? next : { ...next, operations };
        });
        return maintenance === batch.maintenance ? batch : { ...batch, maintenance };
    });
    let byFloor = snapshot.l0Index.byFloor;
    for (const floor of Object.keys(snapshot.l0Index.byFloor)) {
        if (!affects(Number(floor))) continue;
        if (byFloor === snapshot.l0Index.byFloor) byFloor = { ...byFloor };
        delete byFloor[floor];
    }
    const storySummary = summaryHistory === history ? snapshot.storySummary : { ...snapshot.storySummary, summaryHistory };
    const l0Index = byFloor === snapshot.l0Index.byFloor ? snapshot.l0Index : { ...snapshot.l0Index, byFloor };
    const next = stateAtoms === snapshot.stateAtoms && storySummary === snapshot.storySummary && l0Index === snapshot.l0Index
        ? snapshot : { ...snapshot, storySummary, stateAtoms, l0Index };
    return { next, atomIds: [...ids], retired };
}

export function hasActiveAnchorHistoryFromFloor(store, fromFloor) {
    return (store?.summaryHistory || []).some(batch => (batch.maintenance || []).some(receipt =>
        receipt.operations.some(operation => operation.changes.some(change => affectedChange(change, floor => floor >= fromFloor)))));
}

export function updateMaintainedAnchorIndex(snapshot, floors) {
    for (const floor of floors) {
        const count = snapshot.stateAtoms.filter(atom => atom.floor === floor).length;
        snapshot.l0Index.byFloor[String(floor)] = { ...snapshot.l0Index.byFloor[String(floor)],
            floor, status: count ? 'ok' : 'empty', atoms: count, updatedAt: Date.now() };
    }
}
