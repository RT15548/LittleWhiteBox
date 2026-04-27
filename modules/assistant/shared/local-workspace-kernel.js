import { getPathExtension, isSupportedPublicTextPath } from './public-text-file-types.js';

export const LOCAL_SOURCE_PREFIX = 'local/';
export const LOCAL_SOURCE_FILE_KIND = 'session-local-source';

export function sanitizeLocalSourceLabel(value, fallback = 'source') {
    const normalized = String(value || '')
        .trim()
        .replace(/\\/g, '/')
        .replace(/^\/+|\/+$/g, '')
        .replace(/\s+/g, ' ');
    const cleaned = normalized.split('/').filter(Boolean).join('-').trim();
    return cleaned || fallback;
}

export function normalizeLocalSourcePath(pathText = '') {
    return String(pathText || '').trim().replace(/\\/g, '/').replace(/^\/+/, '');
}

export function isLocalRootPath(pathText = '') {
    return normalizeLocalSourcePath(pathText).replace(/\/+$/, '') === 'local';
}

export function getLocalSourceLabelFromPath(pathText = '') {
    return normalizeLocalSourcePath(pathText).split('/').filter(Boolean)[1] || '';
}

export function getLocalSourceRootPathFromPath(pathText = '') {
    const normalized = normalizeLocalSourcePath(pathText).replace(/\/+$/, '');
    if (!normalized.startsWith(LOCAL_SOURCE_PREFIX) || normalized.includes('..')) return '';
    const segments = normalized.split('/').filter(Boolean);
    if (segments.length < 2) return '';
    if (segments.length === 2) return LOCAL_SOURCE_PREFIX;
    return `${LOCAL_SOURCE_PREFIX}${segments[1]}/`;
}

export function getRelativeLocalFilePath(pathText = '') {
    const normalized = normalizeLocalSourcePath(pathText);
    const rootPath = getLocalSourceRootPathFromPath(normalized);
    if (!rootPath || !normalized.startsWith(rootPath)) return '';
    return normalized.slice(rootPath.length);
}

export function normalizeLocalSourceRootPath(rootPath = '', fallbackLabel = 'source') {
    const normalized = normalizeLocalSourcePath(rootPath).replace(/\/+$/, '');
    if (normalized === 'local') return LOCAL_SOURCE_PREFIX;
    if (normalized.startsWith(LOCAL_SOURCE_PREFIX) && !normalized.includes('..')) {
        const segments = normalized.split('/').filter(Boolean);
        if (segments.length >= 2) {
            return `${normalized}/`;
        }
    }
    return `${LOCAL_SOURCE_PREFIX}${sanitizeLocalSourceLabel(fallbackLabel, 'source')}/`;
}

export function getWritableLocalPathError(rawPath) {
    const normalized = normalizeLocalSourcePath(rawPath);
    if (!normalized.startsWith(LOCAL_SOURCE_PREFIX)) return 'local_path_required';
    if (normalized.includes('..') || normalized.endsWith('/')) return 'local_path_required';
    if (!isSupportedPublicTextPath(normalized)) return 'unsupported_text_file';
    const segments = normalized.split('/').filter(Boolean);
    if (segments.length < 2) return 'local_path_required';
    return '';
}

export function normalizeWritableLocalPath(rawPath = '') {
    const normalized = normalizeLocalSourcePath(rawPath);
    if (getWritableLocalPathError(normalized)) return '';
    return normalized;
}

export function normalizeWritableLocalFilePath(pathText = '') {
    return normalizeWritableLocalPath(pathText);
}

export function normalizeLocalDirectoryPath(pathText = '') {
    const normalized = normalizeLocalSourcePath(pathText).replace(/\/+$/, '');
    if (normalized === 'local') return LOCAL_SOURCE_PREFIX;
    if (!normalized.startsWith(LOCAL_SOURCE_PREFIX) || normalized.includes('..')) return '';
    const segments = normalized.split('/').filter(Boolean);
    if (segments.length < 1) return '';
    return `${normalized}/`;
}

