import {
    tavernCommunicationPayloadText,
} from '../../../../../shared/communication-message';
import {
    type XbTavernContext,
    type XbTavernMemoryContext,
    type XbTavernMessage,
} from '../../../../../shared/message-assembler';
import {
    buildXbTavernMemoryIgnoredTerms,
    buildXbTavernMemoryQuery,
    retrieveXbTavernMemoryContext,
} from '../../../../../shared/memory-retrieval';
import {
    countCompletedTavernAssistantTurnsBefore,
    getLatestTavernMessage,
    getTavernSession,
    normalizeTavernSessionState,
    type TavernCommunicationContactRecord,
    type TavernCommunicationMessageRecord,
    type TavernCommunicationThreadRecord,
} from '../../../../../shared/session-db';
import {
    normalizeTavernSessionContract,
    resolveTavernSessionContractRuntime,
    type TavernSessionContractRuntime,
} from '../../../../../shared/session-contract';
import { getTavernStatusDocumentForSession } from '../../../../../shared/status-state';
import { buildTavernStatusPanelYaml } from '../../../../../shared/status-prompt';
import {
    buildTavernShopPromptBlock,
} from '../../../../../shared/shop/shop-prompt';
import {
    getTavernShopStateAtAnchor,
} from '../../../../../shared/shop/shop-service';
import {
    resolveTavernWorldbookAtStoryBoundary,
} from '../../../../runtime/anchored-worldbook';
import {
    buildContextHistory,
    loadTavernPromptHistoryWindow,
    type TavernGetNativeWorldInfoRuntime,
} from '../../../../runtime/run-once';
import {
    buildTavernPhonePromptMessages,
    buildTavernPhoneThreadContextMessage,
} from './tavern-messages-prompt';

function normalizeIncomingMessage(value: unknown): string {
    return String(value || '').replace(/\r\n?/g, '\n').trim().slice(0, 2000);
}

function filterMemoryContext(
    memoryContext: XbTavernMemoryContext | undefined,
    runtime: TavernSessionContractRuntime,
): XbTavernMemoryContext | undefined {
    if (!memoryContext) {return memoryContext;}
    const filtered: XbTavernMemoryContext = {};
    if (runtime.includeMemoryFiles && Array.isArray(memoryContext.memoryFiles)) {
        filtered.memoryFiles = memoryContext.memoryFiles;
    }
    if (runtime.includeStructuredStates && Array.isArray(memoryContext.structuredStates)) {
        filtered.structuredStates = memoryContext.structuredStates;
    }
    if (runtime.includeStructuredStates && memoryContext.spatialState) {
        filtered.spatialState = memoryContext.spatialState;
    }
    if (runtime.includeStatusStates && memoryContext.statusPanelYaml) {
        filtered.statusPanelYaml = memoryContext.statusPanelYaml;
    }
    return filtered;
}

function buildContactContext(input: {
    context: XbTavernContext;
    contact: TavernCommunicationContactRecord;
    profile: string;
}): XbTavernContext {
    return {
        ...input.context,
        authorNote: undefined,
        character: {
            name: input.contact.name,
            characterKey: `phone:${input.contact.id}`,
            description: input.profile,
            personality: '',
            scenario: '',
            mesExample: '',
            data: { description: input.profile },
        },
    };
}

async function resolveShopTurnAtStoryAnchor(input: {
    sessionId: string;
    anchorOrder: number;
    currentTurn: number;
}): Promise<number> {
    const latest = await getLatestTavernMessage(input.sessionId);
    if ((latest?.order ?? -1) === input.anchorOrder) {return input.currentTurn;}
    return await countCompletedTavernAssistantTurnsBefore(input.sessionId, input.anchorOrder + 1);
}

