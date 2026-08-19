import { applyTavernTaskStagedAction } from './task-service';
import {
    TAVERN_TASK_PROGRESS_SUMMARY_MAX_LENGTH,
    TavernTaskError,
    type TavernTaskStagingContext,
    type TavernTaskStatus,
} from './task-types';

export { createTavernTaskStagingContext } from './task-service';

export const TAVERN_TASK_TOOL_NAMES = {
    PROGRESS: 'TaskProgress',
    COMPLETE: 'TaskComplete',
    FAIL: 'TaskFail',
} as const;

export type TavernTaskToolName = typeof TAVERN_TASK_TOOL_NAMES[keyof typeof TAVERN_TASK_TOOL_NAMES];

export interface TavernTaskToolResult {
    ok: boolean;
    summary: string;
    changed: boolean;
    taskId?: string;
    revision?: number;
    status?: TavernTaskStatus;
    error?: string;
}

export interface TavernTaskToolOptions {
    caller?: 'auto' | 'chat';
    stagingContext: TavernTaskStagingContext;
    actionId: string;
}

export function getTavernTaskToolDefinitions(): Array<{
    type: 'function';
    function: { name: TavernTaskToolName; description: string; parameters: unknown };
}> {
    const identityProperties = {
        taskId: { type: 'string', description: 'Existing formal task id from the current task context.' },
        revision: { type: 'integer', minimum: 1, description: 'Current task revision shown in context. Used for CAS.' },
    };
    return [
        {
            type: 'function',
            function: {
                name: TAVERN_TASK_TOOL_NAMES.PROGRESS,
                description: [
                    'Record a material change toward the exact objective of an existing active task, only when it is not yet complete or failed.',
                    'Player-assigned tasks require real story evidence. A player-issued task assigned to a world NPC may instead advance conservatively from elapsed floors, assignee capability/risk, current world state, and prior progress.',
                    'The objective is the one and only goal. Requirements only constrain execution. Do not add subgoals from the hook, risk, prior progress, unresolved side facts, or dramatic possibilities.',
                    'progressSummary replaces the prior note. Compress it to cumulative objective-only state: only confirmed facts directly relevant to the objective and its exact remaining gap. Never recap the turn, dialogue, emotions, relationship movement, side plots, or speculation.',
                    'Do not create tasks, accept listings, recruit candidates, or move money.',
                    'Do not treat the player merely claiming completion as sufficient evidence.',
                ].join('\n'),
                parameters: {
                    type: 'object',
                    properties: {
                        ...identityProperties,
                        progressSummary: {
                            type: 'string',
                            maxLength: TAVERN_TASK_PROGRESS_SUMMARY_MAX_LENGTH,
                            description: 'At most 120 Unicode code points. Cumulative objective-only state, not a turn summary: only confirmed facts directly relevant to the objective and its exact remaining gap.',
                        },
                    },
                    required: ['taskId', 'revision', 'progressSummary'],
                    additionalProperties: false,
                },
            },
        },
        {
            type: 'function',
            function: {
                name: TAVERN_TASK_TOOL_NAMES.COMPLETE,
                description: [
                    'Complete an existing active task only when its objective is credibly achieved.',
                    'Player-assigned tasks require story evidence. A player-issued task assigned to a world NPC may complete from conservative off-screen progression only when elapsed floors, capability/risk, world state, and prior progress support a terminal outcome.',
                    'The objective is the one and only completion target. Requirements only constrain execution. Do not invent another goal or completion condition from the hook, risk, prior progress, or other unanswered facts.',
                    'A character providing the fact requested by the objective is evidence; a bare claim that the task is “done” is not. Once accepted evidence credibly confirms the objective, complete it instead of adding drama with TaskProgress.',
                    'Settlement is limited to the task escrow; this tool cannot spend the player wallet or create a task.',
                ].join('\n'),
                parameters: {
                    type: 'object',
                    properties: {
                        ...identityProperties,
                        resultSummary: { type: 'string', description: 'Concrete outcome and evidence that satisfied the objective.' },
                    },
                    required: ['taskId', 'revision', 'resultSummary'],
                    additionalProperties: false,
                },
            },
        },
        {
            type: 'function',
            function: {
                name: TAVERN_TASK_TOOL_NAMES.FAIL,
                description: [
                    'Fail an existing active task only when an irreversible failure or expiry is credible.',
                    'Player-assigned tasks require story evidence. A player-issued task assigned to a world NPC may fail from conservative off-screen progression when elapsed floors, capability/risk, world state, and prior progress support it.',
                    'Failure returns escrow to its original funding source; this tool cannot create tasks or spend new player funds.',
                ].join('\n'),
                parameters: {
                    type: 'object',
                    properties: {
                        ...identityProperties,
                        resultSummary: { type: 'string', description: 'Concrete failure outcome and the evidence that made it terminal.' },
                    },
                    required: ['taskId', 'revision', 'resultSummary'],
                    additionalProperties: false,
                },
            },
        },
    ];
}

export function isTavernTaskToolName(value = ''): value is TavernTaskToolName {
    return Object.values(TAVERN_TASK_TOOL_NAMES).includes(String(value || '').trim() as TavernTaskToolName);
}

export async function executeTavernTaskTool(
    toolName = '',
    args: Record<string, unknown> = {},
    options: TavernTaskToolOptions,
): Promise<TavernTaskToolResult> {
    const name = String(toolName || '').trim();
    if (!isTavernTaskToolName(name)) {
        return { ok: false, changed: false, summary: `${name || 'Task tool'} 不可用。`, error: 'task_tool_not_available' };
    }
    if (options?.caller !== 'auto') {
        return { ok: false, changed: false, summary: '任务写工具只允许自动维护使用。', error: 'task_tool_not_allowed' };
    }
    const actionId = String(options.actionId || '').trim();
    if (!actionId) {
        return { ok: false, changed: false, summary: '缺少任务 actionId。', error: 'task_action_required' };
    }
    const taskId = String(args.taskId || '').trim();
    const expectedRevision = Number(args.revision ?? args.expectedRevision);
    try {
        const kind = name === TAVERN_TASK_TOOL_NAMES.PROGRESS
            ? 'progress'
            : name === TAVERN_TASK_TOOL_NAMES.COMPLETE
                ? 'complete'
                : 'fail';
        const result = applyTavernTaskStagedAction(options.stagingContext, {
            actionId,
            taskId,
            expectedRevision,
            kind,
            anchorOrder: options.stagingContext.anchorOrder,
            ...(kind === 'progress'
                ? { progressSummary: String(args.progressSummary ?? args.summary ?? '') }
                : { resultSummary: String(args.resultSummary ?? args.summary ?? '') }),
        });
        return {
            ok: true,
            changed: result.changed,
            taskId: result.version.taskId,
            revision: result.version.revision,
            status: result.version.status,
            summary: result.changed
                ? `${result.version.title} 的任务状态已更新。`
                : `${result.version.title} 没有新的任务变化。`,
        };
    } catch (error) {
        const code = error instanceof TavernTaskError ? error.code : 'task_tool_failed';
        return {
            ok: false,
            changed: false,
            taskId: taskId || undefined,
            summary: `任务工具失败：${code}`,
            error: code,
        };
    }
}
