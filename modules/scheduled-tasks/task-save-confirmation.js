import { getRequestHeaders, saveSettings } from '../../../../../../script.js';
import { EXT_ID } from '../../core/constants.js';
import { TASK_SAVE_COPY } from './task-save-copy.js';
import { waitTaskSave } from './task-save-operation.js';

export function requestTaskSave(url, body, signal) {
    return waitTaskSave(async () => {
        const response = await fetch(url, {
            method: 'POST', headers: getRequestHeaders(), body: JSON.stringify(body), cache: 'no-store', signal,
        });
        if (!response.ok) throw new Error(TASK_SAVE_COPY.requestFailed(response.status));
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
    await waitTaskSave(() => saveSettings(), signal);
    const response = await readSaved('/api/settings/get', {}, signal);
    const saved = JSON.parse(response.settings).extension_settings?.[EXT_ID]?.tasks;
    const actual = Object.fromEntries(Object.keys(fields).map(key => [key, saved?.[key]]));
    if (JSON.stringify(actual) !== expected) throw new Error(TASK_SAVE_COPY.settingsUnconfirmed);
}

export async function saveCharacterTasksConfirmed(avatar, field, tasks, signal) {
    // Same field-only endpoint as ST 1.14/1.18 writeExtensionField, but do not
    // publish unconfirmed edits into character.data/json_data before the request.
    await requestTaskSave('/api/characters/merge-attributes', {
        avatar, data: { extensions: { [field]: { tasks } } },
    }, signal);
    const saved = await readSaved('/api/characters/get', { avatar_url: avatar }, signal);
    if (JSON.stringify(saved.data?.extensions?.[field]?.tasks) !== JSON.stringify(tasks)) {
        throw new Error(TASK_SAVE_COPY.characterUnconfirmed);
    }
}
