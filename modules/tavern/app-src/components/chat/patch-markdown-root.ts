function setTemplateHtml(template: HTMLTemplateElement, html: string) {
    // Markdown HTML is sanitized before it reaches this renderer.
    // eslint-disable-next-line no-unsanitized/property
    template.innerHTML = html;
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

function canPatchNode(source: Node, target: Node) {
    if (source.nodeType !== target.nodeType) {return false;}
    if (source.nodeType === Node.TEXT_NODE) {return true;}
    return source instanceof Element
        && target instanceof Element
        && source.tagName === target.tagName;
}

function patchNode(source: Node, target: Node) {
    if (source.isEqualNode(target)) {return;}
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

/**
 * Patches normal Markdown DOM in place. The root itself is never replaced,
 * which lets a live assistant bubble become its persisted form without a
 * component or scroll-anchor handoff.
 */
export function patchTavernMarkdownRoot(root: HTMLElement, html: string) {
    const template = document.createElement('template');
    setTemplateHtml(template, html);
    patchChildren(root, template.content);
}
