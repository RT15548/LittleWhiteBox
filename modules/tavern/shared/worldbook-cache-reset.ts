import db, {
    tavernMessagesTable,
    tavernMetaTable,
    tavernSessionsTable,
    type TavernMessageRecord,
    type TavernSessionRecord,
    type TavernSessionState,
} from './session-db';
import type { XbTavernContext } from './message-assembler';

const WORLDBOOK_CACHE_RESET_META_KEY = 'tavernWorldbookCacheResetVersion';
const WORLDBOOK_CACHE_RESET_VERSION = 1;
const RESET_BATCH_SIZE = 250;

const SNAPSHOT_WORLDBOOK_KEYS = new Set([
    'activatedEntries',
    'activatedWorldEntries',
    'localStateWorldEntries',
    'messageLayers',
    'nativeWorldInfo',
    'outlets',
    'rawMessagesJson',
    'rawRequestJson',
    'requestInspection',
    'sourceNames',
    'worldBooks',
    'worldBudget',
    'worldEntries',
    'worldEntryCandidates',
    'worldEntryStates',
    'worldInfoAfter',
    'worldInfoBefore',
    'worldInfoDepth',
    'worldInfoExamples',
    'worldPositionCounts',
    'worldSettings',
    'worldbookNames',
    'worldbookSources',
]);

export interface TavernWorldbookCacheResetResult {
    sessions: number;
    messages: number;
    skipped: boolean;
    version: number;
}

type ResetMode = 'migration' | 'manual';

type PagedDexieCollection<T> = {
    offset(count: number): PagedDexieCollection<T>;
    limit(count: number): PagedDexieCollection<T>;
    toArray(): Promise<T[]>;
};

type PagedDexieTable<T> = {
    orderBy(index: string): PagedDexieCollection<T>;
    where(index: string): {
        equals(value: string): PagedDexieCollection<T>;
    };
};

function now(): number {
    return Date.now();
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return !!value && typeof value === 'object' && !Array.isArray(value);
}

function cloneJson<T>(value: T): T {
    if (value === undefined || value === null) {return value;}
    try {
        return JSON.parse(JSON.stringify(value)) as T;
    } catch {
        return value;
    }
}

function emptyNativeTimedState() {
    return { sticky: {}, cooldown: {} };
}

export function stripWorldbookFieldsFromContext(context: XbTavernContext | undefined): XbTavernContext | undefined {
    if (!isRecord(context)) {return context;}
    const next = cloneJson(context) as XbTavernContext & Record<string, unknown>;
    next.worldBooks = [];
    next.worldEntries = [];
    delete next.nativeWorldInfo;
    if (isRecord(next.sessionMeta)) {
        next.sessionMeta = {
            ...next.sessionMeta,
            worldbookSources: [],
            worldbookNames: [],
        };
    }
    return next;
}

export function stripWorldbookFieldsFromSessionState(state: TavernSessionState | undefined): TavernSessionState {
    const next = isRecord(state)
        ? cloneJson(state) as TavernSessionState
        : {};
    next.worldEntryStates = {};
    next.nativeWorldInfoTimedState = emptyNativeTimedState();
    delete next.lastRequestSnapshot;
    if (isRecord(next.lastBuildSnapshot)) {
        next.lastBuildSnapshot = stripWorldbookFieldsFromSnapshot(next.lastBuildSnapshot);
    }
    return next;
}

export function stripWorldbookFieldsFromSnapshot<T>(snapshot: T): T {
    if (Array.isArray(snapshot)) {
        return snapshot.map((item) => stripWorldbookFieldsFromSnapshot(item)) as T;
    }
    if (!isRecord(snapshot)) {return snapshot;}
    const next: Record<string, unknown> = {};
    Object.entries(snapshot).forEach(([key, value]) => {
        if (SNAPSHOT_WORLDBOOK_KEYS.has(key)) {return;}
        next[key] = stripWorldbookFieldsFromSnapshot(value);
    });
    return next as T;
}

function stripWorldbookFieldsFromSession(session: TavernSessionRecord): Partial<TavernSessionRecord> {
    return {
        contextSnapshot: stripWorldbookFieldsFromContext(session.contextSnapshot),
        buildSnapshot: isRecord(session.buildSnapshot)
            ? stripWorldbookFieldsFromSnapshot(session.buildSnapshot)
            : session.buildSnapshot,
        state: stripWorldbookFieldsFromSessionState(session.state),
    };
}

