import type { TavernRegexApplicationSummary } from './regex';

export enum XBTavernWorldPosition {
    before = 0,
    after = 1,
    ANTop = 2,
    ANBottom = 3,
    atDepth = 4,
    EMTop = 5,
    EMBottom = 6,
    outlet = 7,
}

export enum XBTavernPromptRole {
    SYSTEM = 0,
    USER = 1,
    ASSISTANT = 2,
}

export enum XBTavernAuthorNotePosition {
    AFTER_MAIN = 0,
    IN_CHAT = 1,
    BEFORE_MAIN = 2,
}

export enum XBTavernSelectiveLogic {
    AND_ANY = 0,
    NOT_ALL = 1,
    NOT_ANY = 2,
    AND_ALL = 3,
}

export type XbTavernRole = 'system' | 'user' | 'assistant' | 'tool';

export interface XbTavernMessage {
    role: XbTavernRole;
    content: string;
    name?: string;
    thoughts?: Array<{ label?: string; text?: string }>;
    providerPayload?: unknown;
    tool_calls?: Array<{
        id?: string;
        type?: string;
        function?: {
            name?: string;
            arguments?: string;
        };
    }>;
    toolCalls?: Array<{
        id?: string;
        name?: string;
        arguments?: string;
    }>;
    tool_call_id?: string;
    toolCallId?: string;
    toolName?: string;
    toolDisplay?: unknown;
}

export interface XbTavernCharacter {
    characterKey?: string;
    nativeCharacterId?: string;
    name?: string;
    avatar?: string;
    tags?: string[];
    description?: string;
    personality?: string;
    scenario?: string;
    characterDepthPrompt?: string;
    character_depth_prompt?: string;
    firstMessage?: string;
    first_mes?: string;
    alternateGreetings?: string[];
    alternate_greetings?: string[];
    mesExample?: string;
    mes_example?: string;
    creatorNotes?: string;
    creator_notes?: string;
    data?: Record<string, unknown>;
}

export interface XbTavernUser {
    id?: string;
    name?: string;
    avatar?: string;
    persona?: string;
    description?: string;
}

export interface XbTavernAuthorNote {
    prompt?: string;
    interval?: number;
    position?: number;
    depth?: number;
    role?: number;
    scan?: boolean;
    characterName?: string;
    characterPrompt?: string;
    characterUse?: boolean;
    characterPosition?: number;
}

export const DEFAULT_XB_TAVERN_AUTHOR_NOTE: Required<Pick<XbTavernAuthorNote, 'prompt' | 'interval' | 'position' | 'depth' | 'role' | 'scan'>> = {
    prompt: '',
    interval: 1,
    position: XBTavernAuthorNotePosition.IN_CHAT,
    depth: 4,
    role: XBTavernPromptRole.SYSTEM,
    scan: false,
};

