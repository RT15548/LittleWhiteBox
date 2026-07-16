import type { Ref } from 'vue';
import { enhanceMarkdownContent, renderMarkdownToHtml } from '../../../../agent-core/ui/message-markdown.js';
import { postToIframe } from '../../../../../core/iframe-messaging.js';
import { getIframeBaseScript, getWrapperScript } from '../../../../../core/wrapper-inline.js';
import { createTavernDrawMarkdownImageEnhancer } from '../../features/draw/draw-markdown-images';
import {
    normalizeActionCheckRenderGroups,
    type TavernActionCheckRenderGroup,
    type TavernActionCheckRuntimeEvent,
} from '../../../shared/runtime-events';

const TAVERN_IMAGE_MARKER_REGEX = /\[tavern-image:([a-z0-9\-_]+)\]/gi;
const TAVERN_INLINE_IMAGE_TOKEN_REGEX = /\[(?:img|图片)\s*:\s*([^\]]+)\]/gi;
export const TAVERN_INLINE_IMAGE_PROGRESS_EVENT = 'xb-tavern:inline-image-progress';

export interface TavernMarkdownToolsOptions {
    chatScrollRef: Ref<HTMLElement | null>;
    managerScrollRef: Ref<HTMLElement | null>;
    managerWorkRef?: Ref<HTMLElement | null>;
    htmlRenderEnabled: Ref<boolean>;
    htmlThemeDark: Ref<boolean>;
    alertDialog: (options: { title?: string; message?: string; confirmText?: string; tone?: 'default' | 'danger' | 'warning' } | string) => Promise<void>;
    confirmDialog: (options: { title?: string; message?: string; confirmText?: string; cancelText?: string; tone?: 'default' | 'danger' | 'warning' } | string) => Promise<boolean>;
    requestHost: (type: string, payload?: { payload?: object }) => Promise<{ result?: unknown } & Record<string, unknown>>;
    getHtmlFrameAvatarUrls?: () => { user?: string; char?: string };
    showToast?: (message: string, options?: { tone?: 'info' | 'warning' | 'danger'; durationMs?: number }) => void;
    preserveChatScroll?: <T>(mutation: () => T) => T;
}

export interface TavernRoleplayMarkdownOptions {
    roleplay?: boolean;
    userName?: string;
    characterName?: string;
}

function normalizeDisplayName(value = '', fallback = '') {
    return String(value || '').trim() || fallback;
}

function replaceRoleplayMacros(text = '', options: TavernRoleplayMarkdownOptions = {}) {
    const userName = normalizeDisplayName(options.userName, 'User');
    const characterName = normalizeDisplayName(options.characterName, '角色');
    return String(text || '')
        .replace(/<\s*user\s*>/gi, userName)
        .replace(/<\s*(?:char|bot)\s*>/gi, characterName)
        .replace(/\{\{\s*user\s*\}\}/gi, userName)
        .replace(/\{\{\s*(?:char|bot)\s*\}\}/gi, characterName);
}

export function preprocessTavernRoleplayMarkdown(text = '', options: TavernRoleplayMarkdownOptions = {}) {
    return replaceRoleplayMacros(text, options);
}

const TAVERN_HTML_IFRAME_SELECTOR = 'iframe.xb-tavern-html-iframe';
const TAVERN_HTML_PRE_SELECTOR = 'pre[data-xb-tavern-html-final="true"], pre[data-xb-tavern-html-pending="true"]';
const TAVERN_HTML_GENERATE_RELAY_TIMEOUT_MS = 300_000;
const TAVERN_HTML_CODE_LANGUAGES = new Set(['html', 'htm', 'xhtml', 'xml', 'svg', 'vue', 'svelte']);
const TAVERN_HTML_FRAGMENT_START_REGEX = /^\s*(?:<!--[\s\S]*?-->\s*)*<(?:style|link|meta|svg|iframe|canvas|img|video|audio|picture|div|section|main|article|header|footer|nav|aside|p|span|button|input|textarea|select|label|ul|ol|li|table|thead|tbody|tr|td|th|form|figure|figcaption|details|summary|dialog|h[1-6])\b/i;
const TAVERN_HTML_GENERATE_RESPONSE_TYPES = new Set([
    'generatePromptPreview',
    'generateStreamStart',
    'generateStreamChunk',
    'generateStreamComplete',
    'generateStreamError',
    'generateResult',
    'generateError',
]);

function extractTavernExternalHtmlUrl(content = '') {
    const trimmed = String(content || '').trim();
    if (!trimmed) {return null;}
    if (/^https?:\/\/[^\s]+$/i.test(trimmed)) {return trimmed;}
    const match = trimmed.match(/<!--\s*xb-src:\s*(https?:\/\/[^\s>]+)\s*-->/i);
    return match ? match[1] : null;
}

function djb2(text = '') {
    let hash = 5381;
    for (let index = 0; index < text.length; index += 1) {
        hash = ((hash << 5) + hash) ^ text.charCodeAt(index);
    }
    return (hash >>> 0).toString(16);
}

function looksLikeTavernHtmlFrameContent(html = '') {
    const text = String(html || '').trim();
    if (!text) {return false;}
    if (extractTavernExternalHtmlUrl(text)) {return true;}
    const lower = text.toLowerCase();
    return lower.includes('<!doctype')
        || lower.includes('<html')
        || lower.includes('<script')
        || TAVERN_HTML_FRAGMENT_START_REGEX.test(text);
}

