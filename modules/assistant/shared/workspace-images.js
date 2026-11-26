import { createIdentifier } from '../../../shared/common/identifier.js';
import {
    assertAvailableWorkspaceImagePath,
    getWorkspaceImageMimeType,
    insertWorkspaceImageFile,
    normalizeLocalSourceFile,
    normalizeWorkspaceImagePath,
    normalizeWritableLocalFilePath,
    upsertLocalSourceFile,
} from './local-workspace-kernel.js';
import { buildWorkspacePreconditions } from './workspace-preconditions.js';
import { INTERNAL_WORKSPACE_TOOL_NAMES } from './workspace-protocol.js';
import { workspaceRepository } from './workspace-repository.js';

const BATCH = INTERNAL_WORKSPACE_TOOL_NAMES.BATCH_WRITE_FILES;

function imageBatchPaths(paths) {
    if (!Array.isArray(paths) || !paths.length) throw new Error('workspace_batch_files_required');
    const seen = new Set();
    const normalized = paths.map(path => {
        const canonical = normalizeWorkspaceImagePath(path);
        if (!canonical) throw new Error('workspace_image_path_invalid');
        if (seen.has(canonical)) throw new Error('local_destination_exists');
        seen.add(canonical);
        return canonical;
    });
    for (const path of normalized) {
        const segments = path.split('/');
        for (let index = 2; index < segments.length; index += 1) {
            if (seen.has(segments.slice(0, index).join('/'))) throw new Error('local_parent_path_blocked');
        }
    }
    return normalized;
}

function observeImageBatch(sources, paths) {
    const files = paths.map(path => ({ path: assertAvailableWorkspaceImagePath(sources, path) }));
    return buildWorkspacePreconditions(BATCH, { files }, sources);
}

// Synchronous staging only: the caller commits this delta with its workspace row.
export function stageWorkspaceImageBatch(sources, entries) {
    let nextSources = sources;
    const files = [], newImageBlobs = new Map(), seen = new Set();
    for (const entry of entries) {
        const isImage = Object.hasOwn(entry, 'blob');
        const path = isImage ? normalizeWorkspaceImagePath(entry.path) : normalizeWritableLocalFilePath(entry.path);
        if (!path) throw new Error(isImage ? 'workspace_image_path_invalid' : 'unsupported_text_file');
        if (seen.has(path)) throw new Error('local_destination_exists');
        seen.add(path);
        let staged;
        if (isImage) {
            const { blob } = entry;
            if (!(blob instanceof Blob) || !blob.size || blob.type !== getWorkspaceImageMimeType(path)) {
                throw new Error('workspace_image_format_invalid');
            }
            const blobId = createIdentifier();
            staged = insertWorkspaceImageFile(nextSources, path, { blobId, mimeType: blob.type, sizeBytes: blob.size });
            newImageBlobs.set(blobId, blob);
        } else {
            if (typeof entry.content !== 'string') throw new Error('workspace_text_content_required');
            staged = upsertLocalSourceFile(nextSources, path, entry.content);
        }
        files.push(staged.file);
        nextSources = staged.nextSources;
    }
    return { files, nextSources, newImageBlobs };
}

// Observe the exact bytes identity written/read by the successful tool, not a
// fresh path lookup that could race a subsequent rename or replacement.
export function workspaceImageObservations(files) {
    const observations = new Map();
    for (const input of files) {
        const file = normalizeLocalSourceFile(input);
        const parts = file.path.split('/');
        for (let index = 1; index < parts.length; index += 1) {
            const path = parts.slice(0, index).join('/');
            if (!observations.has(path)) observations.set(path, { path, scope: 'entry', expected: { kind: 'directory' } });
        }
        observations.set(file.path, { path: file.path, scope: 'entry', expected: { kind: 'file', file } });
    }
    return [...observations.values()];
}

export function createWorkspaceImageAccess(repository = workspaceRepository) {
    async function observeWorkspaceImagePaths(paths) {
        const normalized = imageBatchPaths(paths);
        return observeImageBatch((await repository.readWorkspace()).localSources, normalized);
    }

    async function writeWorkspaceImages(entries, { signal, preconditions } = {}) {
        if (signal?.aborted) throw new Error('tool_aborted');
        const paths = imageBatchPaths(entries?.map(entry => entry.path));
        const files = paths.map((path, index) => ({ path, blob: entries[index].blob }));
        const saved = await repository.commitWorkspaceMutation({
            name: BATCH, args: { files }, signal,
            preconditions: preconditions ?? await observeWorkspaceImagePaths(paths),
            execute: sources => {
                const staged = stageWorkspaceImageBatch(sources, files);
                return { ...staged, result: { ok: true, files: staged.files } };
            },
        });
        if (!saved.committed) throw Object.assign(new Error(saved.result.error), { conflictPaths: saved.result.conflictPaths });
        return saved.result.files;
    }

    return {
        readWorkspaceImage: repository.readWorkspaceImage,
        readWorkspaceImageById: repository.readWorkspaceImageById,
        observeWorkspaceImagePaths,
        writeWorkspaceImages,
    };
}

export const { readWorkspaceImage, readWorkspaceImageById, observeWorkspaceImagePaths, writeWorkspaceImages } = createWorkspaceImageAccess();
