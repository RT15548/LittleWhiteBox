import { applyTextEdits } from '../../agent-core/tools/text-edit.js';
import {
    assertBookDirectoryPath,
    assertBookFilePath,
    getBookPathError,
    normalizeBookDirectoryPath,
    normalizeBookFilePath,
    normalizeBookPath,
} from './book-paths.js';
import {
    deleteBookPath,
    getBookFile,
    replaceBookFiles,
    upsertBookFile,
} from './ebook-db.js';

const DEFAULT_READ_LIMIT = 1200;
const MAX_READ_LIMIT = 2000;
const MAX_GREP_RESULTS = 100;
const DEFAULT_BOOK_DIRECTORIES = ['book/sources/', 'book/chapters/', 'book/volumes/', 'book/reviews/', 'book/notes/'];

function normalizeText(value = '', limit = 4000) {
    const text = String(value || '').trim();
    return text.length > limit ? text.slice(0, limit) : text;
}

function toLineNumber(value, fallback = 1) {
    const number = Math.floor(Number(value));
    return Number.isFinite(number) && number > 0 ? number : fallback;
}

function clampLimit(value, fallback = DEFAULT_READ_LIMIT, max = MAX_READ_LIMIT) {
    const number = Math.floor(Number(value));
    if (!Number.isFinite(number) || number <= 0) return fallback;
    return Math.min(max, number);
}

function splitLines(text = '') {
    return String(text ?? '').replace(/\r\n?/g, '\n').split('\n');
}

function numberLines(lines = [], startLine = 1) {
    return lines.map((line, index) => `${startLine + index}: ${line}`).join('\n');
}

export function collectDirectoryEntries(files = [], directoryPath = 'book/') {
    const dir = normalizeBookDirectoryPath(directoryPath) || 'book/';
    const entryMap = new Map();
    DEFAULT_BOOK_DIRECTORIES.forEach((directory) => {
        if (!directory.startsWith(dir) || directory === dir) return;
        const rest = directory.slice(dir.length);
        const [first] = rest.split('/');
        if (!first) return;
        const path = `${dir}${first}/`;
        entryMap.set(path, {
            name: first,
            path,
            type: 'directory',
        });
    });
    files.forEach((file) => {
        if (!file.path.startsWith(dir) || file.path === dir) return;
        const rest = file.path.slice(dir.length);
        if (!rest) return;
        const [first] = rest.split('/');
        if (!first) return;
        const isDirectory = rest.includes('/');
        const path = `${dir}${first}${isDirectory ? '/' : ''}`;
        entryMap.set(path, {
            name: first,
            path,
            type: isDirectory ? 'directory' : 'file',
        });
    });
    return Array.from(entryMap.values()).sort((left, right) => {
        if (left.type !== right.type) return left.type === 'directory' ? -1 : 1;
        return left.path.localeCompare(right.path, 'zh-CN');
    });
}

function globToRegExp(pattern = '') {
    const normalized = normalizeBookPath(pattern || 'book/**');
    if (!normalized) throw new Error('book_path_required');
    let output = '^';
    for (let index = 0; index < normalized.length; index += 1) {
        const char = normalized[index];
        const next = normalized[index + 1];
        const afterNext = normalized[index + 2];
        if (char === '*' && next === '*' && afterNext === '/') {
            output += '(?:.*/)?';
            index += 2;
        } else if (char === '*' && next === '*') {
            output += '.*';
            index += 1;
        } else if (char === '*') {
            output += '[^/]*';
        } else if (char === '?') {
            output += '[^/]';
        } else {
            output += char.replace(/[|\\{}()[\]^$+?.]/g, '\\$&');
        }
    }
    output += '$';
    return new RegExp(output);
}

