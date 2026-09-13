import { countAssistantTurns } from '../assistant-turn-count.js';
import { selectPromptCharacters } from './character-source.js';
import { normalizePromptContext } from './normalize.js';
import type {
    PromptContextAdapter,
    PromptContextCapture,
    PromptContextCaptureOptions,
    PromptContextInput,
} from './types.js';

type UnknownRecord = Record<string, unknown>;

interface HostMessage {
    readonly name?: unknown;
    readonly is_user?: unknown;
    readonly is_system?: unknown;
    readonly mes?: unknown;
    readonly swipe_id?: unknown;
}

export interface PromptHostContext {
    readonly chatId?: unknown;
    readonly groupId?: unknown;
    readonly characterId?: unknown;
    readonly characters?: unknown;
    readonly groups?: unknown;
    readonly name1?: unknown;
    readonly name2?: unknown;
    readonly chat?: unknown;
    readonly maxContext?: unknown;
    readonly worldInfoIncludeNames?: unknown;
    readonly powerUserSettings?: unknown;
    readonly getCharacterCardFields?: () => unknown;
    readonly getWorldInfoPrompt?: (
        messages: string[],
        tokenBudget: number,
        dryRun: boolean,
        globalScanData?: UnknownRecord,
    ) => unknown | Promise<unknown>;
}

export interface HostPromptContextAdapterDependencies {
    readonly readContext: () => PromptHostContext;
    readonly readStoryEvents: (throughMessageIndex: number) => string | Promise<string>;
    readonly cleanMessageText?: (text: string) => string;
    readonly report?: (error: unknown) => void;
}

function isRecord(value: unknown): value is UnknownRecord {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function chatIdentity(context: PromptHostContext): string {
    const chatId = typeof context.chatId === 'string' ? context.chatId : '';
    if (!chatId) {return '';}
    const groupId = context.groupId === null || context.groupId === undefined ? '' : String(context.groupId);
    const characterId = context.characterId === null || context.characterId === undefined
        ? ''
        : String(context.characterId);
    return `${groupId ? 'group' : 'character'}:${groupId || characterId}:${chatId}`;
}

function ordinaryMessages(context: PromptHostContext, throughMessageIndex: number) {
    const chat = Array.isArray(context.chat) ? context.chat : [];
    return chat.slice(0, throughMessageIndex + 1).flatMap((value, index) => {
        if (!isRecord(value)) {return [];}
        const message = value as HostMessage;
        if (message.is_system === true) {return [];}
        const role = message.is_user === true ? 'user' as const : 'assistant' as const;
        return [{
            index,
            role,
            speakerName: message.name ?? (role === 'user' ? context.name1 : context.name2),
            text: message.mes,
            swipeId: message.swipe_id ?? null,
        }];
    });
}

function promptScanData(context: PromptHostContext, report: (error: unknown) => void): UnknownRecord {
    let fields: UnknownRecord = {};
    if (typeof context.getCharacterCardFields === 'function') {
        try {
            const value = context.getCharacterCardFields();
            if (isRecord(value)) {fields = value;}
        } catch (error) {
            report(error);
        }
    }
    const settings = isRecord(context.powerUserSettings) ? context.powerUserSettings : {};
    const text = (value: unknown): string => typeof value === 'string' ? value : '';
    return {
        personaDescription: text(fields.persona) || text(settings.persona_description),
        characterDescription: text(fields.description),
        characterPersonality: text(fields.personality),
        characterDepthPrompt: text(fields.charDepthPrompt),
        scenario: text(fields.scenario),
        creatorNotes: text(fields.creatorNotes),
        trigger: 'normal',
    };
}

export function createHostPromptContextAdapter({
    readContext,
    readStoryEvents,
    cleanMessageText,
    report = () => undefined,
}: HostPromptContextAdapterDependencies): PromptContextAdapter {
    function currentChatIdentity(): string {
        return chatIdentity(readContext());
    }

    async function capture(options: PromptContextCaptureOptions = {}): Promise<PromptContextCapture> {
        const context = readContext();
        const identity = chatIdentity(context);
        if (!identity) {throw new Error('prompt_context_chat_unavailable');}
        const chat = Array.isArray(context.chat) ? context.chat : [];
        const through = options.throughMessageIndex ?? chat.length - 1;
        if (!Number.isSafeInteger(through) || through < -1 || through >= chat.length) {
            throw new Error('prompt_context_boundary_invalid');
        }
        const recentBefore = options.recentBeforeIndex ?? through + 1;
        if (!Number.isSafeInteger(recentBefore) || recentBefore < 0 || recentBefore > through + 1) {
            throw new Error('prompt_context_recent_boundary_invalid');
        }
        const excluded = new Set(options.excludeMessageIndices ?? []);
        const messages = ordinaryMessages(context, through).filter(message => !excluded.has(message.index))
            .map(message => cleanMessageText ? { ...message, text: cleanMessageText(String(message.text ?? '')) } : message);
        const recentMessages = messages.filter(message => message.index < recentBefore);
        const baseInput: PromptContextInput = {
            player: {
                displayName: context.name1,
                persona: isRecord(context.powerUserSettings)
                    ? context.powerUserSettings.persona_description
                    : '',
            },
            characters: selectPromptCharacters(context),
            recentMessages,
            worldInfo: { before: '', after: '', depth: [] },
            storyEvents: '',
        };
        const [worldInfo, storyEvents] = await Promise.all([
            (async (): Promise<PromptContextInput['worldInfo']> => {
                if (options.includeWorldInfo === false || typeof context.getWorldInfoPrompt !== 'function') {
                    return { before: '', after: '', depth: [] };
                }
                const includeNames = context.worldInfoIncludeNames === true;
                const scanChat = [...options.worldInfoScanMessages ?? [], ...messages.map((message) => {
                    const text = String(message.text || '');
                    return includeNames ? `${message.speakerName}: ${text}` : text;
                }).reverse()];
                const globalScanData = promptScanData(context, report);
                const hostMaxContext = Number(context.maxContext);
                const worldInfoContext = Number.isFinite(hostMaxContext) && hostMaxContext > 0
                    ? Math.floor(hostMaxContext)
                    : 8_192;
                try {
                    const value = await context.getWorldInfoPrompt(scanChat, worldInfoContext, true, globalScanData);
                    const result = isRecord(value) ? value : {};
                    const depth = Array.isArray(result.worldInfoDepth)
                        ? result.worldInfoDepth.flatMap((entry) => {
                            if (!isRecord(entry) || !Array.isArray(entry.entries)) {return [];}
                            return entry.entries.filter(item => typeof item === 'string');
                        })
                        : [];
                    return { before: result.worldInfoBefore, after: result.worldInfoAfter, depth };
                } catch (error) {
                    report(error);
                    return { before: '', after: '', depth: [] };
                }
            })(),
            (async () => {
                if (through < 0) {return '';}
                try {return await readStoryEvents(through);}
                catch (error) {report(error); return '';}
            })(),
        ]);
        if (currentChatIdentity() !== identity) {throw new Error('prompt_context_chat_changed');}
        return {
            chatIdentity: identity,
            assistantCount: countAssistantTurns(chat, through + 1),
            contextSnapshot: normalizePromptContext({ ...baseInput, worldInfo, storyEvents }),
        };
    }

    return Object.freeze({ currentChatIdentity, capture });
}
