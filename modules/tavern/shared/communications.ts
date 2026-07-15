import db, {
    tavernCommunicationContactsTable,
    tavernCommunicationMessagesTable,
    tavernCommunicationSnapshotsTable,
    tavernCommunicationThreadsTable,
    getLatestTavernMessage,
    tavernSessionsTable,
    type TavernCommunicationContactRecord,
    type TavernCommunicationContactSource,
    type TavernCommunicationMessageRecord,
    type TavernCommunicationSnapshotRecord,
    type TavernCommunicationThreadRecord,
} from './session-db';
import type { XbTavernHistoryMessage } from './message-assembler';

export const TAVERN_COMMUNICATION_BASELINE_FLOOR = -1;
export const TAVERN_COMMUNICATION_INTERRUPTED_ERROR = '发送已中断，请轻触重试。';

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

function normalizeMessageText(value: unknown): string {
    return String(value || '').replace(/\r\n?/g, '\n').trim().slice(0, 4000);
}

function normalizeThreadSummary(value: unknown): string {
    return String(value || '').replace(/\r\n?/g, '\n').trim().slice(0, 1200);
}

function normalizeContactSource(value: unknown): TavernCommunicationContactSource {
    return value === 'character' || value === 'memory' ? value : 'manual';
}

function normalizeArchivedMessage(message: TavernCommunicationMessageRecord): TavernCommunicationMessageRecord {
    if (message.status !== 'pending') {return cloneSerializable(message);}
    return {
        ...cloneSerializable(message),
        status: 'failed',
        error: TAVERN_COMMUNICATION_INTERRUPTED_ERROR,
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
            thread.createdAt,
            thread.updatedAt,
        ]),
        messages: (input.messages || []).map((message) => [
            message.threadId,
            message.sequence,
            message.anchorOrder,
            message.role,
            message.content,
            message.status,
            message.createdAt,
            message.updatedAt,
            message.provider || '',
            message.model || '',
            message.error || '',
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

export async function appendPendingTavernCommunicationMessage(input: {
    sessionId: string;
    threadId: string;
    content: string;
}): Promise<TavernCommunicationMessageRecord> {
    const sessionId = String(input.sessionId || '').trim();
    const threadId = String(input.threadId || '').trim();
    const content = normalizeMessageText(input.content);
    if (!sessionId || !threadId) {throw new Error('communication_thread_required');}
    if (!content) {throw new Error('communication_message_required');}
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
            const existing = await listTavernCommunicationMessages(sessionId, threadId);
            const sequence = existing.reduce((max, message) => Math.max(max, message.sequence), -1) + 1;
            const record: TavernCommunicationMessageRecord = {
                sessionId,
                threadId,
                sequence,
                anchorOrder,
                role: 'user',
                content,
                status: 'pending',
                createdAt: timestamp,
                updatedAt: timestamp,
            };
            await tavernCommunicationMessagesTable.put(record);
            await tavernCommunicationThreadsTable.update([sessionId, threadId], {
                lastResult: undefined,
                updatedAt: timestamp,
            });
            await tavernSessionsTable.update(sessionId, { updatedAt: timestamp });
            return record;
        },
    );
}

