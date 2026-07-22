import db, {
    assertTavernManagerRunSourceMessages,
    getLatestTavernMessage,
    hashTavernMemoryRecord,
    hashTavernStateDocument,
    normalizedTavernStoryTimelineRevision,
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
    type TavernMessageRecord,
    type TavernStatusSnapshotRecord,
    type TavernCommunicationSnapshotRecord,
} from './session-db';
import { saveTavernCommunicationSnapshot } from './communications';
import { getLatestTavernMemorySnapshot, saveTavernMemorySnapshot } from './memory-files';
import {
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
    storyTimelineRevision: number;
    storySettled: boolean;
    storyAnchor: Pick<TavernMessageRecord, 'messageId' | 'order' | 'role' | 'timelineRevision'> | null;
    memoryFiles: TavernMemorySnapshotFileEntry[];
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

export async function captureTavernAssistantAcceptedStateBasisInCurrentTransaction(
    sessionId = '',
    floorInput?: number,
): Promise<TavernAssistantAcceptedStateBasis> {
    const id = String(sessionId || '').trim();
    if (!id) {throw new Error('assistant_accepted_state_session_required');}
    const session = await tavernSessionsTable.get(id);
    if (!session) {throw new Error('assistant_accepted_state_session_missing');}
    const floor = await resolveTavernAcceptedSnapshotFloor(id, floorInput);
    const [latestStoryMessage, memorySnapshot] = await Promise.all([
        getLatestTavernMessage(id),
        getLatestTavernMemorySnapshot(id, floor),
    ]);
    const memoryFiles = memorySnapshot
        ? memorySnapshot.files
        : (await tavernMemoryFilesTable.where('sessionId').equals(id).toArray())
            .map((file) => ({ path: file.path, file }));
    const storyAnchor = latestStoryMessage?.role === 'assistant' && latestStoryMessage.order === floor
        ? {
            messageId: latestStoryMessage.messageId,
            order: latestStoryMessage.order,
            role: latestStoryMessage.role,
            timelineRevision: latestStoryMessage.timelineRevision,
        }
        : null;
    return {
        sessionId: id,
        floor,
        storyTimelineRevision: normalizedTavernStoryTimelineRevision(session),
        storySettled: !latestStoryMessage || !!storyAnchor,
        storyAnchor,
        memoryFiles: cloneAcceptedStateValue(memoryFiles),
    };
}

export async function captureTavernAssistantAcceptedStateBasis(
    sessionId = '',
    floorInput?: number,
): Promise<TavernAssistantAcceptedStateBasis> {
    return await db.transaction(
        'r',
        tavernMessagesTable,
        tavernMemoryFilesTable,
        tavernMemorySnapshotsTable,
        tavernSessionsTable,
        () => captureTavernAssistantAcceptedStateBasisInCurrentTransaction(sessionId, floorInput),
    );
}

export async function assertTavernAssistantAcceptedStateBasisCurrent(
    basis: TavernAssistantAcceptedStateBasis,
): Promise<void> {
    const sessionId = String(basis?.sessionId || '').trim();
    const session = sessionId ? await tavernSessionsTable.get(sessionId) : null;
    if (!session
        || normalizedTavernStoryTimelineRevision(session) !== basis.storyTimelineRevision
    ) {
        throw new Error('assistant_timeline_advanced');
    }
    if (!basis.storySettled) {throw new Error('assistant_timeline_unsettled');}
    const latestStoryMessage = await getLatestTavernMessage(sessionId);
    if (!basis.storyAnchor) {
        if (latestStoryMessage) {throw new Error('assistant_timeline_advanced');}
        return;
    }
    if (!latestStoryMessage
        || latestStoryMessage.role !== 'assistant'
        || latestStoryMessage.messageId !== basis.storyAnchor.messageId
        || latestStoryMessage.order !== basis.storyAnchor.order
        || latestStoryMessage.timelineRevision !== basis.storyAnchor.timelineRevision
    ) {
        throw new Error('assistant_timeline_advanced');
    }
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
    await assertTavernAssistantAcceptedStateBasisCurrent(basis);
    const changedFiles = [...new Set((change.changedFiles || []).map((path) => String(path || '').trim()).filter(Boolean))];
    const statusChanged = (change.changedStates || []).some((key) => (
        String(key || '').trim() === `${TAVERN_STATUS_DOC_TYPE}/${TAVERN_STATUS_DOC_ID}`
    ));

    if (changedFiles.length) {
        const acceptedAtFloor = await tavernMemorySnapshotsTable.get([sessionId, floor]);
        const files = new Map((acceptedAtFloor?.files || basis.memoryFiles).map((entry) => [
            entry.path,
            cloneAcceptedStateValue(entry.file),
        ]));
        for (const path of changedFiles) {
            const current = await tavernMemoryFilesTable.get([sessionId, path]) || null;
            if (current) {files.set(path, cloneAcceptedStateValue(current));}
            else {files.delete(path);}
        }
        const nextFiles = [...files.entries()]
            .sort(([left], [right]) => left.localeCompare(right))
            .map(([path, file]) => ({ path, file }));
        await tavernMemorySnapshotsTable.put({
            sessionId,
            floor,
            files: nextFiles,
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
                const [baseline, managerSnapshots] = await Promise.all([
                    getLatestTavernMemorySnapshot(sessionId, floor),
                    tavernManagerMemorySnapshotsTable.where('managerRunId').equals(managerRunId).toArray(),
                ]);
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
