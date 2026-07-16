import {
    describeTavernMemoryRestoreImpact,
    rebuildTavernMemoryDerivedIndex,
    restoreTavernMemoryToFloor,
    trimTavernMemorySnapshotsFromFloor,
} from '../../../shared/memory-files';
import {
    describeTavernTaskRestoreImpact,
    restoreTavernTasksToFloor,
    trimTavernTaskSnapshotsFromFloor,
} from '../../../shared/tasks';
import {
    describeTavernStatusRestoreImpact,
    restoreTavernStatusToFloor,
    trimTavernStatusSnapshotsFromFloor,
} from '../../../shared/status-state';
import {
    describeTavernCommunicationRestoreImpact,
    restoreTavernCommunicationsToFloor,
    trimTavernCommunicationSnapshotsFromFloor,
} from '../../../shared/communications';
import {
    cancelAndRollbackXbTavernManagersForMessageRange,
    describeXbTavernManagerRollbackImpactForMessageRange,
} from '../../runtime/manager';

export type AcceptedStateRollbackImpact = {
    targetFloor: number;
    memory: { changed: boolean; currentFileCount: number; targetFileCount: number; changedPaths: string[] };
    tasks: { changed: boolean; currentTaskCount: number; targetTaskCount: number };
    status: { changed: boolean; currentExists: boolean; targetExists: boolean };
    communications: { changed: boolean; currentMessageCount: number; targetMessageCount: number };
    managers: {
        affectedRuns: number;
        pendingRuns: number;
        writtenMemoryFiles: number;
        writtenTaskRuns: number;
        writtenStatusPatches: number;
        hasWrittenState: boolean;
    };
    willRollbackState: boolean;
    willCancelWork: boolean;
};

export async function cancelAcceptedRollbackManagersBeforeMessage(sessionId = '', changedOrder = 0) {
    return cancelAndRollbackXbTavernManagersForMessageRange(sessionId, changedOrder);
}

export async function restoreAcceptedStateBeforeMessage(sessionId = '', changedOrder = 0) {
    const id = String(sessionId || '').trim();
    const order = Number(changedOrder);
    if (!id || !Number.isFinite(order)) {return;}
    await restoreTavernMemoryToFloor(id, order - 1);
    await restoreTavernTasksToFloor(id, order - 1);
    await restoreTavernStatusToFloor(id, order - 1);
    await restoreTavernCommunicationsToFloor(id, order - 1);
    await trimTavernMemorySnapshotsFromFloor(id, order);
    await trimTavernTaskSnapshotsFromFloor(id, order);
    await trimTavernStatusSnapshotsFromFloor(id, order);
    await trimTavernCommunicationSnapshotsFromFloor(id, order);
    await rebuildTavernMemoryDerivedIndex(id);
}

export async function describeAcceptedStateRollbackImpact(sessionId: string, changedOrder: number): Promise<AcceptedStateRollbackImpact> {
    const targetFloor = Number(changedOrder) - 1;
    const [memory, tasks, status, communications, managers] = await Promise.all([
        describeTavernMemoryRestoreImpact(sessionId, targetFloor),
        describeTavernTaskRestoreImpact(sessionId, targetFloor),
        describeTavernStatusRestoreImpact(sessionId, targetFloor),
        describeTavernCommunicationRestoreImpact(sessionId, targetFloor),
        describeXbTavernManagerRollbackImpactForMessageRange(sessionId, changedOrder),
    ]);
    return {
        targetFloor,
        memory,
        tasks,
        status,
        communications,
        managers,
        willRollbackState: memory.changed || tasks.changed || status.changed || communications.changed,
        willCancelWork: managers.pendingRuns > 0,
    };
}

function rollbackImpactTargetLabel(targetFloor: number): string {
    return targetFloor >= 0 ? `第 ${targetFloor + 1} 楼后的状态` : '开局前状态';
}

function joinRollbackTargets(targets: string[]): string {
    if (targets.length <= 2) {return targets.join('和');}
    return `${targets.slice(0, -1).join('、')}和${targets[targets.length - 1]}`;
}

export function rollbackImpactLines(impact: AcceptedStateRollbackImpact): string[] {
    const target = rollbackImpactTargetLabel(impact.targetFloor);
    const lines: string[] = [];
    const restoreTargets: string[] = [];
    if (impact.memory.changed) {restoreTargets.push('会话记忆');}
    if (impact.tasks.changed) {restoreTargets.push('野望调色盘');}
    if (impact.status.changed) {restoreTargets.push('状态栏');}
    if (impact.communications.changed) {restoreTargets.push('私人消息');}
    if (restoreTargets.length) {
        lines.push(`${joinRollbackTargets(restoreTargets)}会恢复到${target}。`);
    }
    if (impact.managers.pendingRuns) {
        lines.push(`将取消 ${impact.managers.pendingRuns} 个尚未执行的后台维护。`);
    }
    return lines;
}
