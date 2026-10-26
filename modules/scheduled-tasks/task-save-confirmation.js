import { getRequestHeaders, saveSettings } from '../../../../../../script.js';
import { EXT_ID } from '../../core/constants.js';
import { throwIfSignalAborted } from '../../shared/common/abort-utils.js';
import { TASK_SAVE_COPY } from './task-save-copy.js';
import { waitTaskSave, markTaskSaveUnconfirmed, markTaskSaveConfirmed, taskSaveUnconfirmed, TASK_SAVE_ERROR } from './task-save-operation.js';

// Host settings writes capture the entire settings object and cannot be aborted.
// Keep ownership until the actual request settles, even if its caller times out.
let settingsWriteTail = Promise.resolve();
function saveTaskSettings(signal) {
    const work = settingsWriteTail.then(() => {
        throwIfSignalAborted(signal);
        return saveSettings();
    });
    settingsWriteTail = work.then(() => {}, () => {});
    return waitTaskSave(() => work, signal);
}

export function requestTaskSave(url, body, signal) {
    return waitTaskSave(async () => {
        const response = await fetch(url, {
            method: 'POST', headers: getRequestHeaders(), body: JSON.stringify(body), cache: 'no-store', signal,
        });
        if (!response.ok) {
            const error = new Error(TASK_SAVE_COPY.requestFailed(response.status));
            error.code = TASK_SAVE_ERROR.HTTP;
            throw error;
        }
        return response;
    }, signal);
}

async function readSaved(url, body, signal) {
    const response = await requestTaskSave(url, body, signal);
    return await waitTaskSave(() => response.json(), signal);
}

// ST 1.14/1.18 saveSettings and writeExtensionField can swallow HTTP failures.
// Confirm only explicit editor saves, using the fields owned by this module.
export async function confirmTaskSettingsSave(fields, signal) {
    const expected = JSON.stringify(fields);
    await saveTaskSettings(signal);
    const response = await readSaved('/api/settings/get', {}, signal);
    const saved = JSON.parse(response.settings).extension_settings?.[EXT_ID]?.tasks;
    const actual = Object.fromEntries(Object.keys(fields).map(key => [key, saved?.[key]]));
    if (JSON.stringify(actual) !== expected) throw new Error(TASK_SAVE_COPY.settingsUnconfirmed);
}

export async function confirmCharacterTaskPermissionSave(avatar, signal) {
    await saveTaskSettings(signal);
    const response = await readSaved('/api/settings/get', {}, signal);
    const allowed = JSON.parse(response.settings).extension_settings?.[EXT_ID]?.tasks?.character_allowed_tasks;
    // Other characters may be allowed concurrently. Confirm only this addition.
    if (!Array.isArray(allowed) || !allowed.includes(avatar)) {
        throw new Error(TASK_SAVE_COPY.characterPermissionUnconfirmed);
    }
}

export async function saveCharacterTasksConfirmed(avatar, field, tasks, signal) {
    let writeAccepted = false;
    markTaskSaveUnconfirmed(signal, TASK_SAVE_COPY.characterUnconfirmed);
    try {
        // Match the host's field-only endpoint; don't publish local edits yet.
        await requestTaskSave('/api/characters/merge-attributes', {
            avatar, data: { extensions: { [field]: { tasks } } },
        }, signal);
        writeAccepted = true;
        const saved = await readSaved('/api/characters/get', { avatar_url: avatar }, signal);
        if (JSON.stringify(saved.data?.extensions?.[field]?.tasks) !== JSON.stringify(tasks)) {
            throw new Error(TASK_SAVE_COPY.characterUnconfirmed);
        }
        markTaskSaveConfirmed(signal);
    } catch (cause) {
        // A readback failure is uncertain even if it carries an HTTP error.
        if (!writeAccepted && cause?.code === TASK_SAVE_ERROR.HTTP) {
            markTaskSaveUnconfirmed(signal, null);
            throw cause;
        }
        throw taskSaveUnconfirmed(TASK_SAVE_COPY.characterUnconfirmed, cause);
    }
}
