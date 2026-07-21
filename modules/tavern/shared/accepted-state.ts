import db, {
    assertTavernManagerRunSourceMessages,
    hashTavernMemoryRecord,
    hashTavernStateDocument,
    tavernManagerMemorySnapshotsTable,
    tavernManagerRunsTable,
    tavernManagerStateSnapshotsTable,
    tavernMemoryFilesTable,
    tavernMemorySnapshotsTable,
    tavernMessagesTable,
    tavernCommunicationContactsTable,
    tavernCommunicationMessagesTable,
    tavernCommunicationSnapshotsTable,
    tavernCommunicationThreadsTable,
    tavernEconomyAccountsTable,
    tavernEconomyTransactionsTable,
    tavernSessionsTable,
    tavernStateDocumentsTable,
    tavernStatusSnapshotsTable,
    tavernTaskVersionsTable,
    type TavernMemorySnapshotRecord,
    type TavernMemorySnapshotFileEntry,
    type TavernManagerRunRecord,
    type TavernStructuredStateDocumentRecord,
    type TavernStatusSnapshotRecord,
    type TavernCommunicationSnapshotRecord,
} from './session-db';
import { saveTavernCommunicationSnapshot } from './communications';
import { getLatestTavernMemorySnapshot, saveTavernMemorySnapshot } from './memory-files';
import {
    getLatestTavernStatusSnapshot,
    saveTavernStatusSnapshot,
    TAVERN_STATUS_DOC_ID,
    TAVERN_STATUS_DOC_TYPE,
} from './status-state';
import { resolveTavernAcceptedSnapshotFloor, TAVERN_ACCEPTED_BASELINE_FLOOR } from './accepted-snapshot-floor';
import { commitTavernTaskStagedActionsInCurrentDbTransaction } from './tasks/task-service';
import type { TavernTaskStagedAction } from './tasks/task-types';

export type TavernAcceptedStateSnapshotDomain = 'memory' | 'status' | 'communications';

export interface TavernAcceptedStateSnapshotOptions {
    domains?: TavernAcceptedStateSnapshotDomain[];
}

export interface TavernAssistantAcceptedStateBasis {
    sessionId: string;
    floor: number;
    memoryFiles: TavernMemorySnapshotFileEntry[];
    statusDocument: TavernStructuredStateDocumentRecord | null;
}

export interface TavernAssistantAcceptedStateWrite {
    changedFiles?: string[];
    changedStates?: string[];
}

