import db, {
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
    type TavernStatusSnapshotRecord,
    type TavernTaskSnapshotRecord,
    type TavernCommunicationSnapshotRecord,
} from './session-db';
import { saveTavernCommunicationSnapshot } from './communications';
import { saveTavernMemorySnapshot } from './memory-files';
import { saveTavernStatusSnapshot } from './status-state';
import { resolveAcceptedSnapshotFloor, saveTavernTaskSnapshot, TAVERN_TASK_BASELINE_FLOOR } from './tasks';

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
