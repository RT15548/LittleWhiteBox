import { eventSource, event_types } from '../../../../../../script.js';

let refreshPresetTasks;
let flushPresetTaskWrites;
let invalidatePresetTaskWrites;
// Host imports reuse the selected preset object, but install the imported
// prompt_order by reference (ST 1.14/1.18). Consume it only after successful apply.
const importedOrders = new WeakSet();

async function onPresetImportReady({ data, presetName } = {}) {
    // ST 1.14/1.18 await this event before POSTing the imported preset. Finish
    // earlier task saves first, including their queued writes. A failed import
    // must not discard those edits or stop the current task instances.
    await flushPresetTaskWrites(presetName);
    if (Array.isArray(data?.prompt_order)) importedOrders.add(data.prompt_order);
}

export function consumePresetTaskImport(preset) {
    const order = preset?.prompt_order;
    if (!order || !importedOrders.has(order)) return false;
    importedOrders.delete(order);
    return true;
}

function onHostReady() {
    refreshPresetTasks({ hostReady: true });
}

function onPresetChanged(event) {
    if (event?.apiId && event.apiId !== 'openai') return;
    refreshPresetTasks({ appliedName: event?.name });
}

function onPresetSelected() {
    refreshPresetTasks({ selection: true });
}

function onMainApiChanged() {
    // Leaving chat completion also leaves its preset, even though the event's
    // apiId now names the destination API rather than openai.
    refreshPresetTasks({ apiChanged: true });
}

function onPresetDeleted(event) {
    if (event?.apiId !== 'openai') return;
    invalidatePresetTaskWrites(event.name);
}

export function initPresetTaskEvents(refresh, flushWrites, invalidateWrites) {
    refreshPresetTasks = refresh;
    flushPresetTaskWrites = flushWrites;
    invalidatePresetTaskWrites = invalidateWrites;
    // The selected preset and its stored tasks are already available on change.
    // Do not wait for the host's asynchronous preset-application listeners.
    $(document)
        .off('change.xbTaskPreset', '#settings_preset_openai')
        .on('change.xbTaskPreset', '#settings_preset_openai', onPresetSelected);
    // Preset selection lives for the page, independently of task execution. These
    // listeners must survive both task cleanup and the master EventCenter cleanup.
    for (const type of [
        event_types.OAI_PRESET_CHANGED_AFTER,
        event_types.PRESET_CHANGED,
    ]) {
        eventSource.removeListener(type, onPresetChanged);
        eventSource.on(type, onPresetChanged);
    }
    eventSource.removeListener(event_types.MAIN_API_CHANGED, onMainApiChanged);
    eventSource.on(event_types.MAIN_API_CHANGED, onMainApiChanged);
    if (event_types.OAI_PRESET_IMPORT_READY) {
        eventSource.removeListener(event_types.OAI_PRESET_IMPORT_READY, onPresetImportReady);
        eventSource.on(event_types.OAI_PRESET_IMPORT_READY, onPresetImportReady);
    }
    if (event_types.PRESET_DELETED) {
        eventSource.removeListener(event_types.PRESET_DELETED, onPresetDeleted);
        eventSource.on(event_types.PRESET_DELETED, onPresetDeleted);
    }
    // APP_READY is a sticky host event: late subscribers receive it as well.
    eventSource.removeListener(event_types.APP_READY, onHostReady);
    eventSource.on(event_types.APP_READY, onHostReady);
    refreshPresetTasks();
}
