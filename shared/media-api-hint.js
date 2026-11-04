import { extensionFolderPath } from '../core/constants.js';

const CALLS = Object.freeze({ draw: 'window.parent.xiaobaixDraw.generate(request)', tts: 'window.parent.xiaobaixTts.synthesize(text, options)' });
const COPY = Object.freeze({ before: '也可通过 ', after: ' 调用，', link: '详见文档' });

export function mountMediaApiHint(root, kind) {
    const code = root.ownerDocument.createElement('code');
    code.textContent = CALLS[kind];
    code.style.overflowWrap = 'anywhere';
    code.style.whiteSpace = 'normal';
    code.style.fontSize = '1em';
    const link = root.ownerDocument.createElement('a');
    link.textContent = COPY.link;
    link.href = `/${extensionFolderPath}/docs/media-api.html#${kind}`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.style.color = 'var(--accent, currentColor)';
    root.replaceChildren(COPY.before, code, COPY.after, link);
}