export function formatWorkspacePromptPath(pathText = '') {
    const normalized = normalizeLocalSourcePath(pathText);
    if (!normalized.startsWith(LOCAL_SOURCE_PREFIX)) return normalized;
    return normalized.slice(LOCAL_SOURCE_PREFIX.length);
}

export function normalizeWorkspacePromptFilePath(pathText = '') {
    const normalized = normalizeLocalSourcePath(pathText);
    if (!normalized) return '';
    return normalizeWritableLocalFilePath(normalized.startsWith(LOCAL_SOURCE_PREFIX) ? normalized : `${LOCAL_SOURCE_PREFIX}${normalized}`);
}

export function normalizeWorkspacePromptDirectoryPath(pathText = '') {
    const normalized = normalizeLocalSourcePath(pathText).replace(/\/+$/, '');
    if (!normalized) return '';
    const prefixed = normalized.startsWith(LOCAL_SOURCE_PREFIX) ? normalized : `${LOCAL_SOURCE_PREFIX}${normalized}`;
    return normalizeLocalDirectoryPath(prefixed);
}

function getLastPathSegment(pathText = '') {
    return normalizeLocalSourcePath(pathText).split('/').filter(Boolean).at(-1) || '';
}

export function findBlockingLocalFilePath(localSources = [], targetPath = '') {
    const normalizedTargetPath = normalizeLocalSourcePath(targetPath).replace(/\/+$/, '');
    if (!normalizedTargetPath.startsWith(LOCAL_SOURCE_PREFIX) || normalizedTargetPath.includes('..')) return '';
    const segments = normalizedTargetPath.split('/').filter(Boolean);
    for (let index = 1; index < segments.length - 1; index += 1) {
        const prefix = segments.slice(0, index + 1).join('/');
        if (findLocalFileByPath(localSources, prefix)) {
            return prefix;
        }
    }
    return '';
}

export function pickUniqueLocalSourceLabel(desiredLabel, existingLabels = new Set()) {
    const baseLabel = sanitizeLocalSourceLabel(desiredLabel, 'source');
    let nextLabel = baseLabel;
    let suffix = 2;
    while (existingLabels.has(nextLabel)) {
        nextLabel = `${baseLabel}-${suffix}`;
        suffix += 1;
    }
    existingLabels.add(nextLabel);
    return nextLabel;
}

export function normalizeLocalSourceDirectory(directoryPath = '') {
    const normalized = normalizeLocalSourcePath(directoryPath).replace(/^\/+|\/+$/g, '');
    if (!normalized || normalized.includes('..')) return '';
    return normalized;
}

export function collectImplicitDirectoryPaths(files = []) {
    const paths = new Set();
    files.forEach((file) => {
        const segments = String(file?.relativePath || '').split('/').filter(Boolean).slice(0, -1);
        segments.forEach((_, index) => {
            paths.add(segments.slice(0, index + 1).join('/'));
        });
    });
    return Array.from(paths).sort((left, right) => left.localeCompare(right, 'zh-CN'));
}

export function collectSourceDirectoryPaths(source = {}) {
    const explicitDirectories = Array.isArray(source.directories)
        ? source.directories.map(normalizeLocalSourceDirectory).filter(Boolean)
        : [];
    return Array.from(new Set([
        ...explicitDirectories,
        ...collectImplicitDirectoryPaths(source.files || []),
    ])).sort((left, right) => left.localeCompare(right, 'zh-CN'));
}

export function buildDirectoryAncestors(relativeDirectoryPath = '') {
    const normalized = normalizeLocalSourceDirectory(relativeDirectoryPath);
    if (!normalized) return [];
    const segments = normalized.split('/').filter(Boolean);
    return segments.map((_, index) => segments.slice(0, index + 1).join('/'));
}

