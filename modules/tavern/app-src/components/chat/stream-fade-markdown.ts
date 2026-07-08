const STREAM_SEGMENT_CLASS = 'xb-tavern-stream-segment';
const STREAM_SEGMENT_KEY_ATTRIBUTE = 'data-xb-stream-segment-key';

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
    return !parent.closest('pre, code, script, style, textarea, iframe');
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
    textNodes.forEach((textNode) => {
        const segments = splitTextSegments(textNode.data, segmenter);
        if (!segments.length) {return;}
        const fragment = document.createDocumentFragment();
        segments.forEach((segment) => {
            const span = document.createElement('span');
            span.className = STREAM_SEGMENT_CLASS;
            span.textContent = segment;
            span.setAttribute(STREAM_SEGMENT_KEY_ATTRIBUTE, `${segmentIndex}:${segment}`);
            fragment.append(span);
            segmentIndex += 1;
        });
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
    const target = document.createElement(root.tagName.toLowerCase());
    setHtmlContent(target, html);
    segmentTextInElement(target);
    patchChildren(root, target);
}
