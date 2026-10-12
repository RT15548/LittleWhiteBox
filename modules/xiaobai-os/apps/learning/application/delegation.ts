import type { LearningSelection } from '../../../domains/learning/notes.js';
import type { LearningAttemptBasis } from './attempt.js';
import type { LearningSubmissionReceipts } from './tool-execution.js';
import type { LearningTeachingResult } from './teaching.js';
import { createLearningId } from './identity.js';
import type { LearningScope } from '../../../domains/learning/types.js';

export const LEARNING_DELEGATION_LIMITS = { task: 4000, context: 4000, deliverable: 2000 } as const;
export interface LearningDelegation {
    task: string;
    context?: string;
    deliverable?: string;
}
export type LearningRequestResult = { ok: true; status: 'accepted'; taskId: string } | { ok: false; status: 'busy' | 'cancelled' };
export type LearningDelegationReceipts = Map<string, Extract<LearningRequestResult, { status: 'accepted' }>>;
export type LearningTaskSummary = Pick<ReturnType<typeof learningTaskView>, 'taskId' | 'task' | 'status' | 'notification'>;
export interface LearningWorkbenchActivity { busy: boolean; tasks: LearningTaskSummary[] }
/** The selected object, advanced only by this task's confirmed edits. */
export interface LearningWorkTarget {
    unitKey: 'unit' | 'review';
    unitId?: string;
    exerciseId?: string;
    selection?: LearningSelection | null;
}
/** Agent instructions and original learner evidence have different owners. */
export interface LearningWorkRequest {
    delegation: LearningDelegation;
    message: string;
    target: LearningWorkTarget;
    scope: LearningScope;
    references: string[];
    answerBasis: LearningAttemptBasis;
    submissions: LearningSubmissionReceipts;
}

export interface LearningTaskResult {
    taskId: string;
    delegation: LearningDelegation;
    result: LearningTeachingResult;
    target: LearningWorkTarget;
}
export interface LearningDelegatedTask {
    id: string;
    owner: string;
    request: LearningWorkRequest;
    result: LearningTeachingResult | null;
    notification: 'pending' | 'delivering' | 'delivered' | 'failed';
    notificationAttempt: number;
    workAttempt: number;
    notificationError: string;
}

/** Current learning-session work only. Closing/changing the classroom retires the book. */
export function createLearningTaskBook() {
    const tasks = new Map<string, LearningDelegatedTask>();
    return {
        create(owner: string, request: LearningWorkRequest) {
            const task: LearningDelegatedTask = { id: createLearningId(), owner,
                request: { ...structuredClone(request), submissions: request.submissions },
                result: null, notification: 'pending', notificationAttempt: 0, workAttempt: 0, notificationError: '' };
            tasks.set(task.id, task);
            return task;
        },
        get: (id: string) => tasks.get(id),
        forOwner: (owner: string) => [...tasks.values()].filter(task => task.owner === owner),
        clear: () => tasks.clear(),
    };
}

export function learningTaskResult(task: LearningDelegatedTask): LearningTaskResult {
    if (!task.result) { throw new Error('learning_task_running'); }
    return structuredClone({ taskId: task.id, delegation: task.request.delegation, target: task.request.target, result: task.result });
}

export function learningTaskView(task: LearningDelegatedTask, awaitingApproval = false) {
    return { taskId: task.id, ...task.request.delegation, target: structuredClone(task.request.target),
        status: task.result?.status ?? (awaitingApproval ? 'awaiting-approval' : 'running'),
        result: task.result ? structuredClone(task.result) : null,
        notification: task.result ? task.notification : null, notificationError: task.notificationError };
}