export function buildMovedDirectoryTargetPath(fromDirectoryPath = '', toDirectoryPath = '', currentDirectoryPath = '') {
    const normalizedFromDirectoryPath = normalizeLocalDirectoryPath(fromDirectoryPath);
    const normalizedToDirectoryPath = normalizeLocalDirectoryPath(toDirectoryPath);
    const normalizedCurrentDirectoryPath = normalizeLocalDirectoryPath(currentDirectoryPath);
    if (!normalizedFromDirectoryPath || !normalizedToDirectoryPath || !normalizedCurrentDirectoryPath) {
        throw new Error('local_path_required');
    }
    const suffix = normalizedCurrentDirectoryPath.slice(normalizedFromDirectoryPath.length).replace(/\/+$/, '');
    return suffix ? `${normalizedToDirectoryPath}${suffix}/` : normalizedToDirectoryPath;
}

function normalizeOriginalContent(file = {}, fallbackContent = '') {
    const hasOriginalContent = Object.prototype.hasOwnProperty.call(file, 'originalContent');
    if (!hasOriginalContent) return fallbackContent;
    if (file.originalContent === null) return null;
    return typeof file.originalContent === 'string' ? file.originalContent : fallbackContent;
}

export function buildLocalFileRecord({ sourceLabel, fileName, relativePath, content, sizeBytes, originalContent } = {}) {
    const normalizedName = String(fileName || '').trim() || 'untitled.txt';
    const normalizedRelativePath = normalizeLocalSourcePath(relativePath || normalizedName) || normalizedName;
    const normalizedContent = typeof content === 'string' ? content : String(content ?? '');
    const path = `${LOCAL_SOURCE_PREFIX}${sourceLabel}/${normalizedRelativePath}`;
    return {
        path,
        publicPath: path,
        relativePath: normalizedRelativePath,
        name: normalizedName,
        sizeBytes: Math.max(0, Number(sizeBytes) || new TextEncoder().encode(normalizedContent).length),
        content: normalizedContent,
        originalContent: originalContent === undefined ? normalizedContent : originalContent,
        source: LOCAL_SOURCE_FILE_KIND,
        extension: getPathExtension(path),
        rootPath: `${LOCAL_SOURCE_PREFIX}${sourceLabel}/`,
    };
}

export function buildLocalFileRecordFromPath(publicPath, content = '', options = {}) {
    const normalizedPath = normalizeWritableLocalFilePath(publicPath);
    if (!normalizedPath) {
        throw new Error('local_path_required');
    }
    const segments = normalizedPath.split('/').filter(Boolean);
    const relativePath = getRelativeLocalFilePath(normalizedPath);
    const fileName = segments[segments.length - 1] || 'untitled.txt';
    const normalizedContent = typeof content === 'string' ? content : String(content ?? '');
    const rootPath = getLocalSourceRootPathFromPath(normalizedPath);
    return {
        path: normalizedPath,
        publicPath: normalizedPath,
        relativePath,
        name: fileName,
        sizeBytes: new TextEncoder().encode(normalizedContent).length,
        content: normalizedContent,
        originalContent: Object.prototype.hasOwnProperty.call(options, 'originalContent')
            ? options.originalContent
            : normalizedContent,
        source: LOCAL_SOURCE_FILE_KIND,
        extension: getPathExtension(normalizedPath),
        rootPath,
    };
}

export function normalizeLocalSourceFile(file = {}) {
    if (!file || typeof file !== 'object') return null;
    const path = normalizeLocalSourcePath(file.path || file.publicPath || '');
    if (!path.startsWith(LOCAL_SOURCE_PREFIX) || path.includes('..')) return null;
    const name = String(file.name || '').trim() || path.split('/').pop() || 'file';
    const relativePath = normalizeLocalSourcePath(file.relativePath || getRelativeLocalFilePath(path) || name) || name;
    const content = typeof file.content === 'string' ? file.content : '';
    return {
        path,
        publicPath: path,
        relativePath,
        name,
        sizeBytes: Math.max(0, Number(file.sizeBytes) || new TextEncoder().encode(content).length),
        content,
        originalContent: normalizeOriginalContent(file, content),
        source: LOCAL_SOURCE_FILE_KIND,
        extension: getPathExtension(path),
        rootPath: normalizeLocalSourceRootPath(file.rootPath, getLocalSourceLabelFromPath(path) || 'source'),
    };
}

