import { parseChatImageTags } from './chat-message-image-markup.js';
import { generatePreparedChatImages, prepareNativeChatImages } from './prepared-chat-images.js';
import { DRAW_SLOT_COPY } from './image-record.js';
import { subscribeChatImagePlacement, commitChatImagePlacement, rebaseImageText, rebaseImageOffset } from './chat-image-placement.js';

const MAIN_TYPES = new Set(['', 'normal', 'regenerate', 'swipe', 'continue']);

// One observation belongs to one actual host call. Rendering cannot create it.
// Claims live only on the message object; durable ownership is the existing
// preview input and (for backend transport) the existing image job journal.
export function createChatImageSession({ context, provider, changed, report }) {
    let observation = null;
    let targetRevision = 0;
    const claims = new WeakMap();
    let unsubscribe;
    const sameChat = (ctx, own) => ctx.chat === own.chat && String(ctx.chatId) === own.chatId;
    const validTarget = (ctx, own, index) => {
        const message = ctx.chat?.[index];
        if (!message || message.is_user || message.is_system || index !== ctx.chat.length - 1
            || !sameChat(ctx, own) || own.signal?.aborted) return false;
        if (own.type === 'continue' || own.type === 'swipe') {
            return message === own.last && (message.swipe_id ?? 0) === own.swipeIndex;
        }
        return !own.messages.has(message);
    };

    function restore(own) {
        const message = own?.last;
        if (!message || own.type !== 'continue' || !sameChat(context(), own)
            || !context().chat.includes(message) || (message.swipe_id ?? 0) !== own.swipeIndex) return;
        let prefix = own.initialBody;
        for (const change of [...own.placements]) {
            const next = rebaseImageText(prefix, change);
            if (next === null || next === prefix) continue;
            if (message.mes.startsWith(prefix)) {
                commitChatImagePlacement({ message, swipeIndex: own.swipeIndex, before: message.mes,
                    edits: change.edits.filter(edit => edit.end <= prefix.length), owner: change.owner, restored: true });
            } else if (!message.mes.startsWith(next)) continue;
            prefix = next;
        }
        return prefix;
    }

    async function claim(ctx, messageId, candidates, nativeMessage) {
        const message = ctx.chat[messageId];
        const sourceText = message.mes, swipeIndex = message.swipe_id ?? 0;
        let branches = claims.get(message);
        if (!branches) { branches = new Map(); claims.set(message, branches); }
        const branch = branches.get(swipeIndex) || [];
        branches.set(swipeIndex, branch);
        candidates = candidates.filter(tag => !branch.some(own => !own.invalid && own.phase === 'preparing'
            && sourceText.startsWith(own.sourceText) && own.candidates.some(item => item.start === tag.start)));
        if (!candidates.length) return;
        const revision = targetRevision;
        const own = { sourceText, candidates: candidates.map(tag => ({ ...tag, mode: 'replace' })),
            phase: 'preparing', error: null, prepared: null, edited: false,
            get invalid() { return this.edited || revision !== targetRevision; } };
        branch.push(own);
        changed();
        const input = { ctx, message, messageId, sourceText, swipeIndex, placementSource: own,
            tasks: own.candidates.map(candidate => ({ scene: candidate.tags, chars: [], characterPrompts: [],
                placement: candidate })), onPlacement: changed };
        try {
            const selectedProvider = provider();
            if (!selectedProvider) throw new Error(DRAW_SLOT_COPY.unavailable);
            const operation = nativeMessage ? prepareNativeChatImages(selectedProvider, input)
                : { prepared: generatePreparedChatImages(selectedProvider, input) };
            own.prepared = operation.prepared;
            // Completion belongs to the floor task; never extend MESSAGE_RECEIVED
            // across provider I/O. Errors still have a visible/reportable owner.
            operation.completed?.catch(error => {
                if (own.phase !== 'preparing') report(error);
            });
            await own.prepared;
            own.phase = 'placed';
        } catch (error) {
            own.phase = 'failed'; own.error = error;
            report(error);
        } finally { changed(); }
    }

    return {
        connect() {
            unsubscribe ??= subscribeChatImagePlacement(change => {
                if (change.restoreMessage) {
                    if (observation?.last === change.restoreMessage) restore(observation);
                    return;
                }
                if (change.removedSlotId) {
                    for (const placement of observation?.placements || []) {
                        for (const edit of placement.edits) if (edit.slotId === change.removedSlotId) {
                            edit.discarded = true; edit.content = '';
                        }
                    }
                    return;
                }
                const branch = claims.get(change.message)?.get(change.swipeIndex) || [];
                for (const own of branch) {
                    if (own === change.owner || own.phase === 'placed') continue;
                    const rebased = rebaseImageText(own.sourceText, change);
                    if (rebased === null) continue;
                    own.sourceText = rebased;
                    for (const tag of own.candidates) {
                        tag.start = rebaseImageOffset(tag.start, change.edits);
                        tag.end = rebaseImageOffset(tag.end, change.edits);
                    }
                }
                if (!change.restored && observation?.last === change.message && observation.swipeIndex === change.swipeIndex) {
                    if (change.rollbackOf) observation.placements = observation.placements.filter(item => item !== change.rollbackOf);
                    else observation.placements.push(change);
                }
            });
        },
        disconnect() { unsubscribe?.(); unsubscribe = null; this.targetChanged(); },
        edited(index) {
            const message = context().chat?.[index];
            for (const branch of claims.get(message)?.values() || []) {
                for (const own of branch) own.edited = true;
            }
            this.stop();
        },
        start(value, dryRun) {
            if (!dryRun && MAIN_TYPES.has(String(value || ''))) this.stop();
        },
        observe(value, options = {}, dryRun = false) {
            const type = String(value || '');
            const ctx = context();
            if (dryRun || !MAIN_TYPES.has(type) || !ctx.chatId || !ctx.chat) return;
            const last = ctx.chat.at(-1);
            observation = { type, chat: ctx.chat, chatId: String(ctx.chatId), last,
                messages: new Set(ctx.chat), swipeIndex: last?.swipe_id ?? 0,
                initialBody: type === 'continue' ? last?.mes ?? '' : '',
                placements: [],
                signal: options.signal, previousStream: ctx.streamingProcessor, receiving: false };
            changed();
        },
        requesting(dryRun) { if (observation && !dryRun) observation.receiving = true; },
        stop() { observation = null; changed(); },
        targetChanged() { targetRevision++; this.stop(); },
        deleted() {
            // Regenerate removes its old reply between AFTER_COMMANDS and data.
            if (observation?.type !== 'regenerate' || observation.receiving) this.stop();
        },
        async received(index, type) {
            if (!MAIN_TYPES.has(String(type || '')) && type !== 'appendFinal') return;
            const own = observation;
            if (!own?.receiving) return;
            const ctx = context();
            if (!validTarget(ctx, own, index)) return;
            const stream = ctx.streamingProcessor;
            if (stream && stream !== own.previousStream && stream.isStopped) { this.stop(); return; }
            const message = ctx.chat[index];
            const initialBody = restore(own) ?? own.initialBody;
            const source = message.mes;
            // Consume synchronously, before storage or a duplicate event.
            observation = null; changed();
            if (!source.startsWith(initialBody)) return;
            // DICE's makeFirst listener has already applied its current body.
            const candidates = parseChatImageTags(source).filter(tag => tag.end > initialBody.length);
            if (candidates.length) await claim(ctx, index, candidates, true);
        },
        view(message, index, candidate) {
            const own = claims.get(message)?.get(message.swipe_id ?? 0)?.findLast(item => !item.invalid
                && message.mes.startsWith(item.sourceText) && item.candidates.some(tag => tag.start === candidate.start));
            if (own) {
                if (own.phase === 'preparing') return { phase: 'preparing', label: DRAW_SLOT_COPY.preparing };
                if (own.phase === 'failed') return { phase: 'failed', label: own.error.message, action: DRAW_SLOT_COPY.retry };
            }
            if (observation && validTarget(context(), observation, index)
                && candidate.end > observation.initialBody.length) return { phase: 'streaming', label: DRAW_SLOT_COPY.waiting };
            return { phase: 'unclaimed', label: DRAW_SLOT_COPY.unclaimed, action: DRAW_SLOT_COPY.generate };
        },
        async retry({ ctx, message, messageId, source, swipeIndex, candidate }) {
            const live = context();
            if (live.chat !== ctx.chat || String(live.chatId) !== String(ctx.chatId)
                || live.chat[messageId] !== message || message.mes !== source
                || (message.swipe_id ?? 0) !== swipeIndex) {
                report(new Error(DRAW_SLOT_COPY.sourceChanged)); return;
            }
            await claim(live, messageId, [candidate], false);
        },
    };
}