function normalizedRecord(value: unknown): Record<string, unknown> {
    return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function normalizeNonNegativeInteger(value: unknown, fallback = 0): number {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? Math.max(0, Math.floor(numberValue)) : fallback;
}

function normalizeAuthorNotePosition(value: unknown): XBTavernAuthorNotePosition {
    const position = Number(value);
    if (position === XBTavernAuthorNotePosition.AFTER_MAIN) {return XBTavernAuthorNotePosition.AFTER_MAIN;}
    if (position === XBTavernAuthorNotePosition.BEFORE_MAIN) {return XBTavernAuthorNotePosition.BEFORE_MAIN;}
    return XBTavernAuthorNotePosition.IN_CHAT;
}

function normalizeAuthorNoteRole(value: unknown): XBTavernPromptRole {
    const role = Number(value);
    if (role === XBTavernPromptRole.USER) {return XBTavernPromptRole.USER;}
    if (role === XBTavernPromptRole.ASSISTANT) {return XBTavernPromptRole.ASSISTANT;}
    return XBTavernPromptRole.SYSTEM;
}

export function normalizeXbTavernAuthorNote(value: unknown = {}): XbTavernAuthorNote {
    const source = normalizedRecord(value);
    return {
        prompt: normalizeText(source.prompt),
        interval: normalizeNonNegativeInteger(source.interval, DEFAULT_XB_TAVERN_AUTHOR_NOTE.interval),
        position: normalizeAuthorNotePosition(source.position),
        depth: normalizeNonNegativeInteger(source.depth, DEFAULT_XB_TAVERN_AUTHOR_NOTE.depth),
        role: normalizeAuthorNoteRole(source.role),
        scan: source.scan === true,
        characterName: normalizeText(source.characterName),
        characterPrompt: normalizeText(source.characterPrompt),
        characterUse: source.characterUse === true,
        characterPosition: normalizeNonNegativeInteger(source.characterPosition, 0),
    };
}

function countAuthorNoteUserMessages(context: XbTavernContext = {}, currentUserMessage = ''): number {
    const history = Array.isArray(context.history) ? context.history : [];
    const historyCount = history.filter((message) => normalizeRole(message.role ?? message.is_user) === 'user').length;
    return historyCount + (normalizeText(currentUserMessage) ? 1 : 0);
}

export function resolveXbTavernAuthorNoteState(context: XbTavernContext = {}, currentUserMessage = ''): {
    shouldAddPrompt: boolean;
    prompt: string;
    position: number;
    depth: number;
    role: number;
    scan: boolean;
} {
    const note = normalizeXbTavernAuthorNote(context.authorNote);
    let userMessageCount = countAuthorNoteUserMessages(context, currentUserMessage);
    if (note.interval === 1) {userMessageCount = 1;}
    const shouldAddPrompt = userMessageCount > 0
        && note.interval > 0
        && (userMessageCount >= note.interval ? userMessageCount % note.interval === 0 : false);
    let prompt = shouldAddPrompt ? normalizeText(note.prompt) : '';
    if (shouldAddPrompt && note.characterUse === true) {
        const characterPrompt = normalizeText(note.characterPrompt);
        switch (note.characterPosition) {
            case 1:
                prompt = [characterPrompt, prompt].filter(Boolean).join('\n');
                break;
            case 2:
                prompt = [prompt, characterPrompt].filter(Boolean).join('\n');
                break;
            default:
                prompt = characterPrompt;
                break;
        }
    }
    return {
        shouldAddPrompt,
        prompt,
        position: note.position,
        depth: note.depth,
        role: note.role,
        scan: note.scan === true,
    };
}

export function buildAuthorNoteInjectScanText(context: XbTavernContext = {}, currentUserMessage = ''): string {
    const state = resolveXbTavernAuthorNoteState(context, currentUserMessage);
    return state.scan && state.shouldAddPrompt ? normalizeText(state.prompt) : '';
}

export interface XbTavernHistoryMessage {
    role?: XbTavernRole | 'model' | 'sys' | number;
    content?: string;
    mes?: string;
    message?: string;
    name?: string;
    is_user?: boolean;
    thoughts?: Array<{ label?: string; text?: string }>;
}

export interface XbTavernWorldBook {
    name: string;
    entries: XbTavernWorldEntry[];
    error?: string;
    worldSourceType?: 'chat' | 'persona' | 'character' | 'global' | string;
    worldSourceIndex?: number;
}

export interface XbTavernWorldEntry {
    uid?: string | number;
    id?: string | number;
    key?: string[] | string;
    keysecondary?: string[] | string;
    secondary_keys?: string[] | string;
    content?: string;
    comment?: string;
    title?: string;
    name?: string;
    order?: number;
    position?: XBTavernWorldPosition | keyof typeof XBTavernWorldPosition | string | number;
    role?: XbTavernRole | XBTavernPromptRole | number | string;
    depth?: number;
    constant?: boolean;
    disable?: boolean;
    disabled?: boolean;
    enabled?: boolean;
    vectorized?: boolean;
    decorators?: string[] | string;
    selective?: boolean;
    selectiveLogic?: XBTavernSelectiveLogic | number;
    selective_logic?: XBTavernSelectiveLogic | number;
    scanDepth?: number | null;
    scan_depth?: number | null;
    caseSensitive?: boolean;
    case_sensitive?: boolean;
    matchWholeWords?: boolean;
    match_whole_words?: boolean;
    ignoreBudget?: boolean;
    ignore_budget?: boolean;
    excludeRecursion?: boolean;
    exclude_recursion?: boolean;
    preventRecursion?: boolean;
    prevent_recursion?: boolean;
    delayUntilRecursion?: boolean | number;
    delay_until_recursion?: boolean | number;
    characterFilter?: {
        names?: string[];
        tags?: string[];
        isExclude?: boolean;
    };
    group?: string;
    groupOverride?: boolean;
    group_override?: boolean;
    groupWeight?: number;
    group_weight?: number;
    useGroupScoring?: boolean | null;
    use_group_scoring?: boolean | null;
    matchPersonaDescription?: boolean;
    matchCharacterDescription?: boolean;
    matchCharacterPersonality?: boolean;
    matchCharacterDepthPrompt?: boolean;
    matchScenario?: boolean;
    matchCreatorNotes?: boolean;
    probability?: number;
    useProbability?: boolean;
    useProbabilityGlobal?: boolean;
    sticky?: number | boolean;
    cooldown?: number;
    delay?: number;
    triggers?: string[];
    outlet?: string;
    outletName?: string;
    world?: string;
    worldName?: string;
    worldSourceType?: 'chat' | 'persona' | 'character' | 'global' | string;
    worldSourceIndex?: number;
    sourceWorldBook?: string;
    extensions?: Record<string, unknown>;
}

export interface XbTavernNativeWorldInfoTimedEffect {
    hash?: number;
    start?: number;
    end?: number;
    protected?: boolean;
}

export interface XbTavernNativeWorldInfoTimedState {
    sticky?: Record<string, XbTavernNativeWorldInfoTimedEffect>;
    cooldown?: Record<string, XbTavernNativeWorldInfoTimedEffect>;
}

export interface XbTavernNativeWorldInfoSource {
    name: string;
    sourceType?: 'chat' | 'persona' | 'character' | 'global' | string;
    sourceIndex?: number;
}

export interface XbTavernNativeWorldInfoRuntime {
    trigger?: string;
    sourceNames?: XbTavernNativeWorldInfoSource[];
    activatedEntries?: XbTavernWorldEntry[];
    worldInfoBefore?: string;
    worldInfoAfter?: string;
    worldInfoExamples?: Array<{ position?: string; content?: string }>;
    worldInfoDepth?: Array<{ depth?: number; role?: number; entries?: string[] }>;
    anBefore?: string[];
    anAfter?: string[];
    outlets?: Record<string, string[]>;
    timedState?: XbTavernNativeWorldInfoTimedState;
}

export interface XbTavernContext {
    character?: XbTavernCharacter;
    user?: XbTavernUser;
    authorNote?: XbTavernAuthorNote;
    history?: XbTavernHistoryMessage[];
    worldBooks?: XbTavernWorldBook[];
    worldEntries?: XbTavernWorldEntry[];
    worldSettings?: Partial<XbTavernWorldSettings>;
    nativeWorldInfo?: XbTavernNativeWorldInfoRuntime;
    sessionMeta?: Record<string, unknown>;
}

export type TavernChatPromptPlacement =
    | 'top'
    | 'beforeCharacter'
    | 'afterCharacter'
    | 'beforeHistory'
    | 'afterHistory'
    | 'assistantPrefill';

export interface TavernChatPromptSection {
    id?: string;
    label?: string;
    locked?: boolean;
    enabled?: boolean;
    marker?: boolean;
    role?: XbTavernRole | XBTavernPromptRole | number | string;
    content?: string;
    placement?: TavernChatPromptPlacement;
    source?: 'promptManager' | 'systemPrompt' | 'contextTemplate' | 'instructTemplate' | 'manual' | string;
}

export interface TavernChatPromptPresetBundle {
    id?: string;
    name?: string;
    description?: string;
    version?: string;
    source?: 'sillytavern' | string;
    selected?: boolean;
    promptManager?: {
        name?: string;
        prompts?: unknown[];
        promptOrder?: unknown;
        rawPreset?: Record<string, unknown>;
        activeCharacterId?: string | number;
        activeOrder?: unknown[];
    };
    systemPrompt?: {
        name?: string;
        enabled?: boolean;
        content?: string;
        postHistory?: string;
    };
    contextTemplate?: {
        name?: string;
        storyString?: string;
        chatStart?: string;
        exampleSeparator?: string;
    };
    instructTemplate?: {
        name?: string;
        enabled?: boolean;
        inputSequence?: string;
        inputSuffix?: string;
        outputSequence?: string;
        outputSuffix?: string;
        systemSequence?: string;
        systemSuffix?: string;
        firstInputSequence?: string;
        lastInputSequence?: string;
        firstOutputSequence?: string;
        lastOutputSequence?: string;
        stopSequence?: string;
    };
    historySeparator?: string;
    sections?: TavernChatPromptSection[];
    updatedAt?: number;
}

export type XbTavernPresetPlacement = TavernChatPromptPlacement;
export type XbTavernPresetSection = TavernChatPromptSection;
export type XbTavernPreset = TavernChatPromptPresetBundle;

export interface XbTavernRuntimeState {
    currentUserMessage?: string;
    historyMode?: 'raw' | 'squash';
    squashRole?: XbTavernRole;
    worldScanText?: string;
    worldSettings?: XbTavernWorldSettings;
    memoryContext?: XbTavernMemoryContext;
    runtimeDepthEntries?: XbTavernRuntimeDepthEntry[];
    runtimeProtocolMessages?: XbTavernMessage[];
    turn?: number;
    entryStates?: Record<string, XbTavernWorldEntryState>;
}

export interface XbTavernRuntimeDepthEntry {
    content?: string;
    depth?: number;
    role?: XbTavernRole;
    order?: number;
    label?: string;
    layer?: string;
}

export interface XbTavernMemoryContext {
    memoryFiles?: XbTavernMemoryFileSummary[];
    structuredStates?: XbTavernStructuredStateSummary[];
    spatialState?: string;
    statusPanelYaml?: string;
    questHooks?: string[];
}

export interface XbTavernStructuredStateSummary {
    docType?: string;
    docId?: string;
    title?: string;
    revision?: number;
    digest?: string;
}

export interface XbTavernMemoryFileSummary {
    path?: string;
    title?: string;
    content?: string;
    recallReason?: string;
    recallScore?: number;
}

export interface XbTavernWorldEntryState {
    stickyUntilTurn?: number;
    cooldownUntilTurn?: number;
    delayUntilTurn?: number;
}

export interface XbTavernWorldSettings {
    scanText?: string;
    injectScanText?: string;
    scanMessages?: string[];
    scanDepth?: number;
    globalScanData?: {
        personaDescription?: string;
        characterDescription?: string;
        characterPersonality?: string;
        characterDepthPrompt?: string;
        scenario?: string;
        creatorNotes?: string;
    };
    characterFilterData?: {
        names?: string[];
        tags?: string[];
    };
    caseSensitive?: boolean;
    matchWholeWords?: boolean;
    budgetChars?: number;
    recursion?: boolean;
    recursionLimit?: number;
    insertionStrategy?: number;
    includeNames?: boolean;
    useGroupScoring?: boolean;
    minActivations?: number;
    minActivationsDepthMax?: number;
    trigger?: string;
    turn?: number;
    entryStates?: Record<string, XbTavernWorldEntryState>;
    random?: () => number;
}

export interface ActivatedWorldEntry extends XbTavernWorldEntry {
    uid: string | number;
    activationKey: string;
    content: string;
    key: string[];
    keysecondary: string[];
    decorators: string[];
    position: XBTavernWorldPosition;
    role: XbTavernRole;
    order: number;
    depth: number;
    activationReason: string;
    sourceWorldBook: string;
    worldSourceType?: string;
    worldSourceIndex?: number;
    contentChars: number;
    scanDepth?: number | null;
    ignoreBudget?: boolean;
    excludeRecursion?: boolean;
    preventRecursion?: boolean;
    delayUntilRecursion?: boolean | number;
    group?: string;
    groupOverride?: boolean;
    groupWeight?: number;
    useGroupScoring?: boolean | null;
}

export interface XbTavernWorldEntryCandidate {
    uid: string | number;
    activationKey: string;
    title: string;
    sourceWorldBook: string;
    worldSourceType?: string;
    worldSourceIndex?: number;
    content: string;
    contentChars: number;
    key: string[];
    keysecondary: string[];
    matchedKeys: string[];
    matchedSecondaryKeys: string[];
    decorators: string[];
    position: XBTavernWorldPosition;
    positionLabel: string;
    role: XbTavernRole;
    order: number;
    depth: number;
    status: string;
    activationReason: string;
    budgetUsedBefore?: number;
    budgetRemainingBefore?: number;
    budgetShortfall?: number;
    insertionTarget: string;
}

export interface XbTavernMessageLayer {
    index: number;
    role: XbTavernRole;
    layer: string;
    label: string;
    sourceId?: string;
    chars: number;
    tokenEstimate: number;
}

export interface XbTavernMessageBuildResult {
    messages: XbTavernMessage[];
    messageLayers: XbTavernMessageLayer[];
    activatedWorldEntries: ActivatedWorldEntry[];
    worldEntryCandidates: XbTavernWorldEntryCandidate[];
    outlets: Record<string, string>;
    meta: {
        scanText: string;
        scanTextChars: number;
        historyMode: 'raw' | 'squash';
        squashedHistory: boolean;
        rawMessagesJson: string;
        regexApplications?: TavernRegexApplicationSummary;
        worldBudget: {
            enabled: boolean;
            limit: number;
            used: number;
            remaining: number;
            activatedChars: number;
            skippedChars: number;
        };
        worldPositionCounts: Record<string, number>;
        worldEntryStateUpdates: Record<string, XbTavernWorldEntryState>;
        structuredStates?: XbTavernStructuredStateSummary[];
        spatialState?: string;
        statusPanelYaml?: string;
    };
}

export interface XbTavernBuildSnapshot {
    chatPresetId: string;
    chatPresetName: string;
    presetId: string;
    presetName: string;
    characterKey: string;
    characterName: string;
    userName: string;
    historyCount: number;
    worldBooks: Array<{ name: string; entries: number; error?: string }>;
    messageCount: number;
    messageChars: number;
    messageLayers: XbTavernMessageLayer[];
    rawMessagesJson: string;
    regexApplications?: TavernRegexApplicationSummary;
    activatedWorldEntries: Array<{
        uid: string | number;
        sourceWorldBook: string;
        title: string;
        activationReason: string;
        insertionTarget: string;
        contentChars: number;
    }>;
    nativeWorldInfo?: {
        trigger: string;
        sourceNames: XbTavernNativeWorldInfoSource[];
    };
    structuredStates?: Array<{
        docType: string;
        docId: string;
        revision: number;
        digestChars: number;
    }>;
    spatialStateChars?: number;
    statusPanelChars?: number;
    worldBudget: XbTavernMessageBuildResult['meta']['worldBudget'];
    worldPositionCounts: Record<string, number>;
    scanTextChars: number;
    diagnostics?: unknown;
}

export type XbTavernWorldEntriesTransform = (entries: ActivatedWorldEntry[]) => ActivatedWorldEntry[] | Promise<ActivatedWorldEntry[]>;
export type XbTavernConversationMessagesTransform = (messages: XbTavernMessage[]) => XbTavernMessage[] | Promise<XbTavernMessage[]>;
export type XbTavernFinalMessagesTransform = (messages: XbTavernMessage[]) => XbTavernMessage[] | Promise<XbTavernMessage[]>;

const ROLE_BY_NUMBER: Record<number, XbTavernRole> = {
    [XBTavernPromptRole.SYSTEM]: 'system',
    [XBTavernPromptRole.USER]: 'user',
    [XBTavernPromptRole.ASSISTANT]: 'assistant',
};

const POSITION_ALIASES: Record<string, XBTavernWorldPosition> = {
    before: XBTavernWorldPosition.before,
    before_char: XBTavernWorldPosition.before,
    beforeCharacter: XBTavernWorldPosition.before,
    after: XBTavernWorldPosition.after,
    after_char: XBTavernWorldPosition.after,
    afterCharacter: XBTavernWorldPosition.after,
    atDepth: XBTavernWorldPosition.atDepth,
    depth: XBTavernWorldPosition.atDepth,
    outlet: XBTavernWorldPosition.outlet,
    ANTop: XBTavernWorldPosition.ANTop,
    ANBottom: XBTavernWorldPosition.ANBottom,
    EMTop: XBTavernWorldPosition.EMTop,
    EMBottom: XBTavernWorldPosition.EMBottom,
};

const POSITION_LABELS: Record<XBTavernWorldPosition, string> = {
    [XBTavernWorldPosition.before]: 'before character',
    [XBTavernWorldPosition.after]: 'after character',
    [XBTavernWorldPosition.ANTop]: 'author note top',
    [XBTavernWorldPosition.ANBottom]: 'author note bottom',
    [XBTavernWorldPosition.atDepth]: 'depth',
    [XBTavernWorldPosition.EMTop]: 'example top',
    [XBTavernWorldPosition.EMBottom]: 'example bottom',
    [XBTavernWorldPosition.outlet]: 'outlet',
};

const PLACEMENT_ORDER = [
    'top',
    'beforeCharacter',
    'afterCharacter',
    'beforeHistory',
    'afterHistory',
    'assistantPrefill',
] as const;

interface NormalizedPresetSection {
    id?: string;
    label?: string;
    enabled: boolean;
    marker: boolean;
    role: XbTavernRole;
    content: string;
    placement: TavernChatPromptPlacement;
    source?: string;
}

function normalizeText(value: unknown = ''): string {
    return String(value || '').trim();
}

function pickNestedString(source: unknown, keys: string[]): string {
    let record = source;
    for (const key of keys) {
        if (!record || typeof record !== 'object') {return '';}
        record = (record as Record<string, unknown>)[key];
    }
    return normalizeText(record);
}

export function normalizeRole(role: unknown, fallback: XbTavernRole = 'system'): XbTavernRole {
    if (typeof role === 'number' && ROLE_BY_NUMBER[role]) {return ROLE_BY_NUMBER[role];}
    const normalized = String(role || '').trim().toLowerCase();
    if (normalized === 'model') {return 'assistant';}
    if (normalized === 'sys') {return 'system';}
    return ['system', 'user', 'assistant', 'tool'].includes(normalized) ? normalized as XbTavernRole : fallback;
}

function makeMessage(role: unknown, content: unknown, extra: Partial<XbTavernMessage> = {}): XbTavernMessage | null {
    const text = normalizeText(content);
    if (!text) {return null;}
    return {
        role: normalizeRole(role),
        content: text,
        ...extra,
    };
}

function normalizeThoughtBlocks(value: unknown): Array<{ label: string; text: string }> {
    if (!Array.isArray(value)) {return [];}
    return value
        .map((thought, index) => {
            const record = thought && typeof thought === 'object' ? thought as Record<string, unknown> : {};
            const text = normalizeText(record.text);
            if (!text) {return null;}
            return {
                label: normalizeText(record.label) || `reasoning ${index + 1}`,
                text,
            };
        })
        .filter((thought): thought is { label: string; text: string } => !!thought);
}

function renderPromptReasoning(thoughts: Array<{ label?: string; text?: string }> = []): string {
    const normalized = normalizeThoughtBlocks(thoughts);
    if (!normalized.length) {return '';}
    return [
        '<reasoning>',
        ...normalized.map((thought) => [
            `<thought label="${normalizeText(thought.label).replace(/"/g, '&quot;')}">`,
            thought.text,
            '</thought>',
        ].join('\n')),
        '</reasoning>',
    ].join('\n');
}

function appendPromptReasoningToMessage(message: XbTavernMessage): XbTavernMessage {
    const { thoughts: _thoughts, ...providerMessage } = message;
    if (message.role !== 'assistant') {return providerMessage;}
    const reasoning = renderPromptReasoning(message.thoughts || []);
    if (!reasoning) {return providerMessage;}
    return {
        ...providerMessage,
        content: [message.content, reasoning].filter(Boolean).join('\n\n'),
    };
}

function compactMessages(messages: Array<XbTavernMessage | null>): XbTavernMessage[] {
    return messages.filter((message): message is XbTavernMessage => !!message && !!normalizeText(message.content));
}

interface XbTavernMessageUnit {
    message: XbTavernMessage | null;
    layer: string;
    label: string;
    sourceId?: string;
}

function makeMessageUnit(
    role: unknown,
    content: unknown,
    layer = 'unknown',
    label = '',
    extra: Partial<XbTavernMessage> = {},
    sourceId = '',
): XbTavernMessageUnit {
    return {
        message: makeMessage(role, content, extra),
        layer,
        label: label || layer,
        sourceId: normalizeText(sourceId),
    };
}

function compactMessageUnits(units: XbTavernMessageUnit[] = []): { messages: XbTavernMessage[]; messageLayers: XbTavernMessageLayer[] } {
    const messages: XbTavernMessage[] = [];
    const messageLayers: XbTavernMessageLayer[] = [];
    units.forEach((unit) => {
        if (!unit.message || !normalizeText(unit.message.content)) {return;}
        const index = messages.length;
        messages.push(unit.message);
        const chars = unit.message.content.length;
        messageLayers.push({
            index,
            role: unit.message.role,
            layer: unit.layer,
            label: unit.label,
            sourceId: unit.sourceId || undefined,
            chars,
            tokenEstimate: Math.max(1, Math.ceil(chars / 4)),
        });
    });
    return { messages, messageLayers };
}

function normalizeStringArray(value: unknown): string[] {
    if (Array.isArray(value)) {
        return value.map((item) => normalizeText(item)).filter(Boolean);
    }
    const text = normalizeText(value);
    return text ? [text] : [];
}

function stripDecorators(content = ''): { decorators: string[]; content: string } {
    const decorators: string[] = [];
    const lines = String(content || '').split('\n');
    let cursor = 0;

    while (cursor < lines.length && lines[cursor].startsWith('@@')) {
        const line = lines[cursor].trim();
        if (line) {decorators.push(line.startsWith('@@@') ? line.slice(1) : line);}
        cursor += 1;
    }

    return {
        decorators,
        content: lines.slice(cursor).join('\n').trim(),
    };
}

function resolveWorldPosition(position: XbTavernWorldEntry['position']): XBTavernWorldPosition {
    if (typeof position === 'number' && Object.values(XBTavernWorldPosition).includes(position)) {
        return position as XBTavernWorldPosition;
    }
    const key = String(position || '').trim();
    return Object.prototype.hasOwnProperty.call(POSITION_ALIASES, key)
        ? POSITION_ALIASES[key]
        : XBTavernWorldPosition.after;
}

function normalizeEntry(entry: XbTavernWorldEntry = {}, index = 0): ActivatedWorldEntry {
    const rawEntry = entry as XbTavernWorldEntry & Record<string, unknown>;
    const extensions = entry.extensions || {};
    const extensionOrEntry = (extensionKey: string, entryKey: string) => (
        Object.prototype.hasOwnProperty.call(extensions, extensionKey) ? extensions[extensionKey] : rawEntry[entryKey]
    );
    const stripped = stripDecorators(entry.content || '');
    const rawUid = entry.uid ?? entry.id ?? entry.comment ?? entry.name ?? index + 1;
    const sourceWorldBook = normalizeText(entry.sourceWorldBook || entry.worldName || entry.world);
    const content = stripped.content || normalizeText(entry.content);
    const rawOrder = rawEntry.order ?? rawEntry.insertion_order;
    return {
        ...entry,
        uid: rawUid,
        activationKey: makeWorldEntryKey(sourceWorldBook, rawUid, index),
        content,
        decorators: [
            ...normalizeStringArray(entry.decorators),
            ...stripped.decorators,
        ],
        key: normalizeStringArray(entry.key),
        keysecondary: [
            ...normalizeStringArray(entry.keysecondary),
            ...normalizeStringArray(entry.secondary_keys),
        ],
        order: Number(rawOrder) || 0,
        disable: rawEntry.disable === true || rawEntry.disabled === true || rawEntry.enabled === false,
        enabled: rawEntry.enabled === false ? false : rawEntry.disable !== true && rawEntry.disabled !== true,
        vectorized: extensionOrEntry('vectorized', 'vectorized') === true,
        depth: Number.isFinite(Number(extensionOrEntry('depth', 'depth'))) ? Number(extensionOrEntry('depth', 'depth')) : 4,
        role: normalizeRole(extensionOrEntry('role', 'role'), 'system'),
        position: resolveWorldPosition(extensionOrEntry('position', 'position') as XbTavernWorldEntry['position']),
        selectiveLogic: extensionOrEntry('selectiveLogic', 'selectiveLogic') as XbTavernWorldEntry['selectiveLogic'],
        scanDepth: Number.isFinite(Number(extensionOrEntry('scan_depth', 'scanDepth'))) ? Number(extensionOrEntry('scan_depth', 'scanDepth')) : null,
        caseSensitive: extensionOrEntry('case_sensitive', 'caseSensitive') as XbTavernWorldEntry['caseSensitive'],
        matchWholeWords: extensionOrEntry('match_whole_words', 'matchWholeWords') as XbTavernWorldEntry['matchWholeWords'],
        characterFilter: (extensionOrEntry('character_filter', 'characterFilter') || rawEntry.character_filter) as XbTavernWorldEntry['characterFilter'],
        ignoreBudget: extensionOrEntry('ignore_budget', 'ignoreBudget') === true,
        excludeRecursion: extensionOrEntry('exclude_recursion', 'excludeRecursion') === true,
        preventRecursion: extensionOrEntry('prevent_recursion', 'preventRecursion') === true,
        delayUntilRecursion: extensionOrEntry('delay_until_recursion', 'delayUntilRecursion') as XbTavernWorldEntry['delayUntilRecursion'],
        group: normalizeText(extensionOrEntry('group', 'group')),
        groupOverride: extensionOrEntry('group_override', 'groupOverride') === true,
        groupWeight: Number.isFinite(Number(extensionOrEntry('group_weight', 'groupWeight'))) ? Number(extensionOrEntry('group_weight', 'groupWeight')) : undefined,
        useGroupScoring: extensionOrEntry('use_group_scoring', 'useGroupScoring') as XbTavernWorldEntry['useGroupScoring'],
        probability: extensionOrEntry('probability', 'probability') as XbTavernWorldEntry['probability'],
        useProbability: extensionOrEntry('useProbability', 'useProbability') as XbTavernWorldEntry['useProbability'],
        sticky: extensionOrEntry('sticky', 'sticky') as XbTavernWorldEntry['sticky'],
        cooldown: extensionOrEntry('cooldown', 'cooldown') as XbTavernWorldEntry['cooldown'],
        delay: extensionOrEntry('delay', 'delay') as XbTavernWorldEntry['delay'],
        triggers: normalizeStringArray(extensionOrEntry('triggers', 'triggers')),
        outletName: normalizeText(extensionOrEntry('outlet_name', 'outletName')),
        matchPersonaDescription: extensionOrEntry('match_persona_description', 'matchPersonaDescription') as XbTavernWorldEntry['matchPersonaDescription'],
        matchCharacterDescription: extensionOrEntry('match_character_description', 'matchCharacterDescription') as XbTavernWorldEntry['matchCharacterDescription'],
        matchCharacterPersonality: extensionOrEntry('match_character_personality', 'matchCharacterPersonality') as XbTavernWorldEntry['matchCharacterPersonality'],
        matchCharacterDepthPrompt: extensionOrEntry('match_character_depth_prompt', 'matchCharacterDepthPrompt') as XbTavernWorldEntry['matchCharacterDepthPrompt'],
        matchScenario: extensionOrEntry('match_scenario', 'matchScenario') as XbTavernWorldEntry['matchScenario'],
        matchCreatorNotes: extensionOrEntry('match_creator_notes', 'matchCreatorNotes') as XbTavernWorldEntry['matchCreatorNotes'],
        activationReason: '',
        sourceWorldBook,
        worldSourceType: normalizeText(entry.worldSourceType),
        worldSourceIndex: Number.isFinite(Number(entry.worldSourceIndex)) ? Number(entry.worldSourceIndex) : index,
        contentChars: content.length,
    };
}

function makeWorldEntryKey(sourceWorldBook: unknown, uid: unknown, index = 0): string {
    const source = normalizeText(sourceWorldBook) || 'direct';
    const id = normalizeText(uid) || `index:${index}`;
    return `${source}\u0000${id}`;
}

export function describeWorldPosition(position: XBTavernWorldPosition): string {
    return POSITION_LABELS[position] || 'after character';
}

function normalizeScanDepth(value: unknown, fallback = 2): number {
    const depth = Number(value);
    return Number.isFinite(depth) ? Math.max(0, Math.floor(depth)) : fallback;
}

function buildScanTextFromMessages(messages: string[] = [], depth = 2): string {
    const normalizedDepth = normalizeScanDepth(depth, 2);
    if (normalizedDepth <= 0) {return '';}
    return messages.slice(-normalizedDepth).map((item) => String(item || '')).filter(Boolean).join('\n');
}

function buildEntryScanText(settings: XbTavernWorldSettings = {}, entry?: XbTavernWorldEntry): string {
    const scanDepth = entry?.scanDepth === null || entry?.scanDepth === undefined
        ? normalizeScanDepth(settings.scanDepth ?? 2, 2)
        : normalizeScanDepth(entry.scanDepth, 2);
    const baseScanText = Array.isArray(settings.scanMessages)
        ? buildScanTextFromMessages(settings.scanMessages, scanDepth)
        : String(settings.scanText || '');
    const injectScanText = normalizeText(settings.injectScanText);
    const recursionText = String((settings as XbTavernWorldSettings & { recursionText?: string }).recursionText || '');
    const source = [baseScanText, injectScanText, recursionText];
    const globalScanData = settings.globalScanData || {};
    if (entry?.matchPersonaDescription && globalScanData.personaDescription) {
        source.push(globalScanData.personaDescription);
    }
    if (entry?.matchCharacterDescription && globalScanData.characterDescription) {
        source.push(globalScanData.characterDescription);
    }
    if (entry?.matchCharacterPersonality && globalScanData.characterPersonality) {
        source.push(globalScanData.characterPersonality);
    }
    if (entry?.matchCharacterDepthPrompt && globalScanData.characterDepthPrompt) {
        source.push(globalScanData.characterDepthPrompt);
    }
    if (entry?.matchScenario && globalScanData.scenario) {
        source.push(globalScanData.scenario);
    }
    if (entry?.matchCreatorNotes && globalScanData.creatorNotes) {
        source.push(globalScanData.creatorNotes);
    }
    return source.filter(Boolean).join('\n');
}

function buildMatcher(settings: XbTavernWorldSettings = {}, entry?: XbTavernWorldEntry) {
    const caseSensitive = !!(entry?.caseSensitive ?? entry?.case_sensitive ?? settings.caseSensitive);
    const matchWholeWords = !!(entry?.matchWholeWords ?? entry?.match_whole_words ?? settings.matchWholeWords);
    const rawSource = buildEntryScanText(settings, entry);
    const source = caseSensitive ? rawSource : rawSource.toLowerCase();

    return (keyword = '') => {
        const rawKeyword = String(keyword || '').trim();
        if (!rawKeyword) {return false;}
        const regex = parseWorldInfoRegex(rawKeyword);
        if (regex) {return regex.test(rawSource);}
        const key = caseSensitive ? rawKeyword : rawKeyword.toLowerCase();
        if (!matchWholeWords) {return source.includes(key);}
        const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const pattern = new RegExp(`(^|[^\\p{L}\\p{N}_])${escaped}($|[^\\p{L}\\p{N}_])`, caseSensitive ? 'u' : 'iu');
        return pattern.test(source);
    };
}

function parseWorldInfoRegex(input = ''): RegExp | null {
    const match = String(input || '').match(/^\/([\w\W]+?)\/([gimsuy]*)$/);
    if (!match) {return null;}
    let pattern = match[1] || '';
    const flags = match[2] || '';
    if (/(^|[^\\])\//.test(pattern)) {return null;}
    pattern = pattern.replace('\\/', '/');
    try {
        return new RegExp(pattern, flags);
    } catch {
        return null;
    }
}

function secondaryMatches(entry: ActivatedWorldEntry, matchesKeyword: (keyword: string) => boolean): boolean {
    if (entry.selective === false) {return true;}
    if (!entry.keysecondary.length) {return true;}
    const matches = entry.keysecondary.map((keyword) => matchesKeyword(keyword));
    const hasAny = matches.some(Boolean);
    const hasAll = matches.every(Boolean);
    const logic = Number(entry.selectiveLogic ?? entry.selective_logic ?? XBTavernSelectiveLogic.AND_ANY);

    switch (logic) {
        case XBTavernSelectiveLogic.NOT_ALL:
            return !hasAll;
        case XBTavernSelectiveLogic.NOT_ANY:
            return !hasAny;
        case XBTavernSelectiveLogic.AND_ALL:
            return hasAll;
        case XBTavernSelectiveLogic.AND_ANY:
        default:
            return hasAny;
    }
}

function getEntryState(settings: XbTavernWorldSettings, entry: ActivatedWorldEntry): XbTavernWorldEntryState {
    return settings.entryStates?.[entry.activationKey] || settings.entryStates?.[String(entry.uid)] || {};
}

function isStickyActive(entry: ActivatedWorldEntry, settings: XbTavernWorldSettings): boolean {
    const turn = Number(settings.turn) || 0;
    const state = getEntryState(settings, entry);
    return Number(state.stickyUntilTurn) >= turn;
}

function shouldPassProbability(entry: ActivatedWorldEntry, settings: XbTavernWorldSettings): boolean {
    if (entry.useProbability === false || entry.useProbabilityGlobal === false) {return true;}
    if (isStickyActive(entry, settings)) {return true;}
    const raw = Number(entry.probability);
    if (!Number.isFinite(raw) || raw <= 0) {return raw !== 0;}
    const probability = raw > 1 ? raw / 100 : raw;
    if (probability >= 1) {return true;}
    const random = settings.random || Math.random;
    return random() <= probability;
}

function getRecursionPass(settings: XbTavernWorldSettings): number {
    return Math.max(0, Number((settings as XbTavernWorldSettings & { recursionPass?: number }).recursionPass) || 0);
}

function isDelayUntilRecursionReady(entry: ActivatedWorldEntry, recursionPass: number): boolean {
    const value = entry.delayUntilRecursion ?? entry.delay_until_recursion;
    if (!value) {return true;}
    if (recursionPass <= 0) {return false;}
    if (value === true) {return true;}
    const requiredPass = Math.max(1, Number(value) || 1);
    return recursionPass >= requiredPass;
}

function passesCharacterFilter(entry: ActivatedWorldEntry, settings: XbTavernWorldSettings): boolean {
    const filter = entry.characterFilter;
    if (!filter || typeof filter !== 'object') {return true;}
    const requiredNames = Array.isArray(filter.names) ? filter.names.map((item) => normalizeText(item)).filter(Boolean) : [];
    const requiredTags = Array.isArray(filter.tags) ? filter.tags.map((item) => normalizeText(item)).filter(Boolean) : [];
    if (!requiredNames.length && !requiredTags.length) {return true;}
    const currentNames = new Set((settings.characterFilterData?.names || []).map((item) => normalizeText(item)).filter(Boolean));
    const currentTags = new Set((settings.characterFilterData?.tags || []).map((item) => normalizeText(item)).filter(Boolean));
    const nameIncluded = requiredNames.some((name) => currentNames.has(name));
    const tagIncluded = requiredTags.some((tag) => currentTags.has(tag));
    const included = nameIncluded || tagIncluded;
    return filter.isExclude ? !included : included;
}

function activationReasonForEntry(entry: ActivatedWorldEntry, settings: XbTavernWorldSettings): string {
    if (entry.disable === true || entry.disabled === true) {return '';}
    if (entry.triggers?.length && !entry.triggers.includes(normalizeText(settings.trigger) || 'normal')) {return '';}
    if (!passesCharacterFilter(entry, settings)) {return '';}

    const turn = Number(settings.turn) || 0;
    const state = getEntryState(settings, entry);
    const stickyActive = isStickyActive(entry, settings);
    const recursionPass = getRecursionPass(settings);
    if (Number(state.delayUntilTurn) > turn) {return '';}
    if (Number(entry.delay) > 0 && turn < Number(entry.delay)) {return '';}
    if (Number(state.cooldownUntilTurn) > turn && !stickyActive) {return '';}
    if (recursionPass > 0 && entry.excludeRecursion && !stickyActive) {return '';}
    if (!isDelayUntilRecursionReady(entry, recursionPass) && !stickyActive) {return '';}
    if (entry.decorators.includes('@@activate')) {return 'decorator';}
    if (entry.decorators.includes('@@dont_activate')) {return '';}
    if (entry.constant === true) {return 'constant';}
    if (stickyActive) {return 'sticky';}

    const matchesKeyword = buildMatcher(settings, entry);
    const hasPrimary = entry.key.some((keyword) => matchesKeyword(keyword));
    if (!hasPrimary) {return '';}
    if (!secondaryMatches(entry, matchesKeyword)) {return '';}
    return 'keyword';
}

function explainEntryStatus(entry: ActivatedWorldEntry, settings: XbTavernWorldSettings): { status: string; activationReason: string } {
    if (entry.disable === true || entry.disabled === true) {return { status: 'disabled', activationReason: '' };}
    if (entry.triggers?.length && !entry.triggers.includes(normalizeText(settings.trigger) || 'normal')) {
        return { status: 'trigger_filtered', activationReason: '' };
    }
    if (!passesCharacterFilter(entry, settings)) {return { status: 'character_filtered', activationReason: '' };}

    const turn = Number(settings.turn) || 0;
    const state = getEntryState(settings, entry);
    const stickyActive = isStickyActive(entry, settings);
    const recursionPass = getRecursionPass(settings);
    if (Number(state.delayUntilTurn) > turn || (Number(entry.delay) > 0 && turn < Number(entry.delay))) {
        return { status: 'delay', activationReason: '' };
    }
    if (Number(state.cooldownUntilTurn) > turn && !stickyActive) {return { status: 'cooldown', activationReason: '' };}
    if (recursionPass > 0 && entry.excludeRecursion && !stickyActive) {
        return { status: 'excluded_from_recursion', activationReason: '' };
    }
    if (!isDelayUntilRecursionReady(entry, recursionPass) && !stickyActive) {
        return { status: 'delay_until_recursion', activationReason: '' };
    }
    if (entry.decorators.includes('@@activate')) {return { status: 'activated', activationReason: 'decorator' };}
    if (entry.decorators.includes('@@dont_activate')) {return { status: 'suppressed_by_decorator', activationReason: '' };}
    if (entry.constant === true) {return { status: 'activated', activationReason: 'constant' };}
    if (stickyActive) {return { status: 'activated', activationReason: 'sticky' };}

    const matchesKeyword = buildMatcher(settings, entry);
    const hasPrimary = entry.key.some((keyword) => matchesKeyword(keyword));
    if (!hasPrimary) {return { status: 'not_matched', activationReason: '' };}
    if (!secondaryMatches(entry, matchesKeyword)) {return { status: 'secondary_not_matched', activationReason: '' };}
    return { status: 'activated', activationReason: 'keyword' };
}

function worldSourceRank(entry: ActivatedWorldEntry, settings: XbTavernWorldSettings = {}): number {
    const sourceType = normalizeText(entry.worldSourceType);
    if (sourceType === 'chat') {return 0;}
    if (sourceType === 'persona') {return 1;}
    const strategy = Number(settings.insertionStrategy ?? 1);
    if (sourceType === 'character') {
        return strategy === 2 ? 3 : 2;
    }
    if (sourceType === 'global') {
        return strategy === 1 ? 3 : 2;
    }
    return 4;
}

function worldSourceTieRank(entry: ActivatedWorldEntry, settings: XbTavernWorldSettings = {}): number {
    const sourceType = normalizeText(entry.worldSourceType);
    const strategy = Number(settings.insertionStrategy ?? 1);
    if (strategy === 0) {
        if (sourceType === 'global') {return 0;}
        if (sourceType === 'character') {return 1;}
    }
    return 0;
}

function sortWorldEntries(left: ActivatedWorldEntry, right: ActivatedWorldEntry, settings: XbTavernWorldSettings = {}): number {
    return worldSourceRank(left, settings) - worldSourceRank(right, settings)
        || right.order - left.order
        || worldSourceTieRank(left, settings) - worldSourceTieRank(right, settings)
        || Number(left.worldSourceIndex ?? 0) - Number(right.worldSourceIndex ?? 0)
        || left.activationKey.localeCompare(right.activationKey, 'en');
}

function getWorldBudgetLimit(settings: XbTavernWorldSettings): number {
    const budget = Number(settings.budgetChars);
    return Number.isFinite(budget) && budget > 0 ? budget : 0;
}

function buildWorldBudgetDebug(sortedEntries: ActivatedWorldEntry[] = [], settings: XbTavernWorldSettings = {}): {
    includedKeys: Set<string>;
    byKey: Map<string, Pick<XbTavernWorldEntryCandidate, 'budgetUsedBefore' | 'budgetRemainingBefore' | 'budgetShortfall'>>;
    enabled: boolean;
    limit: number;
    used: number;
    remaining: number;
    activatedChars: number;
    skippedChars: number;
} {
    const limit = getWorldBudgetLimit(settings);
    const enabled = limit > 0;
    const includedKeys = new Set<string>();
    const byKey = new Map<string, Pick<XbTavernWorldEntryCandidate, 'budgetUsedBefore' | 'budgetRemainingBefore' | 'budgetShortfall'>>();
    const result: ActivatedWorldEntry[] = [];
    let used = 0;
    let skippedChars = 0;
    let overflowed = false;

    sortedEntries.forEach((entry) => {
        const size = entry.content.length;
        if (!size) {return;}
        const remaining = enabled ? Math.max(0, limit - used) : Number.POSITIVE_INFINITY;
        byKey.set(entry.activationKey, {
            budgetUsedBefore: used,
            budgetRemainingBefore: enabled ? remaining : undefined,
            budgetShortfall: enabled && !entry.ignoreBudget && (overflowed || used + size >= limit) ? Math.max(1, used + size - limit) : undefined,
        });
        if (entry.ignoreBudget) {
            result.push(entry);
            includedKeys.add(entry.activationKey);
            return;
        }
        if (overflowed || (enabled && used + size >= limit)) {
            overflowed = enabled;
            skippedChars += size;
            return;
        }
        result.push(entry);
        includedKeys.add(entry.activationKey);
        used += size;
    });

    return {
        includedKeys,
        byKey,
        enabled,
        limit,
        used,
        remaining: enabled ? Math.max(0, limit - used) : 0,
        activatedChars: used,
        skippedChars,
    };
}

function entryGroups(entry: ActivatedWorldEntry): string[] {
    return normalizeText(entry.group).split(/,\s*/).map((item) => item.trim()).filter(Boolean);
}

function getEntryMatchScore(entry: ActivatedWorldEntry, settings: XbTavernWorldSettings = {}): number {
    const matchesKeyword = buildMatcher(settings, entry);
    const primaryMatches = entry.key.filter((keyword) => matchesKeyword(keyword)).length;
    if (!entry.key.length || !primaryMatches) {return 0;}
    const secondaryMatchesCount = entry.keysecondary.filter((keyword) => matchesKeyword(keyword)).length;
    if (entry.keysecondary.length > 0) {
        const logic = Number(entry.selectiveLogic ?? entry.selective_logic ?? XBTavernSelectiveLogic.AND_ANY);
        if (logic === XBTavernSelectiveLogic.AND_ANY) {
            return primaryMatches + secondaryMatchesCount;
        }
        if (logic === XBTavernSelectiveLogic.AND_ALL && secondaryMatchesCount === entry.keysecondary.length) {
            return primaryMatches + secondaryMatchesCount;
        }
    }
    return primaryMatches;
}

function filterByInclusionGroups(
    entries: ActivatedWorldEntry[] = [],
    alreadyActivated: Map<string, ActivatedWorldEntry>,
    settings: XbTavernWorldSettings = {},
): ActivatedWorldEntry[] {
    const kept = new Set(entries);
    const activatedGroups = new Set<string>();
    alreadyActivated.forEach((entry) => {
        entryGroups(entry).forEach((group) => activatedGroups.add(group));
    });
    const grouped = new Map<string, ActivatedWorldEntry[]>();
    entries.forEach((entry) => {
        entryGroups(entry).forEach((group) => {
            const list = grouped.get(group) || [];
            list.push(entry);
            grouped.set(group, list);
        });
    });
    grouped.forEach((groupEntries, group) => {
        const activeEntries = groupEntries.filter((entry) => kept.has(entry));
        if (!activeEntries.length) {return;}
        if (activatedGroups.has(group)) {
            activeEntries.forEach((entry) => kept.delete(entry));
            return;
        }
        if (settings.useGroupScoring === true || activeEntries.some((entry) => entry.useGroupScoring === true)) {
            const scores = activeEntries.map((entry) => getEntryMatchScore(entry, settings));
            const maxScore = Math.max(...scores);
            activeEntries.forEach((entry, index) => {
                const isScored = entry.useGroupScoring ?? settings.useGroupScoring;
                if (isScored && scores[index] < maxScore) {
                    kept.delete(entry);
                }
            });
        }
        const scoredEntries = activeEntries.filter((entry) => kept.has(entry));
        if (scoredEntries.length <= 1) {return;}
        const priorityWinner = scoredEntries
            .filter((entry) => entry.groupOverride)
            .sort((left, right) => sortWorldEntries(left, right, settings))[0];
        const winner = priorityWinner || pickWeightedGroupWinner(scoredEntries, settings);
        scoredEntries.forEach((entry) => {
            if (entry !== winner) {kept.delete(entry);}
        });
    });
    return entries.filter((entry) => kept.has(entry));
}

function pickWeightedGroupWinner(entries: ActivatedWorldEntry[] = [], settings: XbTavernWorldSettings = {}): ActivatedWorldEntry | null {
    if (!entries.length) {return null;}
    const weighted = entries.map((entry) => ({
        entry,
        weight: Math.max(1, Number(entry.groupWeight) || 100),
    }));
    const total = weighted.reduce((sum, item) => sum + item.weight, 0);
    const random = settings.random || Math.random;
    let roll = random() * total;
    for (const item of weighted) {
        roll -= item.weight;
        if (roll <= 0) {return item.entry;}
    }
    return weighted[weighted.length - 1]?.entry || null;
}

interface WorldActivationRunResult {
    activatedBeforeBudget: ActivatedWorldEntry[];
    activatedEntries: ActivatedWorldEntry[];
    budgetDebug: ReturnType<typeof buildWorldBudgetDebug>;
}

export function activateWorldEntries(
    entries: XbTavernWorldEntry[] = [],
    scanStateOrSettings: XbTavernWorldSettings | { scanText?: string } = {},
    settings: XbTavernWorldSettings = {},
): ActivatedWorldEntry[] {
    return runWorldActivation(entries, scanStateOrSettings, settings).activatedEntries;
}

function runWorldActivation(
    entries: XbTavernWorldEntry[] = [],
    scanStateOrSettings: XbTavernWorldSettings | { scanText?: string } = {},
    settings: XbTavernWorldSettings = {},
): WorldActivationRunResult {
    const baseSettings = {
        ...scanStateOrSettings,
        ...settings,
        scanText: settings.scanText ?? scanStateOrSettings.scanText ?? '',
    };
    const normalizedEntries = (Array.isArray(entries) ? entries : [])
        .map((entry, index) => normalizeEntry(entry, index))
        .sort((left, right) => sortWorldEntries(left, right, baseSettings));
    const configuredRecursionLimit = Math.max(0, Number(baseSettings.recursionLimit) || 0);
    const allowRecursion = !!baseSettings.recursion;
    const maxRecursionPasses = allowRecursion
        ? (configuredRecursionLimit > 0 ? Math.max(0, configuredRecursionLimit - 1) : Math.max(1, normalizedEntries.length))
        : 0;
    const activated = new Map<string, ActivatedWorldEntry>();
    const activatedBeforeBudget = new Map<string, ActivatedWorldEntry>();
    const failedProbability = new Set<string>();
    const initialScanText = String(baseSettings.scanText || '');
    const baseScanDepth = normalizeScanDepth(baseSettings.scanDepth ?? 2, 2);
    const minActivations = Math.max(0, Number(baseSettings.minActivations) || 0);
    const minDepthMax = Math.max(0, Number(baseSettings.minActivationsDepthMax) || 0);
    const scanMessageCount = Array.isArray(baseSettings.scanMessages) ? baseSettings.scanMessages.length : 0;
    const maxMinDepth = Math.max(baseScanDepth, minDepthMax > 0 ? minDepthMax : scanMessageCount);
    let recursionText = '';
    let recursionPass = 0;
    let scanDepthSkew = 0;
    let scanMode: 'initial' | 'recursion' | 'minActivations' = 'initial';
    let guard = 0;
    const maxLoops = Math.max(1, normalizedEntries.length + maxRecursionPasses + maxMinDepth + 4);

    while (guard < maxLoops) {
        guard += 1;
        const activeScanDepth = baseScanDepth + scanDepthSkew;
        const recursionTextForScan = scanMode === 'minActivations' ? '' : recursionText;
        const scanText = [initialScanText, recursionTextForScan].filter(Boolean).join('\n');
        const passSettings = {
            ...baseSettings,
            scanDepth: activeScanDepth,
            scanText,
            recursionText: recursionTextForScan,
            recursionPass: scanMode === 'recursion' ? recursionPass : 0,
        };
        let changed = false;
        const activatedThisPass: ActivatedWorldEntry[] = [];
        normalizedEntries.forEach((entry) => {
            const key = entry.activationKey;
            if (activatedBeforeBudget.has(key) || failedProbability.has(key)) {return;}
            const activationReason = activationReasonForEntry(entry, passSettings);
            if (!activationReason) {return;}
            activatedThisPass.push({ ...entry, activationReason });
        });
        filterByInclusionGroups(activatedThisPass, activatedBeforeBudget, baseSettings).forEach((entry) => {
            if (!shouldPassProbability(entry, passSettings)) {
                failedProbability.add(entry.activationKey);
                return;
            }
            activatedBeforeBudget.set(entry.activationKey, entry);
            const budgetDebug = buildWorldBudgetDebug([...activatedBeforeBudget.values()].sort((left, right) => sortWorldEntries(left, right, baseSettings)), baseSettings);
            const included = !budgetDebug.enabled || budgetDebug.includedKeys.has(entry.activationKey);
            if (included) {
                activated.set(entry.activationKey, entry);
                if (!entry.preventRecursion) {
                    recursionText = [recursionText, entry.content].filter(Boolean).join('\n');
                }
                changed = true;
            }
        });

        const currentBudgetDebug = buildWorldBudgetDebug([...activatedBeforeBudget.values()].sort((left, right) => sortWorldEntries(left, right, baseSettings)), baseSettings);
        const budgetOverflowed = currentBudgetDebug.enabled && currentBudgetDebug.skippedChars > 0;
        if (allowRecursion && changed && !budgetOverflowed && recursionPass < maxRecursionPasses) {
            recursionPass += 1;
            scanMode = 'recursion';
            continue;
        }

        const needsMinActivationScan = minActivations > 0 && activated.size < minActivations;
        const canAdvanceScanDepth = scanMessageCount > 0
            && activeScanDepth < maxMinDepth
            && activeScanDepth < scanMessageCount;
        if (!budgetOverflowed && needsMinActivationScan && canAdvanceScanDepth) {
            scanDepthSkew += 1;
            scanMode = 'minActivations';
            continue;
        }

        break;
    }

    const sortedBeforeBudget = [...activatedBeforeBudget.values()].sort((left, right) => sortWorldEntries(left, right, baseSettings));
    const budgetDebug = buildWorldBudgetDebug(sortedBeforeBudget, baseSettings);
    return {
        activatedBeforeBudget: sortedBeforeBudget,
        activatedEntries: [...activated.values()]
            .sort((left, right) => sortWorldEntries(left, right, baseSettings))
            .filter((entry) => !budgetDebug.enabled || budgetDebug.includedKeys.has(entry.activationKey)),
        budgetDebug,
    };
}

function buildWorldEntryCandidates(
    entries: XbTavernWorldEntry[] = [],
    activatedEntries: ActivatedWorldEntry[] = [],
    settings: XbTavernWorldSettings = {},
    budgetDebug = buildWorldBudgetDebug(activatedEntries, settings),
): XbTavernWorldEntryCandidate[] {
    const activatedByKey = new Map(activatedEntries.map((entry) => [entry.activationKey, entry]));
    const budgetIncluded = budgetDebug.includedKeys;
    return (Array.isArray(entries) ? entries : []).map((entry, index) => {
        const normalized = normalizeEntry(entry, index);
        const activated = activatedByKey.get(normalized.activationKey);
        const budgetInfo = budgetDebug.byKey.get(normalized.activationKey) || {};
        const explanation = activated
            ? { status: 'activated', activationReason: activated.activationReason }
            : explainEntryStatus(normalized, settings);
        const matcher = buildMatcher(settings, normalized);
        const status = activated
            ? (budgetDebug.enabled && !budgetIncluded.has(normalized.activationKey) ? 'budget_skipped' : 'activated')
            : (explanation.status === 'activated' ? 'probability_failed' : explanation.status);
        return {
            uid: normalized.uid,
            activationKey: normalized.activationKey,
            title: normalizeText(normalized.comment || normalized.title || normalized.name || normalized.uid),
            sourceWorldBook: normalized.sourceWorldBook,
            worldSourceType: normalized.worldSourceType,
            worldSourceIndex: normalized.worldSourceIndex,
            content: normalized.content,
            contentChars: normalized.contentChars,
            key: normalized.key,
            keysecondary: normalized.keysecondary,
            matchedKeys: normalized.key.filter((keyword) => matcher(keyword)),
            matchedSecondaryKeys: normalized.keysecondary.filter((keyword) => matcher(keyword)),
            decorators: normalized.decorators,
            position: normalized.position,
            positionLabel: describeWorldPosition(normalized.position),
            role: normalized.role,
            order: normalized.order,
            depth: normalized.depth,
            status,
            activationReason: activated?.activationReason || explanation.activationReason,
            insertionTarget: insertionTargetForEntry(normalized),
            ...budgetInfo,
        };
    });
}

function normalizeNativeActivatedEntries(entries: XbTavernWorldEntry[] = []): ActivatedWorldEntry[] {
    return (Array.isArray(entries) ? entries : [])
        .map((entry, index) => {
            const normalized = normalizeEntry(entry, index);
            return {
                ...normalized,
                activationReason: normalizeText((entry as { activationReason?: unknown }).activationReason) || 'native',
            };
        })
        .filter((entry) => !!entry.content);
}

function buildNativeWorldEntryCandidates(entries: ActivatedWorldEntry[] = []): XbTavernWorldEntryCandidate[] {
    return entries.map((entry) => ({
        uid: entry.uid,
        activationKey: entry.activationKey,
        title: normalizeText(entry.comment || entry.title || entry.name || entry.uid),
        sourceWorldBook: entry.sourceWorldBook,
        worldSourceType: entry.worldSourceType,
        worldSourceIndex: entry.worldSourceIndex,
        content: entry.content,
        contentChars: entry.contentChars,
        key: entry.key,
        keysecondary: entry.keysecondary,
        matchedKeys: [] as string[],
        matchedSecondaryKeys: [] as string[],
        decorators: entry.decorators,
        position: entry.position,
        positionLabel: describeWorldPosition(entry.position),
        role: entry.role,
        order: entry.order,
        depth: entry.depth,
        status: 'activated',
        activationReason: entry.activationReason || 'native',
        insertionTarget: insertionTargetForEntry(entry),
    }));
}

function buildNativePromptEntries(runtime: XbTavernNativeWorldInfoRuntime = {}): ActivatedWorldEntry[] {
    const entries: ActivatedWorldEntry[] = [];
    let order = 0;
    const pushEntry = (content: unknown, position: XBTavernWorldPosition, patch: Partial<ActivatedWorldEntry> = {}) => {
        const text = normalizeText(content);
        if (!text) {return;}
        const activationKey = `native:${position}:${order}`;
        entries.push({
            uid: activationKey,
            activationKey,
            content: text,
            contentChars: text.length,
            key: [],
            keysecondary: [],
            decorators: [],
            position,
            role: patch.role || 'system',
            order,
            depth: Number.isFinite(Number(patch.depth)) ? Number(patch.depth) : 4,
            activationReason: 'native',
            sourceWorldBook: '',
            title: '',
            comment: '',
            ...patch,
        });
        order += 1;
    };
    pushEntry(runtime.worldInfoBefore, XBTavernWorldPosition.before);
    pushEntry(runtime.worldInfoAfter, XBTavernWorldPosition.after);
    (Array.isArray(runtime.worldInfoExamples) ? runtime.worldInfoExamples : []).forEach((entry) => {
        const position = normalizeText(entry?.position) === 'after'
            ? XBTavernWorldPosition.EMBottom
            : XBTavernWorldPosition.EMTop;
        pushEntry(entry?.content, position);
    });
    (Array.isArray(runtime.anBefore) ? runtime.anBefore : []).forEach((content) => {
        pushEntry(content, XBTavernWorldPosition.ANTop);
    });
    (Array.isArray(runtime.anAfter) ? runtime.anAfter : []).forEach((content) => {
        pushEntry(content, XBTavernWorldPosition.ANBottom);
    });
    (Array.isArray(runtime.worldInfoDepth) ? runtime.worldInfoDepth : []).forEach((entry) => {
        const depth = Number.isFinite(Number(entry?.depth)) ? Number(entry.depth) : 4;
        const role = normalizeRole(ROLE_BY_NUMBER[Number(entry?.role)] || 'system', 'system');
        (Array.isArray(entry?.entries) ? entry.entries : []).forEach((content) => {
            pushEntry(content, XBTavernWorldPosition.atDepth, { depth, role });
        });
    });
    const outlets = runtime.outlets && typeof runtime.outlets === 'object' ? runtime.outlets : {};
    Object.entries(outlets).forEach(([outletName, values]) => {
        (Array.isArray(values) ? values : []).forEach((content) => {
            pushEntry(content, XBTavernWorldPosition.outlet, { outletName });
        });
    });
    return entries;
}

function insertionTargetForEntry(entry: Pick<ActivatedWorldEntry, 'position' | 'depth' | 'outletName' | 'outlet'>): string {
    switch (entry.position) {
        case XBTavernWorldPosition.before:
            return 'before character card';
        case XBTavernWorldPosition.after:
            return 'after character card';
        case XBTavernWorldPosition.atDepth:
            return `history depth ${Math.max(0, Number(entry.depth) || 0)}`;
        case XBTavernWorldPosition.ANTop:
            return 'author note top';
        case XBTavernWorldPosition.ANBottom:
            return 'author note bottom';
        case XBTavernWorldPosition.EMTop:
            return 'example messages top';
        case XBTavernWorldPosition.EMBottom:
            return 'example messages bottom';
        case XBTavernWorldPosition.outlet:
            return `outlet:${normalizeText(entry.outletName || entry.outlet || 'default')}`;
        default:
            return describeWorldPosition(entry.position);
    }
}

interface WorldBuckets {
    before: ActivatedWorldEntry[];
    after: ActivatedWorldEntry[];
    atDepth: ActivatedWorldEntry[];
    outlet: Record<string, ActivatedWorldEntry[]>;
    examplesTop: ActivatedWorldEntry[];
    examplesBottom: ActivatedWorldEntry[];
    authorNoteTop: ActivatedWorldEntry[];
    authorNoteBottom: ActivatedWorldEntry[];
}

function groupWorldEntries(entries: ActivatedWorldEntry[] = []): WorldBuckets {
    const buckets: WorldBuckets = {
        before: [],
        after: [],
        atDepth: [],
        outlet: {},
        examplesTop: [],
        examplesBottom: [],
        authorNoteTop: [],
        authorNoteBottom: [],
    };

    entries.forEach((entry) => {
        if (!entry.content) {return;}
        switch (entry.position) {
            case XBTavernWorldPosition.before:
                buckets.before.push(entry);
                break;
            case XBTavernWorldPosition.atDepth:
                buckets.atDepth.push(entry);
                break;
            case XBTavernWorldPosition.outlet: {
                const outletName = normalizeText(entry.outletName || entry.outlet || 'default');
                buckets.outlet[outletName] = buckets.outlet[outletName] || [];
                buckets.outlet[outletName].push(entry);
                break;
            }
            case XBTavernWorldPosition.EMTop:
                buckets.examplesTop.push(entry);
                break;
            case XBTavernWorldPosition.EMBottom:
                buckets.examplesBottom.push(entry);
                break;
            case XBTavernWorldPosition.ANTop:
                buckets.authorNoteTop.push(entry);
                break;
            case XBTavernWorldPosition.ANBottom:
                buckets.authorNoteBottom.push(entry);
                break;
            case XBTavernWorldPosition.after:
            default:
                buckets.after.push(entry);
                break;
        }
    });

    return buckets;
}

function countWorldPositions(entries: ActivatedWorldEntry[] = []): Record<string, number> {
    const counts: Record<string, number> = {};
    entries.forEach((entry) => {
        const target = insertionTargetForEntry(entry);
        counts[target] = (counts[target] || 0) + 1;
    });
    return counts;
}

function buildWorldEntryStateUpdates(entries: ActivatedWorldEntry[] = [], settings: XbTavernWorldSettings = {}): Record<string, XbTavernWorldEntryState> {
    const turn = Number(settings.turn) || 0;
    const updates: Record<string, XbTavernWorldEntryState> = {};
    entries.forEach((entry) => {
        const key = entry.activationKey;
        const update: XbTavernWorldEntryState = {};
        const sticky = entry.sticky === true ? 1 : Number(entry.sticky);
        const cooldown = Number(entry.cooldown);
        const delay = Number(entry.delay);
        if (Number.isFinite(sticky) && sticky > 0) {
            update.stickyUntilTurn = turn + sticky;
        }
        if (Number.isFinite(cooldown) && cooldown > 0) {
            update.cooldownUntilTurn = turn + cooldown;
        }
        if (Number.isFinite(delay) && delay > 0) {
            update.delayUntilTurn = turn + delay;
        }
        if (Object.keys(update).length) {
            updates[key] = update;
        }
    });
    return updates;
}

function sortPromptEntries(entries: ActivatedWorldEntry[] = []): ActivatedWorldEntry[] {
    return [...entries].sort((left, right) => (
        left.order - right.order
        || Number(right.worldSourceIndex ?? 0) - Number(left.worldSourceIndex ?? 0)
        || right.activationKey.localeCompare(left.activationKey, 'en')
    ));
}

function renderEntryBlock(title: string, entries: ActivatedWorldEntry[] = []): string {
    const content = sortPromptEntries(entries).map((entry) => entry.content).filter(Boolean).join('\n\n');
    return content ? `<${title}>\n${content}\n</${title}>` : '';
}

function buildCharacterBlock(character: XbTavernCharacter = {}, user: XbTavernUser = {}): string {
    const data = character.data || {};
    const fields = [
        ['Character', character.name || pickNestedString(data, ['name'])],
        ['User', user.name],
        ['Description', character.description || pickNestedString(data, ['description'])],
        ['Personality', character.personality || pickNestedString(data, ['personality'])],
        ['Scenario', character.scenario || pickNestedString(data, ['scenario'])],
        ['Creator Notes', character.creatorNotes || character.creator_notes || pickNestedString(data, ['creator_notes'])],
        ['First Message', character.firstMessage || character.first_mes || pickNestedString(data, ['first_mes'])],
        ['Message Examples', character.mesExample || character.mes_example || pickNestedString(data, ['mes_example'])],
        ['User Persona', user.persona || user.description],
    ]
        .map(([label, value]) => {
            const text = normalizeText(value);
            return text ? `## ${label}\n${text}` : '';
        })
        .filter(Boolean);

    return fields.length ? `<character_card>\n${fields.join('\n\n')}\n</character_card>` : '';
}

function buildSingleCharacterFieldBlock(title: string, content: unknown): string {
    const text = normalizeText(content);
    return text ? `## ${title}\n${text}` : '';
}

function buildMemoryBlock(memoryContext: XbTavernMemoryContext = {}): string {
    const memoryFiles = Array.isArray(memoryContext.memoryFiles) ? memoryContext.memoryFiles : [];
    const spatialState = normalizeText(memoryContext.spatialState);
    const statusPanelYaml = normalizeText(memoryContext.statusPanelYaml);
    const questHooks = Array.isArray(memoryContext.questHooks)
        ? memoryContext.questHooks.map((hook) => normalizeText(hook)).filter(Boolean)
        : [];
    const sections: string[] = [];
    if (questHooks.length) {
        sections.push(questHooks.join('\n'));
    }

    const stateContent = normalizeText(memoryFiles.find((file) => file.path === 'memory/state.md')?.content || '');
    if (stateContent) {
        sections.push(`## 会话记忆\n${stateContent}`);
    }

    const characterLines = memoryFiles
        .filter((file) => String(file.path || '').startsWith('memory/characters/'))
        .map((file) => {
            const content = normalizeText(file.content);
            if (!content) {return '';}
            const title = normalizeText(file.title || String(file.path || '').replace(/^memory\/characters\//, '').replace(/\.md$/i, ''));
            return `### ${title || '相关人物'}\n${content}`;
        })
        .filter(Boolean);
    if (characterLines.length) {
        sections.push(`## 相关人物记忆\n${characterLines.join('\n\n')}`);
    }

    if (statusPanelYaml) {
        sections.push(`## 状态栏\n${statusPanelYaml}`);
    }

    if (spatialState) {
        sections.push(`## 空间地图状态\n${spatialState}`);
    }

    return sections.join('\n\n');
}

function buildMemoryDepthEntries(memoryContext: XbTavernMemoryContext = {}): ActivatedWorldEntry[] {
    const content = buildMemoryBlock(memoryContext);
    if (!content) {return [];}
    return [{
        uid: 'session-memory',
        activationKey: 'memory:session',
        content,
        contentChars: content.length,
        key: [],
        keysecondary: [],
        decorators: [],
        position: XBTavernWorldPosition.atDepth,
        role: 'system',
        order: -1_000_000,
        depth: 1,
        activationReason: 'memory',
        sourceWorldBook: '',
        title: 'session memory',
        comment: 'session memory',
    }];
}

function buildRuntimeDepthEntries(entries: XbTavernRuntimeDepthEntry[] = []): ActivatedWorldEntry[] {
    return entries.map((entry, index) => {
        const content = normalizeText(entry.content);
        if (!content) {return null;}
        const label = normalizeText(entry.label) || `runtime depth ${index + 1}`;
        return {
            uid: `runtime-depth:${index}`,
            activationKey: `runtime-depth:${index}:${label}`,
            content,
            contentChars: content.length,
            key: [],
            keysecondary: [],
            decorators: [],
            position: XBTavernWorldPosition.atDepth,
            role: normalizeRole(entry.role, 'system'),
            order: Number.isFinite(Number(entry.order)) ? Number(entry.order) : 1_000_000_000 + index,
            depth: Number.isFinite(Number(entry.depth)) ? Math.max(0, Number(entry.depth)) : 1,
            activationReason: normalizeText(entry.layer) || 'runtime',
            sourceWorldBook: '',
            title: label,
            comment: label,
        } as ActivatedWorldEntry;
    }).filter((entry): entry is ActivatedWorldEntry => !!entry);
}

function normalizeChatPromptSections(chatPreset: TavernChatPromptPresetBundle = {}): NormalizedPresetSection[] {
    const source = Array.isArray(chatPreset.sections) ? chatPreset.sections : [];
    const sections = source.map((section) => ({
        id: normalizeText(section.id),
        label: normalizeText(section.label),
        enabled: section.enabled !== false,
        marker: section.marker === true,
        role: normalizeRole(section.role, 'system'),
        content: normalizeText(section.content),
        placement: PLACEMENT_ORDER.includes(section.placement as never) ? section.placement! : 'beforeHistory',
        source: normalizeText(section.source),
    })).filter((section) => section.enabled && (section.content || section.marker)) as NormalizedPresetSection[];

    return sections;
}

function pickSections(sections: NormalizedPresetSection[] = [], placement = ''): NormalizedPresetSection[] {
    return sections.filter((section) => section.placement === placement);
}

function presetSectionUnits(
    sections: NormalizedPresetSection[] = [],
    placementLabel: string,
    layer = 'preset',
): XbTavernMessageUnit[] {
    return sections.map((section, index) => ({
        message: makeMessage(section.role, section.content),
        layer,
        label: section.label || `preset ${placementLabel} ${index + 1}`,
        sourceId: section.id || undefined,
    }));
}

type XbTavernWorldBuckets = ReturnType<typeof groupWorldEntries>;

function promptMarkerIdentifier(section: NormalizedPresetSection = {} as NormalizedPresetSection): string {
    return normalizeText(section.id).replace(/^prompt-manager:/, '');
}

function buildPromptManagerOrderedUnits(options: {
    presetSections: NormalizedPresetSection[];
    character: XbTavernCharacter;
    user: XbTavernUser;
    worldBuckets: XbTavernWorldBuckets;
    conversationUnits: XbTavernMessageUnit[];
    runtimeProtocolUnits: XbTavernMessageUnit[];
}): XbTavernMessageUnit[] {
    const {
        presetSections,
        character,
        user,
        worldBuckets,
        conversationUnits,
        runtimeProtocolUnits,
    } = options;
    const data = character.data || {};
    const usedMarkers = new Set<string>();
    const units: XbTavernMessageUnit[] = [];
    const pushMarker = (marker: string, markerUnits: XbTavernMessageUnit[]) => {
        usedMarkers.add(marker);
        units.push(...markerUnits);
    };

    presetSections.forEach((section, index) => {
        const marker = promptMarkerIdentifier(section);
        if (section.marker) {
            switch (marker) {
                case 'worldInfoBefore':
                    pushMarker(marker, [makeMessageUnit('system', renderEntryBlock('world_info_before_character', worldBuckets.before), 'world-before', section.label || 'World Info (before)', {}, section.id)]);
                    return;
                case 'worldInfoAfter':
                    pushMarker(marker, [makeMessageUnit('system', renderEntryBlock('world_info_after_character', worldBuckets.after), 'world-after', section.label || 'World Info (after)', {}, section.id)]);
                    return;
                case 'charDescription':
                    pushMarker(marker, [makeMessageUnit(section.role, buildSingleCharacterFieldBlock('Description', character.description || pickNestedString(data, ['description'])), 'character-card', section.label || 'Char Description', {}, section.id)]);
                    return;
                case 'charPersonality':
                    pushMarker(marker, [makeMessageUnit(section.role, buildSingleCharacterFieldBlock('Personality', character.personality || pickNestedString(data, ['personality'])), 'character-card', section.label || 'Char Personality', {}, section.id)]);
                    return;
                case 'scenario':
                    pushMarker(marker, [makeMessageUnit(section.role, buildSingleCharacterFieldBlock('Scenario', character.scenario || pickNestedString(data, ['scenario'])), 'character-card', section.label || 'Scenario', {}, section.id)]);
                    return;
                case 'personaDescription':
                    pushMarker(marker, [makeMessageUnit(section.role, buildSingleCharacterFieldBlock('User Persona', user.persona || user.description), 'character-card', section.label || 'Persona Description', {}, section.id)]);
                    return;
                case 'dialogueExamples':
                    pushMarker(marker, [makeMessageUnit(section.role, buildSingleCharacterFieldBlock('Message Examples', character.mesExample || character.mes_example || pickNestedString(data, ['mes_example'])), 'character-card', section.label || 'Chat Examples', {}, section.id)]);
                    return;
                case 'chatHistory':
                    pushMarker(marker, [
                        makeMessageUnit('system', renderEntryBlock('world_info_examples_top', worldBuckets.examplesTop), 'world-examples', 'world info examples top'),
                        makeMessageUnit('system', renderEntryBlock('world_info_author_note_top', worldBuckets.authorNoteTop), 'world-author-note', 'world info author note top'),
                        ...conversationUnits,
                        ...runtimeProtocolUnits,
                    ]);
                    return;
                default:
                    return;
            }
        }
        units.push({
            message: makeMessage(section.role, section.content),
            layer: section.source === 'promptManager' ? 'preset' : 'preset',
            label: section.label || `preset ordered ${index + 1}`,
            sourceId: section.id || undefined,
        });
    });

    if (!usedMarkers.has('worldInfoBefore')) {
        units.push(makeMessageUnit('system', renderEntryBlock('world_info_before_character', worldBuckets.before), 'world-before', 'world info before character'));
    }
    if (!usedMarkers.has('charDescription') && !usedMarkers.has('charPersonality') && !usedMarkers.has('scenario') && !usedMarkers.has('personaDescription') && !usedMarkers.has('dialogueExamples')) {
        units.push(makeMessageUnit('system', buildCharacterBlock(character, user), 'character-card', 'character card'));
    }
    if (!usedMarkers.has('worldInfoAfter')) {
        units.push(makeMessageUnit('system', renderEntryBlock('world_info_after_character', worldBuckets.after), 'world-after', 'world info after character'));
    }
    if (!usedMarkers.has('chatHistory')) {
        units.push(
            makeMessageUnit('system', renderEntryBlock('world_info_examples_top', worldBuckets.examplesTop), 'world-examples', 'world info examples top'),
            makeMessageUnit('system', renderEntryBlock('world_info_author_note_top', worldBuckets.authorNoteTop), 'world-author-note', 'world info author note top'),
            ...conversationUnits,
            ...runtimeProtocolUnits,
        );
    }
    units.push(
        makeMessageUnit('system', renderEntryBlock('world_info_author_note_bottom', worldBuckets.authorNoteBottom), 'world-author-note', 'world info author note bottom'),
        makeMessageUnit('system', renderEntryBlock('world_info_examples_bottom', worldBuckets.examplesBottom), 'world-examples', 'world info examples bottom'),
    );
    return units;
}

function buildConversationMessageUnit(message: XbTavernMessage, index: number, depthByMessage: WeakMap<XbTavernMessage, number>): XbTavernMessageUnit {
    const depth = depthByMessage.get(message);
    if (Number.isFinite(Number(depth))) {
        return {
            message,
            layer: 'world-depth',
            label: `world info depth ${Math.max(0, Number(depth))}`,
        };
    }
    return {
        message,
        layer: message.role === 'user' ? 'current-user/history' : 'history',
        label: `history ${index + 1}`,
    };
}

function normalizeHistoryMessage(message: XbTavernHistoryMessage = {}): XbTavernMessage | null {
    const role = message.is_user === true ? 'user' : normalizeRole(message.role, 'assistant');
    if (role === 'tool') {return null;}
    return makeMessage(role, message.content || message.mes || message.message, {
        ...(message.name ? { name: String(message.name) } : {}),
        ...(normalizeThoughtBlocks(message.thoughts).length ? { thoughts: normalizeThoughtBlocks(message.thoughts) } : {}),
    });
}

export function squashChatHistory(history: XbTavernHistoryMessage[] = [], options: {
    separator?: string;
    userName?: string;
    characterName?: string;
    role?: XbTavernRole;
} = {}): XbTavernMessage[] {
    const messages = (Array.isArray(history) ? history : [])
        .map((message) => normalizeHistoryMessage(message))
        .filter((message): message is XbTavernMessage => !!message);
    if (!messages.length) {return [];}

    const separator = options.separator || '\n\n';
    const role = normalizeRole(options.role, 'system');
    const content = messages.map((message) => {
        const historyRole = message.role === 'user' ? 'user' : 'assistant';
        return `<message role="${historyRole}">\n${message.content}\n</message>`;
    }).join(separator);

    return [makeMessage(role, `<conversation_history>\n${content}\n</conversation_history>`)].filter((message): message is XbTavernMessage => !!message);
}

function buildHistoryMessages(history: XbTavernHistoryMessage[] = [], options: {
    mode?: 'raw' | 'squash';
    role?: XbTavernRole;
    userName?: string;
    characterName?: string;
    separator?: string;
} = {}): XbTavernMessage[] {
    if (options.mode === 'raw') {
        return (Array.isArray(history) ? history : [])
            .map((message) => normalizeHistoryMessage(message))
            .filter((message): message is XbTavernMessage => !!message);
    }
    return squashChatHistory(history, options);
}

function buildDepthMessages(entries: ActivatedWorldEntry[] = []): Array<{ depth: number; message: XbTavernMessage }> {
    const groups = new Map<string, { depth: number; role: XbTavernRole; entries: string[] }>();
    sortPromptEntries(entries).forEach((entry) => {
        const depth = Math.max(0, Number(entry.depth) || 0);
        const role = normalizeRole(entry.role, 'system');
        const key = `${depth}\u0000${role}`;
        const existing = groups.get(key) || { depth, role, entries: [] };
        existing.entries.push(entry.content);
        groups.set(key, existing);
    });
    return [...groups.values()].map((group) => ({
        depth: group.depth,
        message: makeMessage(group.role, group.entries.join('\n\n')),
    })).filter((item): item is { depth: number; message: XbTavernMessage } => !!item.message);
}

function insertDepthMessages(messages: XbTavernMessage[] = [], depthMessages: Array<{ depth: number; message: XbTavernMessage }> = []): XbTavernMessage[] {
    if (!depthMessages.length) {return messages;}
    const slots = Array.from({ length: messages.length + 1 }, () => [] as XbTavernMessage[]);

    depthMessages.forEach((item) => {
        const depth = Math.max(0, Number(item.depth) || 0);
        const afterIndex = messages.length ? Math.max(-1, messages.length - 1 - depth) : -1;
        slots[afterIndex + 1].push(item.message);
    });

    const result = [...slots[0]];
    messages.forEach((message, index) => {
        result.push(message, ...slots[index + 1]);
    });
    return result;
}

function buildGlobalScanData(context: XbTavernContext = {}): XbTavernWorldSettings['globalScanData'] {
    const character = context.character || {};
    const user = context.user || {};
    const data = character.data || {};
    return {
        personaDescription: normalizeText(user.persona || user.description),
        characterDescription: normalizeText(character.description || pickNestedString(data, ['description'])),
        characterPersonality: normalizeText(character.personality || pickNestedString(data, ['personality'])),
        characterDepthPrompt: normalizeText(
            pickNestedString(character, ['characterDepthPrompt'])
            || pickNestedString(character, ['character_depth_prompt'])
            || pickNestedString(data, ['extensions', 'depth_prompt', 'prompt'])
            || pickNestedString(data, ['character_depth_prompt'])
            || pickNestedString(data, ['depth_prompt']),
        ),
        scenario: normalizeText(character.scenario || pickNestedString(data, ['scenario'])),
        creatorNotes: normalizeText(character.creatorNotes || character.creator_notes || pickNestedString(data, ['creator_notes'])),
    };
}

function buildCharacterFilterData(context: XbTavernContext = {}): XbTavernWorldSettings['characterFilterData'] {
    const character = context.character || {};
    const avatar = normalizeText(character.avatar);
    const avatarFile = avatar.split(/[\\/]/).pop() || avatar;
    const tags = Array.isArray(character.tags) ? character.tags : [];
    return {
        names: [
            character.name,
            character.characterKey,
            avatar,
            avatarFile,
        ].map((item) => normalizeText(item)).filter(Boolean),
        tags: tags.map((item) => normalizeText(item)).filter(Boolean),
    };
}

function formatScanMessageWithName(message: XbTavernHistoryMessage = {}, context: XbTavernContext = {}): string {
    const content = String(message.content || message.mes || message.message || '');
    if (!content) {return '';}
    const role = message.is_user === true ? 'user' : normalizeRole(message.role, 'assistant');
    const fallbackName = role === 'user' ? context.user?.name : context.character?.name;
    const name = normalizeText(message.name || fallbackName);
    return name ? `${name}: ${content}` : content;
}

function buildScanMessages(context: XbTavernContext = {}, currentUserMessage = '', includeNames = false): string[] {
    const history = context.history || [];
    const currentUser = includeNames && currentUserMessage
        ? `${normalizeText(context.user?.name) || 'User'}: ${currentUserMessage}`
        : currentUserMessage;
    return [
        ...history.map((message) => includeNames
            ? formatScanMessageWithName(message, context)
            : (message.content || message.mes || message.message || '')),
        currentUser,
    ].map((item) => String(item || '')).filter(Boolean);
}

export function buildScanText(context: XbTavernContext = {}, currentUserMessage = '', settings: XbTavernWorldSettings = {}): string {
    return buildScanTextFromMessages(buildScanMessages(context, currentUserMessage, settings.includeNames === true), normalizeScanDepth(settings.scanDepth ?? 2, 2));
}

function collectContextWorldEntries(context: XbTavernContext = {}): XbTavernWorldEntry[] {
    const hasWorldBooks = Array.isArray(context.worldBooks) && context.worldBooks.length > 0;
    const directEntries = !hasWorldBooks && Array.isArray(context.worldEntries) ? context.worldEntries.map((entry) => ({
        ...entry,
        sourceWorldBook: entry.sourceWorldBook || entry.worldName || entry.world || '',
    })) : [];
    const bookEntries = (Array.isArray(context.worldBooks) ? context.worldBooks : [])
        .flatMap((book) => {
            const sourceType = normalizeText((book as unknown as Record<string, unknown>).worldSourceType);
            const sourceIndex = Number((book as unknown as Record<string, unknown>).worldSourceIndex);
            return Array.isArray(book.entries)
                ? book.entries.map((entry) => ({
                    ...entry,
                    sourceWorldBook: entry.sourceWorldBook || entry.worldName || entry.world || book.name,
                    worldSourceType: normalizeText(entry.worldSourceType) || sourceType,
                    worldSourceIndex: Number.isFinite(Number(entry.worldSourceIndex))
                        ? Number(entry.worldSourceIndex)
                        : (Number.isFinite(sourceIndex) ? sourceIndex : undefined),
                }))
                : [];
        });
    return dedupeWorldEntries([...directEntries, ...bookEntries]);
}

function makeWorldEntryDedupeKey(entry: XbTavernWorldEntry = {}): string {
    const source = normalizeText(entry.sourceWorldBook || entry.worldName || entry.world) || 'direct';
    const rawUid = entry.uid ?? entry.id;
    const uid = normalizeText(rawUid);
    if (uid) {return `${source}\u0000uid\u0000${uid}`;}
    const title = normalizeText(entry.comment || entry.title || entry.name);
    const content = normalizeText(entry.content);
    const key = normalizeStringArray(entry.key).join('\u0001');
    const keysecondary = [
        ...normalizeStringArray(entry.keysecondary),
        ...normalizeStringArray(entry.secondary_keys),
    ].join('\u0001');
    return `${source}\u0000body\u0000${title}\u0000${key}\u0000${keysecondary}\u0000${content}`;
}

function dedupeWorldEntries(entries: XbTavernWorldEntry[] = []): XbTavernWorldEntry[] {
    const seen = new Set<string>();
    const result: XbTavernWorldEntry[] = [];
    entries.forEach((entry) => {
        const key = makeWorldEntryDedupeKey(entry);
        if (seen.has(key)) {return;}
        seen.add(key);
        result.push(entry);
    });
    return result;
}

interface PreparedXbTavernMessageBuild {
    character: XbTavernCharacter;
    user: XbTavernUser;
    history: XbTavernHistoryMessage[];
    currentUserMessage: string;
    historyMode: 'raw' | 'squash';
    squashRole?: XbTavernRole;
    memoryContext: XbTavernMemoryContext;
    presetSections: NormalizedPresetSection[];
    scanText: string;
    worldSettings: XbTavernWorldSettings;
    worldEntryCandidates: XbTavernWorldEntryCandidate[];
    activatedWorldEntries: ActivatedWorldEntry[];
    localStateWorldEntries: ActivatedWorldEntry[];
    budgetDebug: ReturnType<typeof buildWorldBudgetDebug>;
    promptConversationMessages?: XbTavernMessage[];
    runtimeDepthEntries: XbTavernRuntimeDepthEntry[];
    runtimeProtocolMessages: XbTavernMessage[];
}

function prepareXbTavernMessageBuild(
    context: XbTavernContext = {},
    chatPreset: TavernChatPromptPresetBundle = {},
    runtimeState: XbTavernRuntimeState = {},
): PreparedXbTavernMessageBuild {
    const character = context.character || {};
    const user = context.user || {};
    const history = context.history || [];
    const currentUserMessage = runtimeState.currentUserMessage || '';
    const historyMode = runtimeState.historyMode || 'raw';
    const memoryContext = runtimeState.memoryContext || {};
    const runtimeDepthEntries = Array.isArray(runtimeState.runtimeDepthEntries) ? runtimeState.runtimeDepthEntries : [];
    const runtimeProtocolMessages = Array.isArray(runtimeState.runtimeProtocolMessages) ? runtimeState.runtimeProtocolMessages : [];
    const presetSections = normalizeChatPromptSections(chatPreset);
    const runtimeWorldSettings = runtimeState.worldSettings || {};
    const explicitScanText = typeof runtimeState.worldScanText === 'string';
    const scanMessages = buildScanMessages(context, currentUserMessage, runtimeWorldSettings.includeNames === true);
    const scanText = explicitScanText
        ? String(runtimeState.worldScanText || '')
        : buildScanTextFromMessages(scanMessages, normalizeScanDepth(runtimeWorldSettings.scanDepth ?? 2, 2));
    const injectScanText = [
        normalizeText(runtimeWorldSettings.injectScanText),
        buildAuthorNoteInjectScanText(context, currentUserMessage),
    ].filter(Boolean).join('\n');
    const nativeActivatedEntries = normalizeNativeActivatedEntries(context.nativeWorldInfo?.activatedEntries);
    const nativePromptEntries = buildNativePromptEntries(context.nativeWorldInfo);
    const worldSettings = {
        ...runtimeWorldSettings,
        scanText,
        injectScanText,
        scanMessages: explicitScanText ? undefined : scanMessages,
        globalScanData: runtimeWorldSettings.globalScanData || buildGlobalScanData(context),
        characterFilterData: runtimeWorldSettings.characterFilterData || buildCharacterFilterData(context),
        turn: runtimeState.turn ?? runtimeState.worldSettings?.turn,
        entryStates: runtimeState.entryStates ?? runtimeState.worldSettings?.entryStates,
    };
    const allWorldEntries = collectContextWorldEntries(context);
    const localWorldEntries = context.nativeWorldInfo
        ? []
        : allWorldEntries;
    const activation = runWorldActivation(localWorldEntries, worldSettings);
    const activatedBeforeBudget = activation.activatedBeforeBudget;
    const budgetDebug = activation.budgetDebug;
    const localWorldEntryCandidates = buildWorldEntryCandidates(localWorldEntries, activatedBeforeBudget, worldSettings, budgetDebug);
    const localActivatedWorldEntries = activation.activatedEntries;
    if (nativeActivatedEntries.length || nativePromptEntries.length || context.nativeWorldInfo) {
        const nativeWorldEntries = nativePromptEntries.length ? nativePromptEntries : nativeActivatedEntries;
        return {
            character,
            user,
            history,
            currentUserMessage,
            historyMode,
            squashRole: runtimeState.squashRole,
            memoryContext,
            runtimeDepthEntries,
            runtimeProtocolMessages,
            presetSections,
            scanText,
            worldSettings,
            worldEntryCandidates: [
                ...buildNativeWorldEntryCandidates(nativeActivatedEntries),
                ...localWorldEntryCandidates,
            ],
            activatedWorldEntries: [
                ...nativeWorldEntries,
                ...localActivatedWorldEntries,
            ],
            localStateWorldEntries: localActivatedWorldEntries,
            budgetDebug,
        };
    }
    return {
        character,
        user,
        history,
        currentUserMessage,
        historyMode,
        squashRole: runtimeState.squashRole,
        memoryContext,
        runtimeDepthEntries,
        runtimeProtocolMessages,
        presetSections,
        scanText,
        worldSettings,
        worldEntryCandidates: localWorldEntryCandidates,
        activatedWorldEntries: localActivatedWorldEntries,
        localStateWorldEntries: localActivatedWorldEntries,
        budgetDebug,
    };
}

function buildPromptConversationMessages(
    prepared: PreparedXbTavernMessageBuild,
    chatPreset: TavernChatPromptPresetBundle = {},
): XbTavernMessage[] {
    const historyMessages = buildHistoryMessages(prepared.history, {
        mode: prepared.historyMode,
        role: prepared.squashRole || 'system',
        userName: prepared.user.name,
        characterName: prepared.character.name,
        separator: chatPreset.historySeparator,
    });
    const currentUser = makeMessage('user', prepared.currentUserMessage);
    return compactMessages([...historyMessages, currentUser]);
}

function buildXbTavernMessagesFromPrepared(
    chatPreset: TavernChatPromptPresetBundle = {},
    prepared: PreparedXbTavernMessageBuild,
    regexApplications?: TavernRegexApplicationSummary,
): XbTavernMessageBuildResult {
    const {
        character,
        user,
        history,
        currentUserMessage,
        historyMode,
        squashRole,
        memoryContext,
        runtimeDepthEntries,
        runtimeProtocolMessages,
        presetSections,
        scanText,
        worldSettings,
        worldEntryCandidates,
        activatedWorldEntries,
        budgetDebug,
    } = prepared;
    const worldBuckets = groupWorldEntries(activatedWorldEntries);
    void history;
    void currentUserMessage;
    void squashRole;

    const depthEntries = [
        ...buildMemoryDepthEntries(memoryContext),
        ...worldBuckets.atDepth,
        ...buildRuntimeDepthEntries(runtimeDepthEntries),
    ];
    const depthMessages = buildDepthMessages(depthEntries);
    const depthByMessage = new WeakMap<XbTavernMessage, number>();
    depthMessages.forEach((item) => depthByMessage.set(item.message, item.depth));
    const conversationMessages = insertDepthMessages(
        (prepared.promptConversationMessages || buildPromptConversationMessages(prepared, chatPreset))
            .map(appendPromptReasoningToMessage),
        depthMessages,
    );

    const topSections = presetSectionUnits(pickSections(presetSections, 'top'), 'top');
    const beforeCharacterSections = presetSectionUnits(pickSections(presetSections, 'beforeCharacter'), 'before character');
    const afterCharacterSections = presetSectionUnits(pickSections(presetSections, 'afterCharacter'), 'after character');
    const beforeHistorySections = presetSectionUnits(pickSections(presetSections, 'beforeHistory'), 'before history');
    const afterHistorySections = presetSectionUnits(pickSections(presetSections, 'afterHistory'), 'after history');
    const assistantPrefillSections = presetSectionUnits(pickSections(presetSections, 'assistantPrefill'), 'assistant prefill', 'assistant-prefill');
    const hasPromptManagerOrder = presetSections.some((section) => section.source === 'promptManager');
    const conversationUnits = conversationMessages.map((message, index) => buildConversationMessageUnit(message, index, depthByMessage));
    for (let index = conversationUnits.length - 1; index >= 0; index -= 1) {
        if (conversationUnits[index]?.message?.role === 'user') {
            conversationUnits[index].label = 'current user message';
            break;
        }
    }
    const runtimeProtocolUnits = runtimeProtocolMessages.map((message, index) => ({
        message,
        layer: 'runtime-protocol',
        label: `runtime protocol ${index + 1}`,
    }));
    const orderedPromptUnits = hasPromptManagerOrder
        ? buildPromptManagerOrderedUnits({
            presetSections,
            character,
            user,
            worldBuckets,
            conversationUnits,
            runtimeProtocolUnits,
        })
        : null;
    const compacted = compactMessageUnits(orderedPromptUnits || [
        ...topSections,
        makeMessageUnit('system', renderEntryBlock('world_info_before_character', worldBuckets.before), 'world-before', 'world info before character'),
        ...beforeCharacterSections,
        makeMessageUnit('system', buildCharacterBlock(character, user), 'character-card', 'character card'),
        makeMessageUnit('system', renderEntryBlock('world_info_after_character', worldBuckets.after), 'world-after', 'world info after character'),
        ...afterCharacterSections,
        makeMessageUnit('system', renderEntryBlock('world_info_examples_top', worldBuckets.examplesTop), 'world-examples', 'world info examples top'),
        makeMessageUnit('system', renderEntryBlock('world_info_author_note_top', worldBuckets.authorNoteTop), 'world-author-note', 'world info author note top'),
        ...beforeHistorySections,
        ...conversationUnits,
        ...runtimeProtocolUnits,
        ...afterHistorySections,
        makeMessageUnit('system', renderEntryBlock('world_info_author_note_bottom', worldBuckets.authorNoteBottom), 'world-author-note', 'world info author note bottom'),
        makeMessageUnit('system', renderEntryBlock('world_info_examples_bottom', worldBuckets.examplesBottom), 'world-examples', 'world info examples bottom'),
        ...assistantPrefillSections,
    ]);
    const messages = compacted.messages;

    return {
        messages,
        messageLayers: compacted.messageLayers,
        activatedWorldEntries,
        worldEntryCandidates,
        outlets: Object.fromEntries(Object.entries(worldBuckets.outlet).map(([name, entries]) => [
            name,
            entries.map((entry) => entry.content).join('\n\n'),
        ])),
        meta: {
            scanText,
            scanTextChars: scanText.length,
            historyMode,
            squashedHistory: historyMode !== 'raw',
            rawMessagesJson: JSON.stringify(messages, null, 2),
            ...(regexApplications ? { regexApplications } : {}),
            ...(memoryContext.structuredStates?.length ? { structuredStates: memoryContext.structuredStates } : {}),
            ...(memoryContext.spatialState ? { spatialState: memoryContext.spatialState } : {}),
            ...(memoryContext.statusPanelYaml ? { statusPanelYaml: memoryContext.statusPanelYaml } : {}),
            worldBudget: {
                enabled: budgetDebug.enabled,
                limit: budgetDebug.limit,
                used: budgetDebug.used,
                remaining: budgetDebug.remaining,
                activatedChars: budgetDebug.activatedChars,
                skippedChars: budgetDebug.skippedChars,
            },
            worldPositionCounts: countWorldPositions(activatedWorldEntries),
            worldEntryStateUpdates: buildWorldEntryStateUpdates(prepared.localStateWorldEntries, worldSettings),
        },
    };
}

function replaceBuildResultMessages(
    result: XbTavernMessageBuildResult,
    messages: XbTavernMessage[] = [],
): XbTavernMessageBuildResult {
    const compactedMessages = compactMessages(messages.map((message) => ({
        ...message,
        content: normalizeText(message.content),
    })));
    return {
        ...result,
        messages: compactedMessages,
        messageLayers: result.messageLayers.map((layer, index) => {
            const message = compactedMessages[index];
            if (!message) {return layer;}
            const chars = message.content.length;
            return {
                ...layer,
                role: message.role,
                chars,
                tokenEstimate: Math.max(1, Math.ceil(chars / 4)),
            };
        }),
        meta: {
            ...result.meta,
            rawMessagesJson: JSON.stringify(compactedMessages, null, 2),
        },
    };
}

export function buildXbTavernMessages(
    context: XbTavernContext = {},
    chatPreset: TavernChatPromptPresetBundle = {},
    runtimeState: XbTavernRuntimeState = {},
): XbTavernMessageBuildResult {
    return buildXbTavernMessagesFromPrepared(
        chatPreset,
        prepareXbTavernMessageBuild(context, chatPreset, runtimeState),
    );
}

export async function buildXbTavernMessagesAsync(
    context: XbTavernContext = {},
    chatPreset: TavernChatPromptPresetBundle = {},
    runtimeState: XbTavernRuntimeState = {},
    options: {
        transformWorldEntries?: XbTavernWorldEntriesTransform;
        transformConversationMessages?: XbTavernConversationMessagesTransform;
        transformFinalMessages?: XbTavernFinalMessagesTransform;
        regexApplications?: TavernRegexApplicationSummary;
    } = {},
): Promise<XbTavernMessageBuildResult> {
    const prepared = prepareXbTavernMessageBuild(context, chatPreset, runtimeState);
    if (options.transformWorldEntries) {
        prepared.activatedWorldEntries = (await options.transformWorldEntries(prepared.activatedWorldEntries))
            .map((entry) => ({
                ...entry,
                content: normalizeText(entry.content),
                contentChars: normalizeText(entry.content).length,
            }))
            .filter((entry) => !!entry.content);
        const transformedByKey = new Map(prepared.activatedWorldEntries.map((entry) => [entry.activationKey, entry]));
        prepared.localStateWorldEntries = prepared.localStateWorldEntries
            .map((entry) => transformedByKey.get(entry.activationKey) || entry)
            .filter((entry) => !!entry.content);
    }
    if (options.transformConversationMessages) {
        prepared.promptConversationMessages = compactMessages(
            (await options.transformConversationMessages(buildPromptConversationMessages(prepared, chatPreset)))
                .map((message) => ({
                    ...message,
                    content: normalizeText(message.content),
                })),
        );
    }
    const result = buildXbTavernMessagesFromPrepared(chatPreset, prepared, options.regexApplications);
    if (!options.transformFinalMessages) {return result;}
    return replaceBuildResultMessages(result, await options.transformFinalMessages(result.messages));
}

export function createXbTavernBuildSnapshot(
    context: XbTavernContext = {},
    chatPreset: TavernChatPromptPresetBundle = {},
    result: XbTavernMessageBuildResult,
    diagnostics: unknown = undefined,
): XbTavernBuildSnapshot {
    const character = context.character || {};
    const user = context.user || {};
    const worldBooks = Array.isArray(context.worldBooks) ? context.worldBooks : [];
    const candidateByKey = new Map(result.worldEntryCandidates.map((entry) => [entry.activationKey, entry]));
    return {
        chatPresetId: normalizeText(chatPreset.id),
        chatPresetName: normalizeText(chatPreset.name),
        presetId: normalizeText(chatPreset.id),
        presetName: normalizeText(chatPreset.name),
        characterKey: normalizeText(character.characterKey),
        characterName: normalizeText(character.name),
        userName: normalizeText(user.name),
        historyCount: Array.isArray(context.history) ? context.history.length : 0,
        worldBooks: worldBooks.map((book) => ({
            name: normalizeText(book.name),
            entries: Array.isArray(book.entries) ? book.entries.length : 0,
            ...(book.error ? { error: normalizeText(book.error) } : {}),
        })),
        messageCount: result.messages.length,
        messageChars: result.messages.reduce((sum, message) => sum + String(message.content || '').length, 0),
        messageLayers: result.messageLayers,
        rawMessagesJson: result.meta.rawMessagesJson,
        ...(result.meta.regexApplications ? { regexApplications: result.meta.regexApplications } : {}),
        activatedWorldEntries: result.activatedWorldEntries.map((entry) => {
            const candidate = candidateByKey.get(entry.activationKey);
            return {
                uid: entry.uid,
                sourceWorldBook: entry.sourceWorldBook,
                title: candidate?.title || normalizeText(entry.comment || entry.title || entry.name || entry.uid),
                activationReason: entry.activationReason,
                insertionTarget: candidate?.insertionTarget || insertionTargetForEntry(entry),
                contentChars: entry.contentChars,
            };
        }),
        ...(context.nativeWorldInfo ? {
            nativeWorldInfo: {
                trigger: normalizeText(context.nativeWorldInfo.trigger),
                sourceNames: Array.isArray(context.nativeWorldInfo.sourceNames)
                    ? context.nativeWorldInfo.sourceNames.map((source) => ({
                        name: normalizeText(source.name),
                        ...(source.sourceType ? { sourceType: source.sourceType } : {}),
                        ...(Number.isFinite(Number(source.sourceIndex)) ? { sourceIndex: Number(source.sourceIndex) } : {}),
                    }))
                : [],
            },
        } : {}),
        ...(result.meta.structuredStates?.length ? {
            structuredStates: result.meta.structuredStates.map((state) => ({
                docType: normalizeText(state.docType),
                docId: normalizeText(state.docId),
                revision: Number(state.revision) || 0,
                digestChars: normalizeText(state.digest).length,
            })),
        } : {}),
        ...(result.meta.spatialState ? { spatialStateChars: normalizeText(result.meta.spatialState).length } : {}),
        ...(result.meta.statusPanelYaml ? { statusPanelChars: normalizeText(result.meta.statusPanelYaml).length } : {}),
        worldBudget: result.meta.worldBudget,
        worldPositionCounts: result.meta.worldPositionCounts,
        scanTextChars: result.meta.scanTextChars,
        ...(diagnostics === undefined ? {} : { diagnostics }),
    };
}
