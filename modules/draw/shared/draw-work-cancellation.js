import { drawCancellationJournal } from './draw-cancellation-journal.js';
import { acknowledgePendingImageJobCancellations } from './pending-image-jobs.js';

const barriers = new WeakMap();
const signalJobs = new WeakMap();
// ACK is process-local. The retained intent is replayed after reload before
// any run marker can be cleared; no second durable cancellation state exists.
const acknowledgedRuns = new WeakMap();

function acknowledgedFor(journal, owner) {
    let owners = acknowledgedRuns.get(journal);
    if (!owners) acknowledgedRuns.set(journal, owners = new Map());
    let runs = owners.get(owner);
    if (!runs) owners.set(owner, runs = new Map());
    return runs;
}

export async function settleDrawRunCancellations(owner, runIds, journal = drawCancellationJournal) {
    const acknowledged = acknowledgedFor(journal, owner);
    const settled = runIds.filter(id => acknowledged.has(id));
    if (!settled.length) return;
    const receipts = new Map(settled.map(id => [id, new Set(acknowledged.get(id))]));
    const entryIds = [...new Set([...receipts.values()].flatMap(ids => [...ids]))];
    // Adoption may have created a child journal after the initial ACK projection.
    await acknowledgePendingImageJobCancellations({ jobIds: [], runIds: settled });
    // A repeated floor cancellation can add an unacknowledged group containing
    // this same run and new jobs. Only the exact acknowledged intents may retire.
    await journal.forgetRuns(owner, settled, entryIds);
    for (const [id, consumed] of receipts) {
        const current = acknowledged.get(id);
        for (const entryId of consumed) current?.delete(entryId);
        if (!current?.size) acknowledged.delete(id);
    }
}

export function registerDrawCancellationJob(signal, jobId) {
    if (!signal) return;
    const ids = signalJobs.get(signal) || new Set();
    ids.add(jobId);
    signalJobs.set(signal, ids);
}

export function captureDrawCancellationJobs(signals) {
    return signals.flatMap(signal => [...(signalJobs.get(signal) || [])]);
}

// Register before aborting any controller. Monitors must not turn one floor
// click into independent HTTP cancellations while its target set is captured.
export function holdDrawCancellation(signals, operation) {
    const pending = Promise.resolve().then(operation).catch(error => {
        error.detached = true;
        throw error;
    });
    for (const signal of signals) barriers.set(signal, pending);
    return pending;
}

export async function waitForDrawCancellation(signal) {
    await barriers.get(signal);
}

async function completeCancellation(entry, client, journal) {
    await client.cancelWork({ owner: entry.owner, jobIds: entry.jobIds, runIds: entry.runIds });
    // Backend jobs are process-local and may already be absent. Their ACK must
    // survive in the delivery journal before we drop the only local intent.
    await acknowledgePendingImageJobCancellations(entry);
    if (entry.runIds.length) {
        const acknowledged = acknowledgedFor(journal, entry.owner);
        for (const id of entry.runIds) {
            const receipts = acknowledged.get(id) || new Set();
            receipts.add(entry.id);
            acknowledged.set(id, receipts);
        }
    } else {
        await journal.forget(entry.id);
    }
}

export async function cancelDrawWork(targets, client, journal = drawCancellationJournal) {
    if (!targets.jobIds.length && !targets.runIds.length) return false;
    const entry = await journal.record(targets);
    await completeCancellation(entry, client, journal);
    return true;
}

export async function resumeDrawCancellations(client, owner, journal = drawCancellationJournal) {
    const blockedJobIds = new Set(), blockedRunIds = new Set(), acknowledgedRunIds = new Set(), failures = [];
    const acknowledgedEntries = [];
    const block = entry => {
        for (const id of entry.jobIds) blockedJobIds.add(id);
        for (const id of entry.runIds) blockedRunIds.add(id);
    };
    for (const entry of await journal.list()) {
        // Other profiles share this browser database, not the server namespace.
        // Keep their intent and delivery records untouched until that user returns.
        if (entry.owner !== owner) { block(entry); continue; }
        try {
            await completeCancellation(entry, client, journal);
            for (const id of entry.runIds) acknowledgedRunIds.add(id);
            if (entry.runIds.length) acknowledgedEntries.push(entry);
        } catch (error) {
            block(entry);
            failures.push(error);
        }
    }
    return { blockedJobIds, blockedRunIds, acknowledgedRunIds, acknowledgedEntries, failures };
}
