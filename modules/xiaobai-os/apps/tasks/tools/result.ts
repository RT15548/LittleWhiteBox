export type TaskToolStatus = 'updated' | 'unchanged' | 'failed';

export type TaskToolReason =
    | 'arguments_must_be_object'
    | 'unsupported_fields'
    | 'task_id_required'
    | 'task_not_in_session'
    | 'revision_invalid'
    | 'revision_conflict'
    | 'summary_required'
    | 'summary_too_long'
    | 'task_not_active';

export interface TaskToolIssue {
    readonly code: TaskToolReason;
    readonly path: string;
    readonly message: string;
    readonly expected?: unknown;
}

export interface TaskToolItemReport {
    readonly collection: 'tasks';
    readonly index: number;
    readonly id: string;
    readonly changed?: boolean;
    readonly reason?: TaskToolReason;
    readonly hint?: string;
    readonly issues?: readonly TaskToolIssue[];
}

export interface TaskToolResult {
    readonly ok: boolean;
    readonly status: TaskToolStatus;
    readonly changed: boolean;
    readonly applied: readonly TaskToolItemReport[];
    readonly skipped: readonly TaskToolItemReport[];
    readonly warnings: readonly string[];
    readonly hint?: string;
}

const HINTS: Readonly<Record<TaskToolReason, string>> = Object.freeze({
    arguments_must_be_object: 'Pass one plain JSON object.',
    unsupported_fields: 'Remove fields not declared by this tool.',
    task_id_required: 'Use an exact non-empty taskId from the active-task data.',
    task_not_in_session: 'Use only a taskId included in this maintenance session.',
    revision_invalid: 'Use a positive safe integer revision.',
    revision_conflict: 'Use the exact revision shown for this task.',
    summary_required: 'Provide a non-empty objective-only summary.',
    summary_too_long: 'Shorten the summary to the declared maximum length.',
    task_not_active: 'Only active tasks can be maintained.',
});

export function taskToolIssue(code: TaskToolReason, path: string, expected?: unknown): TaskToolIssue {
    return { code, path, message: HINTS[code], ...(expected === undefined ? {} : { expected }) };
}

export function failedTaskToolResult(reason: TaskToolReason, taskId = '', issues: readonly TaskToolIssue[] = []): TaskToolResult {
    const hint = HINTS[reason];
    return Object.freeze({
        ok: false,
        status: 'failed',
        changed: false,
        applied: [],
        skipped: [{ collection: 'tasks' as const, index: taskId ? 0 : -1, id: taskId, reason, hint, issues }],
        warnings: [],
        hint,
    });
}

export function appliedTaskToolResult(taskId: string, changed: boolean): TaskToolResult {
    return Object.freeze({
        ok: true,
        status: changed ? 'updated' : 'unchanged',
        changed,
        applied: [{ collection: 'tasks' as const, index: 0, id: taskId, changed }],
        skipped: [],
        warnings: [],
    });
}
