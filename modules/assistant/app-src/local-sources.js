import { zipSync, strToU8 } from '../../../libs/fflate.mjs';
import { isSupportedPublicTextPath } from '../shared/public-text-file-types.js';
import { buildWorkspaceTree, collectDirectoryExpansionKeys } from './local-workspace-tree.js';
import {
    renderWorkspace as renderWorkspaceUi,
} from './local-workspace-ui.js';

const LOCAL_SOURCE_PREFIX = 'local/';
const LOCAL_SOURCE_FILE_KIND = 'session-local-source';
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
    return String(pathText || '').trim().replace(/\\/g, '/').replace(/^\/+/, '');
}

function getLocalSourceLabelFromPath(pathText = '') {
    return normalizeLocalSourcePath(pathText).split('/').filter(Boolean)[1] || '';
}

function normalizeWritableLocalFilePath(pathText = '') {
    const normalized = normalizeLocalSourcePath(pathText);
    if (!normalized.startsWith(LOCAL_SOURCE_PREFIX) || normalized.includes('..') || normalized.endsWith('/')) return '';
    const segments = normalized.split('/').filter(Boolean);
    if (segments.length < 3) return '';
    if (!isSupportedPublicTextPath(normalized)) return '';
    return normalized;
}

function normalizeLocalDirectoryPath(pathText = '') {
    const normalized = normalizeLocalSourcePath(pathText).replace(/\/+$/, '');
    if (!normalized.startsWith(LOCAL_SOURCE_PREFIX) || normalized.includes('..')) return '';
    const segments = normalized.split('/').filter(Boolean);
    if (segments.length < 2) return '';
    return `${normalized}/`;
}

function pickUniqueLabel(desiredLabel, existingLabels = new Set()) {
    const baseLabel = sanitizeLabel(desiredLabel, 'source');
    let nextLabel = baseLabel;
    let suffix = 2;
    while (existingLabels.has(nextLabel)) {
        nextLabel = `${baseLabel}-${suffix}`;
        suffix += 1;
    }
    existingLabels.add(nextLabel);
    return nextLabel;
}

function buildLocalFileRecord({ sourceLabel, fileName, relativePath, content, sizeBytes }) {
    const normalizedName = String(fileName || '').trim() || 'untitled.txt';
    const normalizedRelativePath = normalizeLocalSourcePath(relativePath || normalizedName) || normalizedName;
    const normalizedContent = typeof content === 'string' ? content : '';
    return {
        path: `${LOCAL_SOURCE_PREFIX}${sourceLabel}/${normalizedRelativePath}`,
        relativePath: normalizedRelativePath,
        name: normalizedName,
        sizeBytes: Math.max(0, Number(sizeBytes) || 0),
        content: normalizedContent,
        originalContent: normalizedContent,
        source: LOCAL_SOURCE_FILE_KIND,
    };
}

function buildLocalFileRecordFromPath(publicPath, content = '', options = {}) {
    const normalizedPath = normalizeWritableLocalFilePath(publicPath);
    if (!normalizedPath) {
        throw new Error('local_path_required');
    }
    const segments = normalizedPath.split('/').filter(Boolean);
    const relativePath = segments.slice(2).join('/');
    const fileName = segments[segments.length - 1] || 'untitled.txt';
    const normalizedContent = typeof content === 'string' ? content : String(content ?? '');
    return {
        path: normalizedPath,
        relativePath,
        name: fileName,
        sizeBytes: new TextEncoder().encode(normalizedContent).length,
        content: normalizedContent,
        originalContent: Object.prototype.hasOwnProperty.call(options, 'originalContent')
            ? options.originalContent
            : normalizedContent,
        source: LOCAL_SOURCE_FILE_KIND,
    };
}

function createLocalSourceRecord({ sourceId, label, importedAt, files }) {
    return {
        sourceId: String(sourceId || '').trim(),
        label: sanitizeLabel(label, 'source'),
        importedAt: Number.isFinite(Number(importedAt)) ? Number(importedAt) : Date.now(),
        files: Array.isArray(files) ? files : [],
    };
}

