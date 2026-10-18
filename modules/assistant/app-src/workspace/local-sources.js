import { zipSync, strToU8 } from '../../../../libs/fflate.mjs';
import { isSupportedPublicTextPath } from '../../../agent-core/tools/text-file-types.js';
import {
    buildLocalFileRecord as kernelBuildLocalFileRecord,
    collectSourceDirectoryPaths as kernelCollectSourceDirectoryPaths,
    createLocalSourceRecord as kernelCreateLocalSourceRecord,
    findLocalDirectoryByPath as kernelFindLocalDirectoryByPath,
    findLocalFileByPath as kernelFindLocalFileByPath,
    flattenLocalSourceFiles as kernelFlattenLocalSourceFiles,
    formatWorkspacePromptPath as kernelFormatWorkspacePromptPath,
    hasOriginalSnapshot as kernelHasOriginalSnapshot,
    isLocalRootPath as kernelIsLocalRootPath,
    isLocalSourceFileModified as kernelIsLocalSourceFileModified,
    normalizeLocalDirectoryPath as kernelNormalizeLocalDirectoryPath,
    normalizeLocalSourcePath as kernelNormalizeLocalSourcePath,
    normalizeLocalSources as kernelNormalizeLocalSources,
    normalizeWorkspacePromptDirectoryPath as kernelNormalizeWorkspacePromptDirectoryPath,
    normalizeWorkspacePromptFilePath as kernelNormalizeWorkspacePromptFilePath,
    normalizeWritableLocalFilePath as kernelNormalizeWritableLocalFilePath,
    pickUniqueLocalSourceLabel as kernelPickUniqueLocalSourceLabel,
    summarizeLocalSources as kernelSummarizeLocalSources,
    upsertLocalSourceFile as kernelUpsertLocalSourceFile,
} from '../../shared/local-workspace-kernel.js';
import {
    INTERNAL_WORKSPACE_TOOL_NAMES,
    WORKSPACE_KERNEL_VERSION,
    WORKSPACE_SOURCES,
} from '../../shared/workspace-protocol.js';
import { buildWorkspacePreconditions, workspaceMutationScopes, WORKSPACE_CONFLICT } from '../../shared/workspace-preconditions.js';
import { WORKSPACE_COPY } from './workspace-copy.js';
import { TOOL_NAMES } from '../tooling.js';
import { buildWorkspaceTree, collectDirectoryExpansionKeys } from './local-workspace-tree.js';
import { observeBackgroundTask } from '../../../../shared/common/async-errors.js';


const LOCAL_SOURCE_PREFIX = 'local/';
const IMPORT_PROGRESS_INTERVAL_MS = 220;
const IMPORT_YIELD_EVERY_CHUNKS = 4;
const IMPORT_CHUNK_BYTES = 256 * 1024;

function sanitizeLabel(value, fallback = 'source') {
    const normalized = String(value || '')
        .trim()
        .replace(/\\/g, '/')
        .replace(/^\/+|\/+$/g, '')
        .replace(/\s+/g, ' ');
    const cleaned = normalized.split('/').filter(Boolean).join('-').trim();
    return cleaned || fallback;
}

function normalizeLocalSourcePath(pathText = '') {
    return kernelNormalizeLocalSourcePath(pathText);
}

function isLocalRootPath(pathText = '') {
    return kernelIsLocalRootPath(pathText);
}

function normalizeWritableLocalFilePath(pathText = '') {
    return kernelNormalizeWritableLocalFilePath(pathText);
}

function normalizeLocalDirectoryPath(pathText = '') {
    return kernelNormalizeLocalDirectoryPath(pathText);
}

function formatWorkspacePromptPath(pathText = '') {
    return kernelFormatWorkspacePromptPath(pathText);
}

function normalizeWorkspacePromptFilePath(pathText = '') {
    return kernelNormalizeWorkspacePromptFilePath(pathText);
}

function normalizeWorkspacePromptDirectoryPath(pathText = '') {
    return kernelNormalizeWorkspacePromptDirectoryPath(pathText);
}

function pickUniqueLabel(desiredLabel, existingLabels = new Set()) {
    return kernelPickUniqueLocalSourceLabel(desiredLabel, existingLabels);
}

function buildLocalFileRecord({ sourceLabel, fileName, relativePath, content, sizeBytes }) {
    return kernelBuildLocalFileRecord({ sourceLabel, fileName, relativePath, content, sizeBytes });
}

function createLocalSourceRecord({ sourceId, label, rootPath, importedAt, files, directories }) {
    return kernelCreateLocalSourceRecord({ sourceId, label, rootPath, importedAt, files, directories });
}

function summarizeImportResult({ importedSources, importedFiles, rejectedFiles, duplicateFiles }) {
    if (!importedSources && !importedFiles) {
        if (rejectedFiles) {
            return '只支持导入文本文件到工作区';
        }
        return '没有可导入的文件';
    }

    const parts = [`已导入 ${importedSources} 个工作区根，${importedFiles} 个文件`];
    if (rejectedFiles) parts.push(`忽略 ${rejectedFiles} 个非文本文件`);
    if (duplicateFiles) parts.push(`跳过 ${duplicateFiles} 个重复路径`);
    return parts.join('，');
}

function resolveImportedWorkspaceTarget(importedSources = []) {
    const normalizedSources = normalizeLocalSources(importedSources);
    if (!normalizedSources.length) return '';
    const firstSource = normalizedSources[0];
    if (!firstSource) return '';
    if (normalizedSources.length === 1 && Array.isArray(firstSource.files) && firstSource.files.length === 1) {
        return String(firstSource.files[0]?.path || '').trim();
    }
    return String(firstSource.rootPath || firstSource.files?.[0]?.path || LOCAL_SOURCE_PREFIX).trim();
}

function waitForNextFrame() {
    return new Promise((resolve) => {
        if (typeof requestAnimationFrame === 'function') {
            requestAnimationFrame(() => resolve());
            return;
        }
        setTimeout(resolve, 0);
    });
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    setTimeout(() => URL.revokeObjectURL(url), 0);
}

function formatLocalSourceDownloadName(sourceLabel, extension = '') {
    const base = sanitizeLabel(sourceLabel, 'source');
    return extension ? `${base}${extension}` : base;
}

function buildLocalSourceZip(source) {
    const entries = {};
    collectSourceDirectoryPaths(source).forEach((directoryPath) => {
        entries[`${directoryPath}/`] = new Uint8Array();
    });
    source.files.forEach((file) => {
        entries[file.relativePath || file.name || 'untitled.txt'] = strToU8(typeof file.content === 'string' ? file.content : '');
    });
    return zipSync(entries, { level: 1 });
}

export function buildLocalSourcesArchiveEntries(localSources = []) {
    const entries = {};
    normalizeLocalSources(localSources).forEach((source) => {
        collectSourceDirectoryPaths(source).forEach((directoryPath) => {
            entries[`${String(source.rootPath || LOCAL_SOURCE_PREFIX)}${directoryPath}/`] = new Uint8Array();
        });
        source.files.forEach((file) => {
            entries[file.path] = strToU8(typeof file.content === 'string' ? file.content : '');
        });
    });
    return entries;
}

