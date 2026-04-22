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

function isLocalRootPath(pathText = '') {
    return normalizeLocalSourcePath(pathText).replace(/\/+$/, '') === 'local';
}

function getLocalSourceLabelFromPath(pathText = '') {
    return normalizeLocalSourcePath(pathText).split('/').filter(Boolean)[1] || '';
}

function getLocalSourceRootPathFromPath(pathText = '') {
    const normalized = normalizeLocalSourcePath(pathText).replace(/\/+$/, '');
    if (!normalized.startsWith(LOCAL_SOURCE_PREFIX) || normalized.includes('..')) return '';
    const segments = normalized.split('/').filter(Boolean);
    if (segments.length < 2) return '';
    if (segments.length === 2) return LOCAL_SOURCE_PREFIX;
    return `${LOCAL_SOURCE_PREFIX}${segments[1]}/`;
}

function getRelativeLocalFilePath(pathText = '') {
    const normalized = normalizeLocalSourcePath(pathText);
    const rootPath = getLocalSourceRootPathFromPath(normalized);
    if (!rootPath || !normalized.startsWith(rootPath)) return '';
    return normalized.slice(rootPath.length);
}

function normalizeLocalSourceRootPath(rootPath = '', fallbackLabel = 'source') {
    const normalized = normalizeLocalSourcePath(rootPath).replace(/\/+$/, '');
    if (normalized === 'local') return LOCAL_SOURCE_PREFIX;
    if (normalized.startsWith(LOCAL_SOURCE_PREFIX) && !normalized.includes('..')) {
        const segments = normalized.split('/').filter(Boolean);
        if (segments.length >= 2) {
            return `${normalized}/`;
        }
    }
    return `${LOCAL_SOURCE_PREFIX}${sanitizeLabel(fallbackLabel, 'source')}/`;
}

function normalizeWritableLocalFilePath(pathText = '') {
    const normalized = normalizeLocalSourcePath(pathText);
    if (!normalized.startsWith(LOCAL_SOURCE_PREFIX) || normalized.includes('..') || normalized.endsWith('/')) return '';
    const segments = normalized.split('/').filter(Boolean);
    if (segments.length < 2) return '';
    if (!isSupportedPublicTextPath(normalized)) return '';
    return normalized;
}

function normalizeLocalDirectoryPath(pathText = '') {
    const normalized = normalizeLocalSourcePath(pathText).replace(/\/+$/, '');
    if (!normalized.startsWith(LOCAL_SOURCE_PREFIX) || normalized.includes('..')) return '';
    if (normalized === 'local') return LOCAL_SOURCE_PREFIX;
    const segments = normalized.split('/').filter(Boolean);
    if (segments.length < 2) return '';
    return `${normalized}/`;
}

function formatWorkspacePromptPath(pathText = '') {
    const normalized = normalizeLocalSourcePath(pathText);
    if (!normalized.startsWith(LOCAL_SOURCE_PREFIX)) return normalized;
    return normalized.slice(LOCAL_SOURCE_PREFIX.length);
}

function normalizeWorkspacePromptFilePath(pathText = '') {
    const normalized = normalizeLocalSourcePath(pathText);
    if (!normalized) return '';
    return normalizeWritableLocalFilePath(normalized.startsWith(LOCAL_SOURCE_PREFIX) ? normalized : `${LOCAL_SOURCE_PREFIX}${normalized}`);
}

