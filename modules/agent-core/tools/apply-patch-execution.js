import { applyPatchUpdateToText, patchError } from './apply-patch.js';

export function buildPatchFailureResult(error) {
    const message = error instanceof Error ? error.message : String(error || 'unknown_error');
    const issue = error?.patchIssue ?? { code: message, message };
    return { ok: false, phase: 'failed', error: issue.code, issue, summary: '补丁未提交，没有修改任何文件。' };
}

export function runPatchValidationAndApply(parsedPatch, initialState, adapter) {
    // Adapter mutations return new snapshots. The repository commits only the
    // final snapshot, after all file operations and edits have succeeded.
    let nextState = initialState;
    const changes = [];
    const counts = { addedCount: 0, updatedCount: 0, deletedCount: 0, movedCount: 0, editsApplied: 0 };
    const changedPaths = new Set();
    const editedPaths = new Set();
    const normalize = rawPath => {
        const path = adapter.normalizePath(rawPath);
        if (!path) throw new Error(adapter.getPathError(rawPath) || 'local_path_required');
        return path;
    };

    parsedPatch.operations.forEach((operation, fileIndex) => {
        let path = operation.path;
        try {
            path = normalize(path);
            const existing = adapter.findFile(nextState, path);
            if (operation.type === 'add') {
                if (existing) throw new Error('local_destination_exists');
                nextState = adapter.addFile(nextState, path, operation.content).nextSources;
                changes.push({ action: 'add', path });
                changedPaths.add(path);
                counts.addedCount++;
                return;
            }
            if (!existing) throw new Error('local_file_not_found');
            if (operation.type === 'delete') {
                nextState = adapter.removeFile(nextState, path).nextSources;
                changes.push({ action: 'delete', path });
                changedPaths.add(path);
                counts.deletedCount++;
                return;
            }

            const target = operation.moveTo ? normalize(operation.moveTo) : path;
            let applied;
            if (operation.edits.length) {
                if (editedPaths.has(path) || editedPaths.has(target)) {
                    throw patchError('duplicate_file_edits', 'Group edits to the same file in one files entry.');
                }
                applied = applyPatchUpdateToText(existing.content, operation.edits, path);
                editedPaths.add(path);
                editedPaths.add(target);
            }
            if (target !== path) {
                nextState = adapter.moveFile(nextState, path, target, { overwrite: false }).nextSources;
                changes.push({ action: 'move', path: target, fromPath: path, toPath: target });
                changedPaths.add(path);
                changedPaths.add(target);
                counts.movedCount++;
            }
            if (applied && applied.content !== existing.content) {
                nextState = adapter.writeFile(nextState, target, applied.content).nextSources;
                changes.push({ action: 'update', path: target, edits: applied.results });
                changedPaths.add(target);
                counts.updatedCount++;
                counts.editsApplied += applied.results.length;
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            const { code = message, ...issue } = error?.patchIssue ?? {};
            throw patchError(code, message, { path, fileIndex, ...issue });
        }
    });

    const filesChanged = changedPaths.size;
    return {
        ok: true,
        phase: filesChanged ? 'applied' : 'unchanged',
        summary: filesChanged ? `补丁已应用，涉及 ${filesChanged} 个路径。` : '补丁未产生文件变更。',
        filesChanged,
        ...counts,
        changes,
        nextState,
    };
}
