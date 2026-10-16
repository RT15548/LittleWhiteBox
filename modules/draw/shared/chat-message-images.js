import { getContext } from '../../../../../../extensions.js';
import { xbLog } from '../../../core/debug-core.js';
import { createModuleEvents, event_types } from '../../../core/event-manager.js';
import { parseChatImageTags, findRenderedChatImageTags } from './chat-message-image-markup.js';
import { adoptChatImageMessage, releaseChatImageAdmission, withdrawEditedImagePlacements } from './chat-image-tag-migration.js';
import { createChatImageSession } from './chat-image-session.js';
import { buildPendingImageHtml, ensureDrawImageStyles, isMessageBeingEdited } from './draw-common.js';
import { DRAW_SLOT_COPY } from './image-record.js';
import { subscribeChatImagePlacement } from './chat-image-placement.js';
import { withDrawActionFeedback } from './draw-action-feedback.js';
import { drawMessageViewport } from './draw-message-viewport.js';

const events = createModuleEvents('chatMessageImages');
const leases = new Map();
let initialized = false;
let unsubscribeViews;
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

function requestRefresh(message) {
    if (!initialized) return;
    const ctx = getContext();
    const id = message ? ctx.chat?.indexOf(message) : (ctx.chat?.length ?? 0) - 1;
    if (id >= 0) drawMessageViewport.invalidate(document.querySelector(`.mes[mesid="${id}"] .mes_text`));
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
            void withDrawActionFeedback(button, () => session.retry(entry.input)).catch(report);
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
}

// Transfer the already visible tag to the committed slot in the same synchronous
// placement notification. Never release it back to [img] and wait for a repaint.
function adoptPlacedCards(change) {
    const ctx = getContext();
    if (!available() || !change.edits || change.message?.mes !== change.after) return;
    const id = ctx.chat?.indexOf(change.message) ?? -1;
    const content = document.querySelector(`.mes[mesid="${id}"] .mes_text`);
    const lease = leases.get(content);
    if (lease && drawMessageViewport.isActive(content)) {
        const messageId = currentMessageId(lease);
        if (!lease.content.isConnected || ctx.chat?.[messageId] !== change.message
            || (change.message.swipe_id ?? 0) !== change.swipeIndex || isMessageBeingEdited(messageId)) return;
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
    requestRefresh(change.message);
}

// A content lease owns display subscriptions only. Releasing it never cancels
// the floor's job, and mounting it never submits an image request.
export function mountChatMessageImages(content, messageId = Number(content.closest('.mes')?.getAttribute('mesid'))) {
    return drawMessageViewport.mount(content, messageId);
}

function releaseContent(content) {
    const lease = leases.get(content);
    if (lease) {
        releaseChatImageAdmission(lease.message);
        drawMessageViewport.write(() => releaseProvisional(lease));
    }
    leases.delete(content);
}

async function refreshContent(content, messageId) {
    if (!available()) { releaseContent(content); return; }
    let lease = leases.get(content);
    if (!lease) { lease = { content, messageId, nodes: new Map() }; leases.set(content, lease); }
    ensureDrawImageStyles();
    const ctx = getContext();
    const message = ctx.chat?.[messageId];
    lease.message = message;
    try {
        // Only admitted, settled messages enter the compatibility boundary.
        // Streaming keeps its native observation and does no history/cache I/O.
        if (message && !session.isBusy(message)) {
            const changed = await adoptChatImageMessage(ctx, messageId);
            if (changed) drawMessageViewport.invalidate(content);
        }
    }
    catch (error) { report(error); }
    // A failed history read is reported, but must not remove the user's
    // explicit Generate action or hold it behind a database upgrade.
    if (!available() || leases.get(content) !== lease || !drawMessageViewport.isActive(content)) return;
    drawMessageViewport.write(() => enhance(lease));
}

async function loadChat() {
    session.targetChanged();
    for (const content of leases.keys()) releaseContent(content);
    // Legacy adoption is viewport-scoped in refreshContent. Opening a chat must
    // never synchronously scan or rewrite every historical floor.
    if (!initialized) return;
    drawMessageViewport.refresh();
    drawMessageViewport.invalidateAll();
}

export function initChatMessageImages() {
    if (initialized) { refreshChatMessageImages(); return true; }
    initialized = true;
    session.connect();
    unsubscribePlacement = subscribeChatImagePlacement(change => {
        try { drawMessageViewport.write(() => adoptPlacedCards(change)); } catch (error) { report(error); }
    });
    unsubscribeViews = drawMessageViewport.subscribe({ refresh: refreshContent, release: releaseContent });
    events.on(event_types.CHAT_CREATED, () => requestRefresh());
    events.on(event_types.GROUP_CHAT_CREATED, () => requestRefresh());
    events.on(event_types.CHAT_CHANGED, loadChat);
    events.on(event_types.GENERATION_STARTED, (type, _options, dryRun) => session.start(type, dryRun));
    events.on(event_types.GENERATION_AFTER_COMMANDS, (...args) => { if (enabled()) session.observe(...args); });
    events.on(event_types.GENERATE_AFTER_DATA, (_data, dryRun) => session.requesting(dryRun));
    events.on(event_types.GENERATION_STOPPED, () => session.stop());
    events.on(event_types.MESSAGE_DELETED, () => session.deleted());
    events.on(event_types.MESSAGE_RECEIVED, (index, type) => enabled() ? session.received(index, type) : session.stop());
    events.on(event_types.MESSAGE_EDITED, async index => {
        session.edited(index);
        try { await withdrawEditedImagePlacements(getContext(), index); }
        catch (error) { report(error); }
    });
    events.on(event_types.MESSAGE_SWIPED, () => session.targetChanged());
    events.on(event_types.MORE_MESSAGES_LOADED, () => drawMessageViewport.refresh());
    void loadChat();
    return true;
}

export function refreshChatMessageImages() {
    if (!initialized) return false;
    drawMessageViewport.refresh();
    drawMessageViewport.invalidateAll();
    return true;
}

export function cleanupChatMessageImages() {
    if (!initialized) return false;
    initialized = false; session.disconnect();
    unsubscribePlacement?.(); unsubscribePlacement = null;
    events.cleanup();
    unsubscribeViews?.(); unsubscribeViews = null;
    return true;
}
