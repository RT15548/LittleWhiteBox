import { shallowRef } from 'vue';
import {
    describeTavernMemoryRestoreImpact,
    rebuildTavernMemoryDerivedIndex,
    restoreTavernMemoryToFloor,
    trimTavernMemorySnapshotsFromFloor,
} from '../../../shared/memory-files';
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
    describeTavernAcceptedEconomicRestoreImpact,
    restoreTavernAcceptedEconomicStateToFloor,
    truncateTavernMessagesAndRestoreAcceptedEconomicState,
    updateTavernMessageAndRestoreAcceptedEconomicState,
} from '../../../shared/accepted-economic-state';
import type {
    TavernMessageRecord,
    TavernSessionState,
} from '../../../shared/session-db';
import type { TavernEconomyRestoreImpact } from '../../../shared/economy/economy-types';
import type { TavernShopRestoreImpact } from '../../../shared/shop/shop-types';
import type { TavernBankRestoreImpact } from '../../../shared/bank/bank-types';
import type { TavernPetRestoreImpact } from '../../../shared/pet/pet-types';
import type { TavernTaskRestoreImpact } from '../../../shared/tasks/task-types';
import {
    cancelAndRollbackXbTavernManagersForMessageRange,
    describeXbTavernManagerRollbackImpactForMessageRange,
} from '../../runtime/manager';

export type AcceptedStateRollbackImpact = {
    targetFloor: number;
    memory: { changed: boolean; currentFileCount: number; targetFileCount: number; changedPaths: string[] };
    status: { changed: boolean; currentExists: boolean; targetExists: boolean };
    communications: { changed: boolean; currentMessageCount: number; targetMessageCount: number };
    tasks: TavernTaskRestoreImpact;
    shop: TavernShopRestoreImpact;
    bank: TavernBankRestoreImpact;
    pet: TavernPetRestoreImpact;
    economy: TavernEconomyRestoreImpact;
    managers: {
        affectedRuns: number;
        pendingRuns: number;
        writtenMemoryFiles: number;
        writtenStatusPatches: number;
        hasWrittenState: boolean;
    };
    willRollbackState: boolean;
    willCancelWork: boolean;
};

const acceptedRollbackCounts = new Map<string, number>();
const acceptedRollbackSessionIds = shallowRef<ReadonlySet<string>>(new Set());

function publishAcceptedRollbackSessions(): void {
    acceptedRollbackSessionIds.value = new Set(acceptedRollbackCounts.keys());
}

export function isAcceptedRollbackInProgress(sessionId = ''): boolean {
    const id = String(sessionId || '').trim();
    return !!id && acceptedRollbackSessionIds.value.has(id);
}

/** Keeps the lifecycle gate active for the complete message mutation + restore window. */
export async function withAcceptedRollbackGate<T>(sessionId: string, action: () => Promise<T>): Promise<T> {
    const id = String(sessionId || '').trim();
    if (!id) {throw new Error('accepted_rollback_session_required');}
    acceptedRollbackCounts.set(id, (acceptedRollbackCounts.get(id) || 0) + 1);
    publishAcceptedRollbackSessions();
    try {
        return await action();
    } finally {
        const remaining = (acceptedRollbackCounts.get(id) || 1) - 1;
        if (remaining > 0) {acceptedRollbackCounts.set(id, remaining);} else {acceptedRollbackCounts.delete(id);}
        publishAcceptedRollbackSessions();
    }
}

export async function cancelAcceptedRollbackManagersBeforeMessage(sessionId = '', changedOrder = 0) {
    return cancelAndRollbackXbTavernManagersForMessageRange(sessionId, changedOrder);
}

export async function updateAcceptedStoryMessageAndRestoreState(input: {
    sessionId: string;
    order: number;
    content: string;
}): Promise<TavernMessageRecord | null> {
    return await withAcceptedRollbackGate(input.sessionId, async () => {
        const mutation = await updateTavernMessageAndRestoreAcceptedEconomicState({
            sessionId: input.sessionId,
            order: input.order,
            patch: { content: input.content },
            incrementTimelineRevision: true,
        });
        if (!mutation.message) {return null;}
        await cancelAcceptedRollbackManagersBeforeMessage(input.sessionId, input.order);
        await restoreAcceptedNonEconomicStateBeforeMessage(input.sessionId, input.order);
        return mutation.message;
    });
}

