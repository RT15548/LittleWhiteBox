import { getContext } from '../../../../../../extensions.js';
import { parseChatImageTags } from './chat-message-image-markup.js';
import { readGeneratedImageForAdoption } from './generated-image-runtime.js';
import { storePreview, deletePreview, setSlotSelection, clearSlotSelection } from './gallery-cache.js';
import { createImageIdentifiers, placePreparedImageSlots } from './prepared-chat-images.js';
import { getImageJobDeliveryTextAt } from './image-job-delivery-target.js';
import { setActiveMessageText } from './scene-placement.js';
import { saveChatAndConfirm, withConfirmableChatMutation, CONFIRMABLE_CHAT_PHASE_TIMEOUT_MS } from './confirmable-chat-save.js';
import { syncRenderedMessageFromState, isAnyMessageBeingEdited } from './draw-common.js';
import { PreviewStatus, DRAW_SLOT_COPY, DRAW_SLOT_ERRORS } from './image-record.js';

export const CHAT_IMAGE_TAG_FORMAT_KEY = 'xbDrawTagFormat';
export const CHAT_IMAGE_TAG_FORMAT_VERSION = 1;
const migrations = new WeakMap();
const freshChats = new WeakSet();
let prepareChatBranches = async () => {};

// The drawing domain owns migration. A host with lazy chat payloads supplies
// the one preparation step required before the complete branch scan.
export function configureChatImageTagMigration({ prepareBranches } = {}) {
    prepareChatBranches = prepareBranches || (async () => {});
}

async function confirmFormat(ctx, persisted) {
    const header = persisted[0]?.chat_metadata;
    if (header) return header[CHAT_IMAGE_TAG_FORMAT_KEY] === CHAT_IMAGE_TAG_FORMAT_VERSION;
    if (!ctx.groupId) return false;
    // SillyTavern 1.14 group chats store metadata in the group JSON, not in the
    // chat header. Only this upgrade boundary needs the released group format;
    // remove it when support for pre-header SillyTavern group chats ends.
    if (getContext().chatMetadata !== ctx.chatMetadata) throw new Error(DRAW_SLOT_COPY.sourceChanged);
    const controller = new AbortController();
    let timer;
    const timeout = new Promise((_, reject) => {
        timer = setTimeout(() => {
            controller.abort();
            reject(new Error(DRAW_SLOT_COPY.formatReadFailed));
        }, CONFIRMABLE_CHAT_PHASE_TIMEOUT_MS);
    });
    const confirm = async () => {
        await ctx.saveMetadata();
        const response = await fetch('/api/groups/all', { method: 'POST', headers: ctx.getRequestHeaders(),
            body: JSON.stringify({}), cache: 'no-cache', signal: controller.signal });
        if (!response.ok) throw new Error(DRAW_SLOT_COPY.formatReadFailed);
        const groups = await response.json();
        const group = groups.find(group => String(group.id) === String(ctx.groupId));
        const metadata = String(group?.chat_id) === String(ctx.chatId)
            ? group.chat_metadata : group?.past_metadata?.[ctx.chatId];
        return metadata?.[CHAT_IMAGE_TAG_FORMAT_KEY] === CHAT_IMAGE_TAG_FORMAT_VERSION;
    };
    try { return await Promise.race([confirm(), timeout]); }
    finally { clearTimeout(timer); }
}

export function markFreshImageTagChat(ctx) { freshChats.add(ctx.chatMetadata); }

export function listChatImageBranches(chat) {
    return chat.flatMap((message, messageId) => {
        const active = message.swipe_id ?? 0;
        const branches = [{ message, messageId, swipeIndex: active, source: String(message.mes || '') }];
        message.swipes?.forEach((source, swipeIndex) => {
            if (swipeIndex !== active) branches.push({ message, messageId, swipeIndex, source });
        });
        return branches;
    });
}

export function ensureChatImageTagFormat(ctx) {
    const identity = ctx.chatMetadata;
    const existing = migrations.get(identity);
    if (existing) return existing;
    if (ctx.chatMetadata?.[CHAT_IMAGE_TAG_FORMAT_KEY] === CHAT_IMAGE_TAG_FORMAT_VERSION) return Promise.resolve();
    const operation = migrate(ctx).catch(error => {
        if (!error.uncertain) migrations.delete(identity);
        throw error;
    });
    migrations.set(identity, operation);
    return operation;
}

