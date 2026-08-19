import showdown from 'showdown';
import { isHtmlStructureLine, preprocessHtmlBoundaryLines } from './markdown-html-boundaries.js';

let markdownConverter = null;
let showdownPatched = false;
let htmlBlockSerial = 0;
const htmlBlockStore = new Map();
let htmlBoundarySerial = 0;
const htmlBoundaryStore = new Map();

const HTML_BLOCK_LANGUAGES = new Set(['html', 'htm', 'xhtml', 'xml', 'svg', 'vue', 'svelte']);
export const HTML_PREVIEW_SANDBOX = 'allow-scripts';
const STYLE_SCOPE_SELECTORS = ['.xb-tavern-markdown', '.xb-assistant-markdown'];

function escapeHtml(text) {
    return String(text || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function createHtmlBlockId() {
    htmlBlockSerial += 1;
    return `html-${Date.now().toString(36)}-${htmlBlockSerial.toString(36)}`;
}

function createHtmlBoundaryId() {
    htmlBoundarySerial += 1;
    return `raw-${Date.now().toString(36)}-${htmlBoundarySerial.toString(36)}`;
}

function formatHtmlBlockSize(code = '') {
    const chars = String(code || '').length;
    if (chars >= 1000) {
        const scaled = chars / 1000;
        return `${scaled >= 10 ? Math.round(scaled) : scaled.toFixed(1)}k 字符`;
    }
    return `${chars} 字符`;
}

function isHtmlBlockLanguage(language = '') {
    return HTML_BLOCK_LANGUAGES.has(String(language || '').trim().toLowerCase());
}

function patchShowdownHtmlSpans() {
    if (showdownPatched) return;
    showdownPatched = true;
    showdown.subParser('unhashHTMLSpans', function unhashHTMLSpans(text, options, globals) {
        let nextText = globals.converter._dispatch('unhashHTMLSpans.before', text, options, globals);
        for (let index = 0; index < globals.gHtmlSpans.length; index += 1) {
            let repText = globals.gHtmlSpans[index];
            let limit = 0;
            while (/¨C(\d+)C/.test(repText)) {
                const num = RegExp.$1;
                repText = repText.replace(`¨C${num}C`, globals.gHtmlSpans[num]);
                if (limit === 10000) {
                    break;
                }
                limit += 1;
            }
            nextText = nextText.replace(`¨C${index}C`, repText);
        }
        return globals.converter._dispatch('unhashHTMLSpans.after', nextText, options, globals);
    });
}

function looksLikeHtmlCode(code = '') {
    const text = String(code || '').trim();
    if (!text) return false;
    if (/^<!doctype\s+html/i.test(text)) return true;
    if (/^<html[\s>]/i.test(text)) return true;
    const tagMatches = text.match(/<\/?[a-z][\w:-]*(?:\s[^<>]*)?>/gi) || [];
    return tagMatches.length >= 3 && /<\/[a-z][\w:-]*>/i.test(text);
}

function storeHtmlBlock(code = '', language = 'html') {
    const id = createHtmlBlockId();
    htmlBlockStore.set(id, {
        code: String(code || ''),
        language: String(language || 'html').trim() || 'html',
    });
    return `@@XBHTMLBLOCK:${id}@@`;
}

function storeHtmlBoundary(html = '') {
    const id = createHtmlBoundaryId();
    htmlBoundaryStore.set(id, String(html || ''));
    return `@@XBHTMLRAW:${id}@@`;
}

function normalizeBlankLikeLine(line = '') {
    const normalized = String(line || '');
    if (!normalized) return normalized;
    const stripped = normalized
        .replace(/&nbsp;|&#160;|&#xa0;/gi, '')
        .replace(/[\s\u00A0\u200B-\u200D\u2060\uFEFF]+/g, '');
    return stripped ? normalized : '';
}

function preprocessNonFenceMarkdown(text = '') {
    const normalized = String(text || '');
    if (!normalized.trim()) return normalized;
    const normalizedLines = normalized.split(/\r?\n/).map((line) => normalizeBlankLikeLine(line));
    const lines = preprocessHtmlBoundaryLines(normalizedLines);
    const protectedLines = [];
    for (let index = 0; index < lines.length; index += 1) {
        const line = lines[index];
        if (!isHtmlStructureLine(line)) {
            protectedLines.push(line);
            continue;
        }

        const blockLines = [line];
        while (index + 1 < lines.length && isHtmlStructureLine(lines[index + 1])) {
            index += 1;
            blockLines.push(lines[index]);
        }

        const previousLine = protectedLines[protectedLines.length - 1] ?? '';
        if (previousLine.trim()) {
            protectedLines.push('');
        }
        protectedLines.push(storeHtmlBoundary(blockLines.join('\n')));
        const nextLine = lines[index + 1] ?? '';
        if (nextLine.trim() && !isHtmlStructureLine(nextLine)) {
            protectedLines.push('');
        }
    }
    return protectedLines.join('\n');
}

function preprocessMarkdownInput(raw = '', options = {}) {
    const text = String(raw || '');
    const htmlFenceMode = options.htmlFenceMode === 'code' ? 'code' : 'placeholder';
    const protectRawHtmlBoundaries = options.protectRawHtmlBoundaries !== false;
    const fenceRegex = /(^|\n)(`{3,}|~{3,})[ \t]*([^\n]*)\n([\s\S]*?)\n\2[ \t]*(?=\n|$)/g;
    let result = '';
    let lastIndex = 0;
    let match = null;

    while ((match = fenceRegex.exec(text)) !== null) {
        const leadingBreak = match[1] || '';
        const blockStart = match.index + leadingBreak.length;
        const fenceEnd = fenceRegex.lastIndex;
        const rawLanguage = String(match[3] || '').trim().split(/\s+/)[0] || '';
        const code = String(match[4] || '');
        const shouldFoldAsHtml = isHtmlBlockLanguage(rawLanguage) || (!rawLanguage && looksLikeHtmlCode(code));

        result += protectRawHtmlBoundaries
            ? preprocessNonFenceMarkdown(text.slice(lastIndex, blockStart))
            : text.slice(lastIndex, blockStart);
        if (shouldFoldAsHtml && htmlFenceMode !== 'code') {
            result += storeHtmlBlock(code, rawLanguage || 'html');
        } else {
            result += text.slice(blockStart, fenceEnd);
        }
        lastIndex = fenceEnd;
    }

    result += protectRawHtmlBoundaries
        ? preprocessNonFenceMarkdown(text.slice(lastIndex))
        : text.slice(lastIndex);
    return result;
}

function injectHtmlBlockPlaceholders(html = '') {
    return String(html || '').replace(/@@XBHTMLBLOCK:([a-z0-9-]+)@@|@@XB_HTML_BLOCK_([a-z0-9-]+)@@/g, (_match, id, legacyId) => (
        `<span class="xb-markdown-html-placeholder" data-xb-html-block-id="${id || legacyId}"></span>`
    ));
}

function injectHtmlBoundaryPlaceholders(html = '') {
    const restoreHtmlBoundary = (_match, id) => {
        const raw = htmlBoundaryStore.get(id) || '';
        htmlBoundaryStore.delete(id);
        return raw;
    };
    return String(html || '')
        .replace(/<p>\s*@@XBHTMLRAW:([a-z0-9-]+)@@\s*<\/p>/g, restoreHtmlBoundary)
        .replace(/(^|[\r\n])@@XBHTMLRAW:([a-z0-9-]+)@@(?=[\r\n]|$)/g, (match, prefix, id) => (
            `${prefix}${restoreHtmlBoundary(match, id)}`
        ));
}

function decodeHtmlAttribute(value = '') {
    return String(value || '')
        .replace(/&#x([0-9a-f]+);?/gi, (_match, hex) => String.fromCodePoint(Number.parseInt(hex, 16) || 0))
        .replace(/&#([0-9]+);?/g, (_match, number) => String.fromCodePoint(Number.parseInt(number, 10) || 0))
        .replace(/&colon;?/gi, ':')
        .replace(/&tab;?/gi, '\t')
        .replace(/&newline;?/gi, '\n')
        .replace(/&amp;?/gi, '&');
}

function isDangerousUrl(value = '') {
    const normalized = decodeHtmlAttribute(value)
        .trim()
        .replace(/[\u0000-\u001F\u007F\s]+/g, '')
        .toLowerCase();
    return /^(?:javascript|vbscript|data):/.test(normalized);
}

function encodeStyleTags(html = '') {
    return String(html || '').replace(/<style>([\s\S]+?)<\/style>/gim, (_match, style) => (
        `<custom-style>${encodeURIComponent(style)}</custom-style>`
    ));
}

function splitCssSelectors(selectorText = '') {
    const selectors = [];
    let current = '';
    let depth = 0;
    for (const char of String(selectorText || '')) {
        if (char === '(' || char === '[') depth += 1;
        if ((char === ')' || char === ']') && depth > 0) depth -= 1;
        if (char === ',' && depth === 0) {
            selectors.push(current);
            current = '';
            continue;
        }
        current += char;
    }
    if (current) selectors.push(current);
    return selectors;
}

function sanitizeCssSelector(selector = '') {
    const pseudoClasses = ['has', 'not', 'where', 'is', 'matches', 'any'];
    const pseudoRegex = new RegExp(`:(${pseudoClasses.join('|')})\\(([^)]+)\\)`, 'g');
    const sanitizeSimpleSelector = (value = '') => String(value || '').split(/\s+/).map((part) => (
        part.replace(/\.([\w-]+)/g, (match, className) => (
            String(className || '').startsWith('custom-') ? match : `.custom-${className}`
        ))
    )).join(' ');

    const sanitized = String(selector || '').replace(pseudoRegex, (_match, pseudoClass, content) => (
        `:${pseudoClass}(${sanitizeSimpleSelector(content)})`
    ));
    return sanitizeSimpleSelector(sanitized);
}

function normalizeStyleScopePrefixes(prefixes = STYLE_SCOPE_SELECTORS) {
    const rawPrefixes = Array.isArray(prefixes) ? prefixes : [prefixes];
    const normalized = rawPrefixes
        .map((prefix) => String(prefix || '').trim())
        .filter(Boolean)
        .map((prefix) => `${prefix} `);
    return normalized.length ? normalized : STYLE_SCOPE_SELECTORS.map((prefix) => `${prefix} `);
}

function prefixCssSelectors(css = '', prefixes = STYLE_SCOPE_SELECTORS) {
    const scopePrefixes = normalizeStyleScopePrefixes(prefixes);
    return String(css || '')
        .replace(/@import[^;]+;?/gi, '')
        .replace(/(^|[{}])\s*([^@{}][^{}]*)\{/g, (match, boundary, selectorText) => {
            const selectors = splitCssSelectors(selectorText)
                .map((selector) => selector.trim())
                .filter(Boolean);
            if (!selectors.length) return match;
            if (selectors.every((selector) => /^(?:from|to|\d+(?:\.\d+)?%)$/i.test(selector))) {
                return match;
            }
            const scoped = selectors.flatMap((selector) => {
                const sanitizedSelector = sanitizeCssSelector(selector);
                return scopePrefixes.map((prefix) => `${prefix}${sanitizedSelector}`);
            }).join(', ');
            return `${boundary}${scoped}{`;
        })
        .replace(/[^{};]+:\s*[^{};]*:\/\/[^{};]*(?:;|(?=}))/g, '');
}

function decodeStyleTags(html = '', options = {}) {
    const prefixes = Array.isArray(options.prefixes)
        ? options.prefixes
        : (options.prefix ? [options.prefix] : STYLE_SCOPE_SELECTORS);
    return String(html || '').replace(/<custom-style>([\s\S]+?)<\/custom-style>/gim, (_match, encodedStyle) => {
        try {
            const style = decodeURIComponent(String(encodedStyle || '')).replaceAll(/<br\/>/g, '');
            return `<style>${prefixCssSelectors(style, prefixes)}</style>`;
        } catch (error) {
            return `CSS ERROR: ${error instanceof Error ? error.message : String(error || 'decode_failed')}`;
        }
    });
}

function prefixMessageClassAttribute(value = '') {
    return String(value || '').split(/\s+/).filter(Boolean).map((className) => {
        if (className.startsWith('fa-') || className.startsWith('note-') || className === 'monospace') {
            return className;
        }
        return className.startsWith('custom-') ? className : `custom-${className}`;
    }).join(' ');
}

function sanitizeMarkdownHtmlFallback(html = '') {
    return String(html || '')
        .replace(/<\/?(?:script|style|iframe|object|embed|link|meta|base|form|input|button|textarea|select|option)[^>]*>/gi, '')
        .replace(/\s+on[a-z0-9_-]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+)/gi, '')
        .replace(/\s+class\s*=\s*("[^"]*"|'[^']*'|[^\s"'=<>`]+)/gi, (match, quotedValue) => {
            const quote = String(quotedValue || '')[0];
            const hasQuote = quote === '"' || quote === "'";
            const rawValue = hasQuote ? String(quotedValue).slice(1, -1) : String(quotedValue || '');
            const prefixed = prefixMessageClassAttribute(rawValue);
            return hasQuote ? ` class=${quote}${prefixed}${quote}` : ` class=${prefixed}`;
        })
        .replace(/\s+(href|src|xlink:href)\s*=\s*("[^"]*"|'[^']*'|[^\s"'=<>`]+)/gi, (match, name, quotedValue) => {
            const value = String(quotedValue || '').replace(/^["']|["']$/g, '');
            return isDangerousUrl(value) ? '' : ` ${name}=${quotedValue}`;
        });
}

function readSanitizerFrom(value) {
    return typeof value?.sanitize === 'function' ? value : null;
}

function getStMessageSanitizer() {
    try {
        const parentSanitizer = globalThis.parent && globalThis.parent !== globalThis
            ? readSanitizerFrom(globalThis.parent.DOMPurify)
            : null;
        if (parentSanitizer) return parentSanitizer;
    } catch {
        // Cross-origin parent access can throw; fall back below.
    }

    return readSanitizerFrom(globalThis.DOMPurify);
}

function sanitizeMarkdownHtml(html = '') {
    const raw = encodeStyleTags(html);
    const sanitizer = getStMessageSanitizer();
    const config = {
        RETURN_DOM: false,
        RETURN_DOM_FRAGMENT: false,
        RETURN_TRUSTED_TYPE: false,
        MESSAGE_SANITIZE: true,
        ADD_TAGS: ['custom-style'],
    };
    if (sanitizer) {
        try {
            return decodeStyleTags(String(sanitizer.sanitize(raw, config) || ''));
        } catch {
            // Fall through to the local test fallback.
        }
    }
    return decodeStyleTags(sanitizeMarkdownHtmlFallback(raw));
}

export function renderMarkdownToHtml(text, options = {}) {
    const raw = String(text || '').trim();
    if (!raw) return '';
    const markdownText = preprocessMarkdownInput(raw, options);

    try {
        if (!markdownConverter) {
            patchShowdownHtmlSpans();
            markdownConverter = new showdown.Converter({
                emoji: true,
                literalMidWordUnderscores: true,
                parseImgDimensions: true,
                simpleLineBreaks: true,
                strikethrough: true,
                tables: true,
                underline: true,
                disableForced4SpacesIndentedSublists: true,
            });
        }
        const html = injectHtmlBoundaryPlaceholders(markdownConverter.makeHtml(markdownText));
        return injectHtmlBlockPlaceholders(sanitizeMarkdownHtml(html));
    } catch {
        // Fall through to escaped plain text below.
    }

    return injectHtmlBlockPlaceholders(escapeHtml(markdownText).replace(/\n/g, '<br>'));
}

async function copyText(text = '', ownerDocument = null) {
    const normalized = String(text || '');
    if (!normalized) return false;
    const doc = ownerDocument?.createElement ? ownerDocument : globalThis.document;
    const win = doc?.defaultView || globalThis;

    try {
        if (doc?.createElement && doc.body?.appendChild) {
            const textarea = doc.createElement('textarea');
            try {
                textarea.value = normalized;
                textarea.setAttribute('readonly', 'readonly');
                textarea.style.position = 'fixed';
                textarea.style.left = '0';
                textarea.style.top = '0';
                textarea.style.width = '2em';
                textarea.style.height = '2em';
                textarea.style.padding = '0';
                textarea.style.border = '0';
                textarea.style.outline = '0';
                textarea.style.boxShadow = 'none';
                textarea.style.background = 'transparent';
                textarea.style.opacity = '0';
                textarea.style.pointerEvents = 'none';
                textarea.style.fontSize = '16px';
                doc.body.appendChild(textarea);
                try {
                    textarea.focus({ preventScroll: true });
                } catch {
                    textarea.focus();
                }
                textarea.select();
                textarea.setSelectionRange(0, textarea.value.length);
                const copied = doc.execCommand?.('copy') || false;
                if (copied) return true;
            } finally {
                textarea.remove();
            }
        }
    } catch {
        // Fall through to the async clipboard path.
    }

    try {
        if (win.navigator?.clipboard?.writeText) {
            await win.navigator.clipboard.writeText(normalized);
            return true;
        }
    } catch {
        // Fall through to false.
    }
    return false;
}

export function enhancePathLinks(rootNode, options = {}) {
    if (!rootNode || typeof options.onPathClick !== 'function') return;

    const doc = rootNode.ownerDocument || globalThis.document;
    const nodeFilter = doc?.defaultView?.NodeFilter || globalThis.NodeFilter;
    if (!doc?.createTreeWalker || !nodeFilter) return;

    const pathRegex = options.pathRegex || /local\/[^\s`"'<>，。；：！？（）()[\]{}]+/g;
    const linkClassName = String(options.linkClassName || 'xb-markdown-local-path-link');
    const walker = doc.createTreeWalker(rootNode, nodeFilter.SHOW_TEXT);
    const textNodes = [];

    while (walker.nextNode()) {
        const node = walker.currentNode;
        if (!node?.nodeValue || !String(node.nodeValue).includes('local/')) continue;
        const parent = node.parentElement;
        if (parent?.closest?.('button, a, textarea, input')) continue;
        textNodes.push(node);
    }

    textNodes.forEach((node) => {
        const text = String(node.nodeValue || '');
        const fragment = doc.createDocumentFragment();
        let match = null;
        let lastIndex = 0;
        let replaced = false;
        pathRegex.lastIndex = 0;

        while ((match = pathRegex.exec(text)) !== null) {
            replaced = true;
            if (match.index > lastIndex) {
                fragment.appendChild(doc.createTextNode(text.slice(lastIndex, match.index)));
            }

            const matchedPath = match[0];
            const button = doc.createElement('button');
            button.type = 'button';
            button.className = linkClassName;
            button.textContent = matchedPath;
            button.addEventListener('click', () => {
                options.onPathClick(matchedPath);
            });
            fragment.appendChild(button);
            lastIndex = match.index + matchedPath.length;
        }

        if (!replaced) return;
        if (lastIndex < text.length) {
            fragment.appendChild(doc.createTextNode(text.slice(lastIndex)));
        }
        node.parentNode?.replaceChild(fragment, node);
    });
}

export function enhanceMarkdownCodeBlocks(rootNode, options = {}) {
    if (!rootNode?.querySelectorAll) return;

    const doc = rootNode.ownerDocument || globalThis.document;
    if (!doc?.createElement) return;

    const codeBlockClassName = String(options.codeBlockClassName || 'xb-markdown-codeblock');
    const codeCopyClassName = String(options.codeCopyClassName || 'xb-markdown-code-copy');
    const copyButtonTitle = String(options.copyButtonTitle || '复制代码');
    const copySuccessTitle = String(options.copySuccessTitle || '已复制');
    const copyFailureTitle = String(options.copyFailureTitle || '复制失败');
    const flattenPreCode = options.flattenPreCode === true;
    const skipPreSelector = String(options.skipPreSelector || '').trim();

    Array.from(rootNode.querySelectorAll('pre')).forEach((pre) => {
        if (skipPreSelector && pre.matches?.(skipPreSelector)) return;
        if (pre.closest(`.${codeBlockClassName}`)) return;

        const codeNode = pre.children.length === 1 && pre.firstElementChild?.tagName === 'CODE'
            ? pre.firstElementChild
            : null;
        if (flattenPreCode && codeNode) {
            while (codeNode.firstChild) {
                pre.insertBefore(codeNode.firstChild, codeNode);
            }
            codeNode.remove();
        }

        const wrapper = doc.createElement('div');
        wrapper.className = codeBlockClassName;

        const copyButton = doc.createElement('button');
        copyButton.type = 'button';
        copyButton.className = codeCopyClassName;
        copyButton.textContent = '⧉';
        copyButton.title = copyButtonTitle;
        copyButton.setAttribute('aria-label', copyButtonTitle);
        copyButton.addEventListener('pointerdown', (event) => {
            event.stopPropagation();
        });
        copyButton.addEventListener('pointerup', (event) => {
            event.stopPropagation();
        });
        copyButton.addEventListener('touchstart', (event) => {
            event.stopPropagation();
        }, { passive: true });
        copyButton.addEventListener('touchend', (event) => {
            event.stopPropagation();
        }, { passive: true });
        copyButton.addEventListener('click', async (event) => {
            event.preventDefault();
            event.stopPropagation();
            const codeText = pre.querySelector('code')?.textContent || pre.textContent || '';
            const copied = await copyText(codeText, doc);
            copyButton.textContent = copied ? '✓' : '!';
            copyButton.title = copied ? copySuccessTitle : copyFailureTitle;
            copyButton.setAttribute('aria-label', copied ? copySuccessTitle : copyFailureTitle);
            copyButton.classList.toggle('is-copied', copied);
            copyButton.classList.toggle('is-failed', !copied);
            setTimeout(() => {
                copyButton.textContent = '⧉';
                copyButton.title = copyButtonTitle;
                copyButton.setAttribute('aria-label', copyButtonTitle);
                copyButton.classList.remove('is-copied', 'is-failed');
            }, 1200);
        });

        pre.parentNode?.insertBefore(wrapper, pre);
        wrapper.append(copyButton, pre);
    });
}

function clearActiveHtmlBlockButtons(buttons = [], activeButton = null) {
    buttons.forEach((button) => {
        button.classList.toggle('is-active', button === activeButton);
        button.setAttribute('aria-pressed', button === activeButton ? 'true' : 'false');
    });
}

function buildHtmlCodeView(doc, code = '') {
    const pre = doc.createElement('pre');
    pre.className = 'xb-markdown-html-code';
    pre.textContent = String(code || '');
    return pre;
}

function buildHtmlPreview(doc, code = '') {
    const iframe = doc.createElement('iframe');
    iframe.className = 'xb-markdown-html-preview';
    iframe.setAttribute('sandbox', HTML_PREVIEW_SANDBOX);
    iframe.referrerPolicy = 'no-referrer';
    iframe.title = 'HTML 渲染预览';
    // Scripts can run inside the preview iframe, but the sandbox still keeps it isolated
    // from the host because we do not grant same-origin, forms, popups, or top navigation.
    // eslint-disable-next-line no-unsanitized/property
    iframe.srcdoc = String(code || '');
    return iframe;
}

function createHtmlBlockNode(doc, entry = {}, options = {}) {
    const code = String(entry.code || '');
    if (options.htmlBlockMode === 'code') {
        return buildHtmlCodeView(doc, code);
    }

    if (options.htmlBlockMode === 'preview') {
        const block = doc.createElement('div');
        block.className = 'xb-markdown-html-block xb-markdown-html-block-auto';
        const body = doc.createElement('div');
        body.className = 'xb-markdown-html-body';
        body.append(buildHtmlPreview(doc, code));
        block.append(body);
        return block;
    }

    const block = doc.createElement('div');
    block.className = 'xb-markdown-html-block';

    const header = doc.createElement('div');
    header.className = 'xb-markdown-html-head';

    const title = doc.createElement('div');
    title.className = 'xb-markdown-html-title';
    title.textContent = 'HTML 片段';

    const meta = doc.createElement('span');
    meta.textContent = formatHtmlBlockSize(code);
    title.appendChild(meta);

    const actions = doc.createElement('div');
    actions.className = 'xb-markdown-html-actions';

    const codeButton = doc.createElement('button');
    codeButton.type = 'button';
    codeButton.textContent = '显示代码';
    codeButton.setAttribute('aria-pressed', 'false');

    const previewButton = doc.createElement('button');
    previewButton.type = 'button';
    previewButton.textContent = '渲染预览';
    previewButton.setAttribute('aria-pressed', 'false');

    actions.append(codeButton, previewButton);
    header.append(title, actions);

    const body = doc.createElement('div');
    body.className = 'xb-markdown-html-body';
    body.hidden = true;

    let activeMode = '';
    const buttons = [codeButton, previewButton];
    const renderMode = (mode) => {
        if (activeMode === mode) {
            activeMode = '';
            body.hidden = true;
            body.replaceChildren();
            clearActiveHtmlBlockButtons(buttons);
            return;
        }
        activeMode = mode;
        body.hidden = false;
        body.replaceChildren(mode === 'preview'
            ? buildHtmlPreview(doc, code)
            : buildHtmlCodeView(doc, code));
        clearActiveHtmlBlockButtons(buttons, mode === 'preview' ? previewButton : codeButton);
    };

    codeButton.addEventListener('click', () => renderMode('code'));
    previewButton.addEventListener('click', () => renderMode('preview'));

    block.append(header, body);
    return block;
}

export function enhanceHtmlBlocks(rootNode, options = {}) {
    if (!rootNode?.querySelectorAll) return;

    const doc = rootNode.ownerDocument || globalThis.document;
    if (!doc?.createElement) return;

    Array.from(rootNode.querySelectorAll('.xb-markdown-html-placeholder[data-xb-html-block-id]')).forEach((placeholder) => {
        const id = String(placeholder.getAttribute('data-xb-html-block-id') || '');
        const entry = htmlBlockStore.get(id);
        htmlBlockStore.delete(id);
        if (!entry) {
            placeholder.remove();
            return;
        }

        const node = createHtmlBlockNode(doc, entry, options);
        const parent = placeholder.parentElement;
        if (parent?.tagName === 'P' && parent.textContent.trim() === '') {
            parent.replaceWith(node);
            return;
        }
        placeholder.replaceWith(node);
    });
}

export function enhanceMarkdownContent(rootNode, options = {}) {
    if (!rootNode) return rootNode;
    enhanceHtmlBlocks(rootNode, options);
    enhanceMarkdownCodeBlocks(rootNode, options);
    enhancePathLinks(rootNode, options);
    return rootNode;
}

export function buildMarkdownFragment(text, options = {}) {
    const html = renderMarkdownToHtml(text);
    const doc = globalThis.document;
    if (!doc?.createElement) {
        return null;
    }

    const template = doc.createElement('template');
    // `html` is sanitized by renderMarkdownToHtml() above before being inserted.
    // eslint-disable-next-line no-unsanitized/property
    template.innerHTML = html;
    const fragment = template.content.cloneNode(true);
    enhanceMarkdownContent(fragment, options);
    return fragment;
}