async function readFileAsText(file, options = {}) {
    if (!file) return '';

    const reportProgress = typeof options.onProgress === 'function'
        ? options.onProgress
        : null;
    const totalBytes = Math.max(0, Number(file.size) || 0);

    if (typeof file.stream === 'function' && typeof TextDecoder === 'function') {
        const reader = file.stream().getReader();
        const decoder = new TextDecoder();
        const chunks = [];
        let loadedBytes = 0;
        let chunkCount = 0;
        let bytesSinceYield = 0;

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            if (value) {
                const byteLength = value.byteLength || 0;
                loadedBytes += byteLength;
                bytesSinceYield += byteLength;
                chunks.push(decoder.decode(value, { stream: true }));
            }
            chunkCount += 1;
            reportProgress?.(loadedBytes, totalBytes);
            if (chunkCount % IMPORT_YIELD_EVERY_CHUNKS === 0 || bytesSinceYield >= IMPORT_CHUNK_BYTES) {
                await waitForNextFrame();
                bytesSinceYield = 0;
            }
        }

        const tail = decoder.decode();
        if (tail) {
            chunks.push(tail);
        }
        reportProgress?.(totalBytes, totalBytes);
        return chunks.join('');
    }

    const text = await file.text();
    reportProgress?.(totalBytes, totalBytes);
    await waitForNextFrame();
    return text;
}

function groupSelectedFiles(files = [], mode = 'files') {
    if (mode === 'directory') {
        const groups = new Map();
        files.forEach((file) => {
            const relativePath = normalizeLocalSourcePath(file?.webkitRelativePath || '');
            const rootName = sanitizeLabel(relativePath.split('/')[0] || file?.name || 'folder', 'folder');
            if (!groups.has(rootName)) {
                groups.set(rootName, []);
            }
            groups.get(rootName).push(file);
        });
        return Array.from(groups.entries()).map(([label, groupFiles]) => ({ label, files: groupFiles, mode }));
    }

    const normalizedFiles = Array.isArray(files) ? files.filter(Boolean) : [];
    if (!normalizedFiles.length) return [];

    return [{
        label: normalizedFiles.length === 1
            ? sanitizeLabel(normalizedFiles[0]?.name || 'source', 'source')
            : 'selected-files',
        files: normalizedFiles,
        mode,
    }];
}

function collectSourceDirectoryPaths(source = {}) {
    return kernelCollectSourceDirectoryPaths(source);
}

function hasOriginalSnapshot(file) {
    return kernelHasOriginalSnapshot(file);
}

function isLocalSourceFileModified(file) {
    return kernelIsLocalSourceFileModified(file);
}

function normalizeWorkspaceWidth(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return 520;
    return Math.max(360, Math.min(960, Math.round(numeric)));
}

function findLocalFileByPath(localSources = [], targetPath = '') {
    return kernelFindLocalFileByPath(localSources, targetPath);
}

function findLocalDirectoryByPath(localSources = [], targetPath = '') {
    return kernelFindLocalDirectoryByPath(localSources, targetPath);
}

function buildExpandedKeysForWorkspaceTarget(sourceId, relativePath = '') {
    const expandedKeys = new Set([`source:${sourceId}`]);
    const segments = String(relativePath || '').split('/').filter(Boolean);
    let parentKey = `source:${sourceId}`;
    segments.forEach((_, index) => {
        parentKey = `${parentKey}/dir:${segments.slice(0, index + 1).join('/')}`;
        expandedKeys.add(parentKey);
    });
    return expandedKeys;
}

export function normalizeLocalSources(localSources) {
    return kernelNormalizeLocalSources(localSources);
}

export function flattenLocalSourceFiles(localSources = []) {
    return kernelFlattenLocalSourceFiles(localSources);
}

export function summarizeLocalSources(localSources = []) {
    return kernelSummarizeLocalSources(localSources);
}

