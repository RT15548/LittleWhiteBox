import { getRequestHeaders } from "../../../../../../script.js";
import * as scriptModule from "../../../../../../script.js";
import { getContext } from "../../../../../extensions.js";
import * as extensionsModule from "../../../../../extensions.js";
import * as slashCommandsModule from "../../../../../slash-commands.js";
import { SlashCommand } from "../../../../../slash-commands/SlashCommand.js";
import { ARGUMENT_TYPE, SlashCommandArgument, SlashCommandNamedArgument } from "../../../../../slash-commands/SlashCommandArgument.js";
import { SlashCommandParser } from "../../../../../slash-commands/SlashCommandParser.js";
import { extensionFolderPath } from "../../core/constants.js";
import { isTrustedIframeEvent, postToIframe } from "../../core/iframe-messaging.js";
import { AssistantStorage } from "../../core/server-storage.js";
import { createAssistantHostWindow } from "./assistant-host-window.js";
import { TOOL_NAMES } from "./app-src/tooling.js";
import { normalizeSlashSkillTrigger } from "./app-src/slash-command-policy.js";
import {
    DEFAULT_PRESET_NAME,
    buildDefaultPreset,
    cloneDefaultModelConfigs,
    normalizePermissionMode,
    normalizeAssistantSettings,
    normalizePresetName,
} from "./shared/config.js";
import { getPathExtension, isSupportedPublicTextPath } from "./shared/public-text-file-types.js";

const MODULE_ID = 'assistant';
const OVERLAY_ID = 'xiaobaix-assistant-overlay';
const MINIMIZED_STYLE_ID = 'xiaobaix-assistant-minimized-style';
const HTML_PATH = `${extensionFolderPath}/modules/assistant/assistant-overlay.html`;
const MANIFEST_PATH = `${extensionFolderPath}/modules/assistant/assistant-file-manifest.json`;
const JSAPI_MANIFEST_PATH = `${extensionFolderPath}/modules/assistant/st-jsapi-manifest.json`;
const TOOL_RESULT = 'xb-assistant:tool-result';
const TOOL_ERROR = 'xb-assistant:tool-error';
const CONFIG_SAVED = 'xb-assistant:config-saved';
const CONFIG_SAVE_ERROR = 'xb-assistant:config-save-error';
const SKILLS_UPDATED = 'xb-assistant:skills-updated';
const LOCAL_SOURCES_UPDATED = 'xb-assistant:local-sources-updated';
const EDITOR_CONTEXT_UPDATED = 'xb-assistant:editor-context';
const WORKSPACE_PREFIX = 'LittleWhiteBox_Assistant_';
const DEFAULT_WORKSPACE_FILE = `${WORKSPACE_PREFIX}Worklog.md`;
const DEFAULT_IDENTITY_FILE = `${WORKSPACE_PREFIX}Identity.md`;
const DEFAULT_SKILLS_FILE = `${WORKSPACE_PREFIX}Skills.json`;
const SKILL_FILE_PREFIX = `${WORKSPACE_PREFIX}Skill_`;
const DEFAULT_IDENTITY_CONTENT = '你默认叫“小白助手”，这里是你的身份设定，用于保持长期工作习惯和创作风格，请尽快引导用户设定你的身份';
const EMPTY_SKILLS_CATALOG = Object.freeze({
    version: 1,
    skills: [],
});
const MAX_SKILL_PROMPT_ITEMS = 20;
const MAX_CONTENT_CACHE_ENTRIES = 48;
const MAX_READ_FILE_BYTES = 100 * 1024;
const MAX_READ_RETURN_CHARS = 24_000;
const MAX_JSAPI_RETURN_CHARS = 50 * 1024;
const DEFAULT_AUTO_READ_LINES = 220;
const MAX_READ_RANGE_LINES = 400;
const SERVER_FILE_KEY = 'settings';
const CONFIG_VERSION = 1;

let hostWindow = null;
let manifestCache = null;
let jsApiManifestCache = null;
let jsApiRuntimeModulePromise = null;
const contentCache = new Map();
const activeToolControllers = new Map();
const activeSkillProposalTokens = new Map();
let settingsCache = null;
let settingsLoaded = false;
let localSourcesCache = [];
let editorContextCache = null;

function trimEditorContextText(text = '', limit = 1200) {
    const normalized = String(text || '').trim();
    if (!normalized) return '';
    if (normalized.length <= limit) return normalized;
    return `${normalized.slice(0, limit)}...`;
}

function normalizeEditorContextPayload(payload = null) {
    if (!payload || typeof payload !== 'object') return null;
    const filePath = String(payload.filePath || payload.path || '').trim();
    const note = String(payload.note || '').trim();
    const selectionText = trimEditorContextText(payload.selectionText || payload.selectedText || '', 1200);
    const lineStart = Number.isFinite(Number(payload.lineStart || payload.startLine))
        ? Number(payload.lineStart || payload.startLine)
        : '';
    const lineEnd = Number.isFinite(Number(payload.lineEnd || payload.endLine))
        ? Number(payload.lineEnd || payload.endLine)
        : '';
    const source = String(payload.source || 'external-editor').trim() || 'external-editor';
    if (!filePath && !note && !selectionText) return null;
    return {
        source,
        filePath,
        note,
        selectionText,
        lineStart,
        lineEnd,
    };
}

function postEditorContextToIframe() {
    const iframe = getAssistantHostWindow().getIframe();
    if (!iframe) return false;
    postToIframe(iframe, {
        type: EDITOR_CONTEXT_UPDATED,
        payload: editorContextCache,
    });
    return true;
}

function setAssistantEditorContext(payload = null) {
    editorContextCache = normalizeEditorContextPayload(payload);
    postEditorContextToIframe();
    return editorContextCache;
}

function clearAssistantEditorContext() {
    editorContextCache = null;
    postEditorContextToIframe();
}

function handleAssistantEditorContextEvent(event) {
    const detail = event?.detail;
    if (!detail) {
        clearAssistantEditorContext();
        return;
    }
    setAssistantEditorContext(detail);
}

