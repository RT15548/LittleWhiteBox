import { zipSync, strToU8 } from '../../../libs/fflate.mjs';
import { getPathExtension, isSupportedPublicTextPath } from '../shared/public-text-file-types.js';

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
    return {
        path,
        relativePath,
        name,
        sizeBytes: Math.max(0, Number(file.sizeBytes) || 0),
        content,
        source: LOCAL_SOURCE_FILE_KIND,
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
    };
}

export function createLocalSourcesManager(deps) {
    const {
        state,
        createRequestId,
        showToast,
        render,
        persistSession,
        post,
    } = deps;

    function syncHostLocalSources() {
        post?.('xb-assistant:local-sources-sync', {
            localSources: normalizeLocalSources(state.localSources),
        });
    }

    async function commitLocalSources(nextSources, toastText = '', options = {}) {
        const shouldSyncHost = options.syncHost !== false;
        state.localSources = normalizeLocalSources(nextSources);
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

            const updateImportProgress = (suffix = '') => {
                const now = Date.now();
                if (suffix || now - lastProgressAt >= IMPORT_PROGRESS_INTERVAL_MS) {
                    lastProgressAt = now;
                    const progressText = totalFiles > 0
                        ? `正在导入源码源 ${processedFiles}/${totalFiles}${suffix ? ` · ${suffix}` : ''}`
                        : '正在导入源码源';
                    showToast?.(progressText);
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
                            const percent = Math.max(0, Math.min(100, Math.round((loadedBytes / totalBytesForFile) * 100)));
                            updateImportProgress(`${file.name || candidatePath} ${percent}%`);
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
            return await commitLocalSources(
                [...normalizeLocalSources(state.localSources), ...importedSources],
                summarizeImportResult({
                    importedSources: importedSources.length,
                    importedFiles,
                    rejectedFiles,
                    duplicateFiles,
                }),
            );
        } catch (error) {
            showToast?.(`源码导入失败：${String(error?.message || error || 'unknown_error')}`);
            return false;
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

    async function clearLocalSources() {
        if (!normalizeLocalSources(state.localSources).length) return;
        await commitLocalSources([], '已清空源码源');
    }

    function renderLocalSourcesPanel(container, options = {}) {
        if (!container) return;
        const normalizedSources = normalizeLocalSources(state.localSources);
        const summary = summarizeLocalSources(normalizedSources);
        container.replaceChildren();
        container.style.display = summary.sourceCount ? '' : 'none';
        if (!summary.sourceCount) return;

        const header = document.createElement('div');
        header.className = 'xb-assistant-local-sources-header';

        const title = document.createElement('div');
        title.className = 'xb-assistant-local-sources-title';
        title.textContent = `已导入源码源 ${summary.sourceCount} 个 · ${summary.fileCount} 个文件`;
        header.appendChild(title);

        const actions = document.createElement('div');
        actions.className = 'xb-assistant-local-sources-actions';

        if (typeof options.onDownloadAll === 'function') {
            const downloadAllButton = document.createElement('button');
            downloadAllButton.type = 'button';
            downloadAllButton.className = 'xb-assistant-local-sources-download';
            downloadAllButton.textContent = '下载全部';
            downloadAllButton.disabled = !!options.disabled;
            downloadAllButton.addEventListener('click', () => options.onDownloadAll());
            actions.appendChild(downloadAllButton);
        }

        if (typeof options.onClear === 'function') {
            const clearButton = document.createElement('button');
            clearButton.type = 'button';
            clearButton.className = 'xb-assistant-local-sources-clear';
            clearButton.textContent = '清空源码源';
            clearButton.disabled = !!options.disabled;
            clearButton.addEventListener('click', () => options.onClear());
            actions.appendChild(clearButton);
        }

        if (actions.childNodes.length) {
            header.appendChild(actions);
        }

        container.appendChild(header);

        const list = document.createElement('div');
        list.className = 'xb-assistant-local-sources-list';

        normalizedSources.forEach((source) => {
            const card = document.createElement('div');
            card.className = 'xb-assistant-local-source-card';

            const info = document.createElement('div');
            info.className = 'xb-assistant-local-source-info';

            const name = document.createElement('div');
            name.className = 'xb-assistant-local-source-name';
            name.textContent = source.label;
            info.appendChild(name);

            const meta = document.createElement('div');
            meta.className = 'xb-assistant-local-source-meta';
            meta.textContent = `${source.files.length} 个文件 · local/${source.label}/`;
            info.appendChild(meta);

            card.appendChild(info);

            const cardActions = document.createElement('div');
            cardActions.className = 'xb-assistant-local-source-actions';

            if (typeof options.onDownload === 'function') {
                const downloadButton = document.createElement('button');
                downloadButton.type = 'button';
                downloadButton.className = 'xb-assistant-local-source-download';
                downloadButton.textContent = source.files.length > 1 ? '下载 zip' : '下载';
                downloadButton.disabled = !!options.disabled;
                downloadButton.addEventListener('click', () => options.onDownload(source.sourceId));
                cardActions.appendChild(downloadButton);
            }

            if (typeof options.onRemove === 'function') {
                const removeButton = document.createElement('button');
                removeButton.type = 'button';
                removeButton.className = 'xb-assistant-local-source-remove';
                removeButton.textContent = '移除';
                removeButton.disabled = !!options.disabled;
                removeButton.addEventListener('click', () => options.onRemove(source.sourceId));
                cardActions.appendChild(removeButton);
            }

            if (cardActions.childNodes.length) {
                card.appendChild(cardActions);
            }

            list.appendChild(card);
        });

        container.appendChild(list);
    }

    return {
        normalizeLocalSources,
        summarizeLocalSources,
        appendLocalSourceFiles,
        removeLocalSource,
        downloadLocalSource,
        downloadAllLocalSources,
        clearLocalSources,
        applyExternalLocalSources,
        renderLocalSourcesPanel,
        syncHostLocalSources,
    };
}
