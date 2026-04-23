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
import { applyPatchUpdateToText, parseApplyPatch } from "./shared/apply-patch.js";
import {
    DEFAULT_PRESET_NAME,
    buildDefaultPreset,
    cloneDefaultModelConfigs,
    normalizeJsApiPermission,
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
const MEMORY_WORKSPACE_PREFIX = 'memory/';
const MEMORY_SKILLS_PREFIX = `${MEMORY_WORKSPACE_PREFIX}skills/`;
const MEMORY_NOTES_PREFIX = `${MEMORY_WORKSPACE_PREFIX}notes/`;
const DEFAULT_IDENTITY_CONTENT = '你默认叫“小白助手”，这里是你的身份设定，用于保持长期工作习惯和创作风格，请尽快引导用户设定你的身份';
const DEFAULT_WORKLOG_CONTENT = '这里是你的工作记录，用于记录长期结论、经验、待办和用户特别交代的事项。';
const EMPTY_SKILLS_CATALOG = Object.freeze({
    version: 1,
    skills: [],
});
const MAX_SKILL_PROMPT_ITEMS = 20;
const MAX_CONTENT_CACHE_ENTRIES = 48;
const MAX_READ_FILE_BYTES = 100 * 1024;
const MAX_READ_RETURN_CHARS = 50 * 1024;
const MAX_JSAPI_RETURN_CHARS = 50 * 1024;
const DEFAULT_AUTO_READ_LINES = 2000;
const MAX_READ_RANGE_LINES = 2000;
const MAX_READ_LINE_CHARS = 2000;
const READ_LINE_TRUNCATION_SUFFIX = `... (line truncated to ${MAX_READ_LINE_CHARS} chars)`;
const MAX_PATH_SUGGESTIONS = 3;
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

function uniqueSorted(items) {
    return Array.from(new Set(Array.from(items || []).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'en'));
}

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
        jsApiPermission: normalizeJsApiPermission(settings.jsApiPermission),
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
        await ensureUserFile(getAssistantSettings().workspaceFileName || DEFAULT_WORKSPACE_FILE, DEFAULT_WORKLOG_CONTENT, { signal });
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
    const rootPath = normalizeLocalSourceRootPath(file.rootPath, file.label || publicPath.split('/')[1] || 'local');
    return {
        path: publicPath,
        publicPath,
        relativePath: String(file.relativePath || getRelativeLocalFilePath(publicPath) || publicPath.split('/').pop() || '').trim(),
        source: 'session-local-source',
        extension: getPathExtension(publicPath),
        sizeBytes: Math.max(0, Number(file.sizeBytes) || 0),
        content,
        originalContent: hasOriginalContent
            ? (file.originalContent === null ? null : typeof file.originalContent === 'string' ? file.originalContent : content)
            : content,
        name: String(file.name || publicPath.split('/').pop() || '').trim(),
        rootPath,
    };
}

function normalizeLocalSourceRootPath(rootPath = '', fallbackLabel = 'source') {
    const normalized = String(rootPath || '').trim().replace(/\\/g, '/').replace(/^\/+/, '').replace(/\/+$/, '');
    if (normalized === 'local') return 'local/';
    if (normalized.startsWith('local/') && !normalized.includes('..')) {
        const segments = normalized.split('/').filter(Boolean);
        if (segments.length >= 2) {
            return `${normalized}/`;
        }
    }
    const label = String(fallbackLabel || '').trim().replace(/\\/g, '/').replace(/^\/+|\/+$/g, '') || 'source';
    return `local/${label}/`;
}

function normalizeLocalSourceDirectory(directoryPath = '') {
    const normalized = String(directoryPath || '').trim().replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
    if (!normalized || normalized.includes('..')) return '';
    return normalized;
}

function collectImplicitLocalDirectoryPaths(files = []) {
    const paths = new Set();
    files.forEach((file) => {
        const segments = String(file?.relativePath || '').split('/').filter(Boolean).slice(0, -1);
        segments.forEach((_, index) => {
            paths.add(segments.slice(0, index + 1).join('/'));
        });
    });
    return Array.from(paths).sort((left, right) => left.localeCompare(right, 'zh-CN'));
}

function collectLocalSourceDirectories(source = {}) {
    const explicitDirectories = Array.isArray(source.directories)
        ? source.directories.map(normalizeLocalSourceDirectory).filter(Boolean)
        : [];
    return Array.from(new Set([
        ...explicitDirectories,
        ...collectImplicitLocalDirectoryPaths(source.files || []),
    ])).sort((left, right) => left.localeCompare(right, 'zh-CN'));
}

function getLocalSourceRootPathFromPath(publicPath = '') {
    const normalized = String(publicPath || '').trim().replace(/\\/g, '/').replace(/^\/+/, '').replace(/\/+$/, '');
    if (!normalized.startsWith('local/') || normalized.includes('..')) return '';
    const segments = normalized.split('/').filter(Boolean);
    if (segments.length < 2) return '';
    if (segments.length === 2) return 'local/';
    return `local/${segments[1]}/`;
}

function getRelativeLocalFilePath(publicPath = '') {
    const normalized = String(publicPath || '').trim().replace(/\\/g, '/').replace(/^\/+/, '');
    const rootPath = getLocalSourceRootPathFromPath(normalized);
    if (!rootPath || !normalized.startsWith(rootPath)) return '';
    return normalized.slice(rootPath.length);
}

