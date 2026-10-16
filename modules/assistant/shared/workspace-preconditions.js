import { parseApplyPatch } from '../../agent-core/tools/apply-patch.js';
import {
    collectSourceDirectoryPaths,
    findLocalDirectoryByPath,
    findLocalFileByPath,
    flattenLocalSourceFiles,
    normalizeLocalSourceFile,
    normalizeLocalSourcePath,
    normalizeLocalSources,
    removeLocalSourcePath,
    upsertLocalSourceDirectory,
    upsertLocalSourceFile,
} from './local-workspace-kernel.js';

export const WORKSPACE_CONFLICT = 'workspace_conflict';

function canonicalPath(path) {
    return normalizeLocalSourcePath(path).replace(/\/+$/, '');
}

// Scopes describe the operation, not a cached whole-workspace version.
export function workspaceMutationScopes(name, args = {}) {
    const scopes = new Map();
    function add(rawPath, scope = 'entry') {
        const path = canonicalPath(rawPath);
        if (path !== 'local' && !path.startsWith('local/')) throw new Error('local_path_required');
        const rank = { parent: 0, entry: 1, tree: 2 };
        if (!scopes.has(path) || rank[scope] > rank[scopes.get(path)]) scopes.set(path, scope);
        const parts = path.split('/');
        for (let i = 1; i < parts.length; i++) {
            const parent = parts.slice(0, i).join('/');
            if (!scopes.has(parent)) scopes.set(parent, 'parent');
        }
    }
    switch (name) {
        case 'Write': add(args.path ?? args.filePath); break;
        case 'BatchWriteFiles':
            if (!Array.isArray(args.files) || !args.files.length) throw new Error('workspace_batch_files_required');
            args.files.forEach(file => add(file.path));
            break;
        case 'CreateDirectory': add(args.path); break;
        case 'Delete': add(args.path, 'tree'); break;
        case 'Move': add(args.fromPath, 'tree'); add(args.toPath, 'tree'); break;
        case 'apply_patch':
            parseApplyPatch(String(args.patchText ?? args.input ?? '')).operations.forEach(operation => {
                add(operation.path);
                if (operation.moveTo) add(operation.moveTo);
            });
            break;
        default: throw new Error('workspace_mutation_required');
    }
    return Array.from(scopes, ([path, scope]) => ({ path, scope }))
        .sort((a, b) => a.path.localeCompare(b.path));
}

export function captureWorkspacePath(sources, path, scope = 'entry') {
    const file = findLocalFileByPath(sources, path)?.file;
    if (file) return { kind: 'file', file: normalizeLocalSourceFile(file) };
    const directory = findLocalDirectoryByPath(sources, `${path}/`);
    if (!directory) return { kind: 'absent' };
    if (scope !== 'tree') return { kind: 'directory' };
    const prefix = `${path}/`;
    const directories = new Set();
    normalizeLocalSources(sources).forEach(source => {
        const root = canonicalPath(source.rootPath);
        if (root === path || root.startsWith(prefix)) directories.add(root);
        collectSourceDirectoryPaths(source).forEach(relative => {
            const child = canonicalPath(`${source.rootPath}${relative}`);
            if (child === path || child.startsWith(prefix)) directories.add(child);
        });
    });
    return {
        kind: 'directory',
        directories: Array.from(directories).sort(),
        files: flattenLocalSourceFiles(sources).filter(item => item.path.startsWith(prefix))
            .map(normalizeLocalSourceFile).sort((a, b) => a.path.localeCompare(b.path)),
    };
}

export function buildWorkspacePreconditions(name, args, sources) {
    return workspaceMutationScopes(name, args).map(({ path, scope }) => ({
        path, scope, expected: captureWorkspacePath(sources, path, scope),
    }));
}

export function findWorkspaceConflicts(name, args, preconditions, currentSources) {
    if (!Array.isArray(preconditions)) throw new Error('workspace_preconditions_required');
    return workspaceMutationScopes(name, args).filter(({ path, scope }) => {
        const condition = preconditions.find(item => item.path === path && item.scope === scope);
        if (!condition?.expected) throw new Error('workspace_preconditions_required');
        const current = captureWorkspacePath(currentSources, path, scope);
        // Another operation may create a shared parent for a different file.
        if (scope === 'parent' && condition.expected.kind === 'absent' && current.kind === 'directory') return false;
        return JSON.stringify(condition.expected) !== JSON.stringify(current);
    }).map(item => item.path);
}

// An explicit editor retry may follow a committed write whose receipt was lost.
// Accept only that exact normalized post-write file; keep all parent guards.
export function reconcileEditorWriteRetry(path, content, preconditions, currentSources) {
    const target = canonicalPath(path);
    const before = applyWorkspaceObservations([], preconditions);
    const after = upsertLocalSourceFile(before, target, content).nextSources;
    const current = captureWorkspacePath(currentSources, target);
    if (JSON.stringify(current) !== JSON.stringify(captureWorkspacePath(after, target))) return preconditions;
    return preconditions.map(item => item.path === target && item.scope === 'entry'
        ? { ...item, expected: current } : item);
}

// Change only paths actually read/committed, not unrelated files in a run's view.
export function applyWorkspaceObservations(sources, observations = []) {
    let next = normalizeLocalSources(sources);
    for (const { path, scope, expected } of observations) {
        if (scope === 'parent') continue;
        const existing = captureWorkspacePath(next, path);
        if (scope === 'tree' || expected.kind !== 'directory') {
            if (existing.kind !== 'absent') next = removeLocalSourcePath(next, path).nextSources;
        }
        if (expected.kind === 'directory') {
            if (path !== 'local') next = upsertLocalSourceDirectory(next, `${path}/`).nextSources;
            for (const directory of expected.directories || []) {
                if (directory !== 'local') next = upsertLocalSourceDirectory(next, `${directory}/`).nextSources;
            }
        }
        const files = expected.kind === 'file' ? [expected.file] : expected.files || [];
        for (const file of files) {
            next = upsertLocalSourceFile(next, file.path, file.content, { originalContent: file.originalContent }).nextSources;
            next = next.map(source => ({ ...source, files: source.files.map(item => item.path === file.path ? file : item) }));
        }
    }
    return normalizeLocalSources(next);
}
