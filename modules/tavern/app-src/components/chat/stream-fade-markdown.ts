const STREAM_SEGMENT_CLASS = 'xb-tavern-stream-segment';
const STREAM_SEGMENT_KEY_ATTRIBUTE = 'data-xb-stream-segment-key';
const DIALOGUE_CLASS = 'xb-rp-dialogue';
const MAX_INLINE_DIALOGUE_LENGTH = 600;
const DIALOGUE_QUOTE_PAIRS: Record<string, string> = {
    '"': '"',
    '“': '”',
    '「': '」',
    '『': '』',
};
const DIALOGUE_QUOTE_OPENERS = new Set(Object.keys(DIALOGUE_QUOTE_PAIRS));

type SegmenterLike = {
    segment(text: string): Iterable<{ segment: string }>;
};

function textSegmenter(): SegmenterLike | null {
    const segmenterCtor = (globalThis.Intl as typeof Intl & {
        Segmenter?: new (locale: string, options: { granularity: 'word' }) => SegmenterLike;
    }).Segmenter;
    if (typeof segmenterCtor !== 'function') {return null;}
    return new segmenterCtor('en-US', { granularity: 'word' });
}

function splitTextSegments(text: string, segmenter: SegmenterLike | null) {
    if (!text) {return [];}
    if (segmenter) {
        return Array.from(segmenter.segment(text), (segment) => segment.segment).filter(Boolean);
    }
    return text.match(/\s+|\S+/g) || [];
}

function shouldSegmentTextNode(textNode: Text) {
    if (!textNode.data || /^\s*$/.test(textNode.data)) {return false;}
    const parent = textNode.parentElement;
    if (!parent) {return false;}
    return !parent.closest(`pre, code, script, style, textarea, iframe, .${DIALOGUE_CLASS}`);
}

function collectDialogueRanges(text: string, options: { allowOpenEnded?: boolean } = {}) {
    const ranges: Array<{ start: number; end: number }> = [];
    let cursor = 0;
    while (cursor < text.length) {
        const opener = text[cursor];
        if (!DIALOGUE_QUOTE_OPENERS.has(opener)) {
            cursor += 1;
            continue;
        }
        const closer = DIALOGUE_QUOTE_PAIRS[opener];
        const end = text.indexOf(closer, cursor + 1);
        if (end < 0) {
            if (!options.allowOpenEnded) {
                cursor += 1;
                continue;
            }
            const segment = text.slice(cursor + 1);
            if (!segment.trim() || segment.includes('\n') || segment.length > MAX_INLINE_DIALOGUE_LENGTH) {
                cursor += 1;
                continue;
            }
            ranges.push({ start: cursor, end: text.length });
            break;
        }
        if (end === cursor + 1 || end - cursor > MAX_INLINE_DIALOGUE_LENGTH) {
            cursor += 1;
            continue;
        }
        const segment = text.slice(cursor + 1, end);
        if (segment.includes('\n') || !segment.trim()) {
            cursor += 1;
            continue;
        }
        ranges.push({ start: cursor, end: end + 1 });
        cursor = end + 1;
    }
    return ranges;
}

function appendSegmentedText(fragment: DocumentFragment | HTMLElement, text: string, segmenter: SegmenterLike | null, nextSegmentIndex: () => number) {
    const segments = splitTextSegments(text, segmenter);
    if (!segments.length) {return;}
    segments.forEach((segment) => {
        const span = document.createElement('span');
        span.className = STREAM_SEGMENT_CLASS;
        span.textContent = segment;
        span.setAttribute(STREAM_SEGMENT_KEY_ATTRIBUTE, `${nextSegmentIndex()}:${segment}`);
        fragment.append(span);
    });
}

