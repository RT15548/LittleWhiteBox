import db, {
    getLatestTavernAssistantOrder,
    tavernManagerRunsTable,
    tavernManagerTaskSnapshotsTable,
    tavernMessagesTable,
    tavernSessionsTable,
    tavernTaskFingerprintStatesTable,
    tavernTaskSnapshotsTable,
    tavernTasksTable,
    type TavernManagerTaskSnapshotRecord,
    type TavernTaskRecord,
    type TavernTaskSnapshotRecord,
} from './session-db';

export const TAVERN_TASK_TOOL_NAMES = {
    INSPECT: 'EventInspect',
    PATCH: 'EventPatch',
} as const;

const LEGACY_TAVERN_TASK_TOOL_NAMES = {
    PATCH: 'TaskPatch',
} as const;

function normalizeTavernTaskToolName(toolName = ''): string {
    const name = String(toolName || '').trim();
    if (name === LEGACY_TAVERN_TASK_TOOL_NAMES.PATCH) {return TAVERN_TASK_TOOL_NAMES.PATCH;}
    return name;
}

export const TAVERN_TASK_BASELINE_FLOOR = -1;
export const TAVERN_TASK_MIN_GENERATION_FLOOR = 5;
export const TAVERN_TASK_MAX_ACTIVE = 3;
export const TAVERN_TASK_AUTO_CREATE_MAX_ACTIVE = 1;
export const TAVERN_TASK_STALE_FLOOR_THRESHOLD = 8;
const MAX_ABANDONED_FINGERPRINTS = 200;
const TASK_HOOK_META_WORD_PATTERN = /(?:任务|目标|子目标|远景|已完成|\bquest\b|\btask\b|\bgoal\b|\bobjective\b|\bcomplete(?:d|s|ion)?\b)|(?:完成|完成剧情)(?=任务|目标|子目标|远景)|完成任务|任务完成|目标完成|子目标完成|任务已完成|目标已完成|子目标已完成/i;

export interface TavernTaskToolResult {
    ok: boolean;
    summary: string;
    changed?: boolean;
    eventId?: string;
    op?: string;
    error?: string;
    warnings?: string[];
    events?: Array<Pick<TavernTaskRecord, 'id' | 'status' | 'title' | 'vision' | 'doneWhen' | 'updatedOrder'>>;
}

export interface TavernTaskPatchOptions {
    caller?: 'auto' | 'chat';
    managerRunId?: string;
    sourceUserOrder?: number;
    sourceAssistantOrder?: number;
    beforeWriteGuard?: () => Promise<void> | void;
    afterWriteObserver?: () => Promise<void> | void;
}

function now(): number {
    return Date.now();
}

