import { getContext } from '../../../../../../extensions.js';
import { getVectorConfig } from '../data/config.js';
import { getSummaryStore } from '../data/store.js';
import { assertMemoryWritable, waitForMemoryCommit } from '../data/memory-commit.js';
import { getStateAtoms, getStateVectorDescriptors, saveStateVectors } from '../vector/storage/state-store.js';
import { getAllEventVectors, saveEventVectors } from '../vector/storage/chunk-store.js';
import { getEngineFingerprint } from '../vector/utils/embedder.js';
import { inputDigest } from '../vector/utils/vector-input-digest.js';
import { buildEventVectorText } from '../vector/pipeline/event-vector-input.js';
import { buildRAggregateText } from '../vector/pipeline/state-vector-input.js';
import { embed } from '../vector/llm/siliconflow.js';
import { runVectorGenerationTask } from '../vector/runtime/maintenance-coordinator.js';
import { requireMemory } from './errors.js';

export async function inspectMaintenanceIndexes(chatId, impact) {
    const config = getVectorConfig();
    if (!config.enabled) return { status: 'disabled', events: [], atoms: [] };
    const fingerprint = getEngineFingerprint(config);
    const [eventVectors, stateVectors] = await Promise.all([getAllEventVectors(chatId), getStateVectorDescriptors(chatId)]);
    requireMemory(getContext().chatId === chatId, 'conflict');
    const events = (getSummaryStore()?.json?.events || []).filter(event => impact.eventIds.includes(event.id)
        && !eventVectors.some(vector => vector.eventId === event.id && vector.fingerprint === fingerprint
            && vector.sourceHash === inputDigest('event', buildEventVectorText(event))));
    const atoms = getStateAtoms().filter(atom => impact.atomIds.includes(atom.atomId)
        && !stateVectors.some(vector => vector.atomId === atom.atomId && vector.fingerprint === fingerprint
            && vector.vectorValid && vector.rVectorValid && vector.sourceHash === inputDigest('state', atom.semantic)
            && vector.relationHash === inputDigest('relation', buildRAggregateText(atom))));
    return { status: events.length || atoms.length ? 'pending' : 'ready', events, atoms, fingerprint };
}

/** Only derived data. Retrying here cannot issue another semantic maintenance request. */
export async function repairMaintenanceIndexes(chatId, impact) {
    return runVectorGenerationTask({ chatId, kind: 'memory-maintenance-index' }, async ({ signal, commit }) => {
        await waitForMemoryCommit(signal);
        assertMemoryWritable(chatId);
        const missing = await inspectMaintenanceIndexes(chatId, impact);
        if (missing.status !== 'pending') return { status: missing.status };
        const config = getVectorConfig();
        const jobs = [
            ...missing.events.map(event => ({ kind: 'event', id: event.id, text: buildEventVectorText(event) })),
            ...missing.atoms.flatMap(atom => [{ kind: 'state', id: atom.atomId, text: atom.semantic },
                { kind: 'relation', id: atom.atomId, text: buildRAggregateText(atom) }]),
        ];
        const vectors = [];
        for (let offset = 0; offset < jobs.length; offset += 20) {
            const batch = jobs.slice(offset, offset + 20);
            const result = await embed(batch.map(job => job.text), { apiConfig: config.embeddingApi, signal });
            requireMemory(result?.length === batch.length, 'index_response_invalid');
            vectors.push(...result);
        }
        return commit(async () => {
            await waitForMemoryCommit(signal);
            requireMemory(!signal.aborted && getContext().chatId === chatId && getEngineFingerprint(getVectorConfig()) === missing.fingerprint, 'conflict');
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
            if (eventItems.length) await saveEventVectors(chatId, eventItems, missing.fingerprint);
            if (atomItems.size) await saveStateVectors(chatId, [...atomItems.values()], missing.fingerprint);
            return { status: 'ready' };
        });
    });
}
