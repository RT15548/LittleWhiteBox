import db, {
    tavernMemoryFilesTable,
    tavernMemorySnapshotsTable,
    tavernMessagesTable,
    tavernSessionsTable,
    tavernStateDocumentsTable,
    tavernStatusSnapshotsTable,
    tavernTaskFingerprintStatesTable,
    tavernTaskSnapshotsTable,
    tavernTasksTable,
    type TavernMemorySnapshotRecord,
    type TavernStatusSnapshotRecord,
    type TavernTaskSnapshotRecord,
} from './session-db';
import { saveTavernMemorySnapshot } from './memory-files';
import { saveTavernStatusSnapshot } from './status-state';
import { resolveAcceptedSnapshotFloor, saveTavernTaskSnapshot, TAVERN_TASK_BASELINE_FLOOR } from './tasks';

export async function saveAcceptedStateSnapshot(sessionId = '', floorInput?: number): Promise<{
    floor: number;
    memorySnapshotSaved: boolean;
    taskSnapshotSaved: boolean;
    statusSnapshotSaved: boolean;
}> {
    const id = String(sessionId || '').trim();
    if (!id) {
        return {
            floor: TAVERN_TASK_BASELINE_FLOOR,
            memorySnapshotSaved: false,
            taskSnapshotSaved: false,
            statusSnapshotSaved: false,
        };
    }
    const floor = await resolveAcceptedSnapshotFloor(id, floorInput);
    const [memorySnapshot, taskSnapshot, statusSnapshot] = await db.transaction(
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
        async () => {
            const memorySnapshot = await saveTavernMemorySnapshot(id, floor);
            const taskSnapshot = await saveTavernTaskSnapshot(id, floor);
            const statusSnapshot = await saveTavernStatusSnapshot(id, floor);
            return [memorySnapshot, taskSnapshot, statusSnapshot] as const;
        },
    ) as readonly [TavernMemorySnapshotRecord | null, TavernTaskSnapshotRecord | null, TavernStatusSnapshotRecord | null];
    return {
        floor,
        memorySnapshotSaved: !!memorySnapshot,
        taskSnapshotSaved: !!taskSnapshot,
        statusSnapshotSaved: !!statusSnapshot,
    };
}