export async function buildTavernMessagesRequestMessages(input: {
    sessionId: string;
    contextSnapshot: XbTavernContext;
    contact: TavernCommunicationContactRecord;
    contactProfile: string;
    thread: TavernCommunicationThreadRecord;
    communicationMessages: TavernCommunicationMessageRecord[];
    userMessage: TavernCommunicationMessageRecord;
    getNativeWorldInfoRuntime: TavernGetNativeWorldInfoRuntime;
}): Promise<XbTavernMessage[]> {
    const session = await getTavernSession(input.sessionId);
    if (!session) {throw new Error('当前私人消息会话不存在。');}
    const sessionState = normalizeTavernSessionState(session.state || {});
    const runtime = resolveTavernSessionContractRuntime(normalizeTavernSessionContract(sessionState.contract));
    const incomingMessage = normalizeIncomingMessage(tavernCommunicationPayloadText(input.userMessage.payload));
    const incomingPayload = input.userMessage.payload.type === 'text'
        ? { type: 'text' as const, text: incomingMessage }
        : input.userMessage.payload;
    const anchorOrder = Number.isInteger(Number(input.userMessage.anchorOrder))
        ? Number(input.userMessage.anchorOrder)
        : -1;
    const anchoredWorldbook = await resolveTavernWorldbookAtStoryBoundary({
        sessionId: input.sessionId,
        contextSnapshot: input.contextSnapshot,
        throughOrder: anchorOrder,
        getNativeWorldInfoRuntime: input.getNativeWorldInfoRuntime,
    });
    const historyWindow = await loadTavernPromptHistoryWindow({
        sessionId: input.sessionId,
        contextWindowStartOrder: sessionState.contextWindowStartOrder,
        currentUserMessage: incomingMessage,
        beforeOrder: anchorOrder + 1,
    });
    const mainHistory = buildContextHistory(historyWindow.historyMessages);
    const baseContext = buildContactContext({
        context: input.contextSnapshot,
        contact: input.contact,
        profile: input.contactProfile,
    });
    const phoneThreadContext = buildTavernPhoneThreadContextMessage({
        playerName: String(baseContext.user?.name || '玩家'),
        contact: input.contact,
        thread: input.thread,
        messages: input.communicationMessages,
        excludeUserSequence: input.userMessage.sequence,
    });
    const contextForBuild: XbTavernContext = {
        ...baseContext,
        worldSettings: {
            ...(baseContext.worldSettings || {}),
            trigger: 'phone',
        },
        history: [
            ...mainHistory,
            phoneThreadContext,
        ],
    };
    const memoryQuery = buildXbTavernMemoryQuery(
        contextForBuild,
        [input.contact.name, incomingMessage].filter(Boolean).join('\n'),
    );
    const retrievedMemory = runtime.includeMemoryFiles || runtime.includeStructuredStates
        ? await retrieveXbTavernMemoryContext({
            sessionId: input.sessionId,
            queryText: memoryQuery,
            ignoredTerms: buildXbTavernMemoryIgnoredTerms(contextForBuild),
            includeMemoryFiles: runtime.includeMemoryFiles,
            includeStructuredStates: runtime.includeStructuredStates,
        })
        : undefined;
    const statusState = runtime.includeStatusStates
        ? await getTavernStatusDocumentForSession(input.sessionId)
        : null;
    const memoryContext = filterMemoryContext({
        ...(retrievedMemory || {}),
        ...(statusState?.document ? { statusPanelYaml: buildTavernStatusPanelYaml(statusState.status) } : {}),
    }, runtime);
    // Read-only projection: active shop effects travel with private messages
    // too, so the replying contact stays under the same rules as the main RP.
    const [shopState, shopTurn] = await Promise.all([
        // Shop actions are anchored to the next story order, while private
        // messages record the latest existing story order. Reading +1 keeps
        // actions made at that boundary and excludes later story state.
        getTavernShopStateAtAnchor(input.sessionId, anchorOrder + 1),
        resolveShopTurnAtStoryAnchor({
            sessionId: input.sessionId,
            anchorOrder,
            currentTurn: sessionState.turn,
        }),
    ]);
    const shopPrompt = buildTavernShopPromptBlock(
        shopState?.state || null,
        shopTurn,
        String(baseContext.user?.name || '').trim(),
    );
    return buildTavernPhonePromptMessages({
        context: contextForBuild,
        contact: input.contact,
        contactProfile: input.contactProfile,
        thread: input.thread,
        communicationMessages: input.communicationMessages,
        mainHistory,
        incomingMessage: incomingPayload,
        anchorOrder,
        incomingUserSequence: input.userMessage.sequence,
        memoryContext,
        activatedWorldEntries: anchoredWorldbook.activatedWorldEntries,
        shopPrompt,
    });
}
