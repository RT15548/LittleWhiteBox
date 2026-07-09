import {
    buildXbTavernMessagesAsync,
    buildXbTavernMessages,
    createXbTavernBuildSnapshot,
    type XbTavernConversationMessagesTransform,
    type XbTavernFinalMessagesTransform,
    type XbTavernWorldEntriesTransform,
    type XbTavernBuildSnapshot,
    type XbTavernContext,
    type XbTavernMemoryContext,
    type XbTavernMessage,
    type XbTavernMessageBuildResult,
    type XbTavernRuntimeDepthEntry,
    type TavernChatPromptPresetBundle,
    type XbTavernRuntimeState,
    type XbTavernWorldEntryState,
    type XbTavernWorldSettings,
} from './message-assembler';
import type { TavernRegexApplicationSummary } from './regex';

export const DEFAULT_XB_TAVERN_WORLD_SETTINGS = Object.freeze({
    recursion: true,
    recursionLimit: 4,
    budgetChars: 24000,
});

export interface XbTavernBrainBuildInput {
    context: XbTavernContext;
    chatPreset?: TavernChatPromptPresetBundle;
    preset?: TavernChatPromptPresetBundle;
    currentUserMessage: string;
    historyMode?: XbTavernRuntimeState['historyMode'];
    turn?: number;
    entryStates?: Record<string, XbTavernWorldEntryState>;
    memoryContext?: XbTavernMemoryContext;
    runtimeDepthEntries?: XbTavernRuntimeDepthEntry[];
    runtimeProtocolMessages?: XbTavernMessage[];
    diagnostics?: unknown;
}

export interface XbTavernBrainAsyncBuildInput extends XbTavernBrainBuildInput {
    transformWorldEntries?: XbTavernWorldEntriesTransform;
    transformConversationMessages?: XbTavernConversationMessagesTransform;
    transformFinalMessages?: XbTavernFinalMessagesTransform;
    regexApplications?: TavernRegexApplicationSummary;
}

export interface XbTavernBrainBuildResult {
    runtimeState: XbTavernRuntimeState;
    buildResult: XbTavernMessageBuildResult;
    buildSnapshot: XbTavernBuildSnapshot;
    rawMessagesJson: string;
}

export function createXbTavernWorldSettings(input: {
    turn?: number;
    entryStates?: Record<string, XbTavernWorldEntryState>;
    worldSettings?: Partial<XbTavernWorldSettings>;
} = {}): XbTavernWorldSettings {
    const source = input.worldSettings || {};
    return {
        ...DEFAULT_XB_TAVERN_WORLD_SETTINGS,
        ...source,
        turn: Math.max(0, Number(input.turn) || 0),
        entryStates: input.entryStates || {},
    };
}

export function createXbTavernRuntimeState(input: XbTavernBrainBuildInput): XbTavernRuntimeState {
    return {
        currentUserMessage: String(input.currentUserMessage || ''),
        historyMode: input.historyMode || 'raw',
        worldSettings: createXbTavernWorldSettings({
            worldSettings: input.context?.worldSettings,
            turn: input.turn,
            entryStates: input.entryStates,
        }),
        memoryContext: input.memoryContext,
        runtimeDepthEntries: input.runtimeDepthEntries,
        runtimeProtocolMessages: input.runtimeProtocolMessages,
    };
}

export function buildXbTavernBrain(input: XbTavernBrainBuildInput): XbTavernBrainBuildResult {
    const context = input.context || {};
    const chatPreset = input.chatPreset || input.preset || {};
    const runtimeState = createXbTavernRuntimeState(input);
    const buildResult = buildXbTavernMessages(context, chatPreset, runtimeState);
    const buildSnapshot = createXbTavernBuildSnapshot(context, chatPreset, buildResult, input.diagnostics);
    return {
        runtimeState,
        buildResult,
        buildSnapshot,
        rawMessagesJson: buildResult.meta.rawMessagesJson,
    };
}

export async function buildXbTavernBrainAsync(input: XbTavernBrainAsyncBuildInput): Promise<XbTavernBrainBuildResult> {
    const context = input.context || {};
    const chatPreset = input.chatPreset || input.preset || {};
    const runtimeState = createXbTavernRuntimeState(input);
    const buildResult = await buildXbTavernMessagesAsync(context, chatPreset, runtimeState, {
        transformWorldEntries: input.transformWorldEntries,
        transformConversationMessages: input.transformConversationMessages,
        transformFinalMessages: input.transformFinalMessages,
        regexApplications: input.regexApplications,
    });
    const buildSnapshot = createXbTavernBuildSnapshot(context, chatPreset, buildResult, input.diagnostics);
    return {
        runtimeState,
        buildResult,
        buildSnapshot,
        rawMessagesJson: buildResult.meta.rawMessagesJson,
    };
}
