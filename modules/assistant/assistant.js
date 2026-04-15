import { saveSettingsDebounced, getRequestHeaders } from "../../../../../../script.js";
import { extension_settings } from "../../../../../extensions.js";
import { EXT_ID, extensionFolderPath } from "../../core/constants.js";
import { isTrustedIframeEvent, postToIframe } from "../../core/iframe-messaging.js";

const MODULE_ID = 'assistant';
const OVERLAY_ID = 'xiaobaix-assistant-overlay';
const HTML_PATH = `${extensionFolderPath}/modules/assistant/assistant-overlay.html`;
const MANIFEST_PATH = `${extensionFolderPath}/modules/assistant/assistant-file-manifest.json`;
const TOOL_RESULT = 'xb-assistant:tool-result';
const TOOL_ERROR = 'xb-assistant:tool-error';
const WORKSPACE_PREFIX = 'LittleWhiteBox_Assistant_';
const DEFAULT_WORKSPACE_FILE = `${WORKSPACE_PREFIX}Worklog.md`;
const MAX_CONTENT_CACHE_ENTRIES = 48;

let overlay = null;
let manifestCache = null;
const contentCache = new Map();
const activeToolControllers = new Map();

function getAssistantSettings() {
    extension_settings[EXT_ID] = extension_settings[EXT_ID] || {};
    extension_settings[EXT_ID].assistant = extension_settings[EXT_ID].assistant || {
        enabled: false,
        provider: 'openai-compatible',
        workspaceFileName: DEFAULT_WORKSPACE_FILE,
        modelConfigs: {
            'openai-responses': {
                baseUrl: 'https://api.openai.com/v1',
                model: 'gpt-4.1-mini',
                apiKey: '',
                temperature: 0.2,
            },
            'openai-compatible': {
                baseUrl: 'https://api.openai.com/v1',
                model: 'gpt-4o-mini',
                apiKey: '',
                temperature: 0.2,
                toolMode: 'native',
            },
            anthropic: {
                baseUrl: 'https://api.anthropic.com/v1',
                model: 'claude-sonnet-4-0',
                apiKey: '',
                temperature: 0.2,
            },
            google: {
                baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
                model: 'gemini-2.5-pro',
                apiKey: '',
                temperature: 0.2,
            },
        },
    };
    return extension_settings[EXT_ID].assistant;
}

function buildRuntimeConfig() {
    const settings = getAssistantSettings();
    return {
        enabled: !!settings.enabled,
        provider: settings.provider || 'openai-compatible',
        workspaceFileName: settings.workspaceFileName || DEFAULT_WORKSPACE_FILE,
        modelConfigs: settings.modelConfigs || {},
        toolInfo: {
            readableSources: ['littlewhitebox', 'sillytavern-public'],
            writableWorkspacePrefix: WORKSPACE_PREFIX,
        },
    };
}

function getCachedContent(cacheKey) {
    if (!contentCache.has(cacheKey)) return null;
    const cached = contentCache.get(cacheKey);
    contentCache.delete(cacheKey);
    contentCache.set(cacheKey, cached);
    return cached;
}

function setCachedContent(cacheKey, text) {
    if (contentCache.has(cacheKey)) {
        contentCache.delete(cacheKey);
    }
    contentCache.set(cacheKey, text);
    while (contentCache.size > MAX_CONTENT_CACHE_ENTRIES) {
        const oldestKey = contentCache.keys().next().value;
        if (!oldestKey) break;
        contentCache.delete(oldestKey);
    }
}

async function loadManifest(signal) {
    if (manifestCache) return manifestCache;
    const response = await fetch(MANIFEST_PATH, {
        cache: 'no-cache',
        signal,
    });
    if (!response.ok) {
        throw new Error(`manifest_load_failed:${response.status}`);
    }
    manifestCache = await response.json();
    return manifestCache;
}

function normalizeWorkspaceName(input) {
    const raw = String(input || DEFAULT_WORKSPACE_FILE).trim() || DEFAULT_WORKSPACE_FILE;
    const sanitized = raw.replace(/[^a-zA-Z0-9_.-]/g, '_').replace(/^_+/, '');
    const prefixed = sanitized.startsWith(WORKSPACE_PREFIX) ? sanitized : `${WORKSPACE_PREFIX}${sanitized}`;
    return prefixed || DEFAULT_WORKSPACE_FILE;
}

function ensureNotAborted(signal) {
    if (signal?.aborted) {
        throw new Error('tool_aborted');
    }
}