function normalizeWorkspacePromptDirectoryPath(pathText = '') {
    const normalized = normalizeLocalSourcePath(pathText).replace(/\/+$/, '');
    if (!normalized) return '';
    const prefixed = normalized.startsWith(LOCAL_SOURCE_PREFIX) ? normalized : `${LOCAL_SOURCE_PREFIX}${normalized}`;
    return normalizeLocalDirectoryPath(prefixed);
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
    const relativePath = getRelativeLocalFilePath(normalizedPath);
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

function createLocalSourceRecord({ sourceId, label, rootPath, importedAt, files, directories }) {
    const normalizedLabel = String(label || '').trim() || 'source';
    const normalizedFiles = Array.isArray(files) ? files : [];
    return {
        sourceId: String(sourceId || '').trim(),
        label: normalizedLabel,
        rootPath: normalizeLocalSourceRootPath(rootPath, normalizedLabel),
        importedAt: Number.isFinite(Number(importedAt)) ? Number(importedAt) : Date.now(),
        files: normalizedFiles,
        directories: Array.from(new Set([
            ...(Array.isArray(directories) ? directories.map(normalizeLocalSourceDirectory).filter(Boolean) : []),
            ...collectImplicitDirectoryPaths(normalizedFiles),
        ])).sort((left, right) => left.localeCompare(right, 'zh-CN')),
    };
}

function createEphemeralLocalSourceRecord(label, localSources = [], rootPath = '') {
    const normalizedLabel = String(label || '').trim() || 'source';
    const existingIds = new Set(
        normalizeLocalSources(localSources).map((source) => String(source.sourceId || '').trim()).filter(Boolean),
    );
    const desiredRootPath = normalizeLocalSourceRootPath(rootPath, normalizedLabel);
    const baseId = desiredRootPath === LOCAL_SOURCE_PREFIX ? 'local:root' : `local:${sanitizeLabel(normalizedLabel, 'source')}`;
    let nextId = baseId;
    let suffix = 2;
    while (existingIds.has(nextId)) {
        nextId = `${baseId}:${suffix}`;
        suffix += 1;
    }
    return createLocalSourceRecord({
        sourceId: nextId,
        label: normalizedLabel,
        rootPath: desiredRootPath,
        importedAt: Date.now(),
        files: [],
    });
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

function normalizeLocalSourceDirectory(directoryPath = '') {
    const normalized = normalizeLocalSourcePath(directoryPath).replace(/^\/+|\/+$/g, '');
    if (!normalized || normalized.includes('..')) return '';
    return normalized;
}

function collectImplicitDirectoryPaths(files = []) {
    const paths = new Set();
    files.forEach((file) => {
        const segments = String(file?.relativePath || '').split('/').filter(Boolean).slice(0, -1);
        segments.forEach((_, index) => {
            paths.add(segments.slice(0, index + 1).join('/'));
        });
    });
    return Array.from(paths).sort((left, right) => left.localeCompare(right, 'zh-CN'));
}

function collectSourceDirectoryPaths(source = {}) {
    const explicitDirectories = Array.isArray(source.directories)
        ? source.directories.map(normalizeLocalSourceDirectory).filter(Boolean)
        : [];
    return Array.from(new Set([
        ...explicitDirectories,
        ...collectImplicitDirectoryPaths(source.files || []),
    ])).sort((left, right) => left.localeCompare(right, 'zh-CN'));
}

function buildDirectoryAncestors(relativeDirectoryPath = '') {
    const segments = normalizeLocalSourceDirectory(relativeDirectoryPath).split('/').filter(Boolean);
    const results = [];
    segments.forEach((_, index) => {
        results.push(segments.slice(0, index + 1).join('/'));
    });
    return results;
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
    if (normalizedTargetPath === 'local' || normalizedTargetPath === 'local/') {
        return {
            source: null,
            directoryPath: LOCAL_SOURCE_PREFIX,
            relativeDirectoryPath: '',
            files: flattenLocalSourceFiles(localSources),
            directories: normalizeLocalSources(localSources).map((source) => String(source.rootPath || '')).filter(Boolean),
        };
    }
    if (!normalizedTargetPath.startsWith(LOCAL_SOURCE_PREFIX)) return null;

    for (const source of normalizeLocalSources(localSources)) {
        const sourceRoot = String(source.rootPath || `${LOCAL_SOURCE_PREFIX}${source.label}/`).replace(/\/+$/, '');
        const sourceDirectories = collectSourceDirectoryPaths(source);
        if (normalizedTargetPath === sourceRoot) {
            return {
                source,
                directoryPath: `${sourceRoot}/`,
                relativeDirectoryPath: '',
                files: source.files.slice(),
                directories: sourceDirectories,
            };
        }

        const sourcePrefix = `${sourceRoot}/`;
        if (!normalizedTargetPath.startsWith(sourcePrefix)) continue;

        const relativeDirectoryPath = normalizedTargetPath.slice(sourcePrefix.length).replace(/\/+$/, '');
        const directoryPrefix = relativeDirectoryPath ? `${sourcePrefix}${relativeDirectoryPath}/` : sourcePrefix;
        const files = source.files.filter((file) => file.path.startsWith(directoryPrefix));
        const directoryExists = sourceDirectories.includes(relativeDirectoryPath);
        if (!files.length && !directoryExists) continue;

        return {
            source,
            directoryPath: `${normalizedTargetPath}/`,
            relativeDirectoryPath,
            files,
            directories: sourceDirectories.filter((directory) => (
                directory === relativeDirectoryPath || directory.startsWith(`${relativeDirectoryPath}/`)
            )),
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
    const sourceRootPath = getLocalSourceRootPathFromPath(normalizedTargetPath);
    const sourceLabel = sourceRootPath === LOCAL_SOURCE_PREFIX ? 'local' : getLocalSourceLabelFromPath(normalizedTargetPath);
    let fileExisted = false;
    let existingFile = null;
    let sourceFound = false;
    const nextSources = normalizedSources.map((source) => {
        if (String(source.rootPath || '') !== sourceRootPath) return source;
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
            createEphemeralLocalSourceRecord(sourceLabel, normalizedSources, sourceRootPath),
        ].sort((left, right) => String(left.label || '').localeCompare(String(right.label || ''), 'zh-CN'));

    return {
        nextSources: sourcesWithTarget.map((source) => {
            if (String(source.rootPath || '') !== sourceRootPath) return source;
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

function upsertLocalDirectoryInSources(localSources = [], targetPath = '') {
    const normalizedDirectoryPath = normalizeLocalDirectoryPath(targetPath);
    if (!normalizedDirectoryPath) {
        throw new Error('local_path_required');
    }
    if (normalizedDirectoryPath === LOCAL_SOURCE_PREFIX) {
        return {
            nextSources: normalizeLocalSources(localSources),
            directoryPath: normalizedDirectoryPath,
        };
    }

    const normalizedSources = normalizeLocalSources(localSources);
    const normalizedTarget = normalizeLocalSourcePath(normalizedDirectoryPath).replace(/\/+$/, '');
    const segments = normalizedTarget.split('/').filter(Boolean);
    const sourceRootPath = `${LOCAL_SOURCE_PREFIX}${segments[1]}/`;
    const sourceLabel = segments[1] || 'local';
    const relativeDirectoryPath = segments.slice(2).join('/');

    const ensuredSources = normalizedSources.some((source) => String(source.rootPath || '') === sourceRootPath)
        ? normalizedSources
        : [
            ...normalizedSources,
            createEphemeralLocalSourceRecord(sourceLabel, normalizedSources, sourceRootPath),
        ].sort((left, right) => String(left.label || '').localeCompare(String(right.label || ''), 'zh-CN'));

    return {
        nextSources: ensuredSources.map((source) => {
            if (String(source.rootPath || '') !== sourceRootPath) return source;
            return createLocalSourceRecord({
                ...source,
                directories: [...collectSourceDirectoryPaths(source), ...buildDirectoryAncestors(relativeDirectoryPath)],
            });
        }),
        directoryPath: normalizedDirectoryPath,
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
                    return createLocalSourceRecord({
                        ...source,
                        files: source.files.filter((file) => file.path !== fileMatch.file.path),
                    });
                })
                .filter((source) => source && (source.files.length || source.directories.length)),
        };
    }

    const directoryMatch = findLocalDirectoryByPath(localSources, targetPath);
    if (!directoryMatch) {
        throw new Error('local_path_not_found');
    }

    if (directoryMatch.directoryPath === LOCAL_SOURCE_PREFIX) {
        return {
            mode: 'directory',
            removedFiles: directoryMatch.files.slice(),
            nextSources: [],
        };
    }

    const removedPaths = new Set(directoryMatch.files.map((file) => file.path));
    return {
        mode: 'directory',
        removedFiles: directoryMatch.files.slice(),
        nextSources: normalizeLocalSources(localSources)
            .map((source) => {
                if (directoryMatch.source?.sourceId !== source.sourceId) return source;
                const relativeDirectoryPath = directoryMatch.relativeDirectoryPath;
                const nextDirectories = collectSourceDirectoryPaths(source).filter((directory) => (
                    directory !== relativeDirectoryPath && !directory.startsWith(`${relativeDirectoryPath}/`)
                ));
                return createLocalSourceRecord({
                    ...source,
                    files: source.files.filter((file) => !removedPaths.has(file.path)),
                    directories: nextDirectories,
                });
            })
            .filter((source) => source && (source.files.length || source.directories.length)),
    };
}

function moveLocalPathInSources(localSources = [], fromPath = '', toPath = '', options = {}) {
    const normalizedSources = normalizeLocalSources(localSources);
    const overwrite = !!options.overwrite;
    const fromFileMatch = findLocalFileByPath(normalizedSources, fromPath);

    let movedFiles = [];
    let movedDirectories = [];
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
        movedDirectories = [
            fromDirectoryMatch.directoryPath,
            ...(fromDirectoryMatch.directories || [])
                .filter((directory) => directory !== fromDirectoryMatch.relativeDirectoryPath)
                .map((directory) => `${fromDirectoryMatch.source.rootPath}${directory}/`),
        ];
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
            const nextDirectories = mode === 'directory'
                ? collectSourceDirectoryPaths(source).filter((directory) => {
                    const directoryPath = `${source.rootPath}${directory}/`;
                    return !movedDirectories.includes(directoryPath);
                })
                : collectSourceDirectoryPaths(source);
            return createLocalSourceRecord({
                ...source,
                files: nextFiles,
                directories: nextDirectories,
            });
        })
        .filter((source) => source && (source.files.length || source.directories.length));

    let nextSources = remainingSources;
    const movedEntries = [];
    if (mode === 'directory') {
        const normalizedFromDirectoryPath = normalizeLocalDirectoryPath(fromPath);
        const normalizedToDirectoryPath = normalizeLocalDirectoryPath(toPath);
        movedDirectories.forEach((directoryPath) => {
            const suffix = directoryPath.slice(normalizedFromDirectoryPath.length);
            const nextDirectoryPath = `${normalizedToDirectoryPath}${suffix}`;
            const upsert = upsertLocalDirectoryInSources(nextSources, nextDirectoryPath);
            nextSources = upsert.nextSources;
        });
    }
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
            return createLocalSourceRecord({
                sourceId,
                label: source.label,
                rootPath: source.rootPath,
                importedAt: source.importedAt,
                files,
                directories: source.directories,
            });
        })
        .filter((source) => source && (source.files.length || source.directories.length || source.rootPath));
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
        onWorkspaceSelectionChanged,
        post,
    } = deps;
    let workspaceUiPersistTimer = 0;
    let workspaceContentFlushTimer = 0;
    let workspaceContentPersistError = '';

    async function persistWorkspaceContentChanges() {
        try {
            syncHostLocalSources();
            const persistResult = await persistSession?.();
            if (persistResult && persistResult.ok === false) {
                const errorText = String(persistResult.error || 'unknown_error');
                if (workspaceContentPersistError !== errorText) {
                    showToast?.(`工作区已更新，但会话保存失败，刷新后可能丢失：${errorText}`);
                }
                workspaceContentPersistError = errorText;
                return false;
            }
            workspaceContentPersistError = '';
            return true;
        } catch (error) {
            const errorText = String(error?.message || error || 'unknown_error');
            if (workspaceContentPersistError !== errorText) {
                showToast?.(`工作区已更新，但会话保存失败，刷新后可能丢失：${errorText}`);
            }
            workspaceContentPersistError = errorText;
            return false;
        }
    }

    function flushWorkspaceContentChanges() {
        if (workspaceContentFlushTimer) {
            clearTimeout(workspaceContentFlushTimer);
            workspaceContentFlushTimer = 0;
        }
        void persistWorkspaceContentChanges();
    }

    function scheduleWorkspaceContentFlush() {
        if (workspaceContentFlushTimer) {
            clearTimeout(workspaceContentFlushTimer);
        }
        workspaceContentFlushTimer = window.setTimeout(() => {
            workspaceContentFlushTimer = 0;
            void persistWorkspaceContentChanges();
        }, 220);
    }

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

    function getCurrentWorkspaceDirectoryPath() {
        const selectedTreeDirectory = normalizeLocalDirectoryPath(state.selectedTreePath);
        if (selectedTreeDirectory) return selectedTreeDirectory;
        const selectedFile = normalizeWritableLocalFilePath(state.selectedFilePath);
        if (selectedFile) {
            return `${selectedFile.split('/').slice(0, -1).join('/')}/`;
        }
        return LOCAL_SOURCE_PREFIX;
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
        const match = findLocalFileByPath(state.localSources, targetPath);
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
        const normalizedSources = normalizeLocalSources(state.localSources);
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
            state.mobileWorkspacePane = 'tree';
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
            showToast?.(`工作区已更新，但会话保存失败，刷新后可能丢失：${persistResult.error || 'unknown_error'}`);
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
            showToast?.(`导入到工作区失败：${String(error?.message || error || 'unknown_error')}`);
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
            '已移除工作区根',
        );
    }

    function downloadLocalSource(sourceId) {
        const normalizedId = String(sourceId || '').trim();
        if (!normalizedId) return false;

        const source = normalizeLocalSources(state.localSources).find((item) => item.sourceId === normalizedId);
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
        const normalizedSources = normalizeLocalSources(state.localSources);
        if (!normalizedSources.length) {
            showToast?.('没有可下载的工作区内容');
            return false;
        }

        const entries = {};
        normalizedSources.forEach((source) => {
            collectSourceDirectoryPaths(source).forEach((directoryPath) => {
                entries[`${sanitizeLabel(source.label, 'source')}/${directoryPath}/`] = new Uint8Array();
            });
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
        await commitLocalSources([], '已清空工作区');
    }

    function updateLocalFileContent(targetPath, content, options = {}) {
        const match = findLocalFileByPath(state.localSources, targetPath);
        if (!match) return false;
        const nextContent = typeof content === 'string' ? content : String(content ?? '');
        if (nextContent === String(match.file.content || '')) return true;

        const upsert = upsertLocalFileInSources(state.localSources, targetPath, nextContent, {
            originalContent: match.file.originalContent,
        });
        state.localSources = normalizeLocalSources(upsert.nextSources);
        ensureWorkspaceSelection();

        if (options.flush) {
            flushWorkspaceContentChanges();
        } else {
            scheduleWorkspaceContentFlush();
        }
        if (options.render) {
            render?.();
        }
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
        }
        if (!defaultPath) {
            defaultPath = `${getCurrentWorkspaceDirectoryPath()}new-file.txt`;
        }

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

    async function createLocalDirectoryAt(targetPath = '') {
        const normalizedTargetDirectory = normalizeLocalDirectoryPath(targetPath);
        const defaultPath = normalizedTargetDirectory
            ? `${normalizedTargetDirectory}new-folder/`
            : `${getCurrentWorkspaceDirectoryPath()}new-folder/`;
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

        const upsert = upsertLocalDirectoryInSources(state.localSources, normalizedPath);
        const committed = await commitLocalSources(upsert.nextSources, `已新建目录 ${normalizedPath}`);
        if (!committed) return false;
        selectWorkspaceNode(normalizedPath);
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
        const normalizedSources = normalizeLocalSources(state.localSources);
        const summary = summarizeLocalSources(normalizedSources);
        const workspaceTree = buildWorkspaceTree(normalizedSources, {
            selectedSourceId: 'all',
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
                selectedSourceId: 'all',
                selectedFilePath: state.selectedFilePath,
                selectedTreePath: state.selectedTreePath,
                fileSearchQuery: state.fileSearchQuery,
                showModifiedOnly: state.showModifiedOnly,
                viewerMode: state.viewerMode,
                mobileWorkspacePane: state.mobileWorkspacePane,
                treeExpandedKeys: state.treeExpandedKeys,
            },
            isModifiedFile: isLocalSourceFileModified,
            hasOriginalSnapshot,
            onDownloadAll: () => {
                downloadAllLocalSources();
            },
            onClearAll: () => {
                void clearLocalSources();
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
                void restoreLocalFile(targetPath);
            },
            onUpdateFileContent: (targetPath, content, nextOptions = {}) => {
                return updateLocalFileContent(targetPath, content, nextOptions);
            },
            onCreateFile: (targetPath) => {
                void createLocalFileAt(targetPath);
            },
            onCreateDirectory: (targetPath) => {
                void createLocalDirectoryAt(targetPath);
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
        syncHostLocalSources,
    };
}
