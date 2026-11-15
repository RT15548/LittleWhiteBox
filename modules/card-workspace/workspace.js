import { workspaceRepository } from '../assistant/shared/workspace-repository.js';
import { flattenLocalSourceFiles, upsertLocalSourceFile, removeLocalSourcePath, moveLocalSourcePath, findLocalDirectoryByPath } from '../assistant/shared/local-workspace-kernel.js';
import { INTERNAL_WORKSPACE_TOOL_NAMES } from '../assistant/shared/workspace-protocol.js';
import { buildWorkspacePreconditions } from '../assistant/shared/workspace-preconditions.js';
import { itemDocumentPath, parseItemDocument } from './item-document.js';
import { rootFor } from './paths.js';
import { COPY } from './copy.js';
import { rebaseCardName } from './rename.js';

export async function readFiles() {
    return flattenLocalSourceFiles((await workspaceRepository.readWorkspace()).localSources);
}

// Import uses the existing workspace transaction and conflict check. A receipt
// only advances originalContent; text typed during a server save stays intact.
/**
 * @param {{path: string, content: string, originalGroupHash?: string}[]} files
 * @param {{baselineOnly?: boolean, observed?: ReturnType<typeof buildWorkspacePreconditions> | null, scopeRoot?: string | null, removePaths?: string[]}} [options]
 */
export async function storeFiles(files, { baselineOnly = false, observed = null, scopeRoot = null, removePaths = [] } = {}) {
    const name = scopeRoot ? 'Delete' : INTERNAL_WORKSPACE_TOOL_NAMES.BATCH_WRITE_FILES;
    const args = scopeRoot ? { path: scopeRoot } : { files };
    const sources = (await workspaceRepository.readWorkspace()).localSources;
    const saved = await workspaceRepository.commitWorkspaceMutation({
        name, args,
        preconditions: observed || buildWorkspacePreconditions(name, args, sources),
        execute: async sources => {
            let nextSources = structuredClone(sources);
            for (const path of removePaths) nextSources = removeLocalSourcePath(nextSources, path).nextSources;
            for (const file of files) {
                if (!baselineOnly) nextSources = upsertLocalSourceFile(nextSources, file.path, file.content).nextSources;
                for (const source of nextSources) {
                    const target = source.files?.find(item => item.path === file.path || item.publicPath === file.path);
                    if (target) {
                        target.originalContent = file.content;
                        if (typeof file.originalGroupHash === 'string') target.originalGroupHash = file.originalGroupHash;
                    }
                }
            }
            return { result: { ok: true }, nextSources };
        },
    });
    if (!saved.committed) {
        if (baselineOnly && saved.result.error === 'workspace_conflict') return storeFiles(files, { baselineOnly });
        throw new Error(saved.result.error);
    }
    return saved.localSources;
}

export async function observeTree(path) {
    const { localSources } = await workspaceRepository.readWorkspace();
    return buildWorkspacePreconditions('Delete', { path }, localSources);
}

export async function observePaths(paths) {
    const { localSources } = await workspaceRepository.readWorkspace();
    return buildWorkspacePreconditions(INTERNAL_WORKSPACE_TOOL_NAMES.BATCH_WRITE_FILES, { files: paths.map(path => ({ path })) }, localSources);
}

export async function changeCardDirectory(from, to, readName = async () => undefined) {
    const fromPath = rootFor(from), toPath = to ? rootFor(to) : null;
    const name = to ? 'Move' : 'Delete', args = to ? { fromPath, toPath } : { path: fromPath };
    // Lifecycle operations use the latest complete directory. Editor writes
    // racing the transaction cause a fresh read; the move never freezes a draft.
    for (;;) {
        const sources = (await workspaceRepository.readWorkspace()).localSources;
        const metadataPath = fromPath + 'card.json';
        const card = flattenLocalSourceFiles(sources).find(file => file.path === metadataPath);
        const savedName = to && card ? await readName() : undefined;
        const result = await workspaceRepository.commitWorkspaceMutation({ name, args,
            preconditions: buildWorkspacePreconditions(name, args, sources),
            execute: async current => {
                if (!findLocalDirectoryByPath(current, fromPath)) return { result: { ok: true }, nextSources: current };
                if (to && findLocalDirectoryByPath(current, toPath)) throw new Error(COPY.designMoveConflict);
                let nextSources = to ? moveLocalSourcePath(current, fromPath, toPath).nextSources
                    : removeLocalSourcePath(current, fromPath).nextSources;
                if (to && card) {
                    const rebased = rebaseCardName(card, savedName);
                    nextSources = upsertLocalSourceFile(nextSources, toPath + 'card.json', rebased.content,
                        { originalContent: rebased.originalContent }).nextSources;
                }
                return { result: { ok: true }, nextSources };
            } });
        if (result.committed) return;
        if (result.result.error !== 'workspace_conflict') throw new Error(result.result.error);
    }
}

// The receipt and derived filename move together. A concurrent editor draft is
// kept verbatim; a concurrently deleted file is not resurrected by writeback.
export async function storeItemReceipt(file, content, kind) {
    const sources = (await workspaceRepository.readWorkspace()).localSources;
    const name = INTERNAL_WORKSPACE_TOOL_NAMES.BATCH_WRITE_FILES, args = { files: [{ path: file.path }] };
    const saved = await workspaceRepository.commitWorkspaceMutation({ name, args,
        preconditions: buildWorkspacePreconditions(name, args, sources),
        execute: async localSources => {
            const all = flattenLocalSourceFiles(localSources), current = all.find(item => item.path === file.path);
            if (!current) return { result: { path: file.path, hasUnsavedEdits: true }, nextSources: localSources };
            const unchangedDraft = current.content === file.content;
            const draft = unchangedDraft ? content : current.content;
            let path = file.path;
            if (unchangedDraft) path = itemDocumentPath(path.slice(0, path.lastIndexOf('/') + 1), parseItemDocument(kind, content).name, new Set(all.map(item => item.path)), path);
            let nextSources = path === file.path ? localSources : moveLocalSourcePath(localSources, file.path, path).nextSources;
            nextSources = upsertLocalSourceFile(nextSources, path, draft, { originalContent: content }).nextSources;
            return { result: { path, ...(path !== file.path ? { fromPath: file.path } : {}), hasUnsavedEdits: !unchangedDraft && draft !== content }, nextSources };
        },
    });
    if (!saved.committed) {
        if (saved.result.error === 'workspace_conflict') return storeItemReceipt(file, content, kind);
        throw new Error(saved.result.error);
    }
    return saved.result;
}
