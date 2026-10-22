import type { EconomyTransactionCapability } from '../../../capabilities/economy/index.js';
import type { ChatPersistence } from '../../../kernel/contracts.js';
import { completeTask, failTask, progressTask } from '../../../domains/tasks/commands/maintenance.js';
import type { TaskCommandResult, TaskDomainV1 } from '../../../domains/tasks/types.js';
import { postTaskEconomyEvent } from './economy-protocol.js';
import { taskEnvironment } from './local-actions.js';
import type {
    CommitGuard,
    MaintenanceCommitRequest,
    TaskApplicationContext,
    TaskMaintenanceCommand,
} from './service.js';

function applyCommand(
    context: TaskApplicationContext,
    domain: TaskDomainV1,
    command: TaskMaintenanceCommand,
): TaskCommandResult {
    const common = {
        actionId: command.actionId,
        taskId: command.taskId,
        expectedTaskRevision: command.expectedTaskRevision,
        expectedEventId: command.expectedEventId,
    };
    const environment = taskEnvironment(context, domain);
    if (command.kind === 'progress') {
        return progressTask(domain, { ...common, progressSummary: command.progressSummary }, environment);
    }
    if (command.kind === 'complete') {
        return completeTask(domain, { ...common, resultSummary: command.resultSummary }, environment);
    }
    return failTask(domain, { ...common, resultSummary: command.resultSummary }, environment);
}

export function createTaskMaintenanceCommit(context: TaskApplicationContext) {
    return async function commitMaintenance(input: MaintenanceCommitRequest, guard: CommitGuard, chatPersistence: ChatPersistence = 'immediate') {
        if (!Array.isArray(input.commands) || !Array.isArray(input.checkedTasks)
            || typeof input.evidenceDigest !== 'string') {throw new TypeError('Invalid task maintenance commit');}
        if (new Set(input.commands.map(command => command.taskId)).size !== input.commands.length) {
            throw new TypeError('task maintenance commit contains duplicate tasks');
        }
        return context.execute(guard, (initialDomain, economy: EconomyTransactionCapability) => {
            const initialRevision = initialDomain.revision;
            const eligibleChecks = new Set(input.checkedTasks.filter(target => {
                const current = initialDomain.events.filter(event => event.taskId === target.taskId).at(-1);
                return current?.taskRevision === target.expectedTaskRevision
                    && current.eventId === target.expectedEventId
                    && initialDomain.checks[target.taskId]?.taskRevision === target.expectedTaskRevision;
            }).map(target => target.taskId));
            const staleTaskIds = input.checkedTasks.filter(target => !eligibleChecks.has(target.taskId))
                .map(target => target.taskId);
            let domain = initialDomain;
            let changed = false;
            let lastRecord: TaskCommandResult['record'] | undefined;
            for (const staged of input.commands) {
                const command = applyCommand(context, domain, staged);
                domain = command.domain;
                lastRecord = command.record;
                changed ||= command.changed;
                if (command.changed && command.event) {
                    postTaskEconomyEvent(economy, command.event, command.record);
                }
            }
            let receiptChanged = false;
            for (const taskId of eligibleChecks) {
                const record = domain.events.filter(event => event.taskId === taskId).at(-1);
                const receipt = domain.checks[taskId];
                if (!record || !receipt) {continue;}
                if (receipt.phase !== 'checked' || receipt.digest !== input.evidenceDigest) {
                    domain.checks[taskId] = { taskRevision: record.taskRevision,
                        phase: 'checked', digest: input.evidenceDigest };
                    receiptChanged = true;
                }
            }
            domain = { ...domain, revision: initialRevision + (changed ? 1 : 0) };
            return {
                domain,
                changed,
                persist: receiptChanged,
                staleTaskIds,
                ...(lastRecord ? { record: lastRecord } : {}),
            };
        }, chatPersistence);
    };
}
