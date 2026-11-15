import { getContext } from '../../../../../../../extensions.js';
import { getRequestHeaders } from '../../../../../../../../script.js';
import { CHAT_KEY, CARD_EXTENSION } from '../definition/format.js';
import { clone, equal } from '../engine/data.js';
import { readVariables, writeVariables } from './variables.js';
import { reject } from '../engine/diagnostics.js';
import { createSaveQueue } from './persistence.js';
import { decodeBundle } from '../definition/card-files.js';
import { digest } from '../definition/digest.js';
import { isOpeningReceipt } from './history.js';
import { migrateHistoryV2, type HistoryV2 } from './history-format.js';
import type { History, HostAdapter, JsonObject, Receipt, Snapshot, Success, SwipeRecord } from '../types.js';
import type { CaptureContext } from '../../shared/context-capture.js';

interface Holder { extra?: Record<string, unknown> }
export interface ChatMessage extends Holder {
    name?: string; send_date?: string;
    swipe_id?: number; swipe_info?: Holder[]; swipes?: string[]; mes?: string; is_user?: boolean; is_system?: boolean;
}
export interface Context extends CaptureContext {
    chat: ChatMessage[]; chatMetadata: Record<string, unknown>; chatId: string; characterId: number; groupId?: string | null;
    characters: { name: string; chat: string; avatar: string; data?: { extensions?: Record<string, unknown> } }[]; saveChat(): Promise<void>;
}
interface HostSnapshot extends Snapshot {
    chat: ChatMessage[]; messages: ChatMessage[]; metadata: Record<string, unknown>; chatId: string; characterId: number;
    message?: ChatMessage; holder?: Holder; text?: string; revision?: number; rules: unknown;
    destination: { ch_name: string; file_name: string; avatar_url: string };
}
export const state3Context = () => getContext() as unknown as Context;
export const inGroup = (ctx: Context) => ctx.groupId !== null && ctx.groupId !== undefined;
function selected(message: ChatMessage): Holder | undefined {
    const swipe = message.swipe_id ?? 0;
    return message.swipe_info?.[swipe] ?? (swipe === 0 && (message.swipes?.length || 0) <= 1 ? message : undefined);
}
function record(message: ChatMessage): SwipeRecord {
    return (selected(message)?.extra?.[CHAT_KEY] as SwipeRecord | undefined) ?? { entries: [] };
}
const holders = (message: ChatMessage) => [message, ...(message.swipe_info || [])];
export function selectedRecords(chat: ChatMessage[]): SwipeRecord[] { return chat.map(message => clone(record(message))); }
export function latestUserIndex(chat: ChatMessage[], end = chat.length): number {
    for (let index = end - 1; index >= 0; index--) {if (chat[index].is_user && !chat[index].is_system) {return index;}}
    return -1;
}
function latestReply(ctx: Context): number {
    for (let index = ctx.chat.length - 1; index >= 0; index--) {if (!ctx.chat[index].is_user && !ctx.chat[index].is_system) {return index;}}
    return ctx.chat.length - 1;
}

