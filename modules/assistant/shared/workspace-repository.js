import db, { workspaceImageBlobsTable, workspaceTable } from './session-db.js';
import { normalizeWorkspaceState, normalizeWorkspaceUiState, WORKSPACE_RECORD_ID } from './workspace-state.js';
import { findLocalSourceFileByPath, normalizeLocalSources, validateLocalSourcesSnapshot } from './local-workspace-kernel.js';
import { applyWorkspaceObservations, findWorkspaceConflicts, reconcileEditorWriteRetry, WORKSPACE_CONFLICT } from './workspace-preconditions.js';

function imageReferences(sources) {
    return new Map(sources.flatMap(source => source.files.filter(file => file.kind === 'image')
        .map(file => [file.blobId, file])));
}

export function createWorkspaceRepository(database = db) {
    const table = database.table(workspaceTable.name);
    const imageTable = database.table(workspaceImageBlobsTable.name);

    async function readWorkspaceImageById(id) {
        const entry = await imageTable.get(id);
        if (!entry) throw new Error('workspace_image_blob_not_found');
        return entry.blob;
    }

    async function readWorkspaceImage(path) {
        return database.transaction('r', table, imageTable, async () => {
            const { localSources } = await readWorkspace();
            const file = findLocalSourceFileByPath(path, localSources);
            if (!file) throw new Error('local_file_not_found');
            if (file.kind !== 'image') throw new Error('workspace_image_required');
            return { file, blob: await readWorkspaceImageById(file.blobId) };
        });
    }

    async function readWorkspace() {
        return normalizeWorkspaceState(await table.get(WORKSPACE_RECORD_ID));
    }

    async function saveWorkspaceUiState(value) {
        const ui = normalizeWorkspaceUiState(value);
        await database.transaction('rw', table, async () => {
            const current = await table.get(WORKSPACE_RECORD_ID);
            await table.put({ ...normalizeWorkspaceState(current), ...ui, id: WORKSPACE_RECORD_ID, updatedAt: Date.now() });
        });
    }

    async function commitWorkspaceMutation({ name, args, preconditions, execute, signal, retryContent }) {
        return database.transaction('rw', table, imageTable, async () => {
            const current = normalizeWorkspaceState(await table.get(WORKSPACE_RECORD_ID));
            if (signal?.aborted) throw new Error('tool_aborted');
            let conflictPaths = findWorkspaceConflicts(name, args, preconditions, current.localSources);
            let replaySources = null;
            if (conflictPaths.length && name === 'Write' && typeof retryContent === 'string') {
                const reconciled = reconcileEditorWriteRetry(args.path ?? args.filePath, retryContent, preconditions, current.localSources);
                conflictPaths = findWorkspaceConflicts(name, args, reconciled, current.localSources);
                if (!conflictPaths.length && reconciled !== preconditions && args.content === retryContent) {
                    // Recreate the original receipt with the existing handler,
                    // without rewriting a confirmed file or its original content.
                    replaySources = applyWorkspaceObservations(current.localSources, preconditions);
                }
            }
            if (conflictPaths.length) return {
                result: { ok: false, error: WORKSPACE_CONFLICT, conflictPaths },
                conflictSnapshot: current.localSources,
                committed: false,
            };
            // Mutation handlers stage changes from this snapshot only; no fetch,
            // UI callback, or host message may run inside this transaction.
            const { result, nextSources, newImageBlobs } = await execute(replaySources ?? current.localSources);
            if (signal?.aborted) throw new Error('tool_aborted');
            if (result?.ok === false || nextSources === null) return { result, committed: false };
            if (replaySources) return { result, committed: true, localSources: current.localSources };
            const localSources = normalizeLocalSources(nextSources);
            const validation = validateLocalSourcesSnapshot(localSources);
            if (!validation.ok) throw new Error('workspace_invariant_failed');
            const previousImages = imageReferences(current.localSources);
            const nextImages = imageReferences(localSources);
            for (const [id, file] of nextImages) {
                const previous = previousImages.get(id);
                if (previous) {
                    if (previous.mimeType !== file.mimeType || previous.sizeBytes !== file.sizeBytes) throw new Error('workspace_invariant_failed');
                    continue;
                }
                const blob = newImageBlobs?.get(id);
                if (!(blob instanceof Blob) || blob.type !== file.mimeType || blob.size !== file.sizeBytes) {
                    throw new Error('workspace_image_blob_required');
                }
                await imageTable.add({ id, blob });
            }
            const removedIds = [...previousImages.keys()].filter(id => !nextImages.has(id));
            if (removedIds.length) await imageTable.bulkDelete(removedIds);
            if (signal?.aborted) throw new Error('tool_aborted');
            await table.put({ ...current, localSources, id: WORKSPACE_RECORD_ID, updatedAt: Date.now() });
            if (signal?.aborted) throw new Error('tool_aborted');
            return { result, committed: true, localSources };
        });
    }

    return { readWorkspace, saveWorkspaceUiState, commitWorkspaceMutation, readWorkspaceImage, readWorkspaceImageById };
}

export const workspaceRepository = createWorkspaceRepository();
