import { executeStateOperations, getRootFromPath, encodeStoredVariable } from './executor.js';
import { replaceRules } from './guard-core.js';
import { entryRoots, ownedRoots, prefixDigests } from './records.js';
import { candidateFloors, validCheckpoints, checkpoint, storeCheckpoints } from './checkpoints.js';

function scopedRules(rules, roots, include) {
    return Object.fromEntries(Object.entries(rules || {}).filter(([path]) => roots.has(getRootFromPath(path)) === include));
}

/** Compute a replacement without publishing records, variables or guard state midway. */
export function calculateRebuild(ctx, records, previousRoots, reportEntry) {
    const roots = ownedRoots(records);
    const affected = new Set([...previousRoots, ...roots]);
    const last = records.length - 1;
    let digests = prefixDigests(records);
    const candidates = candidateFloors(last);
    const valid = validCheckpoints(ctx.chatMetadata, digests, last);
    const missing = candidates.filter(floor => !valid.some(point => point.floor === floor));
    let before = missing.length ? Math.min(...missing) : last + 1;
    if (reportEntry) {
        const floor = records.findIndex(record => record?.entries.includes(reportEntry));
        if (floor >= 0) before = Math.min(before, floor);
    }
    const start = valid.filter(point => point.floor < before).sort((a, b) => b.floor - a.floor)[0];
    const replay = {
        variables: structuredClone(start?.variables || {}),
        LWB_RULES_V2: structuredClone(start?.rules || {}),
    };
    const points = valid.filter(point => candidates.includes(point.floor));
    // Ownership while replaying is what the records before each entry claim, exactly the scope a
    // live call at that position sees. Replay therefore depends only on the prefix it has read.
    const owned = ownedRoots(records.slice(0, (start?.floor ?? -1) + 1));
    let result;
    try {
        for (let floor = (start?.floor ?? -1) + 1; floor <= last; floor++) {
            for (const entry of records[floor]?.entries || []) {
                const outcome = executeStateOperations(replay, entry.rules || [], entry.ops, {
                    memory: true, report: entry === reportEntry,
                    floor, chatId: ctx.chatId, ownedRoots: new Set(owned), claimRoots: entryRoots(entry),
                });
                for (const root of entryRoots(entry)) owned.add(root);
                if (entry === reportEntry) {
                    result = outcome;
                    if (outcome.acceptedOps.length !== entry.ops.length) {
                        // Only the new entry is admitted here. Old requests retain their replay semantics.
                        // Rejected JSON operations have no effects or ownership, so removing them changes
                        // record digests, not the replay state. Later checkpoints use the admitted record.
                        records = records.slice();
                        records[floor] = { ...records[floor], entries: records[floor].entries.map(item =>
                            item === entry ? { ...entry, ops: outcome.acceptedOps } : item) };
                        digests = prefixDigests(records);
                    }
                }
            }
            if (candidates.includes(floor)) {
                const existing = points.findIndex(point => point.floor === floor);
                if (existing !== -1) points.splice(existing, 1);
                // The cache is the complete replay state of this prefix. Ownership comes from the whole
                // chat and is applied only at publication, so later records cannot make it stale.
                points.push(checkpoint(floor, digests[floor], replay.variables, replay.LWB_RULES_V2));
            }
        }
        const variables = { ...ctx.chatMetadata.variables };
        for (const root of affected) delete variables[root];
        for (const root of roots) {
            if (Object.hasOwn(replay.variables, root)) variables[root] = encodeStoredVariable(replay.variables[root]);
        }
        const rules = {
            ...scopedRules(ctx.chatMetadata.LWB_RULES_V2, affected, false),
            ...scopedRules(replay.LWB_RULES_V2, roots, true),
        };
        return { variables, rules, roots, points, records, result, usedCheckpoint: start?.floor ?? null };
    } finally {
        replaceRules(ctx.chatMetadata.LWB_RULES_V2 || {});
    }
}

export function publishRebuild(meta, rebuilt) {
    meta.variables = rebuilt.variables;
    meta.LWB_RULES_V2 = rebuilt.rules;
    replaceRules(rebuilt.rules);
    storeCheckpoints(meta, rebuilt.points);
}

/** Cache request-derived state, never unrecorded/native writes to managed roots. */
export function refreshLiveCheckpoint(ctx, records, roots) {
    const last = records.length - 1;
    const candidates = candidateFloors(last);
    if (candidates.includes(last)) {
        const rebuilt = calculateRebuild(ctx, records, roots);
        storeCheckpoints(ctx.chatMetadata, rebuilt.points);
        return;
    }
    const digests = prefixDigests(records);
    const points = validCheckpoints(ctx.chatMetadata, digests, last).filter(point => candidates.includes(point.floor));
    storeCheckpoints(ctx.chatMetadata, points);
}