export function normalizeLocalSourceFileEntry(file = {}) {
    return normalizeLocalSourceFile(file);
}

export function createLocalSourceRecord({ sourceId, label, rootPath, importedAt, files, directories } = {}) {
    const normalizedLabel = String(label || '').trim() || 'source';
    const normalizedFiles = Array.isArray(files) ? files.map(normalizeLocalSourceFile).filter(Boolean) : [];
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

export function createEphemeralLocalSourceRecord(label, localSources = [], rootPath = '') {
    const normalizedLabel = String(label || '').trim() || 'source';
    const existingIds = new Set(
        normalizeLocalSources(localSources).map((source) => String(source.sourceId || '').trim()).filter(Boolean),
    );
    const desiredRootPath = normalizeLocalSourceRootPath(rootPath, normalizedLabel);
    const baseId = desiredRootPath === LOCAL_SOURCE_PREFIX ? 'local:root' : `local:${sanitizeLocalSourceLabel(normalizedLabel, 'source')}`;
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

export function normalizeLocalSources(localSources = []) {
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

export function normalizeLocalSourcesSnapshot(localSources = []) {
    return normalizeLocalSources(localSources);
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

export function findLocalFileByPath(localSources = [], targetPath = '') {
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

export function findLocalSourceFileByPath(targetPath = '', localSources = []) {
    return findLocalFileByPath(localSources, targetPath)?.file || null;
}

export function findLocalDirectoryByPath(localSources = [], targetPath = '') {
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

export function upsertLocalFileInSources(localSources = [], targetPath = '', content = '', options = {}) {
    const normalizedTargetPath = normalizeWritableLocalFilePath(targetPath);
    if (!normalizedTargetPath) {
        throw new Error('local_path_required');
    }

    const normalizedSources = normalizeLocalSources(localSources);
    const blockingPath = findBlockingLocalFilePath(normalizedSources, normalizedTargetPath);
    if (blockingPath) {
        throw new Error('local_parent_path_blocked');
    }
    if (findLocalDirectoryByPath(normalizedSources, normalizedTargetPath)) {
        throw new Error('local_destination_exists');
    }
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
        sourceLabel,
    };
}

export function upsertLocalSourceFile(localSources = [], targetPath = '', content = '', options = {}) {
    return upsertLocalFileInSources(localSources, targetPath, content, options);
}

export function upsertLocalDirectoryInSources(localSources = [], targetPath = '') {
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
    const blockingPath = findBlockingLocalFilePath(normalizedSources, normalizedTarget);
    if (blockingPath) {
        throw new Error('local_parent_path_blocked');
    }
    if (findLocalFileByPath(normalizedSources, normalizedTarget)) {
        throw new Error('local_destination_exists');
    }
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

export function upsertLocalSourceDirectory(localSources = [], targetPath = '') {
    return upsertLocalDirectoryInSources(localSources, targetPath);
}

export function removeLocalSourceFile(localSources = [], publicPath = '') {
    const fileMatch = findLocalFileByPath(localSources, publicPath);
    if (!fileMatch) {
        throw new Error('local_file_not_found');
    }
    return {
        nextSources: normalizeLocalSources(localSources)
            .map((source) => {
                if (source.sourceId !== fileMatch.source.sourceId) return source;
                return createLocalSourceRecord({
                    ...source,
                    files: source.files.filter((file) => file.path !== fileMatch.file.path),
                });
            })
            .filter((source) => source && (source.files.length || source.directories.length)),
        file: fileMatch.file,
    };
}

export function removeLocalPathFromSources(localSources = [], targetPath = '') {
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

    if (!directoryMatch.relativeDirectoryPath) {
        return {
            mode: 'directory',
            removedFiles: directoryMatch.files.slice(),
            nextSources: normalizeLocalSources(localSources)
                .filter((source) => source.sourceId !== directoryMatch.source?.sourceId),
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

export function removeLocalSourcePath(localSources = [], targetPath = '') {
    return removeLocalPathFromSources(localSources, targetPath);
}

export function moveLocalPathInSources(localSources = [], fromPath = '', toPath = '', options = {}) {
    let normalizedSources = normalizeLocalSources(localSources);
    const overwrite = !!options.overwrite;
    const fromFileMatch = findLocalFileByPath(normalizedSources, fromPath);

    let movedFiles = [];
    let movedDirectories = [];
    let targetMappings = [];
    let mode = 'file';

    if (fromFileMatch) {
        const normalizedRawToPath = normalizeLocalSourcePath(toPath);
        const destinationDirectoryMatch = findLocalDirectoryByPath(normalizedSources, toPath);
        let normalizedToFilePath = '';
        if (destinationDirectoryMatch) {
            normalizedToFilePath = `${destinationDirectoryMatch.directoryPath}${fromFileMatch.file.name || getLastPathSegment(fromFileMatch.file.path)}`;
        } else if (normalizedRawToPath.endsWith('/')) {
            throw new Error('local_path_not_found');
        } else {
            normalizedToFilePath = normalizeWritableLocalFilePath(toPath);
            if (!normalizedToFilePath) {
                throw new Error(getWritableLocalPathError(toPath) || 'local_path_required');
            }
        }
        if (normalizedToFilePath === fromFileMatch.file.path) {
            return {
                mode: 'file',
                movedFiles: [],
                nextSources: normalizedSources,
                overwritten: false,
                fromPath: fromFileMatch.file.path,
                toPath: normalizedToFilePath,
                noOp: true,
            };
        }
        movedFiles = [fromFileMatch.file];
        targetMappings = [{ fromPath: fromFileMatch.file.path, toPath: normalizedToFilePath }];
    } else {
        const fromDirectoryMatch = findLocalDirectoryByPath(normalizedSources, fromPath);
        if (!fromDirectoryMatch) {
            throw new Error('local_source_not_found');
        }
        const normalizedFromDirectoryPath = normalizeLocalDirectoryPath(fromPath);
        const normalizedToDirectoryPath = normalizeLocalDirectoryPath(toPath);
        if (!normalizedFromDirectoryPath || !normalizedToDirectoryPath) {
            throw new Error('local_path_required');
        }
        if (normalizedToDirectoryPath === normalizedFromDirectoryPath) {
            return {
                mode: 'directory',
                movedFiles: [],
                nextSources: normalizedSources,
                overwritten: false,
                fromPath: normalizedFromDirectoryPath,
                toPath: normalizedToDirectoryPath,
                noOp: true,
            };
        }
        const destinationDirectoryMatch = normalizedToDirectoryPath === normalizedFromDirectoryPath
            ? null
            : findLocalDirectoryByPath(normalizedSources, normalizedToDirectoryPath);
        if (destinationDirectoryMatch) {
            if (!overwrite) {
                throw new Error('local_destination_exists');
            }
            normalizedSources = removeLocalPathFromSources(normalizedSources, normalizedToDirectoryPath).nextSources;
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
            const nextDirectoryPath = buildMovedDirectoryTargetPath(
                normalizedFromDirectoryPath,
                normalizedToDirectoryPath,
                directoryPath,
            );
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
        overwritten: conflictingFiles.length > 0 || (
            mode === 'directory'
            && normalizeLocalDirectoryPath(fromPath) !== normalizeLocalDirectoryPath(toPath)
            && !!findLocalDirectoryByPath(localSources, toPath)
        ),
        fromPath: targetMappings.length === 1 ? targetMappings[0].fromPath : fromPath,
        toPath: targetMappings.length === 1 ? targetMappings[0].toPath : toPath,
    };
}

export function moveLocalSourceFile(localSources = [], fromPath = '', toPath = '', options = {}) {
    const move = moveLocalPathInSources(localSources, fromPath, toPath, options);
    if (move.mode !== 'file') {
        throw new Error('local_path_required');
    }
    const file = movedFilesFirst(move);
    const fromFile = findLocalSourceFileByPath(fromPath, localSources);
    return {
        nextSources: move.nextSources,
        fromFile,
        file,
        overwritten: move.overwritten,
    };
}

function movedFilesFirst(move = {}) {
    return Array.isArray(move.movedFiles) ? move.movedFiles[0] || null : null;
}

export function moveLocalSourcePath(localSources = [], fromPath = '', toPath = '', options = {}) {
    return moveLocalPathInSources(localSources, fromPath, toPath, options);
}

export function hasOriginalSnapshot(file) {
    return file && typeof file.originalContent === 'string';
}

export function isLocalSourceFileModified(file) {
    if (!file) return false;
    if (file.originalContent === null) return true;
    if (typeof file.originalContent === 'string') {
        return String(file.content || '') !== file.originalContent;
    }
    return false;
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

export function validateLocalSources(localSources = []) {
    const normalizedSources = normalizeLocalSources(localSources);
    const filePaths = new Set();
    const directoryPaths = new Set([LOCAL_SOURCE_PREFIX]);
    const sourceIds = new Set();
    const rootPaths = new Set();
    const errors = [];

    normalizedSources.forEach((source) => {
        const sourceId = String(source?.sourceId || '').trim();
        const rootPath = String(source?.rootPath || '').trim();
        if (!sourceId) {
            errors.push('missing_source_id');
        } else if (sourceIds.has(sourceId)) {
            errors.push(`duplicate_source_id:${sourceId}`);
        } else {
            sourceIds.add(sourceId);
        }
        if (!rootPath) {
            errors.push('missing_root_path');
        } else if (rootPaths.has(rootPath)) {
            errors.push(`duplicate_root_path:${rootPath}`);
        } else {
            rootPaths.add(rootPath);
            directoryPaths.add(rootPath);
        }
        (Array.isArray(source?.directories) ? source.directories : []).forEach((directory) => {
            const directoryPath = `${rootPath}${String(directory || '').replace(/\/+$/, '')}/`;
            directoryPaths.add(directoryPath);
        });
        (Array.isArray(source?.files) ? source.files : []).forEach((file) => {
            const publicPath = String(file?.publicPath || file?.path || '').trim();
            if (!publicPath) {
                errors.push('missing_file_path');
                return;
            }
            if (filePaths.has(publicPath)) {
                errors.push(`duplicate_file_path:${publicPath}`);
                return;
            }
            filePaths.add(publicPath);
            if (!publicPath.startsWith(rootPath)) {
                errors.push(`file_outside_root:${publicPath}`);
            }
            const relativePath = String(file?.relativePath || '').trim();
            if (relativePath && publicPath.slice(rootPath.length) !== relativePath) {
                errors.push(`relative_path_mismatch:${publicPath}`);
            }
        });
    });

    filePaths.forEach((filePath) => {
        const segments = filePath.split('/');
        let prefix = '';
        for (let index = 0; index < segments.length - 1; index += 1) {
            prefix = prefix ? `${prefix}${segments[index]}/` : `${segments[index]}/`;
            if (filePaths.has(prefix.replace(/\/+$/, ''))) {
                errors.push(`file_directory_conflict:${prefix}`);
            }
        }
    });

    directoryPaths.forEach((directoryPath) => {
        const normalizedDirectory = String(directoryPath || '').replace(/\/+$/, '');
        if (normalizedDirectory && filePaths.has(normalizedDirectory)) {
            errors.push(`file_directory_conflict:${normalizedDirectory}`);
        }
    });

    return {
        ok: errors.length === 0,
        errors,
    };
}

export function validateLocalSourcesSnapshot(localSources = []) {
    return validateLocalSources(localSources);
}