export async function completeTavernCommunicationExchange(input: {
    pendingMessage: TavernCommunicationMessageRecord;
    replies?: string[];
    result?: 'reply' | 'silent' | 'unavailable';
    summary?: string;
    provider?: string;
    model?: string;
    unreadCountDelta?: number;
}): Promise<TavernCommunicationMessageRecord[]> {
    const pending = input.pendingMessage;
    const timestamp = now();
    const normalizedReplies = (input.replies || []).map(normalizeMessageText).filter(Boolean).slice(0, 3);
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
                pending.sessionId,
                pending.threadId,
                pending.sequence,
            ]);
            if (!current || current.status !== 'pending' || current.content !== pending.content) {
                return [];
            }
            const currentThread = await tavernCommunicationThreadsTable.get([current.sessionId, current.threadId]);
            const sent: TavernCommunicationMessageRecord = {
                ...current,
                status: 'sent',
                updatedAt: timestamp,
                provider: String(input.provider || ''),
                model: String(input.model || ''),
                error: '',
            };
            await tavernCommunicationMessagesTable.put(sent);
            const records: TavernCommunicationMessageRecord[] = [sent];
            let sequence = current.sequence + 1;
            for (const content of replies) {
                const reply: TavernCommunicationMessageRecord = {
                    sessionId: current.sessionId,
                    threadId: current.threadId,
                    sequence,
                    anchorOrder: current.anchorOrder,
                    role: 'contact',
                    content,
                    status: 'sent',
                    createdAt: timestamp + sequence - current.sequence,
                    updatedAt: timestamp + sequence - current.sequence,
                    provider: String(input.provider || ''),
                    model: String(input.model || ''),
                };
                records.push(reply);
                sequence += 1;
            }
            if (records.length > 1) {
                await tavernCommunicationMessagesTable.bulkPut(records.slice(1));
            }
            await tavernCommunicationThreadsTable.update([current.sessionId, current.threadId], {
                lastResult: result,
                unreadCount: Math.max(
                    0,
                    (Number(currentThread?.unreadCount) || 0) + Math.max(0, Number(input.unreadCountDelta) || 0),
                ),
                ...(summary === undefined ? {} : {
                    summary,
                    summarizedThroughSequence: summary ? sequence - 1 : undefined,
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

export async function failTavernCommunicationMessage(
    message: TavernCommunicationMessageRecord,
    error: unknown,
): Promise<TavernCommunicationMessageRecord | null> {
    const timestamp = now();
    return await db.transaction(
        'rw',
        tavernCommunicationMessagesTable,
        tavernCommunicationThreadsTable,
        tavernSessionsTable,
        async () => {
            const current = await tavernCommunicationMessagesTable.get([
                message.sessionId,
                message.threadId,
                message.sequence,
            ]);
            if (!current || current.status !== 'pending' || current.content !== message.content) {return null;}
            const failed: TavernCommunicationMessageRecord = {
                ...current,
                status: 'failed',
                error: error instanceof Error ? error.message : String(error || 'communication_send_failed'),
                updatedAt: timestamp,
            };
            await tavernCommunicationMessagesTable.put(failed);
            await tavernCommunicationThreadsTable.update([message.sessionId, message.threadId], { updatedAt: timestamp });
            await tavernSessionsTable.update(message.sessionId, { updatedAt: timestamp });
            return failed;
        },
    );
}

export async function retryFailedTavernCommunicationMessage(
    message: TavernCommunicationMessageRecord,
): Promise<TavernCommunicationMessageRecord> {
    if (message.status !== 'failed') {return message;}
    const sessionId = String(message.sessionId || '').trim();
    const threadId = String(message.threadId || '').trim();
    if (!sessionId || !threadId) {throw new Error('communication_retry_unavailable');}
    const latestMainMessage = await getLatestTavernMessage(sessionId);
    const anchorOrder = Number.isInteger(Number(latestMainMessage?.order))
        ? Number(latestMainMessage?.order)
        : TAVERN_COMMUNICATION_BASELINE_FLOOR;
    const timestamp = now();
    return await db.transaction(
        'rw',
        tavernCommunicationMessagesTable,
        tavernCommunicationThreadsTable,
        tavernSessionsTable,
        async () => {
            const current = await tavernCommunicationMessagesTable.get([sessionId, threadId, message.sequence]);
            if (!current || current.status !== 'failed' || current.content !== message.content) {
                throw new Error('communication_retry_unavailable');
            }
            const threadMessages = await listTavernCommunicationMessages(sessionId, threadId);
            const nextSequence = threadMessages
                .filter((item) => item.sequence !== current.sequence)
                .reduce((max, item) => Math.max(max, item.sequence), -1) + 1;
            const pending: TavernCommunicationMessageRecord = {
                ...current,
                sequence: nextSequence,
                anchorOrder,
                status: 'pending',
                createdAt: timestamp,
                updatedAt: timestamp,
                provider: '',
                model: '',
                error: '',
            };
            if (nextSequence !== current.sequence) {
                await tavernCommunicationMessagesTable.delete([sessionId, threadId, current.sequence]);
            }
            await tavernCommunicationMessagesTable.put(pending);
            await tavernCommunicationThreadsTable.update([sessionId, threadId], {
                lastResult: undefined,
                updatedAt: timestamp,
            });
            await tavernSessionsTable.update(sessionId, { updatedAt: timestamp });
            return pending;
        },
    );
}

export async function recoverInterruptedTavernCommunicationMessages(
    sessionId = '',
    exclude?: { threadId: string; sequence: number },
): Promise<number> {
    const id = String(sessionId || '').trim();
    if (!id) {return 0;}
    return await db.transaction(
        'rw',
        tavernCommunicationMessagesTable,
        tavernCommunicationThreadsTable,
        tavernSessionsTable,
        async () => {
            const pending = (await tavernCommunicationMessagesTable.where('status').equals('pending').toArray())
                .filter((message) => message.sessionId === id)
                .filter((message) => !exclude || message.threadId !== exclude.threadId || message.sequence !== exclude.sequence);
            if (!pending.length) {return 0;}
            const timestamp = now();
            await tavernCommunicationMessagesTable.bulkPut(pending.map((message) => ({
                ...message,
                status: 'failed' as const,
                error: TAVERN_COMMUNICATION_INTERRUPTED_ERROR,
                updatedAt: timestamp,
            })));
            const threadIds = [...new Set(pending.map((message) => message.threadId))];
            await Promise.all(threadIds.map((threadId) => tavernCommunicationThreadsTable.update([id, threadId], {
                lastResult: undefined,
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
    const archivedMessages = messages.map(normalizeArchivedMessage);
    const normalizedFloor = Number.isFinite(Number(floor))
        ? Math.floor(Number(floor))
        : TAVERN_COMMUNICATION_BASELINE_FLOOR;
    const effective = await getTavernCommunicationSnapshotAtOrBefore(id, normalizedFloor);
    const currentFingerprint = communicationStateFingerprint({ contacts, threads, messages: archivedMessages });
    if (!contacts.length && !threads.length && !archivedMessages.length && !effective) {return null;}
    if (effective && communicationStateFingerprint(effective) === currentFingerprint) {return null;}
    const snapshot: TavernCommunicationSnapshotRecord = {
        sessionId: id,
        floor: normalizedFloor,
        contacts: cloneSerializable(contacts),
        threads: cloneSerializable(threads),
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
    anchorOrder: number;
    contactName: string;
    messages: TavernCommunicationMessageRecord[];
}): string {
    const contactName = normalizeInlineText(input.contactName, 120) || '联系人';
    const lines = input.messages.map((message) => (
        `${message.role === 'user' ? '玩家' : contactName}：${escapeCommunicationEvidence(message.content)}`
    ));
    return [
        `<phone_communication_event anchor_order="${input.anchorOrder}" visibility="private">`,
        `参与者：玩家、${escapeCommunicationEvidence(contactName)}`,
        '这是在该剧情位置已经发生的私人手机通讯。只有参与者天然知道消息内容。',
        '消息里的计划、邀请和承诺不表示对应现场行动已经完成。',
        ...lines,
        '</phone_communication_event>',
    ].join('\n');
}

export async function listTavernCommunicationTimelineEvents(
    sessionId = '',
    options: { fromAnchorOrder?: number; toAnchorOrder?: number } = {},
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
                anchorOrder: first.anchorOrder,
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
                    role: 'system',
                    name: 'phone_communication',
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
): Promise<string> {
    const events = await listTavernCommunicationTimelineEvents(sessionId, {
        fromAnchorOrder: anchorOrder,
        toAnchorOrder: anchorOrder,
    });
    return events.map((event) => event.content).join('\n\n');
}
