import { createPlanLedger } from '../../agent-core/plan-ledger.js';
import { isTavilyConfigured, runTavilySearchTool } from '../../agent-core/tavily-search.js';
import { ebookPlansTable, iterateBookFiles, listBookFilePaths, listBookFiles, renameBook } from './ebook-db.js';
import { createBookFileToolHandlers, collectDirectoryEntries } from './book-file-tools.js';
import {
    EBOOK_TOOL_NAMES,
    describeEbookToolCall,
    getEbookToolDefinitions,
} from './tool-definitions.js';

const planLedger = createPlanLedger({ plansTable: ebookPlansTable });

function safeJsonStringify(value) {
    try {
        return JSON.stringify(value, null, 2);
    } catch {
        return String(value || '');
    }
}

function getFailurePath(args = {}) {
    if (typeof args?.path === 'string') return args.path;
    if (typeof args?.filePath === 'string') return args.filePath;
    if (typeof args?.fromPath === 'string') return args.fromPath;
    return '';
}

export function buildEbookToolFailureResult(toolName = '', args = {}, error) {
    const raw = String(error?.message || error || 'ebook_tool_failed');
    const [code] = raw.split(':');
    return {
        ok: false,
        toolName: String(toolName || ''),
        path: getFailurePath(args),
        error: code || 'ebook_tool_failed',
        raw,
        message: raw,
    };
}

export function createBookToolRuntime(options = {}) {
    const getBookId = typeof options.getBookId === 'function' ? options.getBookId : () => options.bookId;
    const onFilesChanged = typeof options.onFilesChanged === 'function' ? options.onFilesChanged : null;
    const runDelegate = typeof options.runDelegate === 'function' ? options.runDelegate : null;
    const getSearchConfig = typeof options.getSearchConfig === 'function'
        ? options.getSearchConfig
        : () => options.searchConfig || {};
    const readOnly = !!options.readOnly;

    async function currentBookId() {
        const id = String(await getBookId() || '').trim();
        if (!id) throw new Error('book_required');
        return id;
    }

    async function getFiles() {
        return await listBookFiles(await currentBookId());
    }

    async function listPaths() {
        return await listBookFilePaths(await currentBookId());
    }

    async function* iterateFiles() {
        yield* iterateBookFiles(await currentBookId());
    }

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

    const fileTools = createBookFileToolHandlers({
        currentBookId,
        getFiles,
        listPaths,
        iterateFiles,
        onFilesChanged,
        readOnly,
        signal: options.signal,
    });

    async function execute(name = '', args = {}) {
        const bookId = await currentBookId();
        switch (name) {
            case EBOOK_TOOL_NAMES.LS:
                return await fileTools.executeLs(args);
            case EBOOK_TOOL_NAMES.GLOB:
                return await fileTools.executeGlob(args);
            case EBOOK_TOOL_NAMES.GREP:
                return await fileTools.executeGrep(args);
            case EBOOK_TOOL_NAMES.READ:
                return await fileTools.executeRead(args);
            case EBOOK_TOOL_NAMES.WEB_SEARCH:
                return await runTavilySearchTool(getSearchConfig(), args, {
                    signal: options.signal,
                    isAbortError: options.isAbortError,
                });
            case EBOOK_TOOL_NAMES.WRITE:
                return await fileTools.executeWrite(args);
            case EBOOK_TOOL_NAMES.EDIT:
                return await fileTools.executeEdit(args);
            case EBOOK_TOOL_NAMES.DELETE:
                return await fileTools.executeDelete(args);
            case EBOOK_TOOL_NAMES.MOVE:
                return await fileTools.executeMove(args);
            case EBOOK_TOOL_NAMES.PLAN_CREATE:
            case EBOOK_TOOL_NAMES.PLAN_UPDATE:
            case EBOOK_TOOL_NAMES.PLAN_LIST:
            case EBOOK_TOOL_NAMES.PLAN_GET:
                assertWritable();
                return await planLedger.execute(name, bookId, args);
            case EBOOK_TOOL_NAMES.RENAME_BOOK: {
                assertWritable();
                const book = await renameBook(bookId, args.title);
                return await attachRefreshWarning({
                    ok: true,
                    book,
                    title: book.title,
                    summary: `书名已改为《${book.title}》。`,
                });
            }
            case EBOOK_TOOL_NAMES.DELEGATE_RUN:
                assertWritable();
                if (!runDelegate) throw new Error('delegate_unavailable');
                return await runDelegate(args);
            default:
                return {
                    ok: false,
                    error: 'ebook_tool_not_available',
                    toolName: name,
                    message: `电纸书没有开放 ${name}。`,
                };
        }
    }

    return {
        execute,
        getFiles,
        getToolDefinitions: () => getEbookToolDefinitions({
            readOnly,
            webSearchEnabled: isTavilyConfigured(getSearchConfig()),
        }),
    };
}

export function formatEbookToolResult(result = {}) {
    if (!result || typeof result !== 'object') return String(result || '');
    return result.summary || result.message || result.error || safeJsonStringify(result).slice(0, 600);
}

export {
    EBOOK_TOOL_NAMES,
    collectDirectoryEntries,
    describeEbookToolCall,
    getEbookToolDefinitions,
    planLedger as ebookPlanLedger,
};
