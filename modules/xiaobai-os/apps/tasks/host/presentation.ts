import type { MaintenanceStatus } from '../../../capabilities/maintenance/runner.js';
import type { TaskEvent, TaskRecord } from '../../../domains/tasks/types.js';
import type { TasksServiceView } from '../application/service.js';
import type {
    TaskDetailPresentation,
    TaskHistoryPage,
    TasksClientStatus,
    TasksGenerationState,
    TasksPresentation,
    TasksSettings,
} from '../types.js';
import { taskMaintenanceMessage } from '../feedback.js';

export const TASK_HISTORY_PAGE_SIZE = 20;

function compareRecent(left: TaskRecord, right: TaskRecord): number {
    return right.updatedAt - left.updatedAt || right.taskId.localeCompare(left.taskId);
}

function cursorFor(record: TaskRecord): string {
    return `${record.updatedAt}:${encodeURIComponent(record.taskId)}`;
}

function parseCursor(cursor: string): { updatedAt: number; taskId: string } | null {
    const separator = cursor.indexOf(':');
    if (separator < 1) {return null;}
    const updatedAt = Number(cursor.slice(0, separator));
    try {
        const taskId = decodeURIComponent(cursor.slice(separator + 1));
        return Number.isFinite(updatedAt) && taskId ? { updatedAt, taskId } : null;
    } catch {
        return null;
    }
}

export function presentTaskHistory(
    records: readonly TaskRecord[],
    cursor: string | null = null,
    limit = TASK_HISTORY_PAGE_SIZE,
): TaskHistoryPage {
    const terminal = records
        .filter(record => record.status === 'completed' || record.status === 'failed' || record.status === 'cancelled')
        .sort(compareRecent);
    const boundary = cursor ? parseCursor(cursor) : null;
    if (cursor && !boundary) {throw new Error('tasks_history_cursor_invalid');}
    const start = boundary
        ? terminal.findIndex(record => record.updatedAt === boundary.updatedAt && record.taskId === boundary.taskId) + 1
        : 0;
    if (boundary && start === 0) {throw new Error('tasks_history_cursor_invalid');}
    const size = Number.isSafeInteger(limit) && limit > 0 ? limit : TASK_HISTORY_PAGE_SIZE;
    const items = terminal.slice(start, start + size);
    const hasMore = start + items.length < terminal.length;
    return {
        items: structuredClone(items),
        nextCursor: hasMore && items.length ? cursorFor(items.at(-1) as TaskRecord) : null,
        hasMore,
    };
}

function clientStatus(view: TasksServiceView, economyReady: boolean): { status: TasksClientStatus; message: string } {
    if (view.writeState === 'conflict') {
        return { status: 'conflict', message: '服务器上的存档与当前内容不同，请先使用已保存版本，再修改任务。' };
    }
    if (view.writeState === 'unconfirmed' || (view.pendingSave && view.writeState === 'failed')) {
        return { status: 'unconfirmed', message: view.writeState === 'failed'
            ? '暂时无法确认是否保存成功。新内容还在，请检查连接后再试，不要重新生成。'
            : '还不确定任务是否保存成功。请先检查保存，暂时不能修改任务或操作小白币。' };
    }
    if (view.writeState === 'saving') {return { status: 'saving', message: '正在保存任务和账目…' };}
    if (view.writeState === 'loading') {return { status: 'loading', message: '正在加载任务…' };}
    if (view.writeState === 'failed') {return { status: 'blocked', message: '任务暂时加载不了，请检查连接后重试。' };}
    if (!economyReady) {return { status: 'blocked', message: '钱包还没开通，请重新加载后再试。' };}
    return { status: 'ready', message: '' };
}

export function presentTasksState({
    chatIdentity,
    serviceView,
    settings,
    economyReady,
    generationActive,
    generation,
    maintenanceStatus,
}: {
    chatIdentity: string;
    serviceView: TasksServiceView;
    settings: TasksSettings;
    economyReady: boolean;
    generationActive: boolean;
    generation: TasksGenerationState;
    maintenanceStatus: MaintenanceStatus;
}): TasksPresentation {
    const records = serviceView.records.map(record => structuredClone(record));
    const accepted = new Set(records
        .filter(record => record.sourceBoardId && record.sourceListingId)
        .map(record => `${record.sourceBoardId}\u0000${record.sourceListingId}`));
    const board = serviceView.domain?.board;
    return {
        chatIdentity,
        ...clientStatus(serviceView, economyReady),
        writeState: serviceView.writeState,
        settings: structuredClone(settings),
        playerBalance: serviceView.playerBalance,
        generationActive,
        generation: { ...generation },
        board: board ? {
            boardId: board.boardId,
            generatedAt: board.generatedAt,
            listings: board.listings.map(listing => ({
                ...structuredClone(listing),
                accepted: accepted.has(`${board.boardId}\u0000${listing.listingId}`),
            })),
        } : null,
        active: records.filter(record => record.status === 'active').sort(compareRecent),
        recruiting: records.filter(record => record.status === 'recruiting').sort(compareRecent),
        history: presentTaskHistory(records),
        maintenance: {
            state: maintenanceStatus.state === 'running' ? 'running' : 'idle',
            message: taskMaintenanceMessage(maintenanceStatus, !serviceView.pendingSave && serviceView.writeState === 'ready'),
        },
    };
}

function eventSummary(event: TaskEvent): string {
    if (event.kind === 'accepted') {return '已从任务大厅接取';}
    if (event.kind === 'published') {return '已发布并托管报酬';}
    if (event.kind === 'candidates-replaced') {return `候选名单已更新（${event.candidates.length} 人）`;}
    if (event.kind === 'assigned') {return `${event.assignee.displayName}已接取任务`;}
    if (event.kind === 'cancelled') {return event.resultSummary;}
    if (event.kind === 'progressed') {return event.progressSummary;}
    return event.resultSummary;
}

export function presentTaskDetail(
    serviceView: TasksServiceView,
    taskId: string,
): TaskDetailPresentation {
    const task = serviceView.records.find(record => record.taskId === taskId);
    if (!task || !serviceView.domain) {throw new Error('tasks_task_not_found');}
    return {
        task: structuredClone(task),
        timeline: serviceView.domain.events
            .filter(event => event.taskId === taskId)
            .map(event => ({
                eventId: event.eventId,
                kind: event.kind,
                taskRevision: event.taskRevision,
                createdAt: event.createdAt,
                summary: eventSummary(event),
            })),
    };
}