function buildSegmentedTextFragment(text: string, segmenter: SegmenterLike | null, nextSegmentIndex: () => number) {
    const fragment = document.createDocumentFragment();
    const ranges = collectDialogueRanges(text, { allowOpenEnded: true });
    if (!ranges.length) {
        appendSegmentedText(fragment, text, segmenter, nextSegmentIndex);
        return fragment;
    }

    let cursor = 0;
    ranges.forEach((range) => {
        if (range.start > cursor) {
            appendSegmentedText(fragment, text.slice(cursor, range.start), segmenter, nextSegmentIndex);
        }
        const dialogue = document.createElement('span');
        dialogue.className = DIALOGUE_CLASS;
        appendSegmentedText(dialogue, text.slice(range.start, range.end), segmenter, nextSegmentIndex);
        fragment.append(dialogue);
        cursor = range.end;
    });
    if (cursor < text.length) {
        appendSegmentedText(fragment, text.slice(cursor), segmenter, nextSegmentIndex);
    }
    return fragment;
}

function segmentTextInElement(root: HTMLElement) {
    const segmenter = textSegmenter();
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const textNodes: Text[] = [];
    while (walker.nextNode()) {
        const textNode = walker.currentNode;
        if (textNode instanceof Text && shouldSegmentTextNode(textNode)) {
            textNodes.push(textNode);
        }
    }

    let segmentIndex = 0;
    const nextSegmentIndex = () => {
        const current = segmentIndex;
        segmentIndex += 1;
        return current;
    };
    textNodes.forEach((textNode) => {
        const fragment = buildSegmentedTextFragment(textNode.data, segmenter, nextSegmentIndex);
        if (!fragment.childNodes.length) {return;}
        textNode.replaceWith(fragment);
    });
}

function setHtmlContent(element: HTMLElement, html: string) {
    // eslint-disable-next-line no-unsanitized/property
    element.innerHTML = html;
}

function syncAttributes(source: Element, target: Element) {
    Array.from(source.attributes).forEach((attribute) => {
        if (!target.hasAttribute(attribute.name)) {
            source.removeAttribute(attribute.name);
        }
    });
    Array.from(target.attributes).forEach((attribute) => {
        if (source.getAttribute(attribute.name) !== attribute.value) {
            source.setAttribute(attribute.name, attribute.value);
        }
    });
}

function streamSegmentKey(node: Node) {
    return node instanceof Element ? node.getAttribute(STREAM_SEGMENT_KEY_ATTRIBUTE) || '' : '';
}

function canPatchNode(source: Node, target: Node) {
    if (source.nodeType !== target.nodeType) {return false;}
    if (source.nodeType === Node.TEXT_NODE) {return true;}
    if (!(source instanceof Element) || !(target instanceof Element)) {return false;}
    if (source.tagName !== target.tagName) {return false;}
    const sourceKey = streamSegmentKey(source);
    const targetKey = streamSegmentKey(target);
    if (sourceKey || targetKey) {
        return sourceKey === targetKey;
    }
    return true;
}

function patchNode(source: Node, target: Node) {
    if (source.nodeType === Node.TEXT_NODE && target.nodeType === Node.TEXT_NODE) {
        if (source.nodeValue !== target.nodeValue) {
            source.nodeValue = target.nodeValue;
        }
        return;
    }
    if (!(source instanceof Element) || !(target instanceof Element)) {return;}
    syncAttributes(source, target);
    patchChildren(source, target);
}

function patchChildren(source: Node, target: Node) {
    let sourceChild = source.firstChild;
    let targetChild = target.firstChild;
    while (targetChild) {
        const nextTargetChild = targetChild.nextSibling;
        if (!sourceChild) {
            source.appendChild(targetChild.cloneNode(true));
            targetChild = nextTargetChild;
            continue;
        }
        const nextSourceChild = sourceChild.nextSibling;
        if (canPatchNode(sourceChild, targetChild)) {
            patchNode(sourceChild, targetChild);
        } else {
            source.replaceChild(targetChild.cloneNode(true), sourceChild);
        }
        sourceChild = nextSourceChild;
        targetChild = nextTargetChild;
    }
    while (sourceChild) {
        const nextSourceChild = sourceChild.nextSibling;
        source.removeChild(sourceChild);
        sourceChild = nextSourceChild;
    }
}

export function applyStreamFadeMarkdown(root: HTMLElement, html: string) {
    try {
        const target = document.createElement(root.tagName.toLowerCase());
        setHtmlContent(target, html);
        segmentTextInElement(target);
        patchChildren(root, target);
    } catch {
        setHtmlContent(root, html);
    }
}
