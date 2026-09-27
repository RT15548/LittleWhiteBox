import {
    MAX_TASK_PROGRESS_SUMMARY_LENGTH,
    MAX_TASK_RESULT_SUMMARY_LENGTH,
    normalizeTaskIdentity,
    normalizeTaskProgressSummary,
    normalizeTaskResultSummary,
} from '../../../domains/tasks/invariants.js';
import type { TaskRecord } from '../../../domains/tasks/types.js';
import type { TaskMaintenanceCommand } from '../application/service.js';
import { appliedTaskToolResult, failedTaskToolResult, taskToolIssue, type TaskToolIssue, type TaskToolResult } from './result.js';
import { TASK_MAINTENANCE_TOOL_NAMES, TASK_MAINTENANCE_TOOLS } from './tool-contract.js';
import { collectToolInputIssues } from '../../../../agent-core/runtime/tool-input-validation.js';

type UnknownRecord = Record<string, unknown>;

export interface TaskCommandCompileContext {
    readonly records: ReadonlyMap<string, TaskRecord>;
    readonly staged: ReadonlyMap<string, TaskMaintenanceCommand>;
    readonly createActionId: () => string;
}

export interface TaskCommandCompileResult {
    readonly result: TaskToolResult;
    readonly command?: TaskMaintenanceCommand;
    readonly taskId?: string;
    readonly clearStaged?: boolean;
}

function isPlainRecord(value: unknown): value is UnknownRecord {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {return false;}
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
}

function summaryLimit(name: 'progressSummary' | 'resultSummary'): number {
    return name === 'progressSummary' ? MAX_TASK_PROGRESS_SUMMARY_LENGTH : MAX_TASK_RESULT_SUMMARY_LENGTH;
}

function normalizeSummary(value: unknown, name: 'progressSummary' | 'resultSummary'): string | null {
    if (typeof value !== 'string') {return null;}
    const normalized = value
        .normalize('NFKC')
        .replace(/\r\n?|\u2028|\u2029/gu, '\n')
        .replace(/[\u0000-\u0009\u000b-\u001f\u007f-\u009f]/gu, ' ')
        .trim();
    if (!normalized) {return null;}
    if (Array.from(normalized).length > summaryLimit(name)) {throw new RangeError('summary_too_long');}
    return name === 'progressSummary'
        ? normalizeTaskProgressSummary(normalized)
        : normalizeTaskResultSummary(normalized);
}

function sameCommand(left: TaskMaintenanceCommand, right: TaskMaintenanceCommand): boolean {
    if (left.kind !== right.kind || left.taskId !== right.taskId
        || left.expectedTaskRevision !== right.expectedTaskRevision
        || left.expectedEventId !== right.expectedEventId) {return false;}
    if (left.kind === 'progress' && right.kind === 'progress') {
        return left.progressSummary === right.progressSummary;
    }
    return left.kind !== 'progress' && right.kind !== 'progress'
        && left.resultSummary === right.resultSummary;
}

export function compileTaskMaintenanceCommand(
    toolName: string,
    args: unknown,
    context: TaskCommandCompileContext,
): TaskCommandCompileResult {
    if (!isPlainRecord(args)) {return { result: failedTaskToolResult('arguments_must_be_object') };}
    const summaryName = toolName === TASK_MAINTENANCE_TOOL_NAMES.PROGRESS
        ? 'progressSummary'
        : toolName === TASK_MAINTENANCE_TOOL_NAMES.COMPLETE || toolName === TASK_MAINTENANCE_TOOL_NAMES.FAIL
            ? 'resultSummary'
            : null;
    if (!summaryName) {throw new TypeError(`Unknown Tasks maintenance tool: ${toolName}`);}

    const schema = TASK_MAINTENANCE_TOOLS.find(tool => tool.function.name === toolName)!.function.parameters;
    const issues: TaskToolIssue[] = collectToolInputIssues(args, schema).map(issue => taskToolIssue(
        issue.code === 'unknown_field' ? 'unsupported_fields'
            : issue.path === 'taskId' ? 'task_id_required'
                : issue.path === 'revision' ? 'revision_invalid'
                    : typeof args[summaryName] === 'string' && [...args[summaryName] as string].length > summaryLimit(summaryName)
                        ? 'summary_too_long' : 'summary_required', issue.path, issue.expected));
    let taskId = '';
    if (!issues.some(issue => issue.path === 'taskId')) {
        try {taskId = normalizeTaskIdentity(args.taskId);} catch { issues.push(taskToolIssue('task_id_required', 'taskId')); }
    }
    const record = context.records.get(taskId);
    if (taskId && !record) { issues.push(taskToolIssue('task_not_in_session', 'taskId', [...context.records.keys()])); }
    if (record && !issues.some(issue => issue.path === 'revision') && args.revision !== record.taskRevision) {
        issues.push(taskToolIssue('revision_conflict', 'revision', record.taskRevision));
    }
    if (record && record.status !== 'active') { issues.push(taskToolIssue('task_not_active', 'taskId')); }
    let summary: string | null = null;
    if (!issues.some(issue => issue.path === summaryName)) {
        try {summary = normalizeSummary(args[summaryName], summaryName);} catch {
            issues.push(taskToolIssue('summary_too_long', summaryName, { maxLength: summaryLimit(summaryName) }));
        }
        if (!summary && !issues.some(issue => issue.path === summaryName)) { issues.push(taskToolIssue('summary_required', summaryName)); }
    }
    if (issues.length) { return { taskId, result: failedTaskToolResult(issues[0].code, taskId, issues) }; }
    if (!record || !summary) {
        throw new Error('tasks_validated_input_missing');
    }

    const common = {
        actionId: '',
        taskId,
        expectedTaskRevision: record.taskRevision,
        expectedEventId: record.eventId,
    };
    const draft: TaskMaintenanceCommand = toolName === TASK_MAINTENANCE_TOOL_NAMES.PROGRESS
        ? { ...common, kind: 'progress', progressSummary: summary }
        : toolName === TASK_MAINTENANCE_TOOL_NAMES.COMPLETE
            ? { ...common, kind: 'complete', resultSummary: summary }
            : { ...common, kind: 'fail', resultSummary: summary };
    const existing = context.staged.get(taskId);
    if (existing && sameCommand(existing, draft)) { return { taskId, result: appliedTaskToolResult(taskId, false) }; }
    if (draft.kind === 'progress' && draft.progressSummary === record.progressSummary) {
        return { taskId, clearStaged: true, result: appliedTaskToolResult(taskId, !!existing) };
    }
    return {
        taskId,
        command: { ...draft, actionId: existing?.actionId ?? context.createActionId() },
        result: appliedTaskToolResult(taskId, true),
    };
}
