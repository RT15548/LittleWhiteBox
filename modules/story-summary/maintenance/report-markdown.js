import { renderMarkdownToHtml } from '../../agent-core/ui/dist/message-markdown.js';

const REPORT_TAGS = new Set([
    'p', 'br', 'em', 'i', 'strong', 'b', 'del', 's', 'u', 'code', 'pre', 'blockquote',
    'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr',
    'table', 'thead', 'tbody', 'tr', 'th', 'td', 'a',
]);
const OMIT_TAGS = new Set(['script', 'style', 'custom-style', 'iframe', 'object', 'embed', 'svg', 'math']);

/** Read-only report typography. No chat HTML previews, remote images or model styles. */
export function reportMarkdown(text, document = globalThis.document) {
    const template = document.createElement('template');
    // eslint-disable-next-line no-unsanitized/property -- inert parse; only allowlisted nodes/attributes are mounted below
    template.innerHTML = renderMarkdownToHtml(text, { htmlFenceMode: 'code' });
    function append(parent, source) {
        if (source.nodeType === 3) { parent.append(document.createTextNode(source.textContent)); return; }
        if (source.nodeType !== 1 || OMIT_TAGS.has(source.localName)) return;
        const tag = source.localName;
        if (tag === 'img') { parent.append(document.createTextNode(source.getAttribute('alt') || '')); return; }
        const href = tag === 'a' ? source.getAttribute('href') || '' : '';
        const allowed = REPORT_TAGS.has(tag) && (tag !== 'a' || /^(https?:\/\/|mailto:)/i.test(href));
        const target = allowed ? document.createElement(tag) : parent;
        if (allowed && tag === 'a') {
            target.setAttribute('href', href);
            target.setAttribute('target', '_blank');
            target.setAttribute('rel', 'noopener noreferrer');
        }
        if (allowed && tag === 'ol' && /^\d+$/.test(source.getAttribute('start') || '')) {
            target.setAttribute('start', source.getAttribute('start'));
        }
        for (const child of source.childNodes) append(target, child);
        if (target !== parent) parent.append(target);
    }
    const fragment = document.createDocumentFragment();
    for (const node of template.content.childNodes) append(fragment, node);
    return fragment;
}