function buildTavernHtmlResourceHints(html = '') {
    const urls = Array.from(new Set((String(html || '').match(/https?:\/\/[^"'()\s]+/gi) || [])
        .map((url) => {
            try {
                return new URL(url).origin;
            } catch {
                return '';
            }
        })
        .filter(Boolean)));
    let hints = '';
    urls.slice(0, 6).forEach((origin) => {
        hints += `<link rel="dns-prefetch" href="${origin}">`;
        hints += `<link rel="preconnect" href="${origin}" crossorigin>`;
    });
    const font = (String(html || '').match(/https?:\/\/[^"'()\s]+\.(?:woff2|woff|ttf|otf)/i) || [])[0];
    if (font) {
        const type = font.endsWith('.woff2') ? 'font/woff2' : font.endsWith('.woff') ? 'font/woff' : font.endsWith('.ttf') ? 'font/ttf' : 'font/otf';
        hints += `<link rel="preload" as="font" href="${font}" type="${type}" crossorigin fetchpriority="high">`;
    }
    const css = (String(html || '').match(/https?:\/\/[^"'()\s]+\.css/i) || [])[0];
    if (css) {
        hints += `<link rel="preload" as="style" href="${css}" crossorigin fetchpriority="high">`;
    }
    const image = (String(html || '').match(/https?:\/\/[^"'()\s]+\.(?:png|jpg|jpeg|webp|gif|svg)/i) || [])[0];
    if (image) {
        hints += `<link rel="preload" as="image" href="${image}" crossorigin fetchpriority="high">`;
    }
    return hints;
}

function getTavernHtmlTheme(themeDark = false) {
    return themeDark ? 'dark' : 'light';
}

function buildTavernHtmlThemeBootstrap(theme: 'dark' | 'light') {
    return `<meta name="color-scheme" content="${theme}"><style id="xb-tavern-html-theme">:root{color-scheme:${theme}}</style><script>(function(){try{var r=document.documentElement;r.dataset.xbTavernTheme='${theme}';r.classList.add('xb-tavern-theme-${theme}');r.style.colorScheme='${theme}';}catch(_){}})();</script>`;
}

function buildTavernHtmlOpeningTag(theme: 'dark' | 'light') {
    return `<html data-xb-tavern-theme="${theme}" class="xb-tavern-theme-${theme}" style="color-scheme:${theme}">`;
}

function applyTavernHtmlThemeAttributes(documentHtml = '', theme: 'dark' | 'light') {
    const themedClass = `xb-tavern-theme-${theme}`;
    return String(documentHtml || '').replace(/<html\b([^>]*)>/i, (_match, rawAttributes = '') => {
        let attributes = String(rawAttributes || '').replace(/\sdata-xb-tavern-theme=(?:"[^"]*"|'[^']*'|[^\s>]*)/i, '');
        if (/\sclass\s*=/.test(attributes)) {
            attributes = attributes.replace(/(\sclass\s*=\s*)(["'])(.*?)\2/i, (_classMatch, prefix, quote, value) => `${prefix}${quote}${String(value || '').trim()} ${themedClass}${quote}`);
        } else {
            attributes += ` class="${themedClass}"`;
        }
        if (/\sstyle\s*=/.test(attributes)) {
            attributes = attributes.replace(/(\sstyle\s*=\s*)(["'])(.*?)\2/i, (_styleMatch, prefix, quote, value) => `${prefix}${quote}${String(value || '').replace(/;\s*$/, '')};color-scheme:${theme}${quote}`);
        } else {
            attributes += ` style="color-scheme:${theme}"`;
        }
        attributes += ` data-xb-tavern-theme="${theme}"`;
        return `<html${attributes}>`;
    });
}

function buildTavernWrappedHtml(html = '', themeDark = false) {
    const source = String(html || '');
    const scripts = `<script>${getWrapperScript()}${getIframeBaseScript()}</script>`;
    const headHints = buildTavernHtmlResourceHints(source);
    const theme = getTavernHtmlTheme(themeDark);
    const themeBootstrap = buildTavernHtmlThemeBootstrap(theme);
    const vhFix = '<style>html,body{height:auto!important;min-height:0!important;max-height:none!important}.profile-container,[style*="100vh"]{height:auto!important;min-height:600px!important}[style*="height:100%"]{height:auto!important;min-height:100%!important}</style>';
    const injection = `${themeBootstrap}${scripts}${headHints}${vhFix}`;
    if (source.includes('<html') && source.includes('</html')) {
        const themedSource = applyTavernHtmlThemeAttributes(source, theme);
        if (themedSource.includes('<head>')) {
            return themedSource.replace('<head>', `<head>${injection}`);
        }
        if (themedSource.includes('</head>')) {
            return themedSource.replace('</head>', `${injection}</head>`);
        }
        return themedSource.replace('<body', `<head>${injection}</head><body`);
    }
    return `<!DOCTYPE html>
${buildTavernHtmlOpeningTag(theme)}
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
${injection}
<style>html,body{margin:0;padding:0;background:transparent}</style>
</head>
<body>${source}</body></html>`;
}

export function useTavernMarkdownTools(options: TavernMarkdownToolsOptions) {
    const markdownHtmlCache = new Map<string, string>();
    const htmlGenerateRelays = new Map<string, { iframe: HTMLIFrameElement; targetOrigin: string; timeoutId: number }>();
    const htmlIframeHeights = new WeakMap<HTMLIFrameElement, number>();
    const htmlIframeHeightFrames = new WeakMap<HTMLIFrameElement, number>();
    const htmlIframeProbeTimers = new Map<HTMLIFrameElement, Set<number>>();
    const releasedHtmlIframes = new WeakSet<HTMLIFrameElement>();

    function preserveChatScroll<T>(mutation: () => T): T {
        return options.preserveChatScroll ? options.preserveChatScroll(mutation) : mutation();
    }

    function isHiddenMarkdownNode(node: Element | null) {
        return !node || !!node.closest('[hidden], [aria-hidden="true"]');
    }

    function canEnhanceMarkdownRoot(node: Element | null): node is HTMLElement {
        return !!node && !isHiddenMarkdownNode(node);
    }

    function canAutoLoadInlineImageSlot(slot: HTMLElement | null): slot is HTMLElement {
        return !!(
            slot
            && slot.isConnected !== false
            && !isHiddenMarkdownNode(slot)
            && !slot.closest('[data-chat-streaming="true"], .pending-user')
        );
    }

    const drawImageEnhancer = createTavernDrawMarkdownImageEnhancer({
        alertDialog: options.alertDialog,
        confirmDialog: options.confirmDialog,
        requestHost: options.requestHost,
        showToast: options.showToast,
        isHiddenMarkdownNode,
    });

    function markdownSignature(text = '') {
        const raw = String(text || '');
        let hash = 0;
        for (let index = 0; index < raw.length; index += 1) {
            hash = ((hash * 31) + raw.charCodeAt(index)) >>> 0;
        }
        return `${raw.length}:${hash.toString(36)}`;
    }

    function renderChatMarkdown(text = '', renderOptions: TavernRoleplayMarkdownOptions = {}) {
        const raw = renderOptions.roleplay
            ? preprocessTavernRoleplayMarkdown(text, renderOptions)
            : String(text || '');
        const markdownOptions = renderOptions.roleplay ? { htmlFenceMode: 'code' } : {};
        const canCache = !/(^|\n)(`{3,}|~{3,})[ \t]*(html|htm|xhtml|xml|svg|vue|svelte)?\b/i.test(raw)
            && !renderOptions.roleplay;
        const cacheKey = markdownSignature(raw);
        if (canCache && markdownHtmlCache.has(cacheKey)) {
            return markdownHtmlCache.get(cacheKey) || '';
        }
        const html = renderMarkdownToHtml(raw, markdownOptions);
        if (canCache && !html.includes('xb-markdown-html-placeholder')) {
            markdownHtmlCache.set(cacheKey, html);
            if (markdownHtmlCache.size > 160) {
                const firstKey = markdownHtmlCache.keys().next().value;
                if (firstKey) {markdownHtmlCache.delete(firstKey);}
            }
        }
        return html;
    }

    function stripTavernImageMarkers(text = '') {
        return String(text || '')
            .replace(TAVERN_IMAGE_MARKER_REGEX, '')
            .replace(TAVERN_INLINE_IMAGE_TOKEN_REGEX, '')
            .trim();
    }

    function clearMarkdownCache() {
        markdownHtmlCache.clear();
    }

    function getTavernHtmlIframeForSource(source: MessageEventSource | null): HTMLIFrameElement | null {
        if (!source) {return null;}
        const roots = [options.chatScrollRef.value, options.managerScrollRef.value, options.managerWorkRef?.value].filter(Boolean) as HTMLElement[];
        for (const root of roots) {
            const frames = Array.from(root.querySelectorAll<HTMLIFrameElement>(TAVERN_HTML_IFRAME_SELECTOR));
            const match = frames.find((iframe) => iframe.contentWindow === source);
            if (match) {return match;}
        }
        return null;
    }

    function getTavernHtmlMessageTargetOrigin(origin: string | null | undefined) {
        const value = String(origin || '').trim();
        return value && value !== 'null' ? value : '*';
    }

    function cloneTavernHtmlMessagePayload<T>(payload: T): T {
        try {
            return JSON.parse(JSON.stringify(payload)) as T;
        } catch {
            return payload;
        }
    }

    function isActiveTavernHtmlIframe(iframe: HTMLIFrameElement) {
        return iframe.isConnected !== false && !releasedHtmlIframes.has(iframe);
    }

    function postToTavernHtmlIframe(iframe: HTMLIFrameElement, payload: Record<string, unknown>, targetOrigin = window.location.origin) {
        if (!isActiveTavernHtmlIframe(iframe)) {return;}
        postToIframe(iframe, payload, undefined, getTavernHtmlMessageTargetOrigin(targetOrigin));
    }

    function postToParentGenerateService(payload: Record<string, unknown>) {
        const safePayload = cloneTavernHtmlMessagePayload(payload);
        // eslint-disable-next-line no-restricted-syntax -- Tavern HTML iframe callGenerate relay to the top-level service.
        window.parent?.postMessage(safePayload, window.location.origin);
    }

    function deleteTavernHtmlGenerateRelay(id: string) {
        const relay = htmlGenerateRelays.get(id);
        if (!relay) {return false;}
        window.clearTimeout(relay.timeoutId);
        htmlGenerateRelays.delete(id);
        return true;
    }

    function clearTavernHtmlGenerateRelaysForIframe(iframe: HTMLIFrameElement) {
        Array.from(htmlGenerateRelays.entries()).forEach(([id, relay]) => {
            if (relay.iframe === iframe) {
                deleteTavernHtmlGenerateRelay(id);
            }
        });
    }

    function clearAllTavernHtmlGenerateRelays() {
        Array.from(htmlGenerateRelays.keys()).forEach((id) => {
            deleteTavernHtmlGenerateRelay(id);
        });
    }

    function clearTavernHtmlIframeProbeTimers(iframe: HTMLIFrameElement) {
        const timers = htmlIframeProbeTimers.get(iframe);
        timers?.forEach((timer) => window.clearTimeout(timer));
        htmlIframeProbeTimers.delete(iframe);
    }

    function releaseTavernHtmlIframeResources(iframe: HTMLIFrameElement) {
        releasedHtmlIframes.add(iframe);
        clearTavernHtmlGenerateRelaysForIframe(iframe);
        clearTavernHtmlIframeProbeTimers(iframe);
        const frameId = htmlIframeHeightFrames.get(iframe);
        if (frameId) {
            window.cancelAnimationFrame(frameId);
            htmlIframeHeightFrames.delete(iframe);
        }
        htmlIframeHeights.delete(iframe);
    }

    function isTavernGenerateRelayResponse(data: Record<string, unknown>) {
        return data.source === 'xiaobaix-host'
            && typeof data.id === 'string'
            && TAVERN_HTML_GENERATE_RESPONSE_TYPES.has(String(data.type || ''));
    }

    function handleTavernGenerateRelayResponse(data: Record<string, unknown>) {
        const id = String(data.id || '');
        const relay = htmlGenerateRelays.get(id);
        if (!relay) {return false;}
        postToTavernHtmlIframe(relay.iframe, data, relay.targetOrigin);
        const type = String(data.type || '');
        if (type === 'generateResult'
            || type === 'generateError'
            || type === 'generateStreamComplete'
            || type === 'generateStreamError') {
            deleteTavernHtmlGenerateRelay(id);
        }
        return true;
    }

    function rememberTavernHtmlGenerateRelay(id: string, iframe: HTMLIFrameElement, targetOrigin: string) {
        if (!isActiveTavernHtmlIframe(iframe)) {return;}
        deleteTavernHtmlGenerateRelay(id);
        const timeoutId = window.setTimeout(() => {
            const relay = htmlGenerateRelays.get(id);
            if (relay?.iframe === iframe) {
                htmlGenerateRelays.delete(id);
            }
        }, TAVERN_HTML_GENERATE_RELAY_TIMEOUT_MS);
        htmlGenerateRelays.set(id, { iframe, targetOrigin, timeoutId });
    }

    function removeTavernHtmlWrapper(wrapper: Element | null | undefined) {
        if (!wrapper?.classList.contains('xb-tavern-html-wrapper')) {return;}
        const iframe = wrapper.querySelector<HTMLIFrameElement>(TAVERN_HTML_IFRAME_SELECTOR);
        if (iframe) {
            releaseTavernHtmlIframeResources(iframe);
        }
        preserveChatScroll(() => {
            wrapper.remove();
        });
    }

    function applyTavernHtmlIframeHeight(iframe: HTMLIFrameElement, height: unknown, force = false) {
        if (!isActiveTavernHtmlIframe(iframe)) {return;}
        const next = Math.max(0, Number(height) || 0);
        if (next < 1) {return;}
        const rounded = Math.ceil(next);
        const previous = htmlIframeHeights.get(iframe) || 0;
        if (!force && Math.abs(rounded - previous) < 1) {return;}
        htmlIframeHeights.set(iframe, rounded);
        const previousFrame = htmlIframeHeightFrames.get(iframe);
        if (previousFrame) {
            window.cancelAnimationFrame(previousFrame);
        }
        const frameId = window.requestAnimationFrame(() => {
            htmlIframeHeightFrames.delete(iframe);
            if (!isActiveTavernHtmlIframe(iframe)) {return;}
            preserveChatScroll(() => {
                iframe.style.height = `${rounded}px`;
            });
        });
        htmlIframeHeightFrames.set(iframe, frameId);
    }

    function probeTavernHtmlIframe(iframe: HTMLIFrameElement, delay = 0) {
        const send = () => {
            if (!isActiveTavernHtmlIframe(iframe)) {return;}
            try {
                postToIframe(iframe, { type: 'probe' }, undefined, window.location.origin);
            } catch {
                // Height probes are best effort; the iframe base script also reports on load/resize.
            }
        };
        if (delay > 0) {
            const timers = htmlIframeProbeTimers.get(iframe) || new Set<number>();
            const timer = window.setTimeout(() => {
                timers.delete(timer);
                if (!timers.size) {
                    htmlIframeProbeTimers.delete(iframe);
                }
                send();
            }, delay);
            timers.add(timer);
            htmlIframeProbeTimers.set(iframe, timers);
            return;
        }
        send();
    }

    function handleTavernHtmlIframeMessage(event: MessageEvent) {
        const topData = event.data && typeof event.data === 'object'
            ? event.data as Record<string, unknown>
            : {};
        if (event.source === window.parent && isTavernGenerateRelayResponse(topData)) {
            handleTavernGenerateRelayResponse(topData);
            return;
        }
        const iframe = getTavernHtmlIframeForSource(event.source);
        if (!iframe) {return;}
        const replyOrigin = getTavernHtmlMessageTargetOrigin(event.origin);
        const data = event.data && typeof event.data === 'object'
            ? event.data as Record<string, unknown>
            : {};
        if (typeof data.height === 'number') {
            applyTavernHtmlIframeHeight(iframe, data.height, !!data.force);
            return;
        }
        if (data.type === 'getAvatars') {
            const urls = options.getHtmlFrameAvatarUrls?.() || {};
            postToTavernHtmlIframe(iframe, {
                source: 'xiaobaix-host',
                type: 'avatars',
                urls: {
                    user: String(urls.user || ''),
                    char: String(urls.char || ''),
                },
            }, replyOrigin);
            return;
        }
        if (data.type === 'runCommand') {
            const id = String(data.id || '');
            const command = String(data.command || '');
            void options.requestHost('xb-tavern:run-slash-command', { payload: { command } })
                .then((response) => {
                    const result = (response.result || response) as Record<string, unknown>;
                    postToTavernHtmlIframe(iframe, {
                        source: 'xiaobaix-host',
                        type: 'commandResult',
                        id,
                        result,
                    }, replyOrigin);
                })
                .catch((error) => {
                    postToTavernHtmlIframe(iframe, {
                        source: 'xiaobaix-host',
                        type: 'commandError',
                        id,
                        error: error instanceof Error ? error.message : String(error || 'slash_command_failed'),
                    }, replyOrigin);
                });
            return;
        }
        if (data.type === 'generateRequest') {
            const id = String(data.id || '');
            if (!id) {return;}
            rememberTavernHtmlGenerateRelay(id, iframe, replyOrigin);
            postToParentGenerateService({
                type: 'generateRequest',
                id,
                options: data.options && typeof data.options === 'object' ? data.options : {},
            });
        }
    }

    function cleanupTavernHtmlPre(pre: HTMLPreElement) {
        const previous = pre.previousElementSibling;
        removeTavernHtmlWrapper(previous);
        pre.style.display = '';
        delete pre.dataset.xbTavernHtmlFinal;
        delete pre.dataset.xbTavernHtmlHash;
        delete pre.dataset.xbTavernHtmlPending;
    }

    async function fetchTavernExternalHtml(url: string) {
        try {
            const response = await fetch(url, { mode: 'cors' });
            if (response.ok) {return await response.text();}
        } catch {
            // Match the body renderer: CORS fetch failure falls back to direct iframe navigation.
        }
        return null;
    }

    async function replaceTavernHtmlRenderVariables(html = '') {
        const source = String(html || '');
        if (!source.includes('{{xbgetvar::')) {return source;}
        try {
            const response = await options.requestHost('xb-tavern:replace-html-render-vars', { payload: { html: source } });
            const result = response.result && typeof response.result === 'object'
                ? response.result as Record<string, unknown>
                : response as Record<string, unknown>;
            return typeof result.html === 'string' ? result.html : source;
        } catch (error) {
            console.warn('[LittleWhiteBox Tavern] xbgetvar macro replacement failed:', error);
            return source;
        }
    }

    async function loadTavernExternalHtmlUrl(iframe: HTMLIFrameElement, url: string) {
        try {
            if (!isActiveTavernHtmlIframe(iframe)) {return;}
            iframe.srcdoc = '<!DOCTYPE html><html><body style="display:flex;justify-content:center;align-items:center;height:100px;color:#888;font-family:sans-serif;background:transparent">加载中...</body></html>';

            let html = await fetchTavernExternalHtml(url);
            if (!isActiveTavernHtmlIframe(iframe)) {return;}
            if (html) {
                html = await replaceTavernHtmlRenderVariables(html);
                if (!isActiveTavernHtmlIframe(iframe)) {return;}
                iframe.srcdoc = buildTavernWrappedHtml(html, options.htmlThemeDark.value);
                probeTavernHtmlIframe(iframe, 100);
                return;
            }

            iframe.removeAttribute('srcdoc');
            iframe.src = url;
            iframe.style.minHeight = '800px';
            iframe.setAttribute('scrolling', 'auto');
        } catch (error) {
            if (!isActiveTavernHtmlIframe(iframe)) {return;}
            console.error('[LittleWhiteBox Tavern] external HTML preview failed:', error);
            iframe.removeAttribute('srcdoc');
            iframe.src = url;
            iframe.style.minHeight = '800px';
            iframe.setAttribute('scrolling', 'auto');
        }
    }

    async function loadTavernHtmlIframeContent(iframe: HTMLIFrameElement, html = '') {
        if (!isActiveTavernHtmlIframe(iframe)) {return;}
        const source = String(html || '');
        const externalUrl = extractTavernExternalHtmlUrl(source);
        if (externalUrl) {
            await loadTavernExternalHtmlUrl(iframe, externalUrl);
            return;
        }
        const replaced = await replaceTavernHtmlRenderVariables(source);
        if (!isActiveTavernHtmlIframe(iframe)) {return;}
        iframe.srcdoc = buildTavernWrappedHtml(replaced, options.htmlThemeDark.value);
        probeTavernHtmlIframe(iframe);
    }

    function renderTavernHtmlPre(pre: HTMLPreElement, html = '', hash = '') {
        const previous = pre.previousElementSibling;
        removeTavernHtmlWrapper(previous);
        const wrapper = document.createElement('div');
        wrapper.className = 'xb-tavern-html-wrapper';
        const iframe = document.createElement('iframe');
        iframe.className = 'xb-tavern-html-iframe';
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('scrolling', 'no');
        iframe.loading = 'eager';
        iframe.style.cssText = 'width:100%;border:none;background:transparent;overflow:hidden;height:0;margin:0;padding:0;display:block;contain:layout paint style;will-change:height;min-height:50px';
        wrapper.append(iframe);
        pre.parentNode?.insertBefore(wrapper, pre);
        pre.style.display = 'none';
        pre.dataset.xbTavernHtmlFinal = 'true';
        pre.dataset.xbTavernHtmlHash = hash;
        delete pre.dataset.xbTavernHtmlPending;
        void loadTavernHtmlIframeContent(iframe, html);
    }

    function markPendingTavernHtmlPreviews(root: HTMLElement) {
        if (!options.htmlRenderEnabled.value) {return;}
        root.querySelectorAll<HTMLElement>('pre > code').forEach((codeBlock) => {
            const pre = codeBlock.parentElement as HTMLPreElement | null;
            if (!pre || pre.dataset.xbTavernHtmlFinal === 'true') {return;}
            if (!isRenderableTavernHtmlCodeBlock(codeBlock)) {return;}
            pre.dataset.xbTavernHtmlPending = 'true';
        });
    }

    function enhanceTavernHtmlCodeBlocks(root: HTMLElement) {
        if (!canEnhanceMarkdownRoot(root)) {return;}
        root.querySelectorAll<HTMLPreElement>(TAVERN_HTML_PRE_SELECTOR).forEach((pre) => {
            if (!options.htmlRenderEnabled.value) {
                cleanupTavernHtmlPre(pre);
            }
        });
        root.querySelectorAll<HTMLElement>('pre > code').forEach((codeBlock) => {
            const pre = codeBlock.parentElement as HTMLPreElement | null;
            if (!pre) {return;}
            if (!isRenderableTavernHtmlCodeBlock(codeBlock)) {
                cleanupTavernHtmlPre(pre);
                return;
            }
            const html = codeBlock.textContent || '';
            if (!looksLikeTavernHtmlFrameContent(html)) {
                cleanupTavernHtmlPre(pre);
                return;
            }
            if (!options.htmlRenderEnabled.value) {
                cleanupTavernHtmlPre(pre);
                return;
            }
            const hash = djb2(html);
            const externalUrl = extractTavernExternalHtmlUrl(html);
            const wrapper = pre.previousElementSibling;
            const same = pre.dataset.xbTavernHtmlFinal === 'true'
                && pre.dataset.xbTavernHtmlHash === hash
                && wrapper?.classList.contains('xb-tavern-html-wrapper')
                && !!wrapper.querySelector(TAVERN_HTML_IFRAME_SELECTOR);
            if (!externalUrl && same) {return;}
            renderTavernHtmlPre(pre, html, hash);
        });
    }

    function isTavernHtmlCodeLanguage(codeBlock: HTMLElement) {
        return Array.from(codeBlock.classList).some((className) => {
            const normalized = String(className || '').replace(/^custom-/, '').replace(/^language-/, '').toLowerCase();
            return TAVERN_HTML_CODE_LANGUAGES.has(normalized);
        });
    }

    function isRenderableTavernHtmlCodeBlock(codeBlock: HTMLElement) {
        return isTavernHtmlCodeLanguage(codeBlock)
            || looksLikeTavernHtmlFrameContent(codeBlock.textContent || '');
    }

    const dialogueQuotePairs: { [key: string]: string } = {
        '"': '"',
        '“': '”',
        '「': '」',
        '『': '』',
    };

    const dialogueQuoteOpeners = new Set(Object.keys(dialogueQuotePairs));
    const dialogueSkipTags = new Set(['A', 'BUTTON', 'CODE', 'KBD', 'PRE', 'SCRIPT', 'STYLE', 'TEXTAREA']);
    const maxInlineDialogueLength = 600;

    function shouldSkipDialogueTextNode(node: Text) {
        let parent = node.parentElement;
        while (parent) {
            if (dialogueSkipTags.has(parent.tagName) || parent.classList.contains('xb-rp-dialogue')) {
                return true;
            }
            parent = parent.parentElement;
        }
        return false;
    }

    function collectDialogueRanges(text: string) {
        const ranges: Array<{ start: number; end: number }> = [];
        let cursor = 0;
        while (cursor < text.length) {
            const opener = text[cursor];
            if (!dialogueQuoteOpeners.has(opener)) {
                cursor += 1;
                continue;
            }
            const closer = dialogueQuotePairs[opener];
            let end = text.indexOf(closer, cursor + 1);
            if (end < 0 || end === cursor + 1 || end - cursor > maxInlineDialogueLength) {
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

    function enhanceRoleplayDialogue(root: HTMLElement) {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
            acceptNode(node) {
                const textNode = node as Text;
                if (!textNode.data || shouldSkipDialogueTextNode(textNode)) {
                    return NodeFilter.FILTER_REJECT;
                }
                return collectDialogueRanges(textNode.data).length
                    ? NodeFilter.FILTER_ACCEPT
                    : NodeFilter.FILTER_SKIP;
            },
        });
        const nodes: Text[] = [];
        while (walker.nextNode()) {
            nodes.push(walker.currentNode as Text);
        }
        nodes.forEach((textNode) => {
            const ranges = collectDialogueRanges(textNode.data);
            if (!ranges.length) {return;}
            const fragment = document.createDocumentFragment();
            let cursor = 0;
            ranges.forEach((range) => {
                if (range.start > cursor) {
                    fragment.append(document.createTextNode(textNode.data.slice(cursor, range.start)));
                }
                const span = document.createElement('span');
                span.className = 'xb-rp-dialogue';
                span.textContent = textNode.data.slice(range.start, range.end);
                fragment.append(span);
                cursor = range.end;
            });
            if (cursor < textNode.data.length) {
                fragment.append(document.createTextNode(textNode.data.slice(cursor)));
            }
            textNode.replaceWith(fragment);
        });
    }

    function normalizeInlineImageTags(raw = '') {
        let text = String(raw || '').trim();
        text = text.replace(/^(nsfw|sketchy)\s*:\s*/i, 'nsfw, ');
        return text.split(',').map((part) => part.trim()).filter(Boolean).join(', ');
    }

    function encodeInlineImageTags(raw = '') {
        return encodeURIComponent(normalizeInlineImageTags(raw));
    }

    function removeAdjacentInlineImageLineBreaks(slot: HTMLElement) {
        const parent = slot.parentNode;
        if (!parent) {return;}

        const pruneSide = (direction: 'previousSibling' | 'nextSibling') => {
            let node = slot[direction];
            while (node?.nodeType === Node.TEXT_NODE && !String(node.textContent || '').trim()) {
                const next = node[direction];
                parent.removeChild(node);
                node = next;
            }
            if (node instanceof HTMLBRElement) {
                const next = node[direction];
                parent.removeChild(node);
                node = next;
                while (node?.nodeType === Node.TEXT_NODE && !String(node.textContent || '').trim()) {
                    const after = node[direction];
                    parent.removeChild(node);
                    node = after;
                }
            }
        };

        pruneSide('previousSibling');
        pruneSide('nextSibling');
    }

    function toInlineImageDataUrl(base64 = '') {
        const value = String(base64 || '').trim();
        if (!value) {return '';}
        return /^data:[^;]+;base64,/i.test(value) ? value : `data:image/png;base64,${value}`;
    }

    function setInlineImageSlotStatus(slot: HTMLElement, text: string, state = 'loading') {
        preserveChatScroll(() => {
            slot.dataset.state = state;
            const placeholder = document.createElement('span');
            placeholder.className = `xb-tavern-inline-image-placeholder is-${state}`;
            placeholder.textContent = text;
            slot.replaceChildren(placeholder);
        });
    }

    function renderInlineImageSlot(slot: HTMLElement, base64 = '') {
        const src = toInlineImageDataUrl(base64);
        if (!src) {
            throw new Error('image_data_missing');
        }
        preserveChatScroll(() => {
            slot.dataset.loaded = '1';
            slot.dataset.loading = '';
            slot.dataset.state = 'loaded';
            const image = document.createElement('img');
            image.className = 'xb-tavern-inline-image-img';
            image.src = src;
            image.loading = 'lazy';
            image.addEventListener('click', () => window.open(src, '_blank'));
            slot.replaceChildren(image);
        });
    }

    function renderInlineImageError(slot: HTMLElement, tags = '', error: unknown) {
        preserveChatScroll(() => {
            slot.dataset.loaded = '1';
            slot.dataset.loading = '';
            slot.dataset.state = 'error';
            const wrap = document.createElement('span');
            wrap.className = 'xb-tavern-inline-image-error';
            const label = document.createElement('span');
            label.textContent = error instanceof Error ? error.message : String(error || '生成失败');
            const retry = document.createElement('button');
            retry.type = 'button';
            retry.textContent = '重试';
            retry.addEventListener('click', (event) => {
                event.stopPropagation();
                slot.dataset.loaded = '';
                void loadInlineImageSlot(slot, tags);
            });
            wrap.append(label, retry);
            slot.replaceChildren(wrap);
        });
    }

    function formatInlineImageProgress(status = '', payload: Record<string, unknown> = {}) {
        const ahead = Math.max(0, Math.floor(Number(payload.ahead) || 0));
        const cooldownSeconds = Math.max(0, Math.floor(Number(payload.delay) || 0));
        if (status === 'queued') {
            return ahead > 0 ? `排队中，前面还有 ${ahead} 张` : '排队中';
        }
        if (status === 'generating') {
            return '正在生成';
        }
        if (status === 'waiting') {
            return cooldownSeconds > 0 ? `等待冷却 ${cooldownSeconds}s` : '等待冷却';
        }
        return '检查缓存...';
    }

    function updateInlineImageProgress(payload: Record<string, unknown> = {}) {
        const tags = normalizeInlineImageTags(String(payload.tags || ''));
        if (!tags) {return;}
        const encodedTags = encodeInlineImageTags(tags);
        const status = String(payload.status || '').trim();
        const text = formatInlineImageProgress(status, payload);
        document.querySelectorAll<HTMLElement>('.xb-tavern-inline-image[data-loading="1"]').forEach((slot) => {
            if (String(slot.dataset.tags || '') !== encodedTags) {return;}
            if (!canAutoLoadInlineImageSlot(slot)) {return;}
            setInlineImageSlotStatus(slot, text, 'loading');
        });
    }

    async function loadInlineImageSlot(slot: HTMLElement, tags = '') {
        const normalizedTags = normalizeInlineImageTags(tags || decodeURIComponent(slot.dataset.tags || ''));
        if (!normalizedTags || slot.dataset.loading === '1' || slot.dataset.loaded === '1' || !canAutoLoadInlineImageSlot(slot)) {return;}
        slot.dataset.tags = encodeInlineImageTags(normalizedTags);
        slot.dataset.loading = '1';
        slot.dataset.loaded = '';
        setInlineImageSlotStatus(slot, '检查缓存...', 'loading');
        try {
            const response = await options.requestHost('xb-tavern:inline-image-generate', {
                payload: { tags: normalizedTags },
            });
            const result = response.result && typeof response.result === 'object'
                ? response.result as Record<string, unknown>
                : response;
            if (!slot.isConnected) {return;}
            renderInlineImageSlot(slot, String(result.base64 || ''));
        } catch (error) {
            if (!slot.isConnected) {return;}
            renderInlineImageError(slot, normalizedTags, error);
        }
    }

    let inlineImageObserver: IntersectionObserver | null = null;

    function ensureInlineImageObserver() {
        if (inlineImageObserver || typeof IntersectionObserver === 'undefined') {return inlineImageObserver;}
        inlineImageObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {return;}
                const slot = entry.target as HTMLElement;
                if (!canAutoLoadInlineImageSlot(slot)) {return;}
                inlineImageObserver?.unobserve(slot);
                void loadInlineImageSlot(slot);
            });
        }, { rootMargin: '200px 0px', threshold: 0.01 });
        return inlineImageObserver;
    }

    function createInlineImageSlot(tags = '') {
        const slot = document.createElement('span');
        slot.className = 'xb-tavern-inline-image';
        slot.dataset.tags = encodeInlineImageTags(tags);
        setInlineImageSlotStatus(slot, '滚动加载', 'idle');
        return slot;
    }

    function hydrateInlineImageSlots(root: HTMLElement) {
        if (!canEnhanceMarkdownRoot(root)) {return;}
        root.querySelectorAll<HTMLElement>('.xb-tavern-inline-image').forEach((slot) => {
            if (slot.dataset.observed === '1' || slot.dataset.loaded === '1' || slot.dataset.loading === '1') {return;}
            if (!canAutoLoadInlineImageSlot(slot)) {return;}
            slot.dataset.observed = '1';
            const observer = ensureInlineImageObserver();
            if (observer) {
                observer.observe(slot);
                return;
            }
            void loadInlineImageSlot(slot);
        });
    }

    function enhanceInlineImageTokens(root: HTMLElement, options: { hydrate?: boolean } = {}) {
        if (!canEnhanceMarkdownRoot(root)) {return;}
        const shouldHydrate = options.hydrate !== false;
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
            acceptNode(node) {
                const textNode = node as Text;
                if (!textNode.data || !TAVERN_INLINE_IMAGE_TOKEN_REGEX.test(textNode.data)) {
                    TAVERN_INLINE_IMAGE_TOKEN_REGEX.lastIndex = 0;
                    return NodeFilter.FILTER_SKIP;
                }
                TAVERN_INLINE_IMAGE_TOKEN_REGEX.lastIndex = 0;
                const parent = textNode.parentElement;
                if (parent?.closest?.('a, button, code, kbd, pre, script, style, textarea, .xb-tavern-image, .xb-tavern-inline-image')) {
                    return NodeFilter.FILTER_REJECT;
                }
                return NodeFilter.FILTER_ACCEPT;
            },
        });
        const nodes: Text[] = [];
        while (walker.nextNode()) {
            nodes.push(walker.currentNode as Text);
        }
        nodes.forEach((textNode) => {
            const text = textNode.data;
            TAVERN_INLINE_IMAGE_TOKEN_REGEX.lastIndex = 0;
            let match: RegExpExecArray | null;
            let lastIndex = 0;
            let replaced = false;
            const fragment = document.createDocumentFragment();
            while ((match = TAVERN_INLINE_IMAGE_TOKEN_REGEX.exec(text)) !== null) {
                replaced = true;
                if (match.index > lastIndex) {
                    const before = text.slice(lastIndex, match.index);
                    fragment.append(document.createTextNode(before.endsWith('\n') ? before.slice(0, -1) : before));
                }
                const tags = normalizeInlineImageTags(match[1] || '');
                fragment.append(createInlineImageSlot(tags));
                lastIndex = TAVERN_INLINE_IMAGE_TOKEN_REGEX.lastIndex;
                if (text[lastIndex] === '\n') {
                    lastIndex += 1;
                }
            }
            if (!replaced) {return;}
            if (lastIndex < text.length) {
                fragment.append(document.createTextNode(text.slice(lastIndex)));
            }
            textNode.replaceWith(fragment);
        });
        root.querySelectorAll<HTMLElement>('.xb-tavern-inline-image').forEach((slot) => {
            removeAdjacentInlineImageLineBreaks(slot);
        });
        if (shouldHydrate) {
            hydrateInlineImageSlots(root);
        }
    }

    function handleInlineImageProgressEvent(event: Event) {
        const payload = event instanceof CustomEvent && event.detail && typeof event.detail === 'object'
            ? event.detail as Record<string, unknown>
            : {};
        updateInlineImageProgress(payload);
    }

    if (typeof window !== 'undefined') {
        window.addEventListener(TAVERN_INLINE_IMAGE_PROGRESS_EVENT, handleInlineImageProgressEvent as EventListener);
        // eslint-disable-next-line no-restricted-syntax -- source is validated by matching event.source to a Tavern HTML iframe.
        window.addEventListener('message', handleTavernHtmlIframeMessage as EventListener);
    }

    function actionCheckOutcomeLabel(event: TavernActionCheckRuntimeEvent) {
        if (event.outcome === 'criticalSuccess') {return '大成功';}
        if (event.outcome === 'criticalFailure') {return '大失败';}
        return event.success ? '判定成功' : '判定失败';
    }

    function actionCheckOutcomeClass(event: TavernActionCheckRuntimeEvent) {
        if (event.outcome === 'criticalSuccess') {return 'is-success is-critical-success';}
        if (event.outcome === 'criticalFailure') {return 'is-failure is-critical-failure';}
        return event.success ? 'is-success' : 'is-failure';
    }

    function actionCheckDifficultyLabel(event: TavernActionCheckRuntimeEvent) {
        if (event.difficultyLabel === 'easy') {return '简单';}
        if (event.difficultyLabel === 'ordinary') {return '普通';}
        if (event.difficultyLabel === 'hard') {return '困难';}
        if (event.difficultyLabel === 'very_hard') {return '极难';}
        if (event.difficultyLabel === 'nearly_impossible') {return '几乎不可能';}
        return String(event.difficulty || '普通');
    }

    function actionCheckNumberLabel(value: unknown): string {
        const number = Number(value);
        if (!Number.isFinite(number)) {return '';}
        return Number.isInteger(number) ? String(number) : number.toFixed(1).replace(/\.0$/, '');
    }

    function actionCheckTitle(event: TavernActionCheckRuntimeEvent) {
        const character = String(event.character || '').trim();
        const stat = String(event.stat || '').trim();
        const statValue = event.mode === 'statusGauge' ? actionCheckNumberLabel(event.statValue) : '';
        const statLabel = statValue ? `${stat} ${statValue}` : stat;
        return character ? `${character} ${statLabel}` : statLabel;
    }

    function buildActionCheckAriaLabel(event: TavernActionCheckRuntimeEvent) {
        const outcome = actionCheckOutcomeLabel(event);
        const action = String(event.action || '').trim();
        const stakes = String(event.stakes || '').trim();
        const isStatusGauge = event.mode === 'statusGauge';
        const title = actionCheckTitle(event);
        return [
            `行动判定：${title}。`,
            isStatusGauge
                ? `掷骰 ${event.roll}，难度${actionCheckDifficultyLabel(event)}。`
                : `掷骰 ${event.roll} 对抗难度 ${event.difficulty}。`,
            `${outcome}。`,
            action ? `行动意图：${action}。` : '',
            stakes ? `风险：${stakes}。` : '',
        ].filter(Boolean).join(' ');
    }

    function createActionCheckCard(event: TavernActionCheckRuntimeEvent) {
        const card = document.createElement('span');
        card.className = `action-check-card ${actionCheckOutcomeClass(event)}`;
        card.setAttribute('role', 'group');
        card.setAttribute('aria-label', buildActionCheckAriaLabel(event));

        const head = document.createElement('span');
        head.className = 'action-check-card-head';

        const title = document.createElement('strong');
        title.textContent = actionCheckTitle(event);
        head.append(title);

        const outcome = document.createElement('span');
        outcome.className = 'action-check-card-outcome';
        outcome.textContent = actionCheckOutcomeLabel(event);
        head.append(outcome);

        const grid = document.createElement('span');
        grid.className = 'action-check-card-grid';
        const isStatusGauge = event.mode === 'statusGauge';
        [{
            className: 'action-check-card-roll',
            label: '掷骰',
            value: String(event.roll),
        }, {
            className: 'action-check-card-dc',
            label: '难度',
            value: isStatusGauge ? actionCheckDifficultyLabel(event) : String(event.difficulty),
        }].forEach((item) => {
            const cell = document.createElement('span');
            cell.className = item.className;
            const label = document.createElement('small');
            label.textContent = item.label;
            const value = document.createElement('strong');
            value.textContent = item.value;
            cell.append(label, value);
            grid.append(cell);
        });

        const copy = document.createElement('span');
        copy.className = 'action-check-card-copy';
        copy.textContent = event.action;

        const children: HTMLElement[] = [head, grid, copy];

        if (event.stakes) {
            const stakes = document.createElement('span');
            stakes.className = 'action-check-card-stakes';
            stakes.textContent = event.stakes;
            children.push(stakes);
        }

        card.append(...children);
        return card;
    }

    function createActionCheckStack(events: TavernActionCheckRuntimeEvent[] = []) {
        const stack = document.createElement('span');
        stack.className = 'assistant-runtime-event-stack';
        stack.setAttribute('role', 'group');
        stack.setAttribute('aria-label', events.length > 1 ? `${events.length} action check results.` : 'Action check result.');
        events.forEach((event) => {
            stack.append(createActionCheckCard(event));
        });
        return stack;
    }

    function readActionCheckRenderGroups(value: unknown): TavernActionCheckRenderGroup[] {
        try {
            return normalizeActionCheckRenderGroups(JSON.parse(String(value || '[]')));
        } catch {
            return [];
        }
    }

    function enhanceActionCheckMarkers(root: HTMLElement) {
        const groups = readActionCheckRenderGroups(root.dataset.actionCheckGroups);
        if (!groups.length) {return;}
        const byMarker = new Map(groups.map((group) => [group.marker, group.events]));
        const markers = new Set(groups.map((group) => group.marker));
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
            acceptNode(node) {
                const textNode = node as Text;
                if (!textNode.data) {
                    return NodeFilter.FILTER_SKIP;
                }
                const parent = textNode.parentElement;
                if (parent?.closest?.('a, button, code, kbd, pre, script, style, textarea, .assistant-runtime-event-stack')) {
                    return NodeFilter.FILTER_REJECT;
                }
                return [...textNode.data].some((char) => markers.has(char))
                    ? NodeFilter.FILTER_ACCEPT
                    : NodeFilter.FILTER_SKIP;
            },
        });
        const nodes: Text[] = [];
        while (walker.nextNode()) {
            nodes.push(walker.currentNode as Text);
        }
        nodes.forEach((textNode) => {
            const fragment = document.createDocumentFragment();
            let replaced = false;
            [...textNode.data].forEach((char) => {
                const events = byMarker.get(char);
                if (events?.length) {
                    fragment.append(createActionCheckStack(events));
                    replaced = true;
                    return;
                }
                fragment.append(document.createTextNode(char));
            });
            if (replaced) {
                textNode.replaceWith(fragment);
            }
        });
    }

    function enhanceStableMarkdownNode(node: HTMLElement, optionsOverride: { live?: boolean } = {}) {
        if (!canEnhanceMarkdownRoot(node)) {return;}
        const signature = node.dataset.markdownSignature || '';
        const marker = optionsOverride.live ? 'markdownLiveEnhanced' : 'markdownEnhanced';
        if (node.dataset[marker] === signature) {return;}
        if (optionsOverride.live) {
            markPendingTavernHtmlPreviews(node);
        } else {
            enhanceTavernHtmlCodeBlocks(node);
        }
        enhanceMarkdownContent(node, {
            codeBlockClassName: 'xb-tavern-codeblock',
            codeCopyClassName: 'xb-tavern-code-copy',
            flattenPreCode: true,
            htmlBlockMode: optionsOverride.live
                ? 'code'
                : options.htmlRenderEnabled.value ? 'preview' : 'code',
            skipPreSelector: TAVERN_HTML_PRE_SELECTOR,
        });
        drawImageEnhancer.enhanceTavernImageMarkers(node);
        enhanceInlineImageTokens(node, { hydrate: !optionsOverride.live });
        enhanceRoleplayDialogue(node);
        enhanceActionCheckMarkers(node);
        node.dataset[marker] = signature;
    }

    function releaseMarkdownRootResources(root: HTMLElement) {
        root.querySelectorAll<HTMLElement>('.xb-tavern-inline-image').forEach((slot) => {
            inlineImageObserver?.unobserve(slot);
            delete slot.dataset.observed;
        });
        root.querySelectorAll<HTMLIFrameElement>(TAVERN_HTML_IFRAME_SELECTOR).forEach((iframe) => {
            releaseTavernHtmlIframeResources(iframe);
        });
    }

    function enhanceChatMarkdown() {
        preserveChatScroll(() => {
            const root = options.chatScrollRef.value;
            if (!root?.querySelectorAll) {return;}
            root.querySelectorAll<HTMLElement>('.xb-tavern-markdown').forEach((node) => {
                if (node.dataset.markdownManaged === 'true') {return;}
                if (node.closest('[data-chat-streaming="true"]')) {return;}
                enhanceStableMarkdownNode(node);
            });
        });
    }

    function enhanceManagerMarkdown() {
        const roots = [options.managerScrollRef.value, options.managerWorkRef?.value].filter(Boolean) as HTMLElement[];
        roots.forEach((root) => {
            if (!root?.querySelectorAll) {return;}
            root.querySelectorAll<HTMLElement>('.xb-tavern-markdown').forEach((node) => {
                if (!canEnhanceMarkdownRoot(node)) {return;}
                const signature = node.dataset.markdownSignature || '';
                if (node.dataset.markdownEnhanced === signature) {return;}
                enhanceTavernHtmlCodeBlocks(node);
                enhanceMarkdownContent(node, {
                    codeBlockClassName: 'xb-tavern-codeblock',
                    codeCopyClassName: 'xb-tavern-code-copy',
                    flattenPreCode: true,
                    htmlBlockMode: options.htmlRenderEnabled.value ? undefined : 'code',
                    skipPreSelector: TAVERN_HTML_PRE_SELECTOR,
                });
                node.dataset.markdownEnhanced = signature;
            });
        });
    }

    return {
        clearMarkdownCache,
        disposeMarkdownTools() {
            inlineImageObserver?.disconnect();
            inlineImageObserver = null;
            htmlIframeProbeTimers.forEach((_timers, iframe) => {
                releaseTavernHtmlIframeResources(iframe);
            });
            clearAllTavernHtmlGenerateRelays();
            drawImageEnhancer.closeTavernImageGallery();
            if (typeof window !== 'undefined') {
                window.removeEventListener(TAVERN_INLINE_IMAGE_PROGRESS_EVENT, handleInlineImageProgressEvent as EventListener);
                window.removeEventListener('message', handleTavernHtmlIframeMessage as EventListener);
            }
        },
        enhanceChatMarkdown,
        enhanceManagerMarkdown,
        enhanceMarkdownRoot: enhanceStableMarkdownNode,
        markdownSignature,
        releaseMarkdownRootResources,
        renderChatMarkdown,
        stripTavernImageMarkers,
    };
}
