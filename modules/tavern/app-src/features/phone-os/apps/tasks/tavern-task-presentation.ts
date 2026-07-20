import type {
    TavernTaskGrade,
    TavernTaskListing,
    TavernTaskStatus,
    TavernTaskVersionRecord,
} from '../../../../../shared/tasks/task-types';

export type TavernTaskDirection = 'received' | 'published';
export type TavernTaskTone = 'recruiting' | 'active' | 'success' | 'danger' | 'muted';

export const TAVERN_TASK_GRADE_ORDER: readonly TavernTaskGrade[] = ['E', 'D', 'C', 'B', 'A', 'S', 'EX'];

export function tavernTaskStatusLabel(status: TavernTaskStatus): string {
    if (status === 'recruiting') {return '招募中';}
    if (status === 'active') {return '进行中';}
    if (status === 'completed') {return '已完成';}
    if (status === 'failed') {return '已失败';}
    return '已撤回';
}

export function tavernTaskStatusTone(status: TavernTaskStatus): TavernTaskTone {
    if (status === 'recruiting') {return 'recruiting';}
    if (status === 'active') {return 'active';}
    if (status === 'completed') {return 'success';}
    if (status === 'failed') {return 'danger';}
    return 'muted';
}

export function tavernTaskDirection(task: TavernTaskVersionRecord): TavernTaskDirection {
    return task.issuer.kind === 'player' ? 'published' : 'received';
}

export function tavernTaskDirectionLabel(task: TavernTaskVersionRecord): string {
    return tavernTaskDirection(task) === 'published' ? '我发布的' : '我接取的';
}

export function tavernTaskCounterparty(task: TavernTaskVersionRecord): string {
    if (tavernTaskDirection(task) === 'published') {
        return task.assignee?.name || '尚未选定执行人';
    }
    return task.issuer.name;
}

export function tavernTaskRewardLabel(reward: number): string {
    return Math.max(0, Math.floor(Number(reward) || 0)).toLocaleString('zh-CN');
}

export function tavernTaskGradeLabel(grade: TavernTaskGrade): string {
    return grade === 'CUSTOM' ? '自定义' : grade;
}

export function tavernTaskTimestampLabel(timestamp: number): string {
    const value = Number(timestamp);
    if (!Number.isFinite(value) || value <= 0) {return '时间未知';}
    return new Intl.DateTimeFormat('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).format(value);
}

export function tavernTaskListingFingerprint(listing: TavernTaskListing): string {
    return `${listing.issuer.name}\u0000${listing.title}\u0000${listing.objective}`;
}

export function sortTavernTasksByRecent(tasks: TavernTaskVersionRecord[]): TavernTaskVersionRecord[] {
    return [...tasks].sort((left, right) => (
        Number(right.updatedAt) - Number(left.updatedAt)
        || right.taskId.localeCompare(left.taskId)
    ));
}