async function migrate(ctx) {
    const chatId = String(ctx.chatId);
    const isCurrentChat = () => String(getContext().chatId) === chatId
        && getContext().chat === ctx.chat && getContext().chatMetadata === ctx.chatMetadata;
    const loaded = new Map(ctx.chat.map(message => [message, { source: message.mes, swipe: message.swipe_id }]));
    if (!freshChats.has(ctx.chatMetadata)) await prepareChatBranches(ctx);
    if (!isCurrentChat()) throw new Error(DRAW_SLOT_COPY.sourceChanged);
    const branches = listChatImageBranches(ctx.chat).map(branch => ({ ...branch, tags: parseChatImageTags(branch.source) }))
        .filter(branch => branch.tags.length && loaded.has(branch.message)
            && loaded.get(branch.message).source === branch.message.mes
            && loaded.get(branch.message).swipe === branch.message.swipe_id);
    const prepared = [];
    // Read all candidates before changing data. Failed reads do not mean lost images.
    for (const branch of branches) {
        if (freshChats.has(ctx.chatMetadata)) break;
        const images = [];
        for (const tag of branch.tags) {
            const cached = await readGeneratedImageForAdoption({ prompt: tag.tags, cacheNamespace: 'fourth-wall' });
            images.push({ ...createImageIdentifiers(), ...cached, tags: tag.tags });
        }
        prepared.push({ ...branch, images, next: placePreparedImageSlots(branch.source,
            branch.tags.map(tag => ({ placement: { ...tag, mode: 'replace' } })), images) });
    }
    const staged = [];
    let attemptedSave = false;
    let changes = [];
    const previousVersion = ctx.chatMetadata[CHAT_IMAGE_TAG_FORMAT_KEY];
    try {
        await withConfirmableChatMutation(ctx, async () => {
            if (!isCurrentChat() || isAnyMessageBeingEdited()) throw new Error(DRAW_SLOT_COPY.sourceChanged);
            changes = freshChats.has(ctx.chatMetadata) ? [] : prepared;
            for (const branch of changes) {
                if (ctx.chat[branch.messageId] !== branch.message
                    || getImageJobDeliveryTextAt(ctx.chat, branch) !== branch.source) throw new Error(DRAW_SLOT_COPY.sourceChanged);
                for (const image of branch.images) {
                    await storePreview({ ...image, messageId: branch.messageId, chatId,
                        characterName: branch.message.name || '', positive: image.promptData.positive || image.tags,
                        characterPrompts: image.promptData.characterPrompts || [],
                        negativePrompt: image.promptData.negativePrompt || '',
                        status: image.base64 ? PreviewStatus.SUCCESS : PreviewStatus.FAILED,
                        errorType: image.base64 ? null : DRAW_SLOT_ERRORS.legacy.label,
                        errorMessage: image.base64 ? null : DRAW_SLOT_ERRORS.legacy.desc });
                    staged.push(image);
                    await setSlotSelection(image.slotId, image.imgId);
                }
            }
            if (!isCurrentChat() || isAnyMessageBeingEdited()
                || changes.some(branch => ctx.chat[branch.messageId] !== branch.message
                    || getImageJobDeliveryTextAt(ctx.chat, branch) !== branch.source)) throw new Error(DRAW_SLOT_COPY.sourceChanged);
            for (const branch of changes) {
                if ((branch.message.swipe_id ?? 0) === branch.swipeIndex) setActiveMessageText(branch.message, branch.next);
                else branch.message.swipes[branch.swipeIndex] = branch.next;
            }
            ctx.chatMetadata[CHAT_IMAGE_TAG_FORMAT_KEY] = CHAT_IMAGE_TAG_FORMAT_VERSION;
            attemptedSave = true;
            await saveChatAndConfirm({ ctx, verify: persisted =>
                changes.every(branch => getImageJobDeliveryTextAt(persisted, branch) === branch.next)
                && confirmFormat(ctx, persisted) });
            for (const messageId of new Set(changes.map(branch => branch.messageId))) {
                try {
                    await syncRenderedMessageFromState(messageId, { chatId, expectedMessage: ctx.chat[messageId] });
                } catch (error) { console.error(DRAW_SLOT_COPY.renderFailed, error); }
            }
        });
    } catch (error) {
        if (!attemptedSave || error.saveAttempted === false) {
            for (const branch of changes) {
                if (getImageJobDeliveryTextAt(ctx.chat, branch) !== branch.next) continue;
                if ((branch.message.swipe_id ?? 0) === branch.swipeIndex) setActiveMessageText(branch.message, branch.source);
                else branch.message.swipes[branch.swipeIndex] = branch.source;
            }
            if (previousVersion === undefined) delete ctx.chatMetadata[CHAT_IMAGE_TAG_FORMAT_KEY];
            else ctx.chatMetadata[CHAT_IMAGE_TAG_FORMAT_KEY] = previousVersion;
            for (const image of staged) {
                await clearSlotSelection(image.slotId);
                await deletePreview(image.imgId);
            }
        }
        throw error;
    }
}
