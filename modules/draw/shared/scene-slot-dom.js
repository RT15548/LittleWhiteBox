import { createDrawImageSlotRegex } from './image-marker-syntax.js';

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

    // Collect first: inserting cards while walking would revisit their text or skip following nodes.
    const textNodes = [];
    const walker = document.createTreeWalker(root, 4 /* NodeFilter.SHOW_TEXT */);
    let node;
    while ((node = walker.nextNode())) {
        if (!node.parentElement?.closest('.xb-nd-img')) textNodes.push(node);
    }

    for (const textNode of textNodes) {
        const text = textNode.nodeValue || '';
        const matches = text.matchAll(createDrawImageSlotRegex());
        const fragment = document.createDocumentFragment();
        let cursor = 0;
        for (const match of matches) {
            const slotId = match[1];
            const element = pending.get(slotId);
            if (!element) continue;
            fragment.append(document.createTextNode(text.slice(cursor, match.index)), element);
            cursor = match.index + match[0].length;
            pending.delete(slotId);
            resolved.add(slotId);
        }
        if (!cursor) continue;
        fragment.append(document.createTextNode(text.slice(cursor)));
        // Replace only the matched text node. Its parent, sibling nodes and their listeners survive.
        textNode.replaceWith(fragment);
        if (!pending.size) break;
    }
    return resolved;
}
