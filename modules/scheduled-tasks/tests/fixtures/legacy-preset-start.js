// Compatibility fixture for the released client, not a second implementation.
// Source: RT15548/LittleWhiteBox commit 1aaf3fbf, modules/scheduled-tasks/scheduled-tasks.js.
// Keep these semantics frozen: PresetTasksStore.read, importGlobalTasks' projection,
// shouldSkipByContext/matchInterval/checkAndExecuteTasks' task filter, and the
// editor's base-copy/timing selection. Host I/O and execution are intentionally absent.

const VALID_FLOOR = ['all', 'user', 'llm'];
const VALID_TIMING = ['after_ai', 'before_user', 'any_message', 'initialization', 'character_init', 'plugin_init', 'only_this_floor', 'chat_changed'];
const clampInt = (v, min, max, d = 0) => (Number.isFinite(+v) ? Math.max(min, Math.min(max, +v)) : d);
const deepClone = o => JSON.parse(JSON.stringify(o || {}));

export function readLegacyPresetTasks(preset) {
    const clone = structuredClone(preset);
    const entry = clone.prompt_order?.find(item => Number(item?.character_id) === 100000);
    if (!entry || !entry.xiaobai_ext || typeof entry.xiaobai_ext !== 'object' || Array.isArray(entry.xiaobai_ext)) return [];
    const tasks = entry.xiaobai_ext.scheduledTasks;
    return Array.isArray(tasks) ? deepClone(tasks) : [];
}

export function importLegacyTaskFile(raw) {
    let incomingTasks = [];
    let fileType = 'global';
    if (Array.isArray(raw)) {
        incomingTasks = raw;
    } else if (raw && Array.isArray(raw.tasks)) {
        incomingTasks = raw.tasks;
        if (raw.type === 'character' || raw.type === 'global' || raw.type === 'preset') fileType = raw.type;
    } else if (raw && typeof raw === 'object' && raw.name && (raw.commands || raw.interval !== undefined)) {
        incomingTasks = [raw];
        if (raw.type === 'character' || raw.type === 'global' || raw.type === 'preset') fileType = raw.type;
    } else throw new Error('无效的任务文件格式');

    const tasks = incomingTasks
        .filter(t => (t?.name || '').trim() && (String(t?.commands || '').trim() || t.interval === 0))
        .map(src => ({
            id: 'legacy-import-generated-id',
            name: String(src.name || '').trim(),
            commands: String(src.commands || '').trim(),
            interval: clampInt(src.interval, 0, 99999, 0),
            floorType: VALID_FLOOR.includes(src.floorType) ? src.floorType : 'all',
            triggerTiming: VALID_TIMING.includes(src.triggerTiming) ? src.triggerTiming : 'after_ai',
            disabled: !!src.disabled,
            buttonActivated: !!src.buttonActivated,
            createdAt: src.createdAt || 'legacy-import-time',
            importedAt: 'legacy-import-time',
            x: (src.x && typeof src.x === 'object') ? deepClone(src.x) : {},
        }));
    if (!tasks.length) throw new Error('没有可导入的任务');
    return { type: fileType, tasks };
}

function shouldSkipByContext(taskTriggerTiming, triggerContext) {
    if (taskTriggerTiming === 'character_init') return triggerContext !== 'chat_created';
    if (taskTriggerTiming === 'plugin_init') return triggerContext !== 'plugin_initialized';
    if (taskTriggerTiming === 'chat_changed') return triggerContext !== 'chat_changed';
    if (taskTriggerTiming === 'only_this_floor' || taskTriggerTiming === 'any_message') {
        return triggerContext !== 'before_user' && triggerContext !== 'after_ai';
    }
    return taskTriggerTiming !== triggerContext;
}

// Model an active, enabled host with no execution/cooldown lock. Those independent
// gates can suppress a trigger, but cannot turn another event into chat_changed.
export function wouldLegacyTaskRun(task, triggerContext, currentFloor = 6) {
    if (task.disabled) return false;
    const tt = task.triggerTiming || 'after_ai';
    if (tt === 'chat_changed') {
        if (shouldSkipByContext(tt, triggerContext)) return false;
        return true;
    }
    if (tt === 'character_init') return triggerContext === 'chat_created';
    if (tt === 'plugin_init') return triggerContext === 'plugin_initialized';
    if (task.interval <= 0) return false;
    if (shouldSkipByContext(tt, triggerContext)) return false;
    if (currentFloor <= 0) return false;
    if (task.triggerTiming === 'only_this_floor') return currentFloor === task.interval;
    return currentFloor % task.interval === 0;
}

// The released select has no preset_enter option. jQuery val(unknown) selects
// nothing, and the save handler then evaluates .val() || 'after_ai'. Other task
// properties (including x) come from its structuredClone(task)/...base copy.
export function saveInLegacyEditor(task, selectedTiming = task.triggerTiming, changes = {}) {
    const options = VALID_TIMING.filter(timing => timing !== 'character_init');
    const uiTiming = selectedTiming === 'character_init' ? 'initialization' : selectedTiming;
    const selectedTriggerTiming = options.includes(uiTiming) ? uiTiming : 'after_ai';
    return {
        ...structuredClone(task), ...changes,
        triggerTiming: task.triggerTiming === 'character_init' && selectedTriggerTiming === 'initialization'
            ? 'character_init' : selectedTriggerTiming,
    };
}

export function exportLegacyTask(task, type = 'preset') {
    return JSON.parse(JSON.stringify({ type, exportDate: 'legacy-export-time', tasks: [task] }));
}
