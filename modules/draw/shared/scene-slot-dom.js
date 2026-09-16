import { createDrawImageSlotRegex } from './image-marker-syntax.js';

const BLOCK_TAGS = new Set(['P', 'DIV', 'BLOCKQUOTE', 'PRE', 'UL', 'OL', 'LI', 'TABLE', 'THEAD', 'TBODY', 'TFOOT', 'TR', 'TD', 'TH', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6']);
const OPAQUE_SELECTOR = '.xb-nd-img, button, input, textarea, select, script, style, iframe, img, video, audio, canvas, svg, hr';

// Markdown can split one marker across text nodes, <br>s or paragraphs. Keep a
// source map so detection and replacement agree without rewriting the surrounding DOM.
function collectTextSlots(root) {
    let text = '';
    const segments = [];
    function visit(node) {
        if (node.nodeType === 3) {
            const value = node.nodeValue || '';
            segments.push({ node, start: text.length, end: text.length + value.length });
            text += value;
        } else if (node.nodeType === 1) {
            if (node.matches(OPAQUE_SELECTOR)) {
                // Do not join partial markers across a card/control, or parse its labels.
                text += '\0';
            } else if (node.tagName === 'BR') {
                segments.push({ node, start: text.length, end: text.length + 1 });
                text += '\n';
            } else {
                const block = BLOCK_TAGS.has(node.tagName);
                if (block) text += '\n';
                for (const child of node.childNodes) visit(child);
                if (block) text += '\n';
            }
        }
    }
    for (const child of root.childNodes) visit(child);
    return { segments, matches: [...text.matchAll(createDrawImageSlotRegex())] };
}

export function getRenderedSceneSlotIds(root) {
    if (!root) return new Set();
    const { matches } = collectTextSlots(root);
    return new Set([
        ...matches.map(match => match[1]),
        ...[...root.querySelectorAll('.xb-nd-img[data-slot-id]')].map(element => element.dataset.slotId),
    ]);
}

/** Render trusted Draw markup at its text slot, without moving the surrounding prose. */
export function replaceSceneSlotElements(root, replacements, { shouldReplaceExisting = () => true } = {}) {
    const resolved = new Set();
    if (!root || !Array.isArray(replacements) || !replacements.length) return resolved;

    const document = root.ownerDocument;
    const existingSlots = new Map();
    for (const element of root.querySelectorAll('.xb-nd-img[data-slot-id]')) {
        if (!existingSlots.has(element.dataset.slotId)) existingSlots.set(element.dataset.slotId, element);
    }
    const pending = new Map();
    for (const item of replacements) {
        if (!item?.slotId || !item?.html) continue;
        const existing = existingSlots.get(item.slotId);
        if (existing && !shouldReplaceExisting(existing)) continue;

        const template = document.createElement('template');
        // Only Draw's locally generated card markup is parsed; narrative text stays in text nodes.
        // eslint-disable-next-line no-unsanitized/property
        template.innerHTML = String(item.html).trim();
        const element = template.content.firstElementChild;
        if (!element) continue;
        if (existing) {
            existing.replaceWith(element);
            existingSlots.set(item.slotId, element);
            resolved.add(item.slotId);
        } else {
            pending.set(item.slotId, element);
        }
    }
    if (!pending.size) return resolved;

    const { segments, matches } = collectTextSlots(root);
    const selected = [];
    for (const match of matches) {
        const element = pending.get(match[1]);
        if (!element) continue;
        selected.push({ match, element });
        pending.delete(match[1]);
        resolved.add(match[1]);
    }
    // Work backwards: multiple matches may share a text node. Earlier offsets then
    // remain valid, and each slot still replaces only its first occurrence.
    for (const { match, element } of selected.reverse()) {
        const start = match.index;
        const end = start + match[0].length;
        const parts = segments.filter(part => part.end > start && part.start < end);
        const first = parts[0];
        const last = parts[parts.length - 1];
        const suffix = last.node.nodeValue.slice(end - last.start);
        first.node.nodeValue = first.node.nodeValue.slice(0, start - first.start);
        if (first === last) {
            first.node.after(element, document.createTextNode(suffix));
        } else {
            last.node.nodeValue = suffix;
            for (const part of parts.slice(1, -1)) {
                if (part.node.nodeType === 3) part.node.nodeValue = '';
                else part.node.remove(); // Only line breaks inside the matched marker.
            }
            first.node.after(element);
        }
    }
    return resolved;
}
