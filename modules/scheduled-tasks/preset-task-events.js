import { eventSource, event_types } from '../../../../../../script.js';

let refreshPresetTasks;

function onPresetChanged(event) {
    if (event?.apiId && event.apiId !== 'openai') return;
    refreshPresetTasks();
}

function onMainApiChanged() {
    // Leaving chat completion also leaves its preset, even though the event's
    // apiId now names the destination API rather than openai.
    refreshPresetTasks();
}

export function initPresetTaskEvents(refresh) {
    refreshPresetTasks = refresh;
    // The selected preset and its stored tasks are already available on change.
    // Do not wait for the host's asynchronous preset-application listeners.
    $(document)
        .off('change.xbTaskPreset', '#settings_preset_openai')
        .on('change.xbTaskPreset', '#settings_preset_openai', onPresetChanged);
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
    refreshPresetTasks();
}