async function readTextFile(publicPath, options = {}) {
    const cacheKey = String(publicPath || '').trim();
    if (!cacheKey) throw new Error('empty_path');
    const cached = getCachedContent(cacheKey);
    if (cached !== null) return cached;

    const response = await fetch(`/${cacheKey}`, {
        cache: 'no-cache',
        signal: options.signal,
    });
    if (!response.ok) {
        throw new Error(`file_read_failed:${response.status}`);
    }
    const text = await response.text();
    setCachedContent(cacheKey, text);
    return text;
}

function makeSnippet(text, query) {
    const lowered = text.toLowerCase();
    const loweredQuery = query.toLowerCase();
    const index = lowered.indexOf(loweredQuery);
    if (index < 0) return '';

    const start = Math.max(0, index - 120);
    const end = Math.min(text.length, index + loweredQuery.length + 120);
    return text.slice(start, end).replace(/\s+/g, ' ').trim();
}

async function listFiles(args = {}, options = {}) {
    const manifest = await loadManifest(options.signal);
    const query = String(args.query || '').trim().toLowerCase();
    const limit = Math.max(1, Math.min(Number(args.limit) || 20, 100));
    const files = Array.isArray(manifest.files) ? manifest.files : [];
    const matched = files.filter((entry) => {
        if (!query) return true;
        return entry.publicPath.toLowerCase().includes(query)
            || entry.relativePath.toLowerCase().includes(query)
            || entry.source.toLowerCase().includes(query);
    });
    return {
        total: matched.length,
        items: matched.slice(0, limit),
        truncated: matched.length > limit,
    };
}

async function readFile(args = {}, options = {}) {
    const manifest = await loadManifest(options.signal);
    const targetPath = String(args.path || '').trim();
    const entry = (manifest.files || []).find((item) => item.publicPath === targetPath);
    if (!entry) {
        throw new Error('file_not_indexed');
    }
    const content = await readTextFile(entry.publicPath, options);
    return {
        path: entry.publicPath,
        source: entry.source,
        content,
    };
}

async function searchFiles(args = {}, options = {}) {
    const manifest = await loadManifest(options.signal);
    const query = String(args.query || '').trim();
    if (!query) throw new Error('empty_query');

    const limit = Math.max(1, Math.min(Number(args.limit) || 10, 30));
    const concurrency = 6;
    const loweredQuery = query.toLowerCase();
    const files = Array.isArray(manifest.files) ? manifest.files : [];
    const results = [];
    let scannedFiles = 0;
    let truncated = false;

    for (let index = 0; index < files.length; index += concurrency) {
        ensureNotAborted(options.signal);
        if (results.length >= limit) break;
        const batch = files.slice(index, index + concurrency);
        scannedFiles += batch.length;
        const batchResults = await Promise.all(batch.map(async (entry) => {
            try {
                const text = await readTextFile(entry.publicPath, options);
                if (!text.toLowerCase().includes(loweredQuery)) return null;
                return {
                    path: entry.publicPath,
                    source: entry.source,
                    snippet: makeSnippet(text, query),
                };
            } catch {
                // Ignore unreadable files and continue searching.
                return null;
            }
        }));

        for (const item of batchResults) {
            if (!item) continue;
            results.push(item);
            if (results.length >= limit) {
                truncated = true;
                break;
            }
        }
    }

    return {
        query,
        total: results.length,
        items: results,
        truncated,
        scannedFiles: Math.min(scannedFiles, files.length),
        indexedFiles: files.length,
    };
}

function encodeBase64Utf8(value) {
    return btoa(String.fromCharCode(...new TextEncoder().encode(value)));
}

async function writeWorkspaceNote(args = {}, options = {}) {
    const settings = getAssistantSettings();
    const name = normalizeWorkspaceName(args.name || settings.workspaceFileName || DEFAULT_WORKSPACE_FILE);
    const content = String(args.content || '');
    const response = await fetch('/api/files/upload', {
        method: 'POST',
        signal: options.signal,
        headers: {
            ...getRequestHeaders(),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name,
            data: encodeBase64Utf8(content),
        }),
    });

    if (!response.ok) {
        const message = await response.text().catch(() => '');
        throw new Error(`workspace_write_failed:${response.status}:${message}`);
    }

    const data = await response.json();
    return {
        name,
        path: data.path || `user/files/${name}`,
    };
}

async function readWorkspaceNote(_args = {}, options = {}) {
    const settings = getAssistantSettings();
    const name = normalizeWorkspaceName(settings.workspaceFileName || DEFAULT_WORKSPACE_FILE);
    const response = await fetch(`/user/files/${encodeURIComponent(name)}`, {
        cache: 'no-cache',
        signal: options.signal,
        headers: {
            ...getRequestHeaders(),
        },
    });

    if (response.status === 404) {
        return {
            name,
            exists: false,
            content: '',
        };
    }

    if (!response.ok) {
        throw new Error(`workspace_read_failed:${response.status}`);
    }

    return {
        name,
        exists: true,
        content: await response.text(),
    };
}