function createId(prefix = 'task'): string {
    return `${prefix}-${now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function cloneJson<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
}

function normalizeText(value: unknown = '', limit = 1200): string {
    const text = String(value || '').replace(/\r\n/g, '\n').trim();
    return text.length > limit ? text.slice(0, limit) : text;
}

function normalizeEventTitle(value: unknown = ''): string {
    return normalizeText(value, 40).replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function normalizeTaskId(value: unknown = ''): string {
    const text = String(value || '').trim();
    return /^[\w:.-]{1,120}$/i.test(text) ? text : '';
}

function normalizeEventPatchOp(value: unknown = ''): string {
    return String(value || '').trim();
}

function getPatchEventId(args: Record<string, unknown> = {}): string {
    return normalizeTaskId(args.eventId || args.taskId || args.id);
}

function normalizeFingerprint(value: unknown = ''): string {
    return normalizeText(value, 240);
}

function deriveTaskTitle(task: Pick<TavernTaskRecord, 'title' | 'vision'>): string {
    return normalizeEventTitle(task.title || task.vision).slice(0, 8) || '未命名野望';
}

function validateEventTitle(title = ''): string {
    const length = Array.from(title).length;
    if (length < 2) {return 'task_title_too_short';}
    if (length > 12) {return 'task_title_too_long';}
    return '';
}

function buildEventFingerprint(title = '', vision = ''): string {
    return hashText([
        normalizeEventTitle(title),
        normalizeText(vision, 500),
    ].join('\n'));
}

function hasTaskHookMetaWords(value = ''): boolean {
    return TASK_HOOK_META_WORD_PATTERN.test(String(value || ''));
}

function normalizeOrder(value: unknown, fallback = -1): number {
    const order = Number(value);
    return Number.isFinite(order) ? Math.floor(order) : fallback;
}

function taskHashPayload(tasks: TavernTaskRecord[] = [], fingerprints: string[] = []): string {
    return JSON.stringify({
        tasks: [...tasks]
            .sort((left, right) => left.id.localeCompare(right.id))
            .map((task) => ({
                id: task.id,
                sessionId: task.sessionId,
                status: task.status,
                title: deriveTaskTitle(task),
                vision: task.vision,
                doneWhen: task.doneWhen,
                hookForModel: task.hookForModel,
                fingerprint: task.fingerprint,
                createdOrder: task.createdOrder,
                updatedOrder: task.updatedOrder,
                completedOrder: task.completedOrder ?? null,
                abandonedOrder: task.abandonedOrder ?? null,
                sourceManagerRunId: task.sourceManagerRunId || '',
            })),
        abandonedFingerprints: [...new Set(fingerprints)].sort(),
    });
}

function hashText(value: unknown = ''): string {
    const text = String(value || '');
    let left = 2166136261;
    let right = 2166136261 ^ 0x9e3779b9;
    for (let index = 0; index < text.length; index += 1) {
        const code = text.charCodeAt(index);
        left ^= code;
        left = Math.imul(left, 16777619) >>> 0;
        right ^= code + index;
        right = Math.imul(right, 16777619) >>> 0;
    }
    return `${text.length.toString(36)}:${left.toString(16)}${right.toString(16)}`;
}

function mergeTaskRollbackError(existing = '', conflicts: string[] = []): string {
    const current = String(existing || '').trim();
    if (!conflicts.length) {return current;}
    const prefix = 'rollback_conflict:';
    const currentConflicts = current.startsWith(prefix)
        ? current.slice(prefix.length).split(',').map((item) => item.trim()).filter(Boolean)
        : [];
    const merged = [...new Set([...currentConflicts, ...conflicts])];
    return `${prefix}${merged.join(',')}`;
}

async function taskPoolHash(sessionId = ''): Promise<string> {
    const [tasks, fingerprints] = await Promise.all([
        listTavernTasks(sessionId, { includeAbandoned: true, includeCompleted: true }),
        getAbandonedTaskFingerprints(sessionId),
    ]);
    return hashText(taskHashPayload(tasks, fingerprints));
}

async function resolveTaskSnapshotFloor(sessionId = '', floorInput?: number): Promise<number> {
    const explicit = Number(floorInput);
    if (Number.isFinite(explicit)) {return Math.floor(explicit);}
    const latestOrder = await getLatestTavernAssistantOrder(sessionId);
    return latestOrder ?? TAVERN_TASK_BASELINE_FLOOR;
}

function snapshotFingerprint(snapshot: TavernTaskSnapshotRecord | null | undefined): string {
    return hashText(taskHashPayload(snapshot?.tasks || [], snapshot?.abandonedFingerprints || []));
}

export async function listTavernTasks(sessionId = '', options: {
    includeCompleted?: boolean;
    includeAbandoned?: boolean;
} = {}): Promise<TavernTaskRecord[]> {
    const id = String(sessionId || '').trim();
    if (!id) {return [];}
    const rows = await tavernTasksTable.where('sessionId').equals(id).sortBy('updatedAt');
    return rows
        .filter((task) => options.includeCompleted || task.status !== 'completed')
        .filter((task) => options.includeAbandoned || task.status !== 'abandoned')
        .sort((left, right) => Number(right.updatedOrder) - Number(left.updatedOrder) || Number(right.updatedAt) - Number(left.updatedAt));
}

export async function getTavernTask(sessionId = '', taskId = ''): Promise<TavernTaskRecord | null> {
    const id = String(sessionId || '').trim();
    const normalizedTaskId = normalizeTaskId(taskId);
    if (!id || !normalizedTaskId) {return null;}
    return await tavernTasksTable.get([id, normalizedTaskId]) || null;
}

export async function getAbandonedTaskFingerprints(sessionId = ''): Promise<string[]> {
    const id = String(sessionId || '').trim();
    if (!id) {return [];}
    const record = await tavernTaskFingerprintStatesTable.get(id);
    return Array.isArray(record?.abandonedFingerprints)
        ? record.abandonedFingerprints.map((item) => normalizeFingerprint(item)).filter(Boolean)
        : [];
}

async function putAbandonedTaskFingerprints(sessionId = '', fingerprints: string[] = []): Promise<string[]> {
    const id = String(sessionId || '').trim();
    if (!id) {return [];}
    const normalized = [...new Set(fingerprints.map((item) => normalizeFingerprint(item)).filter(Boolean))]
        .slice(-MAX_ABANDONED_FINGERPRINTS);
    await tavernTaskFingerprintStatesTable.put({
        sessionId: id,
        abandonedFingerprints: normalized,
        updatedAt: now(),
    });
    return normalized;
}

async function rememberAbandonedFingerprint(sessionId = '', fingerprint = ''): Promise<void> {
    const normalized = normalizeFingerprint(fingerprint);
    if (!normalized) {return;}
    const existing = await getAbandonedTaskFingerprints(sessionId);
    await putAbandonedTaskFingerprints(sessionId, [...existing.filter((item) => item !== normalized), normalized]);
}

export async function saveTavernTaskSnapshot(sessionId = '', floorInput?: number): Promise<TavernTaskSnapshotRecord | null> {
    const id = String(sessionId || '').trim();
    if (!id) {return null;}
    return await db.transaction('rw', tavernTasksTable, tavernTaskSnapshotsTable, tavernTaskFingerprintStatesTable, async () => {
        const [tasks, abandonedFingerprints] = await Promise.all([
            listTavernTasks(id, { includeAbandoned: true, includeCompleted: true }),
            getAbandonedTaskFingerprints(id),
        ]);
        const floor = await resolveTaskSnapshotFloor(id, floorInput);
        if (floor === TAVERN_TASK_BASELINE_FLOOR && !tasks.length && !abandonedFingerprints.length) {
            return null;
        }
        const effective = await getLatestTavernTaskSnapshot(id, floor);
        const currentFingerprint = hashText(taskHashPayload(tasks, abandonedFingerprints));
        if (effective && snapshotFingerprint(effective) === currentFingerprint) {
            return null;
        }
        const record: TavernTaskSnapshotRecord = {
            sessionId: id,
            floor,
            tasks: tasks.map((task) => cloneJson(task)),
            abandonedFingerprints: [...abandonedFingerprints],
            createdAt: now(),
        };
        await tavernTaskSnapshotsTable.put(record);
        return record;
    });
}

export async function resolveAcceptedSnapshotFloor(sessionId = '', floorInput?: number): Promise<number> {
    return resolveTaskSnapshotFloor(sessionId, floorInput);
}

export async function listTavernTaskSnapshots(sessionId = ''): Promise<TavernTaskSnapshotRecord[]> {
    const id = String(sessionId || '').trim();
    if (!id) {return [];}
    return (await tavernTaskSnapshotsTable.where('sessionId').equals(id).sortBy('floor'))
        .sort((left, right) => left.floor - right.floor || left.createdAt - right.createdAt);
}

export async function getLatestTavernTaskSnapshot(sessionId = '', targetFloor = Number.POSITIVE_INFINITY): Promise<TavernTaskSnapshotRecord | null> {
    const id = String(sessionId || '').trim();
    const floor = Number(targetFloor);
    if (!id) {return null;}
    const snapshots = await listTavernTaskSnapshots(id);
    return snapshots
        .filter((snapshot) => Number(snapshot.floor) <= floor || floor === Number.POSITIVE_INFINITY)
        .sort((left, right) => Number(right.floor) - Number(left.floor) || Number(right.createdAt) - Number(left.createdAt))[0]
        || null;
}

export async function trimTavernTaskSnapshotsFromFloor(sessionId = '', fromFloor = 0): Promise<number> {
    const id = String(sessionId || '').trim();
    const floor = Number(fromFloor);
    if (!id || !Number.isFinite(floor)) {return 0;}
    return await db.transaction('rw', tavernTaskSnapshotsTable, async () => {
        const snapshots = await listTavernTaskSnapshots(id);
        const affected = snapshots.filter((snapshot) => Number(snapshot.floor) >= floor);
        if (!affected.length) {return 0;}
        await tavernTaskSnapshotsTable.bulkDelete(affected.map((snapshot) => [snapshot.sessionId, snapshot.floor]));
        return affected.length;
    });
}

export async function describeTavernTaskRestoreImpact(sessionId = '', targetFloor = -1): Promise<{
    changed: boolean;
    currentTaskCount: number;
    targetTaskCount: number;
}> {
    const id = String(sessionId || '').trim();
    if (!id) {
        return { changed: false, currentTaskCount: 0, targetTaskCount: 0 };
    }
    const snapshot = await getLatestTavernTaskSnapshot(id, targetFloor);
    const [currentTasks, currentFingerprints] = await Promise.all([
        listTavernTasks(id, { includeAbandoned: true, includeCompleted: true }),
        getAbandonedTaskFingerprints(id),
    ]);
    const targetTasks = snapshot?.tasks || [];
    const targetFingerprints = snapshot?.abandonedFingerprints || [];
    const currentHash = hashText(taskHashPayload(currentTasks, currentFingerprints));
    const targetHash = hashText(taskHashPayload(targetTasks, targetFingerprints));
    return {
        changed: currentHash !== targetHash,
        currentTaskCount: currentTasks.length,
        targetTaskCount: targetTasks.length,
    };
}

export async function restoreTavernTasksToFloor(sessionId = '', targetFloor = -1): Promise<TavernTaskRecord[]> {
    const id = String(sessionId || '').trim();
    if (!id) {throw new Error('task_session_required');}
    return await db.transaction('rw', tavernTasksTable, tavernTaskSnapshotsTable, tavernTaskFingerprintStatesTable, async () => {
        const snapshot = await getLatestTavernTaskSnapshot(id, targetFloor);
        const currentTasks = await tavernTasksTable.where('sessionId').equals(id).toArray();
        if (currentTasks.length) {
            await tavernTasksTable.bulkDelete(currentTasks.map((task) => [task.sessionId, task.id]));
        }
        if (!snapshot) {
            await putAbandonedTaskFingerprints(id, []);
            return [];
        }
        const restoredTasks = (snapshot.tasks || []).map((task) => ({
            ...cloneJson(task),
            sessionId: id,
        }));
        if (restoredTasks.length) {
            await tavernTasksTable.bulkPut(restoredTasks);
        }
        await putAbandonedTaskFingerprints(id, snapshot.abandonedFingerprints || []);
        return restoredTasks;
    });
}

export async function ensureTavernManagerTaskSnapshot(managerRunId = '', sessionId = ''): Promise<TavernManagerTaskSnapshotRecord | null> {
    const runId = String(managerRunId || '').trim();
    const id = String(sessionId || '').trim();
    if (!runId || !id) {return null;}
    const existing = await tavernManagerTaskSnapshotsTable.get(runId);
    if (existing) {return existing;}
    const [tasks, fingerprints] = await Promise.all([
        listTavernTasks(id, { includeAbandoned: true, includeCompleted: true }),
        getAbandonedTaskFingerprints(id),
    ]);
    const record: TavernManagerTaskSnapshotRecord = {
        managerRunId: runId,
        sessionId: id,
        beforeTasks: tasks.map((task) => cloneJson(task)),
        beforeFingerprints: [...fingerprints],
        beforeHash: hashText(taskHashPayload(tasks, fingerprints)),
        afterHash: '',
        rollbackStatus: 'pending',
        error: '',
        createdAt: now(),
        updatedAt: now(),
    };
    await tavernManagerTaskSnapshotsTable.put(record);
    return record;
}

export async function updateTavernManagerTaskSnapshotAfter(managerRunId = '', sessionId = ''): Promise<TavernManagerTaskSnapshotRecord | null> {
    const snapshot = await ensureTavernManagerTaskSnapshot(managerRunId, sessionId);
    if (!snapshot) {return null;}
    await tavernManagerTaskSnapshotsTable.update(snapshot.managerRunId, {
        afterHash: await taskPoolHash(snapshot.sessionId),
        updatedAt: now(),
    });
    return await tavernManagerTaskSnapshotsTable.get(snapshot.managerRunId) || null;
}

export async function listTavernManagerTaskSnapshots(managerRunId = ''): Promise<TavernManagerTaskSnapshotRecord[]> {
    const id = String(managerRunId || '').trim();
    if (!id) {return [];}
    const snapshot = await tavernManagerTaskSnapshotsTable.get(id);
    return snapshot ? [snapshot] : [];
}

export async function rollbackManagerRunTaskWrites(managerRunId = ''): Promise<{
    rolledBack: number;
    conflicts: string[];
    skipped: number;
}> {
    const runId = String(managerRunId || '').trim();
    if (!runId) {return { rolledBack: 0, conflicts: [], skipped: 0 };}
    const snapshot = await tavernManagerTaskSnapshotsTable.get(runId);
    const run = await tavernManagerRunsTable.get(runId);
    if (!snapshot || !run) {return { rolledBack: 0, conflicts: [], skipped: 0 };}
    if (snapshot.rollbackStatus === 'rolled_back' || snapshot.rollbackStatus === 'skipped') {
        return { rolledBack: 0, conflicts: [], skipped: 1 };
    }
    if (!snapshot.afterHash) {
        await tavernManagerTaskSnapshotsTable.update(runId, {
            rollbackStatus: 'skipped',
            error: 'snapshot_after_hash_missing',
            updatedAt: now(),
        });
        return { rolledBack: 0, conflicts: [], skipped: 1 };
    }
    const currentHash = await taskPoolHash(snapshot.sessionId);
    if (currentHash !== snapshot.afterHash) {
        await tavernManagerTaskSnapshotsTable.update(runId, {
            rollbackStatus: 'conflict',
            error: 'rollback_conflict_current_tasks_changed',
            updatedAt: now(),
        });
        await tavernManagerRunsTable.update(runId, {
            status: 'rolled_back',
            error: mergeTaskRollbackError(run.error, ['tasks']),
            updatedAt: now(),
        });
        return { rolledBack: 0, conflicts: ['tasks'], skipped: 0 };
    }
    await db.transaction('rw', tavernTasksTable, tavernTaskFingerprintStatesTable, tavernManagerTaskSnapshotsTable, tavernManagerRunsTable, async () => {
        const currentTasks = await tavernTasksTable.where('sessionId').equals(snapshot.sessionId).toArray();
        if (currentTasks.length) {
            await tavernTasksTable.bulkDelete(currentTasks.map((task) => [task.sessionId, task.id]));
        }
        if (snapshot.beforeTasks.length) {
            await tavernTasksTable.bulkPut(snapshot.beforeTasks.map((task) => cloneJson(task)));
        }
        await putAbandonedTaskFingerprints(snapshot.sessionId, snapshot.beforeFingerprints || []);
        await tavernManagerTaskSnapshotsTable.update(runId, {
            rollbackStatus: 'rolled_back',
            error: '',
            updatedAt: now(),
        });
        await tavernManagerRunsTable.update(runId, {
            status: 'rolled_back',
            updatedAt: now(),
        });
    });
    return { rolledBack: 1, conflicts: [], skipped: 0 };
}

async function findTaskForPatch(sessionId = '', args: Record<string, unknown> = {}): Promise<TavernTaskRecord | null> {
    const directId = getPatchEventId(args);
    if (directId) {return getTavernTask(sessionId, directId);}
    return null;
}

async function findTaskByFingerprint(sessionId = '', fingerprint = ''): Promise<TavernTaskRecord | null> {
    const normalized = normalizeFingerprint(fingerprint);
    if (!normalized) {return null;}
    const rows = await listTavernTasks(sessionId, { includeCompleted: true });
    return rows.find((task) => (task.status === 'active' || task.status === 'completed') && task.fingerprint === normalized) || null;
}

function summarizeTask(task: TavernTaskRecord): Pick<TavernTaskRecord, 'id' | 'status' | 'title' | 'vision' | 'doneWhen' | 'updatedOrder'> {
    return {
        id: task.id,
        status: task.status,
        title: deriveTaskTitle(task),
        vision: task.vision,
        doneWhen: task.doneWhen,
        updatedOrder: task.updatedOrder,
    };
}

async function runTaskMutation<T>(sessionId: string, options: TavernTaskPatchOptions, mutate: () => Promise<T>): Promise<T> {
    return await db.transaction('rw', tavernTasksTable, tavernTaskFingerprintStatesTable, tavernManagerTaskSnapshotsTable, tavernMessagesTable, tavernSessionsTable, async () => {
        await options.beforeWriteGuard?.();
        if (options.managerRunId) {
            await ensureTavernManagerTaskSnapshot(options.managerRunId, sessionId);
        }
        const result = await mutate();
        if (options.managerRunId) {
            await updateTavernManagerTaskSnapshotAfter(options.managerRunId, sessionId);
        }
        await options.afterWriteObserver?.();
        return result;
    });
}

export async function executeTavernTaskTool(
    sessionId = '',
    toolName = '',
    args: Record<string, unknown> = {},
    options: TavernTaskPatchOptions = {},
): Promise<TavernTaskToolResult> {
    const id = String(sessionId || '').trim();
    if (!id) {return { ok: false, summary: '缺少 sessionId。', changed: false, error: 'task_session_required' };}
    const normalizedToolName = normalizeTavernTaskToolName(toolName);
    if (normalizedToolName === TAVERN_TASK_TOOL_NAMES.INSPECT) {
        const status = String(args.status || '').trim();
        const includeCompleted = status === 'completed' || status === 'all' || status === '';
        const eventId = getPatchEventId(args);
        const tasks = await listTavernTasks(id, { includeCompleted });
        const visible = tasks
            .filter((task) => task.status === 'active' || task.status === 'completed')
            .filter((task) => !eventId || task.id === eventId)
            .filter((task) => !status || status === 'all' || task.status === status)
            .sort((left, right) => {
                if (left.status !== right.status) {return left.status === 'active' ? -1 : 1;}
                return Number(right.updatedOrder) - Number(left.updatedOrder) || Number(right.updatedAt) - Number(left.updatedAt);
            });
        const limit = Math.max(1, Math.min(50, Math.floor(Number(args.limit) || 20)));
        const offset = Math.max(0, Math.floor(Number(args.offset) || 0));
        const page = visible.slice(offset, offset + limit);
        return {
            ok: true,
            summary: `找到 ${visible.length} 条野望，返回 ${page.length} 条。`,
            changed: false,
            events: page.map(summarizeTask),
            warnings: visible.length > page.length ? ['event_inspect_truncated'] : [],
        };
    }
    if (normalizedToolName !== TAVERN_TASK_TOOL_NAMES.PATCH) {
        return { ok: false, summary: `未知事件工具：${toolName}`, changed: false, error: 'task_tool_unknown' };
    }
    const op = normalizeEventPatchOp(args.op);
    const order = normalizeOrder(options.sourceAssistantOrder, normalizeOrder(args.order, -1));
    if (!['upsert-vision', 'complete-vision', 'abandon-vision'].includes(op)) {
        return { ok: false, summary: 'EventPatch op 只能是 upsert-vision、complete-vision、abandon-vision。', changed: false, error: 'task_op_invalid' };
    }
    if (op === 'upsert-vision') {
        const directExisting = await findTaskForPatch(id, args);
        const vision = normalizeText(args.vision ?? directExisting?.vision, 500);
        const doneWhen = normalizeText(args.doneWhen ?? directExisting?.doneWhen, 500);
        const title = args.title !== undefined
            ? normalizeEventTitle(args.title)
            : directExisting ? deriveTaskTitle(directExisting) : options.caller ? '' : normalizeEventTitle(vision).slice(0, 8);
        const hookForModel = normalizeText(args.hookForModel ?? directExisting?.hookForModel, 500);
        if (!title || !vision || !doneWhen || !hookForModel) {
            return { ok: false, summary: 'upsert-vision 需要 title、vision、doneWhen、hookForModel。', changed: false, error: 'task_fields_required' };
        }
        const titleError = validateEventTitle(title);
        if (titleError) {
            return {
                ok: false,
                summary: titleError === 'task_title_too_short' ? 'title 需要至少 2 个字。' : 'title 不能超过 12 个字。',
                changed: false,
                error: titleError,
            };
        }
        if (hasTaskHookMetaWords(hookForModel)) {
            return { ok: false, summary: 'hookForModel 必须是无元叙事词的软句。', changed: false, error: 'task_hook_meta_words' };
        }
        const candidateFingerprint = buildEventFingerprint(title, vision);
        const abandoned = await getAbandonedTaskFingerprints(id);
        if (abandoned.includes(candidateFingerprint)) {
            return { ok: false, summary: '这个野望已经被放弃过，本轮不再重建。', changed: false, error: 'task_fingerprint_abandoned' };
        }
        const existing = directExisting || await findTaskByFingerprint(id, candidateFingerprint);
        if (existing?.status === 'abandoned') {
            return { ok: false, summary: '这个野望已经被放弃过，本轮不再重建。', changed: false, error: 'task_fingerprint_abandoned' };
        }
        if (existing?.status === 'completed') {
            return { ok: false, summary: '这个野望已经完成过，本轮不再重建。', changed: false, error: 'task_fingerprint_completed' };
        }
        const taskId = getPatchEventId(args) || existing?.id || createId('quest-event');
        const isNew = !existing;
        if (options.caller === 'auto' && isNew && order < TAVERN_TASK_MIN_GENERATION_FLOOR) {
            return { ok: false, summary: `第 ${TAVERN_TASK_MIN_GENERATION_FLOOR} 楼前不创建野望。`, changed: false, error: 'task_floor_too_early' };
        }
        if (options.caller === 'auto' && isNew) {
            const activeCount = (await listTavernTasks(id)).filter((task) => task.status === 'active').length;
            if (activeCount > TAVERN_TASK_AUTO_CREATE_MAX_ACTIVE) {
                return { ok: false, summary: `自动新建仅允许 active 池有 ${TAVERN_TASK_AUTO_CREATE_MAX_ACTIVE} 条或以下时创建新野望，当前已有 ${activeCount} 条。`, changed: false, error: 'task_auto_create_pool_busy' };
            }
        }
        if (isNew) {
            const activeCount = (await listTavernTasks(id)).filter((task) => task.status === 'active').length;
            if (activeCount >= TAVERN_TASK_MAX_ACTIVE) {
                return { ok: false, summary: `野望调色盘已满（最多 ${TAVERN_TASK_MAX_ACTIVE} 条 active）。`, changed: false, error: 'task_active_pool_full' };
            }
        }
        const task = await runTaskMutation(id, options, async () => {
            const timestamp = now();
            const record: TavernTaskRecord = {
                id: taskId,
                sessionId: id,
                status: 'active',
                title,
                vision,
                doneWhen,
                hookForModel,
                fingerprint: existing?.fingerprint || candidateFingerprint,
                createdOrder: isNew ? order : normalizeOrder(existing.createdOrder, order),
                updatedOrder: order,
                sourceManagerRunId: String(options.managerRunId || existing?.sourceManagerRunId || ''),
                createdAt: isNew ? timestamp : Number(existing.createdAt) || timestamp,
                updatedAt: timestamp,
            };
            await tavernTasksTable.put(record);
            return record;
        });
        return { ok: true, summary: `${isNew ? '已创建' : '已更新'}野望：${deriveTaskTitle(task)}`, changed: true, eventId: task.id, op, events: [summarizeTask(task)] };
    }
    const existing = await findTaskForPatch(id, args);
    if (!existing) {
        return { ok: false, summary: '找不到要更新的野望。', changed: false, error: 'task_not_found' };
    }
    if (op === 'complete-vision') {
        const task = await runTaskMutation(id, options, async () => {
            const updated: TavernTaskRecord = {
                ...existing,
                status: 'completed',
                updatedOrder: order,
                completedOrder: order,
                updatedAt: now(),
            };
            await tavernTasksTable.put(updated);
            return updated;
        });
        return { ok: true, summary: `已完成野望：${deriveTaskTitle(task)}`, changed: true, eventId: task.id, op, events: [summarizeTask(task)] };
    }
    const task = await runTaskMutation(id, options, async () => {
        const updated: TavernTaskRecord = {
            ...existing,
            status: 'abandoned',
            updatedOrder: order,
            abandonedOrder: order,
            updatedAt: now(),
        };
        await tavernTasksTable.put(updated);
        await rememberAbandonedFingerprint(id, updated.fingerprint);
        return updated;
    });
    return { ok: true, summary: `已放弃野望：${deriveTaskTitle(task)}`, changed: true, eventId: task.id, op, events: [summarizeTask(task)] };
}

export async function abandonStaleTavernTasks(sessionId = '', assistantOrder = -1, options: {
    threshold?: number;
    managerRunId?: string;
    beforeWriteGuard?: () => Promise<void> | void;
    afterWriteObserver?: () => Promise<void> | void;
} = {}): Promise<TavernTaskRecord[]> {
    const id = String(sessionId || '').trim();
    const order = normalizeOrder(assistantOrder, -1);
    if (!id || order < 0) {return [];}
    const threshold = Math.max(1, Math.floor(Number(options.threshold) || TAVERN_TASK_STALE_FLOOR_THRESHOLD));
    const tasks = await listTavernTasks(id);
    const stale = tasks.filter((task) => task.status === 'active'
        && order - normalizeOrder(task.updatedOrder, task.createdOrder) > threshold);
    if (!stale.length) {return [];}
    return await runTaskMutation(id, {
        managerRunId: options.managerRunId,
        sourceAssistantOrder: order,
        beforeWriteGuard: options.beforeWriteGuard,
        afterWriteObserver: options.afterWriteObserver,
    }, async () => {
        const abandoned: TavernTaskRecord[] = [];
        for (const task of stale) {
            const updated: TavernTaskRecord = {
                ...task,
                status: 'abandoned',
                updatedOrder: order,
                abandonedOrder: order,
                updatedAt: now(),
            };
            await tavernTasksTable.put(updated);
            await rememberAbandonedFingerprint(id, updated.fingerprint);
            abandoned.push(updated);
        }
        return abandoned;
    });
}

export async function getLatestQuestHooksForPrompt(sessionId = '', limit = 1): Promise<string[]> {
    const id = String(sessionId || '').trim();
    if (!id) {return [];}
    const tasks = await listTavernTasks(id);
    return tasks
        .filter((task) => task.status === 'active')
        .sort((left, right) => Number(right.updatedOrder) - Number(left.updatedOrder) || Number(right.updatedAt) - Number(left.updatedAt))
        .map((task) => normalizeText(task.hookForModel, 500))
        .filter((hook) => !hasTaskHookMetaWords(hook))
        .filter(Boolean)
        .slice(0, Math.max(1, Math.min(3, Math.floor(Number(limit) || 1))));
}

export async function buildTavernTaskPoolPromptBlock(sessionId = ''): Promise<string> {
    const id = String(sessionId || '').trim();
    if (!id) {return '[Current Ambition Palette]\nNo session.';}
    const tasks = await listTavernTasks(id, { includeCompleted: true });
    const active = tasks.filter((task) => task.status === 'active');
    const completed = tasks.filter((task) => task.status === 'completed').slice(0, 5);
    const lines = [
        '[Current Ambition Palette]',
        `Active count: ${active.length}/${TAVERN_TASK_MAX_ACTIVE}`,
        active.length ? 'Active ambitions:' : 'Active ambitions: none.',
        ...active.map((task) => [
            `- id: ${task.id}`,
            `  title: ${deriveTaskTitle(task)}`,
            `  vision: ${task.vision}`,
            `  done when: ${task.doneWhen}`,
            `  updated floor: ${task.updatedOrder}`,
        ].join('\n')),
        completed.length ? 'Recently completed:' : '',
        ...completed.map((task) => `- id: ${task.id}; title: ${deriveTaskTitle(task)}; vision: ${task.vision}; done when: ${task.doneWhen}; completed floor: ${task.completedOrder ?? task.updatedOrder}`),
        'Abandoned ambitions are hidden.',
    ].filter(Boolean);
    return lines.join('\n');
}

export function getTavernTaskToolDefinitions(): Array<{ type: 'function'; function: { name: string; description: string; parameters: unknown } }> {
    return [
        {
            type: 'function',
            function: {
                name: TAVERN_TASK_TOOL_NAMES.INSPECT,
                description: [
                    'Inspect the current RP session ambition palette.',
                    'Returns active and recently completed ambitions only. Abandoned ambitions are not shown.',
                    'Use before EventPatch when you need to add, complete, abandon, or decide whether the active pool is low.',
                    'This is not memory and not a map.',
                ].join('\n'),
                parameters: {
                    type: 'object',
                    properties: {
                        status: { type: 'string', enum: ['active', 'completed', 'all'], description: 'Optional status filter. Default returns active plus recently completed.' },
                        eventId: { type: 'string', description: 'Optional vision id filter.' },
                        id: { type: 'string', description: 'Alias for eventId.' },
                        offset: { type: 'number', description: 'Pagination offset. Default 0.' },
                        limit: { type: 'number', description: 'Maximum ambitions to return. Default 20, max 50.' },
                    },
                    additionalProperties: false,
                },
            },
        },
        {
            type: 'function',
            function: {
                name: TAVERN_TASK_TOOL_NAMES.PATCH,
                description: [
                    'Maintain the current RP session ambition palette: grand goals the player could choose to chase.',
                    'Allowed ops: upsert-vision, complete-vision, abandon-vision.',
                    `Auto managers may create new ambitions only at floor ${TAVERN_TASK_MIN_GENERATION_FLOOR} or later, and only when active count is ${TAVERN_TASK_AUTO_CREATE_MAX_ACTIVE} or lower. Active pool max is ${TAVERN_TASK_MAX_ACTIVE}. Earlier auto upserts fail with task_floor_too_early.`,
                    'New upsert-vision requires title, vision, doneWhen, and hookForModel. The tool generates its duplicate guard internally.',
                    'title: short single-line UI title. Aim for 2-8 characters; hard limit 12.',
                    'vision: the wild ambition/endgame the player would want to chase; must read as something they crave, not a task.',
                    'doneWhen: concrete observable story event that marks this vision as reached, not an abstract state.',
                    'hookForModel: one soft in-world sentence for RP injection; no meta planning words such as quest, task, goal, objective, completed, 任务, 目标, 完成.',
                    'Examples:',
                    '{"op":"upsert-vision","title":"骑上族长","vision":"把当年把你踩进泥里的族长，亲手拉下位子，让他跪着看你坐上那把椅子。","doneWhen":"族长当众垮台，角色取而代之。","hookForModel":"族长最近夜里总一个人待在祠堂，像在藏什么。"}',
                    '{"op":"upsert-vision","title":"带她私奔","vision":"抢在婚礼前，把被许配给别人的她从那座宅子里带走，头也不回。","doneWhen":"角色与她一同逃离，婚事告吹。","hookForModel":"她今天塞给你的纸条上只有一个字：\'救\'。"}',
                    '{"op":"complete-vision","eventId":"quest-event-1"}',
                ].join('\n'),
                parameters: {
                    type: 'object',
                    properties: {
                        op: { type: 'string', enum: ['upsert-vision', 'complete-vision', 'abandon-vision'] },
                        eventId: { type: 'string', description: 'Existing vision id. Required for complete/abandon. Optional for upsert.' },
                        id: { type: 'string', description: 'Alias for eventId.' },
                        title: { type: 'string', description: 'Short single-line vision title. Aim for 2-8 characters; hard limit 12. Required for new upsert-vision.' },
                        vision: { type: 'string', description: 'The grand distant goal the player would want to chase; something they crave, not a task. Required for new upsert-vision.' },
                        doneWhen: { type: 'string', description: 'Objective completion condition, written as a concrete observable event in the story, not an abstract state.' },
                        hookForModel: { type: 'string', description: 'Soft in-world prompt sentence for RP injection; no meta planning language.' },
                    },
                    required: ['op'],
                    additionalProperties: false,
                },
            },
        },
    ];
}