export async function truncateAcceptedStoryMessagesAndRestoreState(input: {
    sessionId: string;
    fromOrder: number;
    state: Partial<TavernSessionState>;
}) {
    return await withAcceptedRollbackGate(input.sessionId, async () => {
        await cancelAcceptedRollbackManagersBeforeMessage(input.sessionId, input.fromOrder);
        const mutation = await truncateTavernMessagesAndRestoreAcceptedEconomicState(input);
        if (mutation.deleted > 0) {
            await restoreAcceptedNonEconomicStateBeforeMessage(input.sessionId, input.fromOrder);
        }
        return mutation;
    });
}

export async function restoreAcceptedStateBeforeMessage(sessionId = '', changedOrder = 0) {
    await restoreAcceptedAuxiliaryStateBeforeMessage(sessionId, changedOrder, true);
}

/**
 * Restores domains outside the shared Economy transaction. Story mutation
 * callers use this after their atomic message + economic rollback commits.
 */
export async function restoreAcceptedNonEconomicStateBeforeMessage(
    sessionId = '',
    changedOrder = 0,
) {
    await restoreAcceptedAuxiliaryStateBeforeMessage(sessionId, changedOrder, false);
}

async function restoreAcceptedAuxiliaryStateBeforeMessage(
    sessionId: string,
    changedOrder: number,
    restoreEconomic: boolean,
) {
    const id = String(sessionId || '').trim();
    const order = Number(changedOrder);
    if (!id || !Number.isFinite(order)) {return;}
    await restoreTavernMemoryToFloor(id, order - 1);
    await restoreTavernStatusToFloor(id, order - 1);
    await restoreTavernCommunicationsToFloor(id, order - 1);
    if (restoreEconomic) {
        await restoreTavernAcceptedEconomicStateToFloor(id, order - 1);
    }
    await trimTavernMemorySnapshotsFromFloor(id, order);
    await trimTavernStatusSnapshotsFromFloor(id, order);
    await trimTavernCommunicationSnapshotsFromFloor(id, order);
    await rebuildTavernMemoryDerivedIndex(id);
}

export async function describeAcceptedStateRollbackImpact(sessionId: string, changedOrder: number): Promise<AcceptedStateRollbackImpact> {
    const targetFloor = Number(changedOrder) - 1;
    const [memory, status, communications, economic, managers] = await Promise.all([
        describeTavernMemoryRestoreImpact(sessionId, targetFloor),
        describeTavernStatusRestoreImpact(sessionId, targetFloor),
        describeTavernCommunicationRestoreImpact(sessionId, targetFloor),
        describeTavernAcceptedEconomicRestoreImpact(sessionId, targetFloor),
        describeXbTavernManagerRollbackImpactForMessageRange(sessionId, changedOrder),
    ]);
    return {
        targetFloor,
        memory,
        status,
        communications,
        tasks: economic.tasks,
        shop: economic.shop,
        bank: economic.bank,
        pet: economic.pet,
        economy: economic.economy,
        managers,
        willRollbackState: memory.changed
            || status.changed
            || communications.changed
            || economic.tasks.changed
            || economic.shop.changed
            || economic.bank.changed
            || economic.pet.changed
            || economic.economy.changed,
        willCancelWork: managers.pendingRuns > 0,
    };
}

function rollbackImpactTargetLabel(targetFloor: number): string {
    return targetFloor >= 0 ? `第 ${targetFloor} 楼后的状态` : '开局前状态';
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
    if (impact.status.changed) {restoreTargets.push('状态栏');}
    if (impact.communications.changed) {restoreTargets.push('私人消息');}
    if (impact.tasks.changed) {restoreTargets.push('任务状态');}
    if (impact.shop.changed) {restoreTargets.push('背包与道具效果');}
    if (impact.bank.changed) {restoreTargets.push('银行头寸与对局');}
    if (impact.pet.changed) {restoreTargets.push('住户状态与痕迹');}
    if (impact.economy.changed) {restoreTargets.push('钱包流水');}
    if (restoreTargets.length) {
        lines.push(`${joinRollbackTargets(restoreTargets)}会恢复到${target}。`);
    }
    if (impact.managers.pendingRuns) {
        lines.push(`将取消 ${impact.managers.pendingRuns} 个尚未执行的后台维护。`);
    }
    return lines;
}
