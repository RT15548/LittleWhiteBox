import { CHECK_MARKER_PATTERN, checkMarker } from '../domain/check-marker.js';

/** Replace exact marker text only, including a marker segmented by native streaming fade-in. */
export function mountCheckCards(root: HTMLElement, cards: ReadonlyMap<string, HTMLElement>): Set<HTMLElement> {
    const mounted = new Set<HTMLElement>();
    for (const node of root.querySelectorAll<HTMLElement>('.xb-dice-card[data-dice-record]')) {
        if (cards.get(node.dataset.diceRecord ?? '') === node) { mounted.add(node); }
    }
    if (mounted.size === cards.size) { return mounted; }

    const document = root.ownerDocument;
    const walker = document.createTreeWalker(root, 4 /* SHOW_TEXT */);
    const nodes: { node: Text; start: number; end: number }[] = [];
    let text = '';
    let current: Node | null;
    // Collect first so insertion never revisits card contents or skips a following marker.
    while ((current = walker.nextNode())) {
        if (current.parentElement?.closest('.xb-dice-card, pre, code')) { continue; }
        const start = text.length;
        text += current.textContent ?? '';
        nodes.push({ node: current as Text, start, end: text.length });
    }
    const placements: { card: HTMLElement; first: typeof nodes[number]; last: typeof nodes[number]; start: number; end: number }[] = [];
    let cursor = 0;
    for (const match of text.matchAll(new RegExp(CHECK_MARKER_PATTERN, 'g'))) {
        const card = cards.get(match[1]);
        if (!card || mounted.has(card)) { continue; }
        while (nodes[cursor].end <= match.index) { cursor++; }
        const firstIndex = cursor;
        const first = nodes[cursor];
        const end = match.index + match[0].length;
        while (nodes[cursor].end < end) { cursor++; }
        // Only native sibling text segments may split a marker. Never span unrelated
        // wrappers, skipped code, images or other content between two text nodes.
        if (firstIndex !== cursor && nodes.slice(firstIndex, cursor + 1).some(({ node }, index, run) => {
            const segment = node.parentElement;
            return !segment?.classList.contains('text_segment') || segment.childNodes.length !== 1
                || index > 0 && run[index - 1].node.parentElement?.nextSibling !== segment;
        })) { continue; }
        placements.push({ card, first, last: nodes[cursor], start: match.index, end });
        mounted.add(card);
    }
    // Right to left preserves the original offsets when multiple slots share a text node.
    for (const { card, first, last, start, end } of placements.reverse()) {
        if (first === last) {
            const fragment = document.createDocumentFragment();
            const value = first.node.textContent ?? '';
            const prefix = document.createTextNode(value.slice(0, start - first.start));
            fragment.append(prefix, card, document.createTextNode(value.slice(end - first.start)));
            first.node.replaceWith(fragment);
            first.node = prefix;
        } else {
            const range = document.createRange();
            range.setStart(first.node, start - first.start);
            range.setEnd(last.node, end - last.start);
            range.deleteContents();
            range.insertNode(card);
        }
    }
    return mounted;
}

/** Disabling the display restores only its marker, without rewriting the surrounding message. */
export function restoreCheckMarker(card: HTMLElement): void {
    const id = card.dataset.diceRecord;
    if (!id) { card.remove(); return; }
    card.replaceWith(card.ownerDocument.createTextNode(checkMarker(id)));
}
