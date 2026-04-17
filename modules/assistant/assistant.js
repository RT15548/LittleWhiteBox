import { getRequestHeaders } from "../../../../../../script.js";
import { extensionFolderPath } from "../../core/constants.js";
import { isTrustedIframeEvent, postToIframe } from "../../core/iframe-messaging.js";
import { executeSlashCommand } from "../../core/slash-command.js";
import { AssistantStorage } from "../../core/server-storage.js";
import { TOOL_NAMES } from "./app-src/tooling.js";

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
const MAX_READ_RETURN_CHARS = 24_000;
const DEFAULT_AUTO_READ_LINES = 220;
const MAX_READ_RANGE_LINES = 400;
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

function escapeRegExp(text) {
    return String(text || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizePathForMatch(value) {
    return String(value || '').replace(/\\/g, '/');
}

function escapeCharClass(text) {
    return String(text || '').replace(/\\/g, '\\\\').replace(/\]/g, '\\]');
}

function findMatchingToken(text, startIndex, openChar, closeChar) {
    let depth = 0;
    for (let index = startIndex; index < text.length; index += 1) {
        const char = text[index];
        if (char === '\\') {
            index += 1;
            continue;
        }
        if (char === openChar) depth += 1;
        if (char === closeChar) {
            depth -= 1;
            if (depth === 0) return index;
        }
    }
    return -1;
}

function splitTopLevel(text, separator = ',') {
    const parts = [];
    let depth = 0;
    let current = '';
    for (let index = 0; index < text.length; index += 1) {
        const char = text[index];
        if (char === '\\') {
            current += char;
            if (index + 1 < text.length) {
                current += text[index + 1];
                index += 1;
            }
            continue;
        }
        if (char === '{' || char === '[' || char === '(') depth += 1;
        if (char === '}' || char === ']' || char === ')') depth = Math.max(0, depth - 1);
        if (char === separator && depth === 0) {
            parts.push(current);
            current = '';
            continue;
        }
        current += char;
    }
    parts.push(current);
    return parts;
}

function globFragmentToRegex(pattern) {
    let regexText = '';
    for (let index = 0; index < pattern.length; index += 1) {
        const char = pattern[index];
        const nextChar = pattern[index + 1];

        if (char === '\\') {
            if (index + 1 < pattern.length) {
                regexText += escapeRegExp(pattern[index + 1]);
                index += 1;
            } else {
                regexText += '\\\\';
            }
            continue;
        }

        if (char === '*') {
            if (nextChar === '*') {
                const afterNext = pattern[index + 2];
                if (afterNext === '/') {
                    regexText += '(?:.*\\/)?';
                    index += 2;
                } else {
                    regexText += '.*';
                    index += 1;
                }
            } else {
                regexText += '[^/]*';
            }
            continue;
        }

        if (char === '?') {
            regexText += '[^/]';
            continue;
        }

        if (char === '[') {
            const closingIndex = pattern.indexOf(']', index + 1);
            if (closingIndex === -1) {
                regexText += '\\[';
                continue;
            }
            const rawClass = pattern.slice(index + 1, closingIndex);
            const negated = rawClass.startsWith('!');
            const classBody = negated ? rawClass.slice(1) : rawClass;
            regexText += `[${negated ? '^' : ''}${escapeCharClass(classBody)}]`;
            index = closingIndex;
            continue;
        }

        if (char === '{') {
            const closingIndex = findMatchingToken(pattern, index, '{', '}');
            if (closingIndex === -1) {
                regexText += '\\{';
                continue;
            }
            const rawGroup = pattern.slice(index + 1, closingIndex);
            const alternatives = splitTopLevel(rawGroup).filter(Boolean);
            if (alternatives.length > 1) {
                regexText += `(?:${alternatives.map((item) => globFragmentToRegex(item)).join('|')})`;
            } else {
                regexText += `\\{${escapeRegExp(rawGroup)}\\}`;
            }
            index = closingIndex;
            continue;
        }

        regexText += escapeRegExp(char);
    }
    return regexText;
}

function compileGlobPattern(pattern) {
    const normalized = normalizePathForMatch(pattern).trim();
    if (!normalized) {
        throw new Error('glob_pattern_required');
    }

    const regex = new RegExp(`^${globFragmentToRegex(normalized)}$`, 'i');
    const basenameRegex = normalized.includes('/')
        ? null
        : new RegExp(`^${globFragmentToRegex(normalized)}$`, 'i');

    return {
        pattern: normalized,
        regex,
        basenameRegex,
    };
}

function matchesGlob(publicPath, relativePath, matcher) {
    const fullPath = normalizePathForMatch(publicPath);
    const shortPath = normalizePathForMatch(relativePath);
    if (matcher.regex.test(fullPath) || matcher.regex.test(shortPath)) {
        return true;
    }
    if (matcher.basenameRegex) {
        const fullName = fullPath.split('/').pop() || '';
        const shortName = shortPath.split('/').pop() || '';
        return matcher.basenameRegex.test(fullName) || matcher.basenameRegex.test(shortName);
    }
    return false;
}

async function globFiles(args = {}, options = {}) {
    const manifest = await loadManifest(options.signal);
    const pattern = String(args.pattern || '').trim();
    const matcher = compileGlobPattern(pattern);
    const limit = Math.max(1, Math.min(Number(args.limit) || 50, 100));
    const files = Array.isArray(manifest.files) ? manifest.files : [];
    const matched = files
        .filter((entry) => matchesGlob(entry.publicPath, entry.relativePath, matcher))
        .sort((a, b) => String(a.publicPath || '').localeCompare(String(b.publicPath || ''), 'zh-CN'));

    return {
        pattern,
        total: matched.length,
        items: matched.slice(0, limit),
        truncated: matched.length > limit,
    };
}

async function listDirectory(args = {}, options = {}) {
    const manifest = await loadManifest(options.signal);
    const rawPath = String(args.path || '').trim();
    if (!rawPath) {
        throw new Error('directory_path_required');
    }

    const directoryPath = rawPath.endsWith('/') ? rawPath : `${rawPath}/`;
    const normalizedPrefix = directoryPath.toLowerCase();
    const limit = Math.max(1, Math.min(Number(args.limit) || 50, 100));
    const files = Array.isArray(manifest.files) ? manifest.files : [];
    const entryMap = new Map();

    files.forEach((entry) => {
        const publicPath = String(entry.publicPath || '');
        const normalizedPath = publicPath.toLowerCase();
        if (!normalizedPath.startsWith(normalizedPrefix)) return;

        const remainder = publicPath.slice(directoryPath.length);
        if (!remainder) return;

        const slashIndex = remainder.indexOf('/');
        const childName = slashIndex === -1 ? remainder : remainder.slice(0, slashIndex);
        const isDirectory = slashIndex !== -1;
        const childPath = isDirectory ? `${directoryPath}${childName}/` : `${directoryPath}${childName}`;
        const existing = entryMap.get(childPath);

        if (existing) {
            existing.descendantFileCount += 1;
            if (isDirectory) existing.type = 'directory';
            return;
        }

        entryMap.set(childPath, {
            publicPath: childPath,
            source: entry.source,
            type: isDirectory ? 'directory' : 'file',
            descendantFileCount: 1,
        });
    });

    const items = Array.from(entryMap.values()).sort((a, b) => a.publicPath.localeCompare(b.publicPath, 'zh-CN'));
    return {
        directoryPath,
        total: items.length,
        items: items.slice(0, limit),
        truncated: items.length > limit,
    };
}

function clampLineNumber(value, fallback, totalLines) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return fallback;
    return Math.min(Math.max(1, Math.trunc(numeric)), Math.max(totalLines, 1));
}

