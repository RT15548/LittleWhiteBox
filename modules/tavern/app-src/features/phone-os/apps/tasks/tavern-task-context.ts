import { buildXbTavernBrainAsync } from '../../../../../shared/brain';
import { listTavernCommunicationContacts } from '../../../../../shared/communications';
import {
    buildXbTavernMemoryIgnoredTerms,
    buildXbTavernMemoryQuery,
    retrieveXbTavernMemoryContext,
} from '../../../../../shared/memory-retrieval';
import {
    getCharacterNameFromMemoryPath,
    getTavernMemoryFile,
    isCharacterMemoryPath,
    listTavernMemoryFiles,
} from '../../../../../shared/memory-files';
import type {
    ActivatedWorldEntry,
    TavernChatPromptPresetBundle,
    XbTavernContext,
    XbTavernMessage,
} from '../../../../../shared/message-assembler';
import {
    getTavernSession,
    normalizeTavernSessionState,
} from '../../../../../shared/session-db';
import { buildTavernStatusPanelYaml } from '../../../../../shared/status-prompt';
import { getTavernStatusStateForSession } from '../../../../../shared/status-state';
import { listCurrentTavernTasks } from '../../../../../shared/tasks/task-service';
import { buildContextHistory } from '../../../../runtime/run-once';
import { loadTavernPromptHistoryWindow } from '../../../../runtime/prompt-history-window';

const TASK_ACTIVATION_PRESET: TavernChatPromptPresetBundle = {
    id: 'littlewhitebox-phone-tasks',
    name: '小白酒馆地下委托终端',
    source: 'littlewhitebox',
    selected: true,
    sections: [],
};

export interface TavernTaskPromptLayers {
    context: XbTavernContext;
    history: XbTavernMessage[];
    activatedWorldEntries: ActivatedWorldEntry[];
    stateMemory: string;
    retrievedMemories: Array<{ title?: string; path?: string; content?: string }>;
    status: string;
    map: string;
    structuredStates: string[];
    knownNames: string[];
}

export async function buildTavernTaskPromptLayers(input: {
    sessionId: string;
    contextSnapshot: XbTavernContext;
    anchorOrder: number;
    queryText: string;
}): Promise<TavernTaskPromptLayers> {
    const session = await getTavernSession(input.sessionId);
    if (!session) {throw new Error('task_session_missing');}
    const sessionState = normalizeTavernSessionState(session.state || {});
    const historyWindow = await loadTavernPromptHistoryWindow({
        sessionId: input.sessionId,
        contextWindowStartOrder: sessionState.contextWindowStartOrder,
        beforeOrder: input.anchorOrder + 1,
    });
    const history = buildContextHistory(historyWindow.historyMessages);
    const contextForActivation: XbTavernContext = {
        ...input.contextSnapshot,
        worldSettings: {
            ...(input.contextSnapshot.worldSettings || {}),
            trigger: 'tasks',
        },
        history,
    };
    const [stateMemory, memoryContext, statusState, memoryFiles, contacts, tasks, brain] = await Promise.all([
        getTavernMemoryFile(input.sessionId, 'memory/state.md'),
        retrieveXbTavernMemoryContext({
            sessionId: input.sessionId,
            queryText: buildXbTavernMemoryQuery(contextForActivation, input.queryText),
            ignoredTerms: buildXbTavernMemoryIgnoredTerms(contextForActivation),
            includeMemoryFiles: true,
            includeStructuredStates: true,
        }),
        getTavernStatusStateForSession(input.sessionId),
        listTavernMemoryFiles(input.sessionId),
        listTavernCommunicationContacts(input.sessionId),
        listCurrentTavernTasks(input.sessionId),
        buildXbTavernBrainAsync({
            context: contextForActivation,
            chatPreset: TASK_ACTIVATION_PRESET,
            currentUserMessage: input.queryText,
            historyMode: 'raw',
            turn: sessionState.turn,
            entryStates: sessionState.worldEntryStates,
        }),
    ]);
    const knownNames = [
        contextForActivation.user?.name,
        contextForActivation.character?.name,
        ...contacts.map((contact) => contact.name),
        ...tasks.flatMap((task) => [
            task.issuer.kind === 'world' ? task.issuer.name : '',
            task.assignee?.kind === 'world' ? task.assignee.name : '',
        ]),
        ...memoryFiles
            .filter((file) => isCharacterMemoryPath(file.path))
            .map((file) => getCharacterNameFromMemoryPath(file.path)),
    ].map((value) => String(value || '').trim()).filter(Boolean);
    return {
        context: contextForActivation,
        history,
        activatedWorldEntries: brain.buildResult.activatedWorldEntries,
        stateMemory: String(stateMemory?.content || ''),
        retrievedMemories: (memoryContext.memoryFiles || [])
            .filter((file) => isCharacterMemoryPath(String(file.path || '')))
            .map((file) => ({
                title: file.title,
                path: file.path,
                content: file.content,
            })),
        status: buildTavernStatusPanelYaml(statusState.status),
        map: String(memoryContext.spatialState || ''),
        structuredStates: (memoryContext.structuredStates || []).map((item) => [
            item.title || `${item.docType || 'state'}/${item.docId || 'main'}`,
            item.digest || '',
        ].filter(Boolean).join('：')),
        knownNames: [...new Set(knownNames)],
    };
}
