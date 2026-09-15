import { extension_settings, getContext } from '../../../../../../../../extensions.js';
import { getRequestHeaders, isChatSaving, isGenerating } from '../../../../../../../../../script.js';
import { getScriptsByType, saveScriptsByType, SCRIPT_TYPES } from '../../../../../../../../extensions/regex/engine.js';
import { saveSillyTavernChat } from '../../../host/sillytavern-chat-save.js';
import { repairDiceDisplayRules } from './display-rule.js';
import { showDiceDisplayRule } from './managed-rule-display.js';
import { isDiceTargetCurrent, type DiceChat, type DiceHostMessage, type DiceTarget } from './message-records.js';

export interface DiceHostContext {
    chat: DiceHostMessage[]; chatId: string; groupId?: string; characterId?: number;
    name2: string; characters: Record<string, { avatar: string; name: string }>;
    streamingProcessor?: { isStopped: boolean; onStopStreaming(): void } | null;
    generate(type: string, options?: Record<string, unknown>): Promise<unknown>;
}
export const diceHostContext = () => getContext() as unknown as DiceHostContext;

export function isDiceMessageBeingEdited(index: number): boolean {
    return !!document.querySelector(`#chat .mes[mesid="${index}"] .edit_textarea`);
}

export function captureDiceChat(): DiceChat | null {
    const context = diceHostContext();
    if (!context.chatId) { return null; }
    const groupId = context.groupId === undefined || context.groupId === null ? undefined : String(context.groupId);
    // The wrapper clears characterId when it ends. Its last message retains the host's avatar identity.
    const characterId = context.characterId ?? (groupId ? Object.keys(context.characters).find(id =>
        context.characters[id].avatar === context.chat.at(-1)?.original_avatar) : undefined);
    const character = context.characters[String(characterId)];
    if (!groupId && !character?.avatar) { return null; }
    return { key: `${groupId ? 'group' : 'character'}:${groupId || character.avatar}:${context.chatId}`,
        chat: context.chat, chatId: context.chatId, groupId, characterId: Number(characterId),
        characterName: character?.name ?? context.name2, avatar: character?.avatar ?? '' };
}

export async function ensureDiceDisplayRule(): Promise<void> {
    if ((extension_settings.disabledExtensions as string[]).includes('regex')) { throw new Error('请先启用酒馆的正则扩展，再开启行动检定。'); }
    const repaired = repairDiceDisplayRules(getScriptsByType(SCRIPT_TYPES.GLOBAL));
    // Native GLOBAL setter schedules its own settings save; it is not a disk acknowledgement.
    if (repaired) { await saveScriptsByType(repaired as ReturnType<typeof getScriptsByType>, SCRIPT_TYPES.GLOBAL); }
    showDiceDisplayRule(document);
}

export async function readDiceChat(source: DiceChat): Promise<unknown[]> {
    const body = source.groupId ? { id: source.chatId }
        : { ch_name: source.characterName, file_name: source.chatId, avatar_url: source.avatar };
    const controller = new AbortController();
    const timer = globalThis.setTimeout(() => controller.abort(), 15_000);
    try {
        const response = await fetch(source.groupId ? '/api/chats/group/get' : '/api/chats/get', {
            method: 'POST', headers: getRequestHeaders(), cache: 'no-store', body: JSON.stringify(body), signal: controller.signal,
        });
        if (!response.ok) { throw new Error(`读取聊天失败（${response.status}）`); }
        const data: unknown = await response.json();
        if (!Array.isArray(data) || !data[0] || !Object.hasOwn(data[0], 'chat_metadata')) { throw new Error('聊天读取格式无效。'); }
        return data.slice(1);
    } finally { globalThis.clearTimeout(timer); }
}

export const diceSavePort = { capture: captureDiceChat, save: saveSillyTavernChat, read: readDiceChat };

export async function waitForDiceHost(target: DiceTarget, signal: AbortSignal, inGroup: boolean,
    generationPending: () => boolean = isGenerating): Promise<void> {
    const deadline = Date.now() + 20_000;
    while (true) {
        if (signal.aborted || !isDiceTargetCurrent(captureDiceChat(), target)) { throw new Error('聊天或回复已变化。'); }
        if (isDiceMessageBeingEdited(target.index)) { throw new Error('请先结束消息编辑。'); }
        const stream = diceHostContext().streamingProcessor;
        // ST 1.18 retains a stopped processor after stream errors. A normally finished stream,
        // however, still owns finalization/saving until the host releases its processor.
        if ((!stream || stream.isStopped) && !isChatSaving && (inGroup || !generationPending())) { return; }
        if (Date.now() >= deadline) { throw new Error('酒馆仍在生成或保存，请结束后再试。'); }
        await new Promise<void>((resolve, reject) => {
            const cancel = () => { globalThis.clearTimeout(timer); reject(new Error('已停止')); };
            const timer = globalThis.setTimeout(() => { signal.removeEventListener('abort', cancel); resolve(); }, 40);
            signal.addEventListener('abort', cancel, { once: true });
        });
    }
}
