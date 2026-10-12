import { drawCancellationJournal } from './draw-cancellation-journal.js';
import { acknowledgePendingImageJobCancellations } from './pending-image-jobs.js';

const barriers = new WeakMap();
const signalJobs = new WeakMap();

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
    await journal.forget(entry.id);
}

export async function cancelDrawWork(targets, client, journal = drawCancellationJournal) {
    if (!targets.jobIds.length && !targets.runIds.length) return false;
    const entry = await journal.record(targets);
    await completeCancellation(entry, client, journal);
    return true;
}

export async function resumeDrawCancellations(client, owner, journal = drawCancellationJournal) {
    const blockedJobIds = new Set(), blockedRunIds = new Set(), failures = [];
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
        } catch (error) {
            block(entry);
            failures.push(error);
        }
    }
    return { blockedJobIds, blockedRunIds, failures };
}
