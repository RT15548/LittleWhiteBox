import type { ManagementTool } from '../../../capabilities/management/index.js';
import { MANAGEMENT_MAX_PAGE_SIZE, MANAGEMENT_PAGE_SIZE } from '../../../capabilities/management/read-page.js';
import { taskTools, TASK_MAINTENANCE_TOOL_NAMES as TOOLS } from '../tools/tool-contract.js';
import { withDocumentRead } from '../../../capabilities/management/document-tools.js';

const WRITE_LABELS: Record<string, string> = {
    [TOOLS.PROGRESS]: '修正任务进展',
    [TOOLS.COMPLETE]: '完成任务',
    [TOOLS.FAIL]: '判定任务失败',
};

export function createTasksManagementTools(taskTitle: (id: unknown) => string): readonly ManagementTool[] {
    const tools: ManagementTool[] = [
        { effect: 'read', label: '查看任务', target: args => String(args.taskId ?? ''), definition: { type: 'function', function: {
            name: 'TasksRead',
            description: [
                'Read the current task records.',
                'data contains {items,total,nextOffset}. Each item has taskId, revision, title, objective, status, progressSummary, resultSummary, reward, source, issuer and assignee.',
                'Use it to inspect a task before correcting it or to read beyond the initial page.',
                'A missing task gives an empty items array. Continue with nextOffset while it is not null.',
            ].join('\n'),
            parameters: { type: 'object', properties: {
                taskId: { type: 'string', description: 'Exact task ID. Omit to read all tasks.' },
                offset: { type: 'integer', minimum: 0, description: 'Zero-based record offset after filtering. Default 0.' },
                limit: { type: 'integer', minimum: 1, maximum: MANAGEMENT_MAX_PAGE_SIZE, description: `Records per page. Default ${MANAGEMENT_PAGE_SIZE}, maximum ${MANAGEMENT_MAX_PAGE_SIZE}.` },
            }, additionalProperties: false },
        } } },
        ...taskTools([
            'This call saves the change and any reward or escrow settlement.',
            'Returns {ok,status,data}; status is saved, unchanged or failed.',
            'A saved result contains the current task in the TasksRead shape. Otherwise data is a report with ok, status, changed, applied, skipped, warnings and an optional hint.',
        ].join('\n')).map(definition => ({
            definition: definition as ManagementTool['definition'],
            effect: 'write' as const,
            label: WRITE_LABELS[definition.function.name],
            target: (args: Record<string, unknown>) => taskTitle(args.taskId),
        })),
    ];
    withDocumentRead(tools[0].definition);
    return tools;
}
