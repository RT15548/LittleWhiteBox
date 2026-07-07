import {
    baseChatReplace,
    depth_prompt_depth_default,
    depth_prompt_role_default,
    extension_prompt_roles,
    extension_prompt_types,
    extension_prompts,
    name2,
    parseMesExamples,
    setExtensionPrompt,
} from '../../../../../../../script.js';
import { NOTE_MODULE_NAME } from '../../../../../../authors-note.js';
import { inject_ids } from '../../../../../../constants.js';
import { parseExampleIntoIndividual, prepareOpenAIMessages, promptManager } from '../../../../../../openai.js';
import { persona_description_positions, power_user } from '../../../../../../power-user.js';
import {
    resolveXbTavernAuthorNoteState,
    type TavernChatPromptPresetBundle,
    type XbTavernContext,
    type XbTavernHistoryMessage,
    type XbTavernMessage,
    type XbTavernNativeWorldInfoRuntime,
} from '../shared/message-assembler.js';

interface TavernNativePromptInput {
    requestId?: string;
    context?: XbTavernContext;
    chatPreset?: TavernChatPromptPresetBundle;
    currentUserMessage?: string;
    generationType?: string;
    debugStage?: string;
    memoryPrompt?: string;
    chancePrompt?: string;
    actionCheckPrompt?: string;
}

export interface TavernNativePromptResult {
    messages: XbTavernMessage[];
    source: 'sillytavern-prepareOpenAIMessages';
    promptMessageCount: number;
}

type ExtensionPromptSnapshot = Record<string, Record<string, unknown>>;

interface PersonaPromptSnapshot {
    description: unknown;
    position: unknown;
}

interface PromptManagerSnapshot {
    activeCharacter: unknown;
    prompts: unknown;
    promptOrder: unknown;
    hasOpenAiMaxContext: boolean;
    openAiMaxContext: unknown;
    hasOpenAiMaxTokens: boolean;
    openAiMaxTokens: unknown;
}

let nativePromptQueue: Promise<unknown> = Promise.resolve();
const nativePromptAbortControllers = new Map<string, AbortController>();
const NATIVE_PROMPT_DRY_RUN_CONTEXT_TOKENS = 200000;
const NATIVE_PROMPT_DRY_RUN_RESPONSE_TOKENS = 4096;

interface NativePromptTraceStep {
    name: string;
    ms: number;
}

interface NativePromptTrace {
    id: string;
    stage: string;
    queuedAt: number;
    startedAt: number;
    steps: NativePromptTraceStep[];
    input: TavernNativePromptInput;
    signal?: AbortSignal;
}

function nowMs(): number {
    return typeof performance !== 'undefined' && typeof performance.now === 'function'
        ? performance.now()
        : Date.now();
}

