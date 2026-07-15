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

export async function saveAcceptedStateSnapshot(sessionId = '', floorInput?: number): Promise<{
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
    const floor = await resolveAcceptedSnapshotFloor(id, floorInput);
    const [memorySnapshot, taskSnapshot, statusSnapshot, communicationSnapshot] = await db.transaction(
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
            const memorySnapshot = await saveTavernMemorySnapshot(id, floor);
            const taskSnapshot = await saveTavernTaskSnapshot(id, floor);
            const statusSnapshot = await saveTavernStatusSnapshot(id, floor);
            const communicationSnapshot = await saveTavernCommunicationSnapshot(id, floor);
            return [memorySnapshot, taskSnapshot, statusSnapshot, communicationSnapshot] as const;
        },
    ) as readonly [
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