function normalizeLocalSourcesSnapshot(localSources) {
    if (!Array.isArray(localSources)) return [];
    return localSources
        .map((source) => {
            if (!source || typeof source !== 'object') return null;
            const sourceId = String(source.sourceId || '').trim();
            if (!sourceId) return null;
            const label = String(source.label || '').trim() || sourceId;
            const rootPath = normalizeLocalSourceRootPath(source.rootPath, label);
            const files = Array.isArray(source.files)
                ? source.files.map((file) => normalizeLocalSourceFileEntry({ ...file, rootPath })).filter(Boolean)
                : [];
            const directories = collectLocalSourceDirectories({ ...source, files });
            if (!files.length && !directories.length && !rootPath) return null;
            return {
                sourceId,
                label,
                rootPath,
                importedAt: Number.isFinite(Number(source.importedAt)) ? Number(source.importedAt) : Date.now(),
                files,
                directories,
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
    if (normalized === 'local') return 'local/';
    const segments = normalized.split('/').filter(Boolean);
    if (segments.length < 2) return '';
    return `${normalized}/`;
}

function findLocalDirectoryByPath(publicPath, localSources = localSourcesCache) {
    const normalizedDirectoryPath = normalizeLocalDirectoryPath(publicPath);
    if (!normalizedDirectoryPath) return null;
    const normalizedSources = normalizeLocalSourcesSnapshot(localSources);
    if (normalizedDirectoryPath === 'local/') {
        return {
            path: 'local/',
            files: getLocalSourceFiles(localSources),
            directories: normalizedSources.map((source) => String(source.rootPath || '')).filter(Boolean),
            source: null,
        };
    }
    for (const source of normalizedSources) {
        const sourceRootPath = String(source.rootPath || '');
        if (!normalizedDirectoryPath.startsWith(sourceRootPath)) continue;
        const relativeDirectoryPath = normalizedDirectoryPath.slice(sourceRootPath.length).replace(/\/+$/, '');
        const matchingFiles = source.files.filter((entry) => entry.publicPath.startsWith(normalizedDirectoryPath));
        const matchingDirectories = source.directories.filter((directory) => (
            directory === relativeDirectoryPath || directory.startsWith(`${relativeDirectoryPath}/`)
        ));
        if (!matchingFiles.length && relativeDirectoryPath && !matchingDirectories.length && !source.directories.includes(relativeDirectoryPath)) {
            continue;
        }
        return {
            path: normalizedDirectoryPath,
            files: matchingFiles,
            directories: matchingDirectories,
            source,
        };
    }
    return null;
}

function getWritableLocalPathError(rawPath) {
    const normalized = String(rawPath || '').trim().replace(/\\/g, '/').replace(/^\/+/, '');
    if (!normalized.startsWith('local/')) return 'local_path_required';
    if (normalized.includes('..') || normalized.endsWith('/')) return 'local_path_required';
    if (!isSupportedPublicTextPath(normalized)) return 'unsupported_text_file';
    const segments = normalized.split('/').filter(Boolean);
    if (segments.length < 2) return 'local_path_required';
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

function createLocalSourceSnapshot(sourceLabel, localSources = [], rootPath = '') {
    const normalizedLabel = String(sourceLabel || '').trim();
    const normalizedRootPath = normalizeLocalSourceRootPath(rootPath, normalizedLabel || 'local');
    const fallbackLabel = normalizedRootPath === 'local/' ? 'local' : normalizedRootPath.split('/').filter(Boolean)[1] || 'source';
    const finalizedLabel = normalizedLabel || fallbackLabel;
    if (!finalizedLabel) {
        throw new Error('local_source_not_found');
    }
    const existingIds = new Set(
        normalizeLocalSourcesSnapshot(localSources).map((source) => String(source.sourceId || '').trim()).filter(Boolean),
    );
    const baseId = normalizedRootPath === 'local/' ? 'local:root' : `local:${finalizedLabel}`;
    let sourceId = baseId;
    let suffix = 2;
    while (existingIds.has(sourceId)) {
        sourceId = `${baseId}:${suffix}`;
        suffix += 1;
    }
    return {
        sourceId,
        label: finalizedLabel,
        rootPath: normalizedRootPath,
        importedAt: Date.now(),
        files: [],
        directories: [],
    };
}

function buildLocalSourceFileEntry(publicPath, content = '', options = {}) {
    const normalizedPath = normalizeWritableLocalPath(publicPath);
    if (!normalizedPath) {
        throw new Error(getWritableLocalPathError(publicPath));
    }
    const segments = normalizedPath.split('/').filter(Boolean);
    const rootPath = getLocalSourceRootPathFromPath(normalizedPath);
    const relativePath = getRelativeLocalFilePath(normalizedPath);
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
        rootPath,
    };
}

function upsertLocalSourceFile(localSources, publicPath, content) {
    const normalizedPath = normalizeWritableLocalPath(publicPath);
    if (!normalizedPath) {
        throw new Error(getWritableLocalPathError(publicPath));
    }

    const normalizedSources = normalizeLocalSourcesSnapshot(localSources);
    const sourceRootPath = getLocalSourceRootPathFromPath(normalizedPath);
    const sourceLabel = sourceRootPath === 'local/' ? 'local' : getLocalSourceLabelFromPath(normalizedPath);
    if (!sourceRootPath) {
        throw new Error('local_source_not_found');
    }

    let sourceFound = false;
    let fileExisted = false;
    let existingFile = null;
    const nextSources = normalizedSources.map((source) => {
        if (source.rootPath !== sourceRootPath) return source;
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
        if (source.rootPath !== sourceRootPath) return source;
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
            createLocalSourceSnapshot(sourceLabel, normalizedSources, sourceRootPath),
        ].sort((left, right) => String(left.label || '').localeCompare(String(right.label || ''), 'zh-CN'));

    return {
        nextSources: finalizedWithSource.map((source) => {
            if (source.rootPath !== sourceRootPath) return source;
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

    const sourceRootPath = getLocalSourceRootPathFromPath(normalizedFromPath);
    const destinationRootPath = getLocalSourceRootPathFromPath(normalizedToPath);
    const destinationLabel = destinationRootPath === 'local/' ? 'local' : getLocalSourceLabelFromPath(normalizedToPath);
    let destinationSourceFound = false;
    const intermediateSources = normalizedSources
        .map((source) => {
            const isSourceRoot = source.rootPath === sourceRootPath;
            const isDestinationRoot = source.rootPath === destinationRootPath;
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
        : [...intermediateSources, createLocalSourceSnapshot(destinationLabel, intermediateSources, destinationRootPath)];

    const movedFile = buildLocalSourceFileEntry(normalizedToPath, sourceFile.content, {
        originalContent: sourceFile.originalContent,
    });
    const finalizedSources = workingSources.map((source) => {
        if (source.rootPath !== destinationRootPath) return source;
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
        const destinationRootPath = getLocalSourceRootPathFromPath(mapping.toPath);
        nextSources = upsert.nextSources.map((source) => {
            if (source.rootPath !== destinationRootPath) return source;
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
        target[key] = clonedChild;
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
        target[key] = clonedChild;
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

function collectAvailableJsApiPaths(value, prefix, target, seen = new WeakSet()) {
    if (!prefix || !target) return;
    target.add(prefix);

    if (!value || (typeof value !== 'object' && typeof value !== 'function')) {
        return;
    }
    if (typeof value === 'object' || typeof value === 'function') {
        if (seen.has(value)) return;
        seen.add(value);
    }

    Object.keys(value).forEach((key) => {
        if (!key) return;
        collectAvailableJsApiPaths(value[key], `${prefix}.${key}`, target, seen);
    });
}

function doesJsApiPathExist(pathText, ctx, st) {
    const segments = String(pathText || '').split('.').filter(Boolean);
    if (!segments.length) return false;

    let current = null;
    if (segments[0] === 'ctx') {
        current = ctx;
    } else if (segments[0] === 'st') {
        current = st;
    } else {
        return false;
    }

    for (let index = 1; index < segments.length; index += 1) {
        const segment = segments[index];
        if (current == null || !(segment in current)) {
            return false;
        }
        current = current[segment];
    }

    return true;
}

function buildRuntimeJsApiManifest(manifest = {}, documentedContext, st) {
    const availablePaths = new Set();
    collectAvailableJsApiPaths(documentedContext, 'ctx', availablePaths);
    collectAvailableJsApiPaths(st, 'st', availablePaths);

    const staticAllowedPaths = Array.isArray(manifest.allowedPaths) ? manifest.allowedPaths : [];
    const runtimeAllowedPaths = uniqueSorted(staticAllowedPaths.filter((item) => availablePaths.has(item)));
    const runtimeAllowedSet = new Set(runtimeAllowedPaths);
    const runtimeCallablePaths = uniqueSorted(
        (Array.isArray(manifest.callablePaths) ? manifest.callablePaths : [])
            .filter((item) => runtimeAllowedSet.has(item) && doesJsApiPathExist(item, documentedContext, st)),
    );
    const runtimeCallableSet = new Set(runtimeCallablePaths);
    const sourceSemantics = manifest && typeof manifest.apiSemantics === 'object' && manifest.apiSemantics
        ? manifest.apiSemantics
        : {};

    return {
        ...manifest,
        allowedPaths: runtimeAllowedPaths,
        callablePaths: runtimeCallablePaths,
        apiSemantics: Object.fromEntries(
            Object.entries(sourceSemantics)
                .filter(([key, value]) => runtimeCallableSet.has(key) && value),
        ),
        namespaces: {
            ctx: uniqueSorted(
                ((manifest.namespaces && Array.isArray(manifest.namespaces.ctx)) ? manifest.namespaces.ctx : [])
                    .filter((item) => runtimeAllowedSet.has(item)),
            ),
            st: {
                script: uniqueSorted(
                    (((manifest.namespaces || {}).st && Array.isArray(manifest.namespaces.st.script))
                        ? manifest.namespaces.st.script
                        : [])
                        .filter((item) => runtimeAllowedSet.has(item)),
                ),
                extensions: uniqueSorted(
                    (((manifest.namespaces || {}).st && Array.isArray(manifest.namespaces.st.extensions))
                        ? manifest.namespaces.st.extensions
                        : [])
                        .filter((item) => runtimeAllowedSet.has(item)),
                ),
                slash: uniqueSorted(
                    (((manifest.namespaces || {}).st && Array.isArray(manifest.namespaces.st.slash))
                        ? manifest.namespaces.st.slash
                        : [])
                        .filter((item) => runtimeAllowedSet.has(item)),
                ),
            },
        },
    };
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

function buildSkillWorkspacePath(filename = '') {
    const normalized = normalizeSkillFileName(filename);
    if (!normalized) return '';
    return `${MEMORY_SKILLS_PREFIX}${normalized}`;
}

function normalizeSkillWorkspacePath(pathText = '') {
    const normalized = String(pathText || '').trim().replace(/\\/g, '/').replace(/^\/+/, '');
    if (normalized.startsWith(MEMORY_SKILLS_PREFIX)) {
        return buildSkillWorkspacePath(normalized.slice(MEMORY_SKILLS_PREFIX.length));
    }
    if (normalized.startsWith('skills/')) {
        return buildSkillWorkspacePath(normalized.slice('skills/'.length));
    }
    return '';
}

function getFilenameFromSkillWorkspacePath(pathText = '') {
    const normalized = normalizeSkillWorkspacePath(pathText);
    if (!normalized) return '';
    return normalizeSkillFileName(normalized.slice(MEMORY_SKILLS_PREFIX.length));
}

function getMemoryNoteDisplayName(kind = '', options = {}) {
    if (kind === 'identity') return 'Identity.md';
    if (kind === 'worklog') {
        const configuredName = normalizeWorkspaceName(options.workspaceFileName || getAssistantSettings().workspaceFileName || DEFAULT_WORKSPACE_FILE);
        return configuredName.startsWith(WORKSPACE_PREFIX)
            ? configuredName.slice(WORKSPACE_PREFIX.length)
            : configuredName;
    }
    return '';
}

function buildMemoryNoteWorkspacePath(kind = '', options = {}) {
    const displayName = getMemoryNoteDisplayName(kind, options);
    if (!displayName) return '';
    return `${MEMORY_NOTES_PREFIX}${displayName}`;
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

function normalizeIndexedDirectoryPath(rawPath = '') {
    const normalized = String(rawPath || '').trim().replace(/\\/g, '/').replace(/^\/+/, '');
    if (!normalized) return '';
    return normalized.endsWith('/') ? normalized : `${normalized}/`;
}

function scopeIndexedFilesByDirectory(files, rawPath = '') {
    const directoryPath = normalizeIndexedDirectoryPath(rawPath);
    if (!directoryPath) return files;
    return files.filter((entry) => String(entry.publicPath || '').startsWith(directoryPath));
}

function buildDirectoryItems(files, directoryPath, localSources = localSourcesCache) {
    const normalizedPrefix = directoryPath.toLowerCase();
    const entryMap = new Map();

    const registerChild = (publicPath, source, type, descendantIncrement = 0) => {
        const normalizedPath = String(publicPath || '').toLowerCase();
        if (!normalizedPath.startsWith(normalizedPrefix)) return;

        const remainder = String(publicPath || '').slice(directoryPath.length);
        if (!remainder) return;

        const slashIndex = remainder.indexOf('/');
        const childName = slashIndex === -1 ? remainder : remainder.slice(0, slashIndex);
        const isDirectory = type === 'directory' || slashIndex !== -1;
        const childPath = isDirectory ? `${directoryPath}${childName}/` : `${directoryPath}${childName}`;
        const existing = entryMap.get(childPath);

        if (existing) {
            existing.descendantFileCount += descendantIncrement;
            if (isDirectory) existing.type = 'directory';
            return;
        }

        entryMap.set(childPath, {
            publicPath: childPath,
            source,
            type: isDirectory ? 'directory' : 'file',
            descendantFileCount: descendantIncrement,
        });
    };

    files.forEach((entry) => {
        registerChild(entry.publicPath, entry.source, 'file', 1);
    });

    normalizeLocalSourcesSnapshot(localSources).forEach((source) => {
        source.directories.forEach((directory) => {
            registerChild(`${source.rootPath}${directory}/`, 'session-local-source', 'directory', 0);
        });
    });

    return Array.from(entryMap.values()).sort((a, b) => a.publicPath.localeCompare(b.publicPath, 'zh-CN'));
}

function directoryExistsAtPath(directoryPath, files, localSources = localSourcesCache) {
    const normalizedDirectoryPath = normalizeIndexedDirectoryPath(directoryPath);
    if (!normalizedDirectoryPath) return false;
    if (normalizedDirectoryPath === 'local/') return true;
    if (files.some((entry) => String(entry.publicPath || '').startsWith(normalizedDirectoryPath))) {
        return true;
    }
    if (normalizedDirectoryPath.startsWith('local/')) {
        return !!findLocalDirectoryByPath(normalizedDirectoryPath, localSources);
    }
    return false;
}

function truncateReadLine(line = '') {
    const text = String(line ?? '');
    if (text.length <= MAX_READ_LINE_CHARS) return text;
    return `${text.slice(0, MAX_READ_LINE_CHARS)}${READ_LINE_TRUNCATION_SUFFIX}`;
}

function truncateSearchLine(line = '') {
    return truncateReadLine(line);
}

function rankPathSuggestion(entry, targetPath = '') {
    const target = String(targetPath || '').toLowerCase();
    const publicPath = String(entry?.publicPath || '').toLowerCase();
    const relativePath = String(entry?.relativePath || '').toLowerCase();
    const basename = publicPath.split('/').pop() || '';
    const targetBasename = target.split('/').pop() || '';
    if (!target) return 0;
    if (publicPath === target) return 100;
    if (relativePath === target) return 95;
    if (basename && basename === targetBasename) return 90;
    if (publicPath.endsWith(`/${target}`) || relativePath.endsWith(`/${target}`)) return 80;
    if (publicPath.includes(target) || relativePath.includes(target)) return 70;
    if (target.includes(basename) && basename) return 60;
    if (targetBasename && basename.includes(targetBasename)) return 50;
    return 0;
}

function findPathSuggestions(targetPath = '', indexedFiles = [], limit = MAX_PATH_SUGGESTIONS) {
    const ranked = indexedFiles
        .map((entry) => ({ entry, score: rankPathSuggestion(entry, targetPath) }))
        .filter((item) => item.score > 0)
        .sort((left, right) => right.score - left.score || String(left.entry.publicPath || '').localeCompare(String(right.entry.publicPath || ''), 'zh-CN'));
    const seen = new Set();
    const suggestions = [];
    ranked.forEach((item) => {
        const publicPath = String(item.entry.publicPath || '').trim();
        if (!publicPath || seen.has(publicPath) || suggestions.length >= limit) return;
        seen.add(publicPath);
        suggestions.push(publicPath);
    });
    return suggestions;
}

function buildPathSuggestionMessage(suggestions = [], noun = '路径') {
    if (!Array.isArray(suggestions) || !suggestions.length) return '';
    return `可尝试这些${noun}：${suggestions.join('、')}`;
}

function buildReadErrorResult(error, targetPath, extras = {}) {
    const suggestions = Array.isArray(extras.suggestions) ? extras.suggestions : [];
    return {
        ok: false,
        error,
        path: targetPath,
        message: String(extras.message || '').trim() || error,
        suggestion: String(extras.suggestion || '').trim() || buildPathSuggestionMessage(suggestions),
        suggestions,
        ...(Number.isFinite(extras.lineCount) ? { lineCount: extras.lineCount } : {}),
        ...(Number.isFinite(extras.entryCount) ? { entryCount: extras.entryCount } : {}),
        ...(Number.isFinite(extras.offset) ? { offset: extras.offset } : {}),
    };
}

function buildReadDirectoryContent(items = []) {
    return items.map((item) => item.type === 'directory'
        ? `${item.publicPath.split('/').slice(-2, -1)[0]}/`
        : item.publicPath.split('/').pop() || '').join('\n');
}

function resolveReadLimit(value, fallback = DEFAULT_AUTO_READ_LINES) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return fallback;
    return Math.max(1, Math.min(Math.trunc(numeric), DEFAULT_AUTO_READ_LINES));
}

async function globFiles(args = {}, options = {}) {
    const manifest = await loadManifest(options.signal);
    const pattern = String(args.pattern || '').trim();
    const matcher = compileGlobPattern(pattern);
    const searchPath = String(args.path || '').trim();
    const limit = Math.max(1, Math.min(Number(args.limit) || 100, 100));
    const files = getAllIndexedFiles(manifest, options.localSources);
    const matched = scopeIndexedFilesByDirectory(files, searchPath)
        .filter((entry) => matchesGlob(entry.publicPath, entry.relativePath, matcher))
        .sort((a, b) => String(a.publicPath || '').localeCompare(String(b.publicPath || ''), 'zh-CN'));

    return {
        pattern,
        searchPath: searchPath || '',
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
    const offset = Math.max(1, Math.trunc(Number(args.offset) || 1));
    const limit = Math.max(1, Math.min(Number(args.limit) || 100, 300));
    const files = getAllIndexedFiles(manifest, options.localSources);
    const directoryExists = directoryExistsAtPath(directoryPath, files, options.localSources);
    const items = buildDirectoryItems(files, directoryPath, options.localSources);
    if (!items.length && !directoryExists) {
        return {
            ok: false,
            error: 'directory_not_found',
            path: directoryPath,
            message: `找不到目录：${directoryPath}`,
            suggestions: findPathSuggestions(directoryPath, files),
        };
    }
    if ((items.length ? offset > items.length : offset > 1)) {
        return {
            ok: false,
            error: 'list_offset_out_of_range',
            path: directoryPath,
            message: `offset ${offset} 超出目录范围；当前目录共有 ${items.length} 项。`,
            entryCount: items.length,
            offset,
        };
    }

    const startEntry = items.length ? offset : 0;
    const endEntry = items.length ? Math.min(items.length, startEntry + limit - 1) : 0;
    const pagedItems = items.slice(Math.max(0, offset - 1), Math.max(0, endEntry));
    return {
        directoryPath,
        total: items.length,
        offset,
        limit,
        startEntry,
        endEntry,
        items: pagedItems,
        returned: pagedItems.length,
        hasMoreAfter: endEntry < items.length,
        nextOffset: endEntry < items.length ? endEntry + 1 : null,
        truncated: endEntry < items.length,
    };
}

function clampLineNumber(value, fallback, totalLines) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return fallback;
    return Math.min(Math.max(1, Math.trunc(numeric)), Math.max(totalLines, 1));
}

function formatLineNumberedContent(lines, startLine, totalLines) {
    const width = String(Math.max(totalLines, startLine)).length;
    return lines.map((line, index) => `${String(startLine + index).padStart(width, ' ')}\t${truncateReadLine(line)}`);
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
    const targetPath = String(args.filePath || args.path || '').trim();
    if (!targetPath) {
        throw new Error('file_not_indexed');
    }
    const directReadablePath = normalizeDirectReadablePublicPath(targetPath);
    const indexedFiles = getAllIndexedFiles(manifest, options.localSources);
    const directoryPath = normalizeIndexedDirectoryPath(targetPath);
    const directoryItems = buildDirectoryItems(indexedFiles, directoryPath || targetPath, options.localSources);
    const directoryExists = directoryExistsAtPath(directoryPath || targetPath, indexedFiles, options.localSources);
    const requestedOffset = Math.max(1, Math.trunc(Number(args.offset ?? args.startLine) || 1));
    const requestedLimit = resolveReadLimit(args.limit);
    const entry = indexedFiles.find((item) => item.publicPath === targetPath)
        || (directReadablePath
            ? {
                publicPath: directReadablePath,
                relativePath: directReadablePath,
                source: 'direct-public-path',
                extension: pathExtension(directReadablePath),
            }
            : null);
    if (!entry && directoryExists) {
        if ((directoryItems.length ? requestedOffset > directoryItems.length : requestedOffset > 1)) {
            return buildReadErrorResult('read_offset_out_of_range', directoryPath || normalizeIndexedDirectoryPath(targetPath), {
                message: `offset ${requestedOffset} 超出目录范围；当前目录共有 ${directoryItems.length} 项。`,
                entryCount: directoryItems.length,
                offset: requestedOffset,
            });
        }
        const startEntry = directoryItems.length ? Math.min(requestedOffset, directoryItems.length) : 0;
        const endEntry = directoryItems.length ? Math.min(directoryItems.length, startEntry + requestedLimit - 1) : 0;
        const items = directoryItems.slice(startEntry > 0 ? (startEntry - 1) : 0, endEntry);
        return {
            path: directoryPath || normalizeIndexedDirectoryPath(targetPath),
            entryType: 'directory',
            totalEntries: directoryItems.length,
            startEntry,
            endEntry,
            returnedEntries: items.length,
            hasMoreAfter: endEntry < directoryItems.length,
            nextOffset: endEntry < directoryItems.length ? endEntry + 1 : null,
            truncated: endEntry < directoryItems.length,
            contentFormat: 'directory_entries',
            content: buildReadDirectoryContent(items),
        };
    }
    if (!entry) {
        const suggestions = findPathSuggestions(targetPath, indexedFiles);
        return buildReadErrorResult('file_not_found', targetPath, {
            message: `找不到路径：${targetPath}`,
            suggestions,
        });
    }
    const content = await readTextFile(entry.publicPath, options);
    const lines = content === '' ? [] : content.split('\n');
    const totalLines = lines.length;
    const sizeBytes = new TextEncoder().encode(content).length;
    const requestedEndAlias = Number(args.endLine);
    const hasExplicitRange = Number.isFinite(Number(args.offset))
        || Number.isFinite(Number(args.limit))
        || Number.isFinite(Number(args.startLine))
        || Number.isFinite(requestedEndAlias);

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
        nextOffset: null,
        truncated: false,
        autoChunked: false,
        charLimited: false,
        limitReason: null,
        contentFormat: 'numbered_lines',
        content: '',
    };
}

    if (requestedOffset > totalLines) {
        return buildReadErrorResult('read_offset_out_of_range', entry.publicPath, {
            message: `offset ${requestedOffset} 超出文件范围；当前文件共有 ${totalLines} 行。`,
            lineCount: totalLines,
            offset: requestedOffset,
        });
    }

    const startLine = clampLineNumber(args.offset ?? args.startLine, 1, totalLines);
    const explicitLimit = resolveReadLimit(args.limit);
    const requestedEndLine = Number.isFinite(requestedEndAlias)
        ? clampLineNumber(requestedEndAlias, Math.min(totalLines, startLine + explicitLimit - 1), totalLines)
        : Math.min(totalLines, startLine + explicitLimit - 1, startLine + MAX_READ_RANGE_LINES - 1);
    const slice = sliceLinesWithBudget(lines, startLine, requestedEndLine, MAX_READ_RETURN_CHARS);
    const endLine = slice.endLine || requestedEndLine;
    const hasMoreBefore = startLine > 1;
    const hasMoreAfter = endLine < totalLines;
    const autoChunked = !hasExplicitRange && (sizeBytes > MAX_READ_FILE_BYTES || totalLines > DEFAULT_AUTO_READ_LINES || slice.charLimited);

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
        nextOffset: hasMoreAfter ? endLine + 1 : null,
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

async function applyLocalPatch(args = {}, options = {}) {
    const patchText = typeof args.patchText === 'string'
        ? args.patchText
        : String(args.patchText ?? args.input ?? '');
    const parsed = parseApplyPatch(patchText);
    let nextSources = normalizeLocalSourcesSnapshot(options.localSources);
    const changes = [];
    let hunksApplied = 0;
    let addedCount = 0;
    let updatedCount = 0;
    let deletedCount = 0;
    let movedCount = 0;

    parsed.operations.forEach((operation) => {
        if (operation.type === 'add') {
            const targetPath = normalizeWritableLocalPath(operation.path);
            if (!targetPath) {
                throw new Error(getWritableLocalPathError(operation.path));
            }
            if (findLocalSourceFileByPath(targetPath, nextSources)) {
                throw new Error('local_destination_exists');
            }
            const update = upsertLocalSourceFile(nextSources, targetPath, operation.content);
            nextSources = update.nextSources;
            changes.push({ action: 'add', path: update.file.publicPath });
            addedCount += 1;
            return;
        }

        if (operation.type === 'delete') {
            const targetPath = normalizeWritableLocalPath(operation.path);
            if (!targetPath) {
                throw new Error(getWritableLocalPathError(operation.path));
            }
            const removal = removeLocalSourceFile(nextSources, targetPath);
            nextSources = removal.nextSources;
            changes.push({ action: 'delete', path: removal.file.publicPath });
            deletedCount += 1;
            return;
        }

        const sourcePath = normalizeWritableLocalPath(operation.path);
        if (!sourcePath) {
            throw new Error(getWritableLocalPathError(operation.path));
        }
        const existingEntry = findLocalSourceFileByPath(sourcePath, nextSources);
        if (!existingEntry) {
            throw new Error('local_file_not_found');
        }

        let targetPath = sourcePath;
        if (operation.moveTo) {
            targetPath = normalizeWritableLocalPath(operation.moveTo);
            if (!targetPath) {
                throw new Error(getWritableLocalPathError(operation.moveTo));
            }
            if (targetPath !== sourcePath) {
                const move = moveLocalSourceFile(nextSources, sourcePath, targetPath, { overwrite: false });
                nextSources = move.nextSources;
                movedCount += 1;
                changes.push({ action: 'move', path: move.file.publicPath, fromPath: move.fromFile.publicPath, toPath: move.file.publicPath });
            }
        }

        if (!operation.hunks.length) {
            return;
        }

        const currentEntry = findLocalSourceFileByPath(targetPath, nextSources);
        if (!currentEntry) {
            throw new Error('local_file_not_found');
        }
        const applied = applyPatchUpdateToText(currentEntry.content, operation.hunks, { path: targetPath });
        hunksApplied += applied.hunksApplied;

        const update = upsertLocalSourceFile(nextSources, targetPath, applied.content);
        nextSources = update.nextSources;
        updatedCount += 1;
        changes.push({
            action: 'update',
            path: update.file.publicPath,
            fromPath: sourcePath !== update.file.publicPath ? sourcePath : '',
            hunksApplied: applied.hunksApplied,
        });
    });

    options.onLocalSourcesUpdated?.(nextSources);
    const changedPathSet = new Set(changes.flatMap((change) => [change.path, change.fromPath, change.toPath]).filter(Boolean));
    return {
        ok: true,
        filesChanged: changedPathSet.size,
        addedCount,
        updatedCount,
        deletedCount,
        movedCount,
        hunksApplied,
        changes,
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
        : 'content';
    const limit = Math.max(1, Math.min(Number(args.limit) || 100, 100));
    const offset = Math.max(0, Math.trunc(Number(args.offset) || 0));
    const contextLines = Math.max(0, Math.min(Number(args.contextLines) || 0, 5));
    const searchPath = String(args.path || '').trim();
    const include = String(args.include || args.glob || '').trim();
    const files = getAllIndexedFiles(manifest, options.localSources);
    const scopedFiles = scopeIndexedFilesByDirectory(files, searchPath);
    const fileMatcher = include ? compileGlobPattern(include) : null;
    const candidateFiles = fileMatcher
        ? scopedFiles.filter((entry) => matchesGlob(entry.publicPath, entry.relativePath, fileMatcher))
        : scopedFiles;

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
    let totalMatches = 0;
    let seenContentMatches = 0;
    let skippedFiles = 0;
    const skippedPaths = [];
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
                        return `${prefix} ${num}: ${truncateSearchLine(contextLine)}`;
                    })
                    .join('\n');

                matches.push({
                    line: lineNumber,
                    text: truncateSearchLine(line),
                    context: contextLines > 0 ? contextText : null,
                });
            });

            if (!matches.length) continue;
            matchedFiles += 1;
            totalMatches += matches.length;

            if (outputMode === 'count') {
                if (matchedFiles <= offset) continue;
                results.push({
                    path: entry.publicPath,
                    source: entry.source,
                    matchCount: matches.length,
                });
            } else if (outputMode === 'files_with_matches') {
                if (matchedFiles <= offset) continue;
                results.push({
                    path: entry.publicPath,
                    source: entry.source,
                    matchCount: matches.length,
                });
            } else {
                matches.forEach((match) => {
                    seenContentMatches += 1;
                    if (seenContentMatches <= offset) return;
                    if (results.length >= limit) return;
                    results.push({
                        path: entry.publicPath,
                        source: entry.source,
                        line: match.line,
                        text: match.text,
                        context: match.context,
                    });
                });
            }
            if (results.length >= limit) {
                truncated = outputMode === 'content'
                    ? totalMatches > offset + results.length || scannedFiles < candidateFiles.length
                    : matchedFiles < candidateFiles.length || scannedFiles < candidateFiles.length;
                break;
            }
        } catch {
            skippedFiles += 1;
            if (skippedPaths.length < MAX_PATH_SUGGESTIONS) {
                skippedPaths.push(entry.publicPath);
            }
            continue;
        }
    }

    return {
        pattern,
        useRegex,
        outputMode,
        glob: include || '',
        include: include || '',
        searchPath: searchPath || '',
        limit,
        offset,
        contextLines,
        total: outputMode === 'content' ? totalMatches : matchedFiles,
        returned: results.length,
        matchedFilesSeen: matchedFiles,
        totalMatches,
        items: results,
        truncated,
        scannedFiles,
        skippedFiles,
        skippedPaths,
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

async function saveSkillWorkspaceFile(args = {}, options = {}) {
    const memorySection = String(args.memorySection || '').trim();
    const noteKind = String(args.noteKind || '').trim();
    if (memorySection === 'notes' || noteKind) {
        const content = String(args.content || '');
        if (noteKind === 'identity') {
            const result = await writeIdentityNote({ content }, options);
            return {
                ...result,
                ok: result?.ok !== false,
                path: buildMemoryNoteWorkspacePath('identity', options),
                filename: getMemoryNoteDisplayName('identity', options),
                title: '身份设定',
                noteKind: 'identity',
            };
        }
        if (noteKind === 'worklog') {
            const result = await writeWorkspaceNote({ content }, options);
            return {
                ...result,
                ok: result?.ok !== false,
                path: buildMemoryNoteWorkspacePath('worklog', options),
                filename: getMemoryNoteDisplayName('worklog', options),
                title: '工作记录',
                noteKind: 'worklog',
            };
        }
        return {
            ok: false,
            error: 'memory_note_kind_required',
            message: '记忆笔记保存失败：缺少 noteKind。',
        };
    }

    const filename = normalizeSkillFileName(args.filename || getFilenameFromSkillWorkspacePath(args.path || ''));
    if (!filename) {
        return {
            ok: false,
            error: 'skill_identifier_required',
            message: '必须提供技能文件名。',
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

    const skill = catalogResult.catalog.skills.find((item) => item.filename === filename);
    if (!skill) {
        return {
            ok: false,
            error: 'skill_not_found',
            message: `目录里找不到文件 ${filename} 对应的 skill。`,
        };
    }

    const fullContent = String(args.content || '');
    const parsedFile = parseStructuredSkillFile(fullContent);
    if (!parsedFile) {
        return {
            ok: false,
            error: 'skill_file_invalid',
            message: `skill 文件格式无效，无法更新：${filename}`,
            id: skill.id,
            filename,
        };
    }

    const result = await updateSkillTool({
        id: skill.id,
        filename,
        title: String(parsedFile.title || '').trim(),
        summary: String(parsedFile.summary || '').trim(),
        triggers: Array.isArray(parsedFile.triggers) ? parsedFile.triggers : [],
        slashTriggers: Array.isArray(parsedFile.slashTriggers) ? parsedFile.slashTriggers : [],
        when_to_use: String(parsedFile.when_to_use || '').trim(),
        enabled: typeof parsedFile.enabled === 'boolean' ? parsedFile.enabled : skill.enabled !== false,
        content: String(parsedFile.body || ''),
    }, options);
    return {
        ...result,
        path: buildSkillWorkspacePath(filename),
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
        summary,
        filename: proposal.filename,
        triggers,
        slashTriggers,
        when_to_use: whenToUse,
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
            skillFiles: [],
        };
    }

    const skillFiles = [];
    for (const skill of catalogResult.catalog.skills) {
        const filename = normalizeSkillFileName(skill?.filename || '');
        if (!filename) continue;
        try {
            const file = await readUserFile(filename, options);
            if (!file.exists) continue;
            const content = String(file.content || '');
            skillFiles.push({
                path: buildSkillWorkspacePath(filename),
                relativePath: `skills/${filename}`,
                name: filename,
                filename,
                id: skill.id,
                title: skill.title,
                summary: skill.summary,
                triggers: Array.isArray(skill.triggers) ? skill.triggers : [],
                slashTriggers: Array.isArray(skill.slashTriggers) ? skill.slashTriggers : [],
                enabled: skill.enabled !== false,
                updatedAt: skill.updatedAt,
                content,
                originalContent: content,
                source: 'assistant-skill-file',
                memorySection: 'skills',
                noteKind: '',
            });
        } catch {
            // Ignore individual skill file failures so the rest of the panel can still load.
        }
    }

    const identityPath = buildMemoryNoteWorkspacePath('identity', options);
    if (identityPath) {
        try {
            const identityFile = await ensureUserFile(DEFAULT_IDENTITY_FILE, DEFAULT_IDENTITY_CONTENT, options);
            const content = String(identityFile.content || '').trim() || DEFAULT_IDENTITY_CONTENT;
            skillFiles.push({
                path: identityPath,
                relativePath: `notes/${getMemoryNoteDisplayName('identity', options)}`,
                name: getMemoryNoteDisplayName('identity', options),
                filename: getMemoryNoteDisplayName('identity', options),
                id: 'assistant-identity-note',
                title: '身份设定',
                summary: '助手长期身份、风格与协作方式。',
                triggers: [],
                slashTriggers: [],
                enabled: true,
                updatedAt: '',
                content,
                originalContent: content,
                source: 'assistant-memory-file',
                memorySection: 'notes',
                noteKind: 'identity',
            });
        } catch {
            // Ignore note loading failures so the rest of the panel can still load.
        }
    }

    const worklogPath = buildMemoryNoteWorkspacePath('worklog', options);
    if (worklogPath) {
        try {
            const worklogName = normalizeWorkspaceName(getAssistantSettings().workspaceFileName || DEFAULT_WORKSPACE_FILE);
            const worklogFile = await ensureUserFile(worklogName, DEFAULT_WORKLOG_CONTENT, options);
            skillFiles.push({
                path: worklogPath,
                relativePath: `notes/${getMemoryNoteDisplayName('worklog', options)}`,
                name: getMemoryNoteDisplayName('worklog', options),
                filename: getMemoryNoteDisplayName('worklog', options),
                id: 'assistant-worklog-note',
                title: '工作记录',
                summary: '助手长期结论、偏好与过程记录。',
                triggers: [],
                slashTriggers: [],
                enabled: true,
                updatedAt: '',
                content: String(worklogFile.content || ''),
                originalContent: String(worklogFile.content || ''),
                source: 'assistant-memory-file',
                memorySection: 'notes',
                noteKind: 'worklog',
            });
        } catch {
            // Ignore note loading failures so the rest of the panel can still load.
        }
    }

    return {
        skillsCatalog: catalogResult.catalog,
        skillsPromptSummary: catalogResult.summaryText,
        skillsCatalogError: '',
        skillFiles,
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
        const runtimeManifest = buildRuntimeJsApiManifest(manifest, documentedContext, st);
        const result = await runtimeModule.runJavaScriptApi({
            code,
            purpose,
            apiPaths,
            safety,
            expectedOutput,
            manifest: runtimeManifest,
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
        case TOOL_NAMES.APPLY_PATCH:
            return await applyLocalPatch(args, options);
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
        case TOOL_NAMES.SAVE_SKILL_FILE:
            return await saveSkillWorkspaceFile(args, options);
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
                jsApiPermission: normalizeJsApiPermission(patch.jsApiPermission ?? current.jsApiPermission),
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
                if (toolName === TOOL_NAMES.SAVE_SKILL_FILE && result?.ok && result.noteKind === 'identity') {
                    postToIframe(iframe, {
                        type: 'xb-assistant:identity-updated',
                        payload: {
                            identityContent: String(args.content || '').trim() || DEFAULT_IDENTITY_CONTENT,
                        },
                    });
                }
                if ((toolName === TOOL_NAMES.GENERATE_SKILL && result?.ok && result.action === 'save')
                    || (toolName === TOOL_NAMES.UPDATE_SKILL && result?.ok)
                    || (toolName === TOOL_NAMES.DELETE_SKILL && result?.ok)
                    || (toolName === TOOL_NAMES.WRITE_IDENTITY && result?.ok !== false)
                    || (toolName === TOOL_NAMES.WRITE_WORKLOG && result?.ok !== false)
                    || (toolName === TOOL_NAMES.SAVE_SKILL_FILE && result?.ok)) {
                    const skillsRuntime = await readSkillsRuntimeData({ signal: controller.signal });
                    const focusSkillPath = toolName === TOOL_NAMES.WRITE_IDENTITY
                        ? buildMemoryNoteWorkspacePath('identity')
                        : toolName === TOOL_NAMES.WRITE_WORKLOG
                            ? buildMemoryNoteWorkspacePath('worklog')
                            : result?.path
                                ? String(result.path || '').trim()
                                : result?.filename
                                    ? buildSkillWorkspacePath(result.filename)
                                    : '';
                    postToIframe(iframe, {
                        type: SKILLS_UPDATED,
                        payload: {
                            ...skillsRuntime,
                            focusSkillPath,
                        },
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