function stripWorldbookFieldsFromMessage(message: TavernMessageRecord): Partial<TavernMessageRecord> {
    return {
        contextSnapshot: stripWorldbookFieldsFromContext(message.contextSnapshot),
        buildSnapshot: isRecord(message.buildSnapshot)
            ? stripWorldbookFieldsFromSnapshot(message.buildSnapshot)
            : message.buildSnapshot,
        requestSnapshot: isRecord(message.requestSnapshot)
            ? stripWorldbookFieldsFromSnapshot(message.requestSnapshot)
            : message.requestSnapshot,
    };
}

async function resetOneSession(sessionId: string): Promise<number> {
    const id = String(sessionId || '').trim();
    if (!id) {return 0;}
    const session = await tavernSessionsTable.get(id);
    if (!session) {return 0;}
    await tavernSessionsTable.update(id, stripWorldbookFieldsFromSession(session));
    return 1;
}

async function resetMessagesForSession(sessionId: string): Promise<number> {
    const id = String(sessionId || '').trim();
    if (!id) {return 0;}
    let offset = 0;
    let changed = 0;
    for (;;) {
        const batch = await (tavernMessagesTable as unknown as PagedDexieTable<TavernMessageRecord>)
            .where('sessionId')
            .equals(id)
            .offset(offset)
            .limit(RESET_BATCH_SIZE)
            .toArray();
        if (!batch.length) {break;}
        await Promise.all(batch.map((message) => tavernMessagesTable.update(
            [message.sessionId, message.order],
            stripWorldbookFieldsFromMessage(message),
        )));
        changed += batch.length;
        offset += batch.length;
    }
    return changed;
}

async function resetAllSessions(): Promise<number> {
    let offset = 0;
    let changed = 0;
    for (;;) {
        const batch = await (tavernSessionsTable as unknown as PagedDexieTable<TavernSessionRecord>)
            .orderBy('id')
            .offset(offset)
            .limit(RESET_BATCH_SIZE)
            .toArray();
        if (!batch.length) {break;}
        await Promise.all(batch.map((session) => tavernSessionsTable.update(
            session.id,
            stripWorldbookFieldsFromSession(session),
        )));
        changed += batch.length;
        offset += batch.length;
    }
    return changed;
}

async function resetAllMessages(): Promise<number> {
    let offset = 0;
    let changed = 0;
    for (;;) {
        const batch = await (tavernMessagesTable as unknown as PagedDexieTable<TavernMessageRecord>)
            .orderBy('sessionId')
            .offset(offset)
            .limit(RESET_BATCH_SIZE)
            .toArray();
        if (!batch.length) {break;}
        await Promise.all(batch.map((message) => tavernMessagesTable.update(
            [message.sessionId, message.order],
            stripWorldbookFieldsFromMessage(message),
        )));
        changed += batch.length;
        offset += batch.length;
    }
    return changed;
}

export async function resetTavernWorldbookCache(options: {
    sessionId?: string;
    mode: ResetMode;
}): Promise<TavernWorldbookCacheResetResult> {
    const mode = options.mode;
    const sessionId = String(options.sessionId || '').trim();
    if (mode === 'migration') {
        const meta = await tavernMetaTable.get(WORLDBOOK_CACHE_RESET_META_KEY);
        const version = Number(meta?.value) || 0;
        if (version >= WORLDBOOK_CACHE_RESET_VERSION) {
            return {
                sessions: 0,
                messages: 0,
                skipped: true,
                version,
            };
        }
        let sessions = 0;
        let messages = 0;
        await db.transaction('rw', tavernSessionsTable, tavernMessagesTable, tavernMetaTable, async () => {
            sessions = await resetAllSessions();
            messages = await resetAllMessages();
            await tavernMetaTable.put({
                key: WORLDBOOK_CACHE_RESET_META_KEY,
                value: WORLDBOOK_CACHE_RESET_VERSION,
                updatedAt: now(),
            });
        });
        return {
            sessions,
            messages,
            skipped: false,
            version: WORLDBOOK_CACHE_RESET_VERSION,
        };
    }

    let sessions = 0;
    let messages = 0;
    await db.transaction('rw', tavernSessionsTable, tavernMessagesTable, async () => {
        sessions = await resetOneSession(sessionId);
        messages = await resetMessagesForSession(sessionId);
    });
    return {
        sessions,
        messages,
        skipped: false,
        version: WORLDBOOK_CACHE_RESET_VERSION,
    };
}

export const TAVERN_WORLDBOOK_CACHE_RESET_META_KEY = WORLDBOOK_CACHE_RESET_META_KEY;
export const TAVERN_WORLDBOOK_CACHE_RESET_VERSION = WORLDBOOK_CACHE_RESET_VERSION;
