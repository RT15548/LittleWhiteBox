export interface FourthWallMessageData {
    role: 'user' | 'ai';
    content: string;
    ts: number;
    thinking?: string;
    type?: string;
}

export interface FourthWallChatSettings {
    maxChatLayers: number;
    stream: boolean;
    disableAssistantPrefill: boolean;
}

export interface FourthWallSession {
    id: string;
    name: string;
    createdAt: number;
    history: FourthWallMessageData[];
    memory: string;
    archivedCount: number;
}

export interface FourthWallChatState {
    settings: FourthWallChatSettings;
    sessions: FourthWallSession[];
    activeSessionId: string;
}

export interface FourthWallPartition {
    schemaVersion: 2;
    state: FourthWallChatState;
}

export interface FourthWallPromptTemplates {
    topuser: string;
    confirm: string;
    metaProtocol: string;
    bottom: string;
}

export interface FourthWallGlobalSettings {
    image: { enablePrompt: boolean };
    voice: { enabled: boolean };
    commentary: { enabled: boolean; probability: number };
    promptTemplates: FourthWallPromptTemplates;
}

export interface FourthWallMainChatMessage {
    index: number;
    name: string;
    isUser: boolean;
    text: string;
}

export interface FourthWallChatSnapshot {
    chatIdentity: string;
    userName: string;
    characterName: string;
    userAvatar: string;
    characterAvatar: string;
    messages: FourthWallMainChatMessage[];
}

export interface FourthWallBuiltPrompt {
    msg1: string;
    msg2: string;
    msg3: string;
    msg4: string;
}

export interface FourthWallThought {
    label?: string;
    text?: string;
}

export interface FourthWallGenerationResult {
    text?: string;
    thoughts?: Array<string | FourthWallThought | null | undefined>;
    provider?: string;
    model?: string;
    finishReason?: string;
    refused?: boolean;
}

export interface FourthWallProjection {
    text: string;
    thinking: string;
}

export type FourthWallCommentaryKind = 'ai_message' | 'edit_own' | 'edit_ai';

export interface FourthWallCommentaryEvent {
    kind: FourthWallCommentaryKind | 'edited';
    chatId?: string;
    messageId?: number;
    data?: unknown;
}

export interface FourthWallCapturedCommentary {
    chatIdentity: string;
    messageIndex: number;
    text: string;
    kind: FourthWallCommentaryKind;
    chatSnapshot: FourthWallChatSnapshot;
}

export interface FourthWallPromptInput {
    userInput: string;
    history: FourthWallMessageData[];
    memory?: string;
    chatSnapshot: FourthWallChatSnapshot | null;
    settings: FourthWallChatSettings;
    globalSettings: FourthWallGlobalSettings;
    commentary?: boolean;
}

export interface FourthWallCommentaryPromptInput extends Omit<FourthWallPromptInput, 'userInput' | 'commentary'> {
    type: FourthWallCommentaryKind;
    targetText: string;
}

export interface FourthWallGlobalSettingsPatch {
    image?: Partial<FourthWallGlobalSettings['image']>;
    voice?: Partial<FourthWallGlobalSettings['voice']>;
    commentary?: Partial<FourthWallGlobalSettings['commentary']>;
    promptTemplates?: Partial<FourthWallPromptTemplates>;
}

export interface FourthWallClientState {
    chatIdentity: string;
    userName: string;
    characterName: string;
    userAvatar: string;
    characterAvatar: string;
    chat: {
        settings: FourthWallChatSettings;
        activeSessionId: string;
        sessions: FourthWallSessionInfo[];
    };
    history: FourthWallHistoryPage;
    context: FourthWallContextStats;
    global: FourthWallGlobalSettings;
    capabilities: {
        image: { available: boolean };
        voice: { available: boolean };
    };
}

export interface FourthWallGenerationState {
    status: 'idle' | 'started' | 'progress' | 'error';
    sessionId: string;
    text: string;
    thinking: string;
    message: string;
    unsaved: boolean;
    phase?: FourthWallTaskPhase;
    manual?: boolean;
}

export type FourthWallTaskPhase = 'counting' | 'summarizing' | 'saving' | 'replying';
export type FourthWallSessionInfo = Omit<FourthWallSession, 'history' | 'memory'> & {
    messageCount: number;
    hasMemory: boolean;
};
export interface FourthWallHistoryPage {
    sessionId: string;
    revision: number;
    start: number;
    total: number;
    messages: FourthWallMessageData[];
}
export interface FourthWallContextStats {
    usedTokens: number;
    limit: number;
    trigger: number;
    mainTokens: number;
    memoryTokens: number;
    historyTokens: number;
    promptTokens: number;
    canSummarize: boolean;
}
