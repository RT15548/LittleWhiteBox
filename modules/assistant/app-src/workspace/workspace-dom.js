// Update this panel in place: tree rows have stable file/group keys, controls
// have action keys, and CodeMirror exclusively owns the editor's children.
function nodeKey(node) {
    if (node.nodeType !== 1) return String(node.nodeType);
    return node.dataset.nodeKey || node.dataset.action || node.dataset.viewKey
        || `${node.tagName}:${node.getAttribute('class')?.split(' ')[0] || ''}`;
}

function updateElement(current, next) {
    for (const { name } of [...current.attributes]) {
        if (!next.hasAttribute(name)) current.removeAttribute(name);
    }
    for (const { name, value } of next.attributes) {
        if (current.getAttribute(name) !== value) current.setAttribute(name, value);
    }
    current.onclick = next.onclick;
    current.oninput = next.oninput;
    if (current.tagName === 'INPUT' && current.value !== next.value) current.value = next.value;
    if (!next.matches('[data-workspace-editor], [data-workspace-image-preview]')) updateWorkspaceChildren(current, next);
}

export function updateWorkspaceChildren(current, next) {
    const previous = new Map();
    for (const child of current.childNodes) {
        const key = nodeKey(child);
        if (!previous.has(key)) previous.set(key, []);
        previous.get(key).push(child);
    }
    let position = current.firstChild;
    for (const child of [...next.childNodes]) {
        const existing = previous.get(nodeKey(child))?.shift();
        const kept = existing || child;
        if (kept !== position) current.insertBefore(kept, position);
        if (existing?.nodeType === 1) updateElement(existing, child);
        else if (existing && existing.nodeValue !== child.nodeValue) existing.nodeValue = child.nodeValue;
        position = kept.nextSibling;
    }
    for (const unused of previous.values()) for (const child of unused) child.remove();
}
