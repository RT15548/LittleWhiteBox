import { TOOL_NAMES } from '../app-src/tooling.js';
import { readableCardWorkspacePath, readableCardWorkspaceRelativePath, storedCardWorkspacePath } from '../../card-workspace/paths.js';

const TOOL_PATH_FIELDS = new Map([
    [TOOL_NAMES.CARD_FILES, ['paths', 'sourcePath']],
    [TOOL_NAMES.CARD_ASSETS, ['rootPath', 'taskPath', 'sourcePath']],
    [TOOL_NAMES.READ_IMAGE, ['path']],
    [TOOL_NAMES.DRAW_IMAGE, ['outputDir']],
    [TOOL_NAMES.SAVE_DRAW_IMAGES, ['outputDir']],
    [TOOL_NAMES.LS, ['path']],
    [TOOL_NAMES.GLOB, ['path']],
    [TOOL_NAMES.GREP, ['path']],
    [TOOL_NAMES.READ, ['filePath', 'path']],
    [TOOL_NAMES.WRITE, ['filePath', 'path']],
    [TOOL_NAMES.DELETE, ['path']],
    [TOOL_NAMES.MOVE, ['fromPath', 'toPath']],
    [TOOL_NAMES.APPLY_PATCH, []],
]);
const RESULT_PATH_FIELDS = new Set(['path', 'publicPath', 'filePath', 'directoryPath', 'root', 'rootPath', 'searchPath', 'fromPath', 'toPath', 'taskPath', 'sourcePath', 'outputDir']);
const RESULT_PATH_LISTS = new Set(['paths', 'suggestions', 'skippedPaths', 'conflictPaths']);
const DIAGNOSTIC_FIELDS = new Set(['error', 'raw', 'message', 'suggestion', 'summary']);
const RESULT_RECORDS = new Set(['items', 'files', 'results', 'changes', 'readErrors', 'validation', 'issue', 'images', 'tasks', 'assets', 'asset']);

// Model/host boundary only. UI writes, repository snapshots and conflict
// observations retain their stored paths and never enter this adapter.
export async function callReadableWorkspaceTool(name, args, callHost) {
    const fields = TOOL_PATH_FIELDS.get(name);
    if (!fields) return callHost(args);
    const paths = new Map();
    const readable = path => {
        const result = readableCardWorkspacePath(path);
        if (result !== path) paths.set(path, result);
        return result;
    };
    const stored = path => {
        const result = storedCardWorkspacePath(path);
        readable(result);
        return result;
    };
    const hostArgs = { ...args };
    for (const field of fields) {
        if (typeof args[field] === 'string') hostArgs[field] = stored(args[field]);
        else if (Array.isArray(args[field])) hostArgs[field] = args[field].map(stored);
    }
    if (name === TOOL_NAMES.APPLY_PATCH && Array.isArray(args.files)) {
        hostArgs.files = args.files.map((file) => {
            if (!file || typeof file !== 'object' || Array.isArray(file)) return file;
            return {
                ...file,
                ...(typeof file.path === 'string' ? { path: stored(file.path.trim()) } : {}),
                ...(typeof file.moveTo === 'string' ? { moveTo: stored(file.moveTo.trim()) } : {}),
            };
        });
    }

    function project(value) {
        if (!value || typeof value !== 'object') return value;
        if (Array.isArray(value)) return value.map(project);
        const result = { ...value };
        for (const [key, item] of Object.entries(value)) {
            if (RESULT_PATH_FIELDS.has(key) && typeof item === 'string') result[key] = readable(item);
            else if (RESULT_PATH_LISTS.has(key) && Array.isArray(item)) result[key] = item.map(readable);
            else if (RESULT_RECORDS.has(key)) result[key] = project(item);
        }
        const fullPath = value.publicPath || value.path;
        if (typeof fullPath === 'string') {
            if (typeof value.relativePath === 'string') result.relativePath = readableCardWorkspaceRelativePath(fullPath, value.relativePath);
            if (value.name === fullPath.split('/').at(-1)) result.name = readable(fullPath).split('/').at(-1);
        }
        if (value.contentFormat === 'directory_entries' && typeof value.content === 'string') {
            result.content = value.content.split('\n').map(entry => {
                const parent = value.path.endsWith('/') ? value.path : value.path + '/';
                return readable(parent + entry).slice(readable(parent).length);
            }).join('\n');
        }
        return result;
    }
    const diagnostic = text => {
        // Replace only paths discovered in arguments/results, never file text.
        const entries = [...paths].sort(([a], [b]) => b.length - a.length);
        if (!entries.length) return text;
        const pattern = entries.map(([path]) => path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
        return text.replace(new RegExp(pattern, 'g'), path => paths.get(path));
    };
    function projectDiagnostics(value) {
        if (!value || typeof value !== 'object') return value;
        if (Array.isArray(value)) return value.map(projectDiagnostics);
        return Object.fromEntries(Object.entries(value).map(([key, item]) => [key,
            DIAGNOSTIC_FIELDS.has(key) && typeof item === 'string' ? diagnostic(item)
                : RESULT_RECORDS.has(key) ? projectDiagnostics(item) : item,
        ]));
    }
    try {
        return projectDiagnostics(project(await callHost(hostArgs)));
    } catch (error) {
        if (error instanceof Error) {
            error.message = diagnostic(error.message);
            if (error.patchIssue) error.patchIssue = projectDiagnostics(project(error.patchIssue));
        }
        throw error;
    }
}