function createNativePromptTrace(input: TavernNativePromptInput = {}, queuedAt = nowMs(), signal?: AbortSignal): NativePromptTrace {
    return {
        id: `native-prompt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        stage: normalizeText(input.debugStage || 'native_prompt_build'),
        queuedAt,
        startedAt: nowMs(),
        steps: [],
        input,
        signal,
    };
}

function nativePromptTraceMeta(trace: NativePromptTrace): Record<string, unknown> {
    const context = trace.input.context || {};
    const runtime = context.nativeWorldInfo || {};
    return {
        id: trace.id,
        stage: trace.stage,
        generationType: normalizeText(trace.input.generationType || 'normal'),
        historyCount: Array.isArray(context.history) ? context.history.length : 0,
        currentUserChars: normalizeText(trace.input.currentUserMessage || '').length,
        memoryChars: normalizeText(trace.input.memoryPrompt || '').length,
        chanceChars: normalizeText(trace.input.chancePrompt || '').length,
        actionCheckChars: normalizeText(trace.input.actionCheckPrompt || '').length,
        worldBeforeChars: normalizeText(runtime.worldInfoBefore).length,
        worldAfterChars: normalizeText(runtime.worldInfoAfter).length,
        depthEntries: Array.isArray(runtime.worldInfoDepth) ? runtime.worldInfoDepth.length : 0,
        authorNoteChars: [
            ...(Array.isArray(runtime.anBefore) ? runtime.anBefore : []),
            ...(Array.isArray(runtime.anAfter) ? runtime.anAfter : []),
            asRecord(context.authorNote).prompt,
        ].map((item) => normalizeText(item).length).reduce((total, value) => total + value, 0),
    };
}

function logNativePromptTrace(event: string, trace: NativePromptTrace, extra: Record<string, unknown> = {}): void {
    console.info(`[小白酒馆] native prompt ${event}`, {
        ...nativePromptTraceMeta(trace),
        ...extra,
    });
}

function createNativePromptAbortError(): Error {
    try {
        return new DOMException('native_prompt_cancelled', 'AbortError') as unknown as Error;
    } catch {
        const error = new Error('native_prompt_cancelled');
        error.name = 'AbortError';
        return error;
    }
}

function assertNativePromptNotCancelled(trace: NativePromptTrace): void {
    if (trace.signal?.aborted) {
        throw createNativePromptAbortError();
    }
}

async function traceNativePromptStep<T>(
    trace: NativePromptTrace,
    name: string,
    task: () => Promise<T> | T,
): Promise<T> {
    assertNativePromptNotCancelled(trace);
    const startedAt = nowMs();
    logNativePromptTrace(`${name}:start`, trace);
    try {
        const result = await task();
        assertNativePromptNotCancelled(trace);
        const ms = Math.round(nowMs() - startedAt);
        trace.steps.push({ name, ms });
        logNativePromptTrace(`${name}:end`, trace, { ms });
        return result;
    } catch (error) {
        const ms = Math.round(nowMs() - startedAt);
        trace.steps.push({ name, ms });
        logNativePromptTrace(`${name}:failed`, trace, {
            ms,
            error: error instanceof Error ? error.message : String(error || 'unknown_error'),
        });
        throw error;
    }
}

function normalizeText(value: unknown = ''): string {
    return String(value || '').replace(/\r/g, '').trim();
}

function asRecord(value: unknown): Record<string, unknown> {
    return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function normalizeRole(value: unknown): XbTavernMessage['role'] {
    if (value === 'user' || value === true || value === 1) {return 'user';}
    if (value === 'system' || value === 'sys' || value === 0) {return 'system';}
    if (value === 'tool') {return 'tool';}
    return 'assistant';
}

function captureExtensionPrompts(): ExtensionPromptSnapshot {
    return Object.fromEntries(
        Object.entries(extension_prompts || {}).map(([key, value]) => [key, { ...asRecord(value) }]),
    );
}

function restoreExtensionPrompts(snapshot: ExtensionPromptSnapshot): void {
    Object.keys(extension_prompts || {}).forEach((key) => {
        delete extension_prompts[key];
    });
    Object.entries(snapshot).forEach(([key, value]) => {
        extension_prompts[key] = { ...value };
    });
}

function flushNativeWorldInfoInjections(): void {
    const depthPrefix = inject_ids.CUSTOM_WI_DEPTH;
    const outletPrefix = inject_ids.CUSTOM_WI_OUTLET('');
    Object.keys(extension_prompts || {}).forEach((key) => {
        if (key.startsWith(depthPrefix) || key.startsWith(outletPrefix)) {
            delete extension_prompts[key];
        }
    });
}

function capturePersonaPrompt(): PersonaPromptSnapshot {
    return {
        description: power_user?.persona_description,
        position: power_user?.persona_description_position,
    };
}

function restorePersonaPrompt(snapshot: PersonaPromptSnapshot): void {
    power_user.persona_description = snapshot.description;
    power_user.persona_description_position = snapshot.position;
}

function capturePromptManager(): PromptManagerSnapshot {
    const runtime = asRecord(promptManager);
    const serviceSettings = asRecord(runtime.serviceSettings);
    return {
        activeCharacter: runtime.activeCharacter,
        prompts: cloneJson(serviceSettings.prompts),
        promptOrder: cloneJson(serviceSettings.prompt_order),
        hasOpenAiMaxContext: Object.prototype.hasOwnProperty.call(serviceSettings, 'openai_max_context'),
        openAiMaxContext: serviceSettings.openai_max_context,
        hasOpenAiMaxTokens: Object.prototype.hasOwnProperty.call(serviceSettings, 'openai_max_tokens'),
        openAiMaxTokens: serviceSettings.openai_max_tokens,
    };
}

function restorePromptManager(snapshot: PromptManagerSnapshot): void {
    const runtime = asRecord(promptManager);
    const serviceSettings = asRecord(runtime.serviceSettings);
    if ('activeCharacter' in runtime) {
        runtime.activeCharacter = snapshot.activeCharacter;
    }
    serviceSettings.prompts = cloneJson(snapshot.prompts);
    serviceSettings.prompt_order = cloneJson(snapshot.promptOrder);
    if (snapshot.hasOpenAiMaxContext) {
        serviceSettings.openai_max_context = snapshot.openAiMaxContext;
    } else {
        delete serviceSettings.openai_max_context;
    }
    if (snapshot.hasOpenAiMaxTokens) {
        serviceSettings.openai_max_tokens = snapshot.openAiMaxTokens;
    } else {
        delete serviceSettings.openai_max_tokens;
    }
}

function cloneJson<T>(value: T): T {
    try {
        return JSON.parse(JSON.stringify(value)) as T;
    } catch {
        return value;
    }
}

function positiveInteger(value: unknown): number | null {
    const numeric = Math.floor(Number(value));
    return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
}

function firstPositiveInteger(values: unknown[]): number | null {
    for (const value of values) {
        const numeric = positiveInteger(value);
        if (numeric !== null) {return numeric;}
    }
    return null;
}

function applyNativeDryRunTokenBudget(chatPreset: TavernChatPromptPresetBundle = {}): void {
    if (!promptManager?.serviceSettings || typeof promptManager.serviceSettings !== 'object') {return;}
    const serviceSettings = promptManager.serviceSettings as Record<string, unknown>;
    const preset = asRecord(chatPreset.promptManager);
    const rawPreset = asRecord(preset.rawPreset);
    const contextTokens = Math.max(
        NATIVE_PROMPT_DRY_RUN_CONTEXT_TOKENS,
        firstPositiveInteger([
            preset.openai_max_context,
            rawPreset.openai_max_context,
            serviceSettings.openai_max_context,
        ]) || 0,
    );
    const responseTokens = Math.min(
        contextTokens - 1,
        firstPositiveInteger([
            preset.openai_max_tokens,
            rawPreset.openai_max_tokens,
            serviceSettings.openai_max_tokens,
        ]) || NATIVE_PROMPT_DRY_RUN_RESPONSE_TOKENS,
    );
    serviceSettings.openai_max_context = contextTokens;
    serviceSettings.openai_max_tokens = Math.max(1, responseTokens);
}

function roleNumber(role: unknown): number {
    if (typeof role === 'number' && Number.isFinite(role)) {return role;}
    if (role === 'user') {return Number(extension_prompt_roles.USER) || 1;}
    if (role === 'assistant') {return Number(extension_prompt_roles.ASSISTANT) || 2;}
    return Number(extension_prompt_roles.SYSTEM) || 0;
}

function buildOpenAiMessages(context: XbTavernContext = {}, currentUserMessage = ''): XbTavernMessage[] {
    const characterName = normalizeText(context.character?.name || name2);
    const userName = normalizeText(context.user?.name) || 'User';
    const history = Array.isArray(context.history) ? context.history : [];
    const messages = history
        .map((item: XbTavernHistoryMessage) => {
            const role = normalizeRole(item.role ?? item.is_user);
            const content = normalizeText(item.content || item.mes || item.message);
            if (!content) {return null;}
            return {
                role,
                content,
                ...(item.name ? { name: normalizeText(item.name) } : {}),
            };
        })
        .filter(Boolean) as XbTavernMessage[];
    const userText = normalizeText(currentUserMessage);
    if (userText) {
        messages.push({
            role: 'user',
            content: userText,
            name: userName,
        });
    }
    const prepared = messages.map((message) => ({
        ...message,
        name: message.name || (message.role === 'user' ? userName : message.role === 'assistant' ? characterName : undefined),
    }));
    return prepared.reduce<XbTavernMessage[]>((result, message, index) => {
        result[prepared.length - 1 - index] = message;
        return result;
    }, []);
}

function buildMessageExamples(context: XbTavernContext = {}): unknown[] {
    const character = context.character || {};
    const data = asRecord(character.data);
    const runtime = context.nativeWorldInfo || {};
    const examples = parseMesExamples(
        baseChatReplace(character.mesExample || character.mes_example || data.mes_example || ''),
        false,
    );
    const worldExamples = Array.isArray(runtime.worldInfoExamples) ? runtime.worldInfoExamples : [];
    worldExamples.forEach((entry) => {
        const content = normalizeText(entry?.content);
        if (!content) {return;}
        const parsed = parseMesExamples(baseChatReplace(content), false);
        const position = String(entry?.position ?? '').toLowerCase();
        if (position === 'before' || position === '0') {
            examples.unshift(...parsed);
        } else {
            examples.push(...parsed);
        }
    });
    return examples.map((example) => parseExampleIntoIndividual(
        String(example || '').replace(/<START>/i, '{Example Dialogue:}').replace(/\r/gm, ''),
        true,
    ));
}

function addInChatPrompt(key: string, content: unknown, depth: number, role: unknown): void {
    const value = normalizeText(content);
    if (!value) {return;}
    setExtensionPrompt(
        key,
        value,
        Number(extension_prompt_types.IN_CHAT) || 1,
        Math.max(0, Math.floor(Number(depth) || 0)),
        false,
        roleNumber(role),
    );
}

function getUserPersonaPrompt(context: XbTavernContext = {}): string {
    return normalizeText(context.user?.persona || context.user?.description);
}

function applyUserPersonaPrompt(context: XbTavernContext = {}): string {
    const persona = getUserPersonaPrompt(context);
    power_user.persona_description = persona;
    power_user.persona_description_position = persona_description_positions.IN_PROMPT;
    return persona;
}

function readCharacterDepthPrompt(context: XbTavernContext = {}): { content: string; depth: number; role: unknown } {
    const character = context.character || {};
    const data = asRecord(character.data);
    const extensions = asRecord(data.extensions);
    const depthPrompt = asRecord(extensions.depth_prompt);
    const legacyDepthPrompt = asRecord(data.depth_prompt);
    const content = normalizeText(
        character.characterDepthPrompt
        || character.character_depth_prompt
        || depthPrompt.prompt
        || data.character_depth_prompt
        || legacyDepthPrompt.prompt
        || (typeof data.depth_prompt === 'string' ? data.depth_prompt : ''),
    );
    return {
        content,
        depth: Number(depthPrompt.depth ?? depth_prompt_depth_default),
        role: depthPrompt.role ?? depth_prompt_role_default,
    };
}

function addCharacterDepthPrompt(context: XbTavernContext = {}): { content: string; depth: number; role: unknown } {
    const prompt = readCharacterDepthPrompt(context);
    if (!prompt.content) {return prompt;}
    addInChatPrompt(
        'xb_tavern_character_depth_prompt',
        prompt.content,
        prompt.depth,
        prompt.role,
    );
    return prompt;
}

function addNativeWorldInfoDepth(runtime: XbTavernNativeWorldInfoRuntime = {}): void {
    (Array.isArray(runtime.worldInfoDepth) ? runtime.worldInfoDepth : []).forEach((entry, index) => {
        const entries = Array.isArray(entry.entries) ? entry.entries.map(normalizeText).filter(Boolean) : [];
        if (!entries.length) {return;}
        addInChatPrompt(
            `xb_tavern_wi_depth_${Math.max(0, Number(entry.depth) || 0)}_${roleNumber(entry.role)}_${index}`,
            entries.join('\n'),
            Number(entry.depth) || 0,
            entry.role,
        );
    });
}

function addNativeWorldInfoOutlets(runtime: XbTavernNativeWorldInfoRuntime = {}): void {
    const outlets = asRecord(runtime.outlets);
    Object.entries(outlets).forEach(([rawName, rawEntries]) => {
        const outletName = normalizeText(rawName);
        const entries = Array.isArray(rawEntries) ? rawEntries.map(normalizeText).filter(Boolean) : [];
        const value = entries.join('\n');
        if (!outletName || !value) {return;}
        setExtensionPrompt(
            inject_ids.CUSTOM_WI_OUTLET(outletName),
            value,
            Number(extension_prompt_types.NONE ?? 0),
            0,
        );
    });
}

function characterPromptManagerIdentity(context: XbTavernContext = {}): Record<string, unknown> | null {
    const character = context.character || {};
    const nativeCharacterId = normalizeText(character.nativeCharacterId);
    if (!nativeCharacterId) {return null;}
    return {
        ...asRecord(character.data),
        ...character,
        id: nativeCharacterId,
        nativeCharacterId,
        name: normalizeText(character.name),
    };
}

function replacePromptOrderForCharacter(existingPromptOrder: unknown, nativeCharacterId = '', nextOrder: unknown[] = []): unknown[] {
    const containers = (Array.isArray(existingPromptOrder) ? existingPromptOrder : [])
        .map((container) => ({ ...asRecord(container) }));
    const targetId = normalizeText(nativeCharacterId);
    const targetIndex = containers.findIndex((container) => normalizeText(container.character_id) === targetId);
    const target = targetIndex >= 0 ? containers[targetIndex] : { character_id: targetId };
    const replacement = {
        ...target,
        character_id: normalizeText(target.character_id) || targetId,
        order: cloneJson(nextOrder),
    };
    if (targetIndex >= 0) {
        containers[targetIndex] = replacement;
    } else {
        containers.push(replacement);
    }
    return containers;
}

function applyChatPresetPromptManager(chatPreset: TavernChatPromptPresetBundle = {}, context: XbTavernContext = {}): void {
    const preset = asRecord(chatPreset.promptManager);
    const rawPreset = asRecord(preset.rawPreset);
    if (!promptManager?.serviceSettings || typeof promptManager.serviceSettings !== 'object') {
        throw new Error('聊天预设未同步：未读取到 Prompt Manager 设置。');
    }
    const serviceSettings = promptManager.serviceSettings as Record<string, unknown>;
    const prompts = Array.isArray(preset.prompts)
        ? preset.prompts
        : Array.isArray(rawPreset.prompts)
            ? rawPreset.prompts
            : null;
    if (!prompts?.length) {
        throw new Error('聊天预设未同步：缺少 prompts。');
    }
    serviceSettings.prompts = cloneJson(prompts);
    let promptOrder = Array.isArray(preset.promptOrder)
        ? cloneJson(preset.promptOrder)
        : Array.isArray(rawPreset.prompt_order)
            ? cloneJson(rawPreset.prompt_order)
            : undefined;
    const activeOrder = Array.isArray(preset.activeOrder) ? preset.activeOrder : [];
    const nativeCharacterId = normalizeText(context.character?.nativeCharacterId);
    if (nativeCharacterId && activeOrder.length) {
        promptOrder = replacePromptOrderForCharacter(promptOrder, nativeCharacterId, activeOrder);
    }
    if (!Array.isArray(promptOrder)) {
        throw new Error('聊天预设未同步：缺少 prompt_order。');
    }
    serviceSettings.prompt_order = promptOrder;
}

function applyPromptManagerActiveCharacter(context: XbTavernContext = {}): void {
    const character = characterPromptManagerIdentity(context);
    if (!character || !promptManager) {return;}
    (promptManager as typeof promptManager & { activeCharacter?: unknown }).activeCharacter = character;
}

function applyAuthorNotePrompt(context: XbTavernContext = {}, currentUserMessage = '', runtime: XbTavernNativeWorldInfoRuntime = {}): void {
    const state = resolveXbTavernAuthorNoteState(context, currentUserMessage);
    const before = (Array.isArray(runtime.anBefore) ? runtime.anBefore : []).map(normalizeText).filter(Boolean);
    const after = (Array.isArray(runtime.anAfter) ? runtime.anAfter : []).map(normalizeText).filter(Boolean);
    const value = state.shouldAddPrompt
        ? [...before, state.prompt, ...after].filter(Boolean).join('\n')
        : '';
    setExtensionPrompt(
        NOTE_MODULE_NAME,
        value,
        state.shouldAddPrompt ? state.position : Number(extension_prompt_types.NONE),
        state.depth,
        state.shouldAddPrompt && state.scan,
        state.role,
    );
}

function toXbMessage(message: unknown): XbTavernMessage | null {
    const record = asRecord(message);
    const role = normalizeRole(record.role);
    const content = typeof record.content === 'string'
        ? record.content
        : record.content === null || record.content === undefined
            ? ''
            : JSON.stringify(record.content);
    if (!content) {return null;}
    return {
        role,
        content,
        ...(record.name ? { name: normalizeText(record.name) } : {}),
        ...(Array.isArray(record.tool_calls) ? { tool_calls: record.tool_calls as XbTavernMessage['tool_calls'] } : {}),
        ...(record.tool_call_id ? { tool_call_id: normalizeText(record.tool_call_id) } : {}),
    };
}

function getCharacterField(context: XbTavernContext = {}, key: string, camelKey: keyof NonNullable<XbTavernContext['character']>): string {
    const character = context.character || {};
    const data = asRecord(character.data);
    return baseChatReplace((character[camelKey] as unknown) || data[key] || '');
}

async function buildNativePromptNow(input: TavernNativePromptInput = {}, queuedAt = nowMs(), signal?: AbortSignal): Promise<TavernNativePromptResult> {
    const trace = createNativePromptTrace(input, queuedAt, signal);
    const context = input.context || {};
    const character = context.character || {};
    const data = asRecord(character.data);
    const runtime = context.nativeWorldInfo || {};
    const snapshot = captureExtensionPrompts();
    const personaSnapshot = capturePersonaPrompt();
    const promptManagerSnapshot = capturePromptManager();
    logNativePromptTrace('start', trace, {
        queuedMs: Math.round(trace.startedAt - trace.queuedAt),
    });
    try {
        assertNativePromptNotCancelled(trace);
        await traceNativePromptStep(trace, 'apply_prompt_manager', () => {
            applyChatPresetPromptManager(input.chatPreset, context);
            applyNativeDryRunTokenBudget(input.chatPreset);
            applyPromptManagerActiveCharacter(context);
        });
        await traceNativePromptStep(trace, 'apply_persona', () => applyUserPersonaPrompt(context));
        await traceNativePromptStep(trace, 'inject_runtime_prompts', () => {
            flushNativeWorldInfoInjections();
            addInChatPrompt('xb_tavern_memory_d1', input.memoryPrompt, 1, 'system');
            addInChatPrompt('xb_tavern_chance_d1', input.chancePrompt, 1, 'system');
            addInChatPrompt('xb_tavern_action_check_d0', input.actionCheckPrompt, 0, 'system');
            addCharacterDepthPrompt(context);
            addNativeWorldInfoDepth(runtime);
            addNativeWorldInfoOutlets(runtime);
            applyAuthorNotePrompt(context, input.currentUserMessage || '', runtime);
        });
        const messages = await traceNativePromptStep(trace, 'build_chat_messages', () => buildOpenAiMessages(context, input.currentUserMessage || ''));
        const messageExamples = await traceNativePromptStep(trace, 'build_examples', () => buildMessageExamples(context));
        const [prepared] = await traceNativePromptStep(trace, 'prepare_openai_messages', () => prepareOpenAIMessages({
            name2: normalizeText(character.name || name2),
            charDescription: getCharacterField(context, 'description', 'description'),
            charPersonality: getCharacterField(context, 'personality', 'personality'),
            scenario: getCharacterField(context, 'scenario', 'scenario'),
            worldInfoBefore: normalizeText(runtime.worldInfoBefore),
            worldInfoAfter: normalizeText(runtime.worldInfoAfter),
            extensionPrompts: extension_prompts,
            bias: '',
            type: normalizeText(input.generationType) || 'normal',
            quietPrompt: '',
            quietImage: null,
            cyclePrompt: '',
            systemPromptOverride: baseChatReplace(data.system_prompt || ''),
            jailbreakPromptOverride: baseChatReplace(data.post_history_instructions || ''),
            messages,
            messageExamples,
        }, true));
        const normalizedMessages = (Array.isArray(prepared) ? prepared : [])
            .map(toXbMessage)
            .filter(Boolean) as XbTavernMessage[];
        logNativePromptTrace('complete', trace, {
            totalMs: Math.round(nowMs() - trace.startedAt),
            queuedMs: Math.round(trace.startedAt - trace.queuedAt),
            preparedCount: Array.isArray(prepared) ? prepared.length : 0,
            messageCount: normalizedMessages.length,
            steps: trace.steps,
        });
        return {
            messages: normalizedMessages,
            source: 'sillytavern-prepareOpenAIMessages',
            promptMessageCount: normalizedMessages.length,
        };
    } catch (error) {
        logNativePromptTrace('failed', trace, {
            totalMs: Math.round(nowMs() - trace.startedAt),
            queuedMs: Math.round(trace.startedAt - trace.queuedAt),
            steps: trace.steps,
            error: error instanceof Error ? error.message : String(error || 'unknown_error'),
        });
        throw error;
    } finally {
        restorePromptManager(promptManagerSnapshot);
        restorePersonaPrompt(personaSnapshot);
        restoreExtensionPrompts(snapshot);
    }
}

function runNativePromptExclusive<T>(task: () => Promise<T>): Promise<T> {
    const run = nativePromptQueue.then(task, task);
    nativePromptQueue = run.catch((): void => undefined);
    return run;
}

export async function buildTavernNativeChatPrompt(input: unknown = {}): Promise<TavernNativePromptResult> {
    const queuedAt = nowMs();
    const record = asRecord(input) as TavernNativePromptInput;
    const requestId = normalizeText(record.requestId || '');
    const controller = new AbortController();
    if (requestId) {
        nativePromptAbortControllers.set(requestId, controller);
    }
    try {
        return await runNativePromptExclusive(() => buildNativePromptNow(record, queuedAt, controller.signal));
    } finally {
        if (requestId && nativePromptAbortControllers.get(requestId) === controller) {
            nativePromptAbortControllers.delete(requestId);
        }
    }
}

export function cancelTavernNativeChatPrompt(requestId = ''): void {
    const key = normalizeText(requestId);
    if (!key) {return;}
    nativePromptAbortControllers.get(key)?.abort();
}
