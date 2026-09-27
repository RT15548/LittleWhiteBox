import { managementReadError, type ManagementParticipant } from '../../../capabilities/management/index.js';
import { MANAGEMENT_MAX_PAGE_SIZE, MANAGEMENT_PAGE_SIZE } from '../../../capabilities/management/read-page.js';
import type { TasksService } from '../application/service.js';
import { compileTaskMaintenanceCommand } from '../tools/command-compiler.js';
import { createManagementSave } from '../../../capabilities/management/save.js';
import { TASKS_MANAGEMENT_PROMPT } from './prompt.js';
import { createTasksManagementTools } from './tool-contract.js';
import { createManagementDocument } from '../../../capabilities/management/document.js';
import type { TaskRecord } from '../../../domains/tasks/types.js';

export function createTasksManagement(tasks: TasksService): ManagementParticipant {
    const tools = createTasksManagementTools(id => String(id ?? ''));
    return {
        id: 'tasks', label: '任务', prompt: TASKS_MANAGEMENT_PROMPT, tools, confirmPending: tasks.confirmPending,
        async open() {
            let records: TaskRecord[] = [];
            const saving = createManagementSave(tasks.confirmPending);
            const document = createManagementDocument(tasks.document, saving);
            const project = () => records.map(r => ({ taskId: r.taskId, revision: r.taskRevision, title: r.title,
                objective: r.objective, status: r.status, progressSummary: r.progressSummary, resultSummary: r.resultSummary, reward: r.reward,
                source: r.source, issuer: r.issuer.displayName, assignee: r.assignee?.displayName ?? null }));
            let initial: unknown;
            try {
                await tasks.refreshCurrent(); records = tasks.readCurrent().records;
                initial = { items: project().slice(0, MANAGEMENT_PAGE_SIZE), total: records.length, nextOffset: records.length > MANAGEMENT_PAGE_SIZE ? MANAGEMENT_PAGE_SIZE : null };
            } catch (error) {
                const raw = await document.read({});
                initial = { ...raw.data as Record<string, unknown>, readError: managementReadError(error) };
            }
            return {
                recover: saving.recover,
                confirmSaved: saving.confirmSaved,
                prompt: TASKS_MANAGEMENT_PROMPT,
                initial,
                tools,
                async execute(name, args, guard) {
                    if (name === 'TasksRead') {
                        if (args.mode === 'document' || !(await tasks.document.read()).validation.valid) { return document.read(args.mode === 'document' ? args : {}); }
                        await tasks.refreshCurrent(); records = tasks.readCurrent().records;
                        const offset = Number(args.offset ?? 0), limit = Number(args.limit ?? MANAGEMENT_PAGE_SIZE);
                        if (!Number.isSafeInteger(offset) || offset < 0 || !Number.isSafeInteger(limit) || limit < 1 || limit > MANAGEMENT_MAX_PAGE_SIZE) { throw new Error('tasks_read_range_invalid'); }
                        const items = project().filter(r => !args.taskId || r.taskId === args.taskId);
                        return { ok: true, status: 'read', data: { items: items.slice(offset, offset + limit), total: items.length, nextOffset: offset + limit < items.length ? offset + limit : null } };
                    }
                    const inspected = await tasks.document.read();
                    if (!inspected.validation.valid) { return { ok: false, status: 'failed', data: { validation: inspected.validation } }; }
                    const compiled = compileTaskMaintenanceCommand(name, args, { records: new Map(records.map(r => [r.taskId, r])), staged: new Map(), createActionId: tasks.createActionId });
                    if (!compiled.command) { return { ok: compiled.result.ok, status: compiled.result.ok ? 'unchanged' : 'failed', data: compiled.result }; }
                    const command = compiled.command;
                    const savedResult = () => ({ ok: true, status: 'saved' as const, data: project().find(r => r.taskId === compiled.taskId) });
                    return saving.run(async commitGuard => {
                        const result = await tasks.commitMaintenance({ commands: [command], checkedTasks: [], evidenceDigest: '' }, commitGuard);
                        records = result.view.records;
                        return savedResult();
                    }, async () => {
                        await tasks.refreshCurrent(); records = tasks.readCurrent().records;
                        const domain = tasks.readCurrent().domain;
                        if (domain?.events.some(event => event.actionId === command.actionId)) { return { status: 'confirmed', result: savedResult() }; }
                        const record = records.find(r => r.taskId === command.taskId);
                        return { status: record?.taskRevision === command.expectedTaskRevision && record.eventId === command.expectedEventId ? 'unchanged' : 'superseded' };
                    }, guard);
                },
            };
        },
    };
}
