import {
    buildActivatedWorldEntriesFromNativeRuntime,
    type ActivatedWorldEntry,
    type XbTavernContext,
} from '../../shared/message-assembler';
import {
    getTavernMessage,
    getTavernSession,
    normalizeTavernSessionState,
    type TavernSessionState,
    type TavernTurnStateSnapshot,
} from '../../shared/session-db';
import {
    buildContextHistory,
    type TavernGetNativeWorldInfoRuntime,
} from './run-once';
import {
    loadTavernPromptHistoryWindow,
} from './prompt-history-window';

export interface TavernAnchoredWorldbookResolution {
    activatedWorldEntries: ActivatedWorldEntry[];
}

async function resolveStoryBoundaryState(input: {
    sessionId: string;
    throughOrder: number;
    currentState: TavernSessionState;
}): Promise<TavernSessionState | TavernTurnStateSnapshot> {
    const boundaryMessage = input.throughOrder >= 0
        ? await getTavernMessage(input.sessionId, input.throughOrder)
        : null;
    if (
        boundaryMessage?.order === input.throughOrder
        && boundaryMessage.role === 'user'
        && boundaryMessage.runtimeStateSnapshot
    ) {
        return boundaryMessage.runtimeStateSnapshot;
    }
    const nextMessage = input.throughOrder >= 0
        ? await getTavernMessage(input.sessionId, input.throughOrder + 1)
        : null;
    if (nextMessage?.role === 'user' && nextMessage.runtimeStateSnapshot) {
        return nextMessage.runtimeStateSnapshot;
    }
    return input.currentState;
}

export async function resolveTavernWorldbookAtStoryBoundary(input: {
    sessionId: string;
    contextSnapshot: XbTavernContext;
    throughOrder: number;
    getNativeWorldInfoRuntime: TavernGetNativeWorldInfoRuntime;
}): Promise<TavernAnchoredWorldbookResolution> {
    const session = await getTavernSession(input.sessionId);
    if (!session) {throw new Error('当前会话不存在。');}
    const sessionState = normalizeTavernSessionState(session.state || {});
    const throughOrder = Number.isInteger(Number(input.throughOrder))
        ? Number(input.throughOrder)
        : -1;
    const boundaryState = await resolveStoryBoundaryState({
        sessionId: input.sessionId,
        throughOrder,
        currentState: sessionState,
    });
    const historyWindow = await loadTavernPromptHistoryWindow({
        sessionId: input.sessionId,
        contextWindowStartOrder: boundaryState.contextWindowStartOrder,
        beforeOrder: throughOrder + 1,
    });
    const worldbookContext: XbTavernContext = {
        ...input.contextSnapshot,
        worldSettings: {
            ...(input.contextSnapshot.worldSettings || {}),
            trigger: 'normal',
        },
        history: buildContextHistory(historyWindow.historyMessages),
    };
    const nativeWorldInfo = await input.getNativeWorldInfoRuntime({
        context: worldbookContext,
        currentUserMessage: '',
        trigger: 'normal',
        timedState: boundaryState.nativeWorldInfoTimedState,
    });
    return {
        activatedWorldEntries: buildActivatedWorldEntriesFromNativeRuntime(nativeWorldInfo),
    };
}