export function resolveTavernAcceptedStateSnapshotDomains(input: {
    changedFiles?: string[];
    changedStates?: string[];
    changedCommunications?: boolean;
} = {}): TavernAcceptedStateSnapshotDomain[] {
    const domains = new Set<TavernAcceptedStateSnapshotDomain>();
    if ((input.changedFiles || []).length) {domains.add('memory');}
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

export async function captureTavernAssistantAcceptedStateBasis(
    sessionId = '',
    floorInput?: number,
): Promise<TavernAssistantAcceptedStateBasis> {
    const id = String(sessionId || '').trim();
    if (!id) {throw new Error('assistant_accepted_state_session_required');}
    return await db.transaction(
        'r',
        tavernMessagesTable,
        tavernMemoryFilesTable,
        tavernMemorySnapshotsTable,
        tavernStateDocumentsTable,
        tavernStatusSnapshotsTable,
        async () => {
            const floor = await resolveTavernAcceptedSnapshotFloor(id, floorInput);
            const [memorySnapshot, statusSnapshot] = await Promise.all([
                getLatestTavernMemorySnapshot(id, floor),
                getLatestTavernStatusSnapshot(id, floor),
            ]);
            const memoryFiles = memorySnapshot
                ? memorySnapshot.files
                : (await tavernMemoryFilesTable.where('sessionId').equals(id).toArray())
                    .map((file) => ({ path: file.path, file }));
            const currentStatus = statusSnapshot
                ? null
                : await tavernStateDocumentsTable.get([id, TAVERN_STATUS_DOC_TYPE, TAVERN_STATUS_DOC_ID]) || null;
            return {
                sessionId: id,
                floor,
                memoryFiles: cloneAcceptedStateValue(memoryFiles),
                statusDocument: cloneAcceptedStateValue(statusSnapshot
                    ? statusSnapshot.document || null
                    : currentStatus),
            };
        },
    );
}

export async function commitTavernAssistantAcceptedStateWriteInCurrentTransaction(
    basis: TavernAssistantAcceptedStateBasis,
    change: TavernAssistantAcceptedStateWrite,
): Promise<void> {
    const sessionId = String(basis?.sessionId || '').trim();
    const floor = Math.floor(Number(basis?.floor));
    if (!sessionId || !Number.isFinite(floor)) {
        throw new Error('assistant_accepted_state_basis_invalid');
    }
    const changedFiles = [...new Set((change.changedFiles || []).map((path) => String(path || '').trim()).filter(Boolean))];
    const statusChanged = (change.changedStates || []).some((key) => (
        String(key || '').trim() === `${TAVERN_STATUS_DOC_TYPE}/${TAVERN_STATUS_DOC_ID}`
    ));

    if (changedFiles.length) {
        const existing = await tavernMemorySnapshotsTable.get([sessionId, floor]);
        const files = new Map((existing?.files || basis.memoryFiles).map((entry) => [
            entry.path,
            cloneAcceptedStateValue(entry.file),
        ]));
        for (const path of changedFiles) {
            const current = await tavernMemoryFilesTable.get([sessionId, path]) || null;
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

    if (statusChanged) {
        const current = await tavernStateDocumentsTable.get([
            sessionId,
            TAVERN_STATUS_DOC_TYPE,
            TAVERN_STATUS_DOC_ID,
        ]) || null;
        await tavernStatusSnapshotsTable.put({
            sessionId,
            floor,
            document: current ? cloneAcceptedStateValue(current) : undefined,
            digest: current ? String(current.digest || '') : '',
            createdAt: Date.now(),
        });
    }
}

export async function completeAcceptedTurnManagerRunWithSnapshot(input: {
    sessionId: string;
    managerRunId: string;
    floor: number;
    domains?: TavernAcceptedStateSnapshotDomain[];
    stagedTaskActions?: TavernTaskStagedAction[];
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
        tavernMessagesTable,
        tavernManagerMemorySnapshotsTable,
        tavernManagerStateSnapshotsTable,
        tavernMemoryFilesTable,
        tavernMemorySnapshotsTable,
        tavernStatusSnapshotsTable,
        tavernStateDocumentsTable,
        tavernTaskVersionsTable,
        tavernEconomyAccountsTable,
        tavernEconomyTransactionsTable,
        tavernSessionsTable,
        async () => {
            const run = await tavernManagerRunsTable.get(managerRunId);
            if (!run || run.sessionId !== sessionId || run.status !== 'running' || run.leaseOwnerId !== leaseOwnerId) {
                throw new Error('manager_lease_lost');
            }
            if (Number(run.leaseExpiresAt) <= Date.now()) {
                throw new Error('manager_lease_lost');
            }
            const [sourceUserMessage, sourceAssistantMessage] = await Promise.all([
                tavernMessagesTable.get([sessionId, run.userOrder]),
                tavernMessagesTable.get([sessionId, run.assistantOrder]),
            ]);
            if (!sourceUserMessage || !sourceAssistantMessage) {
                throw new Error('manager_source_messages_changed');
            }
            assertTavernManagerRunSourceMessages(run, {
                userMessage: sourceUserMessage,
                assistantMessage: sourceAssistantMessage,
            });

            const stagedTaskActions = Array.isArray(input.stagedTaskActions) ? input.stagedTaskActions : [];
            if (stagedTaskActions.length) {
                await commitTavernTaskStagedActionsInCurrentDbTransaction({
                    sessionId,
                    actions: stagedTaskActions,
                    touchSession: false,
                });
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
    statusSnapshotSaved: boolean;
    communicationSnapshotSaved: boolean;
}> {
    const id = String(sessionId || '').trim();
    if (!id) {
        return {
            floor: TAVERN_ACCEPTED_BASELINE_FLOOR,
            memorySnapshotSaved: false,
            statusSnapshotSaved: false,
            communicationSnapshotSaved: false,
        };
    }
    const requestedDomains = Array.isArray(options.domains)
        ? new Set(options.domains)
        : null;
    const shouldSave = (domain: TavernAcceptedStateSnapshotDomain) => !requestedDomains || requestedDomains.has(domain);
    const [floor, memorySnapshot, statusSnapshot, communicationSnapshot] = await db.transaction(
        'rw',
        tavernMemoryFilesTable,
        tavernMemorySnapshotsTable,
        tavernStatusSnapshotsTable,
        tavernMessagesTable,
        tavernSessionsTable,
        tavernStateDocumentsTable,
        tavernCommunicationContactsTable,
        tavernCommunicationThreadsTable,
        tavernCommunicationMessagesTable,
        tavernCommunicationSnapshotsTable,
        async () => {
            const floor = await resolveTavernAcceptedSnapshotFloor(id, floorInput);
            const memorySnapshot = shouldSave('memory') ? await saveTavernMemorySnapshot(id, floor) : null;
            const statusSnapshot = shouldSave('status') ? await saveTavernStatusSnapshot(id, floor) : null;
            const communicationSnapshot = shouldSave('communications') ? await saveTavernCommunicationSnapshot(id, floor) : null;
            return [floor, memorySnapshot, statusSnapshot, communicationSnapshot] as const;
        },
    ) as readonly [
        number,
        TavernMemorySnapshotRecord | null,
        TavernStatusSnapshotRecord | null,
        TavernCommunicationSnapshotRecord | null,
    ];
    return {
        floor,
        memorySnapshotSaved: !!memorySnapshot,
        statusSnapshotSaved: !!statusSnapshot,
        communicationSnapshotSaved: !!communicationSnapshot,
    };
}
