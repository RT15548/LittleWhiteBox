import {
    MAX_TASK_PROGRESS_SUMMARY_LENGTH,
    MAX_TASK_RESULT_SUMMARY_LENGTH,
    TASK_MAX_ID_LENGTH,
} from '../../../domains/tasks/invariants.js';
import type { MaintenanceFunctionDeclaration } from '../../../capabilities/maintenance/registry.js';

export const TASK_MAINTENANCE_TOOL_NAMES = Object.freeze({
    PROGRESS: 'TaskProgress',
    COMPLETE: 'TaskComplete',
    FAIL: 'TaskFail',
} as const);

const IDENTITY_PROPERTIES = Object.freeze({
    taskId: {
        type: 'string',
        minLength: 1,
        maxLength: TASK_MAX_ID_LENGTH,
        description: 'Exact taskId of an active task in the supplied records.',
    },
    revision: {
        type: 'integer',
        minimum: 1,
        maximum: Number.MAX_SAFE_INTEGER,
        description: 'Exact current revision from this task’s supplied record.',
    },
});

function tool(
    name: string,
    description: string,
    summaryName: 'progressSummary' | 'resultSummary',
    summaryDescription: string,
    maximum: number,
    saveDescription: string,
): MaintenanceFunctionDeclaration {
    return Object.freeze({
        type: 'function' as const,
        function: {
            name,
            description: [
                description,
                saveDescription,
                'Task reports in applied and skipped identify the record by collection, index and id. They include changed when applied, or reason, hint and issues:[{code,path,message,expected?}] when skipped; warnings lists additional notices. Correct the independent issues together. A rejected call leaves earlier successful changes untouched.',
            ].join('\n'),
            parameters: {
                type: 'object',
                properties: {
                    ...IDENTITY_PROPERTIES,
                    [summaryName]: {
                        type: 'string',
                        minLength: 1,
                        maxLength: maximum,
                        description: `${summaryDescription} Maximum ${maximum} Unicode code points.`,
                    },
                },
                required: ['taskId', 'revision', summaryName],
                additionalProperties: false,
            },
        },
    });
}

export function taskTools(saveDescription: string): readonly MaintenanceFunctionDeclaration[] { return Object.freeze([
    tool(
        TASK_MAINTENANCE_TOOL_NAMES.PROGRESS,
        'Record changed facts for a task that remains active.',
        'progressSummary',
        'Full replacement for the previous progressSummary.',
        MAX_TASK_PROGRESS_SUMMARY_LENGTH,
        saveDescription,
    ),
    tool(
        TASK_MAINTENANCE_TOOL_NAMES.COMPLETE,
        'Complete an active task. The app settles its existing reward when the change is saved.',
        'resultSummary',
        'Result summary explaining why the task is being completed.',
        MAX_TASK_RESULT_SUMMARY_LENGTH,
        saveDescription,
    ),
    tool(
        TASK_MAINTENANCE_TOOL_NAMES.FAIL,
        'Fail an active task. The app refunds its existing escrow when the change is saved.',
        'resultSummary',
        'Result summary explaining why the task is being marked failed.',
        MAX_TASK_RESULT_SUMMARY_LENGTH,
        saveDescription,
    ),
]); }
export const TASK_MAINTENANCE_TOOLS = taskTools([
    'Changes remain pending until the app saves them after this run.',
    'A later successful call for the same task replaces its pending decision. Repeating the same decision is unchanged; submitting its original progress cancels the pending change. Only the final decision is saved and settled once.',
    'Returns {ok,status,changed,applied,skipped,warnings,hint?}; status is updated, unchanged (already matches; success) or failed.',
].join('\n'));
