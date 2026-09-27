import { getContext } from '../../../../../../extensions.js';
import { xbLog } from '../../../core/debug-core.js';
import { createModuleEvents, event_types } from '../../../core/event-manager.js';
import { parseChatImageTags, findRenderedChatImageTags } from './chat-message-image-markup.js';
import { ensureChatImageTagFormat, markFreshImageTagChat } from './chat-image-tag-migration.js';
import { createChatImageSession } from './chat-image-session.js';
import { buildPendingImageHtml, ensureDrawImageStyles, isMessageBeingEdited, renderPreviewsForMessage } from './draw-common.js';
import { DRAW_SLOT_COPY } from './image-record.js';

const events = createModuleEvents('chatMessageImages');
const leases = new Map();
let initialized = false;
let queued = false;
let observer;

function available() { return initialized && window.xiaobaixDraw?.getStatus?.().ready === true; }
function enabled() { return initialized && window.xiaobaixDraw?.getStatus?.().enabled === true; }
function report(error) {
    xbLog.error('draw', DRAW_SLOT_COPY.tagAdoptionFailed, error);
    globalThis.toastr?.error(error.message, DRAW_SLOT_COPY.tagAdoptionFailed);
}
const session = createChatImageSession({ context: getContext,
    provider: () => available() ? window.xiaobaixDraw.getProvider() : null,
    changed: requestRefresh, report });

function releaseProvisional(lease) {
    for (const [node, candidate] of lease.nodes) {
        if (node.parentNode) node.replaceWith(node.ownerDocument.createTextNode(candidate.marker));
    }
    lease.nodes.clear();
}

function requestRefresh() {
    if (!initialized || queued) return;
    queued = true;
    queueMicrotask(() => {
        queued = false;
        if (!initialized) return;
        try { processAllMessages(); } catch (error) { report(error); }
    });
}

function enhance(lease) {
    const ctx = getContext(), message = ctx.chat?.[lease.messageId];
    if (!message || isMessageBeingEdited(lease.messageId)) return;
    releaseProvisional(lease);
    const source = message.mes, swipeIndex = message.swipe_id ?? 0;
    const { matched } = findRenderedChatImageTags(lease.content, parseChatImageTags(source));
    // Matching the formatted text is only a projection. It never grants or
    // withholds permission to execute a tag from the raw message.
    for (const { node, offset, marker, candidate } of matched.reverse()) {
        const suffix = node.ownerDocument.createTextNode(node.nodeValue.slice(offset + marker.length));
        node.nodeValue = node.nodeValue.slice(0, offset);
        const template = lease.content.ownerDocument.createElement('template');
        const view = session.view(message, lease.messageId, candidate);
        // Shared escaped renderer, preserving the existing drawing card visual.
        // eslint-disable-next-line no-unsanitized/property
        template.innerHTML = buildPendingImageHtml({ slotId: '', messageId: lease.messageId, label: view.label });
        const card = template.content.firstElementChild;
        card.dataset.xbDrawTag = view.phase;
        if (view.action) {
            const actions = node.ownerDocument.createElement('div');
            actions.className = 'xb-nd-failed-btns xb-nd-tag-actions';
            const button = node.ownerDocument.createElement('button');
            button.type = 'button'; button.className = 'xb-nd-retry-btn';
            button.dataset.action = 'generate-tag'; button.textContent = view.action;
            button.addEventListener('click', event => {
                event.stopPropagation();
                void session.retry({ ctx, message, messageId: lease.messageId, source, swipeIndex, candidate });
            });
            actions.append(button); card.append(actions);
        }
        node.after(card, suffix);
        lease.nodes.set(card, candidate);
    }
    // A DOM-only host repaint may expose existing slots without a message event.
    // This is a read-only projection; the content lease cannot rebuild filtered
    // host text, prepare input, or submit a drawing task.
    void renderPreviewsForMessage(lease.messageId, { content: lease.content }).catch(report);
}

// A content lease owns display subscriptions only. Releasing it never cancels
// the floor's job, and mounting it never submits an image request.
export function mountChatMessageImages(content, messageId = Number(content.closest('.mes')?.getAttribute('mesid'))) {
    leases.get(content)?.release();
    const lease = { content, messageId, nodes: new Map() };
    lease.observer = new MutationObserver(requestRefresh);
    lease.release = () => {
        lease.observer.disconnect();
        releaseProvisional(lease);
        if (leases.get(content) === lease) leases.delete(content);
    };
    leases.set(content, lease);
    requestRefresh();
    return lease.release;
}

function processAllMessages() {
    observer?.disconnect();
    for (const lease of leases.values()) lease.observer.disconnect();
    try {
        for (const [content, lease] of leases) if (!content.isConnected || !available()) lease.release();
        if (!available()) return;
        ensureDrawImageStyles();
        for (const content of document.querySelectorAll('#chat .mes .mes_text')) {
            if (!leases.has(content)) mountChatMessageImages(content);
        }
        for (const lease of leases.values()) enhance(lease);
    } finally {
        // Disconnect around our own DOM writes to avoid an observer/repaint loop.
        for (const lease of leases.values()) lease.observer.observe(lease.content, { subtree: true, childList: true, characterData: true });
        const chat = document.querySelector('#chat');
        if (chat) observer?.observe(chat, { childList: true, subtree: true, characterData: true });
    }
}

async function loadChat() {
    session.targetChanged();
    for (const lease of leases.values()) lease.release();
    const ctx = getContext();
    // History normalization is a load boundary, never a renderer or received hook.
    if (enabled() && ctx.chatId && ctx.chatMetadata) {
        try { await ensureChatImageTagFormat(ctx); } catch (error) { report(error); }
    }
    requestRefresh();
}

export function initChatMessageImages() {
    if (initialized) { requestRefresh(); return true; }
    initialized = true;
    session.connect();
    observer = new MutationObserver(requestRefresh);
    events.on(event_types.CHAT_CREATED, () => { markFreshImageTagChat(getContext()); requestRefresh(); });
    events.on(event_types.GROUP_CHAT_CREATED, () => { markFreshImageTagChat(getContext()); requestRefresh(); });
    events.on(event_types.CHAT_CHANGED, loadChat);
    events.on(event_types.GENERATION_STARTED, (type, _options, dryRun) => session.start(type, dryRun));
    events.on(event_types.GENERATION_AFTER_COMMANDS, (...args) => { if (enabled()) session.observe(...args); });
    events.on(event_types.GENERATE_AFTER_DATA, (_data, dryRun) => session.requesting(dryRun));
    events.on(event_types.GENERATION_STOPPED, () => session.stop());
    events.on(event_types.MESSAGE_DELETED, () => session.deleted());
    events.on(event_types.MESSAGE_RECEIVED, (index, type) => enabled() ? session.received(index, type) : session.stop());
    events.on(event_types.MESSAGE_EDITED, index => session.edited(index));
    events.on(event_types.MESSAGE_SWIPED, () => session.targetChanged());
    for (const event of [event_types.USER_MESSAGE_RENDERED, event_types.CHARACTER_MESSAGE_RENDERED,
        event_types.MESSAGE_UPDATED, event_types.MORE_MESSAGES_LOADED]) events.on(event, requestRefresh);
    void loadChat();
    return true;
}

export function refreshChatMessageImages() {
    if (!initialized) return false;
    requestRefresh(); return true;
}

export function cleanupChatMessageImages() {
    if (!initialized) return false;
    initialized = false; session.disconnect();
    events.cleanup(); observer?.disconnect(); observer = null;
    for (const lease of leases.values()) lease.release();
    return true;
}