async function persistAssistantSettings(settings, { silent = true } = {}) {
    const next = normalizeAssistantSettings({
        ...settings,
        updatedAt: Date.now(),
        configVersion: CONFIG_VERSION,
    }, {
        defaultWorkspaceFileName: DEFAULT_WORKSPACE_FILE,
        normalizeWorkspaceName,
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
        settingsCache = normalizeAssistantSettings(saved || {}, {
            defaultWorkspaceFileName: DEFAULT_WORKSPACE_FILE,
            normalizeWorkspaceName,
        });

        if (!saved || settingsCache.configVersion !== CONFIG_VERSION) {
            await persistAssistantSettings(settingsCache, { silent: true });
        }
    } catch {
        settingsCache = normalizeAssistantSettings({}, {
            defaultWorkspaceFileName: DEFAULT_WORKSPACE_FILE,
            normalizeWorkspaceName,
        });
    }

    settingsLoaded = true;
    return settingsCache;
}

function getAssistantSettings() {
    if (!settingsCache) {
        settingsCache = normalizeAssistantSettings({}, {
            defaultWorkspaceFileName: DEFAULT_WORKSPACE_FILE,
            normalizeWorkspaceName,
        });
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
        permissionMode: normalizePermissionMode(currentPreset.permissionMode),
        currentPresetName: settings.currentPresetName || DEFAULT_PRESET_NAME,
        presetNames: Object.keys(settings.presets || {}),
        presets: settings.presets || {},
        toolInfo: {
            readableSources: ['littlewhitebox', 'sillytavern-public', 'session-local-source'],
            writableSources: ['session-local-source'],
            writableTemporaryRoot: 'local/',
            writableWorkspacePrefix: WORKSPACE_PREFIX,
        },
    };
}

async function buildAssistantRuntimePayload(signal) {
    let fileCount = 0;
    try {
        const manifest = await loadManifest(signal);
        fileCount = Array.isArray(manifest.files) ? manifest.files.length : 0;
    } catch {
        fileCount = 0;
    }

    let identityContent = DEFAULT_IDENTITY_CONTENT;
    try {
        const identityFile = await ensureUserFile(DEFAULT_IDENTITY_FILE, DEFAULT_IDENTITY_CONTENT, { signal });
        identityContent = String(identityFile.content || '').trim() || DEFAULT_IDENTITY_CONTENT;
    } catch {
        identityContent = DEFAULT_IDENTITY_CONTENT;
    }

    try {
        await ensureUserFile(getAssistantSettings().workspaceFileName || DEFAULT_WORKSPACE_FILE, '', { signal });
    } catch {
        // Ignore auto-create failures so the assistant can still start.
    }

    const skillsRuntime = await readSkillsRuntimeData({ signal });
    return {
        moduleId: MODULE_ID,
        extensionPath: extensionFolderPath,
        indexedFileCount: fileCount,
        identityContent,
        ...skillsRuntime,
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

function normalizeLocalSourceFileEntry(file) {
    if (!file || typeof file !== 'object') return null;
    const publicPath = String(file.path || file.publicPath || '').trim().replace(/\\/g, '/').replace(/^\/+/, '');
    if (!publicPath.startsWith('local/') || publicPath.includes('..')) return null;
    const content = typeof file.content === 'string' ? file.content : '';
    const hasOriginalContent = Object.prototype.hasOwnProperty.call(file, 'originalContent');
    return {
        path: publicPath,
        publicPath,
        relativePath: String(file.relativePath || publicPath.split('/').slice(2).join('/') || publicPath.split('/').pop() || '').trim(),
        source: 'session-local-source',
        extension: getPathExtension(publicPath),
        sizeBytes: Math.max(0, Number(file.sizeBytes) || 0),
        content,
        originalContent: hasOriginalContent
            ? (file.originalContent === null ? null : typeof file.originalContent === 'string' ? file.originalContent : content)
            : content,
        name: String(file.name || publicPath.split('/').pop() || '').trim(),
    };
}

function normalizeLocalSourcesSnapshot(localSources) {
    if (!Array.isArray(localSources)) return [];
    return localSources
        .map((source) => {
            if (!source || typeof source !== 'object') return null;
            const sourceId = String(source.sourceId || '').trim();
            if (!sourceId) return null;
            const label = String(source.label || '').trim() || sourceId;
            const files = Array.isArray(source.files)
                ? source.files.map(normalizeLocalSourceFileEntry).filter(Boolean)
                : [];
            if (!files.length) return null;
            return {
                sourceId,
                label,
                importedAt: Number.isFinite(Number(source.importedAt)) ? Number(source.importedAt) : Date.now(),
                files,
            };
        })
        .filter(Boolean);
}

function getLocalSourceFiles(localSources = localSourcesCache) {
    return normalizeLocalSourcesSnapshot(localSources).flatMap((source) => source.files);
}

function getAllIndexedFiles(manifest, localSources = localSourcesCache) {
    const manifestFiles = Array.isArray(manifest?.files) ? manifest.files : [];
    return [...manifestFiles, ...getLocalSourceFiles(localSources)];
}

function findLocalSourceFileByPath(publicPath, localSources = localSourcesCache) {
    const normalizedPath = String(publicPath || '').trim();
    if (!normalizedPath.startsWith('local/')) return null;
    return getLocalSourceFiles(localSources).find((entry) => entry.publicPath === normalizedPath) || null;
}

function normalizeLocalDirectoryPath(rawPath) {
    const normalized = String(rawPath || '').trim().replace(/\\/g, '/').replace(/^\/+/, '').replace(/\/+$/, '');
    if (!normalized.startsWith('local/') || normalized.includes('..')) return '';
    const segments = normalized.split('/').filter(Boolean);
    if (segments.length < 2) return '';
    return `${normalized}/`;
}

function findLocalDirectoryByPath(publicPath, localSources = localSourcesCache) {
    const normalizedDirectoryPath = normalizeLocalDirectoryPath(publicPath);
    if (!normalizedDirectoryPath) return null;
    const matchingFiles = getLocalSourceFiles(localSources).filter((entry) => entry.publicPath.startsWith(normalizedDirectoryPath));
    if (!matchingFiles.length) return null;
    return {
        path: normalizedDirectoryPath,
        files: matchingFiles,
    };
}

function getWritableLocalPathError(rawPath) {
    const normalized = String(rawPath || '').trim().replace(/\\/g, '/').replace(/^\/+/, '');
    if (!normalized.startsWith('local/')) return 'local_path_required';
    if (normalized.includes('..') || normalized.endsWith('/')) return 'local_path_required';
    if (!isSupportedPublicTextPath(normalized)) return 'unsupported_text_file';
    const segments = normalized.split('/').filter(Boolean);
    if (segments.length < 3) return 'local_path_required';
    return '';
}

function normalizeWritableLocalPath(rawPath) {
    const normalized = String(rawPath || '').trim().replace(/\\/g, '/').replace(/^\/+/, '');
    if (getWritableLocalPathError(normalized)) return '';
    return normalized;
}

function getLocalSourceLabelFromPath(publicPath = '') {
    const segments = String(publicPath || '').trim().split('/').filter(Boolean);
    return segments[1] || '';
}

function createLocalSourceSnapshot(sourceLabel, localSources = []) {
    const normalizedLabel = String(sourceLabel || '').trim();
    if (!normalizedLabel) {
        throw new Error('local_source_not_found');
    }
    const existingIds = new Set(
        normalizeLocalSourcesSnapshot(localSources).map((source) => String(source.sourceId || '').trim()).filter(Boolean),
    );
    const baseId = `local:${normalizedLabel}`;
    let sourceId = baseId;
    let suffix = 2;
    while (existingIds.has(sourceId)) {
        sourceId = `${baseId}:${suffix}`;
        suffix += 1;
    }
    return {
        sourceId,
        label: normalizedLabel,
        importedAt: Date.now(),
        files: [],
    };
}

function buildLocalSourceFileEntry(publicPath, content = '', options = {}) {
    const normalizedPath = normalizeWritableLocalPath(publicPath);
    if (!normalizedPath) {
        throw new Error(getWritableLocalPathError(publicPath));
    }
    const segments = normalizedPath.split('/').filter(Boolean);
    const relativePath = segments.slice(2).join('/');
    const normalizedContent = String(content || '');
    const originalContent = Object.prototype.hasOwnProperty.call(options, 'originalContent')
        ? options.originalContent
        : normalizedContent;
    return {
        path: normalizedPath,
        publicPath: normalizedPath,
        relativePath,
        source: 'session-local-source',
        extension: getPathExtension(normalizedPath),
        sizeBytes: new TextEncoder().encode(normalizedContent).length,
        content: normalizedContent,
        originalContent,
        name: segments[segments.length - 1] || relativePath || 'untitled.txt',
    };
}

function countOccurrences(text = '', needle = '') {
    if (!needle) return 0;
    let count = 0;
    let searchIndex = 0;
    while (searchIndex <= text.length) {
        const foundIndex = text.indexOf(needle, searchIndex);
        if (foundIndex === -1) break;
        count += 1;
        searchIndex = foundIndex + needle.length;
    }
    return count;
}

function replaceFirstOccurrence(text = '', oldText = '', newText = '') {
    const foundIndex = text.indexOf(oldText);
    if (foundIndex === -1) return text;
    return `${text.slice(0, foundIndex)}${newText}${text.slice(foundIndex + oldText.length)}`;
}

function upsertLocalSourceFile(localSources, publicPath, content) {
    const normalizedPath = normalizeWritableLocalPath(publicPath);
    if (!normalizedPath) {
        throw new Error(getWritableLocalPathError(publicPath));
    }

    const normalizedSources = normalizeLocalSourcesSnapshot(localSources);
    const sourceLabel = getLocalSourceLabelFromPath(normalizedPath);
    if (!sourceLabel) {
        throw new Error('local_source_not_found');
    }

    let sourceFound = false;
    let fileExisted = false;
    let existingFile = null;
    const nextSources = normalizedSources.map((source) => {
        if (source.label !== sourceLabel) return source;
        sourceFound = true;
        const nextFiles = source.files.map((file) => {
            if (file.publicPath !== normalizedPath) return file;
            fileExisted = true;
            existingFile = file;
            return file;
        });
        return {
            ...source,
            files: nextFiles,
        };
    });

    const nextFile = buildLocalSourceFileEntry(normalizedPath, content, {
        originalContent: fileExisted
            ? (Object.prototype.hasOwnProperty.call(existingFile || {}, 'originalContent') ? existingFile.originalContent : existingFile?.content ?? content)
            : null,
    });
    const finalizedSources = nextSources.map((source) => {
        if (source.label !== sourceLabel) return source;
        const nextFiles = source.files.map((file) => (
            file.publicPath === normalizedPath ? nextFile : file
        ));
        if (!fileExisted) {
            nextFiles.push(nextFile);
        }
        nextFiles.sort((left, right) => String(left.publicPath || '').localeCompare(String(right.publicPath || ''), 'zh-CN'));
        return {
            ...source,
            files: nextFiles,
        };
    });

    const finalizedWithSource = sourceFound
        ? finalizedSources
        : [
            ...finalizedSources,
            createLocalSourceSnapshot(sourceLabel, normalizedSources),
        ].sort((left, right) => String(left.label || '').localeCompare(String(right.label || ''), 'zh-CN'));

    return {
        nextSources: finalizedWithSource.map((source) => {
            if (source.label !== sourceLabel) return source;
            const nextFiles = source.files.map((file) => (
                file.publicPath === normalizedPath ? nextFile : file
            ));
            if (!nextFiles.some((file) => file.publicPath === normalizedPath)) {
                nextFiles.push(nextFile);
            }
            nextFiles.sort((left, right) => String(left.publicPath || '').localeCompare(String(right.publicPath || ''), 'zh-CN'));
            return {
                ...source,
                files: nextFiles,
            };
        }),
        file: nextFile,
        fileExisted,
        sourceLabel,
    };
}

function removeLocalSourceFile(localSources, publicPath) {
    const normalizedPath = normalizeWritableLocalPath(publicPath);
    if (!normalizedPath) {
        throw new Error(getWritableLocalPathError(publicPath));
    }

    const normalizedSources = normalizeLocalSourcesSnapshot(localSources);
    let removedFile = null;
    const nextSources = normalizedSources
        .map((source) => {
            const nextFiles = source.files.filter((file) => {
                if (file.publicPath !== normalizedPath) return true;
                removedFile = file;
                return false;
            });
            if (!nextFiles.length) return null;
            return {
                ...source,
                files: nextFiles,
            };
        })
        .filter(Boolean);

    if (!removedFile) {
        throw new Error('local_file_not_found');
    }

    return {
        nextSources,
        file: removedFile,
    };
}

function removeLocalSourcePath(localSources, publicPath) {
    const fileMatch = findLocalSourceFileByPath(publicPath, localSources);
    if (fileMatch) {
        const removal = removeLocalSourceFile(localSources, fileMatch.publicPath);
        return {
            mode: 'file',
            nextSources: removal.nextSources,
            removedFiles: [removal.file],
        };
    }

    const directoryMatch = findLocalDirectoryByPath(publicPath, localSources);
    if (!directoryMatch) {
        throw new Error('local_file_not_found');
    }

    const removedPaths = new Set(directoryMatch.files.map((file) => file.publicPath));
    return {
        mode: 'directory',
        removedFiles: directoryMatch.files.slice(),
        nextSources: normalizeLocalSourcesSnapshot(localSources)
            .map((source) => {
                const nextFiles = source.files.filter((file) => !removedPaths.has(file.publicPath));
                if (!nextFiles.length) return null;
                return {
                    ...source,
                    files: nextFiles,
                };
            })
            .filter(Boolean),
    };
}

function moveLocalSourceFile(localSources, fromPath, toPath, options = {}) {
    const normalizedFromPath = normalizeWritableLocalPath(fromPath);
    if (!normalizedFromPath) {
        throw new Error(getWritableLocalPathError(fromPath));
    }
    const normalizedToPath = normalizeWritableLocalPath(toPath);
    if (!normalizedToPath) {
        throw new Error(getWritableLocalPathError(toPath));
    }

    const normalizedSources = normalizeLocalSourcesSnapshot(localSources);
    const sourceFile = findLocalSourceFileByPath(normalizedFromPath, normalizedSources);
    if (!sourceFile) {
        throw new Error('local_file_not_found');
    }

    const destinationFile = findLocalSourceFileByPath(normalizedToPath, normalizedSources);
    if (destinationFile && normalizedToPath !== normalizedFromPath && !options.overwrite) {
        throw new Error('local_destination_exists');
    }

    const sourceLabel = getLocalSourceLabelFromPath(normalizedFromPath);
    const destinationLabel = getLocalSourceLabelFromPath(normalizedToPath);
    let destinationSourceFound = false;
    const intermediateSources = normalizedSources
        .map((source) => {
            const isSourceRoot = source.label === sourceLabel;
            const isDestinationRoot = source.label === destinationLabel;
            if (isDestinationRoot) {
                destinationSourceFound = true;
            }

            let nextFiles = source.files;
            if (isSourceRoot) {
                nextFiles = nextFiles.filter((file) => file.publicPath !== normalizedFromPath);
            }
            if (isDestinationRoot && normalizedToPath !== normalizedFromPath) {
                nextFiles = nextFiles.filter((file) => file.publicPath !== normalizedToPath);
            }

            if (!nextFiles.length && !isDestinationRoot) return null;
            return {
                ...source,
                files: nextFiles,
            };
        })
        .filter(Boolean);
    const workingSources = destinationSourceFound
        ? intermediateSources
        : [...intermediateSources, createLocalSourceSnapshot(destinationLabel, intermediateSources)];

    const movedFile = buildLocalSourceFileEntry(normalizedToPath, sourceFile.content, {
        originalContent: sourceFile.originalContent,
    });
    const finalizedSources = workingSources.map((source) => {
        if (source.label !== destinationLabel) return source;
        return {
            ...source,
            files: [...source.files, movedFile]
                .sort((left, right) => String(left.publicPath || '').localeCompare(String(right.publicPath || ''), 'zh-CN')),
        };
    });

    return {
        nextSources: finalizedSources,
        fromFile: sourceFile,
        file: movedFile,
        overwritten: !!destinationFile && normalizedToPath !== normalizedFromPath,
    };
}

function moveLocalSourcePath(localSources, fromPath, toPath, options = {}) {
    const overwrite = !!options.overwrite;
    const fileMatch = findLocalSourceFileByPath(fromPath, localSources);
    if (fileMatch) {
        const move = moveLocalSourceFile(localSources, fileMatch.publicPath, toPath, { overwrite });
        return {
            mode: 'file',
            nextSources: move.nextSources,
            movedFiles: [move.file],
            overwritten: move.overwritten,
            fromPath: move.fromFile.publicPath,
            toPath: move.file.publicPath,
        };
    }

    const directoryMatch = findLocalDirectoryByPath(fromPath, localSources);
    const normalizedDestinationDirectory = normalizeLocalDirectoryPath(toPath);
    if (!directoryMatch || !normalizedDestinationDirectory) {
        throw new Error('local_file_not_found');
    }

    const targetMappings = directoryMatch.files.map((file) => ({
        fromPath: file.publicPath,
        toPath: `${normalizedDestinationDirectory}${file.publicPath.slice(directoryMatch.path.length)}`,
    }));
    const movedPathSet = new Set(targetMappings.map((item) => item.fromPath));
    const destinationPathSet = new Set(targetMappings.map((item) => item.toPath));
    const conflictingFiles = getLocalSourceFiles(localSources).filter((file) => (
        destinationPathSet.has(file.publicPath) && !movedPathSet.has(file.publicPath)
    ));
    if (conflictingFiles.length && !overwrite) {
        throw new Error('local_destination_exists');
    }

    const conflictPathSet = new Set(conflictingFiles.map((file) => file.publicPath));
    let nextSources = normalizeLocalSourcesSnapshot(localSources)
        .map((source) => {
            const nextFiles = source.files.filter((file) => (
                !movedPathSet.has(file.publicPath) && !(overwrite && conflictPathSet.has(file.publicPath))
            ));
            if (!nextFiles.length) return null;
            return {
                ...source,
                files: nextFiles,
            };
        })
        .filter(Boolean);

    const movedFiles = [];
    targetMappings.forEach((mapping) => {
        const sourceFile = directoryMatch.files.find((file) => file.publicPath === mapping.fromPath);
        const upsert = upsertLocalSourceFile(nextSources, mapping.toPath, sourceFile?.content ?? '');
        const movedFile = {
            ...upsert.file,
            originalContent: sourceFile?.originalContent ?? upsert.file.originalContent,
        };
        nextSources = upsert.nextSources.map((source) => {
            if (source.label !== getLocalSourceLabelFromPath(mapping.toPath)) return source;
            return {
                ...source,
                files: source.files.map((file) => (
                    file.publicPath === mapping.toPath ? movedFile : file
                )),
            };
        });
        movedFiles.push(movedFile);
    });

    return {
        mode: 'directory',
        nextSources,
        movedFiles,
        overwritten: conflictingFiles.length > 0,
        fromPath: directoryMatch.path,
        toPath: normalizedDestinationDirectory,
    };
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

async function loadJsApiManifest(signal) {
    if (jsApiManifestCache) return jsApiManifestCache;
    const response = await fetch(JSAPI_MANIFEST_PATH, {
        cache: 'no-cache',
        signal,
    });
    if (!response.ok) {
        throw new Error(`jsapi_manifest_load_failed:${response.status}`);
    }
    jsApiManifestCache = await response.json();
    return jsApiManifestCache;
}

async function loadJsApiRuntimeModule() {
    if (!jsApiRuntimeModulePromise) {
        jsApiRuntimeModulePromise = import('./dist/jsapi-runtime.js');
    }
    return jsApiRuntimeModulePromise;
}

function createAllowedPathTree(paths = [], prefix = '') {
    const root = { allowSelf: false, children: new Map() };
    paths.forEach((item) => {
        const pathText = String(item || '').trim();
        if (!pathText.startsWith(prefix)) return;
        const remainder = pathText.slice(prefix.length);
        const segments = remainder.split('.').filter(Boolean);
        if (!segments.length) return;

        let current = root;
        segments.forEach((segment, index) => {
            if (!current.children.has(segment)) {
                current.children.set(segment, { allowSelf: false, children: new Map() });
            }
            current = current.children.get(segment);
            if (index === segments.length - 1) {
                current.allowSelf = true;
            }
        });
    });
    return root;
}

function cloneDocumentedValue(sourceValue, treeNode) {
    if (!treeNode) return undefined;
    const hasChildren = treeNode.children.size > 0;

    if (!hasChildren) {
        return sourceValue;
    }

    const target = Object.create(null);
    treeNode.children.forEach((childNode, key) => {
        if (sourceValue == null || !(key in sourceValue)) return;
        const clonedChild = cloneDocumentedValue(sourceValue[key], childNode);
        if (clonedChild !== undefined) {
            target[key] = clonedChild;
        }
    });
    return Object.freeze(target);
}

function cloneDocumentedNamespace(sourceNamespace, tree, wrappers = {}) {
    const target = Object.create(null);
    tree.children.forEach((childNode, key) => {
        if (sourceNamespace == null || !(key in sourceNamespace)) return;
        const pathKey = key;
        if (pathKey in wrappers) {
            target[key] = wrappers[pathKey];
            return;
        }
        const clonedChild = cloneDocumentedValue(sourceNamespace[key], childNode);
        if (clonedChild !== undefined) {
            target[key] = clonedChild;
        }
    });
    return Object.freeze(target);
}

function buildDocumentedJsApiContext(rawContext, manifest = {}) {
    const ctxTree = createAllowedPathTree(Array.isArray(manifest.allowedPaths) ? manifest.allowedPaths : [], 'ctx.');
    return cloneDocumentedNamespace(rawContext, ctxTree);
}

function buildDocumentedJsApiNamespace(manifest = {}, documentedContext) {
    const slashRuntimeNamespace = {
        ...slashCommandsModule,
        SlashCommandParser,
        SlashCommand,
        ARGUMENT_TYPE,
        SlashCommandArgument,
        SlashCommandNamedArgument,
    };

    return Object.freeze({
        script: cloneDocumentedNamespace(
            scriptModule,
            createAllowedPathTree(Array.isArray(manifest.allowedPaths) ? manifest.allowedPaths : [], 'st.script.'),
        ),
        extensions: cloneDocumentedNamespace(
            extensionsModule,
            createAllowedPathTree(Array.isArray(manifest.allowedPaths) ? manifest.allowedPaths : [], 'st.extensions.'),
            {
                getContext: () => documentedContext,
            },
        ),
        slash: cloneDocumentedNamespace(
            slashRuntimeNamespace,
            createAllowedPathTree(Array.isArray(manifest.allowedPaths) ? manifest.allowedPaths : [], 'st.slash.'),
        ),
    });
}

function normalizeWorkspaceName(input) {
    const raw = String(input || DEFAULT_WORKSPACE_FILE).trim() || DEFAULT_WORKSPACE_FILE;
    const sanitized = raw.replace(/[^a-zA-Z0-9_.-]/g, '_').replace(/^_+/, '');
    const prefixed = sanitized.startsWith(WORKSPACE_PREFIX) ? sanitized : `${WORKSPACE_PREFIX}${sanitized}`;
    return prefixed || DEFAULT_WORKSPACE_FILE;
}

function normalizeSkillSlug(input) {
    return String(input || '')
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 64);
}

function normalizeSkillFileName(input) {
    const raw = String(input || '').trim();
    if (!raw) return '';
    const sanitized = raw.replace(/[^a-zA-Z0-9_.-]/g, '_').replace(/^_+/, '');
    if (!sanitized) return '';
    const withoutExtension = sanitized.replace(/\.md$/i, '');
    const withPrefix = withoutExtension.startsWith(SKILL_FILE_PREFIX)
        ? withoutExtension
        : `${SKILL_FILE_PREFIX}${withoutExtension.replace(/^LittleWhiteBox_Assistant_/, '')}`;
    return `${withPrefix}.md`;
}

function safeJsonString(value) {
    return JSON.stringify(String(value ?? ''));
}

function getMissingGenerateSkillSaveFields(args = {}) {
    const requiredRequestFields = ['triggers', 'slashTriggers'];

    return requiredRequestFields.filter((field) => !Object.prototype.hasOwnProperty.call(args, field));
}

function normalizeSkillCatalogEntry(entry = {}) {
    if (!entry || typeof entry !== 'object') return null;
    const id = String(entry.id || '').trim();
    const title = String(entry.title || '').trim();
    const filename = normalizeSkillFileName(entry.filename || '');
    if (!id || !title || !filename) return null;
    const seenTriggers = new Set();
    const triggers = Array.isArray(entry.triggers)
        ? entry.triggers
            .map((item) => String(item || '').trim())
            .filter(Boolean)
            .filter((item) => {
                const lowered = item.toLowerCase();
                if (seenTriggers.has(lowered)) return false;
                seenTriggers.add(lowered);
                return true;
            })
        : [];
    const seenSlashTriggers = new Set();
    const slashTriggers = Array.isArray(entry.slashTriggers)
        ? entry.slashTriggers
            .map((item) => normalizeSlashSkillTrigger(item))
            .filter(Boolean)
            .filter((item) => {
                if (seenSlashTriggers.has(item)) return false;
                seenSlashTriggers.add(item);
                return true;
            })
        : [];
    return {
        id,
        title,
        summary: String(entry.summary || '').trim(),
        filename,
        triggers,
        slashTriggers,
        enabled: entry.enabled !== false,
        updatedAt: String(entry.updatedAt || '').trim() || new Date().toISOString(),
    };
}

function normalizeSkillsCatalog(catalog = {}) {
    const skills = Array.isArray(catalog.skills)
        ? catalog.skills.map(normalizeSkillCatalogEntry).filter(Boolean)
        : [];
    return {
        version: 1,
        skills,
    };
}

function serializeSkillsCatalog(catalog = EMPTY_SKILLS_CATALOG) {
    return `${JSON.stringify(normalizeSkillsCatalog(catalog), null, 2)}\n`;
}

function parseSkillsCatalog(text = '') {
    const parsed = JSON.parse(String(text || '{}'));
    return normalizeSkillsCatalog(parsed);
}

function buildSkillsPromptSummary(catalog = EMPTY_SKILLS_CATALOG) {
    const enabledSkills = (catalog.skills || []).filter((item) => item.enabled !== false);
    if (!enabledSkills.length) return '';
    const visibleSkills = enabledSkills.slice(0, MAX_SKILL_PROMPT_ITEMS);
    const lines = [
        '技能目录摘要：只注入目录，不注入正文；命中某项后先读目录，再按需读取对应 skill。',
    ];
    visibleSkills.forEach((skill) => {
        lines.push(`- ${skill.title}｜${skill.summary || '无摘要'}｜触发词: ${(skill.triggers || []).join(', ') || '无'}｜文件: ${skill.filename}`);
    });
    if (enabledSkills.length > visibleSkills.length) {
        lines.push(`- 其余 ${enabledSkills.length - visibleSkills.length} 条技能未注入；如需查看，请调用 ReadSkillsCatalog。`);
    }
    return lines.join('\n');
}

function buildSkillFileContent({
    id,
    title,
    summary,
    triggers,
    slashTriggers,
    whenToUse,
    enabled,
    createdAt,
    updatedAt,
    body,
}) {
    const triggerLines = Array.isArray(triggers) && triggers.length
        ? triggers.map((item) => `  - ${safeJsonString(item)}`).join('\n')
        : '  - "skill"';
    const slashTriggerLines = Array.isArray(slashTriggers) && slashTriggers.length
        ? slashTriggers.map((item) => `  - ${safeJsonString(item)}`).join('\n')
        : '';
    const normalizedBody = String(body || '').trim();
    return [
        '---',
        `id: ${safeJsonString(id)}`,
        `title: ${safeJsonString(title)}`,
        `summary: ${safeJsonString(summary)}`,
        'triggers:',
        triggerLines,
        ...(slashTriggerLines ? ['slash_triggers:', slashTriggerLines] : []),
        `when_to_use: ${safeJsonString(whenToUse)}`,
        `enabled: ${enabled !== false ? 'true' : 'false'}`,
        `created_at: ${safeJsonString(createdAt)}`,
        `updated_at: ${safeJsonString(updatedAt)}`,
        '---',
        '',
        normalizedBody,
        '',
    ].join('\n');
}

function parseStructuredSkillFile(content = '') {
    const text = String(content || '');
    const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
    if (!match) return null;

    const frontmatter = match[1];
    const body = String(match[2] || '').replace(/\s+$/, '');
    const parsed = {
        body,
        triggers: [],
        slashTriggers: [],
    };

    const lines = frontmatter.split(/\r?\n/);
    let index = 0;
    while (index < lines.length) {
        const line = lines[index];
        if (!line) {
            index += 1;
            continue;
        }

        if (line.startsWith('triggers:') || line.startsWith('slash_triggers:')) {
            const targetKey = line.startsWith('slash_triggers:') ? 'slashTriggers' : 'triggers';
            index += 1;
            while (index < lines.length && /^\s*-\s+/.test(lines[index])) {
                const triggerValue = lines[index].replace(/^\s*-\s+/, '').trim();
                try {
                    parsed[targetKey].push(JSON.parse(triggerValue));
                } catch {
                    parsed[targetKey].push(triggerValue.replace(/^"+|"+$/g, ''));
                }
                index += 1;
            }
            continue;
        }

        const separatorIndex = line.indexOf(':');
        if (separatorIndex <= 0) {
            index += 1;
            continue;
        }

        const key = line.slice(0, separatorIndex).trim();
        const rawValue = line.slice(separatorIndex + 1).trim();
        if (!key) {
            index += 1;
            continue;
        }

        if (rawValue === 'true' || rawValue === 'false') {
            parsed[key] = rawValue === 'true';
        } else if (rawValue) {
            try {
                parsed[key] = JSON.parse(rawValue);
            } catch {
                parsed[key] = rawValue.replace(/^"+|"+$/g, '');
            }
        } else {
            parsed[key] = '';
        }
        index += 1;
    }

    return parsed;
}

function validateSkillBody(content = '') {
    const requiredSections = [
        '# Goal',
        '# When to Use',
        '# Inputs',
        '# Workflow',
        '# Pitfalls',
        '# Examples',
        '# References',
    ];
    const normalized = String(content || '');
    const missing = requiredSections.filter((section) => !normalized.includes(section));
    return {
        ok: missing.length === 0,
        missing,
    };
}

function createSkillProposalToken(payload = {}) {
    const token = `skill-proposal-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    activeSkillProposalTokens.set(token, {
        ...payload,
        createdAt: Date.now(),
    });
    return token;
}

function getSkillProposalToken(token) {
    const normalized = String(token || '').trim();
    if (!normalized) return null;
    return activeSkillProposalTokens.get(normalized) || null;
}

function deleteSkillProposalToken(token) {
    const normalized = String(token || '').trim();
    if (!normalized) return;
    activeSkillProposalTokens.delete(normalized);
}

function ensureNotAborted(signal) {
    if (signal?.aborted) {
        throw new Error('tool_aborted');
    }
}

async function readTextFile(publicPath, options = {}) {
    const cacheKey = String(publicPath || '').trim();
    if (!cacheKey) throw new Error('empty_path');
    const localEntry = findLocalSourceFileByPath(cacheKey, options.localSources);
    if (localEntry) {
        return localEntry.content;
    }
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

function normalizeDirectReadablePublicPath(rawPath) {
    const normalized = String(rawPath || '').trim().replace(/\\/g, '/').replace(/^\/+/, '');
    if (!normalized) return '';
    if (normalized.includes('..')) return '';
    if (normalized.includes('?') || normalized.includes('#')) return '';
    if (normalized.startsWith('api/') || normalized.startsWith('user/')) return '';

    if (!isSupportedPublicTextPath(normalized)) return '';
    return normalized;
}

function pathExtension(pathText = '') {
    return getPathExtension(pathText);
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
    const files = getAllIndexedFiles(manifest, options.localSources);
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
    const files = getAllIndexedFiles(manifest, options.localSources);
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
    const directReadablePath = normalizeDirectReadablePublicPath(targetPath);
    const indexedFiles = getAllIndexedFiles(manifest, options.localSources);
    const entry = indexedFiles.find((item) => item.publicPath === targetPath)
        || (directReadablePath
            ? {
                publicPath: directReadablePath,
                relativePath: directReadablePath,
                source: 'direct-public-path',
                extension: pathExtension(directReadablePath),
            }
            : null);
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

async function writeLocalFile(args = {}, options = {}) {
    const targetPath = normalizeWritableLocalPath(args.path);
    if (!targetPath) {
        throw new Error(getWritableLocalPathError(args.path));
    }

    const content = typeof args.content === 'string'
        ? args.content
        : String(args.content ?? '');
    const existingEntry = findLocalSourceFileByPath(targetPath, options.localSources);
    const update = upsertLocalSourceFile(options.localSources, targetPath, content);
    options.onLocalSourcesUpdated?.(update.nextSources);

    return {
        ok: true,
        path: update.file.publicPath,
        source: update.file.source,
        mode: existingEntry ? 'overwrite' : 'create',
        created: !existingEntry,
        overwritten: !!existingEntry,
        sizeBytes: update.file.sizeBytes,
        totalLines: content === '' ? 0 : content.split('\n').length,
    };
}

async function editLocalFile(args = {}, options = {}) {
    const targetPath = normalizeWritableLocalPath(args.path);
    if (!targetPath) {
        throw new Error(getWritableLocalPathError(args.path));
    }

    const existingEntry = findLocalSourceFileByPath(targetPath, options.localSources);
    if (!existingEntry) {
        throw new Error('local_file_not_found');
    }

    const oldText = typeof args.oldText === 'string'
        ? args.oldText
        : String(args.oldText ?? '');
    if (!oldText) {
        throw new Error('edit_old_text_required');
    }

    const newText = typeof args.newText === 'string'
        ? args.newText
        : String(args.newText ?? '');
    const replaceAll = !!args.replaceAll;
    const matchCount = countOccurrences(existingEntry.content, oldText);
    if (matchCount <= 0) {
        throw new Error('edit_not_found');
    }
    if (matchCount > 1 && !replaceAll) {
        throw new Error('edit_not_unique');
    }

    const nextContent = replaceAll
        ? existingEntry.content.split(oldText).join(newText)
        : replaceFirstOccurrence(existingEntry.content, oldText, newText);
    const update = upsertLocalSourceFile(options.localSources, targetPath, nextContent);
    options.onLocalSourcesUpdated?.(update.nextSources);

    return {
        ok: true,
        path: update.file.publicPath,
        source: update.file.source,
        replacedOccurrences: replaceAll ? matchCount : 1,
        replaceAll,
        sizeBytes: update.file.sizeBytes,
        totalLines: nextContent === '' ? 0 : nextContent.split('\n').length,
    };
}

async function deleteLocalFile(args = {}, options = {}) {
    const rawPath = String(args.path || '').trim();
    const targetFilePath = normalizeWritableLocalPath(rawPath);
    const targetDirectoryPath = normalizeLocalDirectoryPath(rawPath);
    if (!targetFilePath && !targetDirectoryPath) {
        throw new Error(getWritableLocalPathError(args.path) || 'local_path_required');
    }

    const removal = removeLocalSourcePath(options.localSources, rawPath);
    options.onLocalSourcesUpdated?.(removal.nextSources);

    return {
        ok: true,
        path: removal.mode === 'directory'
            ? targetDirectoryPath
            : removal.removedFiles[0]?.publicPath || targetFilePath,
        source: removal.removedFiles[0]?.source || 'session-local-source',
        mode: removal.mode,
        removedCount: removal.removedFiles.length,
    };
}

async function moveLocalFile(args = {}, options = {}) {
    const rawFromPath = String(args.fromPath || '').trim();
    const rawToPath = String(args.toPath || '').trim();
    const fromFilePath = normalizeWritableLocalPath(rawFromPath);
    const fromDirectoryPath = normalizeLocalDirectoryPath(rawFromPath);
    const toFilePath = normalizeWritableLocalPath(rawToPath);
    const toDirectoryPath = normalizeLocalDirectoryPath(rawToPath);
    if (!fromFilePath && !fromDirectoryPath) {
        throw new Error(getWritableLocalPathError(args.fromPath) || 'local_path_required');
    }
    if (!(fromFilePath ? toFilePath : toDirectoryPath)) {
        throw new Error(getWritableLocalPathError(args.toPath) || 'local_path_required');
    }

    const overwrite = !!args.overwrite;
    const move = moveLocalSourcePath(options.localSources, rawFromPath, rawToPath, { overwrite });
    options.onLocalSourcesUpdated?.(move.nextSources);

    return {
        ok: true,
        fromPath: move.fromPath,
        toPath: move.toPath,
        source: move.movedFiles[0]?.source || 'session-local-source',
        overwritten: move.overwritten,
        mode: move.mode,
        movedCount: move.movedFiles.length,
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
    const files = getAllIndexedFiles(manifest, options.localSources);
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

async function writeUserFile(name, content, options = {}) {
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

async function deleteUserFile(name, options = {}) {
    const response = await fetch('/api/files/delete', {
        method: 'POST',
        signal: options.signal,
        headers: {
            ...getRequestHeaders(),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            path: `user/files/${name}`,
        }),
    });

    if (response.status === 404) {
        return {
            name,
            deleted: false,
            exists: false,
            path: `user/files/${name}`,
        };
    }

    if (!response.ok) {
        const message = await response.text().catch(() => '');
        throw new Error(`workspace_delete_failed:${response.status}:${message}`);
    }

    return {
        name,
        deleted: true,
        exists: true,
        path: `user/files/${name}`,
    };
}

async function readUserFile(name, options = {}) {
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

async function ensureUserFile(name, defaultContent = '', options = {}) {
    const existing = await readUserFile(name, options);
    if (existing.exists) {
        return {
            ...existing,
            created: false,
        };
    }

    await writeUserFile(name, defaultContent, options);
    return {
        name,
        exists: true,
        content: defaultContent,
        created: true,
    };
}

async function ensureSkillsCatalogFile(options = {}) {
    return ensureUserFile(DEFAULT_SKILLS_FILE, serializeSkillsCatalog(EMPTY_SKILLS_CATALOG), options);
}

async function readSkillsCatalogData(options = {}) {
    const file = await ensureSkillsCatalogFile(options);
    try {
        const catalog = parseSkillsCatalog(file.content || '');
        return {
            ok: true,
            name: file.name,
            catalog,
            summaryText: buildSkillsPromptSummary(catalog),
            content: serializeSkillsCatalog(catalog),
        };
    } catch (error) {
        return {
            ok: false,
            name: file.name,
            error: 'skills_catalog_invalid',
            message: error instanceof Error ? error.message : String(error || 'invalid_json'),
            catalog: normalizeSkillsCatalog(EMPTY_SKILLS_CATALOG),
            summaryText: '',
            content: String(file.content || ''),
        };
    }
}

async function writeSkillsCatalogData(catalog, options = {}) {
    const normalized = normalizeSkillsCatalog(catalog);
    const content = serializeSkillsCatalog(normalized);
    const file = await writeUserFile(DEFAULT_SKILLS_FILE, content, options);
    return {
        name: file.name,
        path: file.path,
        catalog: normalized,
        content,
        summaryText: buildSkillsPromptSummary(normalized),
    };
}

function createUniqueSkillIdentity(title, catalog = EMPTY_SKILLS_CATALOG) {
    const baseSlug = normalizeSkillSlug(title) || `skill-${Date.now()}`;
    const existingIds = new Set((catalog.skills || []).map((item) => item.id));
    const existingFiles = new Set((catalog.skills || []).map((item) => item.filename));
    let slug = baseSlug;
    let suffix = 1;
    let id = `skill-${slug}`;
    let filename = `${SKILL_FILE_PREFIX}${slug}.md`;
    while (existingIds.has(id) || existingFiles.has(filename)) {
        slug = `${baseSlug}-${suffix}`;
        id = `skill-${slug}`;
        filename = `${SKILL_FILE_PREFIX}${slug}.md`;
        suffix += 1;
    }
    return { id, filename, slug };
}

async function readSkillsCatalogTool(_args = {}, options = {}) {
    const result = await readSkillsCatalogData(options);
    if (!result.ok) {
        return {
            ok: false,
            name: result.name,
            error: result.error,
            message: `Skills.json 解析失败：${result.message}`,
            details: String(result.content || ''),
        };
    }
    return {
        ok: true,
        name: result.name,
        version: result.catalog.version,
        total: result.catalog.skills.length,
        enabledCount: result.catalog.skills.filter((item) => item.enabled !== false).length,
        skills: result.catalog.skills,
        summaryText: result.summaryText,
        content: result.content,
    };
}

async function readSkillTool(args = {}, options = {}) {
    const byId = String(args.id || '').trim();
    const byFilename = normalizeSkillFileName(args.filename || '');
    if (!byId && !byFilename) {
        return {
            ok: false,
            error: 'skill_identifier_required',
            message: '必须提供 id 或 filename 其中之一。',
        };
    }

    const catalogResult = await readSkillsCatalogData(options);
    if (!catalogResult.ok) {
        return {
            ok: false,
            error: catalogResult.error,
            message: `Skills.json 解析失败：${catalogResult.message}`,
        };
    }

    const skill = byId
        ? catalogResult.catalog.skills.find((item) => item.id === byId)
        : catalogResult.catalog.skills.find((item) => item.filename === byFilename);

    if (!skill) {
        return {
            ok: false,
            error: 'skill_not_found',
            message: byId ? `目录里找不到 id 为 ${byId} 的 skill。` : `目录里找不到文件 ${byFilename} 对应的 skill。`,
        };
    }

    const file = await readUserFile(skill.filename, options);
    if (!file.exists) {
        return {
            ok: false,
            error: 'skill_file_not_found',
            message: `skill 文件不存在：${skill.filename}`,
            id: skill.id,
            filename: skill.filename,
        };
    }

    return {
        ok: true,
        id: skill.id,
        title: skill.title,
        summary: skill.summary,
        filename: skill.filename,
        triggers: skill.triggers,
        slashTriggers: skill.slashTriggers,
        enabled: skill.enabled,
        updatedAt: skill.updatedAt,
        content: String(file.content || ''),
    };
}

async function updateSkillTool(args = {}, options = {}) {
    const byId = String(args.id || '').trim();
    const byFilename = normalizeSkillFileName(args.filename || '');
    if (!byId && !byFilename) {
        return {
            ok: false,
            error: 'skill_identifier_required',
            message: '必须提供 id 或 filename 其中之一。',
        };
    }

    const catalogResult = await readSkillsCatalogData(options);
    if (!catalogResult.ok) {
        return {
            ok: false,
            error: catalogResult.error,
            message: `Skills.json 解析失败：${catalogResult.message}`,
        };
    }

    const skill = byId
        ? catalogResult.catalog.skills.find((item) => item.id === byId)
        : catalogResult.catalog.skills.find((item) => item.filename === byFilename);

    if (!skill) {
        return {
            ok: false,
            error: 'skill_not_found',
            message: byId ? `目录里找不到 id 为 ${byId} 的 skill。` : `目录里找不到文件 ${byFilename} 对应的 skill。`,
        };
    }

    const file = await readUserFile(skill.filename, options);
    if (!file.exists) {
        return {
            ok: false,
            error: 'skill_file_not_found',
            message: `skill 文件不存在：${skill.filename}`,
            id: skill.id,
            filename: skill.filename,
        };
    }

    const parsedFile = parseStructuredSkillFile(file.content || '');
    if (!parsedFile) {
        return {
            ok: false,
            error: 'skill_file_invalid',
            message: `skill 文件格式无效，无法更新：${skill.filename}`,
            id: skill.id,
            filename: skill.filename,
        };
    }

    const title = String(args.title || '').trim() || skill.title;
    const summary = String(args.summary || '').trim() || skill.summary;
    const whenToUse = String(args.when_to_use || '').trim() || String(parsedFile.when_to_use || '').trim();
    const content = String(args.content || '').trim() || String(parsedFile.body || '').trim();
    const enabled = typeof args.enabled === 'boolean' ? args.enabled : skill.enabled !== false;
    const createdAt = String(parsedFile.created_at || '').trim() || new Date().toISOString();
    const seenTriggers = new Set();
    const rawTriggers = Array.isArray(args.triggers)
        ? args.triggers
        : (Array.isArray(parsedFile.triggers) && parsedFile.triggers.length ? parsedFile.triggers : skill.triggers);
    const triggers = rawTriggers
        .map((item) => String(item || '').trim())
        .filter(Boolean)
        .filter((item) => {
            const lowered = item.toLowerCase();
            if (seenTriggers.has(lowered)) return false;
            seenTriggers.add(lowered);
            return true;
        });
    const seenSlashTriggers = new Set();
    const rawSlashTriggers = Array.isArray(args.slashTriggers)
        ? args.slashTriggers
        : (Array.isArray(parsedFile.slashTriggers) && parsedFile.slashTriggers.length ? parsedFile.slashTriggers : skill.slashTriggers);
    const slashTriggers = rawSlashTriggers
        .map((item) => normalizeSlashSkillTrigger(item))
        .filter(Boolean)
        .filter((item) => {
            if (seenSlashTriggers.has(item)) return false;
            seenSlashTriggers.add(item);
            return true;
        });

    if (!title) {
        return {
            ok: false,
            error: 'skill_title_required',
            message: '更新 skill 时 title 不能为空。',
        };
    }
    if (!summary) {
        return {
            ok: false,
            error: 'skill_summary_required',
            message: '更新 skill 时 summary 不能为空。',
        };
    }
    if (!whenToUse) {
        return {
            ok: false,
            error: 'skill_when_to_use_required',
            message: '更新 skill 时 when_to_use 不能为空。',
        };
    }
    if (!content) {
        return {
            ok: false,
            error: 'skill_content_required',
            message: '更新 skill 时正文不能为空。',
        };
    }

    const validation = validateSkillBody(content);
    if (!validation.ok) {
        return {
            ok: false,
            error: 'skill_sections_missing',
            message: `skill 正文缺少必填章节：${validation.missing.join('、')}`,
        };
    }

    const now = new Date().toISOString();
    const fileContent = buildSkillFileContent({
        id: skill.id,
        title,
        summary,
        triggers,
        slashTriggers,
        whenToUse,
        enabled,
        createdAt,
        updatedAt: now,
        body: content,
    });
    await writeUserFile(skill.filename, fileContent, options);

    const nextCatalog = normalizeSkillsCatalog({
        ...catalogResult.catalog,
        skills: catalogResult.catalog.skills.map((item) => item.id === skill.id
            ? {
                ...item,
                title,
                summary,
                triggers,
                slashTriggers,
                enabled,
                updatedAt: now,
            }
            : item),
    });
    await writeSkillsCatalogData(nextCatalog, options);

    return {
        ok: true,
        id: skill.id,
        title,
        filename: skill.filename,
        enabled,
        updatedAt: now,
        note: '技能正文和 Skills.json 已更新，当前会话技能目录会立即刷新。',
    };
}

async function generateSkillTool(args = {}, options = {}) {
    const action = String(args.action || '').trim();
    if (action !== 'propose' && action !== 'save') {
        return {
            ok: false,
            error: 'skill_action_required',
            message: 'GenerateSkill 必须提供 action=propose 或 action=save。',
        };
    }

    const catalogResult = await readSkillsCatalogData(options);
    if (!catalogResult.ok) {
        return {
            ok: false,
            error: catalogResult.error,
            message: `Skills.json 解析失败：${catalogResult.message}`,
        };
    }

    if (action === 'propose') {
        const title = String(args.title || '').trim();
        const reason = String(args.reason || '').trim();
        const sourceSummary = String(args.sourceSummary || '').trim();
        if (!title) {
            return {
                ok: false,
                error: 'skill_title_required',
                message: 'propose 阶段必须提供 title。',
            };
        }
        if (!reason) {
            return {
                ok: false,
                error: 'skill_reason_required',
                message: 'propose 阶段必须提供 reason。',
            };
        }
        if (!sourceSummary) {
            return {
                ok: false,
                error: 'skill_source_summary_required',
                message: 'propose 阶段必须提供 sourceSummary。',
            };
        }
        const suggestion = createUniqueSkillIdentity(title, catalogResult.catalog);
        const approvalToken = createSkillProposalToken({
            id: suggestion.id,
            filename: suggestion.filename,
            title,
        });
        return {
            ok: true,
            action: 'propose',
            approved: true,
            approvalToken,
            id: suggestion.id,
            filename: suggestion.filename,
            title,
            reason,
            sourceSummary,
            instructions: [
                '请把刚才完成的任务过程沉淀成一条可复用 skill。',
                '重点总结：关键步骤、分支判断、踩坑与恢复方式、适用边界。',
                '正文不要包含 frontmatter；只提交 markdown 正文，并严格包含这些章节：# Goal、# When to Use、# Inputs、# Workflow、# Pitfalls、# Examples、# References。',
                '准备好后，再调用 GenerateSkill action="save" 写入 skill。',
            ].join('\n'),
            template: {
                requiredSections: ['# Goal', '# When to Use', '# Inputs', '# Workflow', '# Pitfalls', '# Examples', '# References'],
            },
        };
    }

    const approvalToken = String(args.approvalToken || '').trim();
    const proposal = getSkillProposalToken(approvalToken);
    if (!proposal) {
        return {
            ok: false,
            error: 'skill_approval_token_invalid',
            message: 'approvalToken 无效、已过期，或已经被使用过。',
        };
    }

    const id = String(args.id || '').trim();
    if (id !== proposal.id) {
        return {
            ok: false,
            error: 'skill_id_mismatch',
            message: `save 阶段必须使用 propose 返回的 id：${proposal.id}`,
        };
    }

    const title = String(args.title || '').trim() || proposal.title;
    const summary = String(args.summary || '').trim();
    const whenToUse = String(args.when_to_use || '').trim();
    const content = String(args.content || '');
    const enabled = args.enabled !== false;
    const seenTriggers = new Set();
    const triggers = Array.isArray(args.triggers)
        ? args.triggers
            .map((item) => String(item || '').trim())
            .filter(Boolean)
            .filter((item) => {
                const lowered = item.toLowerCase();
                if (seenTriggers.has(lowered)) return false;
                seenTriggers.add(lowered);
                return true;
            })
        : [];
    const seenSlashTriggers = new Set();
    const slashTriggers = Array.isArray(args.slashTriggers)
        ? args.slashTriggers
            .map((item) => normalizeSlashSkillTrigger(item))
            .filter(Boolean)
            .filter((item) => {
                if (seenSlashTriggers.has(item)) return false;
                seenSlashTriggers.add(item);
                return true;
            })
        : [];

    if (!title) {
        return {
            ok: false,
            error: 'skill_title_required',
            message: 'save 阶段必须提供 title。',
        };
    }
    if (!summary) {
        return {
            ok: false,
            error: 'skill_summary_required',
            message: 'save 阶段必须提供 summary。',
        };
    }
    if (!whenToUse) {
        return {
            ok: false,
            error: 'skill_when_to_use_required',
            message: 'save 阶段必须提供 when_to_use。',
        };
    }
    if (!content.trim()) {
        return {
            ok: false,
            error: 'skill_content_required',
            message: 'save 阶段必须提供 skill 正文。',
        };
    }

    const validation = validateSkillBody(content);
    if (!validation.ok) {
        return {
            ok: false,
            error: 'skill_sections_missing',
            message: `skill 正文缺少必填章节：${validation.missing.join('、')}`,
        };
    }

    if (catalogResult.catalog.skills.some((item) => item.id === id || item.filename === proposal.filename)) {
        return {
            ok: false,
            error: 'skill_already_exists',
            message: `技能已存在：${id}`,
        };
    }

    const now = new Date().toISOString();
    const fileContent = buildSkillFileContent({
        id,
        title,
        summary,
        triggers,
        slashTriggers,
        whenToUse,
        enabled,
        createdAt: now,
        updatedAt: now,
        body: content,
    });
    await writeUserFile(proposal.filename, fileContent, options);

    const nextCatalog = normalizeSkillsCatalog({
        ...catalogResult.catalog,
        skills: [
            ...catalogResult.catalog.skills,
            {
                id,
                title,
                summary,
                filename: proposal.filename,
                triggers,
                slashTriggers,
                enabled,
                updatedAt: now,
            },
        ],
    });
    await writeSkillsCatalogData(nextCatalog, options);
    deleteSkillProposalToken(approvalToken);

    const missingFields = getMissingGenerateSkillSaveFields(args);
    const missingFieldsNotice = missingFields.length
        ? `本次未传关键字段：${missingFields.join('、')}。必须继续调用 UpdateSkill 补齐。`
        : '';

    return {
        ok: true,
        action: 'save',
        id,
        title,
        filename: proposal.filename,
        enabled,
        updatedAt: now,
        note: '技能正文和 Skills.json 已写入，当前会话技能目录会立即刷新。',
        ...(missingFields.length
            ? {
                missingFields,
                followUpRequired: true,
                followUpTool: TOOL_NAMES.UPDATE_SKILL,
                warning: missingFieldsNotice,
            }
            : {}),
    };
}

async function deleteSkillTool(args = {}, options = {}) {
    const byId = String(args.id || '').trim();
    const byFilename = normalizeSkillFileName(args.filename || '');
    if (!byId && !byFilename) {
        return {
            ok: false,
            error: 'skill_identifier_required',
            message: '必须提供 id 或 filename 其中之一。',
        };
    }

    const catalogResult = await readSkillsCatalogData(options);
    if (!catalogResult.ok) {
        return {
            ok: false,
            error: catalogResult.error,
            message: `Skills.json 解析失败：${catalogResult.message}`,
        };
    }

    const skill = byId
        ? catalogResult.catalog.skills.find((item) => item.id === byId)
        : catalogResult.catalog.skills.find((item) => item.filename === byFilename);

    if (!skill) {
        return {
            ok: false,
            error: 'skill_not_found',
            message: byId ? `目录里找不到 id 为 ${byId} 的 skill。` : `目录里找不到文件 ${byFilename} 对应的 skill。`,
        };
    }

    const deleteResult = await deleteUserFile(skill.filename, options);
    const nextCatalog = normalizeSkillsCatalog({
        ...catalogResult.catalog,
        skills: catalogResult.catalog.skills.filter((item) => item.id !== skill.id),
    });
    await writeSkillsCatalogData(nextCatalog, options);

    return {
        ok: true,
        id: skill.id,
        title: skill.title,
        filename: skill.filename,
        fileDeleted: deleteResult.deleted === true,
        note: deleteResult.deleted === true
            ? '技能正文文件和 Skills.json 已删除，当前会话技能目录会立即刷新。'
            : '技能目录项已删除；原 skill 文件本就不存在，当前会话技能目录会立即刷新。',
    };
}

async function readSkillsRuntimeData(options = {}) {
    const catalogResult = await readSkillsCatalogData(options);
    if (!catalogResult.ok) {
        return {
            skillsCatalog: normalizeSkillsCatalog(EMPTY_SKILLS_CATALOG),
            skillsPromptSummary: '',
            skillsCatalogError: catalogResult.message,
        };
    }
    return {
        skillsCatalog: catalogResult.catalog,
        skillsPromptSummary: catalogResult.summaryText,
        skillsCatalogError: '',
    };
}

async function readIdentityNote(_args = {}, options = {}) {
    return readUserFile(DEFAULT_IDENTITY_FILE, options);
}

async function writeIdentityNote(args = {}, options = {}) {
    const content = String(args.content || '');
    return writeUserFile(DEFAULT_IDENTITY_FILE, content, options);
}

async function writeWorkspaceNote(args = {}, options = {}) {
    const settings = getAssistantSettings();
    const name = normalizeWorkspaceName(args.name || settings.workspaceFileName || DEFAULT_WORKSPACE_FILE);
    const content = String(args.content || '');
    return writeUserFile(name, content, options);
}

async function readWorkspaceNote(_args = {}, options = {}) {
    const settings = getAssistantSettings();
    const name = normalizeWorkspaceName(settings.workspaceFileName || DEFAULT_WORKSPACE_FILE);
    return readUserFile(name, options);
}

function buildSlashExecutionState(overrides = {}) {
    return {
        interrupt: false,
        isBreak: false,
        isAborted: false,
        isQuietlyAborted: false,
        abortReason: '',
        isError: false,
        errorMessage: '',
        ...overrides,
    };
}

function normalizeSlashPipeValue(pipe) {
    if (pipe === undefined) return '';
    return pipe;
}

function buildJsApiExecutionState(overrides = {}) {
    return {
        isError: false,
        errorCode: '',
        errorMessage: '',
        isAborted: false,
        abortReason: '',
        unavailableApis: [],
        validationErrors: [],
        ...overrides,
    };
}

function buildJavaScriptApiToolResult({
    code = '',
    ok = false,
    output = '',
    execution = {},
    note = '',
    requestKind = 'unknown',
    usedApis = [],
    calledApis = [],
    calledApiSemantics = {},
    truncated = false,
    charLimited = false,
    limitReason = null,
    outputFormat = '',
    skipped = false,
} = {}) {
    return {
        code: String(code || ''),
        ok: ok === true,
        output,
        execution: buildJsApiExecutionState(execution),
        note: String(note || ''),
        requestKind: String(requestKind || 'unknown'),
        usedApis: Array.isArray(usedApis) ? usedApis.map((item) => String(item || '')).filter(Boolean) : [],
        calledApis: Array.isArray(calledApis) ? calledApis.map((item) => String(item || '')).filter(Boolean) : [],
        calledApiSemantics: calledApiSemantics && typeof calledApiSemantics === 'object'
            ? Object.fromEntries(
                Object.entries(calledApiSemantics)
                    .map(([key, value]) => [String(key || '').trim(), String(value || '').trim()])
                    .filter(([key, value]) => key && value),
            )
            : {},
        truncated: truncated === true,
        charLimited: charLimited === true,
        limitReason: limitReason ? String(limitReason) : null,
        outputFormat: outputFormat ? String(outputFormat) : '',
        ...(skipped ? { skipped: true } : {}),
    };
}

function shapeJavaScriptApiOutputForTransport(output) {
    if (output === undefined || output === '') {
        return {
            output: '',
            truncated: false,
            charLimited: false,
            limitReason: null,
            outputFormat: 'text',
        };
    }

    const outputFormat = typeof output === 'string' ? 'text' : 'json';
    const serializedOutput = typeof output === 'string'
        ? output
        : JSON.stringify(output, null, 2);

    if (serializedOutput.length <= MAX_JSAPI_RETURN_CHARS) {
        return {
            output,
            truncated: false,
            charLimited: false,
            limitReason: null,
            outputFormat,
        };
    }

    return {
        output: serializedOutput.slice(0, MAX_JSAPI_RETURN_CHARS),
        truncated: true,
        charLimited: true,
        limitReason: 'output_budget',
        outputFormat,
    };
}

async function runSlashCommand(args = {}, options = {}) {
    ensureNotAborted(options.signal);

    let command = String(args.command || '').trim();
    if (!command) {
        return {
            command: '',
            ok: false,
            pipe: '',
            execution: buildSlashExecutionState({
                isError: true,
                errorMessage: 'slash_command_required',
            }),
            note: '必须提供要执行的斜杠命令。',
        };
    }

    if (!command.startsWith('/')) {
        command = `/${command}`;
    }

    try {
        const context = getContext();
        if (typeof context.executeSlashCommandsWithOptions !== 'function') {
            throw new Error('executeSlashCommandsWithOptions 函数不可用');
        }

        const substitutedCommand = typeof context.substituteParams === 'function'
            ? context.substituteParams(command)
            : command;
        command = String(substitutedCommand || command || '').trim() || command;

        const result = await context.executeSlashCommandsWithOptions(command, {
            handleParserErrors: false,
            handleExecutionErrors: false,
            source: 'littlewhitebox-assistant',
        });
        ensureNotAborted(options.signal);

        const execution = buildSlashExecutionState(result && typeof result === 'object'
            ? {
                interrupt: result.interrupt === true,
                isBreak: result.isBreak === true,
                isAborted: result.isAborted === true,
                isQuietlyAborted: result.isQuietlyAborted === true,
                abortReason: String(result.abortReason || ''),
                isError: result.isError === true,
                errorMessage: String(result.errorMessage || ''),
            }
            : {});

        return {
            command,
            ok: execution.isError !== true && execution.isAborted !== true,
            pipe: normalizeSlashPipeValue(result?.pipe),
            execution,
            note: '',
        };
    } catch (error) {
        ensureNotAborted(options.signal);
        return {
            command,
            ok: false,
            pipe: '',
            execution: buildSlashExecutionState({
                isError: true,
                errorMessage: error instanceof Error ? error.message : String(error || 'unknown_error'),
            }),
            note: '',
        };
    }
}

async function runJavaScriptApi(args = {}, options = {}) {
    ensureNotAborted(options.signal);

    const code = String(args.code || '').trim();
    const purpose = String(args.purpose || '').trim();
    const safety = String(args.safety || '').trim();
    const expectedOutput = String(args.expectedOutput || '').trim();
    const apiPaths = Array.isArray(args.apiPaths) ? args.apiPaths : [];

    try {
        const [manifest, runtimeModule] = await Promise.all([
            loadJsApiManifest(options.signal),
            loadJsApiRuntimeModule(),
        ]);
        ensureNotAborted(options.signal);

        const rawContext = getContext();
        const documentedContext = buildDocumentedJsApiContext(rawContext, manifest);
        const st = buildDocumentedJsApiNamespace(manifest, documentedContext);
        const result = await runtimeModule.runJavaScriptApi({
            code,
            purpose,
            apiPaths,
            safety,
            expectedOutput,
            manifest,
            ctx: documentedContext,
            st,
        });
        ensureNotAborted(options.signal);
        const shapedOutput = shapeJavaScriptApiOutputForTransport(result?.output);
        const shapedNote = shapedOutput.charLimited
            ? [
                String(result?.note || '').trim(),
                '输出已截断：优先只读需要的字段，先用 Object.keys() 看结构，避免整对象 JSON.stringify。',
            ].filter(Boolean).join(' ')
            : result?.note;
        return buildJavaScriptApiToolResult({
            ...result,
            ...shapedOutput,
            note: shapedNote,
        });
    } catch (error) {
        ensureNotAborted(options.signal);
        return buildJavaScriptApiToolResult({
            code,
            ok: false,
            output: '',
            execution: {
                isError: true,
                errorCode: 'jsapi_runtime_unavailable',
                errorMessage: error instanceof Error ? error.message : String(error || 'jsapi_runtime_unavailable'),
                isAborted: false,
                abortReason: '',
                unavailableApis: [],
                validationErrors: [],
            },
            requestKind: 'unknown',
            usedApis: [],
            calledApis: [],
            note: [code, purpose, expectedOutput].every(Boolean)
                ? ''
                : '必须至少提供 code、purpose、expectedOutput；effect 请求还需要精确 apiPaths。',
        });
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
        case TOOL_NAMES.WRITE:
            return await writeLocalFile(args, options);
        case TOOL_NAMES.EDIT:
            return await editLocalFile(args, options);
        case TOOL_NAMES.DELETE:
            return await deleteLocalFile(args, options);
        case TOOL_NAMES.MOVE:
            return await moveLocalFile(args, options);
        case TOOL_NAMES.RUN_SLASH_COMMAND:
            return await runSlashCommand(args, options);
        case TOOL_NAMES.RUN_JAVASCRIPT_API:
            return await runJavaScriptApi(args, options);
        case TOOL_NAMES.READ_IDENTITY:
            return await readIdentityNote(args, options);
        case TOOL_NAMES.WRITE_IDENTITY:
            return await writeIdentityNote(args, options);
        case TOOL_NAMES.READ_WORKLOG:
            return await readWorkspaceNote(args, options);
        case TOOL_NAMES.WRITE_WORKLOG:
            return await writeWorkspaceNote(args, options);
        case TOOL_NAMES.READ_SKILLS_CATALOG:
            return await readSkillsCatalogTool(args, options);
        case TOOL_NAMES.READ_SKILL:
            return await readSkillTool(args, options);
        case TOOL_NAMES.UPDATE_SKILL:
            return await updateSkillTool(args, options);
        case TOOL_NAMES.GENERATE_SKILL:
            return await generateSkillTool(args, options);
        case TOOL_NAMES.DELETE_SKILL:
            return await deleteSkillTool(args, options);
        default:
            throw new Error(`unsupported_tool:${name}`);
    }
}

function getAssistantHostWindow() {
    if (!hostWindow) {
        hostWindow = createAssistantHostWindow({
            overlayId: OVERLAY_ID,
            minimizedStyleId: MINIMIZED_STYLE_ID,
            htmlPath: HTML_PATH,
            onCloseRequest: () => closeAssistant(),
        });
    }
    return hostWindow;
}

function openAssistant() {
    if (!getAssistantHostWindow().open()) return;

    // Guarded inside handleIframeMessage via isTrustedIframeEvent.
    // eslint-disable-next-line no-restricted-syntax
    window.addEventListener('message', handleIframeMessage);
}

function closeAssistant() {
    window.removeEventListener('message', handleIframeMessage);
    getAssistantHostWindow().close();
    localSourcesCache = [];
}

async function handleIframeMessage(event) {
    const iframe = getAssistantHostWindow().getIframe();
    if (!isTrustedIframeEvent(event, iframe)) return;
    if (!event.data?.type?.startsWith('xb-assistant:')) return;

    const { type, payload } = event.data;

    switch (type) {
        case 'xb-assistant:ready': {
            await loadAssistantSettings();
            const config = buildRuntimeConfig();
            postToIframe(iframe, {
                type: 'xb-assistant:config',
                payload: {
                    config,
                    runtime: await buildAssistantRuntimePayload(),
                },
            });
            postEditorContextToIframe();
            break;
        }
        case 'xb-assistant:close':
            closeAssistant();
            break;
        case 'xb-assistant:save-config': {
            const patch = payload && typeof payload === 'object' ? payload : {};
            const requestId = String(patch.requestId || '');
            const current = getAssistantSettings();
            const next = normalizeAssistantSettings({
                ...current,
                workspaceFileName: normalizeWorkspaceName(patch.workspaceFileName || current.workspaceFileName),
                currentPresetName: normalizePresetName(patch.currentPresetName || current.currentPresetName),
                presets: patch.presets && typeof patch.presets === 'object'
                    ? patch.presets
                    : current.presets,
            }, {
                defaultWorkspaceFileName: DEFAULT_WORKSPACE_FILE,
                normalizeWorkspaceName,
            });

            const result = await persistAssistantSettings(next, { silent: false });
            if (result.ok) {
                postToIframe(iframe, {
                    type: CONFIG_SAVED,
                    payload: {
                        requestId,
                        config: buildRuntimeConfig(),
                    },
                });
            } else {
                postToIframe(iframe, {
                    type: CONFIG_SAVE_ERROR,
                    payload: {
                        requestId,
                        error: result.error || '保存失败',
                        config: buildRuntimeConfig(),
                    },
                });
            }
            break;
        }
        case 'xb-assistant:local-sources-sync':
            localSourcesCache = normalizeLocalSourcesSnapshot(payload?.localSources);
            break;
        case 'xb-assistant:tool-call': {
            const requestId = payload?.requestId || '';
            const toolName = payload?.name || '';
            const args = payload?.arguments || {};
            const effectiveLocalSources = Array.isArray(payload?.localSources)
                ? normalizeLocalSourcesSnapshot(payload.localSources)
                : localSourcesCache;
            if (Array.isArray(payload?.localSources)) {
                localSourcesCache = effectiveLocalSources;
            }
            const controller = new AbortController();
            activeToolControllers.set(requestId, controller);
            try {
                let result = await executeToolCall(toolName, args, {
                    signal: controller.signal,
                    localSources: effectiveLocalSources,
                    onLocalSourcesUpdated: (nextSources) => {
                        localSourcesCache = normalizeLocalSourcesSnapshot(nextSources);
                        postToIframe(iframe, {
                            type: LOCAL_SOURCES_UPDATED,
                            payload: {
                                localSources: localSourcesCache,
                            },
                        });
                    },
                });
                if (toolName === TOOL_NAMES.WRITE_IDENTITY) {
                    const identityFile = await readIdentityNote({}, {
                        signal: controller.signal,
                        localSources: effectiveLocalSources,
                    });
                    result = {
                        ...result,
                        hotUpdated: true,
                    };
                    postToIframe(iframe, {
                        type: 'xb-assistant:identity-updated',
                        payload: {
                            identityContent: String(identityFile.content || '').trim() || DEFAULT_IDENTITY_CONTENT,
                        },
                    });
                }
                if ((toolName === TOOL_NAMES.GENERATE_SKILL && result?.ok && result.action === 'save')
                    || (toolName === TOOL_NAMES.UPDATE_SKILL && result?.ok)
                    || (toolName === TOOL_NAMES.DELETE_SKILL && result?.ok)) {
                    postToIframe(iframe, {
                        type: SKILLS_UPDATED,
                        payload: await readSkillsRuntimeData({ signal: controller.signal }),
                    });
                }
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
    document.addEventListener('xb-assistant:editor-context', handleAssistantEditorContextEvent);
    window.xiaobaixAssistant = {
        openSettings: openAssistant,
        closeSettings: closeAssistant,
        getSettings: () => ({ ...getAssistantSettings() }),
        setEditorContext: (payload) => setAssistantEditorContext(payload),
        clearEditorContext: () => clearAssistantEditorContext(),
    };
}

export function cleanupAssistant() {
    document.removeEventListener('xb-assistant:editor-context', handleAssistantEditorContextEvent);
    closeAssistant();
    delete window.xiaobaixAssistant;
}
