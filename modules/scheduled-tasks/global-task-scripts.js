import { TasksStorage } from '../../core/server-storage.js';
import { uuidv4 } from '../../../../../utils.js';
import { saveWithRecovery, taskSaveDeadline, TASK_SAVE_ERROR } from './task-save-operation.js';
import { observeBackgroundTask } from '../../shared/common/async-errors.js';

// Only uncompleted edits live here, including edits whose editor was closed.
// Retrying identical text reuses its candidate. Changed text needs another key:
// an uncertain earlier candidate may already be referenced by the server.
const revisions = new Map();
const retained = new Map();
const protectedScripts = new Set();
export const taskScriptId = task => task?.scriptId || task?.id;

export async function prepareGlobalTaskScripts(tasks, signal) {
    const metadata = tasks.filter(Boolean).map(task => {
        const meta = { ...task };
        if (Object.hasOwn(task, 'commands')) {
            const commands = String(task.commands ?? '');
            let versions = revisions.get(task.id);
            if (!versions) revisions.set(task.id, versions = new Map());
            if (!versions.has(commands)) versions.set(commands, uuidv4());
            meta.scriptId = versions.get(commands);
            retained.set(meta.scriptId, commands);
        }
        delete meta.commands;
        return meta;
    });
    if (retained.size) {
        const scripts = new Map(retained);
        await saveWithRecovery(
            () => TasksStorage.updateAndSave(draft => {
                for (const [id, commands] of scripts) draft[id] = commands;
            }, { silent: false, signal }),
            async () => {
                // A failed upload must not leave a stale cache that can erase a
                // candidate possibly written on the server by this attempt.
                TasksStorage.clearCache();
                return await taskSaveDeadline(async () => {
                    for (const [id, commands] of scripts) {
                        if (await TasksStorage.getStrict(id, null) !== commands) return false;
                    }
                    return true;
                }, signal);
            },
        );
    }
    return metadata;
}

export function retainUncertainGlobalScripts(previous, candidate, error) {
    if (error?.code === TASK_SAVE_ERROR.HTTP) return;
    for (const task of [...previous, ...candidate]) protectedScripts.add(taskScriptId(task));
}

export function finishGlobalTaskScripts(previous, committed, getCommitted) {
    const active = new Set(committed.map(taskScriptId));
    const obsolete = new Set(previous.map(taskScriptId).filter(id => id && !active.has(id)));
    for (const task of committed) {
        const versions = revisions.get(task.id);
        if (!versions) continue;
        for (const id of versions.values()) {
            if (!active.has(id)) obsolete.add(id);
            if (!protectedScripts.has(id)) retained.delete(id);
        }
        revisions.delete(task.id);
    }
    for (const id of protectedScripts) obsolete.delete(id);
    if (!obsolete.size) return;
    observeBackgroundTask(taskSaveDeadline(signal => TasksStorage.updateAndSave(draft => {
        const current = new Set(getCommitted().map(taskScriptId));
        for (const id of obsolete) {
            if (!current.has(id) && !protectedScripts.has(id) && !retained.has(id)) delete draft[id];
        }
    }, { silent: false, signal })), { source: import.meta.url, operation: 'cleanUnreferencedTaskScripts' });
}
