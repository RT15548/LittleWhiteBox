import db, {
    hashTavernMemoryRecord,
    hashTavernStateDocument,
    tavernManagerMemorySnapshotsTable,
    tavernManagerRunsTable,
    tavernManagerStateSnapshotsTable,
    tavernManagerTaskSnapshotsTable,
    tavernMemoryFilesTable,
    tavernMemorySnapshotsTable,
    tavernMessagesTable,
    tavernCommunicationContactsTable,
    tavernCommunicationMessagesTable,
    tavernCommunicationSnapshotsTable,
    tavernCommunicationThreadsTable,
    tavernSessionsTable,
    tavernStateDocumentsTable,
    tavernStatusSnapshotsTable,
    tavernTaskFingerprintStatesTable,
    tavernTaskSnapshotsTable,
    tavernTasksTable,
    type TavernMemorySnapshotRecord,
    type TavernManagerRunRecord,
    type TavernStatusSnapshotRecord,
    type TavernTaskSnapshotRecord,
    type TavernCommunicationSnapshotRecord,
} from './session-db';
import { saveTavernCommunicationSnapshot } from './communications';
import { saveTavernMemorySnapshot } from './memory-files';
import { saveTavernStatusSnapshot } from './status-state';
import {
    getTavernTaskPoolHash,
    resolveAcceptedSnapshotFloor,
    saveTavernTaskSnapshot,
    TAVERN_TASK_BASELINE_FLOOR,
} from './tasks';

export type TavernAcceptedStateSnapshotDomain = 'memory' | 'tasks' | 'status' | 'communications';

export interface TavernAcceptedStateSnapshotOptions {
    domains?: TavernAcceptedStateSnapshotDomain[];
}

export function resolveTavernAcceptedStateSnapshotDomains(input: {
    changedFiles?: string[];
    changedStates?: string[];
    changedTasks?: string[];
    changedCommunications?: boolean;
} = {}): TavernAcceptedStateSnapshotDomain[] {
    const domains = new Set<TavernAcceptedStateSnapshotDomain>();
    if ((input.changedFiles || []).length) {domains.add('memory');}
    if ((input.changedTasks || []).length) {domains.add('tasks');}
    if ((input.changedStates || []).some((key) => String(key || '').startsWith('tavern.status/'))) {
        domains.add('status');
    }
    if (input.changedCommunications === true) {domains.add('communications');}
    return [...domains];
}

function cloneAcceptedStateValue<T>(value: T): T {
    if (typeof structuredClone === 'function') {return structuredClone(value);}
    return JSON.parse(JSON.stringify(value)) as T;
}

function latestSnapshotAtOrBefore<T extends { floor: number; createdAt: number }>(rows: T[], floor: number): T | null {
    return rows
        .filter((row) => Number(row.floor) <= floor)
        .sort((left, right) => Number(right.floor) - Number(left.floor) || Number(right.createdAt) - Number(left.createdAt))[0]
        || null;
}

