import { assetRuntime, inspectDraftAssets, taskHasAssets } from './asset-task.js';
import { locateFile } from './files.js';
import { itemDocumentValue, resolveItemTarget } from './item-document.js';

export function readAssetTaskDocument(file) {
    resolveItemTarget(locateFile(file.path), file);
    return itemDocumentValue('tasks', file.content);
}

// Inspect every task document before filtering image tasks: broken frontmatter
// cannot tell us whether a file contains image references.
export function inspectAssetTaskDocuments(files) {
    const tasks = [], errors = [];
    for (const file of files) {
        try {
            const task = readAssetTaskDocument(file);
            if (taskHasAssets(task)) {
                const inspected = inspectDraftAssets(task);
                errors.push(...inspected.errors.map(issue => ({ taskPath: file.path, ...issue })));
                if (inspected.assets.length || !inspected.errors.length) tasks.push({ taskPath: file.path, name: task.name, runtime: assetRuntime(task.id), assets: inspected.assets });
            }
        } catch (error) {
            errors.push({ taskPath: file.path, error: error.message });
        }
    }
    return { tasks, errors };
}
