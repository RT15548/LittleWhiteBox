import { locateFile } from './files.js';
import { ITEM_KINDS, itemDocumentPath, splitItemDocument } from './item-document.js';
import { displayCardWorkspaceName } from './paths.js';
import { inspectAssetTaskDocuments } from './asset-documents.js';
import { assetWorkspacePath } from './asset-task.js';
import { COPY } from './copy.js';

function locateDisplayFile(path) {
    try {
        return locateFile(path);
    } catch (error) {
        // Manually authored workspace filenames need not follow the card format.
        if (!(error instanceof URIError)) throw error;
        return null;
    }
}

function readDisplayName(file) {
    // While JSON is being edited it can be incomplete; keep the last saved name.
    for (const content of [file?.content, file?.originalContent]) {
        if (!content) continue;
        try {
            const value = JSON.parse(splitItemDocument(content).header)?.name;
            return typeof value === 'string' ? value.trim() : '';
        } catch (error) {
            if (!(error instanceof SyntaxError)) throw error;
        }
    }
    return '';
}

// Labels are derived from the same editable files as writeback, never persisted
// as aliases. Identically named entries still have distinct IDs and paths.
export function describeCardWorkspaceFiles(files, { onAssetIssue } = {}) {
    const descriptions = new Map();
    const labels = new Set();
    // Give the unsuffixed path first choice; the same labels serve tree and editor.
    for (const file of [...files].sort((a, b) => a.path.length - b.path.length || a.path.localeCompare(b.path))) {
        const target = locateDisplayFile(file.path);
        if (!target) continue;
        const name = (ITEM_KINDS[target.kind] ? readDisplayName(file) : '') || displayCardWorkspaceName(file.path, file.name);
        const labelPath = itemDocumentPath(file.path.slice(0, file.path.lastIndexOf('/') + 1), name, labels);
        labels.add(labelPath);
        const label = decodeURIComponent(labelPath.split('/').at(-1).slice(0, -3));
        descriptions.set(file.path, {
            name, label, title: label, kind: target.kind,
            ...(target.book ? { book: target.book } : {}),
        });
    }
    const taskFiles = files.filter(file => descriptions.get(file.path)?.kind === 'tasks');
    const { tasks, errors } = inspectAssetTaskDocuments(taskFiles);
    if (onAssetIssue) errors.forEach(onAssetIssue);
    const references = new Map();
    for (const task of tasks) {
        const target = locateDisplayFile(task.taskPath);
        for (const asset of task.assets) {
            const path = assetWorkspacePath(target.root, asset);
            if (!references.has(path)) references.set(path, []);
            references.get(path).push({ key: asset.key, taskPath: task.taskPath, taskId: task.runtime.taskId, taskName: task.name });
        }
    }
    for (const file of files.filter(file => file.kind === 'image')) {
        const assetReferences = references.get(file.path);
        if (!assetReferences?.length) continue;
        const label = assetReferences.map(reference => COPY.assetImageLabel(reference.key, descriptions.get(reference.taskPath).label)).join('、');
        descriptions.set(file.path, { name: label, label, title: label, kind: 'image', assetReferences });
    }
    return descriptions;
}

export function cardFileDirectory(files, options) {
    const descriptions = describeCardWorkspaceFiles(files, options);
    return files.map(file => {
        const description = descriptions.get(file.path);
        return { path: file.path, name: description?.name || file.path.split('/').at(-1), kind: description?.kind || (file.kind === 'image' ? 'image' : 'file'),
            ...(description?.book ? { book: description.book } : {}) };
    });
}
