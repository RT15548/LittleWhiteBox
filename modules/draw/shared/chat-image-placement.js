import { setActiveMessageText } from './scene-placement.js';
import { parseChatImageTags } from './chat-message-image-markup.js';
import { createDrawImageSlotRegex } from './image-marker-syntax.js';
import { DRAW_SLOT_COPY } from './image-record.js';

// Synchronous notification of validated tag -> slot edits. Drawing owns the
// edits; consumers may rebase transient references, never authorize other edits.
const listeners = new Set();

export function subscribeChatImagePlacement(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

function notify(change) {
    for (const listener of listeners) {
        try { listener(change); }
        catch (error) { console.error(DRAW_SLOT_COPY.renderFailed, error); }
    }
}

export function discardChatImagePlacement(slotId) {
    notify({ removedSlotId: slotId });
}

// The live generation observation owns its prefix edits. DICE and preparation
// may request restoration without keeping another copy or touching the stream.
export function restoreChatImagePlacements(message) {
    notify({ restoreMessage: message });
    return message.mes;
}

export function commitChatImageRemoval({ message, swipeIndex, slotId }) {
    const before = message.mes;
    const edits = [...before.matchAll(createDrawImageSlotRegex())]
        .filter(match => match[1] === slotId)
        .map(match => ({ start: match.index, end: match.index + match[0].length, marker: match[0], content: '' }));
    if (!edits.length || (message.swipe_id ?? 0) !== swipeIndex) throw new Error(DRAW_SLOT_COPY.sourceChanged);
    const after = rebaseImageText(before, { before, edits });
    setActiveMessageText(message, after);
    const change = { message, swipeIndex, before, after, edits };
    notify(change);
    return change;
}

export function rollbackChatImageRemoval(change) {
    const { message, swipeIndex, before, after, edits } = change;
    if (message.mes !== after || (message.swipe_id ?? 0) !== swipeIndex) return;
    setActiveMessageText(message, before);
    notify({ message, swipeIndex, before: after, after: before, rollbackOf: change, edits: edits.map(edit => ({
        start: rebaseImageOffset(edit.start, edits), end: rebaseImageOffset(edit.start, edits),
        marker: '', content: edit.marker,
    })) });
}

export function commitChatImagePlacement({ message, swipeIndex, before, edits, owner, restored = false }) {
    const tags = parseChatImageTags(before);
    let boundary = before.length;
    for (const edit of [...edits].sort((a, b) => b.start - a.start)) {
        const removal = edit.content === '' && before.slice(edit.start, edit.end) === edit.marker
            && edit.marker.match(createDrawImageSlotRegex())?.[0] === edit.marker;
        if (edit.end > boundary || !removal && !tags.some(tag => tag.start === edit.start && tag.end === edit.end && tag.marker === edit.marker)
            || (!removal && (edit.discarded ? edit.content !== '' : edit.content.match(createDrawImageSlotRegex())?.[0] !== edit.content))) {
            throw new Error(DRAW_SLOT_COPY.sourceChanged);
        }
        boundary = edit.start;
    }
    if (message.mes !== before || (message.swipe_id ?? 0) !== swipeIndex) throw new Error(DRAW_SLOT_COPY.sourceChanged);
    const after = rebaseImageText(before, { before, edits });
    setActiveMessageText(message, after);
    notify({ message, swipeIndex, before, after, edits, owner, restored });
    return after;
}

export function rebaseImageOffset(offset, edits) {
    return offset + edits.filter(edit => edit.end <= offset)
        .reduce((delta, edit) => delta + edit.content.length - (edit.end - edit.start), 0);
}

export function rebaseImageText(text, { before, edits }) {
    if (!before.startsWith(text) && !text.startsWith(before)) return null;
    let result = text;
    for (const edit of [...edits].sort((a, b) => b.start - a.start)) {
        if (edit.start >= text.length) continue;
        if (edit.end > text.length || text.slice(edit.start, edit.end) !== edit.marker) return null;
        result = result.slice(0, edit.start) + edit.content + result.slice(edit.end);
    }
    return result;
}
