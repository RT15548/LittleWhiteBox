import { taskEvidenceDigest, type AcceptedTurnChatSurface, type AcceptedTurnSource } from '../../../capabilities/maintenance/accepted-turn-source.js';
import type { MaintenanceMode, MaintenanceParticipant } from '../../../capabilities/maintenance/registry.js';
import type { TasksService } from '../application/service.js';
import { createTaskMaintenanceSession } from '../maintenance/session.js';

export interface TaskMaintenanceSettings {
    readonly autoMaintenance: boolean;
}

interface TaskMaintenanceParticipantDependencies {
    readonly tasks: Pick<TasksService, 'readCurrent' | 'createActionId' | 'commitMaintenance' | 'getWriteState'>
        & Partial<Pick<TasksService, 'subscribeWriteState'>>;
    readonly readSettings: () => TaskMaintenanceSettings | null;
    readonly captureSurface: () => AcceptedTurnChatSurface | null;
}

export function createTaskMaintenanceParticipant({
    tasks,
    readSettings,
    captureSurface,
}: TaskMaintenanceParticipantDependencies): MaintenanceParticipant {
    return Object.freeze({
        id: 'tasks',
        ...(tasks.subscribeWriteState ? { writeGate: { getState: tasks.getWriteState,
            subscribe: (listener: (state: ReturnType<TasksService['getWriteState']>) => void) =>
                tasks.subscribeWriteState!(() => listener(tasks.getWriteState())) } } : {}),
        prepareSession(source: AcceptedTurnSource, mode: MaintenanceMode) {
            const eligible = new Set(tasks.readCurrent().records.filter(record => record.status === 'active')
                .map(record => record.taskId));
            return () => createSession(source, mode, eligible);
        },
        isEnabled(mode: MaintenanceMode) {
            if (mode === 'rebuild') {return false;}
            return mode === 'manual' || readSettings()?.autoMaintenance === true;
        },
        createSession(source: AcceptedTurnSource, mode: MaintenanceMode) {
            return createSession(source, mode);
        },
    });

    function createSession(source: AcceptedTurnSource, mode: MaintenanceMode, eligible?: ReadonlySet<string>) {
            if (mode === 'rebuild') {return null;}
            if (tasks.getWriteState() !== 'ready') {
                throw Object.assign(new Error('Task economy storage is not ready'), { code: 'storage_unconfirmed' });
            }
            const surface = captureSurface();
            if (!surface || surface.identityKey !== source.chatIdentity) {return null;}
            const digest = taskEvidenceDigest(source);
            const state = tasks.readCurrent();
            const records = state.records.filter(record => {
                const receipt = state.domain?.checks[record.taskId];
                return (!eligible || eligible.has(record.taskId))
                    && record.status === 'active' && !!receipt && receipt.phase !== 'pending'
                    && (receipt.digest !== digest || mode === 'manual' && receipt.phase === 'checked');
            });
            return records.length ? createTaskMaintenanceSession(tasks, records, digest, mode) : null;
    }
}