function createEphemeralLocalSourceRecord(label, localSources = []) {
    const normalizedLabel = sanitizeLabel(label, 'source');
    const existingIds = new Set(
        normalizeLocalSources(localSources).map((source) => String(source.sourceId || '').trim()).filter(Boolean),
    );
    const baseId = `local:${normalizedLabel}`;
    let nextId = baseId;
    let suffix = 2;
    while (existingIds.has(nextId)) {
        nextId = `${baseId}:${suffix}`;
        suffix += 1;
    }
    return createLocalSourceRecord({
        sourceId: nextId,
        label: normalizedLabel,
        importedAt: Date.now(),
        files: [],
    });
}

function summarizeImportResult({ importedSources, importedFiles, rejectedFiles, duplicateFiles }) {
    if (!importedSources && !importedFiles) {
        if (rejectedFiles) {
            return '只支持导入文本源码文件';
        }
        return '没有可导入的文件';
    }

    const parts = [`已导入 ${importedSources} 个源码源，${importedFiles} 个文件`];
    if (rejectedFiles) parts.push(`忽略 ${rejectedFiles} 个非文本文件`);
    if (duplicateFiles) parts.push(`跳过 ${duplicateFiles} 个重复路径`);
    return parts.join('，');
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
    source.files.forEach((file) => {
        entries[file.relativePath || file.name || 'untitled.txt'] = strToU8(typeof file.content === 'string' ? file.content : '');
    });
    return zipSync(entries, { level: 1 });
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

function normalizeLocalSourceFile(file) {
    if (!file || typeof file !== 'object') return null;
    const path = normalizeLocalSourcePath(file.path || '');
    if (!path.startsWith(LOCAL_SOURCE_PREFIX) || path.includes('..')) return null;
    const name = String(file.name || '').trim() || path.split('/').pop() || 'file';
    const relativePath = normalizeLocalSourcePath(file.relativePath || name) || name;
    const content = typeof file.content === 'string' ? file.content : '';
    const hasOriginalContent = Object.prototype.hasOwnProperty.call(file, 'originalContent');
    const originalContent = hasOriginalContent
        ? (file.originalContent === null ? null : typeof file.originalContent === 'string' ? file.originalContent : content)
        : content;
    return {
        path,
        relativePath,
        name,
        sizeBytes: Math.max(0, Number(file.sizeBytes) || 0),
        content,
        originalContent,
        source: LOCAL_SOURCE_FILE_KIND,
    };
}

function hasOriginalSnapshot(file) {
    return file && typeof file.originalContent === 'string';
}

function isLocalSourceFileModified(file) {
    if (!file) return false;
    if (file.originalContent === null) return true;
    if (typeof file.originalContent === 'string') {
        return String(file.content || '') !== file.originalContent;
    }
    return false;
}

function normalizeWorkspaceWidth(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return 520;
    return Math.max(360, Math.min(960, Math.round(numeric)));
}

function findLocalFileByPath(localSources = [], targetPath = '') {
    const normalizedPath = normalizeLocalSourcePath(targetPath);
    if (!normalizedPath.startsWith(LOCAL_SOURCE_PREFIX)) return null;
    for (const source of normalizeLocalSources(localSources)) {
        for (const file of source.files) {
            if (file.path === normalizedPath) {
                return {
                    source,
                    file,
                };
            }
        }
    }
    return null;
}

function findLocalDirectoryByPath(localSources = [], targetPath = '') {
    const normalizedTargetPath = normalizeLocalSourcePath(targetPath).replace(/\/+$/, '');
    if (!normalizedTargetPath.startsWith(LOCAL_SOURCE_PREFIX)) return null;

    for (const source of normalizeLocalSources(localSources)) {
        const sourceRoot = `${LOCAL_SOURCE_PREFIX}${source.label}`;
        if (normalizedTargetPath === sourceRoot) {
            return {
                source,
                directoryPath: `${sourceRoot}/`,
                relativeDirectoryPath: '',
                files: source.files.slice(),
            };
        }

        const sourcePrefix = `${sourceRoot}/`;
        if (!normalizedTargetPath.startsWith(sourcePrefix)) continue;

        const relativeDirectoryPath = normalizedTargetPath.slice(sourcePrefix.length).replace(/\/+$/, '');
        const directoryPrefix = relativeDirectoryPath ? `${sourcePrefix}${relativeDirectoryPath}/` : sourcePrefix;
        const files = source.files.filter((file) => file.path.startsWith(directoryPrefix));
        if (!files.length) continue;

        return {
            source,
            directoryPath: `${normalizedTargetPath}/`,
            relativeDirectoryPath,
            files,
        };
    }

    return null;
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

function upsertLocalFileInSources(localSources = [], targetPath = '', content = '', options = {}) {
    const normalizedTargetPath = normalizeWritableLocalFilePath(targetPath);
    if (!normalizedTargetPath) {
        throw new Error('local_path_required');
    }

    const normalizedSources = normalizeLocalSources(localSources);
    const sourceLabel = getLocalSourceLabelFromPath(normalizedTargetPath);
    let fileExisted = false;
    let existingFile = null;
    let sourceFound = false;
    const nextSources = normalizedSources.map((source) => {
        if (source.label !== sourceLabel) return source;
        sourceFound = true;
        return {
            ...source,
            files: source.files.map((file) => {
                if (file.path !== normalizedTargetPath) return file;
                fileExisted = true;
                existingFile = file;
                return file;
            }),
        };
    });

    const nextFile = buildLocalFileRecordFromPath(normalizedTargetPath, content, {
        originalContent: Object.prototype.hasOwnProperty.call(options, 'originalContent')
            ? options.originalContent
            : fileExisted
                ? existingFile?.originalContent ?? existingFile?.content ?? String(content ?? '')
                : null,
    });

    const sourcesWithTarget = sourceFound
        ? nextSources
        : [
            ...nextSources,
            createEphemeralLocalSourceRecord(sourceLabel, normalizedSources),
        ].sort((left, right) => String(left.label || '').localeCompare(String(right.label || ''), 'zh-CN'));

    return {
        nextSources: sourcesWithTarget.map((source) => {
            if (source.label !== sourceLabel) return source;
            const nextFiles = source.files
                .filter((file) => file.path !== normalizedTargetPath)
                .concat(nextFile)
                .sort((left, right) => String(left.path || '').localeCompare(String(right.path || ''), 'zh-CN'));
            return {
                ...source,
                files: nextFiles,
            };
        }),
        file: nextFile,
        fileExisted,
    };
}

function removeLocalPathFromSources(localSources = [], targetPath = '') {
    const fileMatch = findLocalFileByPath(localSources, targetPath);
    if (fileMatch) {
        return {
            mode: 'file',
            removedFiles: [fileMatch.file],
            nextSources: normalizeLocalSources(localSources)
                .map((source) => {
                    if (source.sourceId !== fileMatch.source.sourceId) return source;
                    const nextFiles = source.files.filter((file) => file.path !== fileMatch.file.path);
                    if (!nextFiles.length) return null;
                    return {
                        ...source,
                        files: nextFiles,
                    };
                })
                .filter(Boolean),
        };
    }

    const directoryMatch = findLocalDirectoryByPath(localSources, targetPath);
    if (!directoryMatch) {
        throw new Error('local_path_not_found');
    }

    const removedPaths = new Set(directoryMatch.files.map((file) => file.path));
    return {
        mode: 'directory',
        removedFiles: directoryMatch.files.slice(),
        nextSources: normalizeLocalSources(localSources)
            .map((source) => {
                const nextFiles = source.files.filter((file) => !removedPaths.has(file.path));
                if (!nextFiles.length) return null;
                return {
                    ...source,
                    files: nextFiles,
                };
            })
            .filter(Boolean),
    };
}

function moveLocalPathInSources(localSources = [], fromPath = '', toPath = '', options = {}) {
    const normalizedSources = normalizeLocalSources(localSources);
    const overwrite = !!options.overwrite;
    const fromFileMatch = findLocalFileByPath(normalizedSources, fromPath);

    let movedFiles = [];
    let targetMappings = [];
    let mode = 'file';

    if (fromFileMatch) {
        const normalizedToFilePath = normalizeWritableLocalFilePath(toPath);
        if (!normalizedToFilePath) {
            throw new Error('local_path_required');
        }
        movedFiles = [fromFileMatch.file];
        targetMappings = [{ fromPath: fromFileMatch.file.path, toPath: normalizedToFilePath }];
    } else {
        const fromDirectoryMatch = findLocalDirectoryByPath(normalizedSources, fromPath);
        if (!fromDirectoryMatch) {
            throw new Error('local_path_not_found');
        }
        const normalizedFromDirectoryPath = normalizeLocalDirectoryPath(fromPath);
        const normalizedToDirectoryPath = normalizeLocalDirectoryPath(toPath);
        if (!normalizedFromDirectoryPath || !normalizedToDirectoryPath) {
            throw new Error('local_path_required');
        }
        mode = 'directory';
        movedFiles = fromDirectoryMatch.files.slice();
        targetMappings = movedFiles.map((file) => ({
            fromPath: file.path,
            toPath: `${normalizedToDirectoryPath}${file.path.slice(normalizedFromDirectoryPath.length)}`,
        }));
    }

    const movedPathSet = new Set(movedFiles.map((file) => file.path));
    const targetPathSet = new Set(targetMappings.map((item) => item.toPath));
    const conflictingFiles = flattenLocalSourceFiles(normalizedSources).filter((file) => (
        targetPathSet.has(file.path) && !movedPathSet.has(file.path)
    ));
    if (conflictingFiles.length && !overwrite) {
        throw new Error('local_destination_exists');
    }

    const mappingByFromPath = new Map(targetMappings.map((item) => [item.fromPath, item.toPath]));
    const conflictPathSet = new Set(conflictingFiles.map((file) => file.path));
    const remainingSources = normalizedSources
        .map((source) => {
            const nextFiles = source.files.filter((file) => (
                !movedPathSet.has(file.path) && !(overwrite && conflictPathSet.has(file.path))
            ));
            if (!nextFiles.length) return null;
            return {
                ...source,
                files: nextFiles,
            };
        })
        .filter(Boolean);

    let nextSources = remainingSources;
    const movedEntries = [];
    movedFiles.forEach((file) => {
        const nextPath = mappingByFromPath.get(file.path);
        const upsert = upsertLocalFileInSources(nextSources, nextPath, file.content, {
            originalContent: file.originalContent,
        });
        nextSources = upsert.nextSources;
        movedEntries.push(upsert.file);
    });

    return {
        mode,
        movedFiles: movedEntries,
        nextSources,
        overwritten: conflictingFiles.length > 0,
        fromPath: targetMappings.length === 1 ? targetMappings[0].fromPath : fromPath,
        toPath: targetMappings.length === 1 ? targetMappings[0].toPath : toPath,
    };
}


export function normalizeLocalSources(localSources) {
    if (!Array.isArray(localSources)) return [];
    return localSources
        .map((source) => {
            if (!source || typeof source !== 'object') return null;
            const sourceId = String(source.sourceId || '').trim();
            if (!sourceId) return null;
            const files = Array.isArray(source.files)
                ? source.files.map(normalizeLocalSourceFile).filter(Boolean)
                : [];
            if (!files.length) return null;
            return createLocalSourceRecord({
                sourceId,
                label: source.label,
                importedAt: source.importedAt,
                files,
            });
        })
        .filter(Boolean);
}

export function flattenLocalSourceFiles(localSources = []) {
    return normalizeLocalSources(localSources).flatMap((source) => (
        source.files.map((file) => ({
            ...file,
            sourceId: source.sourceId,
            sourceLabel: source.label,
        }))
    ));
}

export function summarizeLocalSources(localSources = []) {
    const normalizedSources = normalizeLocalSources(localSources);
    return {
        sourceCount: normalizedSources.length,
        fileCount: normalizedSources.reduce((total, source) => total + source.files.length, 0),
        modifiedFileCount: normalizedSources.reduce((total, source) => (
            total + source.files.filter((file) => isLocalSourceFileModified(file)).length
        ), 0),
    };
}

export function createLocalSourcesManager(deps) {
    const {
        state,
        createRequestId,
        showToast,
        setImportProgress,
        render,
        renderWorkspaceOnly,
        persistSession,
        onWorkspaceClosed,
        post,
    } = deps;
    let workspaceUiPersistTimer = 0;

    function persistWorkspaceUiStateImmediately() {
        if (workspaceUiPersistTimer) {
            clearTimeout(workspaceUiPersistTimer);
            workspaceUiPersistTimer = 0;
        }
        persistSession?.();
    }

    function persistWorkspaceUiState() {
        if (workspaceUiPersistTimer) {
            clearTimeout(workspaceUiPersistTimer);
        }
        workspaceUiPersistTimer = window.setTimeout(() => {
            workspaceUiPersistTimer = 0;
            persistSession?.();
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

    function selectWorkspaceFile(targetPath, options = {}) {
        const match = findLocalFileByPath(state.localSources, targetPath);
        if (!match) return false;

        state.isWorkspaceOpen = true;
        state.selectedSourceId = options.preserveSourceFilter ? (state.selectedSourceId || 'all') : match.source.sourceId;
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
            state.viewerMode = isLocalSourceFileModified(match.file) ? 'diff' : 'current';
        }
        persistWorkspaceUiStateImmediately();
        return true;
    }

    function selectWorkspaceDirectory(targetPath) {
        const match = findLocalDirectoryByPath(state.localSources, targetPath);
        if (!match) return false;

        state.isWorkspaceOpen = true;
        state.selectedSourceId = match.source.sourceId;
        state.selectedTreePath = match.directoryPath;
        state.selectedFilePath = '';
        state.fileSearchQuery = '';
        state.showModifiedOnly = false;
        state.viewerMode = 'current';
        state.treeExpandedKeys = Array.from(
            buildExpandedKeysForWorkspaceTarget(match.source.sourceId, match.relativeDirectoryPath),
        );
        persistWorkspaceUiStateImmediately();
        return true;
    }

    function ensureWorkspaceSelection() {
        const summary = getWorkspaceSummary();
        if (!summary.fileCount) {
            state.isWorkspaceOpen = false;
            state.selectedSourceId = 'all';
            state.selectedFilePath = '';
            state.selectedTreePath = '';
            state.fileSearchQuery = '';
            state.showModifiedOnly = false;
            state.viewerMode = 'current';
            state.treeExpandedKeys = [];
            return;
        }

        if (!['all', ...normalizeLocalSources(state.localSources).map((source) => source.sourceId)].includes(state.selectedSourceId || 'all')) {
            state.selectedSourceId = 'all';
        }

        const normalizedSources = normalizeLocalSources(state.localSources);
        const workspaceTree = buildWorkspaceTree(normalizedSources, {
            selectedSourceId: state.selectedSourceId,
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
            state.selectedTreePath = state.selectedFilePath || workspaceTree.visibleNodePaths[0] || '';
        }

        if (!['current', 'original', 'diff'].includes(state.viewerMode)) {
            state.viewerMode = 'current';
        }

        const selected = findLocalFileByPath(state.localSources, state.selectedFilePath);
        if (selected) {
            if (state.viewerMode === 'original' && !hasOriginalSnapshot(selected.file)) {
                state.viewerMode = isLocalSourceFileModified(selected.file) ? 'diff' : 'current';
            }
            if (state.viewerMode === 'diff' && !hasOriginalSnapshot(selected.file)) {
                state.viewerMode = 'current';
            }
        } else {
            state.viewerMode = 'current';
        }
    }

    function syncHostLocalSources() {
        post?.('xb-assistant:local-sources-sync', {
            localSources: normalizeLocalSources(state.localSources),
        });
    }

    async function commitLocalSources(nextSources, toastText = '', options = {}) {
        const shouldSyncHost = options.syncHost !== false;
        state.localSources = normalizeLocalSources(nextSources);
        ensureWorkspaceSelection();
        if (shouldSyncHost) {
            syncHostLocalSources();
        }
        render?.();
        const persistResult = await persistSession?.();
        if (persistResult && persistResult.ok === false) {
            showToast?.(`源码源已更新，但会话保存失败，刷新后可能丢失：${persistResult.error || 'unknown_error'}`);
            return false;
        }
        if (toastText) {
            showToast?.(toastText);
        }
        return true;
    }

    async function applyExternalLocalSources(nextSources, toastText = '') {
        return await commitLocalSources(nextSources, toastText, { syncHost: false });
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
                        label: options.mode === 'directory' ? '正在导入文件夹源码' : '正在导入源码文件',
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
                                label: options.mode === 'directory' ? '正在导入文件夹源码' : '正在导入源码文件',
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

            updateImportProgress('写入会话');
            const result = await commitLocalSources(
                [...normalizeLocalSources(state.localSources), ...importedSources],
                summarizeImportResult({
                    importedSources: importedSources.length,
                    importedFiles,
                    rejectedFiles,
                    duplicateFiles,
                }),
            );
            return result;
        } catch (error) {
            showToast?.(`源码导入失败：${String(error?.message || error || 'unknown_error')}`);
            return false;
        } finally {
            setImportProgress?.({ active: false });
        }
    }

    async function removeLocalSource(sourceId) {
        const normalizedId = String(sourceId || '').trim();
        if (!normalizedId) return;
        await commitLocalSources(
            normalizeLocalSources(state.localSources).filter((source) => source.sourceId !== normalizedId),
            '已移除源码源',
        );
    }

    function downloadLocalSource(sourceId) {
        const normalizedId = String(sourceId || '').trim();
        if (!normalizedId) return false;

        const source = normalizeLocalSources(state.localSources).find((item) => item.sourceId === normalizedId);
        if (!source || !Array.isArray(source.files) || !source.files.length) {
            showToast?.('没有可下载的源码源');
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
        const normalizedSources = normalizeLocalSources(state.localSources);
        if (!normalizedSources.length) {
            showToast?.('没有可下载的源码源');
            return false;
        }

        const entries = {};
        normalizedSources.forEach((source) => {
            source.files.forEach((file) => {
                const relativePath = file.relativePath || file.name || 'untitled.txt';
                entries[`${sanitizeLabel(source.label, 'source')}/${relativePath}`] = strToU8(
                    typeof file.content === 'string' ? file.content : '',
                );
            });
        });

        const zipBytes = zipSync(entries, { level: 1 });
        const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const zipName = `local-sources-${stamp}.zip`;
        downloadBlob(new Blob([zipBytes], { type: 'application/zip' }), zipName);
        showToast?.(`已下载 ${zipName}`);
        return true;
    }

    function downloadLocalFile(targetPath) {
        const match = findLocalFileByPath(state.localSources, targetPath);
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
        if (!normalizeLocalSources(state.localSources).length) return;
        await commitLocalSources([], '已清空源码源');
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

        const nextSources = normalizeLocalSources(state.localSources).map((source) => {
            if (source.sourceId !== match.source.sourceId) return source;
            return {
                ...source,
                files: source.files.map((file) => (
                    file.path === match.file.path
                        ? {
                            ...file,
                            content: match.file.originalContent,
                            sizeBytes: new TextEncoder().encode(match.file.originalContent).length,
                        }
                        : file
                )),
            };
        });

        await commitLocalSources(nextSources, `已恢复 ${match.file.name || match.file.relativePath}`);
        return true;
    }

    async function createLocalFileAt(targetPath = '') {
        const normalizedTargetFile = normalizeWritableLocalFilePath(targetPath);
        const normalizedTargetDirectory = normalizeLocalDirectoryPath(targetPath);
        let defaultPath = '';

        if (normalizedTargetFile) {
            defaultPath = `${normalizedTargetFile.split('/').slice(0, -1).join('/')}/new-file.txt`;
        } else if (normalizedTargetDirectory) {
            defaultPath = `${normalizedTargetDirectory}new-file.txt`;
        } else if (state.selectedSourceId && state.selectedSourceId !== 'all') {
            const selectedSource = normalizeLocalSources(state.localSources).find((source) => source.sourceId === state.selectedSourceId);
            if (selectedSource) {
                defaultPath = `local/${selectedSource.label}/new-file.txt`;
            }
        }

        if (!defaultPath) {
            const firstSource = normalizeLocalSources(state.localSources)[0];
            if (firstSource) {
                defaultPath = `local/${firstSource.label}/new-file.txt`;
            }
        }
        if (!defaultPath) {
            defaultPath = 'local/new-source/new-file.txt';
        }

        const enteredPath = window.prompt('输入要新建的 local 文件路径', defaultPath);
        if (enteredPath === null) return false;

        const normalizedPath = normalizeWritableLocalFilePath(enteredPath);
        if (!normalizedPath) {
            showToast?.('请输入有效的 `local/...` 文本文件路径');
            return false;
        }

        const existing = findLocalFileByPath(state.localSources, normalizedPath);
        if (existing) {
            showToast?.('目标文件已存在，请改用重命名或编辑');
            return false;
        }

        const upsert = upsertLocalFileInSources(state.localSources, normalizedPath, '', {
            originalContent: null,
        });
        const committed = await commitLocalSources(upsert.nextSources, `已新建 ${upsert.file.relativePath || upsert.file.name}`);
        if (!committed) return false;
        selectWorkspaceFile(normalizedPath, {
            preserveSourceFilter: false,
            preserveSearch: false,
            preserveModifiedOnly: false,
            preserveViewerMode: false,
        });
        render?.();
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

        const enteredPath = window.prompt('输入新的 local 路径', currentPath);
        if (enteredPath === null) return false;
        const normalizedNextPath = fileMatch
            ? normalizeWritableLocalFilePath(enteredPath)
            : normalizeLocalDirectoryPath(enteredPath);
        if (!normalizedNextPath) {
            showToast?.(`请输入有效的 local/${fileMatch ? '... 文件' : '... 目录'}路径`);
            return false;
        }
        if (normalizedNextPath === currentPath) return false;

        try {
            const move = moveLocalPathInSources(state.localSources, currentPath, normalizedNextPath, { overwrite: false });
            const toastText = move.mode === 'directory'
                ? `已移动目录，共 ${move.movedFiles.length} 个文件`
                : `已重命名 ${move.movedFiles[0]?.name || normalizedNextPath}`;
            const committed = await commitLocalSources(move.nextSources, toastText);
            if (!committed) return false;
            if (move.mode === 'directory') {
                selectWorkspaceNode(normalizedNextPath);
            } else {
                selectWorkspaceFile(move.movedFiles[0]?.path || normalizedNextPath, {
                    preserveSourceFilter: false,
                    preserveSearch: false,
                    preserveModifiedOnly: false,
                    preserveViewerMode: false,
                });
            }
            render?.();
            return true;
        } catch (error) {
            const message = String(error?.message || error || 'unknown_error');
            if (message === 'local_destination_exists') {
                showToast?.('目标路径已存在，请换一个路径');
                return false;
            }
            showToast?.(`重命名失败：${message}`);
            return false;
        }
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

        try {
            const removal = removeLocalPathFromSources(state.localSources, currentPath);
            const committed = await commitLocalSources(
                removal.nextSources,
                removal.mode === 'directory'
                    ? `已删除目录，共 ${removal.removedFiles.length} 个文件`
                    : `已删除 ${removal.removedFiles[0]?.name || currentPath}`,
            );
            if (!committed) return false;
            render?.();
            return true;
        } catch (error) {
            showToast?.(`删除失败：${String(error?.message || error || 'unknown_error')}`);
            return false;
        }
    }

    function openWorkspace(targetPath = '') {
        if (targetPath) {
            const opened = selectWorkspaceFile(targetPath) || selectWorkspaceDirectory(targetPath);
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
        state.selectedSourceId = dirMatch.source.sourceId;
        state.selectedTreePath = dirMatch.directoryPath;
        state.selectedFilePath = '';
        state.viewerMode = 'current';
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

    function setSelectedSourceId(sourceId) {
        state.selectedSourceId = sourceId || 'all';
        ensureWorkspaceSelection();
        persistWorkspaceUiState();
        renderWorkspaceOnly?.();
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
        const normalizedSources = normalizeLocalSources(state.localSources);
        const summary = summarizeLocalSources(normalizedSources);
        const workspaceTree = buildWorkspaceTree(normalizedSources, {
            selectedSourceId: state.selectedSourceId,
            searchQuery: state.fileSearchQuery,
            modifiedOnly: state.showModifiedOnly,
            isModifiedFile: isLocalSourceFileModified,
        });
        const selectedMatch = findLocalFileByPath(state.localSources, state.selectedFilePath);
        renderWorkspaceUi(container, {
            ...options,
            localSources: normalizedSources,
            summary,
            workspaceTree,
            selectedMatch,
            workspaceState: {
                selectedSourceId: state.selectedSourceId,
                selectedFilePath: state.selectedFilePath,
                selectedTreePath: state.selectedTreePath,
                fileSearchQuery: state.fileSearchQuery,
                showModifiedOnly: state.showModifiedOnly,
                viewerMode: state.viewerMode,
                treeExpandedKeys: state.treeExpandedKeys,
            },
            isModifiedFile: isLocalSourceFileModified,
            hasOriginalSnapshot,
            onDownloadAll: () => {
                downloadAllLocalSources();
            },
            onCloseWorkspace: () => {
                closeWorkspace();
            },
            onSelectSource: (sourceId) => {
                setSelectedSourceId(sourceId);
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
            onDownloadFile: (targetPath) => {
                downloadLocalFile(targetPath);
            },
            onRestoreFile: (targetPath) => {
                void restoreLocalFile(targetPath);
            },
            onCreateFile: (targetPath) => {
                void createLocalFileAt(targetPath);
            },
            onRenamePath: (targetPath) => {
                void renameLocalPath(targetPath);
            },
            onDeletePath: (targetPath) => {
                void deleteLocalPath(targetPath);
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
        createLocalFileAt,
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
        syncHostLocalSources,
    };
}