export function createLocalSourcesManager(deps) {
    const {
        state,
        createRequestId,
        showToast,
        setImportProgress,
        render,
        renderWorkspaceOnly,
        persistWorkspaceUiState: saveWorkspaceUiState,
        onWorkspaceClosed,
        onWorkspaceSelectionChanged,
        callHostTool,
        renderWorkspaceUi = () => {},
    } = deps;
    let workspaceUiPersistTimer = 0;
    const pendingEditorWrites = new Map();
    const pendingWorkspaceOperations = new Set();

    function getWorkspaceRuntimeMeta() {
        const workspace = state.runtime?.workspace && typeof state.runtime.workspace === 'object'
            ? state.runtime.workspace
            : {};
        return {
            version: Number.isFinite(Number(workspace.version)) ? Number(workspace.version) : 0,
            kernelVersion: String(workspace.kernelVersion || WORKSPACE_KERNEL_VERSION).trim() || WORKSPACE_KERNEL_VERSION,
        };
    }

    function updateWorkspaceRuntimeMeta(payload = {}) {
        state.runtime = {
            ...(state.runtime || {}),
            workspace: {
                ...getWorkspaceRuntimeMeta(),
                version: Number.isFinite(Number(payload.workspaceVersion))
                    ? Number(payload.workspaceVersion)
                    : getWorkspaceRuntimeMeta().version,
                kernelVersion: String(payload.kernelVersion || getWorkspaceRuntimeMeta().kernelVersion || WORKSPACE_KERNEL_VERSION).trim() || WORKSPACE_KERNEL_VERSION,
            },
        };
    }

    function getDraftRecord(path = '') {
        const draft = state.workspaceDrafts?.[path];
        return draft && typeof draft === 'object' ? draft : null;
    }

    function setDraftRecord(path = '', patch = {}) {
        const normalizedPath = String(path || '').trim();
        if (!normalizedPath) return null;
        state.workspaceDrafts = state.workspaceDrafts && typeof state.workspaceDrafts === 'object'
            ? state.workspaceDrafts
            : {};
        const nextDraft = {
            ...(getDraftRecord(normalizedPath) || {}),
            ...patch,
        };
        state.workspaceDrafts[normalizedPath] = nextDraft;
        return nextDraft;
    }

    function clearDraftRecord(path = '') {
        const normalizedPath = String(path || '').trim();
        if (!normalizedPath || !state.workspaceDrafts || typeof state.workspaceDrafts !== 'object') return;
        delete state.workspaceDrafts[normalizedPath];
    }

    function discardPendingEditorWrite(path = '', options = {}) {
        const normalizedPath = String(path || '').trim();
        if (!normalizedPath) return null;
        const entry = pendingEditorWrites.get(normalizedPath) || null;
        if (entry?.timer) {
            clearTimeout(entry.timer);
            entry.timer = 0;
        }
        if (entry) {
            entry.disposed = true;
            pendingEditorWrites.delete(normalizedPath);
        }
        if (options.clearDraft !== false) {
            clearDraftRecord(normalizedPath);
        }
        return entry;
    }

    function getDisplaySources() {
        let sources = normalizeLocalSources(state.localSources);
        for (const [path, draft] of Object.entries(state.workspaceDrafts || {})) {
            const match = findLocalFileByPath(sources, path);
            if (match) {
                sources = sources.map(source => ({ ...source, files: source.files.map(file => (
                    file.path === path ? { ...file, content: draft.content } : file
                )) }));
            } else {
                sources.push(createLocalSourceRecord({
                    sourceId: `draft:${path}`, label: WORKSPACE_COPY.unsavedDraft,
                    rootPath: draft.file.rootPath, files: [{ ...draft.file, content: draft.content }],
                }));
            }
        }
        return sources;
    }

    function captureRunWorkspaceBaseline() {
        let sources = normalizeLocalSources(state.localSources);
        for (const entry of pendingEditorWrites.values()) {
            if (entry.status === 'error' || entry.status === 'conflict') continue;
            sources = kernelUpsertLocalSourceFile(sources, entry.path, getDraftRecord(entry.path).content).nextSources;
        }
        return sources;
    }

    function primeWorkspaceSelection(targetPath = '', options = {}) {
        const normalizedPath = normalizeLocalSourcePath(targetPath);
        if (!normalizedPath) return false;
        state.isWorkspaceOpen = true;
        state.selectedSourceId = 'all';
        if (normalizedPath.endsWith('/')) {
            state.selectedTreePath = normalizeLocalDirectoryPath(normalizedPath) || LOCAL_SOURCE_PREFIX;
            state.selectedFilePath = '';
            state.mobileWorkspacePane = 'tree';
            if (options.viewerMode) {
                state.viewerMode = options.viewerMode;
            } else {
                state.viewerMode = 'current';
            }
            return true;
        }

        state.selectedFilePath = normalizeWritableLocalFilePath(normalizedPath) || normalizedPath;
        state.selectedTreePath = state.selectedFilePath;
        state.mobileWorkspacePane = 'viewer';
        if (options.viewerMode) {
            state.viewerMode = options.viewerMode;
        }
        return true;
    }

    async function callWorkspaceHostTool(toolName, args = {}, options = {}) {
        if (typeof callHostTool !== 'function') {
            throw new Error('workspace_host_tool_unavailable');
        }
        const path = typeof options.path === 'string'
            ? options.path
            : (typeof args?.path === 'string'
                ? args.path
                : (typeof args?.filePath === 'string'
                    ? args.filePath
                    : (typeof args?.fromPath === 'string' ? args.fromPath : '')));
        if (options.source !== WORKSPACE_SOURCES.EDITOR && !await flushPendingWorkspaceChanges({ toolName, args })) {
            return { ok: false, error: 'workspace_unsaved_changes' };
        }
        let conflictSnapshot;
        const request = callHostTool(toolName, args, {
            onWorkspaceObserved: options.onWorkspaceObserved,
            onWorkspaceConflict: snapshot => { conflictSnapshot = snapshot; },
            workspaceMeta: {
                source: options.source || WORKSPACE_SOURCES.UI_ACTION,
                opId: createRequestId('workspace-op'),
                preconditions: options.preconditions ?? buildWorkspacePreconditions(toolName, args, state.localSources),
                retryContent: options.retryContent,
                baseVersion: Number.isFinite(Number(options.baseVersion))
                    ? Number(options.baseVersion)
                    : getWorkspaceRuntimeMeta().version,
                path,
            },
        });
        pendingWorkspaceOperations.add(request);
        let result;
        try { result = await request; }
        catch (error) { result = { ok: false, error: String(error?.message || error) }; }
        finally { pendingWorkspaceOperations.delete(request); }
        if (result?.error === WORKSPACE_CONFLICT) {
            options.onWorkspaceConflict?.(conflictSnapshot);
            if (options.source !== WORKSPACE_SOURCES.EDITOR) {
                await applyExternalLocalSources(conflictSnapshot);
                showToast?.(WORKSPACE_COPY.operationConflict);
            }
        }
        if (options.updateRuntimeMeta !== false && result && typeof result === 'object') {
            updateWorkspaceRuntimeMeta(result);
        }
        return result;
    }
    function hasPendingWorkspaceChanges() {
        return pendingEditorWrites.size > 0 || pendingWorkspaceOperations.size > 0 || !!state.localImportProgress?.active;
    }

    async function flushPendingWorkspaceChanges({ toolName, args } = {}) {
        const scopes = toolName ? workspaceMutationScopes(toolName, args) : null;
        const isAffected = path => !scopes || scopes.some(item => (
            path === item.path || (item.scope === 'tree' && path.startsWith(`${item.path}/`))
        ));
        if (!scopes && workspaceUiPersistTimer) persistWorkspaceUiStateImmediately();
        for (const entry of Array.from(pendingEditorWrites.values()).filter(item => isAffected(item.path))) {
            if (entry.timer) {
                clearTimeout(entry.timer);
                entry.timer = 0;
                await sendEditorWrite(entry.path);
            }
            if (entry.inFlightPromise) await entry.inFlightPromise;
        }
        if (!scopes) {
            await Promise.all(Array.from(pendingWorkspaceOperations));
            if (state.localImportProgress?.active) return false;
        }
        return !Array.from(pendingEditorWrites.keys()).some(isAffected);
    }

    function shouldSkipAuthoritativeRender(nextSources = []) {
        const selectedFilePath = normalizeWritableLocalFilePath(state.selectedFilePath);
        if (!state.isWorkspaceOpen || state.viewerMode !== 'current' || !selectedFilePath) {
            return false;
        }
        const pendingEntry = pendingEditorWrites.get(selectedFilePath);
        if (!pendingEntry || pendingEntry.disposed) {
            return false;
        }
        const nextMatch = findLocalFileByPath(nextSources, selectedFilePath);
        if (!nextMatch?.file) {
            return false;
        }
        const liveDraft = getDraftRecord(selectedFilePath);
        const liveEditorContent = liveDraft?.content ?? pendingEntry.queuedContent ?? pendingEntry.inFlightContent;
        if (liveEditorContent === null || liveEditorContent === undefined) {
            return false;
        }
        return String(nextMatch.file.content || '') === String(liveEditorContent);
    }

    async function applyAuthoritativeLocalSources(nextSources, toastText = '') {
        const normalizedNextSources = normalizeLocalSources(nextSources);
        state.localSources = normalizedNextSources;
        ensureWorkspaceSelection();
        if (!shouldSkipAuthoritativeRender(normalizedNextSources)) {
            render?.();
        }
        if (toastText) {
            showToast?.(toastText);
        }
        return true;
    }

    function persistWorkspaceUiStateImmediately() {
        if (workspaceUiPersistTimer) {
            clearTimeout(workspaceUiPersistTimer);
            workspaceUiPersistTimer = 0;
        }
        void saveWorkspaceUiState();
    }

    function persistWorkspaceUiState() {
        if (workspaceUiPersistTimer) {
            clearTimeout(workspaceUiPersistTimer);
        }
        workspaceUiPersistTimer = window.setTimeout(() => {
            workspaceUiPersistTimer = 0;
            void saveWorkspaceUiState();
        }, 180);
    }

    function getWorkspaceSummary() {
        return summarizeLocalSources(state.localSources);
    }

    function findFirstModifiedFile() {
        return flattenLocalSourceFiles(state.localSources).find((file) => (
            file.originalContent === null || file.content !== file.originalContent
        )) || null;
    }

    function getCurrentWorkspaceDirectoryPath() {
        const selectedTreeDirectory = normalizeLocalDirectoryPath(state.selectedTreePath);
        if (selectedTreeDirectory) return selectedTreeDirectory;
        const selectedFile = normalizeWritableLocalFilePath(state.selectedFilePath);
        if (selectedFile) {
            return `${selectedFile.split('/').slice(0, -1).join('/')}/`;
        }
        return LOCAL_SOURCE_PREFIX;
    }

    function resolveCreateTargetDirectoryPath(targetPath = '') {
        const fileMatch = findLocalFileByPath(state.localSources, targetPath);
        if (fileMatch?.file?.path) {
            return `${String(fileMatch.file.path || '').split('/').slice(0, -1).join('/')}/`;
        }

        const directoryMatch = findLocalDirectoryByPath(state.localSources, targetPath);
        if (directoryMatch?.directoryPath) return directoryMatch.directoryPath;

        const normalizedTargetFile = normalizeWritableLocalFilePath(targetPath);
        if (normalizedTargetFile) {
            return `${normalizedTargetFile.split('/').slice(0, -1).join('/')}/`;
        }

        const normalizedTargetDirectory = normalizeLocalDirectoryPath(targetPath);
        if (normalizedTargetDirectory) return normalizedTargetDirectory;

        return getCurrentWorkspaceDirectoryPath();
    }

    function setMobileWorkspacePane(pane, options = {}) {
        const nextPane = pane === 'viewer' ? 'viewer' : 'tree';
        state.mobileWorkspacePane = nextPane;
        if (options.persist !== false) {
            persistWorkspaceUiState();
        }
        if (options.render) {
            renderWorkspaceOnly?.();
        }
    }

    function selectWorkspaceFile(targetPath, options = {}) {
        const match = findLocalFileByPath(getDisplaySources(), targetPath);
        if (!match) return false;

        state.isWorkspaceOpen = true;
        state.selectedSourceId = 'all';
        state.selectedFilePath = match.file.path;
        state.selectedTreePath = match.file.path;
        state.mobileWorkspacePane = 'viewer';
        if (!options.preserveSearch) {
            state.fileSearchQuery = '';
        }
        if (!options.preserveModifiedOnly) {
            state.showModifiedOnly = false;
        }

        const expandedKeys = new Set(Array.isArray(state.treeExpandedKeys) ? state.treeExpandedKeys : []);
        buildExpandedKeysForWorkspaceTarget(
            match.source.sourceId,
            match.file.relativePath.split('/').slice(0, -1).join('/'),
        ).forEach((item) => expandedKeys.add(item));
        state.treeExpandedKeys = Array.from(expandedKeys);

        if (!options.preserveViewerMode) {
            state.viewerMode = isLocalSourceFileModified(match.file) ? 'diff' : 'current';
        }
        onWorkspaceSelectionChanged?.();
        persistWorkspaceUiStateImmediately();
        return true;
    }

    function selectWorkspaceDirectory(targetPath) {
        const match = findLocalDirectoryByPath(state.localSources, targetPath);
        if (!match) return false;

        state.isWorkspaceOpen = true;
        state.selectedSourceId = 'all';
        state.selectedTreePath = match.directoryPath;
        state.selectedFilePath = '';
        state.fileSearchQuery = '';
        state.showModifiedOnly = false;
        state.viewerMode = 'current';
        state.mobileWorkspacePane = 'tree';
        state.treeExpandedKeys = match.source
            ? Array.from(buildExpandedKeysForWorkspaceTarget(match.source.sourceId, match.relativeDirectoryPath))
            : Array.from(collectDirectoryExpansionKeys(buildWorkspaceTree(normalizeLocalSources(state.localSources), {
                selectedSourceId: 'all',
                searchQuery: '',
                modifiedOnly: false,
                isModifiedFile: isLocalSourceFileModified,
            }).nodes));
        onWorkspaceSelectionChanged?.();
        persistWorkspaceUiStateImmediately();
        return true;
    }

    function ensureWorkspaceSelection() {
        const normalizedSources = getDisplaySources();
        if (!normalizedSources.length) {
            state.selectedSourceId = 'all';
            state.selectedFilePath = '';
            state.selectedTreePath = LOCAL_SOURCE_PREFIX;
            state.viewerMode = 'current';
            state.mobileWorkspacePane = 'tree';
            state.treeExpandedKeys = [];
            return;
        }

        state.selectedSourceId = 'all';

        const workspaceTree = buildWorkspaceTree(normalizedSources, {
            selectedSourceId: 'all',
            searchQuery: state.fileSearchQuery,
            modifiedOnly: state.showModifiedOnly,
            isModifiedFile: isLocalSourceFileModified,
        });

        if (!Array.isArray(state.treeExpandedKeys) || !state.treeExpandedKeys.length) {
            state.treeExpandedKeys = Array.from(collectDirectoryExpansionKeys(workspaceTree.nodes));
        }

        const hasVisibleDirectorySelection = (
            !state.selectedFilePath
            && workspaceTree.visibleNodePaths.includes(state.selectedTreePath)
            && String(state.selectedTreePath || '').endsWith('/')
        );

        const currentVisible = workspaceTree.visiblePaths.includes(state.selectedFilePath);
        if (!currentVisible) {
            state.selectedFilePath = hasVisibleDirectorySelection ? '' : (workspaceTree.visiblePaths[0] || '');
        }

        if (!workspaceTree.visibleNodePaths.includes(state.selectedTreePath)) {
            state.selectedTreePath = state.selectedFilePath || workspaceTree.visibleNodePaths[0] || LOCAL_SOURCE_PREFIX;
        }

        if (!['current', 'original', 'diff'].includes(state.viewerMode)) {
            state.viewerMode = 'current';
        }
        if (!['tree', 'viewer'].includes(String(state.mobileWorkspacePane || ''))) {
            state.mobileWorkspacePane = state.selectedFilePath ? 'viewer' : 'tree';
        }

        const selected = findLocalFileByPath(normalizedSources, state.selectedFilePath);
        if (selected) {
            if (state.viewerMode === 'original' && !hasOriginalSnapshot(selected.file)) {
                state.viewerMode = isLocalSourceFileModified(selected.file) ? 'diff' : 'current';
            }
            if (state.viewerMode === 'diff' && !hasOriginalSnapshot(selected.file)) {
                state.viewerMode = 'current';
            }
        } else {
            state.viewerMode = 'current';
            state.mobileWorkspacePane = 'tree';
        }
    }

    async function applyExternalLocalSources(nextSources, toastText = '') {
        console.info('[Assistant][LocalSources] host->iframe applyExternalLocalSources', summarizeLocalSources(nextSources));
        const normalizedNextSources = normalizeLocalSources(nextSources);
        return await applyAuthoritativeLocalSources(normalizedNextSources, toastText);
    }

    async function appendLocalSourceFiles(files, options = {}) {
        const normalizedFiles = Array.isArray(files) ? files.filter(Boolean) : [];
        if (!normalizedFiles.length) return false;
        try {
            const grouped = groupSelectedFiles(normalizedFiles, options.mode === 'directory' ? 'directory' : 'files');
            const existingLabels = new Set(normalizeLocalSources(state.localSources).map((source) => source.label));
            const importedSources = [];
            let importedFiles = 0;
            let rejectedFiles = 0;
            let duplicateFiles = 0;
            const totalFiles = normalizedFiles.length;
            let processedFiles = 0;
            let lastProgressAt = 0;
            let lastPercent = -1;

            const updateImportProgress = (suffix = '') => {
                const now = Date.now();
                const percent = totalFiles > 0
                    ? Math.max(0, Math.min(100, Math.round((processedFiles / totalFiles) * 100)))
                    : 0;
                if (suffix || percent !== lastPercent || now - lastProgressAt >= IMPORT_PROGRESS_INTERVAL_MS) {
                    lastProgressAt = now;
                    lastPercent = percent;
                    setImportProgress?.({
                        active: true,
                        label: options.mode === 'directory' ? '正在导入文件夹到工作区' : '正在导入文件到工作区',
                        detail: totalFiles > 0
                            ? `${processedFiles}/${totalFiles}${suffix ? ` · ${suffix}` : ''}`
                            : (suffix || ''),
                        percent,
                    });
                }
            };

            updateImportProgress();

            for (const group of grouped) {
                const desiredLabel = group.label || 'source';
                const sourceLabel = pickUniqueLabel(desiredLabel, existingLabels);
                const sourceFiles = [];
                const usedPaths = new Set();

                for (const file of group.files) {
                    const rawRelativePath = group.mode === 'directory'
                        ? normalizeLocalSourcePath(file.webkitRelativePath || file.name || '')
                        : normalizeLocalSourcePath(file.name || '');
                    const relativePath = group.mode === 'directory'
                        ? normalizeLocalSourcePath(rawRelativePath.split('/').slice(1).join('/')) || normalizeLocalSourcePath(file.name || '')
                        : normalizeLocalSourcePath(file.name || '');
                    const candidatePath = relativePath || normalizeLocalSourcePath(file.name || '');
                    if (!isSupportedPublicTextPath(candidatePath)) {
                        rejectedFiles += 1;
                        processedFiles += 1;
                        updateImportProgress();
                        continue;
                    }
                    if (usedPaths.has(candidatePath)) {
                        duplicateFiles += 1;
                        processedFiles += 1;
                        updateImportProgress();
                        continue;
                    }
                    usedPaths.add(candidatePath);

                    const content = await readFileAsText(file, {
                        onProgress: (loadedBytes, totalBytesForFile) => {
                            if (!totalBytesForFile) return;
                            const filePercent = Math.max(0, Math.min(100, Math.round((loadedBytes / totalBytesForFile) * 100)));
                            const overallPercent = totalFiles > 0
                                ? Math.max(0, Math.min(100, Math.round(((processedFiles + (loadedBytes / totalBytesForFile)) / totalFiles) * 100)))
                                : 0;
                            setImportProgress?.({
                                active: true,
                                label: options.mode === 'directory' ? '正在导入文件夹到工作区' : '正在导入文件到工作区',
                                detail: `${processedFiles}/${totalFiles} · ${file.name || candidatePath} ${filePercent}%`,
                                percent: overallPercent,
                            });
                        },
                    });
                    sourceFiles.push(buildLocalFileRecord({
                        sourceLabel,
                        fileName: file.name || candidatePath,
                        relativePath: candidatePath,
                        content,
                        sizeBytes: file.size,
                    }));
                    processedFiles += 1;
                    updateImportProgress();
                    await waitForNextFrame();
                }

                if (!sourceFiles.length) continue;

                importedSources.push(createLocalSourceRecord({
                    sourceId: createRequestId('local-source'),
                    label: sourceLabel,
                    importedAt: Date.now(),
                    files: sourceFiles,
                }));
                importedFiles += sourceFiles.length;
            }

            if (!importedSources.length) {
                showToast?.(summarizeImportResult({
                    importedSources: 0,
                    importedFiles: 0,
                    rejectedFiles,
                    duplicateFiles,
                }));
                return false;
            }

            const summaryText = summarizeImportResult({
                importedSources: importedSources.length,
                importedFiles,
                rejectedFiles,
                duplicateFiles,
            });

            const files = importedSources.flatMap((source) => (
                Array.isArray(source.files)
                    ? source.files.map((file) => ({
                        path: file.path,
                        content: file.content,
                    }))
                    : []
            ));
            const result = await callWorkspaceHostTool(INTERNAL_WORKSPACE_TOOL_NAMES.BATCH_WRITE_FILES, {
                files,
            }, {
                source: WORKSPACE_SOURCES.UI_ACTION,
                path: resolveImportedWorkspaceTarget(importedSources) || LOCAL_SOURCE_PREFIX,
            });
            if (!result || result.ok === false) {
                showToast?.(`导入到工作区失败：${String(result?.error || 'workspace_write_failed')}`);
                return false;
            }
            showToast?.(summaryText);
            const autoOpenTarget = resolveImportedWorkspaceTarget(importedSources);
            if (autoOpenTarget) {
                primeWorkspaceSelection(autoOpenTarget);
            }
            return true;
        } catch (error) {
            showToast?.(`导入到工作区失败：${String(error?.message || error || 'unknown_error')}`);
            return false;
        } finally {
            setImportProgress?.({ active: false });
        }
    }

    async function removeLocalSource(sourceId) {
        const normalizedId = String(sourceId || '').trim();
        if (!normalizedId) return;
        const source = normalizeLocalSources(state.localSources).find((item) => item.sourceId === normalizedId);
        if (!source?.rootPath) return;
        const result = await callWorkspaceHostTool(TOOL_NAMES.DELETE, {
            path: source.rootPath,
        }, {
            source: WORKSPACE_SOURCES.UI_ACTION,
            path: source.rootPath,
        });
        if (!result || result.ok === false) {
            showToast?.(`移除工作区根失败：${String(result?.error || 'unknown_error')}`);
            return;
        }
        showToast?.('已移除工作区根');
    }

    function downloadLocalSource(sourceId) {
        const normalizedId = String(sourceId || '').trim();
        if (!normalizedId) return false;

        const source = getDisplaySources().find((item) => item.sourceId === normalizedId);
        if (!source || !Array.isArray(source.files) || !source.files.length) {
            showToast?.('没有可下载的工作区内容');
            return false;
        }

        if (source.files.length === 1) {
            const [file] = source.files;
            const filename = file.name || file.relativePath || 'untitled.txt';
            downloadBlob(
                new Blob([typeof file.content === 'string' ? file.content : ''], { type: 'text/plain;charset=utf-8' }),
                filename,
            );
            showToast?.(`已下载 ${filename}`);
            return true;
        }

        const zipBytes = buildLocalSourceZip(source);
        const zipName = `${formatLocalSourceDownloadName(source.label, '.zip')}`;
        downloadBlob(new Blob([zipBytes], { type: 'application/zip' }), zipName);
        showToast?.(`已下载 ${zipName}`);
        return true;
    }

    function downloadAllLocalSources() {
        const normalizedSources = getDisplaySources();
        if (!normalizedSources.length) {
            showToast?.('没有可下载的工作区内容');
            return false;
        }

        const entries = buildLocalSourcesArchiveEntries(normalizedSources);
        const zipBytes = zipSync(entries, { level: 1 });
        const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const zipName = `local-workspace-${stamp}.zip`;
        downloadBlob(new Blob([zipBytes], { type: 'application/zip' }), zipName);
        showToast?.(`已下载 ${zipName}`);
        return true;
    }

    function downloadLocalFile(targetPath) {
        const match = findLocalFileByPath(getDisplaySources(), targetPath);
        if (!match) {
            showToast?.('目标文件不存在');
            return false;
        }
        downloadBlob(
            new Blob([typeof match.file.content === 'string' ? match.file.content : ''], { type: 'text/plain;charset=utf-8' }),
            match.file.name || match.file.relativePath || 'untitled.txt',
        );
        showToast?.(`已下载 ${match.file.name || match.file.relativePath || 'untitled.txt'}`);
        return true;
    }

    async function clearLocalSources() {
        if (!normalizeLocalSources(state.localSources).length) return true;
        const confirmed = window.confirm('确定清空当前工作区中的全部文件和目录吗？');
        if (!confirmed) return false;
        try {
            const result = await callWorkspaceHostTool(TOOL_NAMES.DELETE, {
                path: LOCAL_SOURCE_PREFIX,
            }, {
                source: WORKSPACE_SOURCES.UI_ACTION,
                path: LOCAL_SOURCE_PREFIX,
            });
            if (!result || result.ok === false) {
                showToast?.(`清空失败：${String(result?.error || 'unknown_error')}`);
                return false;
            }
        } catch (error) {
            showToast?.(`清空失败：${String(error?.message || error || 'unknown_error')}`);
            return false;
        }
        showToast?.('已清空工作区');
        return true;
    }

    function updateEditorStatus(entry, status, error = '') {
        entry.status = status;
        entry.error = error;
        setDraftRecord(entry.path, { status, error });
    }

    async function resolveEditorConflict(path, action) {
        const entry = pendingEditorWrites.get(path);
        if (!entry || entry.inFlightPromise) return false;
        if (action === 'saved') {
            if (entry.conflictSnapshot) await applyExternalLocalSources(entry.conflictSnapshot);
            discardPendingEditorWrite(path);
            ensureWorkspaceSelection();
            render?.();
            return true;
        }
        if (action === 'mine' && entry.conflictSnapshot) {
            entry.preconditions = buildWorkspacePreconditions(TOOL_NAMES.WRITE, { path }, entry.conflictSnapshot);
        }
        entry.queuedContent = getDraftRecord(path).content;
        updateEditorStatus(entry, 'queued');
        await sendEditorWrite(path, { retryContent: action === 'retry' ? entry.inFlightContent : undefined });
        return !pendingEditorWrites.has(path);
    }

    async function sendEditorWrite(targetPath, { retryContent } = {}) {
        const entry = pendingEditorWrites.get(targetPath);
        if (!entry || entry.disposed || entry.inFlightPromise) return entry?.inFlightPromise || null;
        if (entry.status === 'conflict' || entry.status === 'error' || entry.queuedContent === null) return null;
        // Confirm the same uncertain write before advancing to newer typing.
        // A failed retry must not replace the only evidence of that write.
        const content = typeof retryContent === 'string' ? retryContent : entry.queuedContent;
        if (entry.queuedContent === content) entry.queuedContent = null;
        entry.inFlightContent = content;
        updateEditorStatus(entry, 'saving');
        const writePromise = callWorkspaceHostTool(TOOL_NAMES.WRITE, { path: targetPath, content }, {
            source: WORKSPACE_SOURCES.EDITOR,
            preconditions: entry.preconditions,
            retryContent,
            onWorkspaceObserved: observations => { entry.preconditions = observations; },
            onWorkspaceConflict: snapshot => { entry.conflictSnapshot = normalizeLocalSources(snapshot); },
            path: targetPath,
        }).then(async result => {
            entry.inFlightPromise = null;
            if (entry.disposed) return result;
            if (!result || result.ok === false) {
                if (result?.error === WORKSPACE_CONFLICT) {
                    updateEditorStatus(entry, 'conflict');
                    await applyExternalLocalSources(entry.conflictSnapshot);
                } else {
                    updateEditorStatus(entry, 'error', String(result?.error || 'workspace_write_failed'));
                }
                renderWorkspaceOnly?.();
                return result;
            }
            updateEditorStatus(entry, 'idle');
            if (entry.queuedContent !== null && entry.queuedContent !== content) {
                await sendEditorWrite(targetPath);
                return result;
            }
            clearDraftRecord(targetPath);
            pendingEditorWrites.delete(targetPath);
            renderWorkspaceOnly?.();
            return result;
        }).catch(error => {
            entry.inFlightPromise = null;
            if (!entry.disposed) {
                updateEditorStatus(entry, 'error', String(error?.message || error));
                renderWorkspaceOnly?.();
            }
            return null;
        });
        entry.inFlightPromise = writePromise;
        return writePromise;
    }

    function updateLocalFileContent(targetPath, content, options = {}) {
        const match = findLocalFileByPath(state.localSources, targetPath);
        const previous = getDraftRecord(targetPath);
        if (!match && !previous) return false;
        const nextContent = String(content ?? '');
        if (nextContent === (previous?.content ?? match?.file.content)) {
            if (options.flush) observeBackgroundTask(flushPendingWorkspaceChanges({ toolName: TOOL_NAMES.WRITE, args: { path: targetPath } }), { source: import.meta.url, operation: "updateLocalFileContent" });
            return true;
        }
        const entry = pendingEditorWrites.get(targetPath) || {
            path: targetPath,
            preconditions: buildWorkspacePreconditions(TOOL_NAMES.WRITE, { path: targetPath }, state.localSources),
            inFlightPromise: null, inFlightContent: null, queuedContent: null, timer: 0, status: 'queued',
        };
        setDraftRecord(targetPath, {
            file: previous?.file || { ...match.file },
            content: nextContent, status: entry.status, error: entry.error || '',
        });
        entry.queuedContent = nextContent;
        pendingEditorWrites.set(targetPath, entry);
        if (entry.timer) clearTimeout(entry.timer);
        if (entry.status !== 'conflict' && entry.status !== 'error') {
            entry.timer = window.setTimeout(() => {
                entry.timer = 0;
                observeBackgroundTask(sendEditorWrite(targetPath), { source: import.meta.url, operation: "callback" });
            }, 16);
        }
        if (options.flush) observeBackgroundTask(flushPendingWorkspaceChanges({ toolName: TOOL_NAMES.WRITE, args: { path: targetPath } }), { source: import.meta.url, operation: "updateLocalFileContent" });
        if (options.render) render?.();
        return true;
    }

    async function restoreLocalFile(targetPath) {
        const match = findLocalFileByPath(state.localSources, targetPath);
        if (!match) {
            showToast?.('目标文件不存在');
            return false;
        }
        if (!hasOriginalSnapshot(match.file)) {
            showToast?.('这个文件没有可恢复的原始快照');
            return false;
        }
        const result = await callWorkspaceHostTool(TOOL_NAMES.WRITE, {
            path: match.file.path,
            content: match.file.originalContent,
        }, {
            source: WORKSPACE_SOURCES.UI_ACTION,
            path: match.file.path,
        });
        if (!result || result.ok === false) {
            showToast?.(`恢复失败：${String(result?.error || 'workspace_write_failed')}`);
            return false;
        }
        return true;
    }

    async function createLocalFileAt(targetPath = '') {
        const defaultDirectoryPath = resolveCreateTargetDirectoryPath(targetPath);
        const defaultPath = `${defaultDirectoryPath}new-file.txt`;

        const enteredPath = window.prompt('输入要新建的工作区文件路径', formatWorkspacePromptPath(defaultPath));
        if (enteredPath === null) return false;

        const normalizedPath = normalizeWorkspacePromptFilePath(enteredPath);
        if (!normalizedPath) {
            showToast?.('请输入有效的工作区文本文件路径');
            return false;
        }

        const existing = findLocalFileByPath(state.localSources, normalizedPath);
        if (existing) {
            showToast?.('目标文件已存在，请改用重命名或编辑');
            return false;
        }
        const result = await callWorkspaceHostTool(TOOL_NAMES.WRITE, {
            path: normalizedPath,
            content: '',
        }, {
            source: WORKSPACE_SOURCES.UI_ACTION,
            path: normalizedPath,
        });
        if (!result || result.ok === false) {
            showToast?.(`新建失败：${String(result?.error || 'workspace_write_failed')}`);
            return false;
        }
        primeWorkspaceSelection(normalizedPath, { viewerMode: 'diff' });
        return true;
    }

    async function createLocalDirectoryAt(targetPath = '') {
        const defaultDirectoryPath = resolveCreateTargetDirectoryPath(targetPath);
        const defaultPath = `${defaultDirectoryPath}new-folder/`;
        const enteredPath = window.prompt('输入要新建的工作区目录路径', formatWorkspacePromptPath(defaultPath));
        if (enteredPath === null) return false;

        const normalizedPath = normalizeWorkspacePromptDirectoryPath(enteredPath);
        if (!normalizedPath) {
            showToast?.('请输入有效的工作区目录路径');
            return false;
        }
        if (findLocalDirectoryByPath(state.localSources, normalizedPath) || findLocalFileByPath(state.localSources, normalizedPath)) {
            showToast?.('目标目录已存在，请换一个路径');
            return false;
        }
        try {
            const result = await callWorkspaceHostTool(INTERNAL_WORKSPACE_TOOL_NAMES.CREATE_DIRECTORY, {
                path: normalizedPath,
            }, {
                source: WORKSPACE_SOURCES.UI_ACTION,
                path: normalizedPath,
            });
            if (!result || result.ok === false) {
                showToast?.(`新建目录失败：${String(result?.error || 'workspace_write_failed')}`);
                return false;
            }
        } catch (error) {
            showToast?.(`新建目录失败：${String(error?.message || error || 'workspace_write_failed')}`);
            return false;
        }
        primeWorkspaceSelection(normalizedPath);
        return true;
    }

    async function renameLocalPath(targetPath = '') {
        const fileMatch = findLocalFileByPath(state.localSources, targetPath);
        const directoryMatch = fileMatch ? null : findLocalDirectoryByPath(state.localSources, targetPath);
        const currentPath = fileMatch?.file.path || directoryMatch?.directoryPath || '';
        if (!currentPath) {
            showToast?.('没有找到要重命名的目标');
            return false;
        }

        const enteredPath = window.prompt('输入新的工作区路径', formatWorkspacePromptPath(currentPath));
        if (enteredPath === null) return false;
        const normalizedNextPath = fileMatch
            ? normalizeWorkspacePromptFilePath(enteredPath)
            : normalizeWorkspacePromptDirectoryPath(enteredPath);
        if (!normalizedNextPath) {
            showToast?.(`请输入有效的工作区${fileMatch ? '文件' : '目录'}路径`);
            return false;
        }
        if (normalizedNextPath === currentPath) return false;
        const result = await callWorkspaceHostTool(TOOL_NAMES.MOVE, {
            fromPath: currentPath,
            toPath: normalizedNextPath,
            overwrite: false,
        }, {
            source: WORKSPACE_SOURCES.UI_ACTION,
            path: currentPath,
        });
        if (!result || result.ok === false) {
            const message = String(result?.error || 'unknown_error');
            if (message === 'local_destination_exists') {
                showToast?.('目标路径已存在，请换一个路径');
                return false;
            }
            showToast?.(`重命名失败：${message}`);
            return false;
        }
        primeWorkspaceSelection(normalizedNextPath);
        return true;
    }

    async function deleteLocalPath(targetPath = '') {
        const fileMatch = findLocalFileByPath(state.localSources, targetPath);
        const directoryMatch = fileMatch ? null : findLocalDirectoryByPath(state.localSources, targetPath);
        const currentPath = fileMatch?.file.path || directoryMatch?.directoryPath || '';
        if (!currentPath) {
            showToast?.('没有找到要删除的目标');
            return false;
        }

        const confirmed = window.confirm(
            fileMatch
                ? `确定删除 ${currentPath} 吗？`
                : `确定删除目录 ${currentPath} 及其下 ${directoryMatch.files.length} 个文件吗？`,
        );
        if (!confirmed) return false;
        const result = await callWorkspaceHostTool(TOOL_NAMES.DELETE, {
            path: currentPath,
        }, {
            source: WORKSPACE_SOURCES.UI_ACTION,
            path: currentPath,
        });
        if (!result || result.ok === false) {
            showToast?.(`删除失败：${String(result?.error || 'unknown_error')}`);
            return false;
        }
        return true;
    }

    function openWorkspace(targetPath = '') {
        if (targetPath) {
            const opened = (isLocalRootPath(targetPath) && selectWorkspaceDirectory(LOCAL_SOURCE_PREFIX))
                || selectWorkspaceFile(targetPath)
                || selectWorkspaceDirectory(targetPath);
            if (!opened) {
                showToast?.(`没有找到 ${targetPath}`);
                return false;
            }
            render?.();
            return true;
        }

        state.isWorkspaceOpen = true;
        ensureWorkspaceSelection();
        persistWorkspaceUiStateImmediately();
        render?.();
        return true;
    }

    function closeWorkspace() {
        if (!state.isWorkspaceOpen) return;
        observeBackgroundTask(flushPendingWorkspaceChanges(), { source: import.meta.url, operation: "closeWorkspace" });
        state.isWorkspaceOpen = false;
        onWorkspaceClosed?.();
        persistWorkspaceUiStateImmediately();
        render?.();
    }

    function toggleWorkspace() {
        if (state.isWorkspaceOpen) {
            closeWorkspace();
            return;
        }
        openWorkspace(state.selectedFilePath);
    }

    function openFirstModifiedFile() {
        const firstModified = findFirstModifiedFile();
        if (!firstModified) return false;
        return openWorkspace(firstModified.path);
    }

    function selectWorkspaceNode(targetPath) {
        const normalizedTargetPath = normalizeLocalSourcePath(targetPath);
        if (!normalizedTargetPath) return false;
        if (isLocalRootPath(normalizedTargetPath)) {
            state.isWorkspaceOpen = true;
            state.selectedSourceId = 'all';
            state.selectedTreePath = LOCAL_SOURCE_PREFIX;
            state.selectedFilePath = '';
            state.viewerMode = 'current';
            state.mobileWorkspacePane = 'tree';
            state.treeExpandedKeys = Array.from(collectDirectoryExpansionKeys(buildWorkspaceTree(normalizeLocalSources(state.localSources), {
                selectedSourceId: 'all',
                searchQuery: state.fileSearchQuery,
                modifiedOnly: state.showModifiedOnly,
                isModifiedFile: isLocalSourceFileModified,
            }).nodes));
            onWorkspaceSelectionChanged?.();
            persistWorkspaceUiState();
            renderWorkspaceOnly?.();
            return true;
        }

        const fileMatch = findLocalFileByPath(state.localSources, normalizedTargetPath);
        if (fileMatch) {
            const opened = selectWorkspaceFile(normalizedTargetPath, {
                preserveSourceFilter: true,
                preserveSearch: true,
                preserveModifiedOnly: true,
            });
            if (opened) {
                render?.();
            }
            return opened;
        }

        const dirMatch = findLocalDirectoryByPath(state.localSources, normalizedTargetPath);
        if (!dirMatch) return false;

        state.isWorkspaceOpen = true;
        state.selectedSourceId = 'all';
        state.selectedTreePath = dirMatch.directoryPath;
        state.selectedFilePath = '';
        state.viewerMode = 'current';
        state.mobileWorkspacePane = 'tree';
        onWorkspaceSelectionChanged?.();
        persistWorkspaceUiState();
        renderWorkspaceOnly?.();
        return true;
    }

    function setWorkspaceWidth(width, options = {}) {
        const shouldPersist = options.persist !== false;
        const shouldRender = options.render !== false;
        state.workspaceWidth = normalizeWorkspaceWidth(width);
        if (shouldPersist) {
            persistWorkspaceUiStateImmediately();
        }
        if (shouldRender) {
            render?.();
        }
    }

    function setWorkspaceSearchQuery(value) {
        state.fileSearchQuery = String(value || '');
        ensureWorkspaceSelection();
        persistWorkspaceUiState();
        renderWorkspaceOnly?.();
    }

    function setWorkspaceModifiedOnly(value) {
        state.showModifiedOnly = !!value;
        ensureWorkspaceSelection();
        persistWorkspaceUiState();
        renderWorkspaceOnly?.();
    }

    function setWorkspaceViewerMode(mode) {
        if (!['current', 'original', 'diff'].includes(mode)) return;
        state.viewerMode = mode;
        ensureWorkspaceSelection();
        persistWorkspaceUiState();
        renderWorkspaceOnly?.();
    }

    function toggleWorkspaceNode(nodeKey) {
        const next = new Set(Array.isArray(state.treeExpandedKeys) ? state.treeExpandedKeys : []);
        if (next.has(nodeKey)) {
            next.delete(nodeKey);
        } else {
            next.add(nodeKey);
        }
        state.treeExpandedKeys = Array.from(next);
        persistWorkspaceUiState();
        renderWorkspaceOnly?.();
    }

    function renderWorkspace(container, options = {}) {
        ensureWorkspaceSelection();
        const normalizedSources = getDisplaySources();
        const summary = summarizeLocalSources(normalizedSources);
        const workspaceTree = buildWorkspaceTree(normalizedSources, {
            selectedSourceId: 'all',
            searchQuery: state.fileSearchQuery,
            modifiedOnly: state.showModifiedOnly,
            isModifiedFile: isLocalSourceFileModified,
        });
        const selectedMatch = findLocalFileByPath(normalizedSources, state.selectedFilePath);
        const selectedDraft = getDraftRecord(state.selectedFilePath);
        const renderedSelectedMatch = selectedMatch && selectedDraft
            ? {
                ...selectedMatch,
                file: {
                    ...selectedMatch.file,
                    content: String(selectedDraft.content || ''),
                },
            }
            : selectedMatch;
        renderWorkspaceUi(container, {
            ...options,
            localSources: normalizedSources,
            summary,
            workspaceTree,
            selectedMatch: renderedSelectedMatch,
            editorDraft: selectedDraft,
            savedFileExists: !!findLocalFileByPath(state.localSources, state.selectedFilePath),
            onResolveConflict: action => { observeBackgroundTask(resolveEditorConflict(state.selectedFilePath, action), { source: import.meta.url, operation: "onResolveConflict" }); },
            workspaceState: {
                selectedSourceId: 'all',
                selectedFilePath: state.selectedFilePath,
                selectedTreePath: state.selectedTreePath,
                fileSearchQuery: state.fileSearchQuery,
                showModifiedOnly: state.showModifiedOnly,
                viewerMode: state.viewerMode,
                mobileWorkspacePane: state.mobileWorkspacePane,
                treeExpandedKeys: state.treeExpandedKeys,
                workspaceVersion: getWorkspaceRuntimeMeta().version,
                workspaceDrafts: state.workspaceDrafts,
            },
            isModifiedFile: isLocalSourceFileModified,
            hasOriginalSnapshot,
            onDownloadAll: () => {
                downloadAllLocalSources();
            },
            onClearAll: () => {
                observeBackgroundTask(clearLocalSources(), { source: import.meta.url, operation: "onClearAll" });
            },
            onCloseWorkspace: () => {
                closeWorkspace();
            },
            onSearchChange: (value) => {
                setWorkspaceSearchQuery(value);
            },
            onToggleModifiedOnly: (value) => {
                setWorkspaceModifiedOnly(value);
            },
            onToggleNode: (nodeKey) => {
                toggleWorkspaceNode(nodeKey);
            },
            onSelectFile: (targetPath) => {
                selectWorkspaceFile(targetPath, {
                    preserveSourceFilter: true,
                    preserveSearch: true,
                    preserveModifiedOnly: true,
                });
                renderWorkspaceOnly?.();
            },
            onSelectNode: (targetPath) => {
                selectWorkspaceNode(targetPath);
            },
            onSetViewerMode: (mode) => {
                setWorkspaceViewerMode(mode);
            },
            onShowTree: () => {
                setMobileWorkspacePane('tree', { render: true });
            },
            onDownloadFile: (targetPath) => {
                downloadLocalFile(targetPath);
            },
            onRestoreFile: (targetPath) => {
                observeBackgroundTask(restoreLocalFile(targetPath), { source: import.meta.url, operation: "onRestoreFile" });
            },
            onUpdateFileContent: (targetPath, content, nextOptions = {}) => {
                return updateLocalFileContent(targetPath, content, nextOptions);
            },
            onCreateFile: (targetPath) => {
                observeBackgroundTask(createLocalFileAt(targetPath), { source: import.meta.url, operation: "onCreateFile" });
            },
            onCreateDirectory: (targetPath) => {
                observeBackgroundTask(createLocalDirectoryAt(targetPath), { source: import.meta.url, operation: "onCreateDirectory" });
            },
            onRenamePath: (targetPath) => {
                observeBackgroundTask(renameLocalPath(targetPath), { source: import.meta.url, operation: "onRenamePath" });
            },
            onDeletePath: (targetPath) => {
                observeBackgroundTask(deleteLocalPath(targetPath), { source: import.meta.url, operation: "onDeletePath" });
            },
        });
    }

    return {
        normalizeLocalSources,
        summarizeLocalSources,
        appendLocalSourceFiles,
        removeLocalSource,
        downloadLocalSource,
        downloadLocalFile,
        downloadAllLocalSources,
        restoreLocalFile,
        updateLocalFileContent,
        setMobileWorkspacePane,
        createLocalFileAt,
        createLocalDirectoryAt,
        renameLocalPath,
        deleteLocalPath,
        clearLocalSources,
        applyExternalLocalSources,
        openWorkspace,
        closeWorkspace,
        toggleWorkspace,
        selectWorkspaceFile,
        selectWorkspaceNode,
        setWorkspaceWidth,
        renderWorkspace,
        ensureWorkspaceSelection,
        getWorkspaceSummary,
        openFirstModifiedFile,
        flushPendingWorkspaceChanges,
        hasPendingWorkspaceChanges,
        resolveEditorConflict,
        captureRunWorkspaceBaseline,
    };
}