function formatLineNumberedContent(lines, startLine, totalLines) {
    const width = String(Math.max(totalLines, startLine)).length;
    return lines.map((line, index) => `${String(startLine + index).padStart(width, ' ')}\t${line}`);
}

function sliceLinesWithBudget(lines, startLine, requestedEndLine, maxChars) {
    const totalLines = lines.length;
    const safeEndLine = Math.min(Math.max(startLine, requestedEndLine), Math.max(totalLines, 1));
    const selected = [];
    let totalChars = 0;
    let endLine = startLine - 1;
    let charLimited = false;

    for (let lineNumber = startLine; lineNumber <= safeEndLine; lineNumber += 1) {
        const line = lines[lineNumber - 1] ?? '';
        const numberedLine = formatLineNumberedContent([line], lineNumber, totalLines)[0];
        const addition = selected.length ? numberedLine.length + 1 : numberedLine.length;
        if (selected.length && totalChars + addition > maxChars) {
            charLimited = true;
            break;
        }
        if (!selected.length && addition > maxChars) {
            selected.push(numberedLine.slice(0, maxChars));
            totalChars = maxChars;
            endLine = lineNumber;
            charLimited = true;
            break;
        }
        selected.push(numberedLine);
        totalChars += addition;
        endLine = lineNumber;
    }

    if (!selected.length && totalLines === 0) {
        return {
            content: '',
            endLine: 0,
            charLimited: false,
        };
    }

    return {
        content: selected.join('\n'),
        endLine,
        charLimited,
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
    const lines = content === '' ? [] : content.split('\n');
    const totalLines = lines.length;
    const sizeBytes = new TextEncoder().encode(content).length;
    const hasRange = Number.isFinite(Number(args.startLine)) || Number.isFinite(Number(args.endLine));

    if (totalLines === 0) {
        return {
            path: entry.publicPath,
            source: entry.source,
            sizeBytes,
            totalLines: 0,
            startLine: 1,
            endLine: 0,
        returnedLines: 0,
        hasMoreBefore: false,
        hasMoreAfter: false,
        nextStartLine: null,
        nextEndLine: null,
        truncated: false,
        autoChunked: false,
        charLimited: false,
        limitReason: null,
        contentFormat: 'numbered_lines',
        content: '',
    };
}

    const startLine = clampLineNumber(args.startLine, 1, totalLines);
    let requestedEndLine;
    let autoChunked = false;

    if (hasRange) {
        requestedEndLine = clampLineNumber(
            args.endLine,
            Math.min(totalLines, startLine + DEFAULT_AUTO_READ_LINES - 1),
            totalLines,
        );
    } else if (sizeBytes > MAX_READ_FILE_BYTES || content.length > MAX_READ_RETURN_CHARS) {
        requestedEndLine = Math.min(totalLines, startLine + DEFAULT_AUTO_READ_LINES - 1);
        autoChunked = true;
    } else {
        requestedEndLine = totalLines;
    }

    requestedEndLine = Math.min(requestedEndLine, startLine + MAX_READ_RANGE_LINES - 1, totalLines);
    const slice = sliceLinesWithBudget(lines, startLine, requestedEndLine, MAX_READ_RETURN_CHARS);
    const endLine = slice.endLine || requestedEndLine;
    const hasMoreBefore = startLine > 1;
    const hasMoreAfter = endLine < totalLines;

    return {
        path: entry.publicPath,
        source: entry.source,
        sizeBytes,
        totalLines,
        startLine,
        endLine,
        returnedLines: endLine >= startLine ? (endLine - startLine + 1) : 0,
        hasMoreBefore,
        hasMoreAfter,
        nextStartLine: hasMoreAfter ? endLine + 1 : null,
        nextEndLine: hasMoreAfter ? Math.min(totalLines, endLine + DEFAULT_AUTO_READ_LINES) : null,
        truncated: hasMoreBefore || hasMoreAfter || slice.charLimited || autoChunked,
        autoChunked,
        charLimited: slice.charLimited,
        limitReason: autoChunked
            ? 'auto_chunked'
            : slice.charLimited
                ? 'output_budget'
                : (hasMoreBefore || hasMoreAfter)
                    ? 'requested_range'
                    : null,
        contentFormat: 'numbered_lines',
        content: slice.content,
    };
}

async function grepFiles(args = {}, options = {}) {
    const manifest = await loadManifest(options.signal);
    const pattern = String(args.pattern || '').trim();
    if (!pattern) throw new Error('empty_query');

    const useRegex = 'useRegex' in args ? !!args.useRegex : true;
    const outputMode = ['content', 'files_with_matches', 'count'].includes(String(args.outputMode || ''))
        ? String(args.outputMode)
        : 'files_with_matches';
    const limit = Math.max(1, Math.min(Number(args.limit) || 10, 50));
    const offset = Math.max(0, Math.trunc(Number(args.offset) || 0));
    const contextLines = Math.max(0, Math.min(Number(args.contextLines) || 0, 5));
    const glob = String(args.glob || '').trim();
    const files = Array.isArray(manifest.files) ? manifest.files : [];
    const fileMatcher = glob ? compileGlobPattern(glob) : null;
    const candidateFiles = fileMatcher
        ? files.filter((entry) => matchesGlob(entry.publicPath, entry.relativePath, fileMatcher))
        : files;

    let regex = null;
    if (useRegex) {
        try {
            regex = new RegExp(pattern, 'i');
        } catch (error) {
            throw new Error(`invalid_regex:${error.message}`);
        }
    }
    const loweredPattern = useRegex ? null : pattern.toLowerCase();

    const results = [];
    let scannedFiles = 0;
    let truncated = false;
    let matchedFiles = 0;
    for (const entry of candidateFiles) {
        ensureNotAborted(options.signal);
        scannedFiles += 1;

        try {
            const text = await readTextFile(entry.publicPath, options);
            const lines = text.split('\n');
            const matches = [];

            lines.forEach((line, lineIndex) => {
                const isMatch = useRegex
                    ? regex.test(line)
                    : line.toLowerCase().includes(loweredPattern);

                if (!isMatch) return;

                const lineNumber = lineIndex + 1;
                const contextStart = Math.max(0, lineIndex - contextLines);
                const contextEnd = Math.min(lines.length, lineIndex + contextLines + 1);
                const contextText = lines.slice(contextStart, contextEnd)
                    .map((contextLine, contextIndex) => {
                        const num = contextStart + contextIndex + 1;
                        const prefix = num === lineNumber ? '>' : ' ';
                        return `${prefix} ${num}: ${contextLine}`;
                    })
                    .join('\n');

                matches.push({
                    line: lineNumber,
                    text: line.trim(),
                    context: contextLines > 0 ? contextText : null,
                });
            });

            if (!matches.length) continue;
            matchedFiles += 1;
            if (matchedFiles <= offset) continue;

            if (outputMode === 'count') {
                results.push({
                    path: entry.publicPath,
                    source: entry.source,
                    matchCount: matches.length,
                });
            } else if (outputMode === 'files_with_matches') {
                results.push({
                    path: entry.publicPath,
                    source: entry.source,
                    matchCount: matches.length,
                });
            } else {
                results.push({
                    path: entry.publicPath,
                    source: entry.source,
                    matchCount: matches.length,
                    matches: matches.slice(0, 10),
                });
            }
            if (results.length >= limit) {
                truncated = matchedFiles < candidateFiles.length || scannedFiles < candidateFiles.length;
                break;
            }
        } catch {
            continue;
        }
    }

    return {
        pattern,
        useRegex,
        outputMode,
        glob: glob || '',
        limit,
        offset,
        contextLines,
        total: truncated ? null : matchedFiles,
        returned: results.length,
        matchedFilesSeen: matchedFiles,
        items: results,
        truncated,
        scannedFiles,
        candidateFiles: candidateFiles.length,
        indexedFiles: files.length,
        searchComplete: !truncated && scannedFiles >= candidateFiles.length,
        nextOffset: offset + results.length,
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

async function runSlashCommand(args = {}, options = {}) {
    ensureNotAborted(options.signal);

    let command = String(args.command || '').trim();
    if (!command) {
        return {
            ok: false,
            command: '',
            error: 'slash_command_required',
            note: '必须提供要执行的斜杠命令。',
        };
    }

    if (!command.startsWith('/')) {
        command = `/${command}`;
    }

    try {
        const result = await executeSlashCommand(command);
        ensureNotAborted(options.signal);
        const normalizedError = result && typeof result === 'object'
            ? (result.ok === false
                ? String(result.error || result.message || 'slash_command_failed')
                : (result.error ? String(result.error) : ''))
            : '';

        if (normalizedError) {
            return {
                ok: false,
                command,
                error: normalizedError,
                result,
            };
        }

        return {
            ok: true,
            command,
            result,
        };
    } catch (error) {
        ensureNotAborted(options.signal);
        return {
            ok: false,
            command,
            error: error instanceof Error ? error.message : String(error || 'unknown_error'),
            raw: error instanceof Error ? (error.stack || error.message) : String(error || 'unknown_error'),
        };
    }
}

async function executeToolCall(name, args, options = {}) {
    switch (name) {
        case TOOL_NAMES.LS:
            return await listDirectory(args, options);
        case TOOL_NAMES.GLOB:
            return await globFiles(args, options);
        case TOOL_NAMES.GREP:
            return await grepFiles(args, options);
        case TOOL_NAMES.READ:
            return await readFile(args, options);
        case TOOL_NAMES.RUN_SLASH_COMMAND:
            return await runSlashCommand(args, options);
        case TOOL_NAMES.READ_WORKLOG:
            return await readWorkspaceNote(args, options);
        case TOOL_NAMES.WRITE_WORKLOG:
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
            if (window.matchMedia('(max-width: 900px)').matches) {
                shell.style.height = `${window.innerHeight}px`;
            } else {
                applyShellBounds(shellMetrics.width || shell.getBoundingClientRect().width, shellMetrics.height || shell.getBoundingClientRect().height);
            }
        }
    };

    const shell = document.createElement('div');
    shell.style.cssText = `
        position: absolute;
        width: min(1200px, calc(100vw - 200px));
        height: min(800px, calc(100vh - 200px));
        max-width: calc(100vw - 96px);
        max-height: calc(100vh - 96px);
        min-width: 320px;
        min-height: 400px;
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
        const isMobile = window.matchMedia('(max-width: 900px)').matches;
        const maxWidth = Math.max(560, viewportWidth - 96);
        const maxHeight = Math.max(640, viewportHeight - 96);
        const minWidth = isMobile ? Math.min(320, viewportWidth - 48) : Math.min(560, viewportWidth - 48);
        const minHeight = isMobile ? Math.min(400, viewportHeight - 48) : Math.min(640, viewportHeight - 48);
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
        shell.style.width = '100%';
        shell.style.height = `${window.innerHeight}px`;
        shell.style.maxWidth = '100%';
        shell.style.maxHeight = `${window.innerHeight}px`;
        shell.style.minWidth = '100%';
        shell.style.minHeight = `${window.innerHeight}px`;
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
            const config = buildRuntimeConfig();
            postToIframe(iframe, {
                type: 'xb-assistant:config',
                payload: {
                    config,
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
