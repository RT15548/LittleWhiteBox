import { getRequestHeaders, saveSettings } from '../../../../../../script.js';
import { EXT_ID } from '../../core/constants.js';
import { observeHostSettingsSave } from './host-settings-save.js';
import { taskSaveDeadline, taskSaveRejected, saveWithRecovery } from './task-save-operation.js';
import { readPresetTaskField } from './task-storage-fields.js';

export function requestTaskSave(url, body, signal, read = response => response) {
    return taskSaveDeadline(async requestSignal => {
        const response = await fetch(url, {
            method: 'POST', headers: getRequestHeaders(), body: JSON.stringify(body), cache: 'no-store', signal: requestSignal,
        });
        if (!response.ok) throw taskSaveRejected(url + ': HTTP ' + response.status);
        return await read(response);
    }, signal);
}

const readSaved = (url, body, signal) => requestTaskSave(url, body, signal, response => response.json());

export async function confirmTaskSettingsSave(fields, signal) {
    const expected = JSON.stringify(fields);
    const matchesTasks = tasks => JSON.stringify(Object.fromEntries(Object.keys(fields).map(key => [key, tasks?.[key]]))) === expected;
    await saveWithRecovery(
        () => observeHostSettingsSave(saveSettings, payload => matchesTasks(payload?.extension_settings?.[EXT_ID]?.tasks), signal),
        async () => {
            const saved = await readSaved('/api/settings/get', {}, signal);
            return matchesTasks(JSON.parse(saved.settings).extension_settings?.[EXT_ID]?.tasks);
        },
    );
}

export async function saveCharacterTasksConfirmed(avatar, field, tasks, signal) {
    await saveWithRecovery(
        () => requestTaskSave('/api/characters/merge-attributes', {
            avatar, data: { extensions: { [field]: { tasks } } },
        }, signal),
        async () => {
            const saved = await readSaved('/api/characters/get', { avatar_url: avatar }, signal);
            return JSON.stringify(saved.data?.extensions?.[field]?.tasks) === JSON.stringify(tasks);
        },
    );
}

export async function savePresetTaskContent(name, preset, tasks, signal) {
    await saveWithRecovery(
        () => requestTaskSave('/api/presets/save', { name, preset, apiId: 'openai' }, signal, async response => {
            const result = await response.json();
            if (result?.name !== name) throw taskSaveRejected('Preset response did not acknowledge the save');
        }),
        async () => {
            const saved = await readSaved('/api/settings/get', {}, signal);
            const index = saved.openai_setting_names?.indexOf(name);
            if (index == null || index < 0) return false;
            return JSON.stringify(readPresetTaskField(JSON.parse(saved.openai_settings[index]))) === JSON.stringify(tasks);
        },
    );
}