/** The topology cache only lives while this chat is open. Prose and visibility never enter it. */
export function createHostAdapter({ committed }: { committed?: (result: Success) => void } = {}) {
    const enqueueSave = createSaveQueue();
    let retry: (() => Promise<void>) | undefined;
    let observedChat: ChatMessage[] | undefined;
    let observed: { message: ChatMessage; entries: Receipt[] }[] = [];
    let receiptChat: ChatMessage[] | undefined;
    let receiptMetadata: Context['chatMetadata'] | undefined;
    const owners = new Map<string, ChatMessage>();
    let knownMessages = new WeakSet<ChatMessage>();
    function reconcileReceipts() {
        const { chat, chatMetadata } = state3Context(), opening = receiptChat !== chat || receiptMetadata !== chatMetadata;
        // The host reuses its chat array on reload; fresh metadata marks the new load.
        if (opening) {
            const history = chatMetadata[CHAT_KEY] as History | HistoryV2 | undefined;
            if (history?.format === 2) {
                chatMetadata[CHAT_KEY] = migrateHistoryV2(history, Boolean(chat[0] && holders(chat[0]).some(holder =>
                    (holder.extra?.[CHAT_KEY] as SwipeRecord | undefined)?.entries.some(isOpeningReceipt))));
            }
            receiptChat = chat; receiptMetadata = chatMetadata; owners.clear(); knownMessages = new WeakSet();
        }
        for (const message of chat) {
            const added = !opening && !knownMessages.has(message);
            for (const holder of holders(message)) {
                const stored = holder.extra?.[CHAT_KEY] as SwipeRecord | undefined;
                if (!stored) {continue;}
                if (added) {
                    stored.entries = stored.entries.filter(entry => !owners.has(entry.id) || owners.get(entry.id) === message);
                    if (!stored.entries.length) {delete holder.extra![CHAT_KEY];}
                }
                for (const entry of stored.entries) {if (!owners.has(entry.id)) {owners.set(entry.id, message);} }
            }
            knownMessages.add(message);
        }
    }
    const remember = () => {
        reconcileReceipts();
        const ctx = state3Context();
        observedChat = ctx.chat;
        observed = ctx.chat.map(message => ({ message, entries: clone(record(message).entries) }));
    };
    const adapter: HostAdapter<HostSnapshot> & {
        remember(): void;
        rememberOrder(): boolean;
        selectionChange(kind: 'delete' | 'swipe', index?: number): { previous: Receipt[]; next: Receipt[]; historical: boolean };
        retrySave(): Promise<{ ok: true; saved: true }>;
        submissionBasis(index: number): string;
    } = {
        submissionBasis(index) {
            const ctx = state3Context(), history = ctx.chatMetadata[CHAT_KEY] as History | undefined;
            // A pending local retry needs identity, not another copy of chat receipts.
            return digest({ chat: ctx.chatId, target: { floor: index, swipeId: ctx.chat[index]?.swipe_id ?? 0 }, text: ctx.chat[index]?.mes,
                revision: history?.revision, state: readVariables((ctx.chatMetadata.variables || {}) as Record<string, unknown>, history?.roots),
                rules: ctx.characters?.[ctx.characterId]?.data?.extensions?.[CARD_EXTENSION] });
        },
        bundle() {
            const ctx = state3Context();
            const rules = ctx.characters?.[ctx.characterId]?.data?.extensions?.[CARD_EXTENSION];
            if (!rules) {reject('definition-missing');}
            return decodeBundle(rules);
        },
        capture(index) {
            reconcileReceipts();
            const ctx = state3Context();
            if (!ctx.chatId || !Array.isArray(ctx.chat)) {reject('chat-missing');}
            if (inGroup(ctx)) {reject('character-missing');}
            const character = ctx.characters?.[ctx.characterId];
            if (!character) {reject('character-missing');}
            index ??= latestReply(ctx);
            const history = ctx.chatMetadata[CHAT_KEY] as History | undefined, message = ctx.chat[index];
            if (history && history.format !== 3) {reject('history-format');}
            return { chat: ctx.chat, messages: [...ctx.chat], metadata: ctx.chatMetadata, chatId: ctx.chatId, characterId: ctx.characterId,
                history: clone(history), state: readVariables((ctx.chatMetadata.variables || {}) as Record<string, unknown>, history?.roots),
                records: selectedRecords(ctx.chat), index, message, text: message?.mes, holder: message && selected(message),
                opening: index === 0 && ctx.chat.length === 1 && !message?.is_user && !message?.is_system && Boolean(message && selected(message)),
                lastReceiptIndex: ctx.chat.reduce((last, item, floor) => holders(item).some(holder =>
                    Boolean((holder.extra?.[CHAT_KEY] as SwipeRecord | undefined)?.entries.some(entry => !isOpeningReceipt(entry)))) ? floor : last, -1),
                rules: clone(character.data?.extensions?.[CARD_EXTENSION]), revision: history?.revision, target: { floor: index, swipeId: message?.swipe_id ?? 0 },
                destination: { ch_name: character.name, file_name: character.chat, avatar_url: character.avatar } };
        },
        isCurrent(snapshot) {
            const ctx = state3Context(), history = ctx.chatMetadata[CHAT_KEY] as History | undefined;
            return ctx.chat === snapshot.chat && ctx.chatMetadata === snapshot.metadata && ctx.chatId === snapshot.chatId
                && ctx.characterId === snapshot.characterId && equal(snapshot.rules, ctx.characters?.[ctx.characterId]?.data?.extensions?.[CARD_EXTENSION]) && !inGroup(ctx) && history?.revision === snapshot.revision
                && equal(snapshot.state, readVariables((ctx.chatMetadata.variables || {}) as Record<string, unknown>, snapshot.history?.roots))
                && (!snapshot.opening || (ctx.chat.length === snapshot.messages.length && !ctx.chat[0]?.is_user && !ctx.chat[0]?.is_system
                    && ctx.chat.every((message, index) => message === snapshot.messages[index])))
                && (!snapshot.message || (ctx.chat.includes(snapshot.message) && snapshot.message.mes === snapshot.text && selected(snapshot.message) === snapshot.holder
                    && (snapshot.message.swipe_id ?? 0) === snapshot.target.swipeId));
        },
        assertMutable(snapshot) {
            const ctx = state3Context(), message = ctx.chat[snapshot.index];
            if (message !== snapshot.message) {reject('stale-target');}
            const latest = message?.is_user ? latestUserIndex(ctx.chat) : latestReply(ctx);
            if (!message || message.is_system || snapshot.index !== latest) {reject('target-missing');}
        },
        publish(snapshot, { state, history, records, invalidateFrom }) {
            if (!adapter.isCurrent(snapshot)) {reject('stale-target');}
            // A rewind invalidates every alternative in its suffix too. Switching
            // an old AI swipe must not resurrect effects based on the discarded USER.
            if (invalidateFrom !== undefined) {
                snapshot.messages.slice(invalidateFrom).forEach((message, offset) => {
                    holders(message).forEach(holder => {
                        if (!holder.extra) {return;}
                        const stored = holder.extra[CHAT_KEY] as SwipeRecord | undefined;
                        const initial = invalidateFrom + offset === 0 ? stored?.entries.filter(isOpeningReceipt) : undefined;
                        if (initial?.length) {holder.extra[CHAT_KEY] = { entries: clone(initial) };}
                        else {delete holder.extra[CHAT_KEY];}
                    });
                });
            }
            retry = undefined;
            const roots = history.roots;
            snapshot.metadata.variables ??= {};
            writeVariables(snapshot.metadata.variables as Record<string, unknown>, state as JsonObject, roots);
            snapshot.metadata[CHAT_KEY] = clone(history);
            records.forEach((value, index) => {
                const message = snapshot.messages[index];
                if (!message) {return;}
                for (const holder of new Set([message, selected(message)].filter((item): item is Holder => Boolean(item)))) {
                    holder.extra ||= {};
                    if (value.entries.length) {holder.extra[CHAT_KEY] = clone(value);}
                    else {delete holder.extra[CHAT_KEY];}
                }
            });
            remember();
            const save = async () => {
                const ctx = state3Context();
                if (ctx.chat !== snapshot.chat || ctx.chatMetadata !== snapshot.metadata
                    || (ctx.chatMetadata[CHAT_KEY] as History | undefined)?.revision !== history.revision) {reject('stale-target');}
                // Join the host's save queue so its older writes finish first.
                await ctx.saveChat();
                const response = await fetch('/api/chats/get', { method: 'POST', headers: getRequestHeaders(),
                    body: JSON.stringify(snapshot.destination), cache: 'no-store' });
                if (!response.ok) {reject('save-unconfirmed', { status: response.status });}
                const saved: unknown = await response.json();
                const metadata = Array.isArray(saved) ? saved[0]?.chat_metadata?.[CHAT_KEY] : undefined;
                // Native chat saves may already have persisted a later publication.
                if (typeof metadata?.revision !== 'number' || metadata.revision < history.revision) {reject('save-unconfirmed');}
                if (retry === requestSave) {retry = undefined;}
            };
            const requestSave = () => { retry = requestSave; return enqueueSave(snapshot.metadata, save); };
            return requestSave;
        },
        committed,
        remember,
        rememberOrder() {
            const ctx = state3Context();
            reconcileReceipts();
            if (ctx.chat !== observedChat || ctx.chat.length < observed.length) {return false;}
            if (ctx.chat.length === observed.length && ctx.chat.every((message, index) => observed[index].message === message)) {return false;}
            const prior = new Map(observed.map(item => [item.message, item]));
            if (observed.some(item => !ctx.chat.includes(item.message))) {return false;}
            // UI movement only updates this transient order; no variable reads,
            // writes, settlement, or persistence are caused by editing the chat.
            observed = ctx.chat.map(message => prior.get(message) || { message, entries: clone(record(message).entries) });
            return true;
        },
        selectionChange(kind, index) {
            const ctx = state3Context();
            reconcileReceipts();
            let previous: Receipt[] = [], next: Receipt[] = [];
            let historical = false;
            if (ctx.chat === observedChat) {
                if (kind === 'delete') {
                    // Only a strict suffix deletion restores state. Middle deletions and reordering do nothing.
                    const prefix = ctx.chat.every((message, position) => observed[position]?.message === message);
                    if (prefix && ctx.chat.length < observed.length) {previous = observed.slice(ctx.chat.length).flatMap(item => item.entries);}
                } else if (index !== undefined && ctx.chat[index]) {
                    const message = ctx.chat[index], old = observed.find(item => item.message === message);
                    const current = record(message).entries;
                    if (old && old.entries.map(item => item.id).join() !== current.map(item => item.id).join()) {
                        const later = ctx.chat.slice(index + 1);
                        previous = [...old.entries, ...later.flatMap(item => observed.find(prior => prior.message === item)?.entries || [])];
                        next = [...clone(current), ...later.flatMap(item => clone(record(item).entries))];
                        historical = later.some(item => record(item).entries.length > 0);
                    }
                }
            }
            remember();
            return { previous, next, historical };
        },
        async retrySave() { if (!retry) {reject('nothing-to-save');} await retry(); return { ok: true, saved: true }; },
    };
    remember();
    return adapter;
}
