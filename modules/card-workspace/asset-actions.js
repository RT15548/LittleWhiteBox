import { createIdentifier } from '../../shared/common/identifier.js';
import { findLocalFileByPath, flattenLocalSourceFiles, normalizeLocalSourceFile } from '../assistant/shared/local-workspace-kernel.js';
import { buildWorkspacePreconditions, WORKSPACE_CONFLICT } from '../assistant/shared/workspace-preconditions.js';
import { INTERNAL_WORKSPACE_TOOL_NAMES } from '../assistant/shared/workspace-protocol.js';
import { stageWorkspaceImageBatch, workspaceImageObservations } from '../assistant/shared/workspace-images.js';
import { COPY } from './copy.js';
import { CARD_FILE, locateFile, rootFor } from './files.js';
import { serializeItemDocument } from './item-document.js';
import { inspectAssetTaskDocuments, readAssetTaskDocument } from './asset-documents.js';
import { ASSET_FIELD, assetCommands, assetRuntime, inspectDraftAssets, assetWorkspacePath, blobForSavedAsset, equalAssetSummary, findSavedAsset, isAssetKey, isAssetLoader, summarizeAssetBlob } from './asset-task.js';

const BATCH = INTERNAL_WORKSPACE_TOOL_NAMES.BATCH_WRITE_FILES;
const tasksOf = data => data.extensions?.['xiaobaix-tasks']?.tasks;

