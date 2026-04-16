import { getRequestHeaders } from "../../../../../../script.js";
import { extensionFolderPath } from "../../core/constants.js";
import { isTrustedIframeEvent, postToIframe } from "../../core/iframe-messaging.js";
import { AssistantStorage } from "../../core/server-storage.js";

const MODULE_ID = 'assistant';
const OVERLAY_ID = 'xiaobaix-assistant-overlay';
const HTML_PATH = `${extensionFolderPath}/modules/assistant/assistant-overlay.html`;
const MANIFEST_PATH = `${extensionFolderPath}/modules/assistant/assistant-file-manifest.json`;
const TOOL_RESULT = 'xb-assistant:tool-result';
const TOOL_ERROR = 'xb-assistant:tool-error';
const CONFIG_SAVED = 'xb-assistant:config-saved';
const CONFIG_SAVE_ERROR = 'xb-assistant:config-save-error';
const WORKSPACE_PREFIX = 'LittleWhiteBox_Assistant_';
const DEFAULT_WORKSPACE_FILE = `${WORKSPACE_PREFIX}Worklog.md`;
const MAX_CONTENT_CACHE_ENTRIES = 48;
const MAX_READ_FILE_BYTES = 100 * 1024;
const SERVER_FILE_KEY = 'settings';
const CONFIG_VERSION = 1;
const DEFAULT_PRESET_NAME = '默认';

const DEFAULT_MODEL_CONFIGS = {
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
};

let overlay = null;
let manifestCache = null;
const contentCache = new Map();
const activeToolControllers = new Map();
let settingsCache = null;
let settingsLoaded = false;

function cloneDefaultModelConfigs() {
    return JSON.parse(JSON.stringify(DEFAULT_MODEL_CONFIGS));
}

function buildDefaultPreset() {
    return {
        provider: 'openai-compatible',
        modelConfigs: cloneDefaultModelConfigs(),
    };
}

function normalizePresetName(input) {
    const normalized = String(input || '').trim();
    return normalized || DEFAULT_PRESET_NAME;
}

function normalizeModelConfigs(savedConfigs = {}) {
    const next = cloneDefaultModelConfigs();
    Object.keys(DEFAULT_MODEL_CONFIGS).forEach((provider) => {
        next[provider] = {
            ...DEFAULT_MODEL_CONFIGS[provider],
            ...((savedConfigs && typeof savedConfigs[provider] === 'object') ? savedConfigs[provider] : {}),
        };
    });
    return next;
}

function normalizeAssistantSettings(saved = {}) {
    const legacyPresetName = normalizePresetName(saved.currentPresetName || saved.presetName || DEFAULT_PRESET_NAME);
    const presetSource = (saved && typeof saved.presets === 'object' && saved.presets)
        ? saved.presets
        : (saved?.modelConfigs
            ? {
                [legacyPresetName]: {
                    provider: saved.provider || 'openai-compatible',
                    modelConfigs: saved.modelConfigs,
                },
            }
            : {});

    const presets = {};
    Object.entries(presetSource).forEach(([rawName, rawPreset]) => {
        if (!rawPreset || typeof rawPreset !== 'object') return;
        const name = normalizePresetName(rawName);
        presets[name] = {
            provider: typeof rawPreset.provider === 'string' && rawPreset.provider.trim()
                ? rawPreset.provider
                : 'openai-compatible',
            modelConfigs: normalizeModelConfigs(rawPreset.modelConfigs || {}),
        };
    });

    if (!Object.keys(presets).length) {
        presets[DEFAULT_PRESET_NAME] = buildDefaultPreset();
    }

    const currentPresetName = presets[normalizePresetName(saved.currentPresetName)]
        ? normalizePresetName(saved.currentPresetName)
        : Object.keys(presets)[0];

    return {
        enabled: !!saved.enabled,
        workspaceFileName: normalizeWorkspaceName(saved.workspaceFileName || DEFAULT_WORKSPACE_FILE),
        currentPresetName,
        presets,
        updatedAt: Number(saved.updatedAt) || 0,
        configVersion: Number(saved.configVersion) || 0,
    };
}

async function persistAssistantSettings(settings, { silent = true } = {}) {
    const next = normalizeAssistantSettings({
        ...settings,
        updatedAt: Date.now(),
        configVersion: CONFIG_VERSION,
    });
    settingsCache = next;

    try {
        const data = await AssistantStorage.load();
        data[SERVER_FILE_KEY] = next;
        AssistantStorage._dirtyVersion = (AssistantStorage._dirtyVersion || 0) + 1;
        await AssistantStorage.saveNow({ silent });
        return { ok: true, settings: next };
    } catch (error) {
        return {
            ok: false,
            settings: next,
            error: error instanceof Error ? error.message : String(error || 'unknown_error'),
        };
    }
}

