import { mapMessageMarkdownProse, parseMessageMarkdown } from './message-markdown-parser.js';
import { isHtmlStructureLine, preprocessHtmlBoundaryLines } from './markdown-html-boundaries.js';

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

function looksLikeHtmlCode(code = '') {
    const text = String(code || '').trim();
    if (!text) return false;
    if (/^<!doctype\s+html/i.test(text)) return true;
    if (/^<html[\s>]/i.test(text)) return true;
    const tagMatches = text.match(/<\/?[a-z][\w:-]*(?:\s[^<>]*)?>/gi) || [];
    return tagMatches.length >= 3 && /<\/[a-z][\w:-]*>/i.test(text);
}

// Boundary tokens exist only during this render, never across messages.
function createHtmlBoundaries(source) {
    let prefix = '@@XBMARKDOWN:';
    while (source.includes(prefix)) prefix += ':';
    const entries = new Map();
    return {
        entries,
        store(html) {
            const token = `${prefix}${entries.size}@@`;
            entries.set(token, html);
            return token;
        },
    };
}

function normalizeBlankLikeLine(line = '') {
    const normalized = String(line || '');
    if (!normalized) return normalized;
    const stripped = normalized
        .replace(/&nbsp;|&#160;|&#xa0;/gi, '')
        .replace(/[\s\u00A0\u200B-\u200D\u2060\uFEFF]+/g, '');
    return stripped ? normalized : '';
}

function preprocessNonFenceMarkdown(text, markup) {
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
        protectedLines.push(markup.store(blockLines.join('\n')));
        const nextLine = lines[index + 1] ?? '';
        if (nextLine.trim() && !isHtmlStructureLine(nextLine)) {
            protectedLines.push('');
        }
    }
    return protectedLines.join('\n');
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
    } catch (caughtError) {
        console.warn({ source: import.meta.url, operation: "getStMessageSanitizer" }, caughtError);
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
        } catch (caughtError) {
            console.warn({ source: import.meta.url, operation: "sanitizeMarkdownHtml" }, caughtError);
        }
    }
    return decodeStyleTags(sanitizeMarkdownHtmlFallback(raw));
}

export function renderMarkdownToHtml(text, options = {}) {
    const raw = String(text || '');
    if (!raw.trim()) return '';

    try {
        const markup = createHtmlBoundaries(raw);
        const markdownText = options.protectRawHtmlBoundaries === false ? raw
            : mapMessageMarkdownProse(raw, prose => preprocessNonFenceMarkdown(prose, markup));
        const html = parseMessageMarkdown(markdownText, {
            htmlBoundaries: markup.entries,
            renderFence: token => {
                if (options.htmlFenceMode === 'code' || !token.meta.closed) return null;
                const language = token.info.trim().split(/\s+/)[0];
                if (!isHtmlBlockLanguage(language) && (language || !looksLikeHtmlCode(token.content))) return null;
                // Keep source in a literal code node through sanitization. HTML
                // inside an attribute can be removed by the host's sanitizer.
                // The DOM owns preview content; no cross-render cache is needed.
                // Encode whitespace too: the string-only sanitizer must not
                // mistake attributes in literal code for live ones.
                const code = escapeHtml(token.content).replace(/\s/g, character => `&#${character.codePointAt(0)};`);
                return `<pre data-xb-html-language="${escapeHtml(language || 'html')}"><code>${code}</code></pre>`;
            },
        });
        return sanitizeMarkdownHtml(html);
    } catch (caughtError) {
        console.warn({ source: import.meta.url, operation: "renderMarkdownToHtml" }, caughtError);
    }

    return escapeHtml(raw).replace(/\n/g, '<br>');
}

export async function copyText(text = '', ownerDocument = null) {
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
    } catch (caughtError) {
        console.debug({ source: import.meta.url, operation: "copyText" }, caughtError);
    }

    try {
        if (win.navigator?.clipboard?.writeText) {
            await win.navigator.clipboard.writeText(normalized);
            return true;
        }
    } catch (caughtError) {
        console.warn({ source: import.meta.url, operation: "copyText" }, caughtError);
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

    Array.from(rootNode.querySelectorAll('pre[data-xb-html-language]')).forEach((placeholder) => {
        const entry = { code: placeholder.textContent, language: placeholder.getAttribute('data-xb-html-language') };

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
    // eslint-disable-next-line no-unsanitized/property -- `html` is sanitized by renderMarkdownToHtml() above before being inserted.
    template.innerHTML = html;
    const fragment = template.content.cloneNode(true);
    enhanceMarkdownContent(fragment, options);
    return fragment;
}
