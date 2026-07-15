import { buildXbTavernBrainAsync } from '../../../../../shared/brain';
import {
    type TavernChatPromptPresetBundle,
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
import { getTavernStatusStateForSession } from '../../../../../shared/status-state';
import { buildTavernStatusPanelYaml } from '../../../../../shared/status-prompt';
import { getLatestQuestHooksForPrompt } from '../../../../../shared/tasks';
import { buildContextHistory, loadTavernPromptHistoryWindow } from '../../../../runtime/run-once';
import {
    buildTavernIncomingPhoneMessage,
    buildTavernPhonePromptMessages,
    buildTavernPhoneThreadContextMessage,
} from './tavern-messages-prompt';

function normalizeIncomingMessage(value: unknown): string {
    return String(value || '').replace(/\r\n?/g, '\n').trim().slice(0, 2000);
}

const PHONE_ACTIVATION_PRESET: TavernChatPromptPresetBundle = {
    id: 'littlewhitebox-phone-channel',
    name: '小白酒馆手机通讯',
    source: 'littlewhitebox',
    selected: true,
    sections: [],
};

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
    if (runtime.includeQuestOrchestration && Array.isArray(memoryContext.questHooks)) {
        filtered.questHooks = memoryContext.questHooks;
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

export async function buildTavernMessagesRequestMessages(input: {
    sessionId: string;
    contextSnapshot: XbTavernContext;
    contact: TavernCommunicationContactRecord;
    contactProfile: string;
    thread: TavernCommunicationThreadRecord;
    communicationMessages: TavernCommunicationMessageRecord[];
    userMessage: TavernCommunicationMessageRecord;
}): Promise<XbTavernMessage[]> {
    const session = await getTavernSession(input.sessionId);
    if (!session) {throw new Error('当前手机通讯会话不存在。');}
    const sessionState = normalizeTavernSessionState(session.state || {});
    const runtime = resolveTavernSessionContractRuntime(normalizeTavernSessionContract(sessionState.contract));
    const incomingMessage = normalizeIncomingMessage(input.userMessage.content);
    const anchorOrder = Number.isInteger(Number(input.userMessage.anchorOrder))
        ? Number(input.userMessage.anchorOrder)
        : -1;
    const historyWindow = await loadTavernPromptHistoryWindow({
        sessionId: input.sessionId,
        contextWindowStartOrder: sessionState.contextWindowStartOrder,
        currentUserMessage: incomingMessage,
        beforeOrder: anchorOrder + 1,
    });
    const baseContext = buildContactContext({
        context: input.contextSnapshot,
        contact: input.contact,
        profile: input.contactProfile,
    });
    const mainHistory = buildContextHistory(historyWindow.historyMessages);
    const phoneThreadContext = buildTavernPhoneThreadContextMessage({
        contact: input.contact,
        thread: input.thread,
        messages: input.communicationMessages,
        incomingMessage,
        anchorOrder,
        includeIncoming: false,
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
    const questHooks = runtime.includeQuestOrchestration
        ? await getLatestQuestHooksForPrompt(input.sessionId, 1)
        : [];
    const statusState = runtime.includeStatusStates
        ? await getTavernStatusStateForSession(input.sessionId)
        : null;
    const memoryContext = filterMemoryContext({
        ...(retrievedMemory || {}),
        ...(questHooks.length ? { questHooks } : {}),
        ...(statusState?.document ? { statusPanelYaml: buildTavernStatusPanelYaml(statusState.status) } : {}),
    }, runtime);
    const currentUserMessage = buildTavernIncomingPhoneMessage(incomingMessage, anchorOrder);
    const brain = await buildXbTavernBrainAsync({
        context: contextForBuild,
        chatPreset: PHONE_ACTIVATION_PRESET,
        currentUserMessage,
        historyMode: 'raw',
        turn: sessionState.turn,
        entryStates: sessionState.worldEntryStates,
    });
    return buildTavernPhonePromptMessages({
        context: contextForBuild,
        contact: input.contact,
        contactProfile: input.contactProfile,
        thread: input.thread,
        communicationMessages: input.communicationMessages,
        mainHistory,
        incomingMessage,
        anchorOrder,
        incomingUserSequence: input.userMessage.sequence,
        memoryContext,
        activatedWorldEntries: brain.buildResult.activatedWorldEntries,
    });
}
