import { zipSync, strToU8 } from '../../../../libs/fflate.mjs';
import { isSupportedPublicTextPath } from '../../../agent-core/tools/text-file-types.js';
import {
    getWorkspaceImageMimeType,
    normalizeWorkspaceImagePath,
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
import { buildWorkspacePreconditions, captureWorkspacePath, findWorkspaceConflicts, workspaceMutationScopes, WORKSPACE_CONFLICT } from '../../shared/workspace-preconditions.js';
import { WORKSPACE_COPY } from './workspace-copy.js';
import { readWorkspaceImageById } from '../../shared/workspace-images.js';
import { shouldAutoRevealWorkspace } from '../../shared/window-layout.js';
import { TOOL_NAMES } from '../tooling.js';
import { buildWorkspaceTree, collectDirectoryExpansionKeys } from './local-workspace-tree.js';
import { displayCardWorkspacePath } from '../../../card-workspace/paths.js';
import { cardMetadataName, rebaseCardName } from '../../../card-workspace/rename.js';
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

function createLocalSourceRecord({ sourceId, label, rootPath, importedAt, files, directories }) {
    return kernelCreateLocalSourceRecord({ sourceId, label, rootPath, importedAt, files, directories });
}

function summarizeImportResult({ importedSources, importedFiles, rejectedFiles, duplicateFiles }) {
    const parts = [importedFiles
        ? WORKSPACE_COPY.importCompleted(importedSources, importedFiles)
        : rejectedFiles.length ? WORKSPACE_COPY.importSupportedFiles : WORKSPACE_COPY.importEmpty];
    if (duplicateFiles) parts.push(WORKSPACE_COPY.importDuplicates(duplicateFiles));
    const rejected = rejectedFiles.map(({ name, reason }) => (
        WORKSPACE_COPY.importRejected(name, WORKSPACE_COPY.importRejectionReasons[reason])
    ));
    return [parts.join('，'), ...rejected].join('\n');
}

function resolveImportedWorkspaceTarget(importedSources) {
    const [first] = importedSources;
    if (!first) return '';
    return importedSources.length === 1 && first.files.length === 1 ? first.files[0].path : first.rootPath;
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

function readDownloadBlob(file) {
    return file.kind === 'image'
        ? readWorkspaceImageById(file.blobId)
        : new Blob([file.content], { type: 'text/plain;charset=utf-8' });
}

export async function buildLocalSourcesArchiveEntries(localSources = [], prefix = '') {
    const entries = Object.create(null);
    for (const source of normalizeLocalSources(localSources)) {
        const root = source.rootPath;
        for (const path of [root, ...collectSourceDirectoryPaths(source).map(relative => `${root}${relative}/`)]) {
            if (path.startsWith(prefix) && path !== prefix) entries[path.slice(prefix.length)] = new Uint8Array();
        }
        for (const file of source.files) {
            if (!file.path.startsWith(prefix)) continue;
            entries[file.path.slice(prefix.length)] = file.kind === 'image'
                ? new Uint8Array(await (await readDownloadBlob(file)).arrayBuffer())
                : strToU8(file.content);
        }
    }
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
        describeError,
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
    let directoryChangeQueue = Promise.resolve();

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
        state.selectedSourceId = 'all';
        if (normalizedPath.endsWith('/')) {
            state.selectedTreePath = normalizeLocalDirectoryPath(normalizedPath) || LOCAL_SOURCE_PREFIX;
            state.selectedFilePath = '';
            if (options.viewerMode) {
                state.viewerMode = options.viewerMode;
            } else {
                state.viewerMode = 'current';
            }
            return true;
        }

        if (shouldAutoRevealWorkspace()) state.isWorkspaceOpen = true;
        state.selectedFilePath = normalizeWritableLocalFilePath(normalizedPath) || normalizedPath;
        state.selectedTreePath = state.selectedFilePath;
        if (options.viewerMode) {
            state.viewerMode = options.viewerMode;
        }
        return true;
    }

    function showWorkspaceOperationError(error) {
        const raw = String(error?.error || error?.message || error || 'unknown_error');
        // callWorkspaceHostTool already refreshed the snapshot and notified once.
        if (raw === WORKSPACE_CONFLICT) return;
        const localErrors = {
            workspace_unsaved_changes: WORKSPACE_COPY.operationUnsavedChanges,
            workspace_host_tool_unavailable: WORKSPACE_COPY.hostUnavailable,
            workspace_write_failed: WORKSPACE_COPY.writeFailed,
        };
        const reason = Object.hasOwn(localErrors, raw) ? localErrors[raw]
            : describeError?.({ ...error, message: raw }, WORKSPACE_COPY.operationFailedUnknown) ?? WORKSPACE_COPY.operationFailedUnknown;
        showToast?.(WORKSPACE_COPY.operationFailed(reason));
    }

    async function callWorkspaceHostTool(toolName, args = {}, options = {}) {
        if (typeof callHostTool !== 'function') {
            return { ok: false, error: 'workspace_host_tool_unavailable' };
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
        let request;
        let result;
        try {
            request = callHostTool(toolName, args, {
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
            result = await request;
        } catch (error) {
            result = { ...error, ok: false, error: String(error?.message || error) };
        } finally {
            pendingWorkspaceOperations.delete(request);
        }
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
        if (!state.isWorkspaceOpen || state.viewerMode === 'diff' || !selectedFilePath) {
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

    async function applyAuthoritativeLocalSources(nextSources, toastText = '', directoryChange = null) {
        const normalizedNextSources = normalizeLocalSources(nextSources);
        const images = sources => JSON.stringify((sources || []).flatMap(source => source.files.filter(file => file.kind === 'image').map(file => [file.blobId, file.path])));
        const imagesChanged = images(state.localSources) !== images(normalizedNextSources);
        state.localSources = normalizedNextSources;
        ensureWorkspaceSelection();
        if (imagesChanged) deps.onWorkspaceImagesChanged?.();
        if (directoryChange) {
            deps.onWorkspaceDirectoryChanged?.(directoryChange.fromPath, directoryChange.toPath);
            renderWorkspaceOnly?.();
        } else if (!shouldSkipAuthoritativeRender(normalizedNextSources)) {
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

    function getCurrentWorkspaceDirectoryPath() {
        const selectedDirectory = String(state.selectedTreePath || '').endsWith('/') && normalizeLocalDirectoryPath(state.selectedTreePath);
        if (selectedDirectory) return selectedDirectory;
        const selectedFile = findLocalFileByPath(state.localSources, state.selectedFilePath)?.file.path;
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

    function selectWorkspaceFile(targetPath, options = {}) {
        const match = findLocalFileByPath(getDisplaySources(), targetPath);
        if (!match) return false;

        if (options.reveal !== false) state.isWorkspaceOpen = true;
        state.selectedSourceId = 'all';
        state.selectedFilePath = match.file.path;
        state.selectedTreePath = match.file.path;
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
            state.viewerMode = 'current';
        }
        onWorkspaceSelectionChanged?.();
        persistWorkspaceUiStateImmediately();
        return true;
    }

    function selectWorkspaceDirectory(targetPath) {
        const match = findLocalDirectoryByPath(state.localSources, targetPath);
        if (!match) return false;

        state.selectedSourceId = 'all';
        state.selectedTreePath = match.directoryPath;
        state.selectedFilePath = '';
        state.fileSearchQuery = '';
        state.showModifiedOnly = false;
        state.viewerMode = 'current';
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

        const selected = findLocalFileByPath(normalizedSources, state.selectedFilePath);
        if (state.viewerMode === 'diff' && !hasOriginalSnapshot(selected?.file)) state.viewerMode = 'current';
    }

    async function applyExternalLocalSources(nextSources, toastText = '') {
        console.info('[Assistant][LocalSources] host->iframe applyExternalLocalSources', summarizeLocalSources(nextSources));
        const normalizedNextSources = normalizeLocalSources(nextSources);
        return await applyAuthoritativeLocalSources(normalizedNextSources, toastText);
    }

    function applyExternalDirectoryChange(change) {
        const result = directoryChangeQueue.then(() => relocateDirectoryDrafts(change));
        directoryChangeQueue = result.then(() => undefined, () => undefined);
        return result;
    }

    async function relocateDirectoryDrafts({ fromPath, toPath, localSources }) {
        // Finish outstanding receipts before replacing their UI snapshot. The
        // repository rejects late writes at the removed path; their text stays
        // in workspaceDrafts until it is reattached below.
        for (;;) {
            const entries = [...pendingEditorWrites.values()].filter(entry => entry.path.startsWith(fromPath) && !entry.disposed);
            if (!entries.length) break;
            for (const entry of entries) {
                if (entry.timer) { clearTimeout(entry.timer); entry.timer = 0; }
                entry.disposed = true;
            }
            await Promise.all(entries.map(entry => entry.inFlightPromise));
        }
        const drafts = Object.entries(state.workspaceDrafts || {}).filter(([path]) => path.startsWith(fromPath));
        const writes = new Map(drafts.map(([path]) => [path, pendingEditorWrites.get(path)]));
        for (const [path] of drafts) discardPendingEditorWrite(path);
        const relocate = path => path?.startsWith(fromPath) ? (toPath ? toPath + path.slice(fromPath.length) : '') : path;
        state.selectedFilePath = relocate(state.selectedFilePath);
        state.selectedTreePath = relocate(state.selectedTreePath);
        if (toPath) {
            for (const [path, draft] of drafts) {
                const nextPath = relocate(path);
                const previous = writes.get(path);
                const expected = previous.preconditions.find(item => item.path === path && item.scope === 'entry').expected;
                const saved = findLocalFileByPath(localSources, nextPath)?.file;
                const name = path === fromPath + 'card.json' ? cardMetadataName(saved?.originalContent) : undefined;
                const baseline = expected.kind === 'file' ? rebaseCardName(expected.file, name) : null;
                const rebasedDraft = rebaseCardName({ ...draft.file, content: draft.content }, name);
                const text = rebasedDraft.content;
                // Transfer the original evidence, not the newly received content.
                // The host moved parents; the file itself still needs its guard.
                const expectedSources = baseline ? kernelUpsertLocalSourceFile(localSources, nextPath, baseline.content,
                    { originalContent: baseline.originalContent, originalGroupHash: baseline.originalGroupHash }).nextSources : [];
                const preconditions = buildWorkspacePreconditions(TOOL_NAMES.WRITE, { path: nextPath }, localSources)
                    .map(item => item.path === nextPath ? { ...item, expected: captureWorkspacePath(expectedSources, nextPath) } : item);
                const preview = kernelUpsertLocalSourceFile(localSources, nextPath, text, { originalContent: rebasedDraft.originalContent }).file;
                // A write can have failed solely because its old directory was
                // moved. Resume only when its original file evidence still fits.
                const status = previous.status === 'conflict'
                    && !findWorkspaceConflicts(TOOL_NAMES.WRITE, { path: nextPath }, preconditions, localSources).length
                    ? 'queued' : previous.status;
                setDraftRecord(nextPath, { ...draft, status, content: text, file: preview });
                const entry = { ...previous, status, path: nextPath, preconditions, disposed: false,
                    inFlightContent: typeof previous.inFlightContent === 'string'
                        ? rebaseCardName({ ...draft.file, content: previous.inFlightContent }, name).content : previous.inFlightContent,
                    queuedContent: text, timer: 0, inFlightPromise: null, conflictSnapshot: localSources };
                pendingEditorWrites.set(nextPath, entry);
            }
        }
        // Paths, drafts and the live editor change together, before any await.
        // Content equality may skip ordinary receipts, never a path change.
        await applyAuthoritativeLocalSources(localSources, '', { fromPath, toPath });
        if (toPath) {
            // Existing conflicts and failed writes retain their explicit retry.
            for (const [path] of drafts) await sendEditorWrite(relocate(path));
            await flushPendingWorkspaceChanges({ toolName: TOOL_NAMES.DELETE, args: { path: toPath } });
        }
        persistWorkspaceUiStateImmediately();
        renderWorkspaceOnly?.();
    }

    async function appendLocalSourceFiles(files, options = {}) {
        const normalizedFiles = Array.isArray(files) ? files.filter(Boolean) : [];
        if (!normalizedFiles.length) return false;
        try {
            const grouped = groupSelectedFiles(normalizedFiles, options.mode === 'directory' ? 'directory' : 'files');
            const existingLabels = new Set(normalizeLocalSources(state.localSources).map((source) => source.label));
            const importedSources = [];
            let importedFiles = 0;
            const rejectedFiles = [];
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
                    const path = `${LOCAL_SOURCE_PREFIX}${sourceLabel}/${candidatePath}`;
                    const mimeType = getWorkspaceImageMimeType(path);
                    const isImage = !!mimeType && !!normalizeWorkspaceImagePath(path);
                    const rejectionReason = isImage
                        ? file.size === 0 ? 'empty_image'
                            : file.type && file.type !== mimeType ? 'image_mime_mismatch' : ''
                        : isSupportedPublicTextPath(candidatePath) ? '' : 'unsupported_format';
                    if (rejectionReason) {
                        rejectedFiles.push({ name: rawRelativePath || file.name, reason: rejectionReason });
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

                    if (isImage) {
                        sourceFiles.push({ path, blob: file.slice(0, file.size, mimeType) });
                        processedFiles += 1;
                        updateImportProgress();
                        await waitForNextFrame();
                        continue;
                    }
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
                    sourceFiles.push({ path, content });
                    processedFiles += 1;
                    updateImportProgress();
                    await waitForNextFrame();
                }

                if (!sourceFiles.length) continue;
                importedSources.push({ rootPath: `${LOCAL_SOURCE_PREFIX}${sourceLabel}/`, files: sourceFiles });
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

            const files = importedSources.flatMap(source => source.files);
            const result = await callWorkspaceHostTool(INTERNAL_WORKSPACE_TOOL_NAMES.BATCH_WRITE_FILES, {
                files,
            }, {
                source: WORKSPACE_SOURCES.UI_ACTION,
                path: resolveImportedWorkspaceTarget(importedSources) || LOCAL_SOURCE_PREFIX,
            });
            if (!result || result.ok === false) {
                showWorkspaceOperationError(result);
                return false;
            }
            showToast?.(summaryText);
            const autoOpenTarget = resolveImportedWorkspaceTarget(importedSources);
            if (autoOpenTarget) {
                if (autoOpenTarget.endsWith('/')) selectWorkspaceDirectory(autoOpenTarget);
                else selectWorkspaceFile(autoOpenTarget, { reveal: shouldAutoRevealWorkspace() });
                render?.();
            }
            return true;
        } catch (error) {
            showWorkspaceOperationError(error);
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
            showWorkspaceOperationError(result);
            return;
        }
        showToast?.('已移除工作区根');
    }

    async function downloadWorkspaceItem(filename, loadBlob) {
        try {
            downloadBlob(await loadBlob(), filename);
            showToast?.(`已下载 ${filename}`);
            return true;
        } catch (error) {
            console.warn({ source: import.meta.url, operation: 'downloadWorkspaceItem' }, error);
            showToast?.(WORKSPACE_COPY.downloadFailed);
            return false;
        }
    }

    function downloadWorkspaceArchive(sources, filename, prefix) {
        return downloadWorkspaceItem(filename, async () => {
            const entries = await buildLocalSourcesArchiveEntries(sources, prefix);
            return new Blob([zipSync(entries, { level: 1 })], { type: 'application/zip' });
        });
    }

    function downloadLocalSource(sourceId) {
        const source = getDisplaySources().find(item => item.sourceId === sourceId);
        if (!source) return false;
        if (source.files.length === 1) return downloadLocalFile(source.files[0].path);
        return downloadLocalDirectory(source.rootPath);
    }

    function downloadLocalDirectory(path) {
        const sources = getDisplaySources();
        const match = findLocalDirectoryByPath(sources, path);
        if (!match) return false;
        if (match.directoryPath === LOCAL_SOURCE_PREFIX) return downloadAllLocalSources();
        const name = match.directoryPath.split('/').filter(Boolean).at(-1);
        return downloadWorkspaceArchive(sources, formatLocalSourceDownloadName(name, '.zip'), match.directoryPath);
    }

    function downloadAllLocalSources() {
        const sources = getDisplaySources();
        if (!sources.length) {
            showToast?.('没有可下载的工作区内容');
            return false;
        }
        const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        return downloadWorkspaceArchive(sources, `local-workspace-${stamp}.zip`);
    }

    function downloadLocalFile(targetPath) {
        const match = findLocalFileByPath(getDisplaySources(), targetPath);
        if (!match) {
            showToast?.('目标文件不存在');
            return false;
        }
        return downloadWorkspaceItem(match.file.name, () => readDownloadBlob(match.file));
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
                showWorkspaceOperationError(result);
                return false;
            }
        } catch (error) {
            showWorkspaceOperationError(error);
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
            onWorkspaceObserved: observations => { if (observations.length) entry.preconditions = observations; },
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
        primeWorkspaceSelection(normalizedPath, { viewerMode: 'current' });
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
        const image = fileMatch?.file.kind === 'image' ? fileMatch.file : null;
        const normalizedInput = normalizeLocalSourcePath(enteredPath);
        const normalizedNextPath = image
            ? normalizeWorkspaceImagePath(normalizedInput.startsWith(LOCAL_SOURCE_PREFIX) ? normalizedInput : `${LOCAL_SOURCE_PREFIX}${normalizedInput}`)
            : fileMatch ? normalizeWorkspacePromptFilePath(enteredPath) : normalizeWorkspacePromptDirectoryPath(enteredPath);
        if (image && normalizedNextPath && getWorkspaceImageMimeType(normalizedNextPath) !== image.mimeType) {
            showToast?.(WORKSPACE_COPY.imageRenameFormat);
            return false;
        }
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
            showWorkspaceOperationError(result);
            return false;
        }
        if (image) {
            selectWorkspaceFile(normalizedNextPath, { reveal: shouldAutoRevealWorkspace() });
            render?.();
        } else {
            primeWorkspaceSelection(normalizedNextPath);
        }
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
                ? `确定删除 ${displayCardWorkspacePath(currentPath)} 吗？`
                : `确定删除目录 ${displayCardWorkspacePath(currentPath)} 及其下 ${directoryMatch.files.length} 个文件吗？`,
        );
        if (!confirmed) return false;
        const result = await callWorkspaceHostTool(TOOL_NAMES.DELETE, {
            path: currentPath,
        }, {
            source: WORKSPACE_SOURCES.UI_ACTION,
            path: currentPath,
        });
        if (!result || result.ok === false) {
            showWorkspaceOperationError(result);
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
                showToast?.(`没有找到 ${displayCardWorkspacePath(targetPath)}`);
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

    function selectWorkspaceNode(targetPath, options = {}) {
        const normalizedTargetPath = normalizeLocalSourcePath(targetPath);
        if (!normalizedTargetPath) return false;
        if (isLocalRootPath(normalizedTargetPath)) {
            state.selectedSourceId = 'all';
            state.selectedTreePath = LOCAL_SOURCE_PREFIX;
            state.selectedFilePath = '';
            state.viewerMode = 'current';
            state.treeExpandedKeys = Array.from(collectDirectoryExpansionKeys(buildWorkspaceTree(normalizeLocalSources(state.localSources), {
                selectedSourceId: 'all',
                searchQuery: state.fileSearchQuery,
                modifiedOnly: state.showModifiedOnly,
                isModifiedFile: isLocalSourceFileModified,
            }).nodes));
            onWorkspaceSelectionChanged?.();
            persistWorkspaceUiState();
            if (options.render !== false) renderWorkspaceOnly?.();
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

        state.selectedSourceId = 'all';
        state.selectedTreePath = dirMatch.directoryPath;
        state.selectedFilePath = '';
        state.viewerMode = 'current';
        onWorkspaceSelectionChanged?.();
        persistWorkspaceUiState();
        if (options.render !== false) renderWorkspaceOnly?.();
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
        if (state.fileSearchQuery.trim()) {
            const matchingTree = buildWorkspaceTree(getDisplaySources(), {
                searchQuery: state.fileSearchQuery, modifiedOnly: state.showModifiedOnly, isModifiedFile: isLocalSourceFileModified,
            });
            state.treeExpandedKeys = [...new Set([...state.treeExpandedKeys, ...collectDirectoryExpansionKeys(matchingTree.nodes)])];
        }
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
        if (!['current', 'diff', 'settings', 'source'].includes(mode)) return;
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
                treeExpandedKeys: state.treeExpandedKeys,
                workspaceVersion: getWorkspaceRuntimeMeta().version,
                workspaceDrafts: state.workspaceDrafts,
            },
            isModifiedFile: isLocalSourceFileModified,
            manageFiles: true,
            onDownloadAll: () => {
                observeBackgroundTask(downloadAllLocalSources(), { source: import.meta.url, operation: 'onDownloadAll' });
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
                selectWorkspaceNode(targetPath, { render: false });
            },
            onSetViewerMode: (mode) => {
                setWorkspaceViewerMode(mode);
            },
            onDownloadFile: (targetPath) => {
                observeBackgroundTask(downloadLocalFile(targetPath), { source: import.meta.url, operation: 'onDownloadFile' });
            },
            onDownloadDirectory: (targetPath) => {
                observeBackgroundTask(downloadLocalDirectory(targetPath), { source: import.meta.url, operation: 'onDownloadDirectory' });
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
        createLocalFileAt,
        createLocalDirectoryAt,
        renameLocalPath,
        deleteLocalPath,
        clearLocalSources,
        applyExternalLocalSources,
        applyExternalDirectoryChange,
        openWorkspace,
        closeWorkspace,
        toggleWorkspace,
        selectWorkspaceFile,
        selectWorkspaceNode,
        setWorkspaceWidth,
        renderWorkspace,
        ensureWorkspaceSelection,
        getWorkspaceSummary,
        flushPendingWorkspaceChanges,
        hasPendingWorkspaceChanges,
        resolveEditorConflict,
        captureRunWorkspaceBaseline,
    };
}
