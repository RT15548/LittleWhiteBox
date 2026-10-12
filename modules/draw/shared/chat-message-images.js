import { getContext } from '../../../../../../extensions.js';
import { xbLog } from '../../../core/debug-core.js';
import { createModuleEvents, event_types } from '../../../core/event-manager.js';
import { parseChatImageTags, findRenderedChatImageTags } from './chat-message-image-markup.js';
import { ensureChatImageTagFormat, markFreshImageTagChat } from './chat-image-tag-migration.js';
import { createChatImageSession } from './chat-image-session.js';
import { buildPendingImageHtml, ensureDrawImageStyles, isMessageBeingEdited, renderPreviewsForMessage } from './draw-common.js';
import { DRAW_SLOT_COPY } from './image-record.js';
import { subscribeChatImagePlacement } from './chat-image-placement.js';

const events = createModuleEvents('chatMessageImages');
const leases = new Map();
let initialized = false;
let queued = false;
let observer;
let unsubscribePlacement;

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
    for (const [node, entry] of lease.nodes) {
        if (node.parentNode) node.replaceWith(node.ownerDocument.createTextNode(entry.candidate.marker));
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

function createPendingCard(document, options) {
    const template = document.createElement('template');
    // Only Draw's escaped, locally generated markup is parsed.
    // eslint-disable-next-line no-unsanitized/property
    template.innerHTML = buildPendingImageHtml(options);
    return template.content.firstElementChild;
}

function insertTagCard({ node, offset, marker }, card) {
    const suffix = node.ownerDocument.createTextNode(node.nodeValue.slice(offset + marker.length));
    node.nodeValue = node.nodeValue.slice(0, offset);
    node.after(card, suffix);
}

function updateTagCard(card, entry, input, view) {
    entry.candidate = input.candidate;
    entry.input = input;
    if (card.dataset.mesid !== String(input.messageId)) card.dataset.mesid = String(input.messageId);
    const previous = entry.view;
    if (previous?.phase === view.phase && previous.label === view.label && previous.action === view.action) return;
    entry.view = view;
    const next = createPendingCard(card.ownerDocument, { slotId: '', messageId: input.messageId, label: view.label });
    card.replaceChildren(...next.childNodes);
    card.dataset.xbDrawTag = view.phase;
    if (view.action) {
        const actions = card.ownerDocument.createElement('div');
        actions.className = 'xb-nd-failed-btns xb-nd-tag-actions';
        const button = card.ownerDocument.createElement('button');
        button.type = 'button'; button.className = 'xb-nd-retry-btn';
        // Provider menus capture [data-action] before target listeners. Tag
        // actions belong to this session, not the rendered-image menu.
        button.dataset.xbDrawTagAction = ''; button.textContent = view.action;
        button.addEventListener('click', event => {
            event.stopPropagation();
            void session.retry(entry.input);
        });
        actions.append(button); card.append(actions);
    }
}

function currentMessageId(lease) {
    const value = lease.content.closest('.mes')?.getAttribute('mesid');
    return value === null || value === undefined ? lease.messageId : Number(value);
}

function enhance(lease) {
    lease.messageId = currentMessageId(lease);
    const ctx = getContext(), message = ctx.chat?.[lease.messageId];
    if (!message || isMessageBeingEdited(lease.messageId)) return;
    for (const node of lease.nodes.keys()) if (!lease.content.contains(node)) lease.nodes.delete(node);
    const source = message.mes, swipeIndex = message.swipe_id ?? 0;
    const { matched } = findRenderedChatImageTags(lease.content, parseChatImageTags(source), lease.nodes);
    const retained = new Set(matched.map(item => item.node));
    // Only a genuinely invalidated/ambiguous projection returns to source text.
    // Ordinary refreshes and state transitions keep the card and its controls.
    for (const [node, entry] of lease.nodes) {
        if (retained.has(node)) continue;
        node.replaceWith(node.ownerDocument.createTextNode(entry.candidate.marker));
        lease.nodes.delete(node);
    }
    // Matching the formatted text is only a projection. It never grants or
    // withholds permission to execute a tag from the raw message.
    for (const match of matched.reverse()) {
        const { node, candidate } = match;
        const view = session.view(message, lease.messageId, candidate);
        let entry = lease.nodes.get(node);
        let card = node;
        if (!entry) {
            card = createPendingCard(lease.content.ownerDocument, { slotId: '', messageId: lease.messageId, label: view.label });
            entry = {};
            insertTagCard(match, card);
            lease.nodes.set(card, entry);
        }
        updateTagCard(card, entry, { ctx, message, messageId: lease.messageId, source, swipeIndex, candidate }, view);
    }
    // A DOM-only host repaint may expose existing slots without a message event.
    // This is a read-only projection; the content lease cannot rebuild filtered
    // host text, prepare input, or submit a drawing task.
    void renderPreviewsForMessage(lease.messageId, { content: lease.content }).catch(report);
}

// Transfer the already visible tag to the committed slot in the same synchronous
// placement notification. Never release it back to [img] and wait for a repaint.
function adoptPlacedCards(change) {
    const ctx = getContext();
    if (!available() || !change.edits || change.message?.mes !== change.after) return;
    for (const lease of leases.values()) {
        const messageId = currentMessageId(lease);
        if (!lease.content.isConnected || ctx.chat?.[messageId] !== change.message
            || (change.message.swipe_id ?? 0) !== change.swipeIndex || isMessageBeingEdited(messageId)) continue;
        const { matched } = findRenderedChatImageTags(lease.content, parseChatImageTags(change.before), lease.nodes);
        for (const match of matched.reverse()) {
            const edit = change.edits.find(item => item.start === match.candidate.start && item.end === match.candidate.end);
            if (!edit?.slotId || !edit.content || edit.discarded) continue;
            let card = match.node;
            if (!lease.nodes.has(card)) {
                card = createPendingCard(lease.content.ownerDocument, { slotId: edit.slotId, messageId,
                    label: DRAW_SLOT_COPY.preparing, loading: true });
                insertTagCard(match, card);
            } else {
                lease.nodes.delete(card);
                card.querySelector('.xb-nd-tag-actions')?.remove();
                delete card.dataset.xbDrawTag;
                card.dataset.slotId = edit.slotId;
                card.dataset.mesid = String(messageId);
                card.setAttribute('data-xb-draw-loading', '');
            }
        }
    }
    requestRefresh();
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
    unsubscribePlacement = subscribeChatImagePlacement(change => {
        try { adoptPlacedCards(change); } catch (error) { report(error); }
    });
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
    unsubscribePlacement?.(); unsubscribePlacement = null;
    events.cleanup(); observer?.disconnect(); observer = null;
    for (const lease of leases.values()) lease.release();
    return true;
}
