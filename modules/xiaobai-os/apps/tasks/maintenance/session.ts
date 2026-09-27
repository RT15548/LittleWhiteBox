import type {
    MaintenanceCommitGuard,
    MaintenanceParticipantResult,
    MaintenanceSession,
} from '../../../capabilities/maintenance/registry.js';
import type { TaskRecord } from '../../../domains/tasks/types.js';
import type { TaskMaintenanceCommand, TasksService } from '../application/service.js';
import { compileTaskMaintenanceCommand } from '../tools/command-compiler.js';
import { buildTaskMaintenanceDataMessage, TASK_MAINTENANCE_PROMPT } from './prompt.js';
import { TASK_MAINTENANCE_TOOLS } from '../tools/tool-contract.js';

export function createTaskMaintenanceSession(
    tasks: Pick<TasksService, 'readCurrent' | 'createActionId' | 'commitMaintenance'>,
    recordsValue: readonly TaskRecord[],
    evidenceDigest: string,
): MaintenanceSession {
    const records = new Map(recordsValue.map(record => [record.taskId, structuredClone(record)]));
    const staged = new Map<string, TaskMaintenanceCommand>();
    const occupiedActions = new Set<string>();
    const unresolvedFailures = new Map<string, string>();
    let invalidated = false;
    let committed = false;

    function assertActive(): void {
        if (invalidated) {throw new Error('tasks_maintenance_session_invalid');}
        if (committed) {throw new Error('tasks_maintenance_session_committed');}
    }

    function createActionId(): string {
        for (let attempt = 0; attempt < 1_000; attempt += 1) {
            const actionId = tasks.createActionId();
            if (!occupiedActions.has(actionId)) {
                occupiedActions.add(actionId);
                return actionId;
            }
        }
        throw new Error('tasks_action_id_exhausted');
    }

    return Object.freeze({
        participantId: 'tasks',
        prompt: TASK_MAINTENANCE_PROMPT,
        dataMessages: Object.freeze([{
            role: 'user' as const,
            content: buildTaskMaintenanceDataMessage([...records.values()]),
        }]),
        tools: TASK_MAINTENANCE_TOOLS,
        executeTool(name: string, args: unknown) {
            assertActive();
            const compiled = compileTaskMaintenanceCommand(name, args, { records, staged, createActionId });
            const key = compiled.taskId || '*';
            if (compiled.result.ok) {
                unresolvedFailures.delete(key);
                unresolvedFailures.delete('*');
                if (compiled.clearStaged && compiled.taskId) { staged.delete(compiled.taskId); }
                if (compiled.command) {staged.set(compiled.command.taskId, compiled.command);}
            } else {
                unresolvedFailures.set(key, compiled.result.skipped[0]?.reason || 'task_tool_failed');
            }
            return compiled.result;
        },
        canCommit: ({ completed }: { completed: boolean }) => staged.size > 0 || completed && unresolvedFailures.size === 0,
        getResult() {
            const changed = staged.size > 0;
            const unresolved = unresolvedFailures.size > 0;
            return Object.freeze({
                status: unresolved ? (changed ? 'partial' : 'failed') : changed ? 'updated' : 'unchanged',
                changed,
            }) as MaintenanceParticipantResult;
        },
        async commit(beforeCommit: MaintenanceCommitGuard, { completed }: { completed: boolean }) {
            assertActive();
            const guard = (): boolean => {
                if (invalidated) {throw new Error('tasks_maintenance_session_invalid');}
                if (!beforeCommit()) {throw new Error('tasks_maintenance_commit_guard_rejected');}
                return true;
            };
            guard();
            try {
                const result = await tasks.commitMaintenance({
                    commands: [...staged.values()],
                    checkedTasks: completed && unresolvedFailures.size === 0 ? [...records.values()].map(record => ({
                        taskId: record.taskId,
                        expectedTaskRevision: record.taskRevision,
                        expectedEventId: record.eventId,
                    })) : [],
                    evidenceDigest,
                }, guard);
                committed = true;
                return result.staleTaskIds?.length
                    ? { status: 'stale' as const, changed: result.changed }
                    : result;
            } catch (error) {
                const failure = error !== null && typeof error === 'object'
                    ? error as { mutationCommitted?: unknown; uncertain?: unknown }
                    : null;
                if (failure?.mutationCommitted !== true && failure?.uncertain !== true) {throw error;}
                committed = true;
                if (failure.uncertain === true) {throw error;}
                return undefined;
            }
        },
        invalidate() {invalidated = true;},
    });
}
