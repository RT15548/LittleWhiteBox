import { getContext } from '../../../../../../extensions.js';
import { getVectorConfig } from '../data/config.js';
import { getSummaryStore } from '../data/store.js';
import { assertMemoryWritable, waitForMemoryCommit } from '../data/memory-commit.js';
import { getStateAtoms, getStateVectorDescriptors, saveStateVectors, deleteStateVectorsByIds } from '../vector/storage/state-store.js';
import { getMeta, getEventVectorDescriptors, saveEventVectors, deleteEventVectorsByIds } from '../vector/storage/chunk-store.js';
import { getEngineFingerprint } from '../vector/utils/embedder.js';
import { inputDigest } from '../vector/utils/vector-input-digest.js';
import { buildEventVectorText, selectMissingEventVectorPairs } from '../vector/pipeline/event-vector-input.js';
import { buildRAggregateText } from '../vector/pipeline/state-vector-input.js';
import { selectMissingStateVectorAtoms } from '../vector/pipeline/state-vector-policy.js';
import { orphanVectorIds } from '../vector/utils/vector-source.js';
import { getChatIdentity } from '../data/chat-identity.js';
import { embedForStorage, acknowledgeStoredEmbeddings, readStoredEmbeddingFailure } from '../vector/runtime/embedding-receipts.js';
import { classifyVectorRecoveryFailure } from '../vector/integrity-recovery.js';
import { runVectorGenerationTask, cancelVectorWriteOperation } from '../vector/runtime/maintenance-coordinator.js';
import { createAbortError, throwIfSignalAborted } from '../../../shared/common/abort-utils.js';
import { requireMemory } from './errors.js';

function maintenanceIndexJobs({ events, atoms }) {
    return [
        ...events.map(event => ({ kind: 'event', id: event.id, text: buildEventVectorText(event) })),
        ...atoms.flatMap(atom => [{ kind: 'state', id: atom.atomId, text: atom.semantic },
            { kind: 'relation', id: atom.atomId, text: buildRAggregateText(atom) }]),
    ];
}

export async function inspectMaintenanceIndexes(chatId, impact) {
    const config = getVectorConfig();
    if (!config.enabled) return { status: 'disabled', events: [], atoms: [] };
    const fingerprint = getEngineFingerprint(config);
    const meta = await getMeta(chatId);
    requireMemory(!meta?.fingerprint || meta.fingerprint === fingerprint, 'fingerprint_mismatch');
    const [eventVectors, stateVectors] = await Promise.all([getEventVectorDescriptors(chatId), getStateVectorDescriptors(chatId)]);
    requireMemory(getContext().chatId === chatId, 'conflict');
    const sourceEvents = (getSummaryStore()?.json?.events || []).filter(event => impact.eventIds.includes(event.id));
    const sourceAtoms = getStateAtoms().filter(atom => impact.atomIds.includes(atom.atomId));
    const missingEventIds = new Set(selectMissingEventVectorPairs(sourceEvents, eventVectors, fingerprint).map(pair => pair.id));
    const events = sourceEvents.filter(event => missingEventIds.has(event.id));
    const atoms = selectMissingStateVectorAtoms(sourceAtoms, stateVectors, fingerprint);
    const obsoleteEventIds = orphanVectorIds(eventVectors.filter(vector => impact.eventIds.includes(vector.eventId)),
        new Set(sourceEvents.map(event => event.id)), 'eventId');
    const obsoleteAtomIds = orphanVectorIds(stateVectors.filter(vector => impact.atomIds.includes(vector.atomId)),
        new Set(sourceAtoms.map(atom => atom.atomId)), 'atomId');
    const error = readStoredEmbeddingFailure(maintenanceIndexJobs({ events, atoms }).map(job => job.text), config,
        { chatId: getChatIdentity(getContext()) });
    return { status: events.length || atoms.length || obsoleteEventIds.length || obsoleteAtomIds.length ? 'pending' : 'ready',
        events, atoms, obsoleteEventIds, obsoleteAtomIds, fingerprint,
        ...(error ? { failure: classifyVectorRecoveryFailure({ error }) } : {}) };
}

