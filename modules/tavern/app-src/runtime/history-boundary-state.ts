import {
    countCompletedTavernAssistantTurnsBefore,
    createTavernTurnStateSnapshot,
    getLatestTavernUserMessageAtOrBefore,
    normalizeTavernSessionState,
    type TavernMessageRecord,
    type TavernSessionState,
} from '../../shared/session-db';
import { loadTavernPromptHistoryWindow } from './prompt-history-window';

const EMPTY_NATIVE_WORLD_INFO_TIMED_STATE = Object.freeze({
    sticky: Object.freeze({}),
    cooldown: Object.freeze({}),
});

function resolveLatestBoundaryMetadata(messages: TavernMessageRecord[]): Pick<TavernSessionState,
    | 'lastBuildSnapshot'
    | 'lastRequestSnapshot'
    | 'lastProvider'
    | 'lastModel'
    | 'lastError'
> {
    let lastBuildSnapshot: TavernSessionState['lastBuildSnapshot'];
    let lastRequestSnapshot: TavernSessionState['lastRequestSnapshot'];
    let lastProvider = '';
    let lastModel = '';
    for (let index = messages.length - 1; index >= 0; index -= 1) {
        const message = messages[index];
        if (lastBuildSnapshot === undefined && message.buildSnapshot !== undefined) {
            lastBuildSnapshot = message.buildSnapshot;
        }
        if (lastRequestSnapshot === undefined && message.requestSnapshot !== undefined) {
            lastRequestSnapshot = message.requestSnapshot;
        }
        if (!lastProvider && message.provider) {lastProvider = String(message.provider);}
        if (!lastModel && message.model) {lastModel = String(message.model);}
        if (lastBuildSnapshot !== undefined
            && lastRequestSnapshot !== undefined
            && lastProvider
            && lastModel
        ) {break;}
    }
    const latestMessage = messages.at(-1);
    return {
        lastBuildSnapshot,
        lastRequestSnapshot,
        lastProvider,
        lastModel,
        lastError: latestMessage?.error ? String(latestMessage.content || '') : '',
    };
}

export interface TavernHistoryBoundaryStateInput {
    sessionId: string;
    boundaryOrder: number;
    currentState?: Partial<TavernSessionState>;
    boundaryUserMessage?: TavernMessageRecord | null;
}

export async function resolveTavernHistoryBoundaryState(
    input: TavernHistoryBoundaryStateInput,
): Promise<TavernSessionState> {
    const sessionId = String(input.sessionId || '').trim();
    if (!sessionId) {throw new Error('session_missing');}
    const boundaryOrder = Math.max(0, Math.floor(Number(input.boundaryOrder) || 0));
    const currentState = normalizeTavernSessionState(input.currentState || {});
    const suppliedBoundaryUser = input.boundaryUserMessage;
    const boundaryUser = suppliedBoundaryUser?.sessionId === sessionId
        && suppliedBoundaryUser.role === 'user'
        && suppliedBoundaryUser.order <= boundaryOrder
        ? suppliedBoundaryUser
        : await getLatestTavernUserMessageAtOrBefore(sessionId, boundaryOrder);
    const effectiveBoundaryOrder = boundaryUser?.order ?? boundaryOrder;
    const checkpoint = boundaryUser?.runtimeStateSnapshot
        ? createTavernTurnStateSnapshot(boundaryUser.runtimeStateSnapshot)
        : null;
    const turn = checkpoint
        ? checkpoint.turn
        : await countCompletedTavernAssistantTurnsBefore(sessionId, effectiveBoundaryOrder);
    const contextWindow = await loadTavernPromptHistoryWindow({
        sessionId,
        contextWindowStartOrder: checkpoint?.contextWindowStartOrder || 0,
        beforeOrder: effectiveBoundaryOrder,
    });
    const gates = checkpoint || {
        worldEntryStates: {},
        nativeWorldInfoTimedState: EMPTY_NATIVE_WORLD_INFO_TIMED_STATE,
    };

    return normalizeTavernSessionState({
        turn,
        contextWindowStartOrder: contextWindow.contextWindowStartOrder,
        activeMapDocId: currentState.activeMapDocId,
        contract: currentState.contract,
        worldEntryStates: gates.worldEntryStates,
        nativeWorldInfoTimedState: gates.nativeWorldInfoTimedState,
        ...resolveLatestBoundaryMetadata(contextWindow.historyMessages),
    });
}