export async function completeAcceptedTurnManagerRunWithSnapshot(input: {
    sessionId: string;
    managerRunId: string;
    floor: number;
    domains?: TavernAcceptedStateSnapshotDomain[];
    leaseOwnerId: string;
}): Promise<TavernManagerRunRecord> {
    const sessionId = String(input.sessionId || '').trim();
    const managerRunId = String(input.managerRunId || '').trim();
    const leaseOwnerId = String(input.leaseOwnerId || '').trim();
    const floor = Math.floor(Number(input.floor));
    if (!sessionId || !managerRunId || !leaseOwnerId || !Number.isFinite(floor)) {
        throw new Error('manager_snapshot_completion_input_invalid');
    }
    const domains = new Set(Array.isArray(input.domains) ? input.domains : []);
    return await db.transaction(
        'rw',
        tavernManagerRunsTable,
        tavernManagerMemorySnapshotsTable,
        tavernManagerStateSnapshotsTable,
        tavernManagerTaskSnapshotsTable,
        tavernMemoryFilesTable,
        tavernMemorySnapshotsTable,
        tavernStatusSnapshotsTable,
        tavernStateDocumentsTable,
        tavernTasksTable,
        tavernTaskSnapshotsTable,
        tavernTaskFingerprintStatesTable,
        tavernSessionsTable,
        async () => {
            const run = await tavernManagerRunsTable.get(managerRunId);
            if (!run || run.sessionId !== sessionId || run.status !== 'running' || run.leaseOwnerId !== leaseOwnerId) {
                throw new Error('manager_lease_lost');
            }
            if (Number(run.leaseExpiresAt) <= Date.now()) {
                throw new Error('manager_lease_lost');
            }

            if (domains.has('memory')) {
                const [snapshots, managerSnapshots] = await Promise.all([
                    tavernMemorySnapshotsTable.where('sessionId').equals(sessionId).toArray(),
                    tavernManagerMemorySnapshotsTable.where('managerRunId').equals(managerRunId).toArray(),
                ]);
                const baseline = latestSnapshotAtOrBefore(snapshots, floor);
                const files = new Map((baseline?.files || []).map((entry) => [entry.path, cloneAcceptedStateValue(entry.file)]));
                for (const delta of managerSnapshots.filter((snapshot) => !!snapshot.afterHash)) {
                    const path = delta.path;
                    const current = await tavernMemoryFilesTable.get([sessionId, path]) || null;
                    if (hashTavernMemoryRecord(current) !== delta.afterHash) {
                        throw new Error(`manager_resource_revision_conflict:memory/${path}`);
                    }
                    if (current) {files.set(path, cloneAcceptedStateValue(current));}
                    else {files.delete(path);}
                }
                await tavernMemorySnapshotsTable.put({
                    sessionId,
                    floor,
                    files: [...files.entries()]
                        .sort(([left], [right]) => left.localeCompare(right))
                        .map(([path, file]) => ({ path, file })),
                    createdAt: Date.now(),
                });
            }

            if (domains.has('tasks')) {
                const managerSnapshot = await tavernManagerTaskSnapshotsTable.get(managerRunId);
                if (!managerSnapshot?.afterHash) {throw new Error('manager_snapshot_delta_missing:tasks');}
                if (await getTavernTaskPoolHash(sessionId) !== managerSnapshot.afterHash) {
                    throw new Error('manager_resource_revision_conflict:tasks');
                }
                const [tasks, fingerprintState] = await Promise.all([
                    tavernTasksTable.where('sessionId').equals(sessionId).toArray(),
                    tavernTaskFingerprintStatesTable.get(sessionId),
                ]);
                await tavernTaskSnapshotsTable.put({
                    sessionId,
                    floor,
                    tasks: tasks.map((task) => cloneAcceptedStateValue(task)),
                    abandonedFingerprints: [...(fingerprintState?.abandonedFingerprints || [])],
                    createdAt: Date.now(),
                });
            }

            if (domains.has('status')) {
                const managerSnapshots = await tavernManagerStateSnapshotsTable.where('managerRunId').equals(managerRunId).toArray();
                const delta = managerSnapshots.find((snapshot) => snapshot.docType === 'tavern.status');
                if (!delta?.afterHash) {throw new Error('manager_snapshot_delta_missing:tavern.status/main');}
                const current = await tavernStateDocumentsTable.get([sessionId, delta.docType, delta.docId]) || null;
                if (hashTavernStateDocument(current) !== delta.afterHash) {
                    throw new Error('manager_resource_revision_conflict:tavern.status/main');
                }
                await tavernStatusSnapshotsTable.put({
                    sessionId,
                    floor,
                    document: current ? cloneAcceptedStateValue(current) : undefined,
                    digest: current ? String(current.digest || '') : '',
                    createdAt: Date.now(),
                });
            }

            const timestamp = Date.now();
            await tavernManagerRunsTable.update(managerRunId, {
                status: 'completed',
                leaseOwnerId: '',
                leaseExpiresAt: 0,
                error: '',
                updatedAt: timestamp,
            });
            await tavernSessionsTable.update(sessionId, { updatedAt: timestamp });
            const completed = await tavernManagerRunsTable.get(managerRunId);
            if (!completed) {throw new Error('manager_run_missing');}
            return completed;
        },
    );
}

export async function saveAcceptedStateSnapshot(
    sessionId = '',
    floorInput?: number,
    options: TavernAcceptedStateSnapshotOptions = {},
): Promise<{
    floor: number;
    memorySnapshotSaved: boolean;
    taskSnapshotSaved: boolean;
    statusSnapshotSaved: boolean;
    communicationSnapshotSaved: boolean;
}> {
    const id = String(sessionId || '').trim();
    if (!id) {
        return {
            floor: TAVERN_TASK_BASELINE_FLOOR,
            memorySnapshotSaved: false,
            taskSnapshotSaved: false,
            statusSnapshotSaved: false,
            communicationSnapshotSaved: false,
        };
    }
    const requestedDomains = Array.isArray(options.domains)
        ? new Set(options.domains)
        : null;
    const shouldSave = (domain: TavernAcceptedStateSnapshotDomain) => !requestedDomains || requestedDomains.has(domain);
    const [floor, memorySnapshot, taskSnapshot, statusSnapshot, communicationSnapshot] = await db.transaction(
        'rw',
        tavernMemoryFilesTable,
        tavernMemorySnapshotsTable,
        tavernStatusSnapshotsTable,
        tavernMessagesTable,
        tavernSessionsTable,
        tavernStateDocumentsTable,
        tavernTasksTable,
        tavernTaskSnapshotsTable,
        tavernTaskFingerprintStatesTable,
        tavernCommunicationContactsTable,
        tavernCommunicationThreadsTable,
        tavernCommunicationMessagesTable,
        tavernCommunicationSnapshotsTable,
        async () => {
            const floor = await resolveAcceptedSnapshotFloor(id, floorInput);
            const memorySnapshot = shouldSave('memory') ? await saveTavernMemorySnapshot(id, floor) : null;
            const taskSnapshot = shouldSave('tasks') ? await saveTavernTaskSnapshot(id, floor) : null;
            const statusSnapshot = shouldSave('status') ? await saveTavernStatusSnapshot(id, floor) : null;
            const communicationSnapshot = shouldSave('communications') ? await saveTavernCommunicationSnapshot(id, floor) : null;
            return [floor, memorySnapshot, taskSnapshot, statusSnapshot, communicationSnapshot] as const;
        },
    ) as readonly [
        number,
        TavernMemorySnapshotRecord | null,
        TavernTaskSnapshotRecord | null,
        TavernStatusSnapshotRecord | null,
        TavernCommunicationSnapshotRecord | null,
    ];
    return {
        floor,
        memorySnapshotSaved: !!memorySnapshot,
        taskSnapshotSaved: !!taskSnapshot,
        statusSnapshotSaved: !!statusSnapshot,
        communicationSnapshotSaved: !!communicationSnapshot,
    };
}