async function executeToolCall(name, args, options = {}) {
    switch (name) {
        case 'list_files':
            return await listFiles(args, options);
        case 'read_file':
            return await readFile(args, options);
        case 'search_files':
            return await searchFiles(args, options);
        case 'read_workspace_note':
            return await readWorkspaceNote(args, options);
        case 'write_workspace_note':
            return await writeWorkspaceNote(args, options);
        default:
            throw new Error(`unsupported_tool:${name}`);
    }
}

function openAssistant() {
    if (document.getElementById(OVERLAY_ID)) return;

    overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.style.cssText = `
        position: fixed;
        inset: 0;
        width: 100vw;
        height: ${window.innerHeight}px;
        padding: 28px;
        box-sizing: border-box;
        background: rgba(10, 16, 25, 0.12);
        backdrop-filter: blur(2px);
        z-index: 99999;
        overflow: hidden;
    `;

    const updateOverlayHeight = () => {
        if (overlay && overlay.style.display !== 'none') {
            overlay.style.height = `${window.innerHeight}px`;
            if (!window.matchMedia('(max-width: 900px)').matches) {
                const rect = shell.getBoundingClientRect();
                applyShellBounds(rect.width, rect.height);
            }
        }
    };

    const shell = document.createElement('div');
    shell.style.cssText = `
        position: absolute;
        width: min(1480px, calc(100vw - 96px));
        height: min(980px, calc(100vh - 96px));
        max-width: calc(100vw - 96px);
        max-height: calc(100vh - 96px);
        min-width: min(560px, calc(100vw - 48px));
        min-height: min(640px, calc(100vh - 48px));
        overflow: hidden;
        border-radius: 22px;
        box-shadow: 0 28px 80px rgba(6, 17, 32, 0.22);
        border: 1px solid rgba(255, 255, 255, 0.55);
        background: rgba(238, 243, 248, 0.96);
    `;

    const titleBar = document.createElement('div');
    titleBar.setAttribute('aria-label', '拖动小白助手窗口');
    titleBar.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 52px;
        display: flex;
        align-items: center;
        padding: 0 16px 0 18px;
        box-sizing: border-box;
        background: linear-gradient(180deg, rgba(248, 250, 253, 0.96), rgba(238, 243, 248, 0.88));
        border-bottom: 1px solid rgba(27, 55, 88, 0.12);
        cursor: move;
        user-select: none;
        touch-action: none;
        z-index: 2;
    `;

    const titleText = document.createElement('div');
    titleText.textContent = '小白助手';
    titleText.style.cssText = `
        color: #142033;
        font: 700 14px/1.2 "Microsoft YaHei", sans-serif;
        letter-spacing: 0.02em;
    `;
    titleBar.appendChild(titleText);

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.textContent = '关闭';
    closeButton.setAttribute('aria-label', '关闭小白助手');
    closeButton.style.cssText = `
        position: absolute;
        top: 9px;
        right: 14px;
        z-index: 3;
        border: none;
        border-radius: 999px;
        padding: 10px 14px;
        background: rgba(20, 32, 51, 0.88);
        color: #fff;
        cursor: pointer;
        font: 600 13px/1 "Microsoft YaHei", sans-serif;
        box-shadow: 0 10px 24px rgba(6, 17, 32, 0.22);
    `;
    closeButton.addEventListener('click', () => closeAssistant());

    const resizeHint = document.createElement('div');
    resizeHint.setAttribute('aria-hidden', 'true');
    resizeHint.title = '可拖动右下角调整大小';
    resizeHint.style.cssText = `
        position: absolute;
        right: 0;
        bottom: 0;
        width: 32px;
        height: 32px;
        z-index: 2;
        border-radius: 0 0 22px 0;
        cursor: nwse-resize;
        touch-action: none;
        background:
            linear-gradient(135deg, transparent 46%, rgba(27, 55, 88, 0.18) 46%, rgba(27, 55, 88, 0.18) 56%, transparent 56%),
            linear-gradient(135deg, transparent 62%, rgba(27, 55, 88, 0.28) 62%, rgba(27, 55, 88, 0.28) 72%, transparent 72%),
            linear-gradient(135deg, transparent 78%, rgba(27, 55, 88, 0.42) 78%);
    `;

    const iframe = document.createElement('iframe');
    iframe.src = HTML_PATH;
    iframe.style.cssText = `
        position: absolute;
        top: 52px;
        left: 0;
        display: block;
        width: 100%;
        height: calc(100% - 52px);
        border: none;
        border-radius: 0 0 22px 22px;
        background: #eef3f8;
    `;

    shell.append(titleBar, closeButton, resizeHint, iframe);
    overlay.appendChild(shell);
    document.body.appendChild(overlay);

    const clampShellPosition = (left, top) => {
        const shellRect = shell.getBoundingClientRect();
        const maxLeft = Math.max(0, window.innerWidth - shellRect.width);
        const maxTop = Math.max(0, window.innerHeight - shellRect.height);
        return {
            left: Math.max(0, Math.min(left, maxLeft)),
            top: Math.max(0, Math.min(top, maxTop)),
        };
    };

    const centerShell = () => {
        const width = shell.getBoundingClientRect().width;
        const height = shell.getBoundingClientRect().height;
        const nextLeft = Math.max(0, Math.round((window.innerWidth - width) / 2));
        const nextTop = Math.max(0, Math.round((window.innerHeight - height) / 2));
        shell.style.left = `${nextLeft}px`;
        shell.style.top = `${nextTop}px`;
    };

    const applyShellBounds = (width, height) => {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const maxWidth = Math.max(560, viewportWidth - 96);
        const maxHeight = Math.max(640, viewportHeight - 96);
        const minWidth = Math.min(560, viewportWidth - 48);
        const minHeight = Math.min(640, viewportHeight - 48);
        const nextWidth = Math.max(minWidth, Math.min(width, maxWidth));
        const nextHeight = Math.max(minHeight, Math.min(height, maxHeight));
        shell.style.width = `${nextWidth}px`;
        shell.style.height = `${nextHeight}px`;
        shell.style.maxWidth = `${maxWidth}px`;
        shell.style.maxHeight = `${maxHeight}px`;
        shell.style.minWidth = `${minWidth}px`;
        shell.style.minHeight = `${minHeight}px`;
        const currentLeft = Number.parseFloat(shell.style.left || '0') || 0;
        const currentTop = Number.parseFloat(shell.style.top || '0') || 0;
        const clamped = clampShellPosition(currentLeft, currentTop);
        shell.style.left = `${clamped.left}px`;
        shell.style.top = `${clamped.top}px`;
    };

    centerShell();

    let dragState = null;
    let resizeState = null;
    const stopDrag = () => {
        dragState = null;
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
        window.removeEventListener('pointermove', onDragPointerMove);
        window.removeEventListener('pointerup', stopDrag);
        window.removeEventListener('pointercancel', stopDrag);
    };
    const onDragPointerMove = (event) => {
        if (!dragState) return;
        event.preventDefault();
        const nextLeft = dragState.startLeft + (event.clientX - dragState.startX);
        const nextTop = dragState.startTop + (event.clientY - dragState.startY);
        const clamped = clampShellPosition(nextLeft, nextTop);
        shell.style.left = `${clamped.left}px`;
        shell.style.top = `${clamped.top}px`;
    };
    const stopResize = () => {
        resizeState = null;
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', stopResize);
        window.removeEventListener('pointercancel', stopResize);
    };
    const onPointerMove = (event) => {
        if (!resizeState) return;
        event.preventDefault();
        applyShellBounds(
            resizeState.startWidth + (event.clientX - resizeState.startX),
            resizeState.startHeight + (event.clientY - resizeState.startY),
        );
    };
    titleBar.addEventListener('pointerdown', (event) => {
        if (window.matchMedia('(max-width: 900px)').matches) return;
        if (event.target.closest('button')) return;
        event.preventDefault();
        const rect = shell.getBoundingClientRect();
        dragState = {
            startX: event.clientX,
            startY: event.clientY,
            startLeft: rect.left,
            startTop: rect.top,
        };
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'move';
        window.addEventListener('pointermove', onDragPointerMove);
        window.addEventListener('pointerup', stopDrag);
        window.addEventListener('pointercancel', stopDrag);
    });
    resizeHint.addEventListener('pointerdown', (event) => {
        if (window.matchMedia('(max-width: 900px)').matches) return;
        event.preventDefault();
        event.stopPropagation();
        resizeState = {
            startX: event.clientX,
            startY: event.clientY,
            startWidth: shell.getBoundingClientRect().width,
            startHeight: shell.getBoundingClientRect().height,
        };
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'nwse-resize';
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', stopResize);
        window.addEventListener('pointercancel', stopResize);
    });

    window.addEventListener('resize', updateOverlayHeight);
    window.visualViewport?.addEventListener('resize', updateOverlayHeight);
    overlay._cleanup = () => {
        stopDrag();
        stopResize();
        window.removeEventListener('resize', updateOverlayHeight);
        window.visualViewport?.removeEventListener('resize', updateOverlayHeight);
    };

    if (window.matchMedia('(max-width: 900px)').matches) {
        overlay.style.padding = '0';
        overlay.style.background = 'rgba(10, 16, 25, 0.2)';
        overlay.style.backdropFilter = 'blur(3px)';
        titleBar.style.height = '56px';
        titleBar.style.padding = '0 16px';
        titleBar.style.cursor = 'default';
        shell.style.width = '100vw';
        shell.style.height = '100vh';
        shell.style.maxWidth = '100vw';
        shell.style.maxHeight = '100vh';
        shell.style.minWidth = '100vw';
        shell.style.minHeight = '100vh';
        shell.style.left = '0';
        shell.style.top = '0';
        shell.style.borderRadius = '0';
        shell.style.border = 'none';
        closeButton.style.top = '12px';
        closeButton.style.right = '12px';
        resizeHint.style.display = 'none';
        iframe.style.top = '56px';
        iframe.style.height = 'calc(100% - 56px)';
        iframe.style.borderRadius = '0';
    }

    // Guarded inside handleIframeMessage via isTrustedIframeEvent.
    // eslint-disable-next-line no-restricted-syntax
    window.addEventListener('message', handleIframeMessage);
}

function closeAssistant() {
    window.removeEventListener('message', handleIframeMessage);
    const overlayEl = document.getElementById(OVERLAY_ID);
    if (overlayEl) {
        overlayEl._cleanup?.();
        overlayEl.remove();
    }
    overlay = null;
}

async function handleIframeMessage(event) {
    const iframe = overlay?.querySelector('iframe');
    if (!isTrustedIframeEvent(event, iframe)) return;
    if (!event.data?.type?.startsWith('xb-assistant:')) return;

    const { type, payload } = event.data;

    switch (type) {
        case 'xb-assistant:ready': {
            let fileCount = 0;
            try {
                const manifest = await loadManifest();
                fileCount = Array.isArray(manifest.files) ? manifest.files.length : 0;
            } catch {
                fileCount = 0;
            }
            postToIframe(iframe, {
                type: 'xb-assistant:config',
                payload: {
                    config: buildRuntimeConfig(),
                    runtime: {
                        moduleId: MODULE_ID,
                        extensionPath: extensionFolderPath,
                        indexedFileCount: fileCount,
                    },
                },
            });
            break;
        }
        case 'xb-assistant:close':
            closeAssistant();
            break;
        case 'xb-assistant:save-config': {
            const settings = getAssistantSettings();
            const patch = payload && typeof payload === 'object' ? payload : {};
            settings.provider = patch.provider || settings.provider;
            settings.workspaceFileName = normalizeWorkspaceName(patch.workspaceFileName || settings.workspaceFileName);
            settings.modelConfigs = {
                ...(settings.modelConfigs || {}),
                ...(patch.modelConfigs || {}),
            };
            saveSettingsDebounced();
            postToIframe(iframe, {
                type: 'xb-assistant:config-saved',
                payload: {
                    config: buildRuntimeConfig(),
                },
            });
            break;
        }
        case 'xb-assistant:tool-call': {
            const requestId = payload?.requestId || '';
            const toolName = payload?.name || '';
            const args = payload?.arguments || {};
            const controller = new AbortController();
            activeToolControllers.set(requestId, controller);
            try {
                const result = await executeToolCall(toolName, args, { signal: controller.signal });
                postToIframe(iframe, {
                    type: TOOL_RESULT,
                    payload: { requestId, name: toolName, result },
                });
            } catch (error) {
                postToIframe(iframe, {
                    type: TOOL_ERROR,
                    payload: {
                        requestId,
                        name: toolName,
                        error: error instanceof Error ? error.message : String(error || 'unknown_error'),
                    },
                });
            } finally {
                activeToolControllers.delete(requestId);
            }
            break;
        }
        case 'xb-assistant:tool-abort': {
            const requestId = payload?.requestId || '';
            activeToolControllers.get(requestId)?.abort();
            break;
        }
        default:
            break;
    }
}

export async function initAssistant() {
    const settings = getAssistantSettings();
    window.xiaobaixAssistant = {
        openSettings: openAssistant,
        closeSettings: closeAssistant,
        getSettings: () => ({ ...settings }),
    };
}

export function cleanupAssistant() {
    closeAssistant();
    delete window.xiaobaixAssistant;
}
