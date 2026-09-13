import { parseImageAttachment } from '../../../domains/messages/image-attachment.js';

export function recordKey(node: Element): string {
    return node.tagName === '消息' ? `message:${node.getAttribute('序号')}` : 'recovery-note';
}

export function messageText(node: Element): string {
    const type = node.getAttribute('类型');
    return (type === 'image' ? '［图片］' : type === 'voice' ? '［语音］' : '') + (node.textContent ?? '');
}

export function contactName(node: Element): string {
    return node.getAttribute(node.getAttribute('方向') === '发出' ? '接收者' : '发送者') || '联系人';
}

function renderBubble(node: Element, doc: Document): HTMLElement {
    const bubble = doc.createElement('article');
    const outgoing = node.getAttribute('方向') === '发出';
    bubble.className = outgoing ? 'xb-private-outgoing' : 'xb-private-incoming';
    bubble.setAttribute('aria-label', `${node.getAttribute('发送者') ?? ''}发给${node.getAttribute('接收者') ?? ''}`);
    const content = doc.createElement('div');
    content.textContent = messageText(node);
    if (node.getAttribute('类型') === 'image' && node.hasAttribute('附件')) {
        try {
            const attachment = parseImageAttachment({ path: node.getAttribute('附件'), name: '图片' });
            const image = doc.createElement('img');
            image.src = attachment.path;
            image.alt = outgoing ? '发送的图片' : '收到的图片';
            image.loading = 'lazy';
            content.prepend(image);
        } catch { /* Edited or untrusted paths remain readable text, never remote media. */ }
    }
    bubble.append(content);
    return bubble;
}

/** Only the visible window becomes HTML. XML order and safe text rendering stay unchanged. */
export function renderRecordWindow(nodes: Element[], start: number, end: number, multipleContacts: boolean, doc: Document): DocumentFragment {
    const fragment = doc.createDocumentFragment();
    let group: HTMLElement | null = null;
    let previousContact: string | null = null;
    for (let index = start; index < end; index++) {
        const node = nodes[index];
        if (node.tagName === '补录说明') {
            const note = doc.createElement('p');
            note.className = 'xb-private-note';
            note.textContent = node.textContent;
            note.dataset.recordIndex = String(index);
            note.dataset.recordKey = recordKey(node);
            fragment.append(note);
            group = null;
            previousContact = null;
            continue;
        }
        const contact = contactName(node);
        if (!group || contact !== previousContact) {
            group = doc.createElement('section');
            group.className = 'xb-private-group';
            group.setAttribute('aria-label', `与${contact}的通讯`);
            if (multipleContacts) {
                const heading = doc.createElement('h4');
                heading.textContent = `与${contact}`;
                group.append(heading);
            }
            fragment.append(group);
            previousContact = contact;
        }
        const bubble = renderBubble(node, doc);
        bubble.dataset.recordIndex = String(index);
        bubble.dataset.recordKey = recordKey(node);
        group.append(bubble);
    }
    return fragment;
}