function buildIncludePredicate(include = '') {
    const text = String(include || '').trim();
    if (!text) return () => true;
    if (!/[/*?[\]{}]/.test(text)) {
        const normalizedFile = normalizeBookFilePath(text);
        return (path) => path === normalizedFile || path.endsWith(`/${text.replace(/^\/+/, '')}`);
    }
    const pattern = text.startsWith('book/') ? text : `book/${text.replace(/^\/+/, '')}`;
    const regexp = globToRegExp(pattern);
    return (path) => regexp.test(path);
}

function normalizeGrepOutputMode(value = '') {
    const text = String(value || 'content').trim();
    const key = text.replace(/[\s-]/g, '_').replace(/[A-Z]/g, (char) => `_${char.toLowerCase()}`).replace(/_+/g, '_').replace(/^_+|_+$/g, '');
    if (key === 'files_with_matches' || key === 'fileswithmatches') return 'files_with_matches';
    if (key === 'count') return 'count';
    return 'content';
}

function resolveGrepPathScope(rawPath = '') {
    const text = String(rawPath || '').trim();
    if (!text) return { directory: '', filePath: '' };
    const filePath = normalizeBookFilePath(text);
    if (filePath) return { directory: '', filePath };
    return { directory: assertBookDirectoryPath(text), filePath: '' };
}

function buildSearchRegExp(pattern = '', useRegex = false) {
    const text = String(pattern || '');
    if (!text) throw new Error('grep_pattern_required');
    if (useRegex !== true) {
        return new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    }
    return new RegExp(text, 'i');
}

export function createBookFileToolHandlers(options = {}) {
    const currentBookId = typeof options.currentBookId === 'function' ? options.currentBookId : async () => options.bookId;
    const getFiles = typeof options.getFiles === 'function' ? options.getFiles : async () => [];
    const onFilesChanged = typeof options.onFilesChanged === 'function' ? options.onFilesChanged : null;
    const readOnly = !!options.readOnly;

    function assertWritable() {
        if (readOnly) throw new Error('book_tool_read_only');
    }

    async function attachRefreshWarning(result = {}) {
        if (!onFilesChanged) return result;
        try {
            await onFilesChanged();
            return result;
        } catch (error) {
            return {
                ...result,
                warning: 'files_refresh_failed',
                refreshError: String(error?.message || error || 'files_refresh_failed'),
                summary: `${result.summary || '文件已变更。'}（文件变更已保存，但界面刷新失败；请刷新电纸书界面。）`,
            };
        }
    }

    async function executeLs(args = {}) {
        const directory = assertBookDirectoryPath(args.path || 'book/');
        const files = await getFiles();
        const entries = collectDirectoryEntries(files, directory);
        const offset = toLineNumber(args.offset, 1);
        const limit = Math.min(300, Math.max(1, Math.floor(Number(args.limit) || 100)));
        const page = entries.slice(offset - 1, offset - 1 + limit);
        return {
            ok: true,
            path: directory,
            count: entries.length,
            entries: page,
            truncated: offset - 1 + limit < entries.length,
            nextOffset: offset - 1 + limit < entries.length ? offset + limit : 0,
            summary: `${directory} 下有 ${entries.length} 项，返回 ${page.length} 项。`,
        };
    }

    async function executeGlob(args = {}) {
        const pattern = normalizeText(args.pattern || 'book/**', 1000);
        const pathScope = args.path ? assertBookDirectoryPath(args.path) : '';
        const regexp = globToRegExp(pattern);
        const files = await getFiles();
        let paths = files.map((file) => file.path).filter((path) => regexp.test(path));
        if (pathScope) paths = paths.filter((path) => path.startsWith(pathScope));
        paths.sort((left, right) => left.localeCompare(right, 'zh-CN'));
        return {
            ok: true,
            pattern,
            path: pathScope,
            count: paths.length,
            files: paths.slice(0, 300),
            truncated: paths.length > 300,
            summary: `匹配到 ${paths.length} 个文件。`,
        };
    }

    async function executeGrep(args = {}) {
        const pattern = args.pattern ?? args.query ?? '';
        const regexp = buildSearchRegExp(pattern, args.useRegex === true);
        const scope = resolveGrepPathScope(args.path || args.scope || '');
        const include = buildIncludePredicate(args.include || '');
        const outputMode = normalizeGrepOutputMode(args.outputMode);
        const limit = Math.min(MAX_GREP_RESULTS, Math.max(1, Math.floor(Number(args.limit) || MAX_GREP_RESULTS)));
        const offset = Math.max(0, Math.floor(Number(args.offset) || 0));
        const contextLines = Math.min(5, Math.max(0, Math.floor(Number(args.contextLines) || 0)));
        const files = (await getFiles()).filter((file) => {
            if (scope.filePath) return file.path === scope.filePath;
            return (!scope.directory || file.path.startsWith(scope.directory)) && include(file.path);
        });
        const rows = [];
        files.forEach((file) => {
            const lines = splitLines(file.content);
            let matchCount = 0;
            lines.forEach((line, index) => {
                regexp.lastIndex = 0;
                if (!regexp.test(line)) return;
                matchCount += 1;
                if (outputMode === 'content') {
                    const start = Math.max(0, index - contextLines);
                    const end = Math.min(lines.length, index + contextLines + 1);
                    rows.push({
                        path: file.path,
                        lineNumber: index + 1,
                        line,
                        context: numberLines(lines.slice(start, end), start + 1),
                    });
                }
            });
            if (outputMode === 'files_with_matches' && matchCount > 0) {
                rows.push({ path: file.path });
            } else if (outputMode === 'count' && matchCount > 0) {
                rows.push({ path: file.path, count: matchCount });
            }
        });
        const page = rows.slice(offset, offset + limit);
        return {
            ok: true,
            pattern: String(pattern || ''),
            path: scope.filePath || scope.directory,
            outputMode,
            searchedFileCount: files.length,
            count: rows.length,
            results: page,
            truncated: offset + limit < rows.length,
            nextOffset: offset + limit < rows.length ? offset + limit : 0,
            summary: `搜索到 ${rows.length} 项，返回 ${page.length} 项。`,
        };
    }

    async function executeRead(args = {}) {
        const rawPath = String(args.filePath || '').trim();
        if (!rawPath) throw new Error('book_path_required');
        const path = normalizeBookPath(rawPath);
        if (!path) throw new Error(getBookPathError(rawPath, { directory: true }) || 'book_path_required');
        if (path.endsWith('/')) {
            return await executeLs({ path, offset: args.offset, limit: args.limit });
        }
        const filePath = assertBookFilePath(path);
        const file = await getBookFile(await currentBookId(), filePath);
        if (!file) throw new Error('book_file_not_found');
        const lines = splitLines(file.content);
        const tail = Math.floor(Number(args.tail) || 0);
        let startLine = toLineNumber(args.offset, 1);
        let limit = clampLimit(args.limit);
        if (tail > 0) {
            limit = Math.min(MAX_READ_LIMIT, tail);
            startLine = Math.max(1, lines.length - limit + 1);
        }
        const startIndex = Math.max(0, startLine - 1);
        const selected = lines.slice(startIndex, startIndex + limit);
        const nextOffset = startIndex + limit < lines.length ? startIndex + limit + 1 : 0;
        return {
            ok: true,
            path: filePath,
            lineStart: startIndex + 1,
            lineEnd: startIndex + selected.length,
            totalLines: lines.length,
            content: numberLines(selected, startIndex + 1),
            truncated: nextOffset > 0,
            nextOffset,
            summary: `读取 ${filePath} 第 ${startIndex + 1}-${startIndex + selected.length} 行，共 ${lines.length} 行。`,
        };
    }

    async function executeWrite(args = {}) {
        assertWritable();
        const path = assertBookFilePath(args.path || args.filePath);
        const file = await upsertBookFile(await currentBookId(), path, typeof args.content === 'string' ? args.content : String(args.content ?? ''));
        return await attachRefreshWarning({
            ok: true,
            path: file.path,
            bytes: new TextEncoder().encode(file.content).length,
            summary: `已写入 ${file.path}。`,
        });
    }

    async function executeEdit(args = {}) {
        assertWritable();
        const path = assertBookFilePath(args.filePath);
        const edits = args.edits;
        const bookId = await currentBookId();
        const file = await getBookFile(bookId, path);
        if (!file) {
            return {
                ok: false,
                path,
                error: 'file_not_found',
                message: 'File does not exist',
                results: [{
                    ok: false,
                    error: 'file_not_found',
                    message: 'File does not exist',
                }],
                summary: `未找到 ${path}。`,
            };
        }

        const originalContent = file?.content || '';
        const result = applyTextEdits(originalContent, edits);
        const appliedCount = result.results.filter((item) => item.ok && !item.satisfied).length;
        const satisfiedCount = result.results.filter((item) => item.ok && item.satisfied).length;
        const successCount = appliedCount + satisfiedCount;
        const uncertainCount = result.results.filter((item) => !item.ok && item.uncertain).length;
        const failedCount = result.results.length - successCount;
        const definiteFailedCount = failedCount - uncertainCount;
        const changed = result.content !== originalContent;
        if (changed) {
            await upsertBookFile(bookId, path, result.content || '');
            const savedFile = await getBookFile(bookId, path);
            if (!savedFile || savedFile.content !== result.content) {
                return {
                    ok: false,
                    partial: true,
                    path,
                    error: 'edit_persistence_verification_failed',
                    message: 'Edit result was produced, but the saved file did not match the expected content after write verification.',
                    editCount: result.results.length,
                    appliedCount,
                    satisfiedCount: satisfiedCount || undefined,
                    successCount,
                    failedCount,
                    definiteFailedCount,
                    uncertainCount: uncertainCount || undefined,
                    changed: false,
                    expectedBytes: new TextEncoder().encode(result.content || '').length,
                    savedBytes: new TextEncoder().encode(savedFile?.content || '').length,
                    results: result.results,
                    warning: result.warning,
                    summary: `已生成 ${path} 的修改结果，但落盘校验未通过；请重新读取文件确认当前内容。`,
                };
            }
        }
        const toolResult = {
            ok: result.ok,
            partial: result.partial,
            path,
            error: result.ok ? undefined : result.results.find((item) => !item.ok)?.error,
            message: result.ok ? undefined : result.results.find((item) => !item.ok)?.message,
            editCount: result.results.length,
            appliedCount,
            satisfiedCount: satisfiedCount || undefined,
            successCount,
            failedCount,
            definiteFailedCount,
            uncertainCount: uncertainCount || undefined,
            changed,
            results: result.results,
            warning: result.warning,
            summary: result.ok
                ? changed
                    ? satisfiedCount > 0
                        ? `已修改 ${path}，应用 ${appliedCount} 项，另有 ${satisfiedCount} 项已是目标状态。`
                        : `已修改 ${path}，应用 ${appliedCount} 项。`
                    : `已确认 ${path} 的 ${satisfiedCount || appliedCount} 项修改已是目标状态，无需重复写入。`
                : result.partial
                    ? satisfiedCount > 0
                        ? uncertainCount > 0
                            ? `已部分修改 ${path}：成功 ${successCount} 项（应用 ${appliedCount} 项，另有 ${satisfiedCount} 项已是目标状态），需确认 ${uncertainCount} 项，明确失败 ${definiteFailedCount} 项。`
                            : `已部分修改 ${path}：成功 ${successCount} 项（应用 ${appliedCount} 项，另有 ${satisfiedCount} 项已是目标状态），明确失败 ${definiteFailedCount} 项。`
                        : uncertainCount > 0
                            ? `已部分修改 ${path}：成功 ${appliedCount} 项，需确认 ${uncertainCount} 项，明确失败 ${definiteFailedCount} 项；需确认项的目标文本已存在但无法证明目标位置，请重新 Read 确认。`
                            : `已部分修改 ${path}：成功 ${appliedCount} 项，明确失败 ${definiteFailedCount} 项。`
                    : uncertainCount > 0
                        ? `未应用新的修改到 ${path}：${uncertainCount} 项的目标文本已存在但 oldString 未找到，无法证明目标位置已正确；请重新 Read 确认。`
                        : `未修改 ${path}：${result.results[0]?.message || result.results[0]?.error || 'Edit failed'}。`,
        };
        return changed ? await attachRefreshWarning(toolResult) : toolResult;
    }

    async function executeDelete(args = {}) {
        assertWritable();
        const rawPath = String(args.path || '').trim();
        const path = rawPath.endsWith('/')
            ? assertBookDirectoryPath(rawPath)
            : assertBookFilePath(rawPath);
        const deleted = await deleteBookPath(await currentBookId(), path);
        return await attachRefreshWarning({
            ok: true,
            path: deleted.path,
            deletedCount: deleted.deletedCount,
            summary: `已删除 ${deleted.deletedCount} 个文件。`,
        });
    }

    async function executeMove(args = {}) {
        assertWritable();
        const fromRaw = String(args.fromPath || '').trim();
        const toRaw = String(args.toPath || '').trim();
        const files = await getFiles();
        const fromIsDirectory = fromRaw.endsWith('/') || files.some((file) => file.path.startsWith(normalizeBookDirectoryPath(fromRaw)));
        const fromPath = fromIsDirectory ? assertBookDirectoryPath(fromRaw) : assertBookFilePath(fromRaw);
        const toPath = fromIsDirectory ? assertBookDirectoryPath(toRaw) : assertBookFilePath(toRaw);
        if (fromPath === 'book/') throw new Error('book_root_move_forbidden');
        if (fromIsDirectory && toPath !== fromPath && toPath.startsWith(fromPath)) {
            throw new Error('book_move_into_self_forbidden');
        }
        const overwrite = !!args.overwrite;
        const targets = fromIsDirectory
            ? files.filter((file) => file.path.startsWith(fromPath))
            : files.filter((file) => file.path === fromPath);
        if (!targets.length) throw new Error('book_path_not_found');
        const destinationPaths = targets.map((file) => fromIsDirectory ? `${toPath}${file.path.slice(fromPath.length)}` : toPath);
        if (!overwrite) {
            const existing = files.find((file) => destinationPaths.includes(file.path) && !targets.some((target) => target.path === file.path));
            if (existing) throw new Error('book_destination_exists');
        }
        const targetSet = new Set(targets.map((file) => file.path));
        const destinationSet = new Set(destinationPaths);
        const nextFiles = files
            .filter((file) => !targetSet.has(file.path) && (overwrite || !destinationSet.has(file.path)))
            .concat(targets.map((file, index) => ({
                ...file,
                path: destinationPaths[index],
            })));
        await replaceBookFiles(await currentBookId(), nextFiles);
        return await attachRefreshWarning({
            ok: true,
            fromPath,
            toPath,
            movedCount: targets.length,
            summary: `已移动 ${targets.length} 个文件。`,
        });
    }

    return {
        executeLs,
        executeGlob,
        executeGrep,
        executeRead,
        executeWrite,
        executeEdit,
        executeDelete,
        executeMove,
    };
}