async function loadAssistantSettings() {
    if (settingsLoaded && settingsCache) return settingsCache;

    try {
        const saved = await AssistantStorage.get(SERVER_FILE_KEY, null);
        settingsCache = normalizeAssistantSettings(saved || {});

        if (!saved || settingsCache.configVersion !== CONFIG_VERSION) {
            await persistAssistantSettings(settingsCache, { silent: true });
        }
    } catch {
        settingsCache = normalizeAssistantSettings({});
    }

    settingsLoaded = true;
    return settingsCache;
}

function getAssistantSettings() {
    if (!settingsCache) {
        settingsCache = normalizeAssistantSettings({});
    }
    return settingsCache;
}

function buildRuntimeConfig() {
    const settings = getAssistantSettings();
    const currentPreset = settings.presets?.[settings.currentPresetName] || buildDefaultPreset();
    return {
        enabled: !!settings.enabled,
        provider: currentPreset.provider || 'openai-compatible',
        workspaceFileName: settings.workspaceFileName || DEFAULT_WORKSPACE_FILE,
        modelConfigs: currentPreset.modelConfigs || cloneDefaultModelConfigs(),
        currentPresetName: settings.currentPresetName || DEFAULT_PRESET_NAME,
        presetNames: Object.keys(settings.presets || {}),
        presets: settings.presets || {},
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
    const sizeBytes = new TextEncoder().encode(content).length;
    if (sizeBytes > MAX_READ_FILE_BYTES) {
        const lineCount = content === '' ? 0 : content.split('\n').length;
        throw new Error(`file_too_large:${sizeBytes}:${lineCount}`);
    }
    return {
        path: entry.publicPath,
        source: entry.source,
        content,
    };
}

async function readFileRange(args = {}, options = {}) {
    const manifest = await loadManifest(options.signal);
    const targetPath = String(args.path || '').trim();
    const entry = (manifest.files || []).find((item) => item.publicPath === targetPath);
    if (!entry) {
        throw new Error('file_not_indexed');
    }

    const fullContent = await readTextFile(entry.publicPath, options);
    const lines = fullContent === '' ? [] : fullContent.split('\n');
    const totalLines = lines.length;
    const requestedStart = Math.max(1, Number(args.startLine) || 1);
    const requestedEnd = Math.max(requestedStart, Number(args.endLine) || Math.min(requestedStart + 199, requestedStart + 199));
    const maxRange = 400;
    const startLine = Math.min(requestedStart, Math.max(totalLines, 1));
    const endLine = Math.min(requestedEnd, startLine + maxRange - 1, Math.max(totalLines, 1));

    if (totalLines === 0) {
        return {
            path: entry.publicPath,
            source: entry.source,
            totalLines: 0,
            startLine: 1,
            endLine: 0,
            returnedLines: 0,
            hasMoreBefore: false,
            hasMoreAfter: false,
            nextStartLine: null,
            nextEndLine: null,
            content: '',
        };
    }

    const selectedLines = lines.slice(startLine - 1, endLine);
    return {
        path: entry.publicPath,
        source: entry.source,
        totalLines,
        startLine,
        endLine,
        returnedLines: selectedLines.length,
        hasMoreBefore: startLine > 1,
        hasMoreAfter: endLine < totalLines,
        nextStartLine: endLine < totalLines ? endLine + 1 : null,
        nextEndLine: endLine < totalLines ? Math.min(totalLines, endLine + maxRange) : null,
        content: selectedLines.join('\n'),
    };
}

async function readMultipleFiles(args = {}, options = {}) {
    const manifest = await loadManifest(options.signal);
    const paths = Array.isArray(args.paths) ? args.paths : [];
    const limit = Math.min(paths.length, 10);
    const targetPaths = paths.slice(0, limit).map((p) => String(p || '').trim()).filter(Boolean);

    if (targetPaths.length === 0) {
        throw new Error('no_paths_provided');
    }

    const MAX_LINES_PER_FILE = 500;
    const MAX_TOTAL_CHARS = 50000;
    let totalChars = 0;
    let warning = null;
    const results = [];

    for (const targetPath of targetPaths) {
        ensureNotAborted(options.signal);
        try {
            const entry = (manifest.files || []).find((item) => item.publicPath === targetPath);
            if (!entry) {
                results.push({
                    path: targetPath,
                    error: 'file_not_indexed',
                    content: null,
                    truncated: false,
                });
                continue;
            }

            const remainingChars = MAX_TOTAL_CHARS - totalChars;
            if (remainingChars <= 0) {
                warning = 'total_char_budget_reached';
                results.push({
                    path: entry.publicPath,
                    source: entry.source,
                    error: 'total_char_budget_reached',
                    content: null,
                    truncated: false,
                    truncatedBy: [],
                    originalLines: null,
                    originalChars: null,
                    returnedLines: 0,
                    returnedChars: 0,
                    nextStartLine: 1,
                });
                continue;
            }

            const fullContent = await readTextFile(entry.publicPath, options);
            const originalLinesArray = fullContent === '' ? [] : fullContent.split('\n');
            const originalLines = originalLinesArray.length;
            const originalChars = fullContent.length;
            const truncatedBy = [];
            let candidateLines = [...originalLinesArray];

            if (candidateLines.length > MAX_LINES_PER_FILE) {
                candidateLines = candidateLines.slice(0, MAX_LINES_PER_FILE);
                truncatedBy.push('line_limit');
            }

            let returnedLinesArray = candidateLines;
            let returnedContent = returnedLinesArray.join('\n');
            if (returnedContent.length > remainingChars) {
                const fittingLines = [];
                let usedChars = 0;
                for (const line of returnedLinesArray) {
                    const addition = (fittingLines.length ? 1 : 0) + line.length;
                    if (usedChars + addition > remainingChars) break;
                    fittingLines.push(line);
                    usedChars += addition;
                }
                returnedLinesArray = fittingLines;
                returnedContent = fittingLines.join('\n');
                truncatedBy.push('total_char_budget');
                warning = 'total_char_budget_reached';
            }

            const returnedLines = returnedLinesArray.length;
            const returnedChars = returnedContent.length;
            const truncated = truncatedBy.length > 0;
            const nextStartLine = truncated ? (returnedLines + 1) : null;

            totalChars += returnedChars;

            results.push({
                path: entry.publicPath,
                source: entry.source,
                content: returnedContent,
                truncated,
                truncatedBy,
                originalLines,
                originalChars,
                returnedLines,
                returnedChars,
                nextStartLine,
                error: null,
            });
        } catch (error) {
            results.push({
                path: targetPath,
                error: error.message || 'read_failed',
                content: null,
                truncated: false,
            });
        }
    }

    return {
        total: results.length,
        files: results,
        totalChars,
        warning,
    };
}

async function searchFiles(args = {}, options = {}) {
    const manifest = await loadManifest(options.signal);
    const query = String(args.query || '').trim();
    if (!query) throw new Error('empty_query');

    const useRegex = !!args.useRegex;
    const limit = Math.max(1, Math.min(Number(args.limit) || 10, 50));
    const contextLines = Math.max(0, Math.min(Number(args.contextLines) || 0, 5));
    const filePattern = String(args.filePattern || '').trim().toLowerCase();
    const concurrency = 6;
    const files = Array.isArray(manifest.files) ? manifest.files : [];

    // 编译正则表达式（如果启用）
    let regex = null;
    if (useRegex) {
        try {
            regex = new RegExp(query, 'i');  // 不区分大小写
        } catch (error) {
            throw new Error(`invalid_regex:${error.message}`);
        }
    }
    const loweredQuery = useRegex ? null : query.toLowerCase();

    // 文件路径过滤
    const filteredFiles = filePattern
        ? files.filter(f => f.publicPath.toLowerCase().includes(filePattern))
        : files;

    const results = [];
    let scannedFiles = 0;
    let truncated = false;

    for (let index = 0; index < filteredFiles.length; index += concurrency) {
        ensureNotAborted(options.signal);
        if (results.length >= limit) break;
        const batch = filteredFiles.slice(index, index + concurrency);
        scannedFiles += batch.length;
        const batchResults = await Promise.all(batch.map(async (entry) => {
            try {
                const text = await readTextFile(entry.publicPath, options);
                const lines = text.split('\n');
                const matches = [];

                // 查找所有匹配行
                lines.forEach((line, lineIndex) => {
                    const isMatch = useRegex
                        ? regex.test(line)
                        : line.toLowerCase().includes(loweredQuery);

                    if (isMatch) {
                        const lineNumber = lineIndex + 1;
                        const contextStart = Math.max(0, lineIndex - contextLines);
                        const contextEnd = Math.min(lines.length, lineIndex + contextLines + 1);
                        const contextText = lines.slice(contextStart, contextEnd)
                            .map((l, i) => {
                                const num = contextStart + i + 1;
                                const prefix = num === lineNumber ? '>' : ' ';
                                return `${prefix} ${num}: ${l}`;
                            })
                            .join('\n');

                        matches.push({
                            line: lineNumber,
                            text: line.trim(),
                            context: contextLines > 0 ? contextText : null,
                        });
                    }
                });

                if (matches.length === 0) return null;

                return {
                    path: entry.publicPath,
                    source: entry.source,
                    matchCount: matches.length,
                    matches: matches.slice(0, 10), // 每个文件最多返回 10 个匹配
                };
            } catch {
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
        useRegex,
        filePattern: filePattern || '(all)',
        contextLines,
        total: results.length,
        items: results,
        truncated,
        scannedFiles: Math.min(scannedFiles, filteredFiles.length),
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
        case 'read_file_range':
            return await readFileRange(args, options);
        case 'read_multiple_files':
            return await readMultipleFiles(args, options);
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
        z-index: 99999;
        overflow: hidden;
        pointer-events: none;
    `;

    const updateOverlayHeight = () => {
        if (overlay && overlay.style.display !== 'none') {
            overlay.style.height = `${window.innerHeight}px`;
            if (!window.matchMedia('(max-width: 900px)').matches) {
                applyShellBounds(shellMetrics.width || shell.getBoundingClientRect().width, shellMetrics.height || shell.getBoundingClientRect().height);
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
        pointer-events: auto;
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

    const resizeMask = document.createElement('div');
    resizeMask.setAttribute('aria-hidden', 'true');
    resizeMask.style.cssText = `
        position: absolute;
        top: 52px;
        left: 0;
        width: 100%;
        height: calc(100% - 52px);
        display: none;
        pointer-events: none;
        border-radius: 0 0 22px 22px;
        background:
            linear-gradient(180deg, rgba(248, 250, 253, 0.9), rgba(238, 243, 248, 0.9)),
            repeating-linear-gradient(
                -45deg,
                rgba(27, 55, 88, 0.04) 0 12px,
                rgba(27, 55, 88, 0.08) 12px 24px
            );
    `;

    shell.append(titleBar, closeButton, resizeHint, iframe, resizeMask);
    overlay.appendChild(shell);
    document.body.appendChild(overlay);

    let shellMetrics = {
        width: 0,
        height: 0,
        left: 0,
        top: 0,
    };
    let layoutFrame = 0;
    let pendingLayout = null;

    const clampShellPosition = (left, top, width = shellMetrics.width, height = shellMetrics.height) => {
        const maxLeft = Math.max(0, window.innerWidth - width);
        const maxTop = Math.max(0, window.innerHeight - height);
        return {
            left: Math.max(0, Math.min(left, maxLeft)),
            top: Math.max(0, Math.min(top, maxTop)),
        };
    };

    const flushShellLayout = () => {
        layoutFrame = 0;
        if (!pendingLayout) return;
        const next = {
            width: pendingLayout.width ?? shellMetrics.width,
            height: pendingLayout.height ?? shellMetrics.height,
            left: pendingLayout.left ?? shellMetrics.left,
            top: pendingLayout.top ?? shellMetrics.top,
        };
        shellMetrics = next;
        shell.style.width = `${next.width}px`;
        shell.style.height = `${next.height}px`;
        shell.style.left = `${next.left}px`;
        shell.style.top = `${next.top}px`;
        pendingLayout = null;
    };

    const scheduleShellLayout = (patch) => {
        pendingLayout = {
            ...(pendingLayout || {}),
            ...patch,
        };
        if (!layoutFrame) {
            layoutFrame = requestAnimationFrame(flushShellLayout);
        }
    };

    const centerShell = () => {
        const width = shell.getBoundingClientRect().width;
        const height = shell.getBoundingClientRect().height;
        const nextLeft = Math.max(0, Math.round((window.innerWidth - width) / 2));
        const nextTop = Math.max(0, Math.round((window.innerHeight - height) / 2));
        shellMetrics = {
            width,
            height,
            left: nextLeft,
            top: nextTop,
        };
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
        shell.style.maxWidth = `${maxWidth}px`;
        shell.style.maxHeight = `${maxHeight}px`;
        shell.style.minWidth = `${minWidth}px`;
        shell.style.minHeight = `${minHeight}px`;
        const currentLeft = pendingLayout?.left ?? shellMetrics.left;
        const currentTop = pendingLayout?.top ?? shellMetrics.top;
        const clamped = clampShellPosition(currentLeft, currentTop, nextWidth, nextHeight);
        scheduleShellLayout({
            width: nextWidth,
            height: nextHeight,
            left: clamped.left,
            top: clamped.top,
        });
    };

    centerShell();

    let dragState = null;
    let resizeState = null;
    const setResizePreviewActive = (active) => {
        iframe.style.visibility = active ? 'hidden' : '';
        iframe.style.pointerEvents = active ? 'none' : '';
        resizeMask.style.display = active ? 'block' : 'none';
    };
    const stopDrag = () => {
        dragState = null;
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
        shell.style.willChange = '';  // 清除 will-change
        window.removeEventListener('pointermove', onDragPointerMove);
        window.removeEventListener('pointerup', stopDrag);
        window.removeEventListener('pointercancel', stopDrag);
    };
    const onDragPointerMove = (event) => {
        if (!dragState) return;
        event.preventDefault();
        const nextLeft = dragState.startLeft + (event.clientX - dragState.startX);
        const nextTop = dragState.startTop + (event.clientY - dragState.startY);
        const clamped = clampShellPosition(nextLeft, nextTop, shellMetrics.width, shellMetrics.height);
        scheduleShellLayout({ left: clamped.left, top: clamped.top });
    };
    const stopResize = () => {
        if (layoutFrame) {
            cancelAnimationFrame(layoutFrame);
            flushShellLayout();
        }
        resizeState = null;
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
        shell.style.willChange = '';  // 清除 will-change
        setResizePreviewActive(false);
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
            startLeft: shellMetrics.left || rect.left,
            startTop: shellMetrics.top || rect.top,
        };
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'move';
        shell.style.willChange = 'left, top';  // 提示浏览器优化
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
            startWidth: shellMetrics.width || shell.getBoundingClientRect().width,
            startHeight: shellMetrics.height || shell.getBoundingClientRect().height,
        };
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'nwse-resize';
        shell.style.willChange = 'width, height';  // 提示浏览器优化
        setResizePreviewActive(true);
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', stopResize);
        window.addEventListener('pointercancel', stopResize);
    });

    window.addEventListener('resize', updateOverlayHeight);
    window.visualViewport?.addEventListener('resize', updateOverlayHeight);
    overlay._cleanup = () => {
        stopDrag();
        stopResize();
        if (layoutFrame) {
            cancelAnimationFrame(layoutFrame);
            layoutFrame = 0;
            pendingLayout = null;
        }
        window.removeEventListener('resize', updateOverlayHeight);
        window.visualViewport?.removeEventListener('resize', updateOverlayHeight);
    };

    if (window.matchMedia('(max-width: 900px)').matches) {
        overlay.style.padding = '0';
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
        resizeMask.style.top = '56px';
        resizeMask.style.height = 'calc(100% - 56px)';
        resizeMask.style.borderRadius = '0';
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
            await loadAssistantSettings();
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
            const patch = payload && typeof payload === 'object' ? payload : {};
            const current = getAssistantSettings();
            const next = normalizeAssistantSettings({
                ...current,
                workspaceFileName: normalizeWorkspaceName(patch.workspaceFileName || current.workspaceFileName),
                currentPresetName: normalizePresetName(patch.currentPresetName || current.currentPresetName),
                presets: patch.presets && typeof patch.presets === 'object'
                    ? patch.presets
                    : current.presets,
            });

            const result = await persistAssistantSettings(next, { silent: false });
            if (result.ok) {
                postToIframe(iframe, {
                    type: CONFIG_SAVED,
                    payload: {
                        config: buildRuntimeConfig(),
                    },
                });
            } else {
                postToIframe(iframe, {
                    type: CONFIG_SAVE_ERROR,
                    payload: {
                        error: result.error || '保存失败',
                        config: buildRuntimeConfig(),
                    },
                });
            }
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
    await loadAssistantSettings();
    window.xiaobaixAssistant = {
        openSettings: openAssistant,
        closeSettings: closeAssistant,
        getSettings: () => ({ ...getAssistantSettings() }),
    };
}

export function cleanupAssistant() {
    closeAssistant();
    delete window.xiaobaixAssistant;
}