// Observation, preparation and commit are split so no byte hashing, network,
// or callback runs inside the workspace transaction. The image and its draft
// reference commit together; no orphan is created if an editor wins the race.
export function createCardAssetActions({ repository, readCharacter }) {
    const { readWorkspace, readWorkspaceImage, commitWorkspaceMutation } = repository;
    async function commit(sources, entries, paths, { signal, onWorkspaceObserved }) {
        const args = { files: [...new Set([...paths, ...entries.map(entry => entry.path)])].map(path => ({ path })) };
        const outcome = await commitWorkspaceMutation({ name: BATCH, args, signal, preconditions: buildWorkspacePreconditions(BATCH, args, sources),
            execute: current => ({ ...stageWorkspaceImageBatch(current, entries), result: { ok: true } }),
        });
        if (!outcome.committed) throw Object.assign(new Error(outcome.result.error), { conflictPaths: outcome.result.conflictPaths });
        const files = args.files.map(({ path }) => findLocalFileByPath(outcome.localSources, path).file);
        const observations = workspaceImageObservations(files.filter(file => file.kind === 'image'));
        for (const { path } of entries.filter(entry => !Object.hasOwn(entry, 'blob'))) {
            const file = findLocalFileByPath(outcome.localSources, path).file;
            const before = findLocalFileByPath(sources, path)?.file;
            observations.push({ path, scope: 'entry', expected: { kind: 'file', file: normalizeLocalSourceFile(file) },
                ...(before?.kind !== 'image' && before?.content !== undefined ? { submitted: { path, content: before.content } } : {}) });
        }
        if (observations.length) onWorkspaceObserved?.(observations);
        return outcome.localSources;
    }

    async function pin(root, asset, blob, sources) {
        const path = assetWorkspacePath(root, asset);
        const existing = findLocalFileByPath(sources, path)?.file;
        if (!existing) return { path, entry: { path, blob } };
        const current = await readWorkspaceImage(path);
        if (current.file.blobId !== existing.blobId || !equalAssetSummary(await summarizeAssetBlob(asset.key, current.blob), asset)) {
            throw new Error(COPY.assetInvalid);
        }
        return { path, file: current.file };
    }

    return async function run(args, avatar, options = {}) {
        const { action, rootPath, taskPath, key, sourcePath } = args;
        const root = rootFor(avatar);
        if (rootPath !== root) throw new Error(COPY.changedCard);
        const { localSources: sources } = await readWorkspace();
        if (!findLocalFileByPath(sources, root + CARD_FILE)) throw new Error(COPY.assetOpenRequired);
        const target = taskPath && locateFile(taskPath);
        if (taskPath && (target?.kind !== 'tasks' || target.root !== root)) throw new Error(COPY.assetTaskPath);
        const byPath = path => findLocalFileByPath(sources, path)?.file;
        const file = taskPath ? byPath(taskPath) : undefined;
        if (action === 'list') {
            if (taskPath && !file) throw new Error(COPY.missing);
            const files = taskPath ? [file] : flattenLocalSourceFiles(sources).filter(file => file.path.startsWith(`${root}tasks/`) && locateFile(file.path)?.kind === 'tasks');
            const { tasks, errors } = inspectAssetTaskDocuments(files);
            const status = errors.length ? (tasks.length ? 'partial' : 'failed') : 'success';
            return { ok: !errors.length, status, tasks, errors, ...(errors.length ? { message: COPY.assetListIncomplete } : {}) };
        }
        if (!['set', 'remove', 'read'].includes(action)) throw new Error(COPY.unsupported);
        if (!taskPath) throw new Error(COPY.assetTaskPath);
        if (!isAssetKey(key)) throw new Error(COPY.assetKey);
        if (!file && action !== 'set') throw new Error(COPY.missing);
        let task;
        if (file) {
            task = readAssetTaskDocument(file);
            if (!isAssetLoader(task)) throw new Error(COPY.assetTaskRequired);
        } else {
            const id = createIdentifier();
            task = { id, name: decodeURIComponent(target.relative.slice('tasks/'.length, -3)), commands: assetCommands(id),
                disabled: false, interval: 1, floorType: 'all', triggerTiming: 'chat_changed', x: { [ASSET_FIELD]: [] } };
        }
        const runtime = assetRuntime(task.id), assets = task.x[ASSET_FIELD];
        if (!Array.isArray(assets)) throw new Error(COPY.assetInvalid);
        const index = assets.findIndex(asset => asset?.key === key), existing = assets[index];
        const issues = inspectDraftAssets(task).errors.filter(issue => issue.key === key);
        if (issues.length > 1 || (action === 'read' && issues.length)) throw new Error(issues[0].error);
        if (action === 'read') {
            if (!existing) throw new Error(COPY.assetMissing);
            const path = assetWorkspacePath(root, existing);
            let image = byPath(path);
            if (image) image = (await pin(root, existing, null, sources)).file;
            else {
                const card = await readCharacter(avatar, options.signal);
                const saved = findSavedAsset(tasksOf(card.data)?.find(item => item.id === task.id), existing);
                if (!saved) throw new Error(COPY.assetMissing);
                const blob = await blobForSavedAsset(saved);
                const committed = await commit(sources, [{ path, blob }], [taskPath], { signal: options.signal });
                image = findLocalFileByPath(committed, path).file;
            }
            options.onWorkspaceObserved?.(workspaceImageObservations([image]));
            return { ok: true, asset: existing, runtime, images: [image] };
        }
        if (action === 'remove') {
            if (!existing) return { ok: true, runtime, taskPath, draft: true, requiresWriteback: true, unchanged: true };
            assets.splice(index, 1);
        }
        const entries = [], guards = [];
        let asset = existing;
        if (action === 'set') {
            const { blob, file } = await readWorkspaceImage(sourcePath);
            if (file.blobId !== byPath(sourcePath)?.blobId) throw Object.assign(new Error(WORKSPACE_CONFLICT), { conflictPaths: [sourcePath] });
            asset = await summarizeAssetBlob(key, blob);
            const same = existing && equalAssetSummary(existing, asset);
            const pinned = await pin(root, asset, blob, sources);
            guards.push(pinned.path);
            if (pinned.entry) entries.push(pinned.entry);
            if (same) {
                if (entries.length) await commit(sources, entries, [taskPath], options);
                else options.onWorkspaceObserved?.(workspaceImageObservations([pinned.file]));
                return { ok: true, asset, runtime, taskPath, draft: true, requiresWriteback: true, unchanged: true };
            }
            if (index < 0) assets.push(asset); else assets[index] = asset;
        }
        task.x = { ...task.x, [ASSET_FIELD]: assets };
        entries.push({ path: taskPath, content: serializeItemDocument('tasks', task) });
        await commit(sources, entries, guards, options);
        return { ok: true, asset, runtime, taskPath, draft: true, requiresWriteback: true, unchanged: false };
    };
}