/** Only derived data. Retrying here cannot issue another semantic maintenance request. */
export async function repairMaintenanceIndexes(chatId, impact, { signal: ownerSignal, operationId } = {}) {
    throwIfSignalAborted(ownerSignal);
    requireMemory(!ownerSignal || typeof operationId === 'string' && operationId.length > 0, 'invalid_arguments', '', 'operationId');
    const start = () => runVectorGenerationTask({ chatId, kind: 'memory-maintenance-index', operationId }, async ({ signal, commit }) => {
        await waitForMemoryCommit(signal);
        assertMemoryWritable(chatId);
        const missing = await inspectMaintenanceIndexes(chatId, impact);
        throwIfSignalAborted(signal);
        if (missing.status !== 'pending') return { status: missing.status };
        const config = getVectorConfig();
        const receiptChatId = getChatIdentity(getContext());
        const jobs = maintenanceIndexJobs(missing);
        const vectors = [];
        for (let offset = 0; offset < jobs.length; offset += 20) {
            throwIfSignalAborted(signal);
            const batch = jobs.slice(offset, offset + 20);
            const result = await embedForStorage(batch.map(job => job.text), config, { chatId: receiptChatId, signal });
            throwIfSignalAborted(signal);
            requireMemory(result?.length === batch.length, 'index_response_invalid');
            vectors.push(...result);
        }
        return commit(async () => {
            await waitForMemoryCommit(signal);
            requireMemory(!signal.aborted && getChatIdentity(getContext()) === receiptChatId && getEngineFingerprint(getVectorConfig()) === missing.fingerprint, 'conflict');
            assertMemoryWritable(chatId);
            const currentEvents = new Map((getSummaryStore()?.json?.events || []).map(event => [event.id, event]));
            const currentAtoms = new Map(getStateAtoms().map(atom => [atom.atomId, atom]));
            const eventItems = [];
            const atomItems = new Map();
            for (const [index, job] of jobs.entries()) {
                const current = job.kind === 'event' ? buildEventVectorText(currentEvents.get(job.id))
                    : job.kind === 'state' ? currentAtoms.get(job.id)?.semantic : buildRAggregateText(currentAtoms.get(job.id));
                requireMemory(current === job.text, 'conflict');
                if (job.kind === 'event') eventItems.push({ eventId: job.id, vector: vectors[index], sourceHash: inputDigest('event', job.text) });
                else {
                    const item = atomItems.get(job.id) || { atomId: job.id, floor: currentAtoms.get(job.id).floor };
                    if (job.kind === 'state') Object.assign(item, { vector: vectors[index], sourceHash: inputDigest('state', job.text) });
                    else Object.assign(item, { rVector: vectors[index], relationHash: inputDigest('relation', job.text) });
                    atomItems.set(job.id, item);
                }
            }
            await deleteEventVectorsByIds(chatId, missing.obsoleteEventIds.filter(id => !currentEvents.has(id)));
            throwIfSignalAborted(signal);
            await deleteStateVectorsByIds(chatId, missing.obsoleteAtomIds.filter(id => !currentAtoms.has(id)));
            throwIfSignalAborted(signal);
            if (eventItems.length) await saveEventVectors(chatId, eventItems, missing.fingerprint);
            throwIfSignalAborted(signal);
            if (atomItems.size) await saveStateVectors(chatId, [...atomItems.values()], missing.fingerprint);
            acknowledgeStoredEmbeddings(jobs.map(job => job.text), config, { chatId: receiptChatId });
            return { status: 'ready' };
        });
    });
    if (!ownerSignal) return start();

    // The coordinator retains cancelled queue entries until preceding work settles.
    // Race only the caller's wait; the observed task still owns its cancellation
    // signal and cannot commit later, even if an embedding provider ignores abort.
    let abort;
    const cancelled = new Promise((_, reject) => {
        abort = () => {
            const error = createAbortError();
            cancelVectorWriteOperation(operationId, error);
            reject(error);
        };
        ownerSignal.addEventListener('abort', abort, { once: true });
    });
    try {
        const running = Promise.resolve().then(() => { throwIfSignalAborted(ownerSignal); return start(); });
        return await Promise.race([running, cancelled]);
    } finally { ownerSignal.removeEventListener('abort', abort); }
}
