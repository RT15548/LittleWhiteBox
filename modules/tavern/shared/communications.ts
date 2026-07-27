import db, {
    tavernCommunicationContactsTable,
    tavernCommunicationMessagesTable,
    tavernCommunicationSnapshotsTable,
    tavernCommunicationThreadsTable,
    getLatestTavernMessage,
    tavernSessionsTable,
    TAVERN_COMMUNICATION_REPLY_INTERRUPTED_ERROR,
    TAVERN_COMMUNICATION_REPLY_LEASE_MS,
    type TavernCommunicationContactRecord,
    type TavernCommunicationContactSource,
    type TavernCommunicationMessageRecord,
    type TavernCommunicationReplyRequestRecord,
    type TavernCommunicationSnapshotRecord,
    type TavernCommunicationThreadRecord,
} from './session-db';
import type { XbTavernHistoryMessage } from './message-assembler';
import {
    normalizeTavernCommunicationMessagePayload,
    tavernCommunicationPayloadFingerprint,
    tavernCommunicationPayloadText,
    tavernCommunicationPayloadTypeLabel,
} from './communication-message';

export const TAVERN_COMMUNICATION_BASELINE_FLOOR = -1;

function now(): number {
    return Date.now();
}

function createId(prefix: string): string {
    return `${prefix}-${now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function cloneSerializable<T>(value: T): T {
    if (typeof structuredClone === 'function') {
        return structuredClone(value);
    }
    return JSON.parse(JSON.stringify(value)) as T;
}

function normalizeInlineText(value: unknown, limit = 120): string {
    return String(value || '').replace(/\s+/g, ' ').trim().slice(0, limit);
}

function normalizeThreadSummary(value: unknown): string {
    return String(value || '').replace(/\r\n?/g, '\n').trim().slice(0, 1200);
}

function normalizeContactSource(value: unknown): TavernCommunicationContactSource {
    return value === 'character' || value === 'memory' ? value : 'manual';
}

function normalizeArchivedThread(thread: TavernCommunicationThreadRecord): TavernCommunicationThreadRecord {
    const cloned = cloneSerializable(thread);
    if (cloned.replyRequest?.status !== 'pending') {return cloned;}
    return {
        ...cloned,
        replyRequest: {
            ...cloned.replyRequest,
            status: 'failed',
            error: TAVERN_COMMUNICATION_REPLY_INTERRUPTED_ERROR,
        },
    };
}

function communicationStateFingerprint(input: {
    contacts?: TavernCommunicationContactRecord[];
    threads?: TavernCommunicationThreadRecord[];
    messages?: TavernCommunicationMessageRecord[];
}): string {
    return JSON.stringify({
        contacts: (input.contacts || []).map((contact) => [
            contact.id,
            contact.name,
            contact.avatar || '',
            contact.memoryPath || '',
            contact.source,
            contact.createdAt,
            contact.updatedAt,
        ]),
        threads: (input.threads || []).map((thread) => [
            thread.id,
            thread.contactId,
            thread.summary || '',
            thread.summarizedThroughSequence ?? null,
            thread.unreadCount,
            thread.lastResult || '',
            thread.replyRequest?.id || '',
            thread.replyRequest?.userSequence ?? null,
            thread.replyRequest?.anchorOrder ?? null,
            thread.replyRequest?.status || '',
            thread.replyRequest?.error || '',
            thread.replyRequest?.createdAt ?? null,
            thread.replyRequest?.updatedAt ?? null,
            thread.createdAt,
            thread.updatedAt,
        ]),
        messages: (input.messages || []).map((message) => [
            message.threadId,
            message.sequence,
            message.anchorOrder,
            message.role,
            tavernCommunicationPayloadFingerprint(message.payload),
            message.status,
            message.createdAt,
            message.updatedAt,
            message.provider || '',
            message.model || '',
        ]),
    });
}

async function listSessionMessages(sessionId = ''): Promise<TavernCommunicationMessageRecord[]> {
    const id = String(sessionId || '').trim();
    if (!id) {return [];}
    return (await tavernCommunicationMessagesTable.where('sessionId').equals(id).toArray())
        .sort((left, right) => left.createdAt - right.createdAt || left.sequence - right.sequence);
}

export async function listTavernCommunicationContacts(sessionId = ''): Promise<TavernCommunicationContactRecord[]> {
    const id = String(sessionId || '').trim();
    if (!id) {return [];}
    return (await tavernCommunicationContactsTable.where('sessionId').equals(id).toArray())
        .sort((left, right) => right.updatedAt - left.updatedAt || left.name.localeCompare(right.name, 'zh-CN'));
}

export async function listTavernCommunicationThreads(sessionId = ''): Promise<TavernCommunicationThreadRecord[]> {
    const id = String(sessionId || '').trim();
    if (!id) {return [];}
    return (await tavernCommunicationThreadsTable.where('sessionId').equals(id).toArray())
        .sort((left, right) => right.updatedAt - left.updatedAt);
}

export async function getTavernCommunicationThreadForContact(
    sessionId = '',
    contactId = '',
): Promise<TavernCommunicationThreadRecord | null> {
    const id = String(sessionId || '').trim();
    const targetContactId = String(contactId || '').trim();
    if (!id || !targetContactId) {return null;}
    const rows = await tavernCommunicationThreadsTable.where('contactId').equals(targetContactId).toArray();
    return rows.find((thread) => thread.sessionId === id) || null;
}

export async function listTavernCommunicationMessages(
    sessionId = '',
    threadId = '',
): Promise<TavernCommunicationMessageRecord[]> {
    const id = String(sessionId || '').trim();
    const targetThreadId = String(threadId || '').trim();
    if (!id || !targetThreadId) {return [];}
    return (await tavernCommunicationMessagesTable.where('threadId').equals(targetThreadId).toArray())
        .filter((message) => message.sessionId === id)
        .sort((left, right) => left.sequence - right.sequence);
}

export async function reconcileTavernCommunicationContacts(input: {
    sessionId: string;
    contacts: Array<{
        name: string;
        avatar?: string;
        memoryPath: string;
    }>;
}): Promise<void> {
    const sessionId = String(input.sessionId || '').trim();
    if (!sessionId) {return;}
    const desiredContacts = input.contacts.reduce<Array<{ name: string; avatar: string; memoryPath: string }>>((result, item) => {
        const name = normalizeInlineText(item.name);
        const memoryPath = String(item.memoryPath || '').trim();
        if (!name || !memoryPath || result.some((candidate) => (
            candidate.memoryPath === memoryPath
            || candidate.name.localeCompare(name, 'zh-CN', { sensitivity: 'base' }) === 0
        ))) {return result;}
        result.push({ name, avatar: String(item.avatar || '').trim(), memoryPath });
        return result;
    }, []);
    const timestamp = now();
    await db.transaction(
        'rw',
        tavernCommunicationContactsTable,
        tavernCommunicationThreadsTable,
        tavernCommunicationMessagesTable,
        tavernSessionsTable,
        async () => {
            const [existingContacts, existingThreads] = await Promise.all([
                tavernCommunicationContactsTable.where('sessionId').equals(sessionId).toArray(),
                tavernCommunicationThreadsTable.where('sessionId').equals(sessionId).toArray(),
            ]);
            const retainedContactIds = new Set<string>();
            let changed = false;

            for (const desired of desiredContacts) {
                const existing = existingContacts.find((contact) => (
                    !retainedContactIds.has(contact.id)
                    && (
                        contact.memoryPath === desired.memoryPath
                        || contact.name.localeCompare(desired.name, 'zh-CN', { sensitivity: 'base' }) === 0
                    )
                ));
                if (existing) {
                    retainedContactIds.add(existing.id);
                    if (
                        existing.name !== desired.name
                        || String(existing.avatar || '') !== desired.avatar
                        || String(existing.memoryPath || '') !== desired.memoryPath
                        || existing.source !== 'memory'
                    ) {
                        await tavernCommunicationContactsTable.put({
                            ...existing,
                            name: desired.name,
                            avatar: desired.avatar,
                            memoryPath: desired.memoryPath,
                            source: 'memory',
                            updatedAt: timestamp,
                        });
                        changed = true;
                    }
                    if (!existingThreads.some((thread) => thread.contactId === existing.id)) {
                        await tavernCommunicationThreadsTable.put({
                            sessionId,
                            id: createId('communication-thread'),
                            contactId: existing.id,
                            unreadCount: 0,
                            createdAt: timestamp,
                            updatedAt: timestamp,
                        });
                        changed = true;
                    }
                    continue;
                }

                const contact: TavernCommunicationContactRecord = {
                    sessionId,
                    id: createId('communication-contact'),
                    name: desired.name,
                    avatar: desired.avatar,
                    memoryPath: desired.memoryPath,
                    source: 'memory',
                    createdAt: timestamp,
                    updatedAt: timestamp,
                };
                await tavernCommunicationContactsTable.put(contact);
                await tavernCommunicationThreadsTable.put({
                    sessionId,
                    id: createId('communication-thread'),
                    contactId: contact.id,
                    unreadCount: 0,
                    createdAt: timestamp,
                    updatedAt: timestamp,
                });
                retainedContactIds.add(contact.id);
                changed = true;
            }

            for (const contact of existingContacts) {
                if (retainedContactIds.has(contact.id)) {continue;}
                const obsoleteThreads = existingThreads.filter((thread) => thread.contactId === contact.id);
                for (const thread of obsoleteThreads) {
                    const obsoleteMessages = (await tavernCommunicationMessagesTable
                        .where('threadId')
                        .equals(thread.id)
                        .toArray())
                        .filter((message) => message.sessionId === sessionId);
                    if (obsoleteMessages.length) {
                        await tavernCommunicationMessagesTable.bulkDelete(obsoleteMessages.map((message) => [
                            sessionId,
                            thread.id,
                            message.sequence,
                        ]));
                    }
                    await tavernCommunicationThreadsTable.delete([sessionId, thread.id]);
                }
                await tavernCommunicationContactsTable.delete([sessionId, contact.id]);
                changed = true;
            }

            if (changed) {await tavernSessionsTable.update(sessionId, { updatedAt: timestamp });}
        },
    );
}

export async function createTavernCommunicationContact(input: {
    sessionId: string;
    name: string;
    avatar?: string;
    memoryPath?: string;
    source?: TavernCommunicationContactSource;
}): Promise<{ contact: TavernCommunicationContactRecord; thread: TavernCommunicationThreadRecord }> {
    const sessionId = String(input.sessionId || '').trim();
    const name = normalizeInlineText(input.name);
    if (!sessionId) {throw new Error('communication_session_required');}
    if (!name) {throw new Error('communication_contact_name_required');}
    const timestamp = now();
    return await db.transaction(
        'rw',
        tavernCommunicationContactsTable,
        tavernCommunicationThreadsTable,
        tavernSessionsTable,
        async () => {
            const existingContacts = await tavernCommunicationContactsTable.where('sessionId').equals(sessionId).toArray();
            const memoryPath = String(input.memoryPath || '').trim();
            const existing = existingContacts.find((contact) => (
                (memoryPath && contact.memoryPath === memoryPath)
                || contact.name.localeCompare(name, 'zh-CN', { sensitivity: 'base' }) === 0
            ));
            if (existing) {
                const next: TavernCommunicationContactRecord = {
                    ...existing,
                    name,
                    avatar: String(input.avatar || existing.avatar || '').trim(),
                    memoryPath: memoryPath || existing.memoryPath,
                    source: normalizeContactSource(input.source || existing.source),
                    updatedAt: timestamp,
                };
                await tavernCommunicationContactsTable.put(next);
                let thread = await getTavernCommunicationThreadForContact(sessionId, next.id);
                if (!thread) {
                    thread = {
                        sessionId,
                        id: createId('communication-thread'),
                        contactId: next.id,
                        unreadCount: 0,
                        createdAt: timestamp,
                        updatedAt: timestamp,
                    };
                    await tavernCommunicationThreadsTable.put(thread);
                }
                await tavernSessionsTable.update(sessionId, { updatedAt: timestamp });
                return { contact: next, thread };
            }
            const contact: TavernCommunicationContactRecord = {
                sessionId,
                id: createId('communication-contact'),
                name,
                avatar: String(input.avatar || '').trim(),
                memoryPath,
                source: normalizeContactSource(input.source),
                createdAt: timestamp,
                updatedAt: timestamp,
            };
            const thread: TavernCommunicationThreadRecord = {
                sessionId,
                id: createId('communication-thread'),
                contactId: contact.id,
                unreadCount: 0,
                createdAt: timestamp,
                updatedAt: timestamp,
            };
            await tavernCommunicationContactsTable.put(contact);
            await tavernCommunicationThreadsTable.put(thread);
            await tavernSessionsTable.update(sessionId, { updatedAt: timestamp });
            return { contact, thread };
        },
    );
}

export async function appendSentTavernCommunicationMessage(input: {
    sessionId: string;
    threadId: string;
    payload: unknown;
}): Promise<{
    message: TavernCommunicationMessageRecord;
    replyRequest: TavernCommunicationReplyRequestRecord;
}> {
    const sessionId = String(input.sessionId || '').trim();
    const threadId = String(input.threadId || '').trim();
    const payload = normalizeTavernCommunicationMessagePayload(input.payload);
    if (!sessionId || !threadId) {throw new Error('communication_thread_required');}
    if (!payload) {throw new Error('communication_message_required');}
    const timestamp = now();
    const latestMessage = await getLatestTavernMessage(sessionId);
    const anchorOrder = Number.isInteger(Number(latestMessage?.order))
        ? Number(latestMessage?.order)
        : TAVERN_COMMUNICATION_BASELINE_FLOOR;
    return await db.transaction(
        'rw',
        tavernCommunicationMessagesTable,
        tavernCommunicationThreadsTable,
        tavernSessionsTable,
        async () => {
            const thread = await tavernCommunicationThreadsTable.get([sessionId, threadId]);
            if (!thread) {throw new Error('communication_thread_required');}
            if (thread.replyRequest?.status === 'pending') {
                throw new Error('communication_reply_request_pending');
            }
            const existing = await listTavernCommunicationMessages(sessionId, threadId);
            const sequence = existing.reduce((max, message) => Math.max(max, message.sequence), -1) + 1;
            const record: TavernCommunicationMessageRecord = {
                sessionId,
                threadId,
                sequence,
                anchorOrder,
                role: 'user',
                payload,
                status: 'sent',
                createdAt: timestamp,
                updatedAt: timestamp,
            };
            const replyRequest: TavernCommunicationReplyRequestRecord = {
                id: createId('communication-reply-request'),
                userSequence: sequence,
                anchorOrder,
                status: 'pending',
                createdAt: timestamp,
                updatedAt: timestamp,
                leaseExpiresAt: timestamp + TAVERN_COMMUNICATION_REPLY_LEASE_MS,
            };
            await tavernCommunicationMessagesTable.put(record);
            await tavernCommunicationThreadsTable.update([sessionId, threadId], {
                lastResult: undefined,
                replyRequest,
                updatedAt: timestamp,
            });
            await tavernSessionsTable.update(sessionId, { updatedAt: timestamp });
            return { message: record, replyRequest };
        },
    );
}

export async function completeTavernCommunicationReply(input: {
    userMessage: TavernCommunicationMessageRecord;
    replyRequestId: string;
    replies?: unknown[];
    result?: 'reply' | 'silent' | 'unavailable';
    summary?: string;
    provider?: string;
    model?: string;
    unreadCountDelta?: number;
}): Promise<TavernCommunicationMessageRecord[] | null> {
    const userMessage = input.userMessage;
    const replyRequestId = String(input.replyRequestId || '').trim();
    const timestamp = now();
    const normalizedReplies = (input.replies || [])
        .map(normalizeTavernCommunicationMessagePayload)
        .filter((payload): payload is NonNullable<typeof payload> => !!payload)
        .slice(0, 3);
    const result = input.result || (normalizedReplies.length ? 'reply' : 'silent');
    const replies = result === 'reply' ? normalizedReplies : [];
    const summary = input.summary === undefined ? undefined : (normalizeThreadSummary(input.summary) || undefined);
    return await db.transaction(
        'rw',
        tavernCommunicationMessagesTable,
        tavernCommunicationThreadsTable,
        tavernSessionsTable,
        async () => {
            const current = await tavernCommunicationMessagesTable.get([
                userMessage.sessionId,
                userMessage.threadId,
                userMessage.sequence,
            ]);
            const currentThread = current
                ? await tavernCommunicationThreadsTable.get([current.sessionId, current.threadId])
                : null;
            const replyRequest = currentThread?.replyRequest;
            if (
                !current
                || current.role !== 'user'
                || current.status !== 'sent'
                || tavernCommunicationPayloadFingerprint(current.payload) !== tavernCommunicationPayloadFingerprint(userMessage.payload)
                || replyRequest?.status !== 'pending'
                || replyRequest.id !== replyRequestId
                || replyRequest.userSequence !== current.sequence
                || replyRequest.anchorOrder !== current.anchorOrder
            ) {
                return null;
            }
            const existing = await listTavernCommunicationMessages(current.sessionId, current.threadId);
            const records: TavernCommunicationMessageRecord[] = [];
            let sequence = existing.reduce((max, message) => Math.max(max, message.sequence), -1) + 1;
            for (const payload of replies) {
                const reply: TavernCommunicationMessageRecord = {
                    sessionId: current.sessionId,
                    threadId: current.threadId,
                    sequence,
                    anchorOrder: current.anchorOrder,
                    role: 'contact',
                    payload,
                    status: 'sent',
                    createdAt: timestamp + records.length,
                    updatedAt: timestamp + records.length,
                    provider: String(input.provider || ''),
                    model: String(input.model || ''),
                };
                records.push(reply);
                sequence += 1;
            }
            if (records.length) {await tavernCommunicationMessagesTable.bulkPut(records);}
            const summarizedThroughSequence = records.at(-1)?.sequence ?? current.sequence;
            await tavernCommunicationThreadsTable.update([current.sessionId, current.threadId], {
                lastResult: result,
                replyRequest: undefined,
                unreadCount: Math.max(
                    0,
                    (Number(currentThread?.unreadCount) || 0) + Math.max(0, Number(input.unreadCountDelta) || 0),
                ),
                ...(summary === undefined ? {} : {
                    summary,
                    summarizedThroughSequence: summary ? summarizedThroughSequence : undefined,
                }),
                updatedAt: timestamp,
            });
            await tavernSessionsTable.update(current.sessionId, { updatedAt: timestamp });
            return records;
        },
    );
}

export async function markTavernCommunicationThreadRead(
    sessionId = '',
    threadId = '',
): Promise<TavernCommunicationThreadRecord | null> {
    const id = String(sessionId || '').trim();
    const targetThreadId = String(threadId || '').trim();
    if (!id || !targetThreadId) {return null;}
    return await db.transaction('rw', tavernCommunicationThreadsTable, async () => {
        const thread = await tavernCommunicationThreadsTable.get([id, targetThreadId]);
        if (!thread) {return null;}
        if (thread.unreadCount) {
            await tavernCommunicationThreadsTable.update([id, targetThreadId], { unreadCount: 0 });
        }
        return { ...thread, unreadCount: 0 };
    });
}

export async function failTavernCommunicationReplyRequest(
    userMessage: TavernCommunicationMessageRecord,
    replyRequestId: string,
    error: unknown,
): Promise<TavernCommunicationThreadRecord | null> {
    replyRequestId = String(replyRequestId || '').trim();
    const timestamp = now();
    return await db.transaction(
        'rw',
        tavernCommunicationThreadsTable,
        tavernSessionsTable,
        async () => {
            const thread = await tavernCommunicationThreadsTable.get([userMessage.sessionId, userMessage.threadId]);
            const current = thread?.replyRequest;
            if (
                !thread
                || current?.status !== 'pending'
                || current.id !== replyRequestId
                || current.userSequence !== userMessage.sequence
                || current.anchorOrder !== userMessage.anchorOrder
            ) {return null;}
            const failed: TavernCommunicationReplyRequestRecord = {
                ...current,
                status: 'failed',
                error: error instanceof Error ? error.message : String(error || 'communication_reply_failed'),
                updatedAt: timestamp,
            };
            const next = { ...thread, replyRequest: failed, updatedAt: timestamp };
            await tavernCommunicationThreadsTable.put(next);
            await tavernSessionsTable.update(userMessage.sessionId, { updatedAt: timestamp });
            return next;
        },
    );
}

export async function retryTavernCommunicationReplyRequest(
    sessionId = '',
    threadId = '',
): Promise<{
    message: TavernCommunicationMessageRecord;
    replyRequest: TavernCommunicationReplyRequestRecord;
}> {
    sessionId = String(sessionId || '').trim();
    threadId = String(threadId || '').trim();
    if (!sessionId || !threadId) {throw new Error('communication_retry_unavailable');}
    const timestamp = now();
    return await db.transaction(
        'rw',
        tavernCommunicationMessagesTable,
        tavernCommunicationThreadsTable,
        tavernSessionsTable,
        async () => {
            const thread = await tavernCommunicationThreadsTable.get([sessionId, threadId]);
            const failedRequest = thread?.replyRequest;
            if (!thread || failedRequest?.status !== 'failed') {
                throw new Error('communication_retry_unavailable');
            }
            const message = await tavernCommunicationMessagesTable.get([
                sessionId,
                threadId,
                failedRequest.userSequence,
            ]);
            if (
                !message
                || message.role !== 'user'
                || message.status !== 'sent'
                || message.anchorOrder !== failedRequest.anchorOrder
            ) {throw new Error('communication_retry_unavailable');}
            const replyRequest: TavernCommunicationReplyRequestRecord = {
                id: createId('communication-reply-request'),
                userSequence: failedRequest.userSequence,
                anchorOrder: failedRequest.anchorOrder,
                status: 'pending',
                createdAt: timestamp,
                updatedAt: timestamp,
                leaseExpiresAt: timestamp + TAVERN_COMMUNICATION_REPLY_LEASE_MS,
            };
            await tavernCommunicationThreadsTable.update([sessionId, threadId], {
                lastResult: undefined,
                replyRequest,
                updatedAt: timestamp,
            });
            await tavernSessionsTable.update(sessionId, { updatedAt: timestamp });
            return { message, replyRequest };
        },
    );
}

export async function touchTavernCommunicationReplyRequest(input: {
    sessionId: string;
    threadId: string;
    replyRequestId: string;
}): Promise<boolean> {
    const sessionId = String(input.sessionId || '').trim();
    const threadId = String(input.threadId || '').trim();
    const replyRequestId = String(input.replyRequestId || '').trim();
    if (!sessionId || !threadId || !replyRequestId) {return false;}
    const timestamp = now();
    return await db.transaction('rw', tavernCommunicationThreadsTable, async () => {
        const thread = await tavernCommunicationThreadsTable.get([sessionId, threadId]);
        const replyRequest = thread?.replyRequest;
        if (!thread || replyRequest?.status !== 'pending' || replyRequest.id !== replyRequestId) {return false;}
        await tavernCommunicationThreadsTable.put({
            ...thread,
            replyRequest: {
                ...replyRequest,
                leaseExpiresAt: timestamp + TAVERN_COMMUNICATION_REPLY_LEASE_MS,
            },
        });
        return true;
    });
}

export async function recoverInterruptedTavernCommunicationReplyRequests(
    sessionId = '',
    excludeReplyRequestId = '',
): Promise<number> {
    const id = String(sessionId || '').trim();
    if (!id) {return 0;}
    return await db.transaction(
        'rw',
        tavernCommunicationThreadsTable,
        tavernSessionsTable,
        async () => {
            const timestamp = now();
            const pending = (await tavernCommunicationThreadsTable.where('sessionId').equals(id).toArray())
                .filter((thread) => thread.replyRequest?.status === 'pending')
                .filter((thread) => !excludeReplyRequestId || thread.replyRequest?.id !== excludeReplyRequestId)
                .filter((thread) => Number(thread.replyRequest?.leaseExpiresAt) <= timestamp);
            if (!pending.length) {return 0;}
            await tavernCommunicationThreadsTable.bulkPut(pending.map((thread) => ({
                ...thread,
                replyRequest: {
                    ...thread.replyRequest!,
                    status: 'failed' as const,
                    error: TAVERN_COMMUNICATION_REPLY_INTERRUPTED_ERROR,
                    updatedAt: timestamp,
                },
                updatedAt: timestamp,
            })));
            await tavernSessionsTable.update(id, { updatedAt: timestamp });
            return pending.length;
        },
    );
}

export async function saveTavernCommunicationSnapshot(
    sessionId = '',
    floor = TAVERN_COMMUNICATION_BASELINE_FLOOR,
): Promise<TavernCommunicationSnapshotRecord | null> {
    const id = String(sessionId || '').trim();
    if (!id) {return null;}
    const [contacts, threads, messages] = await Promise.all([
        listTavernCommunicationContacts(id),
        listTavernCommunicationThreads(id),
        listSessionMessages(id),
    ]);
    const archivedThreads = threads.map(normalizeArchivedThread);
    const archivedMessages = cloneSerializable(messages);
    const normalizedFloor = Number.isFinite(Number(floor))
        ? Math.floor(Number(floor))
        : TAVERN_COMMUNICATION_BASELINE_FLOOR;
    const effective = await getTavernCommunicationSnapshotAtOrBefore(id, normalizedFloor);
    const currentFingerprint = communicationStateFingerprint({ contacts, threads: archivedThreads, messages: archivedMessages });
    if (!contacts.length && !archivedThreads.length && !archivedMessages.length && !effective) {return null;}
    if (effective && communicationStateFingerprint(effective) === currentFingerprint) {return null;}
    const snapshot: TavernCommunicationSnapshotRecord = {
        sessionId: id,
        floor: normalizedFloor,
        contacts: cloneSerializable(contacts),
        threads: archivedThreads,
        messages: archivedMessages,
        createdAt: now(),
    };
    await tavernCommunicationSnapshotsTable.put(snapshot);
    return snapshot;
}

async function getTavernCommunicationSnapshotAtOrBefore(
    sessionId = '',
    targetFloor = TAVERN_COMMUNICATION_BASELINE_FLOOR,
): Promise<TavernCommunicationSnapshotRecord | null> {
    const snapshots = await tavernCommunicationSnapshotsTable.where('sessionId').equals(sessionId).toArray();
    return snapshots
        .filter((snapshot) => snapshot.floor <= targetFloor)
        .sort((left, right) => right.floor - left.floor || right.createdAt - left.createdAt)[0]
        || null;
}

export async function restoreTavernCommunicationsToFloor(
    sessionId = '',
    targetFloor = TAVERN_COMMUNICATION_BASELINE_FLOOR,
): Promise<TavernCommunicationSnapshotRecord | null> {
    const id = String(sessionId || '').trim();
    if (!id) {return null;}
    const normalizedFloor = Number.isFinite(Number(targetFloor))
        ? Math.floor(Number(targetFloor))
        : TAVERN_COMMUNICATION_BASELINE_FLOOR;
    const snapshot = await getTavernCommunicationSnapshotAtOrBefore(id, normalizedFloor);
    await db.transaction(
        'rw',
        tavernCommunicationContactsTable,
        tavernCommunicationThreadsTable,
        tavernCommunicationMessagesTable,
        tavernSessionsTable,
        async () => {
            const [contacts, threads, messages] = await Promise.all([
                listTavernCommunicationContacts(id),
                listTavernCommunicationThreads(id),
                listSessionMessages(id),
            ]);
            await Promise.all([
                contacts.length ? tavernCommunicationContactsTable.bulkDelete(contacts.map((contact) => [id, contact.id])) : 0,
                threads.length ? tavernCommunicationThreadsTable.bulkDelete(threads.map((thread) => [id, thread.id])) : 0,
                messages.length ? tavernCommunicationMessagesTable.bulkDelete(messages.map((message) => [id, message.threadId, message.sequence])) : 0,
            ]);
            if (snapshot) {
                await Promise.all([
                    snapshot.contacts.length ? tavernCommunicationContactsTable.bulkPut(cloneSerializable(snapshot.contacts)) : 0,
                    snapshot.threads.length ? tavernCommunicationThreadsTable.bulkPut(cloneSerializable(snapshot.threads)) : 0,
                    snapshot.messages.length ? tavernCommunicationMessagesTable.bulkPut(cloneSerializable(snapshot.messages)) : 0,
                ]);
            }
            await tavernSessionsTable.update(id, { updatedAt: now() });
        },
    );
    return snapshot;
}

export async function trimTavernCommunicationSnapshotsFromFloor(sessionId = '', fromFloor = 0): Promise<number> {
    const id = String(sessionId || '').trim();
    if (!id) {return 0;}
    const snapshots = await tavernCommunicationSnapshotsTable.where('sessionId').equals(id).toArray();
    const targets = snapshots.filter((snapshot) => snapshot.floor >= fromFloor);
    if (!targets.length) {return 0;}
    await tavernCommunicationSnapshotsTable.bulkDelete(targets.map((snapshot) => [id, snapshot.floor]));
    return targets.length;
}

export async function describeTavernCommunicationRestoreImpact(sessionId = '', targetFloor = -1): Promise<{
    changed: boolean;
    currentMessageCount: number;
    targetMessageCount: number;
}> {
    const id = String(sessionId || '').trim();
    const [contacts, threads, messages] = await Promise.all([
        listTavernCommunicationContacts(id),
        listTavernCommunicationThreads(id),
        listSessionMessages(id),
    ]);
    const snapshot = await getTavernCommunicationSnapshotAtOrBefore(id, targetFloor);
    return {
        changed: communicationStateFingerprint({ contacts, threads, messages }) !== communicationStateFingerprint(snapshot || {}),
        currentMessageCount: messages.length,
        targetMessageCount: snapshot?.messages.length || 0,
    };
}

export interface TavernCommunicationTimelineEvent {
    anchorOrder: number;
    threadId: string;
    contactId: string;
    contactName: string;
    createdAt: number;
    content: string;
    message: XbTavernHistoryMessage;
}

function escapeCommunicationEvidence(value: unknown): string {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function buildCommunicationTimelineEventContent(input: {
    playerName: string;
    contactName: string;
    messages: TavernCommunicationMessageRecord[];
}): string {
    const playerName = normalizeInlineText(input.playerName, 120) || '用户';
    const contactName = normalizeInlineText(input.contactName, 120) || '联系人';
    const lines = input.messages.map((message) => (
        `${message.role === 'user' ? playerName : contactName}（${tavernCommunicationPayloadTypeLabel(message.payload)}）：${escapeCommunicationEvidence(tavernCommunicationPayloadText(message.payload))}`
    ));
    return [
        `[${escapeCommunicationEvidence(playerName)} 与 ${escapeCommunicationEvidence(contactName)} 发生了信息互动，内容是：]`,
        ...lines,
    ].join('\n');
}

export async function listTavernCommunicationTimelineEvents(
    sessionId = '',
    options: { fromAnchorOrder?: number; toAnchorOrder?: number; playerName?: string } = {},
): Promise<TavernCommunicationTimelineEvent[]> {
    const id = String(sessionId || '').trim();
    if (!id) {return [];}
    const fromAnchorOrder = Number.isFinite(Number(options.fromAnchorOrder))
        ? Math.floor(Number(options.fromAnchorOrder))
        : TAVERN_COMMUNICATION_BASELINE_FLOOR;
    const toAnchorOrder = Number.isFinite(Number(options.toAnchorOrder))
        ? Math.floor(Number(options.toAnchorOrder))
        : Number.POSITIVE_INFINITY;
    const [contacts, threads, messages] = await Promise.all([
        listTavernCommunicationContacts(id),
        listTavernCommunicationThreads(id),
        listSessionMessages(id),
    ]);
    const contactById = new Map(contacts.map((contact) => [contact.id, contact]));
    const threadById = new Map(threads.map((thread) => [thread.id, thread]));
    const grouped = new Map<string, TavernCommunicationMessageRecord[]>();
    messages
        .filter((message) => (
            message.status === 'sent'
            && Number.isInteger(Number(message.anchorOrder))
            && Number(message.anchorOrder) >= fromAnchorOrder
            && Number(message.anchorOrder) <= toAnchorOrder
        ))
        .forEach((message) => {
            const key = `${message.anchorOrder}\u0000${message.threadId}`;
            const rows = grouped.get(key) || [];
            rows.push(message);
            grouped.set(key, rows);
        });
    return [...grouped.values()]
        .map((rows): TavernCommunicationTimelineEvent | null => {
            const first = rows[0];
            const thread = first ? threadById.get(first.threadId) : null;
            const contact = thread ? contactById.get(thread.contactId) : null;
            if (!first || !thread || !contact) {return null;}
            const sorted = [...rows].sort((left, right) => left.sequence - right.sequence);
            const content = buildCommunicationTimelineEventContent({
                playerName: options.playerName || '',
                contactName: contact.name,
                messages: sorted,
            });
            return {
                anchorOrder: first.anchorOrder,
                threadId: thread.id,
                contactId: contact.id,
                contactName: contact.name,
                createdAt: Math.min(...sorted.map((message) => message.createdAt)),
                content,
                message: {
                    role: 'user',
                    name: 'private_message',
                    content,
                },
            };
        })
        .filter((event): event is TavernCommunicationTimelineEvent => !!event)
        .sort((left, right) => left.anchorOrder - right.anchorOrder || left.createdAt - right.createdAt);
}

export async function buildTavernCommunicationEvidenceAtAnchor(
    sessionId = '',
    anchorOrder = TAVERN_COMMUNICATION_BASELINE_FLOOR,
    playerName = '',
): Promise<string> {
    const events = await listTavernCommunicationTimelineEvents(sessionId, {
        fromAnchorOrder: anchorOrder,
        toAnchorOrder: anchorOrder,
        playerName,
    });
    return events.map((event) => event.content).join('\n\n');
}
